import type { IHandoffDocument } from '../src/types/IWorkflowHandoff';

let counter = 0;

/**
 * Creates a mock IHandoffDocument with sensible defaults (D-06).
 * Override any field as needed for specific test scenarios.
 *
 * @example
 * const doc = createMockHandoffDocument({ category: 'Bid Documents' });
 */
export function createMockHandoffDocument(
  overrides?: Partial<IHandoffDocument>
): IHandoffDocument {
  counter += 1;
  return {
    documentId: `mock-doc-${counter}`,
    fileName: `test-document-${counter}.pdf`,
    sharepointUrl: `https://sharepoint.example.com/sites/hb/documents/doc-${counter}.pdf`,
    category: 'RFP',
    fileSizeBytes: 102400,
    ...overrides,
  };
}
