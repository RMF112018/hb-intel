import type { IRelatedItem } from '@hbc/related-items';
import type {
  IScoreBenchmarkDecisionSupportResult,
  IScoreGhostOverlayState,
} from '@hbc/score-benchmark';

export interface IScoreBenchmarkRelatedItemsProjection {
  criterionLinks: IRelatedItem[];
  similarPursuitsReturnHref: string;
  explainabilityReturnHref: string;
}

export const projectScoreBenchmarkRelatedItems = (
  overlay: IScoreGhostOverlayState,
  decisionSupport: IScoreBenchmarkDecisionSupportResult,
  basePath: string
): IScoreBenchmarkRelatedItemsProjection => {
  const criterionLinks: IRelatedItem[] = overlay.benchmarks.map((benchmark) => ({
    recordType: 'business-development-scorecard',
    recordId: benchmark.criterionId,
    label: benchmark.criterionLabel,
    status: benchmark.confidence.tier,
    href: `${basePath}?panel=explainability&criterionId=${benchmark.criterionId}`,
    moduleIcon: 'target',
    relationship: 'references',
    relationshipLabel: 'Benchmark criterion',
    versionChip: {
      lastChanged: overlay.benchmarkGeneratedAt,
      author: 'score-benchmark',
    },
  }));

  return {
    criterionLinks,
    similarPursuitsReturnHref: `${basePath}${decisionSupport.actions.openPanel('similar-pursuits')}`,
    explainabilityReturnHref: `${basePath}${decisionSupport.actions.openPanel('explainability')}`,
  };
};
