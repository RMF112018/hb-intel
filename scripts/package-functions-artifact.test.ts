import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { assertHealthRouteReleaseProof } from './package-functions-artifact';

function seedFile(root: string, relPath: string, content: string): void {
  const fullPath = path.join(root, relPath);
  mkdirSync(path.dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, content, 'utf8');
}

describe('package-functions-artifact health route proof', () => {
  it('passes when entrypoint imports health index and health index imports ready', () => {
    const stagingDir = mkdtempSync(path.join(tmpdir(), 'hbc-functions-artifact-'));
    try {
      seedFile(
        stagingDir,
        'dist/index.js',
        "import './functions/health/index.js';\n",
      );
      seedFile(
        stagingDir,
        'dist/functions/health/index.js',
        "import './ready.js';\n",
      );
      seedFile(stagingDir, 'dist/functions/health/ready.js', 'export {};\n');

      expect(() => assertHealthRouteReleaseProof(stagingDir, './dist/index.js')).not.toThrow();
    } finally {
      rmSync(stagingDir, { recursive: true, force: true });
    }
  });

  it('fails when health index omits the ready side-effect import', () => {
    const stagingDir = mkdtempSync(path.join(tmpdir(), 'hbc-functions-artifact-'));
    try {
      seedFile(
        stagingDir,
        'dist/index.js',
        "import './functions/health/index.js';\n",
      );
      seedFile(stagingDir, 'dist/functions/health/index.js', 'export {};\n');
      seedFile(stagingDir, 'dist/functions/health/ready.js', 'export {};\n');

      expect(() => assertHealthRouteReleaseProof(stagingDir, './dist/index.js')).toThrow(
        'health index missing side-effect import ./ready.js',
      );
    } finally {
      rmSync(stagingDir, { recursive: true, force: true });
    }
  });
});
