import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { SAFETY_PERMISSION_MATRIX } from './safety-permission-posture.js';
import {
  HBCENTRAL_SITE_URL,
  SAFETY_SITE_URL,
} from '../../../../packages/features/safety/src/lists/descriptors.js';
import { SAFETY_RECORD_KEEPING_CONTAINER_DEFINITIONS } from '../config/safety-record-keeping-list-definitions.js';

/**
 * Lock-in guards for the tightened pre-rollout permission posture.
 *
 * Covers three surfaces:
 *   - S1/S2: the effective Graph request-path surface in the Safety hot-path
 *            Graph data plane AND the shared off-hot-path Graph client. The
 *            shared client is scanned only for permission-surface drift — its
 *            Prompt-01 isolation classification is preserved. See audit report
 *            `docs/architecture/plans/MASTER/backend/phase-03/audit-reports/16-Permissions-Tightening-And-Reproof.md`.
 *   - M1/M2/M3: matrix drift — Sites.Selected stays required for rollout, and
 *            no tenant-wide Sites.(Manage|ReadWrite|FullControl).All entry may
 *            be required for rollout.
 *   - G1/G2: per-site grant inventory — exactly {SAFETY_SITE_URL, HBCENTRAL_SITE_URL}
 *            must be the distinct siteUrl set across Safety list definitions,
 *            so a third site cannot enter the hot path without updating both
 *            this test and the operational per-site grant workflow.
 */

type CallSurfaceCategory =
  | 'Safety hot-path Graph data plane'
  | 'shared off-hot-path Graph client (scanned for permission-surface drift)';

interface ICallSurfaceTarget {
  readonly category: CallSurfaceCategory;
  readonly relativePath: string;
}

const CALL_SURFACE_TARGETS: ReadonlyArray<ICallSurfaceTarget> = [
  {
    category: 'Safety hot-path Graph data plane',
    relativePath: '../services/safety-ingestion-graph-data-plane.ts',
  },
  {
    category:
      'shared off-hot-path Graph client (scanned for permission-surface drift)',
    relativePath: '../services/legacy-fallback/graph-list-client.ts',
  },
];

// Path-boundary / string-assembly characters. The forbidden shape must be
// preceded by one of these (or start-of-line after whitespace) so that
// ordinary identifiers and comment words that happen to contain "user",
// "group", or "drive" as substrings do not produce false positives.
// Note: the regex is applied to the RAW SOURCE, not just quoted literals, so
// template literals, helper constants, and concatenated fragments all emit
// the forbidden substring somewhere in source text and are therefore caught.
const PATH_BOUNDARY = `(?:^|[\\s'"\`+\\$\\{\\(\\[,:;=])`;

interface IForbiddenShape {
  readonly name: string;
  readonly pattern: RegExp;
}

const FORBIDDEN_SHAPES: ReadonlyArray<IForbiddenShape> = [
  {
    name: 'tenant-wide /sites query (e.g. ?search=, ?filter=) — broader than Sites.Selected',
    pattern: new RegExp(`${PATH_BOUNDARY}\\/sites\\?`),
  },
  {
    name: 'tenant-wide /sites/root enumeration',
    pattern: new RegExp(
      `${PATH_BOUNDARY}\\/sites\\/root(?:\\/sites|\\/lists|\\b)`,
    ),
  },
  {
    name: 'tenant-wide /sites/getAllSites',
    pattern: new RegExp(`${PATH_BOUNDARY}\\/sites\\/getAllSites\\b`, 'i'),
  },
  {
    name: 'tenant-wide /sites/delta',
    pattern: new RegExp(`${PATH_BOUNDARY}\\/sites\\/delta\\b`, 'i'),
  },
  {
    name: 'top-level /users (requires User.Read.All or broader)',
    pattern: new RegExp(`${PATH_BOUNDARY}\\/users(?:\\/|\\?|\\b)`),
  },
  {
    name:
      'top-level /groups (provisioning group lifecycle must not live in this surface)',
    pattern: new RegExp(`${PATH_BOUNDARY}\\/groups(?:\\/|\\?|\\b)`),
  },
  {
    name:
      'top-level /drives (drive access must go through /sites/{siteId}/lists/{listId}/drive)',
    pattern: new RegExp(`${PATH_BOUNDARY}\\/drives(?:\\/|\\?|\\b)`),
  },
  {
    name: 'delegated /me (app-only flow must not call /me)',
    pattern: new RegExp(`${PATH_BOUNDARY}\\/me(?:\\/|\\?|\\b)`),
  },
  {
    name: 'top-level /applications (directory-admin scope)',
    pattern: new RegExp(`${PATH_BOUNDARY}\\/applications(?:\\/|\\?|\\b)`),
  },
  {
    name: 'top-level /directoryObjects (directory-admin scope)',
    pattern: new RegExp(
      `${PATH_BOUNDARY}\\/directoryObjects(?:\\/|\\?|\\b)`,
      'i',
    ),
  },
  {
    name: 'top-level /organization (directory-admin scope)',
    pattern: new RegExp(
      `${PATH_BOUNDARY}\\/organization(?:\\/|\\?|\\b)`,
      'i',
    ),
  },
];

function readTarget(target: ICallSurfaceTarget): string {
  return readFileSync(resolve(import.meta.dirname, target.relativePath), 'utf8');
}

function surroundingContext(source: string, matchIndex: number): string {
  const start = Math.max(0, matchIndex - 40);
  const end = Math.min(source.length, matchIndex + 60);
  return source.slice(start, end).replace(/\s+/g, ' ').trim();
}

describe('Safety permission call-surface guard (S1/S2)', () => {
  // S1 — affirmative sanity check: the scoped file must actually be a
  // Graph-calling client (contains at least one /sites/ reference). A
  // failure here signals a rename/move that must update CALL_SURFACE_TARGETS.
  it.each(CALL_SURFACE_TARGETS)(
    'S1 [$category]: $relativePath is a Graph-calling client (contains /sites/)',
    (target) => {
      const source = readTarget(target);
      expect(
        source,
        `[${target.category}] ${target.relativePath} must contain at least one /sites/ reference so the call-surface guard is actually scanning a Graph client; if the file moved or was renamed, update CALL_SURFACE_TARGETS in this test.`,
      ).toContain('/sites/');
    },
  );

  // S2 — forbidden effective-shape set: raw-source scan catches literals,
  // template literals, helper constants, and concatenated/interpolated
  // fragments because every form emits the forbidden substring verbatim.
  for (const target of CALL_SURFACE_TARGETS) {
    for (const shape of FORBIDDEN_SHAPES) {
      it(
        `S2 [${target.category}]: ${target.relativePath} must not contain "${shape.name}"`,
        () => {
          const source = readTarget(target);
          const match = source.match(shape.pattern);
          if (match) {
            throw new Error(
              `[${target.category}] ${target.relativePath} contains forbidden request-path shape: ${shape.name}\n` +
                `  matched: ${JSON.stringify(match[0])}\n` +
                `  context: ...${surroundingContext(source, match.index ?? 0)}...\n` +
                `  remediation: if a broader Graph shape is truly needed, consult the permission matrix in safety-permission-posture.ts; do not weaken this guard.`,
            );
          }
          expect(match).toBeNull();
        },
      );
    }
  }
});

describe('Safety permission matrix drift guard (M1/M2/M3)', () => {
  it('M1: Sites.Selected is required for pre-rollout and steady-state', () => {
    const entry = SAFETY_PERMISSION_MATRIX.find(
      (e) => e.permission === 'Sites.Selected',
    );
    expect(
      entry,
      'Sites.Selected must be declared in SAFETY_PERMISSION_MATRIX',
    ).toBeDefined();
    expect(entry?.requiredFor.preRollout).toBe('required');
    expect(entry?.requiredFor.steadyState).toBe('required');
  });

  it('M2: Sites.FullControl.All is forbidden for pre-rollout and steady-state', () => {
    const entry = SAFETY_PERMISSION_MATRIX.find(
      (e) => e.permission === 'Sites.FullControl.All',
    );
    expect(
      entry,
      'Sites.FullControl.All must remain declared in the matrix so its forbidden-for-rollout posture is explicit',
    ).toBeDefined();
    expect(entry?.requiredFor.preRollout).toBe('forbidden');
    expect(entry?.requiredFor.steadyState).toBe('forbidden');
  });

  it('M3: no Sites.(Manage|ReadWrite|FullControl).All entry may be required for rollout', () => {
    const BROAD_SITES = /^Sites\.(Manage|ReadWrite|FullControl)\.All$/;
    const offenders = SAFETY_PERMISSION_MATRIX.filter(
      (e) =>
        BROAD_SITES.test(e.permission) &&
        (e.requiredFor.preRollout === 'required' ||
          e.requiredFor.steadyState === 'required'),
    );
    expect(
      offenders,
      `These broad tenant-wide Sites permissions are marked required for rollout: ${offenders
        .map((e) => e.permission)
        .join(', ')}. Rollout-safe posture uses Sites.Selected + per-site grants; broad permissions must not be required.`,
    ).toEqual([]);
  });
});

describe('Safety per-site grant inventory guard (G1/G2)', () => {
  it('G1: SAFETY_SITE_URL and HBCENTRAL_SITE_URL are non-empty distinct strings', () => {
    expect(typeof SAFETY_SITE_URL).toBe('string');
    expect(SAFETY_SITE_URL.length).toBeGreaterThan(0);
    expect(typeof HBCENTRAL_SITE_URL).toBe('string');
    expect(HBCENTRAL_SITE_URL.length).toBeGreaterThan(0);
    expect(SAFETY_SITE_URL).not.toEqual(HBCENTRAL_SITE_URL);
  });

  it('G2: distinct Safety list-definition siteUrl set is exactly {SAFETY_SITE_URL, HBCENTRAL_SITE_URL}', () => {
    const distinct = new Set(
      SAFETY_RECORD_KEEPING_CONTAINER_DEFINITIONS.map((d) => d.siteUrl),
    );
    const expected = new Set<string>([SAFETY_SITE_URL, HBCENTRAL_SITE_URL]);
    const extras = [...distinct].filter((url) => !expected.has(url));
    const missing = [...expected].filter((url) => !distinct.has(url));
    expect(
      { extras, missing },
      'A third site entering Safety list definitions requires both (a) an update to this guard to allow the new site and (b) an update to the operational per-site Sites.Selected grant workflow so the MI gains write access to the new site before rollout.',
    ).toEqual({ extras: [], missing: [] });
  });
});
