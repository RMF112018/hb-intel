import { useMemo, type ReactNode } from 'react';
import { useParams } from '@tanstack/react-router';
import { HbcTypography, WorkspacePageShell } from '@hbc/ui-kit';
import { useFindings, useInspection } from '@hbc/features-safety';
import type { ParsedInspection } from '@hbc/features-safety';

function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return `${Math.round(value * 100)}%`;
}

interface SectionSummaryRow {
  sectionNumber: number;
  sectionName: string;
  yes: number;
  no: number;
  na: number;
  scorePct: number;
}

export function InspectionDetailPage(): ReactNode {
  const { inspectionEventId } = useParams({ from: '/inspections/$inspectionEventId' });
  const { data: inspection } = useInspection(inspectionEventId);
  const { data: findings = [] } = useFindings(inspectionEventId);

  const parsed = useMemo<ParsedInspection | null>(() => {
    if (!inspection?.rawChecklistJson) return null;
    try {
      return JSON.parse(inspection.rawChecklistJson) as ParsedInspection;
    } catch {
      return null;
    }
  }, [inspection]);

  return (
    <WorkspacePageShell layout="detail" title={inspection?.title ?? 'Inspection'}>
      {!inspection && <HbcTypography intent="body">Loading…</HbcTypography>}
      {inspection && (
        <section style={{ display: 'grid', gap: '1rem' }}>
          <header style={{ display: 'grid' }}>
            <HbcTypography intent="heading3">
              {inspection.projectNumber} — {inspection.projectNameSnapshot}
            </HbcTypography>
            <HbcTypography intent="bodySmall">
              Inspected {inspection.inspectionDate} — {inspection.inspectorUpn ?? 'unknown'}
            </HbcTypography>
            <a href={inspection.sourceUploadWebUrl} target="_blank" rel="noreferrer">
              Source workbook
            </a>
          </header>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
            <Stat label="Score" value={formatPercent(inspection.inspectionScore)} />
            <Stat label="Yes" value={String(inspection.totalYes)} />
            <Stat label="No" value={String(inspection.totalNo)} />
            <Stat label="N/A" value={String(inspection.totalNa)} />
          </div>

          <section>
            <HbcTypography intent="heading3">Findings</HbcTypography>
            {findings.length === 0 ? (
              <HbcTypography intent="bodySmall">No findings extracted.</HbcTypography>
            ) : (
              <ul>
                {findings.map((f) => (
                  <li key={f.id}>
                    <strong>[{f.severity.toUpperCase()}]</strong>{' '}
                    {f.sectionName} — row {f.checklistRowNumber}: {f.findingSummary}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {parsed && <SectionSummary parsed={parsed} />}
        </section>
      )}
    </WorkspacePageShell>
  );
}

function SectionSummary({ parsed }: { parsed: ParsedInspection }): ReactNode {
  const rows = useMemo<SectionSummaryRow[]>(() => {
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
    <section>
      <HbcTypography intent="heading3">Section summary</HbcTypography>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>Section</th>
            <th style={{ textAlign: 'left' }}>Yes</th>
            <th style={{ textAlign: 'left' }}>No</th>
            <th style={{ textAlign: 'left' }}>N/A</th>
            <th style={{ textAlign: 'left' }}>Score</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.sectionNumber}>
              <td>{row.sectionName}</td>
              <td>{row.yes}</td>
              <td>{row.no}</td>
              <td>{row.na}</td>
              <td>{Math.round(row.scorePct * 100)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }): ReactNode {
  return (
    <div style={{ display: 'grid' }}>
      <HbcTypography intent="bodySmall">{label}</HbcTypography>
      <HbcTypography intent="heading3">{value}</HbcTypography>
    </div>
  );
}
