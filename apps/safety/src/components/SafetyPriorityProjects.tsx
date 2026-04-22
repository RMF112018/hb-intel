import type { ReactNode } from 'react';
import { HbcTypography } from '@hbc/ui-kit';
import type { SafetyReportingPeriod } from '@hbc/features-safety';
import type { SafetyPriorityProjectItem } from '../pages/reportingPeriodDashboardDerivation.js';
import { SafetyPriorityProjectCard } from './SafetyPriorityProjectCard.js';

/**
 * SafetyPriorityProjects — Phase-04 audit G-04 dashboard recomposition.
 *
 * Authored attention list for the selected reporting period. Renders
 * SafetyPriorityProjectCard items in the order produced by
 * rankProjectWeeks(...) — the caller does not sort.
 *
 * Empty-state ownership (locked):
 *   - When items.length === 0 AND hasProjectWeeks === true, the primitive
 *     renders the section-scoped secondary-empty posture
 *     ("Nothing flagged for this period.").
 *   - When hasProjectWeeks === false, the primitive renders nothing.
 *     The caller is responsible for showing the page/body-empty posture
 *     (SafetyStatusPanel intent="empty"); we do not stack the two.
 */

export interface SafetyPriorityProjectsProps {
  readonly items: ReadonlyArray<SafetyPriorityProjectItem>;
  readonly activePeriod: SafetyReportingPeriod | undefined;
  /**
   * Belt-and-braces guard against double-empty stacking. Callers must pass
   * true only when the dashboard actually has project-weeks for the current
   * period. When false, this primitive renders nothing (even the
   * "nothing flagged" posture is suppressed) because the page/body-empty
   * posture is rendered elsewhere.
   */
  readonly hasProjectWeeks: boolean;
}

export function SafetyPriorityProjects({
  items,
  activePeriod,
  hasProjectWeeks,
}: SafetyPriorityProjectsProps): ReactNode {
  // Page/body empty is owned elsewhere — render nothing here so we can't
  // produce a double-empty stack ("no data" + "nothing flagged").
  if (!hasProjectWeeks) return null;

  if (items.length === 0) {
    return (
      <section
        className="safety-priority-projects"
        data-safety-ui="priority-projects-empty"
        aria-labelledby="safety-priority-projects-heading"
      >
        <header className="safety-priority-projects__header">
          <HbcTypography intent="heading3" as="h2">
            <span id="safety-priority-projects-heading">
              Priority projects
            </span>
          </HbcTypography>
          <HbcTypography intent="bodySmall">
            Nothing flagged for this period. Every project-week is clean against
            the dashboard prioritization thresholds.
          </HbcTypography>
        </header>
      </section>
    );
  }

  return (
    <section
      className="safety-priority-projects"
      data-safety-ui="priority-projects"
      aria-labelledby="safety-priority-projects-heading"
    >
      <header className="safety-priority-projects__header">
        <HbcTypography intent="heading3" as="h2">
          <span id="safety-priority-projects-heading">Priority projects</span>
        </HbcTypography>
        <HbcTypography intent="bodySmall">
          Top {items.length} {items.length === 1 ? 'project' : 'projects'} flagged
          for drill-in this period, ranked by signal strength.
        </HbcTypography>
      </header>
      <div
        className="safety-priority-projects__list"
        role="list"
        aria-label="Priority projects"
      >
        {items.map((item) => (
          <div
            key={item.projectWeek.id}
            role="listitem"
            className="safety-priority-projects__list-item"
          >
            <SafetyPriorityProjectCard item={item} activePeriod={activePeriod} />
          </div>
        ))}
      </div>
    </section>
  );
}
