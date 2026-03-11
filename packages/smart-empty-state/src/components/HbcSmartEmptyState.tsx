import { useId, useCallback } from 'react';
import type { ReactElement } from 'react';
import { useComplexity } from '@hbc/complexity';
import { useEmptyState } from '../hooks/useEmptyState.js';
import { EMPTY_STATE_COACHING_COLLAPSE_LABEL } from '../constants/emptyStateDefaults.js';
import type {
  EmptyStateClassification,
  EmptyStateVariant,
  IEmptyStateAction,
  IEmptyStateContext,
  ISmartEmptyStateConfig,
} from '../types/ISmartEmptyState.js';

export interface HbcSmartEmptyStateProps {
  config: ISmartEmptyStateConfig;
  context: IEmptyStateContext;
  variant?: EmptyStateVariant;
  onActionFired?: (actionLabel: string, classification: EmptyStateClassification) => void;
}

export function HbcSmartEmptyState({
  config,
  context,
  variant = 'full-page',
  onActionFired,
}: HbcSmartEmptyStateProps): ReactElement {
  const { classification, resolved } = useEmptyState({ config, context });
  const { tier } = useComplexity();
  const headingId = useId();
  const descriptionId = useId();

  const fireAction = useCallback(
    (action: IEmptyStateAction) => {
      action.onClick?.();
      onActionFired?.(action.label, classification);
    },
    [onActionFired, classification],
  );

  const renderAction = (action: IEmptyStateAction): ReactElement => {
    if (action.href) {
      return (
        <a
          key={action.label}
          href={action.href}
          className="hbc-empty-state__action"
          onClick={() => fireAction(action)}
        >
          {action.label}
        </a>
      );
    }
    return (
      <button
        key={action.label}
        type="button"
        className="hbc-empty-state__action"
        onClick={() => fireAction(action)}
      >
        {action.label}
      </button>
    );
  };

  const renderCoachingTip = (): ReactElement | null => {
    if (!resolved.coachingTip) return null;

    if (tier === 'essential') {
      return <p className="hbc-empty-state__coaching">{resolved.coachingTip}</p>;
    }

    if (tier === 'standard') {
      return (
        <details className="hbc-empty-state__coaching-disclosure">
          <summary>{EMPTY_STATE_COACHING_COLLAPSE_LABEL}</summary>
          <p>{resolved.coachingTip}</p>
        </details>
      );
    }

    // expert tier — suppress coaching
    return null;
  };

  return (
    <section
      role="region"
      aria-labelledby={headingId}
      aria-describedby={descriptionId}
      data-variant={variant}
      data-classification={classification}
      className={`hbc-empty-state hbc-empty-state--${variant}`}
    >
      <span
        className="hbc-empty-state__icon"
        data-classification={classification}
        aria-hidden="true"
      />

      <h2 id={headingId} className="hbc-empty-state__heading">
        {resolved.heading}
      </h2>

      <p id={descriptionId} className="hbc-empty-state__description">
        {resolved.description}
      </p>

      {renderCoachingTip()}

      <div className="hbc-empty-state__actions">
        {resolved.primaryAction && renderAction(resolved.primaryAction)}
        {resolved.secondaryAction && renderAction(resolved.secondaryAction)}
        {classification === 'filter-empty' &&
          resolved.filterClearAction &&
          renderAction(resolved.filterClearAction)}
      </div>
    </section>
  );
}
