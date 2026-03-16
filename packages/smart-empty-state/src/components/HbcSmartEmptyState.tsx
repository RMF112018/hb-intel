import { useId, useCallback } from 'react';
import type { ReactElement } from 'react';
import { makeStyles, mergeClasses, shorthands } from '@griffel/react';
import { useComplexity } from '@hbc/complexity';
import {
  HBC_SURFACE_LIGHT,
  HBC_SPACE_XS,
  HBC_SPACE_SM,
  HBC_SPACE_MD,
  HBC_SPACE_LG,
  HBC_SPACE_XL,
  HBC_RADIUS_LG,
  HBC_RADIUS_MD,
  HBC_PRIMARY_BLUE,
} from '@hbc/ui-kit/theme';
import { useEmptyState } from '../hooks/useEmptyState.js';
import { HbcEmptyStateIllustration } from './HbcEmptyStateIllustration.js';
import { EMPTY_STATE_COACHING_COLLAPSE_LABEL } from '../constants/emptyStateDefaults.js';
import type {
  EmptyStateClassification,
  EmptyStateVariant,
  IEmptyStateAction,
  IEmptyStateContext,
  ISmartEmptyStateConfig,
} from '../types/ISmartEmptyState.js';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  fullPage: {
    paddingTop: `${HBC_SPACE_XL}px`,
    paddingRight: `${HBC_SPACE_XL}px`,
    paddingBottom: `${HBC_SPACE_XL}px`,
    paddingLeft: `${HBC_SPACE_XL}px`,
    minHeight: '60vh',
    justifyContent: 'center',
  },
  inline: {
    paddingTop: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    paddingBottom: `${HBC_SPACE_MD}px`,
    paddingLeft: `${HBC_SPACE_MD}px`,
  },
  card: {
    backgroundColor: HBC_SURFACE_LIGHT['surface-0'],
    borderRadius: HBC_RADIUS_LG,
    paddingTop: `${HBC_SPACE_LG}px`,
    paddingRight: `${HBC_SPACE_LG}px`,
    paddingBottom: `${HBC_SPACE_LG}px`,
    paddingLeft: `${HBC_SPACE_LG}px`,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  heading: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: HBC_SURFACE_LIGHT['text-primary'],
    marginTop: '0',
    marginRight: '0',
    marginBottom: '0',
    marginLeft: '0',
  },
  description: {
    fontSize: '0.875rem',
    color: HBC_SURFACE_LIGHT['text-muted'],
    marginTop: '0',
    marginRight: '0',
    marginBottom: '0',
    marginLeft: '0',
  },
  actions: {
    display: 'flex',
    flexDirection: 'row',
    gap: `${HBC_SPACE_SM}px`,
    justifyContent: 'center',
    marginTop: `${HBC_SPACE_MD}px`,
  },
  action: {
    color: HBC_PRIMARY_BLUE,
    borderRadius: HBC_RADIUS_MD,
    backgroundColor: 'transparent',
    ...shorthands.borderStyle('none'),
    cursor: 'pointer',
    paddingTop: `${HBC_SPACE_XS}px`,
    paddingRight: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_XS}px`,
    paddingLeft: `${HBC_SPACE_SM}px`,
    textDecorationLine: 'none',
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  coaching: {
    backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    borderRadius: HBC_RADIUS_LG,
    paddingTop: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    paddingBottom: `${HBC_SPACE_MD}px`,
    paddingLeft: `${HBC_SPACE_MD}px`,
    marginTop: `${HBC_SPACE_MD}px`,
  },
  coachingDisclosure: {
    backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    borderRadius: HBC_RADIUS_LG,
    paddingTop: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    paddingBottom: `${HBC_SPACE_MD}px`,
    paddingLeft: `${HBC_SPACE_MD}px`,
    marginTop: `${HBC_SPACE_MD}px`,
  },
  illustration: {
    marginBottom: `${HBC_SPACE_MD}px`,
  },
});

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
  const styles = useStyles();

  const fireAction = useCallback(
    (action: IEmptyStateAction) => {
      action.onClick?.();
      onActionFired?.(action.label, classification);
    },
    [onActionFired, classification],
  );

  const variantClass =
    variant === 'full-page'
      ? styles.fullPage
      : variant === 'inline'
        ? styles.inline
        : styles.card;

  const renderAction = (action: IEmptyStateAction): ReactElement => {
    if (action.href) {
      return (
        <a
          key={action.label}
          href={action.href}
          className={styles.action}
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
        className={styles.action}
        onClick={() => fireAction(action)}
      >
        {action.label}
      </button>
    );
  };

  const renderCoachingTip = (): ReactElement | null => {
    if (!resolved.coachingTip) return null;

    if (tier === 'essential') {
      return <p className={styles.coaching}>{resolved.coachingTip}</p>;
    }

    if (tier === 'standard') {
      return (
        <details className={styles.coachingDisclosure}>
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
      className={mergeClasses(styles.root, variantClass)}
    >
      <div className={styles.illustration}>
        <HbcEmptyStateIllustration
          classification={classification}
          illustrationKey={resolved.illustration}
          size={variant === 'full-page' ? 'lg' : 'sm'}
        />
      </div>

      <div className={styles.content}>
        <h2 id={headingId} className={styles.heading}>
          {resolved.heading}
        </h2>

        <p id={descriptionId} className={styles.description}>
          {resolved.description}
        </p>

        {renderCoachingTip()}

        <div className={styles.actions}>
          {resolved.primaryAction && renderAction(resolved.primaryAction)}
          {resolved.secondaryAction && renderAction(resolved.secondaryAction)}
          {classification === 'filter-empty' &&
            resolved.filterClearAction &&
            renderAction(resolved.filterClearAction)}
        </div>
      </div>
    </section>
  );
}
