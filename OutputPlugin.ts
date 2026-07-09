import archiver from 'archiver';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline';
import { spawn } from 'node:child_process';
import type { OutputAsset, OutputChunk, Plugin } from 'vite';

const spinnerChars = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
let spinnerIndex = 0;
let spinnerInterval: NodeJS.Timeout | null = null;

type BundleItem = OutputAsset | OutputChunk;

interface OutputPluginOptions {
  outputZipPath?: string;
  rootDir?: string;
}

function startLoading(text: string) {
  spinnerIndex = 0;
  process.stdout.write('\x1B[?25l');
  spinnerInterval = setInterval(() => {
    process.stdout.write(`\r${spinnerChars[spinnerIndex]} ${text}`);
    spinnerIndex = (spinnerIndex + 1) % spinnerChars.length;
  }, 80);
}

function stopLoading(text?: string) {
  if (spinnerInterval) {
    clearInterval(spinnerInterval);
    spinnerInterval = null;
  }
  process.stdout.write('\r' + ' '.repeat(20) + '\r');
  process.stdout.write('\x1B[?25h');
  if (text) {
    console.log(text);
  }
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

export default function OutputPlugin({
  outputZipPath = 'dist/output.zip',
  rootDir = ''
}: OutputPluginOptions = {}): Plugin | undefined {
  if(process.env.NODE_ENV !== "production") return;

  const files = new Map<string, string | Uint8Array>();
  const zipRoot = rootDir ? rootDir.replace(/\\/g, '/').replace(/\/+$/, '') : '';

  return {
    name: 'output-plugin',
    generateBundle(_, bundle) {
      for (const item of Object.values(bundle) as BundleItem[]) {
        files.set(item.fileName, item.type === 'chunk' ? item.code : item.source);
      }
    },
    async closeBundle() {
      startLoading('正在生成压缩包...');
      fs.mkdirSync(path.dirname(outputZipPath), { recursive: true });

      await new Promise<void>((resolve, reject) => {
        const output = fs.createWriteStream(outputZipPath);
        const archive = archiver('zip', {
          zlib: { level: 9 }
        });

        output.on('close', resolve);
        output.on('error', reject);
        archive.on('error', reject);

        archive.on('progress', (progress) => {
          const total = progress.entries.total || 1;
          const percent = Math.round((progress.entries.processed / total) * 100);
          process.stdout.write(`\r${spinnerChars[spinnerIndex]} 正在生成压缩包... ${percent}%`);
        });

        archive.pipe(output);

        for (const [fileName, source] of files) {
          const zipFileName = zipRoot ? `${zipRoot}/${fileName}` : fileName;
          archive.append(source, { name: zipFileName });
        }

        archive.finalize();
      });

      stopLoading(`✓ 压缩包创建完成: ${path.resolve(outputZipPath)}`);
      await askOpenZip(outputZipPath);
    }
  };
}
