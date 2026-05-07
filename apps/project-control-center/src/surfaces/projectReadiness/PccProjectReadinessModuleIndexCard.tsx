/**
 * Wave 15A B5 / Prompt 01 — Project Readiness module-index card.
 *
 * Single `PccDashboardCard` rendered alongside the command-region
 * native cards in the default Project Readiness view. Exposes
 * strictly-local view-selection controls: one button for the
 * `'command'` overview (enabled by default — it is the default
 * selection) and one button per detail section (rendered disabled
 * in Prompt 01 because the detail-section renderer lands in
 * Prompt 02; disabling them is the explicit false-affordance
 * lock).
 *
 * No fetches, navigation, mutations, or external launches. No
 * `<a href>` elements. Each button carries
 * `data-pcc-readiness-drilldown-control="<section-id>"` and
 * `aria-pressed`; the currently selected button additionally
 * carries `data-pcc-readiness-drilldown-state="selected"`.
 */

import type { FC } from 'react';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import type { PccProjectReadinessSectionId } from './projectReadinessSectionTypes';
import { PCC_PROJECT_READINESS_MODULE_INDEX_ENTRIES } from './projectReadinessModuleIndexViewModel';
import styles from './PccProjectReadinessSurface.module.css';

export interface IPccProjectReadinessModuleIndexCardProps {
  readonly selectedSectionId: PccProjectReadinessSectionId;
  readonly onSelect: (next: PccProjectReadinessSectionId) => void;
}

export const PccProjectReadinessModuleIndexCard: FC<IPccProjectReadinessModuleIndexCardProps> = ({
  selectedSectionId,
  onSelect,
}) => {
  const renderButton = (
    sectionId: PccProjectReadinessSectionId,
    label: string,
    summary: string,
    disabled: boolean,
  ) => {
    const isSelected = selectedSectionId === sectionId;
    return (
      <li key={sectionId} className={styles.moduleIndexItem}>
        <button
          type="button"
          className={`${styles.moduleIndexButton} ${
            isSelected ? styles.moduleIndexButtonSelected : ''
          }`.trim()}
          data-pcc-readiness-drilldown-control={sectionId}
          {...(isSelected ? { 'data-pcc-readiness-drilldown-state': 'selected' } : {})}
          aria-pressed={isSelected}
          aria-disabled={disabled ? 'true' : undefined}
          disabled={disabled || undefined}
          onClick={() => {
            if (!disabled) onSelect(sectionId);
          }}
        >
          <span className={styles.moduleIndexButtonLabel}>{label}</span>
          <span className={styles.moduleIndexButtonSummary}>{summary}</span>
        </button>
      </li>
    );
  };

  return (
    <PccDashboardCard
      footprint="wide"
      tier="tier1"
      region="command"
      eyebrow="Project readiness sections"
      title="Section overview"
    >
      <div data-pcc-readiness-region="module-index" className={styles.moduleIndexBody}>
        <p className={styles.moduleIndexCaption}>
          Choose a section to view its details. The command overview is shown by default.
        </p>
        <ul className={styles.moduleIndexList} aria-label="Project readiness section overview">
          {renderButton(
            'command',
            'Command overview',
            'Hero, blockers, ownership, evidence and downstream-module readiness at a glance.',
            false,
          )}
          {PCC_PROJECT_READINESS_MODULE_INDEX_ENTRIES.map((entry) =>
            renderButton(entry.sectionId, entry.label, entry.summary, true),
          )}
        </ul>
      </div>
    </PccDashboardCard>
  );
};

export default PccProjectReadinessModuleIndexCard;
