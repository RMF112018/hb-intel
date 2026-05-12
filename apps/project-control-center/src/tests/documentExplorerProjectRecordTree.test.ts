import { describe, expect, it } from 'vitest';
import {
  PROJECT_RECORD_MAX_DEPTH,
  PROJECT_RECORD_RELATIVE_FOLDER_PATHS,
  PROJECT_RECORD_RELATIVE_NODE_COUNT,
  PROJECT_RECORD_TOTAL_NODE_COUNT,
  PROJECT_RECORD_TREE_ROOT,
  buildProjectRecordExplorerTree,
} from '../surfaces/documents/documentExplorerProjectRecordTree';
import { findNodeByRelativePath } from '../surfaces/documents/documentExplorerHelpers';

/**
 * Verified on-disk facts (derived from `find docs/reference/example/ComDir`
 * at Prompt 10B execution time). Locked here so the canonical path
 * manifest cannot drift unobserved from the live ComDir tree.
 */
const VERIFIED_COMDIR_TOTAL_DIR_COUNT = 43;
const VERIFIED_COMDIR_RELATIVE_DIR_COUNT = 42;
const VERIFIED_COMDIR_MAX_DEPTH = 5;
const VERIFIED_COMDIR_TOP_LEVEL_NAMES_ASCENDING: readonly string[] = [
  '01-Owner',
  '03-Engineer',
  '04-Permit',
  '05-TestingInspect',
  '06-Meeting',
  '07-RFI',
  '08-Safety',
  '11-Schedule',
  '12-Accounting',
  '13-ChangeOrder',
  '14-Subcontractor',
  '16-DrawSpecPic',
  '17-Closeout',
];

describe('documentExplorerProjectRecordTree — manifest + derived counts', () => {
  it('manifest length equals verified ComDir relative-dir count', () => {
    expect(PROJECT_RECORD_RELATIVE_FOLDER_PATHS.length).toBe(VERIFIED_COMDIR_RELATIVE_DIR_COUNT);
  });

  it('derived total/relative/max-depth match verified ComDir figures', () => {
    expect(PROJECT_RECORD_TOTAL_NODE_COUNT).toBe(VERIFIED_COMDIR_TOTAL_DIR_COUNT);
    expect(PROJECT_RECORD_RELATIVE_NODE_COUNT).toBe(VERIFIED_COMDIR_RELATIVE_DIR_COUNT);
    expect(PROJECT_RECORD_MAX_DEPTH).toBe(VERIFIED_COMDIR_MAX_DEPTH);
  });
});

describe('documentExplorerProjectRecordTree — top-level set + ordering', () => {
  it('top-level children equal the verified ComDir top-level set in ascending order', () => {
    const topLevelLabels = (PROJECT_RECORD_TREE_ROOT.children ?? []).map((c) => c.displayLabel);
    expect(topLevelLabels).toEqual(VERIFIED_COMDIR_TOP_LEVEL_NAMES_ASCENDING);
  });

  it('does NOT expose `ComDir` as a visible first-level Project Record folder', () => {
    const topLevelLabels = (PROJECT_RECORD_TREE_ROOT.children ?? []).map((c) => c.displayLabel);
    expect(topLevelLabels).not.toContain('ComDir');
  });

  it('preserves folder labels exactly as authored (no case/punctuation normalization)', () => {
    const found = findNodeByRelativePath(PROJECT_RECORD_TREE_ROOT, [
      '06-Meeting',
      'OAC',
      'Mtg #01 (07.10.12)',
    ]);
    expect(found?.displayLabel).toBe('Mtg #01 (07.10.12)');
  });
});

describe('documentExplorerProjectRecordTree — translation correctness', () => {
  it('manifest contains directory paths only — no non-directory artifact segments', () => {
    // Generic predicate (no exact filename hardcoding). ComDir contains
    // `.DS_Store`, AppleDouble `._*`, `.txt`, and `.lnk` non-directory
    // artifacts; none of these may appear as path segments in the
    // manifest after translation.
    for (const segments of PROJECT_RECORD_RELATIVE_FOLDER_PATHS) {
      for (const segment of segments) {
        expect(segment).not.toBe('.DS_Store');
        expect(segment.startsWith('._')).toBe(false);
        expect(segment.endsWith('.txt')).toBe(false);
        expect(segment.endsWith('.lnk')).toBe(false);
      }
    }
  });

  it('deepest sample path is traversable at max depth', () => {
    const deepest = findNodeByRelativePath(PROJECT_RECORD_TREE_ROOT, [
      '12-Accounting',
      'PayApp',
      'Sub',
      'Progress',
      'PayApp.001',
    ]);
    expect(deepest).toBeDefined();
    expect(deepest?.displayLabel).toBe('PayApp.001');
    expect(deepest?.relativePathSegments.length).toBe(VERIFIED_COMDIR_MAX_DEPTH);
  });
});

describe('documentExplorerProjectRecordTree — builder purity', () => {
  it('builder returns equal structural output for equal input', () => {
    const a = buildProjectRecordExplorerTree(PROJECT_RECORD_RELATIVE_FOLDER_PATHS);
    const b = buildProjectRecordExplorerTree(PROJECT_RECORD_RELATIVE_FOLDER_PATHS);
    const labelsA = (a.children ?? []).map((c) => c.displayLabel);
    const labelsB = (b.children ?? []).map((c) => c.displayLabel);
    expect(labelsA).toEqual(labelsB);
  });
});
