/**
 * SF28-T08 — Mock factory for IActivityEmissionInput.
 */
import type { IActivityEmissionInput } from '../src/types/index.js';

export function createMockEmissionInput(
  overrides?: Partial<IActivityEmissionInput>,
): IActivityEmissionInput {
  return {
    type: 'field-changed',
    summary: 'Test emission event.',
    primaryRef: { moduleKey: 'financial', recordId: 'fc-001' },
    actor: { initiatedByUpn: 'pm@example.com', initiatedByName: 'Jane Smith' },
    ...overrides,
  };
}
