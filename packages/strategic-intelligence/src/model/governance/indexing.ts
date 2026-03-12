import type {
  IRedactedProjection,
  IStrategicIntelligenceEntry,
  IStrategicIntelligenceIndexingPayload,
} from '../../types/index.js';

const clone = <T>(value: T): T => structuredClone(value);

const redactionSummary = (entry: IStrategicIntelligenceEntry): string => {
  if (entry.sensitivity === 'public-internal') {
    return entry.body;
  }

  return 'Redacted due to sensitivity policy.';
};

const redactionReason = (entry: IStrategicIntelligenceEntry): string | undefined => {
  if (entry.sensitivity === 'public-internal') {
    return undefined;
  }

  return `Entry has ${entry.sensitivity} sensitivity.`;
};

export const isIndexEligible = (entry: IStrategicIntelligenceEntry): boolean =>
  entry.lifecycleState === 'approved';

export const toRedactedProjection = (
  entry: IStrategicIntelligenceEntry
): IRedactedProjection => ({
  entryId: entry.entryId,
  title: entry.title,
  summary: redactionSummary(entry),
  sensitivity: entry.sensitivity,
  redactionReason: redactionReason(entry),
  trust: {
    reliabilityTier: entry.trust.reliabilityTier,
    isStale: entry.trust.isStale,
    aiTrustDowngraded: entry.trust.aiTrustDowngraded,
  },
});

export const buildIndexingPayload = (
  scorecardId: string,
  entries: IStrategicIntelligenceEntry[]
): IStrategicIntelligenceIndexingPayload => {
  const indexableEntries = entries.filter(isIndexEligible).map(clone);
  const excludedEntryIds = entries
    .filter((entry) => !isIndexEligible(entry))
    .map((entry) => entry.entryId);

  return {
    scorecardId,
    indexableEntries,
    excludedEntryIds,
    redactedProjections: indexableEntries.map(toRedactedProjection),
  };
};

export const buildSuggestionMatchFactors = (entry: IStrategicIntelligenceEntry): string[] => {
  const metadata = entry.metadata;
  const factors: string[] = [];

  if (metadata.client) factors.push(`client:${metadata.client}`);
  if (metadata.ownerOrganization) factors.push(`owner:${metadata.ownerOrganization}`);
  if (metadata.projectType) factors.push(`projectType:${metadata.projectType}`);
  if (metadata.sector) factors.push(`sector:${metadata.sector}`);
  if (metadata.deliveryMethod) factors.push(`deliveryMethod:${metadata.deliveryMethod}`);
  if (metadata.geography) factors.push(`geography:${metadata.geography}`);
  if (metadata.lifecyclePhase) factors.push(`phase:${metadata.lifecyclePhase}`);
  if (metadata.riskCategory) factors.push(`risk:${metadata.riskCategory}`);

  return [...factors, `provenance:${entry.trust.provenanceClass}`];
};
