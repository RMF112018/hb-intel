import type { IHandoffContextNote, HandoffNoteCategory } from '../src/types/IWorkflowHandoff';

let counter = 0;

/**
 * Creates a mock IHandoffContextNote with sensible defaults.
 * Uses IBicOwner for author (not flat authorId/authorName).
 *
 * @example
 * const note = createMockContextNote({ category: 'Risk', body: 'Budget concern' });
 */
export function createMockContextNote(
  overrides?: Partial<IHandoffContextNote>
): IHandoffContextNote {
  counter += 1;
  return {
    noteId: `mock-note-${counter}`,
    category: 'General' as HandoffNoteCategory,
    body: `Mock context note body ${counter}`,
    author: {
      userId: 'mock-author-001',
      displayName: 'John BD Director',
      role: 'BD Director',
    },
    createdAt: '2026-01-15T09:00:00Z',
    ...overrides,
  };
}
