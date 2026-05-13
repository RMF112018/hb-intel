import { useId, type CSSProperties, type ReactNode } from 'react';
import type { MyWorkModuleId } from '@hbc/models/myWork';
import { useMyWorkBentoContext } from './MyWorkBentoGrid.js';
import {
  resolveMyWorkCardColumnSpan,
  type MyWorkCardFootprint,
  type MyWorkCardSpanOverrides,
} from './myWorkFootprints.js';
import styles from './MyWorkCard.module.css';

export interface MyWorkCardProps {
  /** Stable per-card identifier — emitted as `data-my-work-card-role`. */
  readonly role: string;
  readonly footprint: MyWorkCardFootprint;
  readonly spanOverrides?: MyWorkCardSpanOverrides;
  readonly title: string;
  readonly eyebrow?: string;
  /** Header-right slot, typically a CTA button. */
  readonly action?: ReactNode;
  readonly module?: MyWorkModuleId;
  readonly extraDataAttributes?: Readonly<Record<string, string>>;
  readonly headingLevel?: 2 | 3 | 4;
  readonly ariaLabel?: string;
  readonly children: ReactNode;
}

const HEADING_TAGS: Record<2 | 3 | 4, 'h2' | 'h3' | 'h4'> = {
  2: 'h2',
  3: 'h3',
  4: 'h4',
};

export function MyWorkCard({
  role,
  footprint,
  spanOverrides,
  title,
  eyebrow,
  action,
  module,
  extraDataAttributes,
  headingLevel = 3,
  ariaLabel,
  children,
}: MyWorkCardProps) {
  const { mode, columns } = useMyWorkBentoContext();
  const resolved = resolveMyWorkCardColumnSpan(mode, footprint, columns, spanOverrides);

  const style: CSSProperties = {
    gridColumn: `span ${resolved.columnSpan}`,
  };

  const headingId = useId();
  const HeadingTag = HEADING_TAGS[headingLevel];

  const overrideMarker = resolved.overrideMode
    ? { 'data-my-work-span-override-mode': resolved.overrideMode }
    : {};

  return (
    <article
      className={styles.card}
      style={style}
      data-my-work-card=""
      data-my-work-card-role={role}
      data-my-work-card-footprint={footprint}
      data-my-work-mode={mode}
      data-my-work-column-span={String(resolved.columnSpan)}
      data-my-work-span-source={resolved.source}
      data-my-work-module={module}
      aria-labelledby={headingId}
      aria-label={ariaLabel}
      {...overrideMarker}
      {...extraDataAttributes}
    >
      <div className={styles.body}>
        <header className={styles.header}>
          <div className={styles.titleStack}>
            {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
            <HeadingTag id={headingId} className={styles.title}>
              {title}
            </HeadingTag>
          </div>
          {action ? <div className={styles.action}>{action}</div> : null}
        </header>
        <div className={styles.content}>{children}</div>
      </div>
    </article>
  );
}

export default MyWorkCard;
