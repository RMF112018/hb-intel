import type { ComplexityTier } from '@hbc/complexity';
import type { StrategicIntelligenceComplexityMode } from '../components/displayModel.js';

export interface IStrategicIntelligenceComplexityProjection {
  tier: ComplexityTier;
  mode: StrategicIntelligenceComplexityMode;
  showEntryForm: boolean;
  showApprovalQueue: boolean;
  showDiagnostics: boolean;
}

const modeByTier: Record<ComplexityTier, StrategicIntelligenceComplexityMode> = {
  essential: 'Essential',
  standard: 'Standard',
  expert: 'Expert',
};

export const gateStrategicIntelligenceByComplexity = (
  tier: ComplexityTier
): IStrategicIntelligenceComplexityProjection => ({
  tier,
  mode: modeByTier[tier],
  showEntryForm: tier !== 'essential',
  showApprovalQueue: tier === 'expert',
  showDiagnostics: tier === 'expert',
});
