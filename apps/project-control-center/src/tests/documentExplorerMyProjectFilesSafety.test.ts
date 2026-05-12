import { describe, expect, it } from 'vitest';
import { DOCUMENT_EXPLORER_SOURCE_ROOTS } from '../surfaces/documents/documentExplorerModel';
import { MY_PROJECT_FILES_SOURCE_ROOT_NODE } from '../surfaces/documents/documentExplorerSourceRoots';

describe('documentExplorerSourceRoots — My Project Files safety boundary', () => {
  it('root has no fabricated children', () => {
    expect(MY_PROJECT_FILES_SOURCE_ROOT_NODE.hasChildren).toBe(false);
    expect(MY_PROJECT_FILES_SOURCE_ROOT_NODE.children).toBeUndefined();
  });

  it('root is read-only posture (not launch-only or preview)', () => {
    expect(MY_PROJECT_FILES_SOURCE_ROOT_NODE.posture).toBe('read-only');
  });

  it('source-id is project-scoped my-project-files', () => {
    expect(MY_PROJECT_FILES_SOURCE_ROOT_NODE.sourceId).toBe('my-project-files');
  });

  it('display copy does not advertise a full OneDrive root', () => {
    expect(MY_PROJECT_FILES_SOURCE_ROOT_NODE.displayLabel).not.toMatch(/full\s+onedrive/i);
    expect(MY_PROJECT_FILES_SOURCE_ROOT_NODE.displayLabel).not.toMatch(/onedrive\s+root/i);
  });

  it('source-root metadata carries an explicit project-scope guardrail copy', () => {
    const meta = DOCUMENT_EXPLORER_SOURCE_ROOTS['my-project-files'];
    expect(meta.guardrailCopy).toBeDefined();
    expect(meta.guardrailCopy).toMatch(/project-scoped/i);
    expect(meta.guardrailCopy).toMatch(/full OneDrive root/i);
  });
});
