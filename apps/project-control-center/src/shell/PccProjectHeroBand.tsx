import { useState, type CSSProperties, type FC, type ReactNode } from 'react';
import { HBC_ACCENT_ORANGE } from '@hbc/ui-kit/theme';
import type { PccResponsiveMode } from '../layout/footprints';
import { PccCommandSearch } from './PccCommandSearch';
import styles from './PccProjectHeroBand.module.css';

export type PccProjectHeroSourceConfidence = 'reference' | 'live';

export interface PccProjectHeroPill {
  label: string;
  tone: 'info' | 'neutral' | 'warning';
}

export interface PccProjectHeroBandProps {
  mode: PccResponsiveMode;
  projectName: string;
  clientName: string;
  location: string;
  estimatedValue: string;
  sourceConfidence: PccProjectHeroSourceConfidence;
  pills: ReadonlyArray<PccProjectHeroPill>;
  activeSurfaceLabel: string;
  activeSurfaceWorkflowLabel?: string;
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

const SOURCE_CONFIDENCE_LABEL: Record<PccProjectHeroSourceConfidence, string> = {
  reference: 'Reference data',
  live: 'Live project data',
};

const COLLAPSIBLE_REGION_ID = 'pcc-project-intel-collapsible';

export const PccProjectHeroBand: FC<PccProjectHeroBandProps> = ({
  mode,
  projectName,
  clientName,
  location,
  estimatedValue,
  sourceConfidence,
  pills,
  activeSurfaceLabel,
  activeSurfaceWorkflowLabel,
  ariaLabel = 'Project hero band',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isCompact = COMPACT_MODES.has(mode);
  const searchVariant = EXPANDED_SEARCH_MODES.has(mode) ? 'expanded' : 'icon';
  const sourceConfidenceLabel = SOURCE_CONFIDENCE_LABEL[sourceConfidence];

  const themeVars: CSSProperties = {
    ['--pcc-hero-accent' as string]: HBC_ACCENT_ORANGE,
  };

  const pillsRow: ReactNode = pills.length ? (
    <ul className={styles.pillRow} data-pcc-hero-pill-row="">
      {pills.map((pill) => (
        <li key={pill.label} className={styles.pill} data-pcc-hero-pill="" data-tone={pill.tone}>
          {pill.label}
        </li>
      ))}
    </ul>
  ) : null;

  const metadataRow: ReactNode = (
    <dl className={styles.metadata} data-pcc-project-metadata="">
      <div className={styles.metadataItem}>
        <dt className={styles.metadataLabel}>Client</dt>
        <dd className={styles.metadataValue}>{clientName}</dd>
      </div>
      <div className={styles.metadataItem}>
        <dt className={styles.metadataLabel}>Location</dt>
        <dd className={styles.metadataValue}>{location}</dd>
      </div>
      <div className={styles.metadataItem}>
        <dt className={styles.metadataLabel}>Estimated Value</dt>
        <dd className={styles.metadataValue}>{estimatedValue}</dd>
      </div>
    </dl>
  );

  const searchSlot: ReactNode = (
    <div className={styles.searchSlot}>
      <PccCommandSearch variant={searchVariant} />
    </div>
  );

  const sourceConfidenceSlot: ReactNode = (
    <div className={styles.sourceConfidence} data-pcc-source-confidence={sourceConfidence}>
      <span className={styles.sourceConfidenceDot} aria-hidden="true" />
      <span className={styles.sourceConfidenceLabel} data-pcc-source-confidence-label="">
        {sourceConfidenceLabel}
      </span>
    </div>
  );

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
      <p className={styles.eyebrow}>Project Control Center</p>

      <div className={styles.identityRow}>
        <div className={styles.identity} data-pcc-project-identity="">
          <h2 className={styles.projectName}>{projectName}</h2>
          <span className={styles.activeSurfaceContext} data-pcc-active-surface-context="">
            <span className={styles.activeSurfaceLabel}>{activeSurfaceLabel}</span>
            {activeSurfaceWorkflowLabel ? (
              <span className={styles.activeSurfaceWorkflow}>{activeSurfaceWorkflowLabel}</span>
            ) : null}
          </span>
        </div>

        <button
          type="button"
          className={styles.intelToggle}
          data-pcc-project-intel-toggle=""
          aria-expanded={isOpen}
          aria-controls={COLLAPSIBLE_REGION_ID}
          onClick={() => setIsOpen((open) => !open)}
        >
          Project Intel
        </button>
      </div>

      <div
        id={COLLAPSIBLE_REGION_ID}
        className={styles.collapsible}
        data-pcc-project-intel-region=""
        hidden={mode === 'phone' && !isOpen}
      >
        {pillsRow}
        {metadataRow}
        {searchSlot}
        {sourceConfidenceSlot}
      </div>
    </section>
  );
};
