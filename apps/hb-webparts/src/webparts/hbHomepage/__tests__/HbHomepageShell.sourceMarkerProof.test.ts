import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as url from 'node:url';

// ---------------------------------------------------------------------------
// Phase-04 Wave-01 Prompt-06 — shell-side repo-source marker proof
// ---------------------------------------------------------------------------
// Asserts every required HbHomepage shell + entry-stack marker exists in
// repo source. Repo-source proof, NOT generated `.sppkg` package proof.
// Package proof is deferred to the next CI deployment cycle and is
// documented separately in 06_TEST_PACKAGE_HOSTED_PROOF.md.
// ---------------------------------------------------------------------------

const HERE = path.dirname(url.fileURLToPath(import.meta.url));
const SHELL_SRC = path.resolve(HERE, '..');

let cache: string | null = null;

function loadSource(): string {
  if (cache) return cache;
  const buf: string[] = [];
  walk(SHELL_SRC, buf);
  cache = buf.join('\n\n/* --- next file --- */\n\n');
  return cache;
}

function walk(dir: string, buf: string[]): void {
  for (const entry of fs.readdirSync(dir)) {
    if (entry === '__tests__' || entry === 'node_modules') continue;
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walk(full, buf);
    } else if (/\.(ts|tsx|css)$/.test(entry)) {
      buf.push(`// FILE: ${path.relative(SHELL_SRC, full)}\n${fs.readFileSync(full, 'utf8')}`);
    }
  }
}

beforeAll(() => {
  loadSource();
});

describe('repo-source marker proof — HbHomepage shell + entry-stack', () => {
  // Prompt-01 edge contract markers — emitted by HbHomepageShell and
  // HbHomepageEntryStack and proven dormant by default in
  // edgeContract.test.ts. Asserting the source string here confirms the
  // markers are statically present.
  it.each([
    'data-shell-band-layout',
    'data-shell-slot-visual-side',
    'data-shell-slot-edge-bleed',
    'data-hb-homepage-edge-mode',
    'data-hb-homepage-hero-edge',
  ])('shell source contains edge-contract marker: %s', (marker) => {
    expect(loadSource().includes(marker)).toBe(true);
  });

  // Edge-contract resolver function names — proves the typed mapper
  // surface is present.
  it.each([
    'resolveShellBandLayoutMode',
    'resolveShellSlotVisualSide',
    'resolveShellSlotEdgeBleed',
    'EDGE_BLEED_ELIGIBLE_OCCUPANTS',
    'DEFAULT_HOMEPAGE_EDGE_POLICY',
  ])('shell source contains edge-contract resolver/identifier: %s', (marker) => {
    expect(loadSource().includes(marker)).toBe(true);
  });

  // The lane-host wiring rewired by Prompt 05 — onViewerIframeError now
  // routes to the same occupant error-status path previously served by
  // onEmbedError.
  it('lane host wires onViewerIframeError to occupant error-status', () => {
    const src = loadSource();
    expect(src.includes('onViewerIframeError')).toBe(true);
    expect(src.includes('viewer-iframe-error')).toBe(true);
  });

  // Lockstep authority surface is owned by hbHomepagePackageAuthority.test.ts,
  // which inspects the launcher constants file directly. Not duplicated here.
});
