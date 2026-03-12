import type { ISuggestedIntelligenceMatch } from '@hbc/strategic-intelligence';

export interface IntelligenceExplainabilityDrawerProps {
  suggestion: Pick<ISuggestedIntelligenceMatch, 'reason' | 'matchedDimensions'>;
}

export const IntelligenceExplainabilityDrawer = ({
  suggestion,
}: IntelligenceExplainabilityDrawerProps) => (
  <aside data-testid="intelligence-explainability-drawer">
    <h3>Explainability</h3>
    <p>{suggestion.reason}</p>
  </aside>
);
