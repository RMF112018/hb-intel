/**
 * HbcCoachingCallout — Coaching prompt, Essential–Standard by default
 * D-SF03-T07 / D-08: internal default gate with maxTier='standard' (Expert users see no coaching).
 * D-07: also checks showCoaching from IComplexityContext.
 */
import * as React from 'react';
import { makeStyles } from '@griffel/react';
import { useComplexity, useComplexityGate } from '@hbc/complexity';
import { HBC_STATUS_COLORS, HBC_SURFACE_LIGHT, HBC_PRIMARY_BLUE } from '../theme/tokens.js';
import { HBC_RADIUS_LG, HBC_RADIUS_MD } from '../theme/radii.js';
import { elevationLevel1 } from '../theme/elevation.js';
import { HBC_SPACE_XS, HBC_SPACE_SM, HBC_SPACE_MD } from '../theme/grid.js';
import type { HbcCoachingCalloutProps } from './types.js';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: `${HBC_SPACE_SM}px`,
    padding: `${HBC_SPACE_MD}px`,
    backgroundColor: HBC_SURFACE_LIGHT['surface-1'],
    borderLeft: `${HBC_SPACE_XS}px solid ${HBC_STATUS_COLORS.info}`,
    borderRadius: HBC_RADIUS_LG,
    boxShadow: elevationLevel1,
  },
  message: {
    flex: '1 1 auto',
    margin: '0',
    fontSize: '0.875rem',
    color: HBC_SURFACE_LIGHT['text-primary'],
    lineHeight: '1.5',
  },
  action: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: HBC_PRIMARY_BLUE,
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: HBC_RADIUS_MD,
    cursor: 'pointer',
    padding: `${HBC_SPACE_XS}px ${HBC_SPACE_SM}px`,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
});

export function HbcCoachingCallout({
  message,
  actionLabel,
  onAction,
  complexityMinTier = 'essential',
  complexityMaxTier = 'standard',
}: HbcCoachingCalloutProps): React.ReactElement | null {
  const styles = useStyles();
  const { showCoaching } = useComplexity();
  const isVisible = useComplexityGate({
    minTier: complexityMinTier,
    maxTier: complexityMaxTier,
  });

  if (!isVisible || !showCoaching) return null;

  return (
    <div data-hbc-ui="HbcCoachingCallout" className={styles.root} role="note" aria-label="Guidance">
      <p className={styles.message}>{message}</p>
      {actionLabel && onAction && (
        <button className={styles.action} onClick={onAction} type="button">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export type { HbcCoachingCalloutProps } from './types.js';
