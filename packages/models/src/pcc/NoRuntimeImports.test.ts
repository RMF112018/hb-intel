import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PCC_DIR = fileURLToPath(new URL('.', import.meta.url));

const FORBIDDEN_IMPORT_PATTERNS: readonly RegExp[] = [
  /['"]@microsoft\/sp-/,
  /['"]@pnp\//,
  /['"]@azure\//,
  /['"]axios['"]/,
  /['"]node-fetch['"]/,
  /['"]procore/i,
  /['"]\.\.\/\.\.\/\.\.\/backend\//,
  /['"]@hbc\/project-site-provisioning/,
  /['"]@hbc\/project-site-template/,
];

function listSourceFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stats = statSync(full);
    if (stats.isDirectory()) {
      listSourceFiles(full, acc);
    } else if (entry.endsWith('.ts') && !entry.endsWith('.test.ts')) {
      acc.push(full);
    }
  }
  return acc;
}

describe('PCC shared models stay free of runtime imports', () => {
  it('no source file imports SPFx, PnP, Azure SDK, HTTP clients, Procore, backend, or sibling boundary packages', () => {
    const offenders: Array<{ file: string; line: string }> = [];
    for (const file of listSourceFiles(PCC_DIR)) {
      const contents = readFileSync(file, 'utf8');
      for (const line of contents.split('\n')) {
        if (!line.trimStart().startsWith('import') && !line.includes('from ')) continue;
        for (const pattern of FORBIDDEN_IMPORT_PATTERNS) {
          if (pattern.test(line)) {
            offenders.push({ file, line: line.trim() });
          }
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
