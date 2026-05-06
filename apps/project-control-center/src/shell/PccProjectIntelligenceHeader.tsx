import type { FC } from 'react';
import { PccCommandSearch } from './PccCommandSearch';
import type { PccResponsiveMode } from '../layout/footprints';
import styles from './PccProjectIntelligenceHeader.module.css';

/**
 * Slim ambient header carrying only the eyebrow subtitle and the command
 * search slot. Project identity, status pills, date scope, and the active
 * surface label/workflow live in `PccProjectContextBand` (Wave 15A /
 * Wave B / Prompt 02 — shell visual dominance reduced; project context
 * promoted to a persistent band).
 */
export interface PccProjectIntelligenceHeaderProps {
  subtitle: string;
  /** Resolved responsive mode supplied by the shell. */
  mode: PccResponsiveMode;
}

export const PccProjectIntelligenceHeader: FC<PccProjectIntelligenceHeaderProps> = ({
  subtitle,
  mode,
}) => {
  const showSearchExpanded = mode === 'wideDesktop' || mode === 'standardDesktop';

  return (
    <header className={styles.header} data-pcc-header="" data-pcc-mode={mode}>
      <div className={styles.identity}>
        <p className={styles.eyebrow}>{subtitle}</p>
      </div>
      <div className={styles.commandArea}>
        {showSearchExpanded ? (
          <PccCommandSearch variant="expanded" />
        ) : (
          <PccCommandSearch variant="icon" />
        )}
      </div>
    </header>
  );
};

export default PccProjectIntelligenceHeader;
