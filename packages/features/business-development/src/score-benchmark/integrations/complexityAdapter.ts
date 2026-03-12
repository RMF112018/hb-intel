import type { ComplexityTier } from '@hbc/complexity';
import type { IScoreBenchmarkStateResult } from '@hbc/score-benchmark';
import type { ScoreBenchmarkComplexityMode } from '../components/index.js';

export interface IScoreBenchmarkComplexityProjection {
  tier: ComplexityTier;
  mode: ScoreBenchmarkComplexityMode;
  showFilters: boolean;
  showDiagnostics: boolean;
}

const modeByTier: Record<ComplexityTier, ScoreBenchmarkComplexityMode> = {
  essential: 'Essential',
  standard: 'Standard',
  expert: 'Expert',
};

export const gateScoreBenchmarkByComplexity = (
  tier: ComplexityTier,
  state: IScoreBenchmarkStateResult
): IScoreBenchmarkComplexityProjection => ({
  tier,
  mode: modeByTier[tier],
  showFilters: tier === 'expert',
  showDiagnostics: tier === 'expert' || state.hasLossRiskOverlap,
});
