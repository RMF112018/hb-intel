/**
 * HubTertiaryZone — P2-D2 §2: utility/quick-access zone.
 *
 * G0 — P2-F1 §2.2: Renders utility tiles via @hbc/project-canvas tile
 * registry through MyWorkCanvas. Quick action shortcuts and recent context.
 *
 * UIF-003: Wrapped in HbcCard weight="supporting" to give Quick Access a
 * distinct visual surface that recedes behind Insights. The 12-column tile
 * grid moves inside the card body so tile spans still work.
 *
 * UIF-016: At narrow viewports (<HBC_BREAKPOINT_SIDEBAR) Quick Access
 * degrades to a native <details>/<summary> disclosure. The card chrome is
 * replaced by a lightweight collapsed widget so the primary feed and Insights
 * KPI row dominate the narrow-width viewport. At ≥1024px the full card
 * renders unchanged.
 *
 * Hidden at essential tier. All roles have access per P2-D1 §5.
 */
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { makeStyles, shorthands } from '@griffel/react';
import { HbcCard, heading3, HBC_BREAKPOINT_MOBILE, HBC_BREAKPOINT_TABLET } from '@hbc/ui-kit';
import { useComplexity } from '@hbc/complexity';
import { MyWorkCanvas } from './tiles/index.js';

const useStyles = makeStyles({
  // UIF-003: heading is now the card header — gridColumn and spacing no longer needed.
  heading: {
    ...heading3,
    color: 'var(--colorNeutralForeground1)',
    margin: '0',
  },
  // INS-004: Clean 2-column grid replaces the 12-column micro-grid.
  // Responsive: single-column on mobile (≤767px).
  tileGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    [`@media (max-width: ${HBC_BREAKPOINT_MOBILE}px)`]: {
      gridTemplateColumns: '1fr',
    },
  },
  // UIF-016: <details> disclosure wrapper used at narrow viewports.
  disclosure: {
    width: '100%',
    ...shorthands.borderRadius('8px'),
    ...shorthands.border('1px', 'solid', 'var(--colorNeutralStroke2)'),
    backgroundColor: 'var(--colorNeutralBackground2)',
    overflow: 'hidden',
  },
  // UIF-016: <summary> acts as the collapsed header for the Quick Access disclosure.
  disclosureSummary: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.padding('12px', '16px'),
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--colorNeutralForeground1)',
    listStyle: 'none',
    // Remove default disclosure triangle in webkit
    '::-webkit-details-marker': {
      display: 'none',
    },
    '::marker': {
      display: 'none',
    },
    ':hover': {
      backgroundColor: 'var(--colorNeutralBackground2Hover)',
    },
  },
  disclosureBody: {
    ...shorthands.padding('0', '16px', '16px'),
  },
  disclosureArrow: {
    marginLeft: 'auto',
    fontSize: '12px',
    color: 'var(--colorNeutralForeground3)',
    // Rotate when details is open
    'details[open] &': {
      transform: 'rotate(180deg)',
    },
  },
});

export function HubTertiaryZone(): ReactNode {
  const styles = useStyles();
  const { tier } = useComplexity();

  // UIF-016: Collapse Quick Access to a disclosure widget at narrow viewports
  // (<HBC_BREAKPOINT_SIDEBAR / ≤HBC_BREAKPOINT_TABLET). matchMedia is used
  // instead of a resize handler for efficiency. SSR-safe: starts false.
  const [isNarrow, setIsNarrow] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia(`(max-width: ${HBC_BREAKPOINT_TABLET}px)`);
    setIsNarrow(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsNarrow(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  if (tier === 'essential') return null;

  const tileGrid = (
    <div className={styles.tileGrid}>
      <MyWorkCanvas tilePrefix="my-work.utility" complexityTier={tier} />
    </div>
  );

  if (isNarrow) {
    return (
      <details className={styles.disclosure}>
        <summary className={styles.disclosureSummary}>
          Quick Access
          <span className={styles.disclosureArrow} aria-hidden="true">▾</span>
        </summary>
        <div className={styles.disclosureBody}>{tileGrid}</div>
      </details>
    );
  }

  return (
    <HbcCard
      weight="supporting"
      header={<h3 className={styles.heading}>Quick Access</h3>}
    >
      {tileGrid}
    </HbcCard>
  );
}
