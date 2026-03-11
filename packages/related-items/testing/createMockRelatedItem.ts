/**
 * createMockRelatedItem — D-SF14-T01, D-10 (testing sub-path)
 *
 * Factory for mock IRelatedItem instances with Partial overrides.
 */
import type { IRelatedItem } from '../src/types/index.js';

export function createMockRelatedItem(
  overrides: Partial<IRelatedItem> = {},
): IRelatedItem {
  return {
    recordType: 'project',
    recordId: 'mock-project-001',
    label: 'Mock Project Record',
    status: 'Active',
    href: '/projects/mock-project-001',
    moduleIcon: 'project',
    relationship: 'has',
    relationshipLabel: 'Has Project',
    ...overrides,
  };
}
