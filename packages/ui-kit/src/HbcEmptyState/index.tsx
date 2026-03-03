/**
 * HbcEmptyState — Zero-data states with illustration + CTA
 * Blueprint §1d — centered layout, fadeIn + slideInUp entrance
 */
import * as React from 'react';
import { mergeClasses } from '@fluentui/react-components';
import { makeStyles } from '@griffel/react';
import { keyframes, TRANSITION_NORMAL } from '../theme/animations.js';
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
  },
  illustration: {
    marginBottom: '8px',
    opacity: 0,
    animationName: keyframes.fadeIn,
    animationDuration: TRANSITION_NORMAL,
    animationDelay: '100ms',
    animationFillMode: 'forwards',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: 'var(--colorNeutralForeground1)',
    margin: '0',
  },
  description: {
    fontSize: '0.875rem',
    color: 'var(--colorNeutralForeground3)',
    margin: '0',
    maxWidth: '400px',
  },
  action: {
    marginTop: '8px',
  },
});

export const HbcEmptyState: React.FC<HbcEmptyStateProps> = ({
  title,
  description,
  illustration,
  action,
  className,
}) => {
  const styles = useStyles();

  return (
    <div data-hbc-ui="empty-state" className={mergeClasses(styles.root, className)}>
      {illustration && (
        <div className={styles.illustration}>{illustration}</div>
      )}
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
};

export type { HbcEmptyStateProps } from './types.js';
