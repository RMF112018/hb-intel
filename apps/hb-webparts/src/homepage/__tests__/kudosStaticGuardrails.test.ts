/**
 * kudosStaticGuardrails — Phase-28 Prompt-07 closure.
 *
 * Static protection against homepage token / doctrine drift in the
 * HB Kudos webpart family. The benchmark
 * (`docs/reference/ui-kit/homepage-webpart-benchmark.md`) requires
 * zero hardcoded hex, rgba, or raw px for color / radius / transition
 * in ordinary-source CSS modules; values must flow through the
 * governed `--hbk-*` custom-property bridge seeded by
 * `kudosCSSVars()`.
 *
 * Interactive tests will not catch a silent re-introduction of raw
 * literals. This test file does — one focused regex per banned
 * category, scoped to the kudos-family CSS modules only, with
 * comments stripped so the guard rules stay authorable.
 *
 * Scope rationale — why these six files:
 *   - kudosSurface / companion / governance / kudosFeed / kudosFlyout
 *     / kudosReader are the only ordinary-source CSS modules that
 *     render the Kudos product. `kudosShells.module.css` owns shell
 *     body layout and is included because it sits in the same
 *     governed family.
 *   - The ui-kit `HbcKudosComposer` maintains its own `--hbc-kudos-*`
 *     bridge inside the package boundary by design; that scope is
 *     owned upstream and intentionally excluded here.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const WEBPARTS_SRC = join(__dirname, '..', '..');

/**
 * Kudos-family ordinary-source CSS modules that must flow entirely
 * through the `--hbk-*` token seam. New kudos-family CSS modules MUST
 * be added here when introduced, so this guard's scope stays honest.
 */
const KUDOS_FAMILY_CSS_MODULES: readonly string[] = [
  'webparts/hbKudos/kudosSurface.module.css',
  'webparts/hbKudos/kudosFeed.module.css',
  'webparts/hbKudos/kudosFlyout.module.css',
  'webparts/hbKudos/kudosReader.module.css',
  'webparts/hbKudosCompanion/companion.module.css',
  'homepage/shared/governance.module.css',
  'homepage/shared/kudosShells.module.css',
];

/** Strip `/* ... *​/` blocks so the guard checks real style content only. */
function stripCssComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '');
}

function read(rel: string): string {
  return readFileSync(join(WEBPARTS_SRC, rel), 'utf8');
}

/**
 * Per-file assertions. Each banned pattern raises a specific error
 * that points the author at the actual benchmark rule they broke —
 * a generic "pattern matched" failure is useless feedback here.
 */
function assertNoRawLiterals(rel: string): void {
  const body = stripCssComments(read(rel));

  // Banned: raw hex colors. Token seam exposes `--hbk-*` custom
  // properties for every governed surface color.
  expect(
    body,
    `${rel} contains a raw hex color literal. Homepage benchmark forbids hardcoded hex in ordinary CSS — route the color through kudosCSSVars() / --hbk-*.`,
  ).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);

  // Banned: raw rgba()/rgb() literals. All alpha ramps live inside
  // `kudosCSSVars()` as --hbk-ink-shadow-*, --hbk-on-dark-*, etc.
  expect(
    body,
    `${rel} contains a raw rgba()/rgb() literal. Homepage benchmark forbids hardcoded rgba in ordinary CSS — route via the alpha ramps seeded by kudosCSSVars().`,
  ).not.toMatch(/rgba?\s*\(/);

  // Banned: raw border-radius with a pixel literal. The radius scale
  // lives at --hbk-radius-hairline / -chip / -xs / -sm / -md / -lg /
  // -xl / -2xl / -pill (see KudosGovernancePrimitives.tsx).
  expect(
    body,
    `${rel} contains a raw border-radius pixel literal. Route through --hbk-radius-*.`,
  ).not.toMatch(/border-radius:\s*\d/);

  // Banned: raw millisecond literals (transitions / animations). The
  // motion scale lives at --hbk-motion-fast / -base / -mid / -snap /
  // -slow and covers every governed choreography in the family.
  expect(
    body,
    `${rel} contains a raw millisecond literal. Route through --hbk-motion-*.`,
  ).not.toMatch(/\b\d+ms\b/);
}

describe('Phase-28 Prompt-07 — static guardrails for HB Kudos family CSS', () => {
  for (const rel of KUDOS_FAMILY_CSS_MODULES) {
    it(`${rel} carries no raw color / radius / motion literals`, () => {
      assertNoRawLiterals(rel);
    });
  }

  it('the scope list covers every kudos-family ordinary-source CSS module', () => {
    // This meta-assertion fails fast when a new kudos-family CSS
    // module is introduced without being added to the guard's scope.
    // It walks the two kudos webpart directories + the shared
    // homepage seam and compares their `*.module.css` files against
    // KUDOS_FAMILY_CSS_MODULES.
    const { readdirSync } = require('node:fs') as typeof import('node:fs');
    const gather = (dirRel: string): string[] =>
      readdirSync(join(WEBPARTS_SRC, dirRel), { withFileTypes: true })
        .filter(
          (d: import('node:fs').Dirent) =>
            d.isFile() && d.name.endsWith('.module.css'),
        )
        .map((d: import('node:fs').Dirent) => `${dirRel}/${d.name}`);

    const discovered = new Set<string>([
      ...gather('webparts/hbKudos'),
      ...gather('webparts/hbKudosCompanion'),
      // Only kudos-prefixed / governance modules in homepage/shared
      // belong to the family.
      ...gather('homepage/shared').filter(
        (rel) =>
          rel.endsWith('governance.module.css') ||
          rel.endsWith('kudosShells.module.css'),
      ),
    ]);

    const missing = [...discovered].filter((rel) => !KUDOS_FAMILY_CSS_MODULES.includes(rel));
    expect(missing).toEqual([]);
  });
});
