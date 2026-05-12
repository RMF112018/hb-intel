import { describe, expect, it } from 'vitest';
import {
  DOCUMENT_EXPLORER_SOURCE_ID_ORDER,
  type DocumentExplorerNodeKind,
  type DocumentExplorerSourceId,
} from '../surfaces/documents/documentExplorerModel';

describe('documentExplorerModel — source-id and node-kind vocabulary', () => {
  it('locks the source-id order deterministically', () => {
    const expected: readonly DocumentExplorerSourceId[] = [
      'home',
      'project-record',
      'my-project-files',
      'procore',
    ];
    expect(DOCUMENT_EXPLORER_SOURCE_ID_ORDER).toEqual(expected);
  });

  it('does NOT expose document-crunch, adobe-sign, or drawing-model-center as explorer source ids', () => {
    const ids: readonly string[] = DOCUMENT_EXPLORER_SOURCE_ID_ORDER;
    expect(ids).not.toContain('document-crunch');
    expect(ids).not.toContain('adobe-sign');
    expect(ids).not.toContain('drawing-model-center');
  });

  it('node-kind union covers home, source-root, folder, category, and linked-record', () => {
    const kinds: readonly DocumentExplorerNodeKind[] = [
      'home',
      'source-root',
      'folder',
      'category',
      'linked-record',
    ];
    // Compile-time exhaustiveness — if a union member were removed, this
    // array's typing would fail to compile.
    expect(kinds.length).toBe(5);
  });
});
