import type { ISeedResult } from '../src/types';
import { createMockValidationError } from './createMockValidationError';

export function createMockSeedResult(
  overrides: Partial<ISeedResult> = {}
): ISeedResult {
  return {
    totalRows: 50,
    successCount: 48,
    errorCount: 2,
    skippedCount: 0,
    errors: [
      createMockValidationError({ row: 12, column: 'Email', value: 'not-an-email' }),
      createMockValidationError({ row: 37, column: 'Value', value: 'N/A' }),
    ],
    importedAt: '2026-01-15T10:00:00Z',
    importedBy: 'user-admin-001',
    sourceDocumentId: 'doc-seed-001',
    sourceDocumentUrl: 'https://sp.example.com/system/test-import.xlsx',
    ...overrides,
  };
}
