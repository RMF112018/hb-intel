import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { HbcCard, HbcStatusBadge, HbcTypography } from '@hbc/ui-kit';
import type { StatusVariant } from '@hbc/ui-kit';
import type { SafetyReportingPeriod } from '@hbc/features-safety';
import type { SafetyPriorityProjectItem } from '../pages/reportingPeriodDashboardDerivation.js';

/**
 * SafetyPriorityProjectCard — Phase-04 audit G-04 dashboard recomposition.
 *
 * Per-project authored card for the priority-projects attention list.
 * Surfaces project identity, a one-sentence top-reason the project was
 * flagged, the most relevant stat chips, and a drill-in governed by the
 * plan's route-honesty rule:
 *
 *   - Row-local data (projectWeek.projectNumber) is used where present.
 *   - activePeriod.weekStartDate is used only when the rendered row was
 *     fetched for that same active period (legitimate source of truth).
 *   - If either required param is missing, the drill-in CTA is omitted.
 *     No inferred params. No synthesized fallbacks.
 *
 * Local to Safety — not promoted to @hbc/ui-kit.
 */

export interface SafetyPriorityProjectCardProps {
  readonly item: SafetyPriorityProjectItem;
  readonly activePeriod: SafetyReportingPeriod | undefined;
}

function formatPercent(value: number | null): string {
  if (value === null) return '—';
  return `${Math.round(value * 100)}%`;
}

function scoreTone(value: number | null): StatusVariant {
  if (value === null) return 'neutral';
  if (value < 0.75) return 'critical';
  if (value < 0.85) return 'atRisk';
  return 'success';
}

function riskTone(level: string | null): StatusVariant {
  switch (level) {
    case 'high':
      return 'critical';
    case 'medium':
      return 'atRisk';
    case 'info':
      return 'info';
    default:
      return 'neutral';
  }
}

function publishStatusTone(status: string): StatusVariant {
  switch (status) {
    case 'published':
      return 'success';
    case 'review-required':
      return 'atRisk';
    case 'completed':
      return 'info';
    case 'in-progress':
      return 'info';
    case 'awaiting-upload':
      return 'pending';
    case 'not-started':
      return 'neutral';
    default:
      return 'neutral';
  }
}

export function SafetyPriorityProjectCard({
  item,
  activePeriod,
}: SafetyPriorityProjectCardProps): ReactNode {
  const pw = item.projectWeek;
  const projectNumber = pw.projectNumber;
  const weekStartDate = activePeriod?.weekStartDate;

  // Route-honesty gate: drill-in renders only when both params exist.
  const canDrillIn = Boolean(projectNumber) && Boolean(weekStartDate);

  return (
    <HbcCard weight="standard">
      <article
        className="safety-priority-project-card"
        data-safety-ui="priority-project-card"
        data-priority-score={item.priorityScore}
        aria-label={`Priority project ${projectNumber || 'unknown'}`}
      >
        <header className="safety-priority-project-card__header">
          <div className="safety-priority-project-card__identity">
            <HbcTypography intent="heading4" as="h3">
              {projectNumber || 'Unknown project'}
            </HbcTypography>
            {pw.projectNameSnapshot && (
              <HbcTypography intent="bodySmall">
                {pw.projectNameSnapshot}
              </HbcTypography>
            )}
          </div>
          <HbcStatusBadge
            variant={riskTone(pw.highestRiskFindingLevel)}
            label={pw.highestRiskFindingLevel ?? 'no risk signal'}
            size="small"
          />
        </header>

        <HbcTypography intent="body">
          <strong>{item.topReason}.</strong>{' '}
          {item.reasons.length > 1
            ? `Additional signals: ${item.reasons.slice(1).join(', ')}.`
            : 'No additional signals.'}
        </HbcTypography>

        <div
          className="safety-priority-project-card__stats"
          role="list"
          aria-label={`Stats for ${projectNumber || 'project'}`}
        >
          <div
            role="listitem"
            className="safety-priority-project-card__stat"
            data-stat-id="avg-score"
          >
            <HbcTypography intent="label">Avg score</HbcTypography>
            <HbcStatusBadge
              variant={scoreTone(pw.averageInspectionScore)}
              label={formatPercent(pw.averageInspectionScore)}
              size="small"
            />
          </div>
          <div
            role="listitem"
            className="safety-priority-project-card__stat"
            data-stat-id="inspections"
          >
            <HbcTypography intent="label">Inspections</HbcTypography>
            <HbcTypography intent="body">{pw.inspectionCount}</HbcTypography>
          </div>
          <div
            role="listitem"
            className="safety-priority-project-card__stat"
            data-stat-id="publish-status"
          >
            <HbcTypography intent="label">Status</HbcTypography>
            <HbcStatusBadge
              variant={publishStatusTone(pw.publishStatus)}
              label={pw.publishStatus}
              size="small"
            />
          </div>
        </div>

        {canDrillIn && weekStartDate && projectNumber && (
          <nav
            className="safety-priority-project-card__actions"
            aria-label="Project actions"
          >
            <Link
              className="safety-link safety-priority-project-card__cta"
              to="/projects/$projectNumber/weeks/$weekStartDate"
              params={{ projectNumber, weekStartDate }}
              data-safety-ui="priority-card-drill-in"
            >
              Open project-week detail
            </Link>
          </nav>
        )}
      </article>
    </HbcCard>
  );
}
