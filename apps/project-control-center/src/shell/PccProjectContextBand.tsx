import type { FC } from 'react';
import { PccStatusPill } from '../ui/PccStatusPill';
import type { PccResponsiveMode } from '../layout/footprints';
import styles from './PccProjectContextBand.module.css';

/**
 * Persistent compact project-context band rendered between the slim
 * project intelligence header and the bento canvas. Carries project
 * identity, source confidence, the active surface label/workflow, the
 * status-pill summary, and the date scope.
 *
 * Hosts the migrated shell-level markers `data-pcc-active-surface-context`,
 * `data-pcc-pill-row`, and `data-pcc-date-scope` (moved here from the
 * header in Wave 15A / Wave B / Prompt 02).
 *
 * `sourceConfidence` is derived in `PccApp` from `usePccShellState.previewMode`
 * (literal `true` today). The band renders a product-safe label
 * ("Reference data" for `'preview'`; "Live data" for `'live'`).
 */
export type PccProjectContextSourceConfidence = 'preview' | 'live';

export interface PccProjectContextBandProps {
  projectName: string;
  pills: ReadonlyArray<{ label: string; tone: 'info' | 'neutral' | 'warning' }>;
  dateScope: string;
  activeSurfaceLabel: string;
  activeSurfaceWorkflowLabel: string;
  sourceConfidence: PccProjectContextSourceConfidence;
  mode: PccResponsiveMode;
}

const SOURCE_CONFIDENCE_LABEL: Record<PccProjectContextSourceConfidence, string> = {
  preview: 'Reference data',
  live: 'Live data',
};

export const PccProjectContextBand: FC<PccProjectContextBandProps> = ({
  projectName,
  pills,
  dateScope,
  activeSurfaceLabel,
  activeSurfaceWorkflowLabel,
  sourceConfidence,
  mode,
}) => {
  const showPills = mode !== 'phone';
  const showDateScope = mode === 'wideDesktop' || mode === 'standardDesktop';

  return (
    <div
      className={styles.band}
      data-pcc-context-band=""
      data-pcc-mode={mode}
      data-pcc-source-confidence={sourceConfidence}
      role="region"
      aria-label="Project context"
    >
      <div className={styles.identity}>
        <span className={styles.projectName} data-pcc-context-project="">
          {projectName}
        </span>
        <span
          className={styles.sourceConfidence}
          data-pcc-source-confidence-label={sourceConfidence}
        >
          {SOURCE_CONFIDENCE_LABEL[sourceConfidence]}
        </span>
      </div>
      <p className={styles.activeSurfaceContext} data-pcc-active-surface-context="">
        <span className={styles.activeSurfaceLabel}>{activeSurfaceLabel}</span>
        <span className={styles.activeSurfaceWorkflow}>{activeSurfaceWorkflowLabel}</span>
      </p>
      <div className={styles.metaArea}>
        {showPills ? (
          <ul className={styles.pillRow} data-pcc-pill-row="">
            {pills.map((pill) => (
              <li key={pill.label}>
                <PccStatusPill tone={pill.tone}>{pill.label}</PccStatusPill>
              </li>
            ))}
          </ul>
        ) : null}
        {showDateScope ? (
          <span className={styles.dateScope} data-pcc-date-scope="">
            {dateScope}
          </span>
        ) : null}
      </div>
    </div>
  );
};

export default PccProjectContextBand;
