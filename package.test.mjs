import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const rootDir = process.cwd();
const forbidden = ['mo', 'ment'].join('');

async function collectFiles(dir, files = []) {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (['.git', 'dist', 'node_modules'].includes(entry.name)) continue;
      await collectFiles(fullPath, files);
      continue;
    }

    if (!entry.isFile()) continue;

    const relativePath = path.relative(rootDir, fullPath).replaceAll(path.sep, '/');
    if (
      relativePath === 'package.json' ||
      relativePath === 'pnpm-lock.yaml' ||
      /^src\/.*\.(js|ts|vue)$/.test(relativePath)
    ) {
      files.push({ fullPath, relativePath });
    }
  }

  return files;
}

test('date dependency is migrated to dayjs', async () => {
  const pkg = JSON.parse(await readFile(path.join(rootDir, 'package.json'), 'utf8'));

  assert.ok(pkg.dependencies?.dayjs, 'package.json should depend on dayjs');
  assert.equal(pkg.dependencies?.[forbidden], undefined, 'package.json should not depend on the old date library');
});

test('source and lockfile do not reference the old date library', async () => {
  const files = await collectFiles(rootDir);
  const matches = [];

  for (const { fullPath, relativePath } of files) {
    const text = await readFile(fullPath, 'utf8');
    if (text.toLowerCase().includes(forbidden)) {
      matches.push(relativePath);
    }
  }

  assert.deepEqual(matches, []);
});

test('vite auto-imports Vue composition APIs', async () => {
  const config = await readFile(path.join(rootDir, 'vite.config.js'), 'utf8');
  const autoImportCall = config.match(/AutoImport\(\{[\s\S]*?\n\s*\}\),/);

  assert.ok(autoImportCall, 'vite.config.js should configure AutoImport');
  assert.match(autoImportCall[0], /imports:\s*\[[\s\S]*['"]vue['"]/);
  assert.match(autoImportCall[0], /dts:\s*true/);
});

test('vite auto-imports dayjs globally', async () => {
  const config = await readFile(path.join(rootDir, 'vite.config.js'), 'utf8');
  const autoImportCall = config.match(/AutoImport\(\{[\s\S]*?\n\s*\}\),/);

  assert.ok(autoImportCall, 'vite.config.js should configure AutoImport');
  assert.match(autoImportCall[0], /dayjs:\s*\[\s*\[\s*['"]default['"]\s*,\s*['"]dayjs['"]\s*\]\s*\]/);
});

test('source does not manually import auto-imported globals', async () => {
  const files = await collectFiles(rootDir);
  const matches = [];
  const manualAutoImportPatterns = [
    /^import\s+\{[^}]+\}\s+from\s+['"]vue['"];?/m,
    /^import\s+dayjs\s+from\s+['"]dayjs['"];?/m,
  ];

  for (const { fullPath, relativePath } of files) {
    const text = await readFile(fullPath, 'utf8');
    if (manualAutoImportPatterns.some((pattern) => pattern.test(text))) {
      matches.push(relativePath);
    }
  }

  assert.deepEqual(matches, []);
});

test('jsconfig includes generated auto-import declarations', async () => {
  const jsconfig = JSON.parse(await readFile(path.join(rootDir, 'jsconfig.json'), 'utf8'));

  assert.ok(
    jsconfig.include?.includes('auto-imports.d.ts'),
    'jsconfig.json should include auto-imports.d.ts for editor type awareness',
  );
});
