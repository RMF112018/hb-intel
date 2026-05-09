import type { CSSProperties, FC } from 'react';
import { HBC_ACCENT_ORANGE } from '@hbc/ui-kit/theme';
import type { PccResponsiveMode } from '../layout/footprints';
import type { IPccShellHeroViewModel } from '../preview/projectShellViewModel';
import { PccCommandSearch } from './PccCommandSearch';
import styles from './PccProjectHeroBand.module.css';

export interface PccProjectHeroBandProps {
  mode: PccResponsiveMode;
  viewModel: IPccShellHeroViewModel;
  ariaLabel?: string;
}

const COMPACT_MODES: ReadonlySet<PccResponsiveMode> = new Set([
  'phone',
  'tabletPortrait',
  'tabletLandscape',
  'smallLaptop',
]);

const EXPANDED_SEARCH_MODES: ReadonlySet<PccResponsiveMode> = new Set([
  'standardLaptop',
  'largeLaptop',
  'desktop',
  'ultrawide',
]);

export const PccProjectHeroBand: FC<PccProjectHeroBandProps> = ({
  mode,
  viewModel,
  ariaLabel = 'Project hero band',
}) => {
  const isCompact = COMPACT_MODES.has(mode);
  const searchVariant = EXPANDED_SEARCH_MODES.has(mode) ? 'expanded' : 'icon';

  const themeVars: CSSProperties = {
    ['--pcc-hero-accent' as string]: HBC_ACCENT_ORANGE,
  };

  return (
    <section
      className={styles.heroBand}
      data-pcc-project-hero-band=""
      data-pcc-mode={mode}
      data-pcc-hero-density={isCompact ? 'compact' : 'comfortable'}
      role="region"
      aria-label={ariaLabel}
      style={themeVars}
    >
      <div className={styles.heroSurface} data-pcc-hero-surface="">
        <div className={styles.identityBlock}>
          <p className={styles.primaryTitle} data-pcc-hero-primary-title="">
            {viewModel.primaryTitle}
          </p>
          <h2 className={styles.secondaryTitle} data-pcc-hero-secondary-title="">
            {viewModel.secondaryTitle}
          </h2>
          <p className={styles.surfaceDescription} data-pcc-hero-surface-description="">
            {viewModel.surfaceDescription}
          </p>
        </div>

        <dl className={styles.facts} data-pcc-hero-facts="">
          <div className={styles.factCell} data-pcc-hero-fact-client="">
            <dt className={styles.factLabel}>Client</dt>
            <dd className={styles.factValue}>{viewModel.clientDisplay}</dd>
          </div>
          <div className={styles.factCell} data-pcc-hero-fact-location="">
            <dt className={styles.factLabel}>Location</dt>
            <dd className={styles.factValue}>{viewModel.location}</dd>
          </div>
          <div className={styles.factCell} data-pcc-hero-fact-estimated-value="">
            <dt className={styles.factLabel}>Estimated value</dt>
            <dd className={styles.factValue}>{viewModel.estimatedValueDisplay}</dd>
          </div>
          <div className={styles.factCell} data-pcc-hero-fact-scheduled-completion="">
            <dt className={styles.factLabel}>Scheduled completion</dt>
            <dd className={styles.factValue}>{viewModel.scheduledCompletionDisplay}</dd>
          </div>
          <div className={styles.factCell} data-pcc-hero-fact-project-stage="">
            <dt className={styles.factLabel}>Project stage</dt>
            <dd className={styles.factValue}>{viewModel.projectStageLabel}</dd>
          </div>
        </dl>

        <div className={styles.heroHighlights} data-pcc-hero-highlights="">
          {viewModel.heroHighlights.map((highlight) => (
            <div
              key={highlight.id}
              className={styles.heroHighlight}
              data-pcc-hero-highlight={highlight.id}
              data-pcc-hero-highlight-tone={highlight.tone ?? 'neutral'}
              data-pcc-hero-highlight-kind={highlight.kind ?? 'summary'}
            >
              <span className={styles.heroHighlightLabel}>{highlight.label}</span>
              <span className={styles.heroHighlightValue}>{highlight.value}</span>
            </div>
          ))}
        </div>

        <div className={styles.governanceMicrocopy} data-pcc-hero-governance-microcopy="">
          {viewModel.governanceMicrocopy.map((item) => (
            <span
              key={item.id}
              className={styles.governanceMicrocopyItem}
              data-pcc-hero-governance-microcopy-item={item.id}
            >
              {item.text}
            </span>
          ))}
        </div>

        <div className={styles.commandSlot} data-pcc-hero-command-search="">
          <PccCommandSearch variant={searchVariant} />
        </div>
      </div>
      <div className={styles.tabSeam} data-pcc-hero-tab-seam="" aria-hidden="true" />
    </section>
  );
};
