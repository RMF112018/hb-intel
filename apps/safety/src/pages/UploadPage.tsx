import { useMemo, useState, type ReactNode } from 'react';
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
  SafetyUploadError,
  isSafetyAdapterFetchError,
  isSafetyConfigurationError,
  useReportingPeriods,
  useSafetyIngestion,
  type IngestionRunResult,
} from '@hbc/features-safety';
import {
  SafetyFileInput,
  SafetyMasthead,
  SafetySectionHeader,
  SafetyStatusPanel,
} from '../components/index.js';

const OFFICE_ONLY: Array<'office'> = ['office'];

function currentUserUpn(): string {
  if (typeof window === 'undefined') return 'coordinator@hedrickbrothers.com';
  return (window as unknown as { _hbcUpn?: string })._hbcUpn ?? 'coordinator@hedrickbrothers.com';
}

export function UploadPage(): ReactNode {
  const periodsQuery = useReportingPeriods();
  const periods = periodsQuery.data ?? [];
  const ingestion = useSafetyIngestion();
  const [file, setFile] = useState<File | null>(null);
  const [reportingPeriodId, setReportingPeriodId] = useState<string>('');

  const activePeriod = useMemo(
    () => periods.find((p) => p.id === reportingPeriodId) ?? periods[0],
    [periods, reportingPeriodId],
  );

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
                  <SafetyStatusPanel
                    intent="blocked"
                    data-safety-ui="upload-periods-blocked"
                    description={reportingPeriodLoadMessage(periodsQuery.error)}
                    action={{
                      label: 'Retry loading periods',
                      variant: 'secondary',
                      onClick: () => void periodsQuery.refetch(),
                      isPending: periodsQuery.isFetching,
                      pendingLabel: 'Retrying…',
                    }}
                  />
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
                  <SafetyFileInput
                    label="Checklist workbook (.xlsx)"
                    accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    selectedFile={file}
                    onFileSelected={setFile}
                    onClear={() => setFile(null)}
                    disabled={periodsQuery.isError}
                  />
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
                  <SafetyStatusPanel
                    intent="partial-failure"
                    data-safety-ui="upload-ingestion-error"
                    description="Upload failed."
                    detail={uploadErrorMessage(ingestion.error)}
                  />
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

function reportingPeriodLoadMessage(error: unknown): string {
  if (isSafetyConfigurationError(error)) {
    return (
      `Could not load reporting periods because safety list binding is incomplete ` +
      `(${error.listName}${error.descriptorKey ? ` / ${error.descriptorKey}` : ''}). ` +
      'Submission is disabled until hosted list GUID binding is fixed.'
    );
  }
  if (isSafetyAdapterFetchError(error)) {
    return (
      `Could not load reporting periods from ${error.listName} ` +
      `(${error.httpStatus}). Submission is disabled until the data source is reachable.`
    );
  }
  if (error instanceof Error && error.message) {
    return `Could not load reporting periods. Submission is disabled: ${error.message}`;
  }
  return 'Could not load reporting periods. Submission is disabled until the period list is available.';
}

function uploadErrorMessage(error: unknown): string {
  if (error instanceof SafetyUploadError) {
    if (error.kind === 'permission' && error.stage === 'upload-post') {
      return (
        'You do not have permission to upload to Safety Checklist Uploads. ' +
        'Contact the Safety site owner if upload access should be available.'
      );
    }
    if (error.kind === 'not-found') {
      return (
        'Safety Checklist Uploads could not be found at the configured location. ' +
        'Verify upload-library binding and path configuration.'
      );
    }
    if (error.kind === 'binding') {
      return (
        'Upload library identity is not configured in this runtime. ' +
        'SafetyChecklistUploads GUID binding is required before submission.'
      );
    }
    if (error.kind === 'metadata-lookup') {
      return (
        'The file was uploaded but metadata lookup failed, so the run could not continue. ' +
        'Retry or contact support with this failure.'
      );
    }
  }
  if (error instanceof Error && error.message) return error.message;
  return 'Upload failed due to an unexpected error.';
}
