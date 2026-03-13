import type { IRootCauseTag } from '../../types/index.js';

export const POST_BID_AUTOPSY_TAXONOMY_BOUNDARY = Object.freeze({
  owner: 'primitive',
  area: 'taxonomy',
  adapterMayProvide: Object.freeze(['display-priority']),
  adapterMustNotOwn: Object.freeze(['canonical-tag-shape', 'cross-module-tagging', 'publication-labeling']),
});

export const createRootCauseTag = (
  overrides: Partial<IRootCauseTag> = {}
): IRootCauseTag => ({
  tagId: overrides.tagId ?? 'taxonomy-default',
  domain: overrides.domain ?? 'strategy',
  label: overrides.label ?? 'Client Priority Drift',
  normalizedCode: overrides.normalizedCode ?? 'strategy/client-priority-drift',
});
