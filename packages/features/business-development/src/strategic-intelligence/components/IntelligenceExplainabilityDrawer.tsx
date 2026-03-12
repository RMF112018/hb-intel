import type { ISuggestedIntelligenceMatch } from '@hbc/strategic-intelligence';

export interface IntelligenceExplainabilityDrawerProps {
  suggestion: Pick<
    ISuggestedIntelligenceMatch,
    'suggestionId' | 'reason' | 'matchedDimensions' | 'reuseHistoryCount'
  >;
  isOpen?: boolean;
  onClose?: () => void;
}

export const IntelligenceExplainabilityDrawer = ({
  suggestion,
  isOpen = true,
  onClose,
}: IntelligenceExplainabilityDrawerProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <aside
      data-testid="intelligence-explainability-drawer"
      role="dialog"
      aria-label="Strategic intelligence explainability"
      aria-modal="false"
    >
      <header>
        <h3>Explainability</h3>
        <button type="button" onClick={onClose} aria-label="Close explainability drawer">
          Close
        </button>
      </header>
      <p>Suggestion ID: {suggestion.suggestionId}</p>
      <p>Why shown: {suggestion.reason}</p>
      <p>Matched metadata: {suggestion.matchedDimensions.join(', ') || 'None'}</p>
      <p>Reuse history: {suggestion.reuseHistoryCount}</p>
    </aside>
  );
};
