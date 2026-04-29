import type { FC } from 'react';
import { PccStatusPill } from '../ui/PccStatusPill';
import { PccCommandSearch } from './PccCommandSearch';
import type { PccResponsiveMode } from '../layout/footprints';
import styles from './PccProjectIntelligenceHeader.module.css';

export interface PccProjectIntelligenceHeaderProps {
  projectName: string;
  subtitle: string;
  dateScope: string;
  pills: ReadonlyArray<{ label: string; tone: 'info' | 'neutral' | 'warning' }>;
  /** Resolved responsive mode supplied by the shell. */
  mode: PccResponsiveMode;
}

export const PccProjectIntelligenceHeader: FC<PccProjectIntelligenceHeaderProps> = ({
  projectName,
  subtitle,
  dateScope,
  pills,
  mode,
}) => {
  const showSearchExpanded = mode === 'wideDesktop' || mode === 'standardDesktop';
  const showPills = mode !== 'phone';
  const showDateScope = mode === 'wideDesktop' || mode === 'standardDesktop';

  return (
    <header
      className={styles.header}
      data-pcc-header=""
      data-pcc-mode={mode}
    >
      <div className={styles.identity}>
        <p className={styles.eyebrow}>{subtitle}</p>
        <h1 className={styles.projectName}>{projectName}</h1>
      </div>
      <div className={styles.commandArea}>
        {showSearchExpanded ? (
          <PccCommandSearch variant="expanded" />
        ) : (
          <PccCommandSearch variant="icon" />
        )}
      </div>
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
    </header>
  );
};

export default PccProjectIntelligenceHeader;
