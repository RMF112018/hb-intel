import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  PROHIBITED_MUTATION_KEYS,
  assertNoMutationKeys,
  createFrozenMutationGate,
  validateProvisioningManifest,
} from '../src/index.js';
import invalidUnlocked from './fixtures/invalid-mutation-unlocked-manifest.fixture.json' with { type: 'json' };

const HERE = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = join(HERE, '..');
const SRC_ROOT = join(PACKAGE_ROOT, 'src');

function walk(dir: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, files);
    else if (st.isFile() && (full.endsWith('.ts') || full.endsWith('.tsx'))) {
      files.push(full);
    }
  }
  return files;
}

describe('mutation gate factory', () => {
  it('returns a frozen gate with the locked, no-live, requires-approval triple', () => {
    const gate = createFrozenMutationGate();
    expect(gate.mutationLocked).toBe(true);
    expect(gate.liveMutationAllowed).toBe(false);
    expect(gate.requiresHumanApproval).toBe(true);
    expect(Object.isFrozen(gate)).toBe(true);
  });
});

describe('assertNoMutationKeys', () => {
  it('does not throw on a clean object graph', () => {
    expect(() =>
      assertNoMutationKeys({
        mutationGate: { mutationLocked: true, liveMutationAllowed: false },
        objectPlans: { pages: { entries: [] } },
      }),
    ).not.toThrow();
  });

  it('throws when a prohibited mutation key appears at any depth', () => {
    for (const key of PROHIBITED_MUTATION_KEYS) {
      const offending = { deeply: { nested: { [key]: true } } };
      expect(() => assertNoMutationKeys(offending)).toThrow(key);
    }
  });
});

describe('validateProvisioningManifest', () => {
  it('rejects a manifest with an unlocked mutation gate', () => {
    const result = validateProvisioningManifest(invalidUnlocked);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes('mutationLocked must be true'))).toBe(true);
    expect(result.errors.some((e) => e.includes('liveMutationAllowed must be false'))).toBe(true);
    expect(result.errors.some((e) => e.includes('requiresHumanApproval must be true'))).toBe(true);
  });

  it('rejects a manifest carrying a prohibited mutation key', () => {
    const offending = {
      ...invalidUnlocked,
      sitePlan: {
        status: 'planned',
        urlDerivation: { source: 'contract', pattern: '/x', resolved: null },
        title: { source: 'contract', resolved: null },
        createSite: 'now',
      },
    };
    const result = validateProvisioningManifest(offending);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes('createSite'))).toBe(true);
  });

  it('rejects a non-object input', () => {
    expect(validateProvisioningManifest(null).ok).toBe(false);
    expect(validateProvisioningManifest('string').ok).toBe(false);
    expect(validateProvisioningManifest(42).ok).toBe(false);
  });
});

describe('public-export discipline', () => {
  it('does not export any live mutation function name from src/index.ts', () => {
    const indexSource = readFileSync(join(SRC_ROOT, 'index.ts'), 'utf8');
    const exportLines = indexSource
      .split('\n')
      .filter((line) => line.trimStart().startsWith('export'));

    const forbiddenExportNames = [
      'execute',
      'apply',
      'provision',
      'mutate',
      'createSite',
      'createList',
      'createLibrary',
      'createGroup',
      'assignPermission',
    ];

    for (const exportLine of exportLines) {
      for (const forbidden of forbiddenExportNames) {
        const re = new RegExp(`\\b${forbidden}\\b`);
        expect(
          re.test(exportLine),
          `src/index.ts must not export "${forbidden}"; offending line: ${exportLine}`,
        ).toBe(false);
      }
    }
  });
});

describe('mapper / index source-import discipline', () => {
  const allowedScanFiles = (file: string) => {
    const rel = relative(SRC_ROOT, file);
    // Modules that legitimately reference forbidden tokens as data are
    // excluded from substring scans.
    if (rel.startsWith('guards/')) return false;
    if (rel.startsWith('validation/')) return false;
    if (rel.startsWith('scans/')) return false;
    return true;
  };

  it('mapper, contracts, loaders, and index sources contain no Graph / PnP / Azure / SPFx imports', () => {
    const files = walk(SRC_ROOT).filter(allowedScanFiles);
    expect(files.length).toBeGreaterThan(0);

    const forbiddenImportPatterns = [
      /from\s+['"]@pnp\//,
      /from\s+['"]@azure\//,
      /from\s+['"]@microsoft\/sp-/,
      /\bspHttpClient\b/,
      /\bGraphClient\b/,
    ];

    for (const file of files) {
      const source = readFileSync(file, 'utf8');
      for (const pattern of forbiddenImportPatterns) {
        expect(
          pattern.test(source),
          `${relative(PACKAGE_ROOT, file)} must not match ${pattern}`,
        ).toBe(false);
      }
    }
  });

  it('mapper, contracts, loaders, and index sources do not call fetch against tenant or Procore hosts', () => {
    const files = walk(SRC_ROOT).filter(allowedScanFiles);
    const procoreOrTenantFetch = /fetch\([^)]*['"][^'"]*(procore|sharepoint\.com|graph\.microsoft\.com)/i;

    for (const file of files) {
      const source = readFileSync(file, 'utf8');
      expect(
        procoreOrTenantFetch.test(source),
        `${relative(PACKAGE_ROOT, file)} must not fetch tenant or Procore hosts`,
      ).toBe(false);
    }
  });
});
