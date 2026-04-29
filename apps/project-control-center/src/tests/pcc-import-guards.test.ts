import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, it, expect } from 'vitest';

const SRC_ROOT = resolve(__dirname, '..');

const FORBIDDEN_MODULE_SPECIFIERS = [
  '@hbc/ui-kit/homepage',
  '@hbc/homepage-launcher',
  'apps/hb-homepage',
  'apps/hb-webparts/src/webparts/hbHomepage/',
  'hbHomepage/',
  '@pnp/',
  '@pnp/sp',
  '@microsoft/microsoft-graph-client',
  '@microsoft/sp-http',
  'procore-sdk',
  'procoreApi',
  'procore-client',
  '/backend/',
  'backend/routes',
  'backend/client',
  'paired-row',
] as const;

const FORBIDDEN_EXECUTABLE_SEAMS = [
  '@hbc/auth',
  'bootstrapSpfxAuth',
  'resolveSpfxPermissions',
  'MSGraphClient',
  'GraphServiceClient',
  'ProcoreClient',
  'DocumentCrunchClient',
  'AdobeSignClient',
  'fetch(',
  'XMLHttpRequest',
  'navigator.clipboard',
  'localStorage',
  'sessionStorage',
  'window.open',
  'ensureUser',
  'PeoplePicker',
  'ClientPeoplePicker',
  'sp.web',
  '_api/web',
  'addRoleAssignment',
  'breakRoleInheritance',
  'createGroup',
  'deleteObject',
  'deleteGroup',
  'setUserAsOwner',
  'removeUserFromGroup',
  'addUserToGroup',
  'setSiteAdmin',
  'tenant.',
] as const;

function listSourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    if (name === 'tests') continue;
    const full = join(dir, name);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      out.push(...listSourceFiles(full));
    } else if (/\.(ts|tsx)$/.test(name)) {
      out.push(full);
    }
  }
  return out;
}

function stripCommentsOnly(source: string): string {
  let out = '';
  let i = 0;
  let mode: 'code' | 'line' | 'block' = 'code';
  while (i < source.length) {
    const c = source[i];
    const next = source[i + 1];
    if (mode === 'code') {
      if (c === '/' && next === '/') {
        mode = 'line';
        i += 2;
        continue;
      }
      if (c === '/' && next === '*') {
        mode = 'block';
        i += 2;
        continue;
      }
      out += c;
      i += 1;
      continue;
    }
    if (mode === 'line') {
      if (c === '\n') {
        out += '\n';
        mode = 'code';
      }
      i += 1;
      continue;
    }
    if (mode === 'block') {
      if (c === '*' && next === '/') {
        mode = 'code';
        i += 2;
        continue;
      }
      i += 1;
      continue;
    }
  }
  return out;
}

function stripCommentsAndStrings(source: string): string {
  let out = '';
  let i = 0;
  let mode: 'code' | 'line' | 'block' | 'single' | 'double' | 'template' = 'code';
  while (i < source.length) {
    const c = source[i];
    const next = source[i + 1];
    if (mode === 'code') {
      if (c === '/' && next === '/') {
        mode = 'line';
        i += 2;
        continue;
      }
      if (c === '/' && next === '*') {
        mode = 'block';
        i += 2;
        continue;
      }
      if (c === "'") {
        mode = 'single';
        i += 1;
        continue;
      }
      if (c === '"') {
        mode = 'double';
        i += 1;
        continue;
      }
      if (c === '`') {
        mode = 'template';
        i += 1;
        continue;
      }
      out += c;
      i += 1;
      continue;
    }
    if (mode === 'line') {
      if (c === '\n') {
        out += '\n';
        mode = 'code';
      }
      i += 1;
      continue;
    }
    if (mode === 'block') {
      if (c === '*' && next === '/') {
        mode = 'code';
        i += 2;
        continue;
      }
      i += 1;
      continue;
    }
    if (mode === 'single' || mode === 'double' || mode === 'template') {
      const closer = mode === 'single' ? "'" : mode === 'double' ? '"' : '`';
      if (c === '\\') {
        i += 2;
        continue;
      }
      if (c === closer) {
        mode = 'code';
      }
      i += 1;
      continue;
    }
  }
  return out;
}

function getModuleSpecifiers(source: string): string[] {
  const noComments = stripCommentsOnly(source);
  const specifiers = new Set<string>();
  const regexes = [
    /\bimport\s+[^'"\n;]*?\s+from\s+['"]([^'"]+)['"]/g,
    /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /\bexport\s+[^'"\n;]*?\s+from\s+['"]([^'"]+)['"]/g,
  ];

  for (const re of regexes) {
    re.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = re.exec(noComments)) !== null) {
      if (match[1]) specifiers.add(match[1]);
    }
  }

  return [...specifiers];
}

describe('PCC import guards', () => {
  const files = listSourceFiles(SRC_ROOT);

  it('finds source files to scan', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  for (const forbidden of FORBIDDEN_MODULE_SPECIFIERS) {
    it(`does not import/export module specifier containing '${forbidden}'`, () => {
      const offenders: string[] = [];
      for (const file of files) {
        const source = readFileSync(file, 'utf8');
        const specifiers = getModuleSpecifiers(source);
        if (specifiers.some((specifier) => specifier.includes(forbidden))) {
          offenders.push(file);
        }
      }
      expect(
        offenders,
        `expected no module specifier offenders for '${forbidden}', found: ${offenders.join(', ')}`,
      ).toEqual([]);
    });
  }

  for (const forbidden of FORBIDDEN_EXECUTABLE_SEAMS) {
    it(`does not include forbidden executable seam '${forbidden}'`, () => {
      const offenders: string[] = [];
      for (const file of files) {
        const stripped = stripCommentsAndStrings(readFileSync(file, 'utf8'));
        if (stripped.includes(forbidden)) {
          offenders.push(file);
        }
      }
      expect(
        offenders,
        `expected no executable seam offenders for '${forbidden}', found: ${offenders.join(', ')}`,
      ).toEqual([]);
    });
  }
});
