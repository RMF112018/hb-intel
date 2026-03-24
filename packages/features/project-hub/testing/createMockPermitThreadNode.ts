import type { IPermitThreadNode } from '../src/permits/foundation/types.js';

export const createMockPermitThreadNode = (
  overrides?: Partial<IPermitThreadNode>,
): IPermitThreadNode => ({
  threadRootPermitId: null,
  parentPermitId: null,
  threadRelationshipType: 'THREAD_ROOT',
  ...overrides,
});
