import { useMemo, type ReactNode } from 'react';
import { useParams } from '@tanstack/react-router';
import {
  HbcBanner,
  HbcCard,
  HbcTypography,
  WorkspacePageShell,
} from '@hbc/ui-kit';
import type { KpiCardData } from '@hbc/models';
import { useFindings, useInspection } from '@hbc/features-safety';
import type { ParsedInspection } from '@hbc/features-safety';
import {
  SafetyFindingsList,
  SafetyMasthead,
  SafetyScoreStrip,
  SafetySectionHeader,
  SafetyStatStrip,
  type SafetyScoreStripItem,
} from '../components/index.js';

const OFFICE_ONLY: Array<'office'> = ['office'];

function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return `${Math.round(value * 100)}%`;
}

export function InspectionDetailPage(): ReactNode {
  const { inspectionEventId } = useParams({ from: '/inspections/$inspectionEventId' });
  const inspectionQuery = useInspection(inspectionEventId);
  const inspection = inspectionQuery.data;
  const findingsQuery = useFindings(inspectionEventId);
  const findings = findingsQuery.data ?? [];

  const parsed = useMemo<ParsedInspection | null>(() => {
    if (!inspection?.rawChecklistJson) return null;
    try {
      return JSON.parse(inspection.rawChecklistJson) as ParsedInspection;
    } catch {
      return null;
    }
  }, [inspection]);

  // Page-level state: inspection record is fatal. Findings list failure is a
  // partial failure — the inspection body still renders and the user can
  // still read the score summary; the findings card explicitly reports its
  // degraded state and offers retry (Task C).
  const isNotFound =
    !inspectionQuery.isPending && !inspectionQuery.isError && inspection === null;
  const isError = inspectionQuery.isError || isNotFound;
  const errorMessage = isNotFound
    ? 'Inspection not found.'
    : 'Failed to load inspection.';

  const findingsPartialFailure = !isError && findingsQuery.isError;
  const findingsLoading = !isError && findingsQuery.isPending;

  const kpiCards = useMemo<KpiCardData[]>(() => {
    if (!inspection) return [];
    return [
      { id: 'score', label: 'Score', value: formatPercent(inspection.inspectionScore) },
      { id: 'yes', label: 'Yes', value: inspection.totalYes },
      { id: 'no', label: 'No', value: inspection.totalNo },
      { id: 'na', label: 'N/A', value: inspection.totalNa },
    ];
  }, [inspection]);

  const sectionItems = useMemo<SafetyScoreStripItem[]>(() => {
    if (!parsed) return [];
    const bySection = new Map<number, { name: string; yes: number; no: number; na: number }>();
    for (const row of parsed.rows) {
      const current =
        bySection.get(row.sectionNumber) ?? {
          name: row.sectionName,
          yes: 0,
          no: 0,
          na: 0,
        };
      if (row.response === 'yes') current.yes += 1;
      else if (row.response === 'no') current.no += 1;
      else if (row.response === 'na') current.na += 1;
      bySection.set(row.sectionNumber, current);
    }
    return Array.from(bySection.entries())
      .sort(([a], [b]) => a - b)
      .map(([num, counts]) => {
        const scorable = counts.yes + counts.no;
        return {
          sectionNumber: num,
          sectionName: counts.name,
          yes: counts.yes,
          no: counts.no,
          na: counts.na,
          scorePct: scorable === 0 ? 1 : counts.yes / scorable,
        };
      });
  }, [parsed]);

  return (
    <WorkspacePageShell
      layout="detail"
      title={inspection?.title ?? 'Inspection'}
      supportedModes={OFFICE_ONLY}
      isLoading={inspectionQuery.isPending}
      isError={isError}
      errorMessage={errorMessage}
      onRetry={() => inspectionQuery.refetch()}
    >
      {inspection && (
        <div className="safety-page safety-page--detail">
          <div className="safety-page__main">
            <div className="safety-page">
              <SafetyMasthead
                eyebrow="Safety · Inspection"
                title={`${inspection.projectNumber} — ${inspection.projectNameSnapshot}`}
                description={`Inspected ${inspection.inspectionDate} by ${inspection.inspectorUpn ?? 'unknown inspector'}.`}
                meta={[
                  { key: 'number', label: `Inspection # ${inspection.inspectionNumber}` },
                  {
                    key: 'status',
                    label: `Status: ${inspection.ingestionStatus}`,
                  },
                  {
                    key: 'source',
                    label: (
                      <a
                        className="safety-link"
                        href={inspection.sourceUploadWebUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Source workbook
                      </a>
                    ),
                  },
                ]}
              />

              <SafetyStatStrip cards={kpiCards} />

              <HbcCard
                header={
                  <SafetySectionHeader
                    title="Findings"
                    description={
                      findingsPartialFailure
                        ? 'Load failed'
                        : findingsLoading
                          ? 'Loading…'
                          : `${findings.length} extracted`
                    }
                  />
                }
                weight="primary"
              >
                {findingsPartialFailure ? (
                  <HbcBanner variant="warning">
                    Findings could not be loaded. The inspection summary above is authoritative;
                    only the per-finding breakdown is missing.{' '}
                    <button
                      type="button"
                      className="safety-link"
                      onClick={() => void findingsQuery.refetch()}
                    >
                      Retry findings
                    </button>
                  </HbcBanner>
                ) : findingsLoading ? (
                  <HbcTypography intent="bodySmall">Loading findings…</HbcTypography>
                ) : (
                  <SafetyFindingsList findings={findings} />
                )}
              </HbcCard>
            </div>
          </div>

          <aside className="safety-page__aside">
            {sectionItems.length > 0 && (
              <HbcCard
                header={<SafetySectionHeader title="Section summary" />}
                weight="supporting"
              >
                <SafetyScoreStrip items={sectionItems} />
              </HbcCard>
            )}
            <HbcCard
              header={<SafetySectionHeader title="Provenance" />}
              weight="supporting"
            >
              <HbcTypography intent="bodySmall">
                Template {inspection.templateVersion} · Parser {inspection.parserVersion}
              </HbcTypography>
              <HbcTypography intent="bodySmall">
                Submitted {inspection.submittedAt}
                {inspection.committedAt ? ` · Committed ${inspection.committedAt}` : ''}
              </HbcTypography>
              {inspection.supersededByInspectionEventId && (
                <HbcTypography intent="bodySmall">
                  Superseded by {inspection.supersededByInspectionEventId}
                </HbcTypography>
              )}
            </HbcCard>
          </aside>
        </div>
      )}
    </WorkspacePageShell>
  );
}
