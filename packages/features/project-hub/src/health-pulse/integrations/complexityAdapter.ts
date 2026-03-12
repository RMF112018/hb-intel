import type { ComplexityTier } from '@hbc/complexity';

import type { IProjectHealthPulse } from '../types/index.js';

export interface IHealthPulseComplexityProjection {
  tier: ComplexityTier;
  showCompactSummary: boolean;
  showDetailPanels: boolean;
  showDiagnosticBreakdown: boolean;
  visibleCompoundRisks: IProjectHealthPulse['compoundRisks'];
  visibleConfidenceReasons: string[];
}

export const projectHealthPulseByComplexity = (
  pulse: IProjectHealthPulse,
  tier: ComplexityTier
): IHealthPulseComplexityProjection => {
  if (tier === 'essential') {
    return {
      tier,
      showCompactSummary: true,
      showDetailPanels: false,
      showDiagnosticBreakdown: false,
      visibleCompoundRisks: pulse.compoundRisks.filter((risk) => risk.severity === 'high' || risk.severity === 'critical'),
      visibleConfidenceReasons: pulse.overallConfidence.reasons.slice(0, 1),
    };
  }

  if (tier === 'standard') {
    return {
      tier,
      showCompactSummary: true,
      showDetailPanels: true,
      showDiagnosticBreakdown: false,
      visibleCompoundRisks: pulse.compoundRisks.filter((risk) => risk.severity !== 'low'),
      visibleConfidenceReasons: pulse.overallConfidence.reasons.slice(0, 3),
    };
  }

  return {
    tier,
    showCompactSummary: true,
    showDetailPanels: true,
    showDiagnosticBreakdown: true,
    visibleCompoundRisks: pulse.compoundRisks,
    visibleConfidenceReasons: pulse.overallConfidence.reasons,
  };
};
