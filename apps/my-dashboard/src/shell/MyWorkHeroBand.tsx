import type { MyWorkResponsiveMode } from '../layout/useMyWorkContainerBreakpoint.js';
import {
  resolveMyWorkPageHeaderWelcomeMessage,
  type MyWorkPageHeaderIdentityInput,
} from './myWorkPageHeaderWelcome.js';
import styles from './MyWorkHeroBand.module.css';

export interface MyWorkHeroBandProps {
  readonly mode: MyWorkResponsiveMode;
  readonly identity?: MyWorkPageHeaderIdentityInput;
  readonly now?: Date;
  readonly ariaLabel?: string;
}

const COMPACT_MODES: ReadonlySet<MyWorkResponsiveMode> = new Set<MyWorkResponsiveMode>([
  'phone',
  'tabletPortrait',
  'tabletLandscape',
  'smallLaptop',
]);

const DEFAULT_ARIA_LABEL = 'Personalized greeting header';

export const MY_WORK_PAGE_HEADER_SUPPORT =
  'Your personal launch pad for project access and work requiring attention.';

export function MyWorkHeroBand({
  mode,
  identity,
  now,
  ariaLabel = DEFAULT_ARIA_LABEL,
}: MyWorkHeroBandProps) {
  const isCompact = COMPACT_MODES.has(mode);
  const welcome = resolveMyWorkPageHeaderWelcomeMessage(identity ?? {}, now ?? new Date());
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
        <h2 className={styles.title} data-my-work-page-header-greeting="">
          {welcome.headline}
        </h2>
        <p className={styles.support} data-my-work-page-header-support="">
          {MY_WORK_PAGE_HEADER_SUPPORT}
        </p>
      </div>
    </section>
  );
}

export default MyWorkHeroBand;
