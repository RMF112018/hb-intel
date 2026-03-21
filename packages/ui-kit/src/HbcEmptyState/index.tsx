/**
 * HbcEmptyState — Zero-data states with icon/illustration + dual CTAs
 * Blueprint §1d — centered layout, fadeIn + slideInUp entrance
 * PH4.6 §Step 4 — Replace Fluent CSS vars with HBC tokens
 * PH4.9 §Step 5 — icon alias, heading-3 typography (UIF-011), dual action row
 */
import * as React from 'react';
import { mergeClasses, tokens } from '@fluentui/react-components';
import { makeStyles } from '@griffel/react';
import { keyframes, TRANSITION_NORMAL } from '../theme/animations.js';
import { heading3 } from '../theme/typography.js';
import type { HbcEmptyStateProps } from './types.js';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    paddingTop: '48px',
    paddingBottom: '48px',
    paddingLeft: '24px',
    paddingRight: '24px',
    gap: '16px',
    animationName: {
      from: { transform: 'translateY(16px)', opacity: 0 },
      to: { transform: 'translateY(0)', opacity: 1 },
    },
    animationDuration: TRANSITION_NORMAL,
    animationFillMode: 'forwards',
    '@media (prefers-reduced-motion: reduce)': {
      animationDuration: '0ms',
    },
  },
  illustration: {
    marginBottom: '8px',
    opacity: 0,
    animationName: keyframes.fadeIn,
    animationDuration: TRANSITION_NORMAL,
    animationDelay: '100ms',
    animationFillMode: 'forwards',
    '@media (prefers-reduced-motion: reduce)': {
      animationDuration: '0ms',
    },
  },
  title: {
    // UIF-011: heading3 (1rem/600) instead of heading2 (1.25rem/600) so empty
    // state headings are visually subordinate to page and card titles.
    ...heading3,
    color: tokens.colorNeutralForeground1,
    margin: '0',
  },
  description: {
    fontSize: '0.875rem',
    color: tokens.colorNeutralForeground3,
    margin: '0',
    maxWidth: '400px',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginTop: '8px',
  },
});

export const HbcEmptyState: React.FC<HbcEmptyStateProps> = ({
  title,
  description,
  icon,
  illustration,
  primaryAction,
  secondaryAction,
  action,
  className,
}) => {
  const styles = useStyles();

  // Backward compat: icon ?? illustration, primaryAction ?? action
  const resolvedIcon = icon ?? illustration;
  const resolvedPrimary = primaryAction ?? action;

  return (
    <div data-hbc-ui="empty-state" className={mergeClasses(styles.root, className)}>
      {resolvedIcon && (
        <div className={styles.illustration}>{resolvedIcon}</div>
      )}
      <h2 className={styles.title}>{title}</h2>
      {description && <p className={styles.description}>{description}</p>}
      {(resolvedPrimary || secondaryAction) && (
        <div className={styles.actions}>
          {resolvedPrimary}
          {secondaryAction}
        </div>
      )}
    </div>
  );
};

export type { HbcEmptyStateProps } from './types.js';
