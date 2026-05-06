import { useId, type CSSProperties, type FC, type JSX, type ReactNode } from 'react';
import {
  FOOTPRINT_MIN_INLINE_SIZE_PX,
  resolveFootprintColumnSpan,
  type PccCardFootprint,
} from './footprints';
import { usePccBentoContext } from './PccBentoGrid';
import { useBentoRowSpan } from './useBentoRowSpan';
import styles from './PccDashboardCard.module.css';

export type PccCardTier = 'tier1' | 'tier2' | 'tier3' | 'state';

export type PccCardRegion =
  | 'command'
  | 'operational'
  | 'reference'
  | 'state'
  | 'deferred'
  | 'detail'
  | 'rail';

export interface PccDashboardCardProps {
  footprint?: PccCardFootprint;
  hierarchy?: 'primary' | 'standard' | 'supporting';
  tier?: PccCardTier;
  region?: PccCardRegion;
  density?: 'comfortable' | 'compact';
  title?: string;
  eyebrow?: string;
  action?: ReactNode;
  children: ReactNode;
  /** Optional `aria-label`-style description for assistive tech. */
  ariaLabel?: string;
  /** Optional `aria-describedby` id reference for assistive tech. */
  ariaDescribedBy?: string;
  /** Heading element level for the visible card title. Defaults from tier. */
  headingLevel?: 2 | 3 | 4;
  /**
   * Optional active-surface marker. When set, the card emits
   * `data-pcc-active-surface-panel="<id>"` on the same `<article>` so tests
   * and integration code can locate the active surface panel without an
   * extra DOM wrapper that would break the bento grid invariant.
   */
  dataActiveSurfacePanel?: string;
}

export type PccCardTierSource = 'explicit' | 'hierarchy' | 'default';
export type PccCardRegionSource = 'explicit' | 'resolved';

function resolveCardTier(
  explicitTier: PccCardTier | undefined,
  hierarchy: 'primary' | 'standard' | 'supporting',
): { tier: PccCardTier; source: PccCardTierSource } {
  if (explicitTier) return { tier: explicitTier, source: 'explicit' };
  if (hierarchy === 'primary') return { tier: 'tier1', source: 'hierarchy' };
  if (hierarchy === 'supporting') return { tier: 'tier3', source: 'hierarchy' };
  return { tier: 'tier2', source: 'default' };
}

function resolveCardRegion(
  explicitRegion: PccCardRegion | undefined,
  tier: PccCardTier,
): { region: PccCardRegion; source: PccCardRegionSource } {
  if (explicitRegion) return { region: explicitRegion, source: 'explicit' };
  if (tier === 'tier1') return { region: 'command', source: 'resolved' };
  if (tier === 'state') return { region: 'state', source: 'resolved' };
  if (tier === 'tier3') return { region: 'reference', source: 'resolved' };
  return { region: 'operational', source: 'resolved' };
}

function resolveHeadingLevel(
  explicitHeadingLevel: 2 | 3 | 4 | undefined,
  tier: PccCardTier,
): 2 | 3 | 4 {
  if (explicitHeadingLevel) return explicitHeadingLevel;
  if (tier === 'tier1') return 2;
  return 3;
}

export const PccDashboardCard: FC<PccDashboardCardProps> = ({
  footprint = 'standard',
  hierarchy = 'standard',
  tier,
  region,
  density = 'comfortable',
  title,
  eyebrow,
  action,
  children,
  ariaLabel,
  ariaDescribedBy,
  headingLevel,
  dataActiveSurfacePanel,
}) => {
  const { mode } = usePccBentoContext();
  const { ref, rowSpan, measuredHeight } = useBentoRowSpan();
  const columnSpan = resolveFootprintColumnSpan(mode, footprint);
  const minInlineSize = FOOTPRINT_MIN_INLINE_SIZE_PX[mode][footprint];

  const headingId = useId();
  const { tier: resolvedTier, source: tierSource } = resolveCardTier(tier, hierarchy);
  const { region: resolvedRegion, source: regionSource } = resolveCardRegion(region, resolvedTier);
  const resolvedHeadingLevel = resolveHeadingLevel(headingLevel, resolvedTier);
  const HeadingTag = `h${resolvedHeadingLevel}` as keyof JSX.IntrinsicElements;

  const style: CSSProperties = {
    gridColumn: `span ${columnSpan}`,
    gridRow: `span ${rowSpan}`,
    minInlineSize: minInlineSize > 0 ? `${minInlineSize}px` : undefined,
  };

  return (
    <article
      className={styles.card}
      data-pcc-card=""
      data-pcc-footprint={footprint}
      data-pcc-card-hierarchy={hierarchy}
      data-pcc-card-tier={resolvedTier}
      data-pcc-card-tier-source={tierSource}
      data-pcc-card-region={resolvedRegion}
      data-pcc-card-region-source={regionSource}
      data-pcc-card-density={density}
      data-pcc-heading-level={String(resolvedHeadingLevel)}
      data-pcc-mode={mode}
      data-pcc-column-span={columnSpan}
      data-pcc-row-span={rowSpan}
      data-pcc-measured-height={measuredHeight}
      data-pcc-active-surface-panel={dataActiveSurfacePanel}
      style={style}
      aria-labelledby={title ? headingId : undefined}
      aria-label={!title ? ariaLabel : undefined}
      aria-describedby={ariaDescribedBy}
    >
      <div ref={ref} className={styles.body}>
        {eyebrow || title || action ? (
          <header className={styles.header}>
            <div className={styles.titleStack}>
              {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
              {title ? (
                <HeadingTag id={headingId} className={styles.title}>
                  {title}
                </HeadingTag>
              ) : null}
            </div>
            {action ? <div className={styles.action}>{action}</div> : null}
          </header>
        ) : null}
        <div className={styles.content}>{children}</div>
      </div>
    </article>
  );
};

export default PccDashboardCard;
