import { clsx } from 'clsx';
import shell from './manageShell.module.css';

export type ManageSectionBandAccent = 'none' | 'brand' | 'success' | 'warning' | 'danger';

export interface ManageSectionBandProps {
  readonly children: React.ReactNode;
  readonly kicker?: string;
  readonly heading?: string;
  readonly headingId?: string;
  readonly intro?: React.ReactNode;
  readonly accent?: ManageSectionBandAccent;
  readonly divider?: boolean;
  readonly ariaLabel?: string;
  readonly role?: 'region' | 'status';
  readonly as?: 'section' | 'div' | 'aside';
  readonly className?: string;
  readonly headingLevel?: 2 | 3 | 4;
}

/**
 * Local section-band primitive for the Foleon Manager canvas.
 *
 * Sits directly on the page canvas. Expresses hierarchy through spacing, an
 * optional kicker/heading/intro slot, an optional thin top divider, and an
 * optional left accent edge. Never a container "shell" — no card chrome.
 *
 * Manager-local on purpose: per-package boundary discipline, not promoted to
 * @hbc/ui-kit. Lane columns and the workflow slide-over remain the only
 * surfaces that legitimately read as "cards" in this surface.
 */
export function ManageSectionBand(props: ManageSectionBandProps): React.ReactNode {
  const Tag = props.as ?? 'section';
  const HeadingTag: 'h2' | 'h3' | 'h4' = `h${props.headingLevel ?? 3}` as 'h2' | 'h3' | 'h4';
  const showHeader = Boolean(props.kicker || props.heading || props.intro);
  return (
    <Tag
      className={clsx(
        shell.sectionBand,
        props.divider ? shell.sectionBandDivider : null,
        props.className,
      )}
      role={props.role}
      aria-label={props.ariaLabel}
      data-band-accent={props.accent ?? 'none'}
    >
      {showHeader ? (
        <header className={shell.sectionBandHeader}>
          {props.kicker ? <p className={shell.sectionBandKicker}>{props.kicker}</p> : null}
          {props.heading ? (
            <HeadingTag id={props.headingId} className={shell.sectionBandHeading}>
              {props.heading}
            </HeadingTag>
          ) : null}
          {props.intro ? <div className={shell.sectionBandIntro}>{props.intro}</div> : null}
        </header>
      ) : null}
      <div className={shell.sectionBandBody}>{props.children}</div>
    </Tag>
  );
}
