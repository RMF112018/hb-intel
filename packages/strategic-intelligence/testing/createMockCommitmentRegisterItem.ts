import type { ICommitmentRegisterItem } from '../src/types/index.js';
import { createCommitmentRegisterItem } from '../src/model/index.js';

const merge = <T extends object>(base: T, overrides?: Partial<T>): T => ({
  ...base,
  ...(overrides ?? {}),
});

export const createMockCommitmentRegisterItem = (
  overrides?: Partial<ICommitmentRegisterItem>
): ICommitmentRegisterItem =>
  merge(createCommitmentRegisterItem(), {
    commitmentId: 'commitment-mock',
    description: 'Validate strategic commitments in handoff.',
    source: 'handoff-review',
    responsibleRole: 'BD Lead',
    fulfillmentStatus: 'open',
    reviewedAt: '2026-03-12T00:00:00.000Z',
    bicRecordId: 'bic-mock-1',
    ...overrides,
  });
