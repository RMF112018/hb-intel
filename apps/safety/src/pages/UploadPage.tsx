import { useMemo, useState, type ReactNode } from 'react';
import {
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
  type SafetyReportingPeriod,
} from '@hbc/features-safety';
import {
  SafetyFileInput,
  SafetyIngestionOutcome,
  SafetyIntakeReadiness,
  SafetyIntakeStep,
  SafetyMasthead,
  SafetyStatusPanel,
  type SafetyIntakeReadinessRow,
  type SafetyIntakeStepStatus,
} from '../components/index.js';

const OFFICE_ONLY: Array<'office'> = ['office'];

function currentUserUpn(): string {
  if (typeof window === 'undefined') return 'coordinator@hedrickbrothers.com';
  return (window as unknown as { _hbcUpn?: string })._hbcUpn ?? 'coordinator@hedrickbrothers.com';
}

/**
 * UploadPage — Phase-04 audit G-03 flagship Upload redesign.
 *
 * Authored intake workflow with five explicit zones:
 *   1. Masthead (context / purpose / period status)
 *   2. Step 1 — Reporting period (required input; honest blocked posture)
 *   3. Step 2 — Checklist workbook (SafetyFileInput, unchanged)
 *   4. Step 3 — Readiness (authored three-row readiness list)
 *   5. Step 4 — Submit (authoritative primary CTA)
 *   6. Step 5 — Downstream orientation (what submission triggers)
 *   7. Outcome zone (post-submit SafetyIngestionOutcome; mutation-level
 *      transport error routes to SafetyStatusPanel intent="partial-failure")
 *
 * Fatal page states remain owned by WorkspacePageShell; this page does not
 * route periodsQuery fatal through WPS because periods are only one input
 * to the intake workflow — their failure is an in-page blocked step, not
 * a page-level fatal. Transport-level ingestion errors stay local (partial
 * failure), run-level outcomes go through SafetyIngestionOutcome.
 */
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

  const handleSubmit = (): void => {
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

  // ── Readiness model ──────────────────────────────────────────────────
  const periodStatus: SafetyIntakeStepStatus = periodsQuery.isError
    ? 'blocked'
    : periodsQuery.isPending
      ? 'pending'
      : activePeriod
        ? 'ready'
        : 'blocked';

  const workbookStatus: SafetyIntakeStepStatus = file ? 'ready' : 'pending';

  const submitBlockedReason = computeSubmitBlockedReason({
    periodsLoading: periodsQuery.isPending,
    periodsErrored: periodsQuery.isError,
    activePeriod,
    file,
    ingestionPending: ingestion.isPending,
  });

  const submitStatus: SafetyIntakeStepStatus = ingestion.isPending
    ? 'active'
    : submitBlockedReason
      ? 'blocked'
      : 'ready';

  const readinessRows: SafetyIntakeReadinessRow[] = [
    {
      id: 'period',
      label: 'Reporting period selected',
      status:
        periodStatus === 'ready'
          ? 'ready'
          : periodStatus === 'blocked'
            ? 'blocked'
            : 'pending',
      detail:
        periodStatus === 'ready' && activePeriod
          ? `${activePeriod.periodLabel} · status ${activePeriod.status}`
          : periodStatus === 'blocked'
            ? 'Reporting period list is unavailable or empty.'
            : 'Loading reporting periods…',
    },
    {
      id: 'workbook',
      label: 'Checklist workbook chosen',
      status: workbookStatus === 'ready' ? 'ready' : 'pending',
      detail:
        workbookStatus === 'ready' && file
          ? file.name
          : 'No workbook selected yet.',
    },
    {
      id: 'submission',
      label: 'Submission ready',
      status:
        submitStatus === 'ready'
          ? 'ready'
          : submitStatus === 'blocked'
            ? 'blocked'
            : 'pending',
      detail:
        submitStatus === 'ready'
          ? 'All preconditions satisfied. Submit when ready.'
          : submitStatus === 'active'
            ? 'Ingestion in progress.'
            : (submitBlockedReason ?? 'Pending earlier steps.'),
    },
  ];

  const submitDisabled =
    !file ||
    !activePeriod ||
    ingestion.isPending ||
    periodsQuery.isPending ||
    periodsQuery.isError;

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
          meta={
            activePeriod
              ? [
                  { key: 'period', label: activePeriod.periodLabel },
                  {
                    key: 'status',
                    label: `Period status: ${activePeriod.status}`,
                  },
                ]
              : undefined
          }
        />

        <div className="safety-intake-runway" data-safety-ui="intake-runway">
          <SafetyIntakeStep
            stepNumber={1}
            title="Reporting period"
            description="Submission requires an open reporting period. Select one below."
            status={periodStatus}
            statusLabel={
              periodStatus === 'ready' && activePeriod
                ? `Selected · ${activePeriod.status}`
                : undefined
            }
          >
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
                  options={periods.map((p) => ({
                    value: p.id,
                    label: p.periodLabel,
                  }))}
                  disabled={periodsQuery.isPending || periodsQuery.isError}
                />
              </div>
              {activePeriod && (
                <HbcStatusBadge
                  variant={periodBadgeVariant(activePeriod)}
                  label={`Period status: ${activePeriod.status}`}
                  size="small"
                />
              )}
              {periodsQuery.isPending && (
                <HbcTypography intent="bodySmall">
                  Loading reporting periods…
                </HbcTypography>
              )}
            </div>
          </SafetyIntakeStep>

          <SafetyIntakeStep
            stepNumber={2}
            title="Checklist workbook"
            description="Upload a completed v1 Safety Checklist (.xlsx). The source workbook is retained in Safety Checklist Uploads."
            status={workbookStatus}
          >
            <SafetyFileInput
              label="Checklist workbook (.xlsx)"
              helpText="Use the current v1 Safety Checklist template. The parser expects the canonical template structure."
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              selectedFile={file}
              onFileSelected={setFile}
              onClear={() => setFile(null)}
              disabled={periodsQuery.isError}
            />
          </SafetyIntakeStep>

          <SafetyIntakeStep
            stepNumber={3}
            title="Readiness"
            description="Each precondition must be ready before submission."
            status={submitStatus === 'ready' ? 'ready' : submitStatus}
          >
            <SafetyIntakeReadiness
              rows={readinessRows}
              ariaLabel="Upload submission readiness"
            />
          </SafetyIntakeStep>

          <SafetyIntakeStep
            stepNumber={4}
            title="Submit"
            description="Submission commits against the selected reporting period. The pipeline validates, resolves, parses, scores, and writes the authoritative inspection record."
            status={submitStatus}
            statusLabel={
              ingestion.isPending
                ? 'Processing'
                : submitStatus === 'ready'
                  ? 'Ready to submit'
                  : undefined
            }
          >
            <div className="safety-intake-submit">
              <HbcButton
                variant="primary"
                onClick={handleSubmit}
                disabled={submitDisabled}
                loading={ingestion.isPending}
              >
                {ingestion.isPending ? 'Processing…' : 'Submit checklist'}
              </HbcButton>
              {submitBlockedReason && !ingestion.isPending && (
                <HbcTypography intent="bodySmall">
                  {submitBlockedReason}
                </HbcTypography>
              )}
            </div>
          </SafetyIntakeStep>

          <SafetyIntakeStep
            stepNumber={5}
            title="What happens next"
            description="Every submission runs through the same governed pipeline."
          >
            <HbcCard weight="supporting">
              <ol className="safety-upload__next-step">
                <li>
                  <HbcTypography intent="body">
                    Template + version are validated.
                  </HbcTypography>
                </li>
                <li>
                  <HbcTypography intent="body">
                    The project is resolved against HBCentral.
                  </HbcTypography>
                </li>
                <li>
                  <HbcTypography intent="body">
                    Responses are parsed, scored, and written as an authoritative
                    inspection.
                  </HbcTypography>
                </li>
                <li>
                  <HbcTypography intent="body">
                    Uploads that can&apos;t commit (review required, parse errors,
                    template mismatches) appear in the <strong>Review queue</strong>{' '}
                    with one-click retry and a governed supersede flow for
                    duplicate-suspected runs.
                  </HbcTypography>
                </li>
              </ol>
            </HbcCard>
          </SafetyIntakeStep>

          {(ingestion.data || ingestion.error) && (
            <section
              className="safety-intake-outcome-zone"
              data-safety-ui="intake-outcome-zone"
              aria-labelledby="safety-intake-outcome-heading"
            >
              <div className="safety-intake-outcome-zone__heading">
                <HbcTypography intent="label">
                  <span id="safety-intake-outcome-heading">Submission outcome</span>
                </HbcTypography>
              </div>
              {ingestion.data && <SafetyIngestionOutcome result={ingestion.data} />}
              {ingestion.error && (
                <SafetyStatusPanel
                  intent="partial-failure"
                  data-safety-ui="upload-ingestion-error"
                  description="Upload transport failed before the pipeline could terminate."
                  detail={uploadErrorMessage(ingestion.error)}
                />
              )}
            </section>
          )}
        </div>
      </div>
    </WorkspacePageShell>
  );
}

interface SubmitReadinessInput {
  readonly periodsLoading: boolean;
  readonly periodsErrored: boolean;
  readonly activePeriod: SafetyReportingPeriod | undefined;
  readonly file: File | null;
  readonly ingestionPending: boolean;
}

function computeSubmitBlockedReason(input: SubmitReadinessInput): string | null {
  if (input.ingestionPending) return null;
  if (input.periodsLoading) return 'Loading reporting periods.';
  if (input.periodsErrored) return 'Reporting periods failed to load — resolve before submission.';
  if (!input.activePeriod) return 'No reporting period selected.';
  if (!input.file) return 'No workbook chosen yet.';
  return null;
}

function periodBadgeVariant(period: SafetyReportingPeriod): StatusVariant {
  switch (period.status) {
    case 'open':
      return 'success';
    case 'closed':
      return 'atRisk';
    case 'published':
      return 'info';
    default:
      return 'neutral';
  }
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
    if (error.kind === 'security-validation') {
      return (
        'SharePoint rejected the upload request due to security validation. ' +
        'Retry the upload; if this continues, contact support with this error.'
      );
    }
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
