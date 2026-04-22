import { useMemo, useState, type ReactNode } from 'react';
import {
  HbcButton,
  HbcCard,
  HbcSelect,
  HbcStatusBadge,
  HbcTextField,
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
  SafetyProjectPicker,
  SafetyStatusPanel,
  toSafetyProjectSourceClassification,
  type SafetyIntakeReadinessRow,
  type SafetyIntakeStepStatus,
  type SafetyProjectPickerValue,
} from '../components/index.js';

const OFFICE_ONLY: Array<'office'> = ['office'];

function currentUserUpn(): string {
  if (typeof window === 'undefined') return 'coordinator@hedrickbrothers.com';
  return (window as unknown as { _hbcUpn?: string })._hbcUpn ?? 'coordinator@hedrickbrothers.com';
}

const INSPECTION_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isValidCalendarDate(value: string): boolean {
  // Plain-calendar-date contract (G-03 Wave 2 revision): `YYYY-MM-DD`,
  // no time component, no timezone conversion. We validate the shape
  // only; no Date construction (that would risk a local-TZ shift).
  return INSPECTION_DATE_PATTERN.test(value);
}

function isValidInspectionNumber(value: string): boolean {
  if (value.length === 0) return false;
  return /^\d+$/.test(value);
}

/**
 * UploadPage — Phase-04 audit G-03 Wave 2 revision.
 *
 * Structured intake + workbook submission. Operators confirm project and
 * inspection metadata BEFORE uploading; those operator-entered values are
 * authoritative for SafetyInspectionEvents.ProjectNumber, InspectionNumber,
 * and InspectionDate writes. Workbook-parsed equivalents become secondary
 * (provenance + advisory mismatch).
 *
 * Runway:
 *   1. Masthead
 *   2. Step 1 — Project (SafetyProjectPicker)
 *   3. Step 2 — Inspection details (InspectionNumber + InspectionDate)
 *   4. Step 3 — Reporting period
 *   5. Step 4 — Checklist workbook
 *   6. Step 5 — Readiness
 *   7. Step 6 — Submit
 *   8. Step 7 — What happens next
 *   9. Outcome zone (terminal + mismatch advisory)
 */
export function UploadPage(): ReactNode {
  const periodsQuery = useReportingPeriods();
  const periods = periodsQuery.data ?? [];
  const ingestion = useSafetyIngestion();

  const [file, setFile] = useState<File | null>(null);
  const [reportingPeriodId, setReportingPeriodId] = useState<string>('');
  const [selectedProject, setSelectedProject] =
    useState<SafetyProjectPickerValue | null>(null);
  const [inspectionNumber, setInspectionNumber] = useState<string>('');
  const [inspectionDate, setInspectionDate] = useState<string>('');

  const activePeriod = useMemo(
    () => periods.find((p) => p.id === reportingPeriodId) ?? periods[0],
    [periods, reportingPeriodId],
  );

  const inspectionNumberValid = isValidInspectionNumber(inspectionNumber);
  const inspectionDateValid = isValidCalendarDate(inspectionDate);

  const handleSubmit = (): void => {
    if (!file || !activePeriod) return;
    if (!selectedProject) return;
    if (!inspectionNumberValid || !inspectionDateValid) return;
    ingestion.mutate({
      file,
      context: {
        uploadedByUpn: currentUserUpn(),
        uploadedAt: new Date().toISOString(),
        fileName: file.name,
        reportingPeriodId: activePeriod.id,
        reportingPeriodSpItemId: activePeriod.spItemId,
        // G-03 structured intake authority (Wave 2 revision). These
        // operator-entered values are authoritative for ProjectNumber,
        // InspectionNumber, and InspectionDate writes. `inspectionDate`
        // travels as the operator-selected calendar day verbatim — no
        // Date construction, no UTC conversion.
        projectNumber: selectedProject.projectNumber,
        projectNameSnapshot: selectedProject.projectName,
        projectLocationSnapshot: selectedProject.projectLocation,
        projectStageSnapshot: selectedProject.projectStage,
        projectSourceClassification: toSafetyProjectSourceClassification(
          selectedProject.sourceClassification,
        ),
        projectLookupId:
          selectedProject.sourceRefs.projectsListId ?? undefined,
        legacyRegistryItemId:
          selectedProject.sourceClassification === 'legacy-only'
            ? selectedProject.id
            : undefined,
        inspectionNumber,
        inspectionDate,
      },
    });
  };

  // ── Readiness model ──────────────────────────────────────────────────
  const projectStatus: SafetyIntakeStepStatus = selectedProject ? 'ready' : 'pending';
  const inspectionDetailsStatus: SafetyIntakeStepStatus =
    inspectionNumberValid && inspectionDateValid ? 'ready' : 'pending';
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
    projectSelected: selectedProject !== null,
    inspectionNumberValid,
    inspectionDateValid,
  });

  const submitStatus: SafetyIntakeStepStatus = ingestion.isPending
    ? 'active'
    : submitBlockedReason
      ? 'blocked'
      : 'ready';

  const readinessRows: SafetyIntakeReadinessRow[] = [
    {
      id: 'project',
      label: 'Project selected',
      status: projectStatus === 'ready' ? 'ready' : 'pending',
      detail:
        selectedProject
          ? `${selectedProject.projectName || 'Project'} · ${selectedProject.projectNumber || '—'}`
          : 'No project selected yet.',
    },
    {
      id: 'inspection-details',
      label: 'Inspection number and date entered',
      status: inspectionDetailsStatus,
      detail:
        inspectionDetailsStatus === 'ready'
          ? `Inspection #${inspectionNumber} on ${inspectionDate}`
          : 'Inspection number (integer) and inspection date (YYYY-MM-DD) are required.',
    },
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
    !selectedProject ||
    !inspectionNumberValid ||
    !inspectionDateValid ||
    ingestion.isPending ||
    periodsQuery.isPending ||
    periodsQuery.isError;

  const mismatch = ingestion.data?.metadataMismatch;

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
          description="Confirm the project and inspection details, then upload the completed v1 Safety Checklist workbook. Your selections populate the authoritative Safety record; the workbook provides provenance and scoring."
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
            title="Project"
            description="Search by project name or number. Operator-selected project populates the authoritative Safety inspection record."
            status={projectStatus}
            statusLabel={projectStatus === 'ready' ? 'Selected' : undefined}
          >
            <SafetyProjectPicker
              label="Project"
              helpText="Matches cover current and legacy projects (same seam the Project Sites directory uses)."
              selected={selectedProject}
              onSelect={setSelectedProject}
            />
          </SafetyIntakeStep>

          <SafetyIntakeStep
            stepNumber={2}
            title="Inspection details"
            description="Enter the inspection number and the calendar date the inspection was performed."
            status={inspectionDetailsStatus}
            statusLabel={inspectionDetailsStatus === 'ready' ? 'Ready' : undefined}
          >
            <div
              className="safety-project-picker-fields"
              data-safety-ui="inspection-details"
            >
              <div className="safety-project-picker-field">
                <HbcTextField
                  label="Inspection number"
                  type="number"
                  value={inspectionNumber}
                  onChange={setInspectionNumber}
                  placeholder="e.g. 3"
                  validationMessage={
                    inspectionNumber.length > 0 && !inspectionNumberValid
                      ? 'Inspection number must be a non-negative integer.'
                      : undefined
                  }
                />
                <HbcTypography intent="bodySmall">
                  Integer inspection number from the source workbook. This is
                  the authoritative value for the safety record.
                </HbcTypography>
              </div>
              <div className="safety-project-picker-field">
                <HbcTextField
                  label="Inspection date"
                  type="date"
                  value={inspectionDate}
                  onChange={setInspectionDate}
                  validationMessage={
                    inspectionDate.length > 0 && !inspectionDateValid
                      ? 'Inspection date must be a calendar day (YYYY-MM-DD).'
                      : undefined
                  }
                />
                <HbcTypography intent="bodySmall">
                  Calendar day the inspection was performed. Stored as-is, never
                  timezone-shifted.
                </HbcTypography>
              </div>
            </div>
          </SafetyIntakeStep>

          <SafetyIntakeStep
            stepNumber={3}
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
            stepNumber={4}
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
            stepNumber={5}
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
            stepNumber={6}
            title="Submit"
            description="Submission commits against the selected reporting period. The pipeline validates the template, parses responses, scores, and writes the authoritative inspection record."
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
            stepNumber={7}
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
                    The operator-selected project is honored (workbook values are
                    kept for provenance only).
                  </HbcTypography>
                </li>
                <li>
                  <HbcTypography intent="body">
                    Responses are parsed, scored, and written as an authoritative
                    inspection — with your inspection number and date as the
                    authoritative source.
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
              {mismatch && (
                <div
                  className="safety-mismatch-advisory"
                  data-safety-ui="metadata-mismatch-advisory"
                  role="status"
                >
                  <HbcTypography intent="label">
                    Workbook metadata did not match your intake entries
                  </HbcTypography>
                  <HbcTypography intent="bodySmall">
                    The committed record uses your entered values. Workbook values
                    are kept as provenance.
                  </HbcTypography>
                  <ul>
                    {mismatch.projectNumberMismatch && (
                      <li>
                        <HbcTypography intent="bodySmall">
                          Project number — entered{' '}
                          <strong>{mismatch.projectNumberMismatch.entered}</strong>,
                          workbook <em>{mismatch.projectNumberMismatch.parsed}</em>
                        </HbcTypography>
                      </li>
                    )}
                    {mismatch.inspectionNumberMismatch && (
                      <li>
                        <HbcTypography intent="bodySmall">
                          Inspection number — entered{' '}
                          <strong>{mismatch.inspectionNumberMismatch.entered}</strong>,
                          workbook <em>{mismatch.inspectionNumberMismatch.parsed}</em>
                        </HbcTypography>
                      </li>
                    )}
                    {mismatch.inspectionDateMismatch && (
                      <li>
                        <HbcTypography intent="bodySmall">
                          Inspection date — entered{' '}
                          <strong>{mismatch.inspectionDateMismatch.entered}</strong>,
                          workbook <em>{mismatch.inspectionDateMismatch.parsed}</em>
                        </HbcTypography>
                      </li>
                    )}
                  </ul>
                </div>
              )}
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
  readonly projectSelected: boolean;
  readonly inspectionNumberValid: boolean;
  readonly inspectionDateValid: boolean;
}

function computeSubmitBlockedReason(input: SubmitReadinessInput): string | null {
  if (input.ingestionPending) return null;
  if (!input.projectSelected) return 'Select a project before submission.';
  if (!input.inspectionNumberValid) return 'Enter a valid inspection number.';
  if (!input.inspectionDateValid) return 'Enter a valid inspection date (YYYY-MM-DD).';
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
