import { describe, expect, it } from 'vitest';
import { DOCUMENT_EXPLORER_SOURCE_ID_ORDER } from '../surfaces/documents/documentExplorerModel';
import {
  findNodeByRelativePath,
  getBreadcrumbSegments,
  getChildren,
  getParentNode,
  hasChildPath,
  normalizeProjectRecordRelativePath,
  resolveSourceRoot,
} from '../surfaces/documents/documentExplorerHelpers';
import {
  DOCUMENT_EXPLORER_SOURCE_ROOT_NODE_MAP,
  PROCORE_SOURCE_ROOT_NODE,
} from '../surfaces/documents/documentExplorerSourceRoots';
import { PROJECT_RECORD_TREE_ROOT } from '../surfaces/documents/documentExplorerProjectRecordTree';

describe('documentExplorerHelpers — resolveSourceRoot', () => {
  it('returns the registry node for each source id', () => {
    for (const id of DOCUMENT_EXPLORER_SOURCE_ID_ORDER) {
      expect(resolveSourceRoot(id)).toBe(DOCUMENT_EXPLORER_SOURCE_ROOT_NODE_MAP[id]);
    }
  });
});

describe('documentExplorerHelpers — getChildren', () => {
  it('returns empty array when no children present', () => {
    expect(getChildren(DOCUMENT_EXPLORER_SOURCE_ROOT_NODE_MAP.home)).toEqual([]);
  });

  it('returns inline children for nodes that carry them', () => {
    const children = getChildren(PROCORE_SOURCE_ROOT_NODE);
    expect(children.length).toBe(11);
  });
});

describe('documentExplorerHelpers — findNodeByRelativePath + hasChildPath', () => {
  it('resolves a representative shallow Project Record path', () => {
    const node = findNodeByRelativePath(PROJECT_RECORD_TREE_ROOT, ['07-RFI']);
    expect(node?.displayLabel).toBe('07-RFI');
    expect(node?.nodeKind).toBe('folder');
  });

  it('resolves a representative deep Project Record path', () => {
    const node = findNodeByRelativePath(PROJECT_RECORD_TREE_ROOT, [
      '07-RFI',
      '001.Description.R',
      'Sent.Date',
    ]);
    expect(node?.displayLabel).toBe('Sent.Date');
  });

  it('returns undefined for a non-existent path', () => {
    expect(
      findNodeByRelativePath(PROJECT_RECORD_TREE_ROOT, ['07-RFI', 'no-such-folder']),
    ).toBeUndefined();
  });

  it('hasChildPath returns boolean wrapper of findNodeByRelativePath', () => {
    expect(hasChildPath(PROJECT_RECORD_TREE_ROOT, ['08-Safety'])).toBe(true);
    expect(hasChildPath(PROJECT_RECORD_TREE_ROOT, ['no-such-top-level'])).toBe(false);
  });
});

describe('documentExplorerHelpers — getParentNode', () => {
  it('returns the parent folder for a nested node', () => {
    const child = findNodeByRelativePath(PROJECT_RECORD_TREE_ROOT, ['07-RFI', '001.Description.R']);
    const parent = child ? getParentNode(child, PROJECT_RECORD_TREE_ROOT) : undefined;
    expect(parent?.displayLabel).toBe('07-RFI');
  });

  it('returns undefined for the source root itself', () => {
    expect(getParentNode(PROJECT_RECORD_TREE_ROOT, PROJECT_RECORD_TREE_ROOT)).toBeUndefined();
  });
});

describe('documentExplorerHelpers — getBreadcrumbSegments', () => {
  it('produces breadcrumb chain from root to current node with isCurrent on the tail', () => {
    const node = findNodeByRelativePath(PROJECT_RECORD_TREE_ROOT, [
      '12-Accounting',
      'PayApp',
      'Sub',
    ]);
    const segments = node ? getBreadcrumbSegments(node, PROJECT_RECORD_TREE_ROOT) : [];
    expect(segments.map((s) => s.label)).toEqual([
      'Project Record',
      '12-Accounting',
      'PayApp',
      'Sub',
    ]);
    expect(segments[segments.length - 1].isCurrent).toBe(true);
    expect(segments.slice(0, -1).every((s) => s.isCurrent === false)).toBe(true);
  });

  it('returns just the root segment when called on the source root', () => {
    const segments = getBreadcrumbSegments(PROJECT_RECORD_TREE_ROOT, PROJECT_RECORD_TREE_ROOT);
    expect(segments).toHaveLength(1);
    expect(segments[0].label).toBe('Project Record');
    expect(segments[0].isCurrent).toBe(true);
  });
});

describe('documentExplorerHelpers — normalizeProjectRecordRelativePath', () => {
  it('splits slash-joined strings into segments', () => {
    expect(normalizeProjectRecordRelativePath('12-Accounting/PayApp/Sub')).toEqual([
      '12-Accounting',
      'PayApp',
      'Sub',
    ]);
  });

  it('removes empty segments without altering label case', () => {
    expect(normalizeProjectRecordRelativePath('/12-Accounting//PayApp/')).toEqual([
      '12-Accounting',
      'PayApp',
    ]);
  });

  it('preserves arrays through normalization (trimming whitespace)', () => {
    expect(normalizeProjectRecordRelativePath(['12-Accounting', ' PayApp '])).toEqual([
      '12-Accounting',
      'PayApp',
    ]);
  });
});
