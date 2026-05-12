import { describe, expect, it } from 'vitest';
import { DOCUMENT_EXPLORER_SOURCE_ID_ORDER } from '../surfaces/documents/documentExplorerModel';
import {
  DOCUMENT_CONTROL_HOME_ROOT_NODE,
  DOCUMENT_EXPLORER_SOURCE_ROOT_NODE_MAP,
  MY_PROJECT_FILES_SOURCE_ROOT_NODE,
  PROCORE_SOURCE_ROOT_NODE,
} from '../surfaces/documents/documentExplorerSourceRoots';
import { PROJECT_RECORD_TREE_ROOT } from '../surfaces/documents/documentExplorerProjectRecordTree';
import { PROCORE_CATEGORY_DIRECTORY_NODES } from '../surfaces/documents/documentExplorerProcoreCategories';

describe('documentExplorerSourceRoots — unified registry', () => {
  it('exposes exactly the four explorer source-root keys', () => {
    expect(Object.keys(DOCUMENT_EXPLORER_SOURCE_ROOT_NODE_MAP).sort()).toEqual(
      [...DOCUMENT_EXPLORER_SOURCE_ID_ORDER].sort(),
    );
  });

  it('home root has nodeKind home and posture preview', () => {
    expect(DOCUMENT_CONTROL_HOME_ROOT_NODE.nodeKind).toBe('home');
    expect(DOCUMENT_CONTROL_HOME_ROOT_NODE.sourceId).toBe('home');
    expect(DOCUMENT_CONTROL_HOME_ROOT_NODE.posture).toBe('preview');
    expect(DOCUMENT_CONTROL_HOME_ROOT_NODE.hasChildren).toBe(false);
  });

  it('project-record root is the built Project Record tree with nodeKind source-root', () => {
    const node = DOCUMENT_EXPLORER_SOURCE_ROOT_NODE_MAP['project-record'];
    expect(node).toBe(PROJECT_RECORD_TREE_ROOT);
    expect(node.nodeKind).toBe('source-root');
    expect(node.sourceId).toBe('project-record');
    expect(node.posture).toBe('read-only');
    expect(node.hasChildren).toBe(true);
  });

  it('my-project-files root has nodeKind source-root and no fabricated children', () => {
    expect(MY_PROJECT_FILES_SOURCE_ROOT_NODE.nodeKind).toBe('source-root');
    expect(MY_PROJECT_FILES_SOURCE_ROOT_NODE.sourceId).toBe('my-project-files');
    expect(MY_PROJECT_FILES_SOURCE_ROOT_NODE.posture).toBe('read-only');
    expect(MY_PROJECT_FILES_SOURCE_ROOT_NODE.hasChildren).toBe(false);
    expect(MY_PROJECT_FILES_SOURCE_ROOT_NODE.children).toBeUndefined();
  });

  it('procore root references the locked category nodes as children', () => {
    expect(PROCORE_SOURCE_ROOT_NODE.nodeKind).toBe('source-root');
    expect(PROCORE_SOURCE_ROOT_NODE.sourceId).toBe('procore');
    expect(PROCORE_SOURCE_ROOT_NODE.posture).toBe('launch-only');
    expect(PROCORE_SOURCE_ROOT_NODE.hasChildren).toBe(true);
    expect(PROCORE_SOURCE_ROOT_NODE.children).toBe(PROCORE_CATEGORY_DIRECTORY_NODES);
  });
});
