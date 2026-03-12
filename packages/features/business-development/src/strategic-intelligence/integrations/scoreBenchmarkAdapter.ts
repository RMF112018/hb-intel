import type { IBenchmarkFilterContext } from '@hbc/score-benchmark';
import type { IStrategicIntelligenceState } from '@hbc/strategic-intelligence';

export interface IStrategicIntelligenceScoreBenchmarkInteropProjection {
  filterContext: IBenchmarkFilterContext;
  approvedEntryCount: number;
  reusableMetadataDimensions: string[];
}

export const projectStrategicIntelligenceToScoreBenchmark = (
  state: IStrategicIntelligenceState
): IStrategicIntelligenceScoreBenchmarkInteropProjection => {
  const approvedEntries = state.livingEntries.filter((entry) => entry.lifecycleState === 'approved');
  const metadataDimensions = new Set<string>();

  for (const entry of approvedEntries) {
    if (entry.metadata.client) metadataDimensions.add(`client:${entry.metadata.client}`);
    if (entry.metadata.projectType) metadataDimensions.add(`projectType:${entry.metadata.projectType}`);
    if (entry.metadata.sector) metadataDimensions.add(`sector:${entry.metadata.sector}`);
    if (entry.metadata.geography) metadataDimensions.add(`geography:${entry.metadata.geography}`);
    if (entry.metadata.deliveryMethod) metadataDimensions.add(`deliveryMethod:${entry.metadata.deliveryMethod}`);
  }

  const firstApproved = approvedEntries[0];

  return {
    filterContext: {
      projectType: firstApproved?.metadata.projectType,
      geography: firstApproved?.metadata.geography,
      deliveryMethod: firstApproved?.metadata.deliveryMethod,
    },
    approvedEntryCount: approvedEntries.length,
    reusableMetadataDimensions: [...metadataDimensions],
  };
};
