import type { MyWorkResponsiveMode } from './useMyWorkContainerBreakpoint.js';
import styles from './MyWorkHeroBand.module.css';

export interface IMyWorkHeroHighlight {
  readonly id: string;
  readonly label: string;
  readonly value: string;
}

export interface IMyWorkHeroMicrocopy {
  readonly id: string;
  readonly text: string;
}

export interface IMyWorkHeroViewModel {
  readonly primaryTitle: string;
  readonly secondaryTitle: string;
  readonly description: string;
  readonly heroHighlights: readonly IMyWorkHeroHighlight[];
  readonly governanceMicrocopy: readonly IMyWorkHeroMicrocopy[];
}

export interface MyWorkHeroBandProps {
  readonly mode: MyWorkResponsiveMode;
  readonly viewModel: IMyWorkHeroViewModel;
  readonly ariaLabel?: string;
}

const COMPACT_MODES: ReadonlySet<MyWorkResponsiveMode> = new Set<MyWorkResponsiveMode>([
  'phone',
  'tabletPortrait',
  'tabletLandscape',
  'smallLaptop',
]);

const DEFAULT_ARIA_LABEL = 'My Work hero band';

export function MyWorkHeroBand({
  mode,
  viewModel,
  ariaLabel = DEFAULT_ARIA_LABEL,
}: MyWorkHeroBandProps) {
  const isCompact = COMPACT_MODES.has(mode);
  return (
    <section
      className={styles.heroBand}
      role="region"
      aria-label={ariaLabel}
      data-my-work-hero=""
      data-my-work-mode={mode}
      data-my-work-hero-density={isCompact ? 'compact' : 'comfortable'}
    >
      <div className={styles.identity}>
        <span className={styles.primaryTitle} data-my-work-hero-primary-title="">
          {viewModel.primaryTitle}
        </span>
        <h2 className={styles.secondaryTitle} data-my-work-hero-secondary-title="">
          {viewModel.secondaryTitle}
        </h2>
        <p className={styles.description} data-my-work-hero-description="">
          {viewModel.description}
        </p>
      </div>
      <ul className={styles.highlights}>
        {viewModel.heroHighlights.map((h) => (
          <li
            key={h.id}
            className={styles.highlight}
            data-my-work-hero-highlight={h.id}
          >
            <span className={styles.highlightLabel}>{h.label}</span>
            <span className={styles.highlightValue}>{h.value}</span>
          </li>
        ))}
      </ul>
      <div className={styles.governance}>
        {viewModel.governanceMicrocopy.map((m) => (
          <span
            key={m.id}
            className={styles.governanceItem}
            data-my-work-hero-governance-copy={m.id}
          >
            {m.text}
          </span>
        ))}
      </div>
    </section>
  );
}

export default MyWorkHeroBand;
