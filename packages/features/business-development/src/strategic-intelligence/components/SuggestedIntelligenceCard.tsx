import type { ISuggestedIntelligenceMatch } from '@hbc/strategic-intelligence';
import { classifySuggestion } from './displayModel.js';

export type SuggestedIntelligenceAction = 'accepted' | 'dismissed' | 'deferred';

export interface SuggestedIntelligenceCardProps {
  suggestion: ISuggestedIntelligenceMatch;
  onOutcome?: (suggestionId: string, action: SuggestedIntelligenceAction) => void;
  onOpenExplainability?: (suggestionId: string) => void;
}

export const SuggestedIntelligenceCard = ({
  suggestion,
  onOutcome,
  onOpenExplainability,
}: SuggestedIntelligenceCardProps) => {
  const suggestionType = classifySuggestion(suggestion);

  return (
    <article
      data-testid="suggested-intelligence-card"
      aria-label={`${suggestionType} ${suggestion.suggestionId}`}
    >
      <header>
        <p>{suggestionType}</p>
        <h4>{suggestion.entryId}</h4>
      </header>
      <p>{suggestion.reason}</p>
      <p>
        Match score: {Math.round(suggestion.matchScore * 100)}% • Reused{' '}
        {suggestion.reuseHistoryCount} times
      </p>
      <p>Matched dimensions: {suggestion.matchedDimensions.join(', ') || 'None'}</p>
      <div>
        <button
          type="button"
          onClick={() => onOutcome?.(suggestion.suggestionId, 'accepted')}
          aria-label="Accept suggested intelligence"
        >
          Accept
        </button>
        <button
          type="button"
          onClick={() => onOutcome?.(suggestion.suggestionId, 'dismissed')}
          aria-label="Dismiss suggested intelligence"
        >
          Dismiss
        </button>
        <button
          type="button"
          onClick={() => onOutcome?.(suggestion.suggestionId, 'deferred')}
          aria-label="Defer suggested intelligence"
        >
          Defer
        </button>
        <button
          type="button"
          onClick={() => onOpenExplainability?.(suggestion.suggestionId)}
          aria-label="Open suggestion explainability"
        >
          Explainability
        </button>
      </div>
    </article>
  );
};
