import type {
  IStrategicIntelligenceEntry,
  ProvenanceClass,
  ReliabilityTier,
  SensitivityClass,
} from '../src/types/index.js';
import { createLivingStrategicIntelligenceEntry } from '../src/model/index.js';
import { createMockIntelligenceConflict } from './createMockIntelligenceConflict.js';
import { createMockSuggestedIntelligenceMatch } from './createMockSuggestedIntelligenceMatch.js';

export interface MockStrategicIntelligenceEntryInput {
  entryId?: string;
  lifecycleState?: IStrategicIntelligenceEntry['lifecycleState'];
  reliabilityTier?: ReliabilityTier;
  provenanceClass?: ProvenanceClass;
  sensitivity?: SensitivityClass;
  stale?: boolean;
  withConflict?: boolean;
  withSuggestion?: boolean;
}

export const createMockStrategicIntelligenceEntry = (
  overrides?: Partial<IStrategicIntelligenceEntry>,
  input?: MockStrategicIntelligenceEntryInput
): IStrategicIntelligenceEntry => {
  const base = createLivingStrategicIntelligenceEntry({
    entryId: input?.entryId ?? 'living-entry-mock',
    lifecycleState: input?.lifecycleState ?? 'approved',
    sensitivity: input?.sensitivity ?? 'public-internal',
    trust: {
      ...createLivingStrategicIntelligenceEntry().trust,
      reliabilityTier: input?.reliabilityTier ?? 'high',
      provenanceClass: input?.provenanceClass ?? 'meeting-summary',
      isStale: input?.stale ?? false,
      reviewBy: '2026-04-12T00:00:00.000Z',
      lastValidatedAt: '2026-03-12T00:00:00.000Z',
      aiTrustDowngraded: (input?.provenanceClass ?? 'meeting-summary') === 'ai-assisted-draft',
    },
    metadata: {
      client: 'Metro Transit',
      ownerOrganization: 'HBC',
      projectType: 'design-build',
      sector: 'transportation',
      deliveryMethod: 'cm-gc',
      geography: 'west',
      lifecyclePhase: 'proposal',
      riskCategory: 'schedule',
      competitorReferences: ['contoso'],
    },
    conflicts: input?.withConflict
      ? [
          createMockIntelligenceConflict({
            conflictId: `${input?.entryId ?? 'living-entry-mock'}-conflict`,
            relatedEntryIds: [input?.entryId ?? 'living-entry-mock'],
          }),
        ]
      : [],
    suggestedMatches: input?.withSuggestion
      ? [
          createMockSuggestedIntelligenceMatch({
            suggestionId: `${input?.entryId ?? 'living-entry-mock'}-suggestion`,
            entryId: input?.entryId ?? 'living-entry-mock',
          }),
        ]
      : [],
    createdAt: '2026-03-12T00:00:00.000Z',
    createdBy: 'author-mock',
  });

  return {
    ...base,
    ...(overrides ?? {}),
    metadata: {
      ...base.metadata,
      ...(overrides?.metadata ?? {}),
    },
    trust: {
      ...base.trust,
      ...(overrides?.trust ?? {}),
    },
    conflicts: overrides?.conflicts ?? base.conflicts,
    suggestedMatches: overrides?.suggestedMatches ?? base.suggestedMatches,
    version: {
      ...base.version,
      ...(overrides?.version ?? {}),
    },
  };
};
