import { useMemo, useRef, useState, type ReactNode } from 'react';
import {
  HbcBanner,
  HbcButton,
  HbcSelect,
  HbcTypography,
  WorkspacePageShell,
} from '@hbc/ui-kit';
import {
  useReportingPeriods,
  useSafetyIngestion,
  type IngestionRunResult,
} from '@hbc/features-safety';

function currentUserUpn(): string {
  if (typeof window === 'undefined') return 'coordinator@hedrickbrothers.com';
  return (window as unknown as { _hbcUpn?: string })._hbcUpn ?? 'coordinator@hedrickbrothers.com';
}

export function UploadPage(): ReactNode {
  const { data: periods = [] } = useReportingPeriods();
  const ingestion = useSafetyIngestion();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [reportingPeriodId, setReportingPeriodId] = useState<string>('');

  const activePeriod = useMemo(
    () => periods.find((p) => p.id === reportingPeriodId) ?? periods[0],
    [periods, reportingPeriodId],
  );

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = () => {
    if (!file || !activePeriod) return;
    ingestion.mutate({
      file,
      context: {
        uploadedByUpn: currentUserUpn(),
        uploadedAt: new Date().toISOString(),
        fileName: file.name,
        reportingPeriodId: activePeriod.id,
        reportingPeriodSpItemId: activePeriod.spItemId,
      },
    });
  };

  return (
    <WorkspacePageShell layout="form" title="Upload Safety Checklist">
      <section style={{ display: 'grid', gap: '1rem', maxWidth: '42rem' }}>
        <HbcTypography intent="body">
          Upload a completed Safety Checklist Template (v1) workbook. The system validates the template,
          resolves the project against HBCentral, parses responses, and writes authoritative inspection
          records. Source files are retained in the Safety Checklist Uploads library.
        </HbcTypography>

        <HbcSelect
          label="Reporting period"
          value={activePeriod?.id ?? ''}
          onChange={(value) => setReportingPeriodId(value)}
          options={periods.map((p) => ({ value: p.id, label: p.periodLabel }))}
        />

        <div style={{ display: 'grid', gap: '0.5rem' }}>
          <HbcTypography intent="bodySmall">Checklist workbook (.xlsx)</HbcTypography>
          {/* eslint-disable-next-line @hb-intel/hbc/no-raw-form-elements -- Release 1 file picker; no HbcFileInput exists yet. */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            style={{ display: 'none' }}
          />
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <HbcButton variant="secondary" onClick={handleFileSelect}>
              Choose file
            </HbcButton>
            <HbcTypography intent="bodySmall">
              {file ? file.name : 'No file selected'}
            </HbcTypography>
          </div>
        </div>

        <div>
          <HbcButton
            variant="primary"
            onClick={handleSubmit}
            disabled={!file || !activePeriod || ingestion.isPending}
          >
            {ingestion.isPending ? 'Processing…' : 'Submit checklist'}
          </HbcButton>
        </div>

        {ingestion.data && <IngestionResultBanner result={ingestion.data} />}
        {ingestion.error && (
          <HbcBanner variant="error">Upload failed: {ingestion.error.message}</HbcBanner>
        )}
      </section>
    </WorkspacePageShell>
  );
}

function IngestionResultBanner({ result }: { result: IngestionRunResult }): ReactNode {
  const variant: 'success' | 'warning' | 'error' =
    result.state === 'committed'
      ? 'success'
      : result.state === 'review-required' ||
          result.state === 'unresolved-project' ||
          result.state === 'reporting-period-mismatch'
        ? 'warning'
        : 'error';
  const headline = headlineFor(result.state);
  return (
    <HbcBanner variant={variant}>
      <div style={{ display: 'grid', gap: '0.25rem' }}>
        <strong>{headline}</strong>
        <span>Run: {result.run.id}</span>
        {result.run.errorSummary && <span>{result.run.errorSummary}</span>}
        {result.committed && (
          <span>
            Inspection committed: {result.committed.inspectionEvent.id} (
            {Math.round(result.committed.inspectionEvent.inspectionScore * 100)}% score,{' '}
            {result.committed.findings.length} findings)
          </span>
        )}
      </div>
    </HbcBanner>
  );
}

function headlineFor(state: IngestionRunResult['state']): string {
  switch (state) {
    case 'committed':
      return 'Committed';
    case 'review-required':
      return 'Review required';
    case 'unresolved-project':
      return 'Project could not be resolved';
    case 'reporting-period-mismatch':
      return 'Workbook date is outside the selected reporting period';
    case 'parse-error':
      return 'Workbook could not be parsed';
    case 'invalid-template':
      return 'Workbook template is invalid';
    case 'commit-failed':
      return 'Commit to HBCentral failed';
    default:
      return `Status: ${state}`;
  }
}
