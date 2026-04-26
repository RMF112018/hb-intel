import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as url from 'node:url';

// ---------------------------------------------------------------------------
// Phase-04 Wave-01 Prompt-06 — repo-source marker proof
// ---------------------------------------------------------------------------
// Asserts every required Foleon-reader marker / class / type identifier
// exists in package source. This is **repo-source proof**, not generated
// `.sppkg` package proof. SPFx packaging is a CI-only operation and the
// generated artifact cannot be inspected from the local test environment.
// 06_TEST_PACKAGE_HOSTED_PROOF.md documents package-proof posture
// separately and provides the manual `.sppkg` content-inspection
// checklist for the next deployment cycle.
// ---------------------------------------------------------------------------

const HERE = path.dirname(url.fileURLToPath(import.meta.url));
const FOLEON_READER_SRC = path.resolve(HERE, '..', '..');

interface SourceFiles {
  combined: string;
}

let cache: SourceFiles | null = null;

function loadFoleonReaderSource(): SourceFiles {
  if (cache) return cache;
  const buf: string[] = [];
  walk(FOLEON_READER_SRC, buf);
  cache = { combined: buf.join('\n\n/* --- next file --- */\n\n') };
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
      buf.push(`// FILE: ${path.relative(FOLEON_READER_SRC, full)}\n${fs.readFileSync(full, 'utf8')}`);
    }
  }
}

beforeAll(() => {
  loadFoleonReaderSource();
});

describe('repo-source marker proof — foleon-reader package', () => {
  // Required Prompt-06 lane / layout identity strings.
  it.each([
    'project-spotlight-feature',
    'company-pulse-briefing',
    'leadership-message',
    'data-foleon-reader-layout',
    'data-foleon-layout',
    'data-foleon-reader-lane',
    'data-foleon-reader-state',
  ])('source contains lane/layout identity marker: %s', (marker) => {
    const { combined } = loadFoleonReaderSource();
    expect(combined.includes(marker)).toBe(true);
  });

  // Article-card and refusal markers introduced by Prompts 04B / 04C / 05.
  it.each([
    'data-foleon-article-card',
    'data-foleon-article-lane',
    'data-foleon-article-state',
    'data-foleon-viewer-target-id',
    'data-foleon-article-last-refusal',
  ])('source contains article-card marker: %s', (marker) => {
    const { combined } = loadFoleonReaderSource();
    expect(combined.includes(marker)).toBe(true);
  });

  // Full-window viewer markers (Prompt 04A).
  it.each([
    'data-foleon-full-window-viewer',
    'data-foleon-viewer-lane',
    'data-foleon-viewer-source',
    'FoleonFullWindowViewer',
    'FoleonFullWindowViewerProvider',
    'useFoleonFullWindowViewer',
  ])('source contains full-window viewer marker: %s', (marker) => {
    const { combined } = loadFoleonReaderSource();
    expect(combined.includes(marker)).toBe(true);
  });

  // Iframe governance / viewer-target type identifiers — proves the
  // governed iframe path is present in source and that the discriminated
  // refusal result type still ships.
  it.each([
    'FoleonIframeHost',
    'FoleonViewerTarget',
    'FoleonViewerOpenResult',
    'FoleonArticleCardViewModel',
  ])('source contains iframe / viewer-target identifier: %s', (marker) => {
    const { combined } = loadFoleonReaderSource();
    expect(combined.includes(marker)).toBe(true);
  });

  // The legacy compatibility shell remains in the package (unused by any
  // governed lane after Prompt 05) — acceptable; future cleanup prompt
  // can remove it. Just assert it didn't get accidentally removed in a
  // way that would break external consumers.
  it('source still contains the unused FoleonReaderCompatibilityLayout fallback', () => {
    const { combined } = loadFoleonReaderSource();
    expect(combined.includes('FoleonReaderCompatibilityLayout')).toBe(true);
  });
});
