#!/usr/bin/env node
/**
 * @design SF18-T09
 * Deterministic package-boundary verification for @hbc/features-estimating.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const SRC_DIR = join(ROOT, 'src');

/**
 * @design SF18-T09
 * Recursively enumerates TypeScript source files in deterministic lexical order.
 * @param {string} dir
 * @returns {string[]}
 */
function listTypeScriptFiles(dir) {
  const entries = readdirSync(dir).sort((a, b) => a.localeCompare(b));
  /** @type {string[]} */
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      files.push(...listTypeScriptFiles(full));
      continue;
    }
    if (entry.endsWith('.ts') || entry.endsWith('.tsx')) {
      files.push(full);
    }
  }
  return files;
}

const forbiddenPatterns = [
  { pattern: /from\s+['"][^'"]*apps\//g, message: 'Direct app-route imports are forbidden in package runtime.' },
  { pattern: /from\s+['"]@hbc\/[^'"]+\/src[^'"]*['"]/g, message: 'Importing package internals (`/src`) is forbidden; use public exports only.' },
  { pattern: /from\s+['"]\.\.\/\.\.\/\.\.\/apps\//g, message: 'Relative imports into apps/ are forbidden.' },
];

const requiredSignals = [
  {
    file: join(SRC_DIR, 'bid-readiness', 'profiles', 'readinessScoring.ts'),
    mustInclude: '@hbc/health-indicator',
    message: 'Adapter scoring wrapper must reference canonical primitive runtime ownership.',
  },
  {
    file: join(SRC_DIR, 'bid-readiness', 'profiles', 'readinessConfigResolver.ts'),
    mustInclude: '@hbc/health-indicator',
    message: 'Config resolver must remain primitive-aligned.',
  },
];

/** @type {string[]} */
const errors = [];
for (const file of listTypeScriptFiles(SRC_DIR)) {
  const text = readFileSync(file, 'utf8');
  for (const rule of forbiddenPatterns) {
    if (rule.pattern.test(text)) {
      errors.push(`${file}: ${rule.message}`);
    }
  }
}

for (const signal of requiredSignals) {
  const text = readFileSync(signal.file, 'utf8');
  if (!text.includes(signal.mustInclude)) {
    errors.push(`${signal.file}: ${signal.message}`);
  }
}

if (errors.length > 0) {
  console.error('SF18-T09 boundary verification failed:');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log('SF18-T09 boundary verification passed.');
