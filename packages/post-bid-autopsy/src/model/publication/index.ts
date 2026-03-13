import { AUTOPSY_MIN_PUBLISH_CONFIDENCE } from '../../constants/index.js';
import type { IPublicationGate, ISupersessionLink } from '../../types/index.js';

export const POST_BID_AUTOPSY_PUBLICATION_BOUNDARY = Object.freeze({
  owner: 'primitive',
  area: 'publication',
  adapterMayProvide: Object.freeze(['audience-routing']),
  adapterMustNotOwn: Object.freeze(['gate-definitions', 'publication-eligibility', 'visibility-checks']),
});

export const createPublicationGate = (
  overrides: Partial<IPublicationGate> = {}
): IPublicationGate => ({
  publishable: overrides.publishable ?? false,
  blockers: overrides.blockers ?? ['review-decision-pending'],
  minimumConfidenceTier: overrides.minimumConfidenceTier ?? AUTOPSY_MIN_PUBLISH_CONFIDENCE,
  requiredEvidenceCount: overrides.requiredEvidenceCount ?? 1,
});

export const createSupersessionLink = (
  overrides: Partial<ISupersessionLink> = {}
): ISupersessionLink => ({
  supersedesAutopsyId: overrides.supersedesAutopsyId,
  supersededByAutopsyId: overrides.supersededByAutopsyId,
  reason: overrides.reason,
});

export { buildAutopsyPublishProjections } from './projections.js';
