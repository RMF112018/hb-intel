import type { ISuggestedIntelligenceMatch } from '@hbc/strategic-intelligence';

export interface SuggestedIntelligenceCardProps {
  suggestion: ISuggestedIntelligenceMatch;
}

export const SuggestedIntelligenceCard = ({ suggestion }: SuggestedIntelligenceCardProps) => (
  <article data-testid="suggested-intelligence-card">
    <h4>{suggestion.suggestionId}</h4>
    <p>{suggestion.reason}</p>
  </article>
);
