import archiver from 'archiver';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline';
import { execFileSync, spawn } from 'node:child_process';
import type { Plugin } from 'vite';

const spinnerChars = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
let spinnerIndex = 0;
let spinnerInterval: NodeJS.Timeout | null = null;
let loadingText = '';
let loadingLineLength = 0;
let loadingStartedAt = 0;

interface OutputPluginOptions {
  outputZipPath?: string;
  rootDir?: string;
}

function writeLoadingLine(text: string) {
  const elapsed = loadingStartedAt ? Math.floor((Date.now() - loadingStartedAt) / 1000) : 0;
  const line = `${spinnerChars[spinnerIndex]} ${text}${elapsed ? ` 已用 ${elapsed}s` : ''}`;
  const padding = Math.max(0, loadingLineLength - line.length);
  process.stdout.write(`\r${line}${' '.repeat(padding)}`);
  loadingLineLength = line.length;
}

function startLoading(text: string) {
  loadingText = text;
  loadingStartedAt = Date.now();
  spinnerIndex = 0;
  process.stdout.write('\x1B[?25l');
  writeLoadingLine(loadingText);
  if (spinnerInterval) return;
  spinnerInterval = setInterval(() => {
    spinnerIndex = (spinnerIndex + 1) % spinnerChars.length;
    writeLoadingLine(loadingText);
  }, 80);
}

function updateLoading(text: string) {
  loadingText = text;
  loadingStartedAt = Date.now();
  if (!spinnerInterval) {
    startLoading(text);
    return;
  }
  writeLoadingLine(loadingText);
}

function stopLoading(text?: string) {
  if (spinnerInterval) {
    clearInterval(spinnerInterval);
    spinnerInterval = null;
  }
  process.stdout.write('\r' + ' '.repeat(loadingLineLength) + '\r');
  process.stdout.write('\x1B[?25h');
  loadingLineLength = 0;
  if (text) {
    console.log(text);
  }
}

function hideDirectory(dir: string) {
  if (process.platform !== 'win32') return;

  try {
    execFileSync('attrib', ['+h', dir], { stdio: 'ignore' });
  } catch {}
}

function removeDirectory(dir: string) {
  if (process.platform === 'win32' && fs.existsSync(dir)) {
    try {
      execFileSync('attrib', ['-h', dir], { stdio: 'ignore' });
    } catch {}
  }
  fs.rmSync(dir, { recursive: true, force: true });
}

function selectZipWithExplorer(absPath: string) {
  spawn('explorer.exe', [`/select,${absPath}`], {
    detached: true,
    stdio: 'ignore'
  }).unref();
}

function openZipInExplorer(absPath: string) {
  return new Promise<void>((resolve) => {
    const folderPath = path.dirname(absPath);
    const fileName = path.basename(absPath);
    const scriptPath = path.join(os.tmpdir(), 'select-build-zip.ps1');
    const script = `
param(
  [string]$targetFile,
  [string]$targetFolder,
  [string]$targetName
)

$shell = New-Object -ComObject Shell.Application
$matched = $false

foreach ($window in $shell.Windows()) {
  try {
    $windowPath = [System.Uri]::UnescapeDataString($window.LocationURL).Replace('file:///', '').Replace('/', '\\')
    if ($windowPath.TrimEnd('\\') -ieq $targetFolder.TrimEnd('\\')) {
      $folder = $shell.NameSpace($targetFolder)
      $item = $folder.ParseName($targetName)
      if ($null -ne $item) {
        $window.Document.SelectItem($item, 29)
        $window.Visible = $true
        $matched = $true
        break
      }
    }
  } catch {}
}

if (-not $matched) {
  explorer.exe /select,$targetFile
}
`;

    fs.writeFileSync(scriptPath, script, 'utf-8');

    const child = spawn('powershell.exe', [
      '-NoProfile',
      '-ExecutionPolicy',
      'Bypass',
      '-File',
      scriptPath,
      absPath,
      folderPath,
      fileName
    ], {
      stdio: 'ignore'
    });

    child.on('error', () => {
      selectZipWithExplorer(absPath);
      resolve();
    });
    child.on('exit', (code) => {
      if (code !== 0) {
        selectZipWithExplorer(absPath);
      }
      resolve();
    });
  });
}

function askOpenZip(outputZipPath: string) {
  return new Promise<void>((resolve) => {
    const absPath = path.resolve(outputZipPath);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('是否打开文件夹查看压缩包? (Y/N): ', (answer) => {
      if (answer.toUpperCase() !== 'N' && process.platform === 'win32') {
        openZipInExplorer(absPath).finally(() => {
          rl.close();
          resolve();
        });
        return;
      }
      rl.close();
      resolve();
    });
  });
}

function zipDirectory(sourceDir: string, zipRoot: string, outputZipPath: string) {
  return new Promise<void>((resolve, reject) => {
    const output = fs.createWriteStream(outputZipPath);
    const archive = archiver('zip', {
      zlib: { level: 6 }
    });

    output.on('close', resolve);
    output.on('error', reject);
    archive.on('error', reject);

    archive.on('progress', (progress) => {
      const total = progress.entries.total || 1;
      const percent = Math.round((progress.entries.processed / total) * 100);
      updateLoading(`正在生成压缩包... ${percent}%`);
    });

    archive.pipe(output);
    archive.directory(sourceDir, zipRoot);
    archive.finalize();
  });
}

export default function OutputPlugin({
  outputZipPath = 'dist/output.zip',
  rootDir = ''
}: OutputPluginOptions = {}): Plugin | undefined {
  if(process.env.NODE_ENV !== "production") return;

  let outDir = '';
  let tempRootDir = '';
  let transformCount = 0;
  const zipRoot = rootDir ? rootDir.replace(/\\/g, '/').replace(/\/+$/, '') : '';

  return {
    name: 'output-plugin',
    configResolved(config) {
      outDir = config.build.outDir;
      tempRootDir = path.dirname(outDir);
    },
    buildStart() {
      transformCount = 0;
      removeDirectory(tempRootDir);
      fs.mkdirSync(tempRootDir, { recursive: true });
      hideDirectory(tempRootDir);
      startLoading('正在构建项目...');
    },
    transform() {
      transformCount += 1;
      if (transformCount % 20 === 0) {
        updateLoading(`正在构建项目... 已处理 ${transformCount} 个模块`);
      }
      return null;
    },
    buildEnd(error) {
      if (error) {
        stopLoading('✗ 构建失败');
      }
    },
    renderStart() {
      updateLoading('正在生成构建产物...');
    },
    async closeBundle() {
      if (!fs.existsSync(outDir)) return;

      updateLoading('正在生成压缩包...');
      fs.mkdirSync(path.dirname(outputZipPath), { recursive: true });

      try {
        await zipDirectory(outDir, zipRoot, outputZipPath);
      } finally {
        removeDirectory(tempRootDir);
      }

      stopLoading(`✓ 压缩包创建完成: ${path.resolve(outputZipPath)}`);
      await askOpenZip(outputZipPath);
    }
  };
}
