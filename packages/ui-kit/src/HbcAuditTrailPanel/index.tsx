/**
 * HbcAuditTrailPanel — Expert-gated audit trail panel
 * D-SF03-T07 / D-08: internal default gate + complexityMinTier/maxTier override props
 *
 * Polished panel shell with header. Full audit entry rendering deferred
 * to module phases (no entries data prop in the current contract).
 */
import * as React from 'react';
import { makeStyles } from '@griffel/react';
import { useComplexityGate } from '@hbc/complexity';
import { HBC_SURFACE_LIGHT } from '../theme/tokens.js';
import { HBC_RADIUS_LG } from '../theme/radii.js';
import { elevationLevel1 } from '../theme/elevation.js';
import { HBC_SPACE_SM, HBC_SPACE_MD, HBC_SPACE_XL } from '../theme/grid.js';
import type { HbcAuditTrailPanelProps } from './types.js';

const useStyles = makeStyles({
  root: {
    backgroundColor: HBC_SURFACE_LIGHT['surface-0'],
    border: `1px solid ${HBC_SURFACE_LIGHT['border-default']}`,
    borderRadius: HBC_RADIUS_LG,
    boxShadow: elevationLevel1,
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: `${HBC_SPACE_SM}px ${HBC_SPACE_MD}px`,
    backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    borderBottom: `1px solid ${HBC_SURFACE_LIGHT['border-default']}`,
  },
  title: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: HBC_SURFACE_LIGHT['text-primary'],
    margin: '0',
  },
  body: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: `${HBC_SPACE_XL}px`,
    paddingBottom: `${HBC_SPACE_XL}px`,
    color: HBC_SURFACE_LIGHT['text-muted'],
    fontSize: '0.875rem',
  },
});

export function HbcAuditTrailPanel({
  itemId,
  maxItems = 20,
  complexityMinTier = 'expert',
  complexityMaxTier,
}: HbcAuditTrailPanelProps): React.ReactElement | null {
  const styles = useStyles();
  const isVisible = useComplexityGate({
    minTier: complexityMinTier,
    maxTier: complexityMaxTier,
  });

  if (!isVisible) return null;

  return (
    <div
      data-hbc-ui="HbcAuditTrailPanel"
      data-item-id={itemId}
      data-max-items={maxItems}
      className={styles.root}
      role="log"
      aria-label="Audit trail"
    >
      <div className={styles.header}>
        <h3 className={styles.title}>Audit Trail</h3>
      </div>
      <div className={styles.body}>
        No audit entries
      </div>
    </div>
  );
}

export type { HbcAuditTrailPanelProps } from './types.js';
