/**
 * HubZoneLayout — P2-D2 adaptive layout, P2-B4 cross-device, UIF-015 breakpoints.
 *
 * All breakpoints use canonical HBC_BREAKPOINT_* tokens from @hbc/ui-kit.
 * No hardcoded pixel breakpoints (MB-08). No fixed pixel widths (MB-04).
 * SPFx-safe: uses percentage/flex/grid-fraction widths only.
 *
 * Responsive tiers per UIF-015:
 *   Desktop (≥1200px / HBC_BREAKPOINT_DESKTOP): full two-column 7fr 5fr
 *   Tablet  (1024–1199px / HBC_BREAKPOINT_SIDEBAR–CONTENT_MEDIUM): two-column 3fr 2fr
 *   Below tablet (768–1023px): single-column stack
 *   Mobile  (≤767px / HBC_BREAKPOINT_MOBILE): single-column, tighter gap
 *
 * UIF-002: Master-detail — selected item shows detail panel in right column,
 *   replacing secondary/tertiary zones.
 *
 * UIF-016: At narrow viewports (<HBC_BREAKPOINT_SIDEBAR), rightPanel uses
 *   display:contents so its children become direct grid items. CSS order
 *   floats secondaryZone (Insights/KPI) above primaryZone and sinks
 *   tertiaryZone (Quick Access) below — KPI summary is visible before the
 *   feed without scrolling. Sticky right panel is only active at desktop tier.
 */
import type { ReactNode } from 'react';
import { makeStyles, shorthands } from '@griffel/react';
import {
  HBC_BREAKPOINT_MOBILE,
  HBC_BREAKPOINT_SIDEBAR,
  HBC_BREAKPOINT_CONTENT_MEDIUM,
  HBC_BREAKPOINT_DESKTOP,
} from '@hbc/ui-kit';

export interface HubZoneLayoutProps {
  primaryContent: ReactNode;
  secondaryContent?: ReactNode;
  tertiaryContent?: ReactNode;
  /** When provided, replaces secondary/tertiary in the right panel (item detail). */
  detailContent?: ReactNode;
  /**
   * UIF-008: Signal that the right panel has real content to display.
   *
   * When false, the right panel div is omitted and the grid collapses to a
   * single column via an inline style override (which wins over Griffel's
   * media-query class rules). Primary zone then gets full viewport width.
   *
   * Callers should pass `false` when both secondary/tertiary zones render
   * only empty states or are hidden by complexity tier.
   *
   * Defaults to `true` to preserve existing layout behaviour when not set.
   */
  hasRightPanelContent?: boolean;
}

const useStyles = makeStyles({
  hubGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    ...shorthands.gap('24px'),
    width: '100%',
    // Tablet tier: two-column with narrower right panel
    [`@media (min-width: ${HBC_BREAKPOINT_SIDEBAR}px) and (max-width: ${HBC_BREAKPOINT_CONTENT_MEDIUM}px)`]: {
      gridTemplateColumns: '3fr 2fr',
    },
    // Desktop tier: full two-column master-detail
    [`@media (min-width: ${HBC_BREAKPOINT_DESKTOP}px)`]: {
      gridTemplateColumns: '7fr 5fr',
    },
    [`@media (max-width: ${HBC_BREAKPOINT_MOBILE}px)`]: {
      ...shorthands.gap('16px'),
    },
  },
  primaryZone: {
    gridColumn: '1 / -1',
    minHeight: '400px',
    // UIF-016: explicit order keeps primary between insights (−1) and
    // quick-access (+1) in the narrow single-column stack.
    order: 0,
    // Tablet + Desktop: primary takes left column
    [`@media (min-width: ${HBC_BREAKPOINT_SIDEBAR}px)`]: {
      gridColumn: '1 / 2',
    },
    [`@media (max-width: ${HBC_BREAKPOINT_MOBILE}px)`]: {
      minHeight: 'auto',
    },
  },
  // UIF-016: At narrow viewports rightPanel is display:contents — the element
  // box is removed from layout and its children become direct grid items of
  // hubGrid. This allows secondaryZone and tertiaryZone to be independently
  // ordered relative to primaryZone via CSS order.
  // At ≥SIDEBAR the panel is restored as a flex column in the right grid cell,
  // and at ≥DESKTOP it becomes sticky.
  rightPanel: {
    display: 'contents',
    // Tablet+: restore as a flex column in the right grid column
    [`@media (min-width: ${HBC_BREAKPOINT_SIDEBAR}px)`]: {
      display: 'flex',
      flexDirection: 'column',
      gridColumn: '2 / 3',
      ...shorthands.gap('0px'),
    },
    // Desktop: sticky right panel
    [`@media (min-width: ${HBC_BREAKPOINT_DESKTOP}px)`]: {
      position: 'sticky' as const,
      top: '24px',
      alignSelf: 'start',
      maxHeight: 'calc(100vh - 120px)',
      overflowY: 'auto',
    },
  },
  // UIF-003: Zones render a single HbcCard each; no grid needed here.
  // UIF-016: At narrow widths, secondaryZone (Insights/KPI) floats above
  // primaryZone via order:-1. Reset to 0 at ≥SIDEBAR where the right panel
  // resumes its flex-column layout and ordering is irrelevant.
  secondaryZone: {
    display: 'block',
    order: -1,
    [`@media (min-width: ${HBC_BREAKPOINT_SIDEBAR}px)`]: {
      order: 0,
    },
  },
  // UIF-016: At narrow widths, tertiaryZone (Quick Access) sinks below
  // primaryZone via order:1 so the feed stays between KPI and actions.
  tertiaryZone: {
    display: 'block',
    order: 1,
    [`@media (min-width: ${HBC_BREAKPOINT_SIDEBAR}px)`]: {
      order: 0,
    },
  },
});

export function HubZoneLayout({
  primaryContent,
  secondaryContent,
  tertiaryContent,
  detailContent,
  hasRightPanelContent = true,
}: HubZoneLayoutProps): ReactNode {
  const styles = useStyles();

  // UIF-008: When the right panel has no real content, collapse the grid to a
  // single column so the primary feed gets the full viewport width. The inline
  // style overrides Griffel's media-query class rules (inline > stylesheet).
  const rightPanelVisible = hasRightPanelContent || !!detailContent;
  const gridOverride = rightPanelVisible
    ? undefined
    : { gridTemplateColumns: '1fr' };

  return (
    <div className={styles.hubGrid} style={gridOverride} data-spfx-safe="true">
      <section className={styles.primaryZone} data-hub-zone="primary">
        {primaryContent}
      </section>

      {rightPanelVisible && (
        <div className={styles.rightPanel}>
          {detailContent ?? (
            <>
              {secondaryContent ? (
                <section className={styles.secondaryZone} data-hub-zone="secondary">
                  {secondaryContent}
                </section>
              ) : null}

              {tertiaryContent ? (
                <section className={styles.tertiaryZone} data-hub-zone="tertiary">
                  {tertiaryContent}
                </section>
              ) : null}
            </>
          )}
        </div>
      )}
    </div>
  );
}
