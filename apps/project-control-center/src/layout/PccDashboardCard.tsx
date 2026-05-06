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

function resolveCardTier(
  explicitTier: PccCardTier | undefined,
  hierarchy: 'primary' | 'standard' | 'supporting',
): PccCardTier {
  if (explicitTier) return explicitTier;
  if (hierarchy === 'primary') return 'tier1';
  if (hierarchy === 'supporting') return 'tier3';
  return 'tier2';
}

function resolveCardRegion(
  explicitRegion: PccCardRegion | undefined,
  tier: PccCardTier,
): PccCardRegion {
  if (explicitRegion) return explicitRegion;
  if (tier === 'tier1') return 'command';
  if (tier === 'state') return 'state';
  if (tier === 'tier3') return 'reference';
  return 'operational';
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
  const resolvedTier = resolveCardTier(tier, hierarchy);
  const resolvedRegion = resolveCardRegion(region, resolvedTier);
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
      data-pcc-card-region={resolvedRegion}
      data-pcc-card-density={density}
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
