import type { IRedactedProjection } from '../../types/index.js';

export const createRedactedProjection = (
  overrides?: Partial<IRedactedProjection>
): IRedactedProjection => ({
  entryId: 'entry-default',
  title: 'Redacted strategic intelligence',
  summary: 'Redacted summary',
  sensitivity: 'restricted-role',
  trust: {
    reliabilityTier: 'moderate',
    isStale: false,
    aiTrustDowngraded: false,
  },
  ...overrides,
});
