/**
 * SF28-T06 — ActivityEmptyState.
 *
 * Empty/degraded state messaging for activity timeline.
 * 4 variants: no-activity, no-results, degraded, loading.
 * Reduces confusion with contextual guidance.
 *
 * Governing: SF28-T06, L-08
 */
import React from 'react';

export type ActivityEmptyStateVariant =
  | 'no-activity'
  | 'no-results'
  | 'degraded'
  | 'loading';

export interface ActivityEmptyStateProps {
  /** Which empty state variant to show */
  variant: ActivityEmptyStateVariant;
  /** Optional degradation message (for 'degraded' variant) */
  degradationMessage?: string;
  /** Handler for retry action (for 'degraded' variant) */
  onRetry?: () => void;
  /** Handler for reset filters action (for 'no-results' variant) */
  onResetFilters?: () => void;
}

const MESSAGES: Record<ActivityEmptyStateVariant, { heading: string; body: string }> = {
  'no-activity': {
    heading: 'No activity yet',
    body: 'Activity will appear here as changes are made to project records.',
  },
  'no-results': {
    heading: 'No matching activity',
    body: 'No events match your current filters. Try broadening your search.',
  },
  'degraded': {
    heading: 'Activity temporarily unavailable',
    body: 'Some activity sources could not be reached. Displayed data may be incomplete.',
  },
  'loading': {
    heading: 'Loading activity',
    body: 'Fetching recent project activity...',
  },
};

const containerStyle: React.CSSProperties = {
  padding: '24px 16px',
  textAlign: 'center',
  fontFamily: 'inherit',
  color: '#666',
};

const headingStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  marginBottom: 4,
  color: '#444',
};

const bodyStyle: React.CSSProperties = {
  fontSize: 12,
  marginBottom: 8,
};

const actionStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#0078d4',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
};

export function ActivityEmptyState({
  variant,
  degradationMessage,
  onRetry,
  onResetFilters,
}: ActivityEmptyStateProps): React.ReactElement {
  const { heading, body } = MESSAGES[variant];

  return (
    <div data-testid="activity-empty-state" data-variant={variant} style={containerStyle}>
      <div style={headingStyle}>{heading}</div>
      <div style={bodyStyle}>{variant === 'degraded' && degradationMessage ? degradationMessage : body}</div>

      {variant === 'no-results' && onResetFilters && (
        <button type="button" data-testid="reset-filters-action" style={actionStyle} onClick={onResetFilters}>
          Reset filters
        </button>
      )}

      {variant === 'degraded' && onRetry && (
        <button type="button" data-testid="retry-action" style={actionStyle} onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
