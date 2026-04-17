/**
 * peopleCultureTokenGuardrails — static protection against token drift
 * in the People & Culture Public webpart surface.
 *
 * Pattern follows kudosStaticGuardrails.test.ts (Phase-28 Prompt-07).
 * Fails the suite when raw hex, rgba(), border-radius Npx, or Nms
 * literals re-enter any PC-family CSS module. The tokens.ts file is
 * excluded — it is the governed source of truth for local accents.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const WEBPARTS_SRC = join(__dirname, '..', '..');

const PC_FAMILY_CSS_MODULES: readonly string[] = [
  'webparts/peopleCulturePublic/peopleCulturePublic.module.css',
];

function stripCssComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '');
}

function stripReducedMotionBlock(source: string): string {
  return source.replace(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[^}]*\{[^}]*\}[^}]*\}/g, '');
}

function read(rel: string): string {
  return readFileSync(join(WEBPARTS_SRC, rel), 'utf8');
}

function assertNoRawLiterals(rel: string): void {
  const body = stripCssComments(read(rel));

  expect(
    body,
    `${rel} contains a raw hex color literal. Route through --pc-* custom properties.`,
  ).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);

  expect(
    body,
    `${rel} contains a raw rgba()/rgb() literal. Route through --pc-* custom properties.`,
  ).not.toMatch(/rgba?\s*\(/);

  expect(
    body,
    `${rel} contains a raw border-radius pixel literal. Route through --pc-radius-*.`,
  ).not.toMatch(/border-radius:\s*\d/);

  const bodyNoMotion = stripReducedMotionBlock(body);
  expect(
    bodyNoMotion,
    `${rel} contains a raw millisecond literal. Route through token variables.`,
  ).not.toMatch(/\b\d+ms\b/);
}

describe('People & Culture Public — static guardrails for token discipline', () => {
  for (const rel of PC_FAMILY_CSS_MODULES) {
    it(`${rel} carries no raw color / radius / motion literals`, () => {
      assertNoRawLiterals(rel);
    });
  }

  it('the scope list covers every PC-family CSS module', () => {
    const { readdirSync } = require('node:fs') as typeof import('node:fs');
    const gather = (dirRel: string): string[] =>
      readdirSync(join(WEBPARTS_SRC, dirRel), { withFileTypes: true })
        .filter(
          (d: import('node:fs').Dirent) =>
            d.isFile() && d.name.endsWith('.module.css'),
        )
        .map((d: import('node:fs').Dirent) => `${dirRel}/${d.name}`);

    const discovered = new Set<string>(gather('webparts/peopleCulturePublic'));
    const missing = [...discovered].filter((rel) => !PC_FAMILY_CSS_MODULES.includes(rel));
    expect(missing).toEqual([]);
  });
});
