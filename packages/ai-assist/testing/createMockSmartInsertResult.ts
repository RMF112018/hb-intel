/**
 * createMockSmartInsertResult — SF15-T06 (D-10 testing sub-path)
 *
 * Factory for mock IAiSmartInsertResult instances with Partial overrides.
 */
import type { IAiSmartInsertResult } from '../src/types/index.js';

export function createMockSmartInsertResult(
  overrides: Partial<IAiSmartInsertResult> = {},
): IAiSmartInsertResult {
  return {
    mappings: [
      { fieldKey: 'projectName', suggestedValue: 'Acme Tower', confidence: 0.92 },
      { fieldKey: 'estimatedCost', suggestedValue: 1500000, confidence: 0.75 },
      { fieldKey: 'region', suggestedValue: 'Southeast', confidence: 0.45 },
    ],
    canApplyAll: true,
    supportsDragDrop: false,
    ...overrides,
  };
}
