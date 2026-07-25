import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function flattenKeys(input, prefix = '') {
  return Object.entries(input).flatMap(([key, value]) => {
    const next = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value))
      return flattenKeys(value, next);
    return [next];
  });
}

async function collectSourceFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const resolved = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return collectSourceFiles(resolved);
    }
    if (/\.(ts|tsx)$/.test(entry.name)) {
      return [resolved];
    }
    return [];
  }));
  return nested.flat();
}

function extractTranslationKeys(source) {
  const keys = new Set();
  const patterns = [
    /\bt\(\s*['"`]([^'"`]+)['"`]/g,
    /\bi18n\.t\(\s*['"`]([^'"`]+)['"`]/g,
  ];

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      keys.add(match[1]);
    }
  }

  return keys;
}

const [enRaw, zhRaw] = await Promise.all([
  fs.readFile(new URL('../src/i18n/locales/en.json', import.meta.url), 'utf8'),
  fs.readFile(new URL('../src/i18n/locales/zh.json', import.meta.url), 'utf8'),
]);

const enKeys = new Set(flattenKeys(JSON.parse(enRaw)));
const zhKeys = new Set(flattenKeys(JSON.parse(zhRaw)));

const missingInZh = [...enKeys].filter(key => !zhKeys.has(key));
const extraInZh = [...zhKeys].filter(key => !enKeys.has(key));
const sourceFiles = await collectSourceFiles(fileURLToPath(new URL('../src', import.meta.url)));
const usedKeys = new Set();

for (const file of sourceFiles) {
  const source = await fs.readFile(file, 'utf8');
  for (const key of extractTranslationKeys(source)) {
    usedKeys.add(key);
  }
}

const missingInEn = [...usedKeys].filter(key => !enKeys.has(key));

if (missingInZh.length || extraInZh.length || missingInEn.length) {
  console.error('Locale mismatch detected');
  console.error('Missing in zh:', missingInZh);
  console.error('Extra in zh:', extraInZh);
  console.error('Missing in en:', missingInEn);
  process.exit(1);
}

console.log(`Locale parity OK: ${enKeys.size} locale keys, ${usedKeys.size} extracted usage keys checked`);
