import type { MyWorkResponsiveMode } from '../layout/useMyWorkContainerBreakpoint.js';
import styles from './MyWorkHeroBand.module.css';

export interface MyWorkHeroBandProps {
  readonly mode: MyWorkResponsiveMode;
  readonly ariaLabel?: string;
}

const COMPACT_MODES: ReadonlySet<MyWorkResponsiveMode> = new Set<MyWorkResponsiveMode>([
  'phone',
  'tabletPortrait',
  'tabletLandscape',
  'smallLaptop',
]);

const DEFAULT_ARIA_LABEL = 'My Work page header';

export const MY_WORK_PAGE_HEADER_EYEBROW = 'My Dashboard';
export const MY_WORK_PAGE_HEADER_TITLE = 'My Work';
export const MY_WORK_PAGE_HEADER_SUPPORT =
  'Your personal launch pad for project access and work requiring attention.';

export function MyWorkHeroBand({ mode, ariaLabel = DEFAULT_ARIA_LABEL }: MyWorkHeroBandProps) {
  const isCompact = COMPACT_MODES.has(mode);
  return (
    <section
      className={styles.pageHeader}
      role="region"
      aria-label={ariaLabel}
      data-my-work-page-header=""
      data-my-work-mode={mode}
      data-my-work-page-header-density={isCompact ? 'compact' : 'comfortable'}
    >
      <div className={styles.identity}>
        <span className={styles.eyebrow} data-my-work-page-header-eyebrow="">
          {MY_WORK_PAGE_HEADER_EYEBROW}
        </span>
        <h2 className={styles.title} data-my-work-page-header-title="">
          {MY_WORK_PAGE_HEADER_TITLE}
        </h2>
        <p className={styles.support} data-my-work-page-header-support="">
          {MY_WORK_PAGE_HEADER_SUPPORT}
        </p>
      </div>
    </section>
  );
}

export default MyWorkHeroBand;
