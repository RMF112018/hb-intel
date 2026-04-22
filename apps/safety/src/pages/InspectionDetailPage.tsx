import { useMemo, type ReactNode } from 'react';
import { useParams } from '@tanstack/react-router';
import { HbcCard, HbcTypography, WorkspacePageShell } from '@hbc/ui-kit';
import type { KpiCardData } from '@hbc/models';
import { useFindings, useInspection } from '@hbc/features-safety';
import type { ParsedInspection } from '@hbc/features-safety';
import {
  SafetyFindingsList,
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

  const isNotFound =
    !inspectionQuery.isPending && !inspectionQuery.isError && inspection === null;
  const isError = inspectionQuery.isError || isNotFound;
  const errorMessage = isNotFound
    ? 'Inspection not found.'
    : 'Failed to load inspection.';

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
        <div className="safety-page">
          <header className="safety-detail-header">
            <HbcTypography intent="heading3">
              {inspection.projectNumber} — {inspection.projectNameSnapshot}
            </HbcTypography>
            <div className="safety-detail-header__meta">
              <HbcTypography intent="bodySmall">
                Inspected {inspection.inspectionDate}
              </HbcTypography>
              <HbcTypography intent="bodySmall">
                {inspection.inspectorUpn ?? 'unknown inspector'}
              </HbcTypography>
              <a
                className="safety-link"
                href={inspection.sourceUploadWebUrl}
                target="_blank"
                rel="noreferrer"
              >
                Source workbook
              </a>
            </div>
          </header>

          <SafetyStatStrip cards={kpiCards} />

          <HbcCard
            header={
              <SafetySectionHeader
                title="Findings"
                description={`${findings.length} extracted`}
              />
            }
            weight="supporting"
          >
            <SafetyFindingsList findings={findings} />
          </HbcCard>

          {sectionItems.length > 0 && (
            <HbcCard
              header={<SafetySectionHeader title="Section summary" />}
              weight="supporting"
            >
              <SafetyScoreStrip items={sectionItems} />
            </HbcCard>
          )}
        </div>
      )}
    </WorkspacePageShell>
  );
}
