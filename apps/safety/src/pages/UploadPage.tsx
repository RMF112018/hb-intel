import { useMemo, useRef, useState, type ReactNode } from 'react';
import {
  HbcBanner,
  HbcButton,
  HbcCard,
  HbcSelect,
  HbcStatusBadge,
  HbcTypography,
  WorkspacePageShell,
} from '@hbc/ui-kit';
import type { StatusVariant } from '@hbc/ui-kit';
import {
  useReportingPeriods,
  useSafetyIngestion,
  type IngestionRunResult,
} from '@hbc/features-safety';
import { SafetyMasthead, SafetySectionHeader } from '../components/index.js';

const OFFICE_ONLY: Array<'office'> = ['office'];

function currentUserUpn(): string {
  if (typeof window === 'undefined') return 'coordinator@hedrickbrothers.com';
  return (window as unknown as { _hbcUpn?: string })._hbcUpn ?? 'coordinator@hedrickbrothers.com';
}

export function UploadPage(): ReactNode {
  const periodsQuery = useReportingPeriods();
  const periods = periodsQuery.data ?? [];
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
    <WorkspacePageShell
      layout="form"
      title="Upload Safety Checklist"
      supportedModes={OFFICE_ONLY}
    >
      <div className="safety-page">
        <SafetyMasthead
          eyebrow="Safety · Upload"
          title="Submit a completed checklist"
          description="Upload a v1 Safety Checklist workbook. The system validates the template, resolves the project against HBCentral, parses responses, and writes authoritative inspection records."
        />

        <div className="safety-upload">
          <section className="safety-upload__primary">
            <HbcCard weight="primary">
              <div className="safety-section">
                <SafetySectionHeader title="Workbook intake" />

                {periodsQuery.isError && (
                  <HbcBanner variant="error">
                    Could not load reporting periods. Submission is disabled until the period list
                    is available.
                  </HbcBanner>
                )}

                <div className="safety-filter-bar">
                  <div className="safety-filter-bar__field">
                    <HbcSelect
                      label="Reporting period"
                      value={activePeriod?.id ?? ''}
                      onChange={(value) => setReportingPeriodId(value)}
                      options={periods.map((p) => ({ value: p.id, label: p.periodLabel }))}
                      disabled={periodsQuery.isPending || periodsQuery.isError}
                    />
                  </div>
                  {periodsQuery.isPending && (
                    <HbcTypography intent="bodySmall">Loading reporting periods…</HbcTypography>
                  )}
                </div>

                <div className="safety-upload__drop-zone">
                  <HbcTypography intent="label">Checklist workbook (.xlsx)</HbcTypography>
                  {/* eslint-disable @hb-intel/hbc/no-raw-form-elements, @hb-intel/hbc/no-inline-styles -- Release 1 hidden file picker; no HbcFileInput primitive exists yet and the hidden-input pattern requires `display: none` to stay tab-inert. */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    style={{ display: 'none' }}
                    aria-label="Choose safety checklist workbook"
                  />
                  {/* eslint-enable @hb-intel/hbc/no-raw-form-elements, @hb-intel/hbc/no-inline-styles */}
                  <div className="safety-upload__drop-zone-row">
                    <HbcButton
                      variant="secondary"
                      onClick={handleFileSelect}
                      aria-label="Choose a safety checklist workbook to upload"
                    >
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
                    disabled={
                      !file ||
                      !activePeriod ||
                      ingestion.isPending ||
                      periodsQuery.isPending ||
                      periodsQuery.isError
                    }
                  >
                    {ingestion.isPending ? 'Processing…' : 'Submit checklist'}
                  </HbcButton>
                </div>

                {ingestion.data && <IngestionResultBanner result={ingestion.data} />}
                {ingestion.error && (
                  <HbcBanner variant="error">Upload failed: {ingestion.error.message}</HbcBanner>
                )}
              </div>
            </HbcCard>
          </section>

          <aside className="safety-upload__aside">
            <HbcCard
              header={<SafetySectionHeader title="What happens on submit" />}
              weight="supporting"
            >
              <ol className="safety-upload__next-step">
                <li>
                  <HbcTypography intent="body">Template + version are validated.</HbcTypography>
                </li>
                <li>
                  <HbcTypography intent="body">
                    The project is resolved against HBCentral.
                  </HbcTypography>
                </li>
                <li>
                  <HbcTypography intent="body">
                    Responses are parsed, scored, and written as an authoritative inspection.
                  </HbcTypography>
                </li>
                <li>
                  <HbcTypography intent="body">
                    The source workbook is retained in Safety Checklist Uploads.
                  </HbcTypography>
                </li>
              </ol>
            </HbcCard>
            <HbcCard
              header={<SafetySectionHeader title="If something needs attention" />}
              weight="supporting"
            >
              <HbcTypography intent="body">
                Uploads that can&apos;t commit (review required, parse errors, template mismatches)
                appear in the <strong>Review queue</strong> with one-click retry and a governed
                supersede flow for duplicate-suspected runs.
              </HbcTypography>
            </HbcCard>
          </aside>
        </div>
      </div>
    </WorkspacePageShell>
  );
}

function variantFor(state: IngestionRunResult['state']): { variant: StatusVariant; label: string } {
  switch (state) {
    case 'committed':
      return { variant: 'success', label: 'Committed' };
    case 'review-required':
      return { variant: 'atRisk', label: 'Review required' };
    case 'unresolved-project':
      return { variant: 'warning', label: 'Project unresolved' };
    case 'reporting-period-mismatch':
      return { variant: 'warning', label: 'Period mismatch' };
    case 'parse-error':
      return { variant: 'error', label: 'Parse error' };
    case 'invalid-template':
      return { variant: 'error', label: 'Invalid template' };
    case 'commit-failed':
      return { variant: 'error', label: 'Commit failed' };
    default:
      return { variant: 'neutral', label: state };
  }
}

function IngestionResultBanner({ result }: { result: IngestionRunResult }): ReactNode {
  const bannerVariant =
    result.state === 'committed'
      ? 'success'
      : result.state === 'review-required' ||
          result.state === 'unresolved-project' ||
          result.state === 'reporting-period-mismatch'
        ? 'warning'
        : 'error';
  const status = variantFor(result.state);
  return (
    <HbcBanner variant={bannerVariant}>
      <div className="safety-section">
        <div className="safety-filter-bar">
          <HbcStatusBadge variant={status.variant} label={status.label} />
          <HbcTypography intent="bodySmall">Run: {result.run.id}</HbcTypography>
        </div>
        {result.run.errorSummary && (
          <HbcTypography intent="body">{result.run.errorSummary}</HbcTypography>
        )}
        {result.committed && (
          <HbcTypography intent="body">
            Inspection committed: {result.committed.inspectionEvent.id} (
            {Math.round(result.committed.inspectionEvent.inspectionScore * 100)}% score,{' '}
            {result.committed.findings.length} findings)
          </HbcTypography>
        )}
      </div>
    </HbcBanner>
  );
}
