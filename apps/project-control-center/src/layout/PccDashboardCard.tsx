import type { CSSProperties, FC, ReactNode } from 'react';
import { FOOTPRINT_COLUMN_SPANS, type PccCardFootprint } from './footprints';
import { usePccBentoContext } from './PccBentoGrid';
import { useBentoRowSpan } from './useBentoRowSpan';
import styles from './PccDashboardCard.module.css';

export interface PccDashboardCardProps {
  footprint?: PccCardFootprint;
  title?: string;
  eyebrow?: string;
  action?: ReactNode;
  children: ReactNode;
  /** Optional `aria-label`-style description for assistive tech. */
  ariaLabel?: string;
  /**
   * Optional active-surface marker. When set, the card emits
   * `data-pcc-active-surface-panel="<id>"` on the same `<article>` so tests
   * and integration code can locate the active surface panel without an
   * extra DOM wrapper that would break the bento grid invariant.
   */
  dataActiveSurfacePanel?: string;
}

export const PccDashboardCard: FC<PccDashboardCardProps> = ({
  footprint = 'standard',
  title,
  eyebrow,
  action,
  children,
  ariaLabel,
  dataActiveSurfacePanel,
}) => {
  const { mode } = usePccBentoContext();
  const { ref, rowSpan, measuredHeight } = useBentoRowSpan();
  const columnSpan = FOOTPRINT_COLUMN_SPANS[mode][footprint];

  const style: CSSProperties = {
    gridColumn: `span ${columnSpan}`,
    gridRow: `span ${rowSpan}`,
  };

  return (
    <article
      className={styles.card}
      data-pcc-card=""
      data-pcc-footprint={footprint}
      data-pcc-mode={mode}
      data-pcc-column-span={columnSpan}
      data-pcc-row-span={rowSpan}
      data-pcc-measured-height={measuredHeight}
      data-pcc-active-surface-panel={dataActiveSurfacePanel}
      style={style}
      aria-label={ariaLabel ?? title}
    >
      <div ref={ref} className={styles.body}>
        {(eyebrow || title || action) ? (
          <header className={styles.header}>
            <div className={styles.titleStack}>
              {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
              {title ? <h3 className={styles.title}>{title}</h3> : null}
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
