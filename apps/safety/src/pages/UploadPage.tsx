import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  HbcButton,
  HbcCard,
  HbcCheckbox,
  HbcSelect,
  HbcStatusBadge,
  HbcTextField,
  HbcTypography,
  WorkspacePageShell,
} from '@hbc/ui-kit';
import type { StatusVariant } from '@hbc/ui-kit';
import {
  isSafetyAdapterFetchError,
  isSafetyConfigurationError,
  useSafetyIngestionPreview,
  useReportingPeriods,
  useSafetyIngestion,
  type SafetyIngestionPreviewResult,
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
  SupportDetailsPanel,
  toSafetyProjectSourceClassification,
  type SafetyIntakeReadinessRow,
  type SafetyIntakeStepStatus,
  type SafetyProjectPickerValue,
} from '../components/index.js';
import { uploadFailureMessage } from './supportTruth.js';
import { formatAuthoritySource, formatMarkerState } from './previewDiagnostics.js';

const OFFICE_ONLY: Array<'office'> = ['office'];
const MAX_CHECKLIST_WORKBOOK_BYTES = 10 * 1024 * 1024;
const CHECKLIST_EXTENSION = '.xlsx';
const CHECKLIST_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const VISUALLY_HIDDEN_STYLE = {
  border: 0,
  clip: 'rect(0 0 0 0)',
  height: '1px',
  margin: '-1px',
  overflow: 'hidden',
  padding: 0,
  position: 'absolute' as const,
  width: '1px',
};

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
 * inspection metadata BEFORE uploading. Preview then applies parser-authority
 * rules: markered parser-meta/named-range values win; operator-entered
 * metadata remains context/provenance and may be used for legacy fallback.
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
  const preview = useSafetyIngestionPreview();
  const ingestion = useSafetyIngestion();

  const [file, setFile] = useState<File | null>(null);
  const [fileErrorText, setFileErrorText] = useState<string | null>(null);
  const handleFileSelected = (selected: File | null): void => {
    if (!selected) {
      setFile(null);
      setFileErrorText(null);
      return;
    }
    const hasValidExtension = selected.name.toLowerCase().endsWith(CHECKLIST_EXTENSION);
    if (!hasValidExtension) {
      setFile(null);
      setFileErrorText('Checklist workbook must use the .xlsx extension.');
      return;
    }
    if (selected.type && selected.type !== CHECKLIST_MIME) {
      setFile(null);
      setFileErrorText('Checklist workbook must be an Excel .xlsx file.');
      return;
    }
    if (selected.size > MAX_CHECKLIST_WORKBOOK_BYTES) {
      setFile(null);
      setFileErrorText('Checklist workbook must be 10 MB or smaller.');
      return;
    }
    setFile(selected);
    setFileErrorText(null);
  };

  const [reportingPeriodId, setReportingPeriodId] = useState<string>('');
  const [selectedProject, setSelectedProject] =
    useState<SafetyProjectPickerValue | null>(null);
  const [inspectionNumber, setInspectionNumber] = useState<string>('');
  const [inspectionDate, setInspectionDate] = useState<string>('');
  const [previewConfirmed, setPreviewConfirmed] = useState(false);
  const [lastPreviewSignature, setLastPreviewSignature] = useState<string | null>(null);
  const [hasPreviewRun, setHasPreviewRun] = useState(false);
  const [previewErrorObservedAt, setPreviewErrorObservedAt] = useState<Date | null>(null);
  const [ingestErrorObservedAt, setIngestErrorObservedAt] = useState<Date | null>(null);
  const submitAbortRef = useRef<AbortController | null>(null);
  const previewAbortRef = useRef<AbortController | null>(null);
  const previousSignatureRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      submitAbortRef.current?.abort();
      previewAbortRef.current?.abort();
      submitAbortRef.current = null;
      previewAbortRef.current = null;
    };
  }, []);

  const activePeriod = useMemo(
    () => periods.find((p) => p.id === reportingPeriodId) ?? periods[0],
    [periods, reportingPeriodId],
  );

  const inspectionNumberValid = isValidInspectionNumber(inspectionNumber);
  const inspectionDateValid = isValidCalendarDate(inspectionDate);
  const intakeReady =
    !!file &&
    !!activePeriod &&
    !!selectedProject &&
    inspectionNumberValid &&
    inspectionDateValid &&
    !periodsQuery.isPending &&
    !periodsQuery.isError;
  const intakeSignature = useMemo(() => {
    if (!file || !activePeriod || !selectedProject) return '';
    return [
      file.name,
      file.size,
      file.lastModified,
      activePeriod.id,
      activePeriod.spItemId,
      selectedProject.id,
      selectedProject.projectNumber,
      selectedProject.sourceClassification,
      inspectionNumber,
      inspectionDate,
    ].join('|');
  }, [file, activePeriod, selectedProject, inspectionNumber, inspectionDate]);

  const buildMutationInput = (): {
    readonly file: File;
    readonly context: {
      uploadedByUpn: string;
      uploadedAt: string;
      fileName: string;
      reportingPeriodId: string;
      reportingPeriodSpItemId: number;
      projectNumber: string;
      projectNameSnapshot: string;
      projectLocationSnapshot: string;
      projectStageSnapshot: string;
      projectSourceClassification: ReturnType<typeof toSafetyProjectSourceClassification>;
      projectLookupId?: number;
      legacyRegistryItemId?: number;
      inspectionNumber: string;
      inspectionDate: string;
    };
  } | null => {
    if (!file || !activePeriod || !selectedProject) return null;
    return {
      file,
      context: {
        uploadedByUpn: currentUserUpn(),
        uploadedAt: new Date().toISOString(),
        fileName: file.name,
        reportingPeriodId: activePeriod.id,
        reportingPeriodSpItemId: activePeriod.spItemId,
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
    };
  };

  const runPreview = (isAuto: boolean): void => {
    const mutationInput = buildMutationInput();
    if (!mutationInput) return;
    previewAbortRef.current?.abort();
    const controller = new AbortController();
    previewAbortRef.current = controller;
    if (!isAuto) {
      setHasPreviewRun(true);
    }
    setPreviewConfirmed(false);
    preview.mutate({
      ...mutationInput,
      commandOptions: {
        signal: controller.signal,
      },
    });
  };

  const handlePreview = (): void => {
    if (!intakeReady) return;
    runPreview(false);
  };

  const handleCommit = (): void => {
    if (!intakeReady) return;
    if (!preview.data?.commitReadiness) return;
    if (!previewConfirmed) return;
    if (lastPreviewSignature !== intakeSignature) return;
    const mutationInput = buildMutationInput();
    if (!mutationInput) return;
    submitAbortRef.current?.abort();
    const controller = new AbortController();
    submitAbortRef.current = controller;
    ingestion.mutate({
      ...mutationInput,
      commandOptions: {
        signal: controller.signal,
      },
    });
  };

  useEffect(() => {
    if (!hasPreviewRun) return;
    if (!intakeReady) return;
    if (preview.isPending) return;
    const previous = previousSignatureRef.current;
    if (previous && previous !== intakeSignature) {
      runPreview(true);
    }
    previousSignatureRef.current = intakeSignature;
  }, [hasPreviewRun, intakeReady, intakeSignature, preview.isPending]);

  useEffect(() => {
    if (preview.isSuccess && preview.data && intakeSignature) {
      setLastPreviewSignature(intakeSignature);
    }
  }, [preview.isSuccess, preview.data, intakeSignature]);

  useEffect(() => {
    if (preview.error && !previewErrorObservedAt) {
      setPreviewErrorObservedAt(new Date());
    } else if (!preview.error && previewErrorObservedAt) {
      setPreviewErrorObservedAt(null);
    }
  }, [preview.error, previewErrorObservedAt]);

  useEffect(() => {
    if (ingestion.error && !ingestErrorObservedAt) {
      setIngestErrorObservedAt(new Date());
    } else if (!ingestion.error && ingestErrorObservedAt) {
      setIngestErrorObservedAt(null);
    }
  }, [ingestion.error, ingestErrorObservedAt]);

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

  const previewBlockedReason = computeSubmitBlockedReason({
    periodsLoading: periodsQuery.isPending,
    periodsErrored: periodsQuery.isError,
    activePeriod,
    file,
    ingestionPending: ingestion.isPending || preview.isPending,
    projectSelected: selectedProject !== null,
    inspectionNumberValid,
    inspectionDateValid,
  });

  const previewStatus: SafetyIntakeStepStatus = preview.isPending
    ? 'active'
    : previewBlockedReason
      ? 'blocked'
      : preview.data?.commitReadiness
        ? 'ready'
        : preview.data
          ? 'blocked'
          : 'pending';
  const commitReady =
    !!preview.data?.commitReadiness &&
    previewConfirmed &&
    lastPreviewSignature === intakeSignature &&
    !preview.isPending &&
    !ingestion.isPending;
  const commitStatus: SafetyIntakeStepStatus = ingestion.isPending
    ? 'active'
    : commitReady
      ? 'ready'
      : 'blocked';

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
      id: 'preview',
      label: 'Preview result',
      status:
        previewStatus === 'ready'
          ? 'ready'
          : previewStatus === 'blocked'
            ? 'blocked'
            : 'pending',
      detail:
        preview.isPending
          ? 'Preview is running against the current intake context.'
          : preview.data?.commitReadiness
            ? `Preview passed with ${preview.data.warnings.length} warning(s).`
            : preview.data
              ? `Preview blocked by ${preview.data.blockingErrors.length} blocker(s).`
              : (previewBlockedReason ?? 'Run preview once intake is ready.'),
    },
    {
      id: 'commit',
      label: 'Commit confirmation',
      status: commitStatus === 'ready' ? 'ready' : 'blocked',
      detail:
        commitReady
          ? 'Commit is enabled for the current previewed context.'
          : 'Commit stays disabled until preview is commit-ready and confirmed.',
    },
  ];

  const previewDisabled = !intakeReady || preview.isPending || ingestion.isPending;
  const commitDisabled = !commitReady || ingestion.isPending;

  const mismatch = ingestion.data?.metadataMismatch;
  const previewFailure = uploadFailureMessage(
    preview.error,
    previewErrorObservedAt ?? undefined,
  );
  const commitFailure = uploadFailureMessage(
    ingestion.error,
    ingestErrorObservedAt ?? undefined,
  );
  const politeAnnouncement = useMemo(() => {
    if (preview.isPending) return 'Preview in progress for current intake context.';
    if (ingestion.isPending) return 'Commit in progress for current previewed context.';
    if (ingestion.data) return 'Commit finished. Submission outcome is available.';
    if (preview.data?.commitReadiness) {
      return 'Preview completed. Commit is ready after confirmation.';
    }
    if (preview.data) {
      return `Preview completed with ${preview.data.blockingErrors.length} blocker(s).`;
    }
    return '';
  }, [preview.isPending, ingestion.isPending, ingestion.data, preview.data]);
  const alertAnnouncement = useMemo(() => {
    if (ingestion.error) return `${commitFailure.headline} ${commitFailure.detail}`;
    if (preview.error) return `${previewFailure.headline} ${previewFailure.detail}`;
    return '';
  }, [ingestion.error, preview.error, commitFailure.headline, commitFailure.detail, previewFailure.headline, previewFailure.detail]);

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
          description="Confirm project and inspection details, then upload the completed v1 Safety Checklist workbook. Preview shows parser authority, compatibility, and commit blockers before commit."
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
            description="Search by project name or number. Selection provides intake context for preview, project resolution, and commit."
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
                  Integer inspection number used as intake context. For markered
                  templates, parser-meta/named-range values remain authoritative.
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
              helpText="Use the current v1 Safety Checklist template. File must be .xlsx and 10 MB or smaller."
              errorText={fileErrorText ?? undefined}
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              selectedFile={file}
              onFileSelected={handleFileSelected}
              onClear={() => handleFileSelected(null)}
              disabled={periodsQuery.isError}
            />
          </SafetyIntakeStep>

          <SafetyIntakeStep
            stepNumber={5}
            title="Readiness"
            description="Each precondition must be ready before submission."
            status={previewStatus === 'ready' ? 'ready' : previewStatus}
          >
            <SafetyIntakeReadiness
              rows={readinessRows}
              ariaLabel="Upload submission readiness"
            />
          </SafetyIntakeStep>

          <SafetyIntakeStep
            stepNumber={6}
            title="Preview and commit"
            description="Run preview first. Commit is enabled only when the latest preview says this context is commit-ready."
            status={commitStatus}
            statusLabel={
              ingestion.isPending
                ? 'Processing'
                : commitStatus === 'ready'
                  ? 'Ready to commit'
                  : undefined
            }
          >
            <div
              style={VISUALLY_HIDDEN_STYLE}
              role="status"
              aria-live="polite"
              aria-atomic={true}
              data-safety-ui="upload-live-status"
            >
              {politeAnnouncement}
            </div>
            <div
              style={VISUALLY_HIDDEN_STYLE}
              role="alert"
              aria-atomic={true}
              data-safety-ui="upload-live-alert"
            >
              {alertAnnouncement}
            </div>
            <div className="safety-intake-submit">
              <HbcButton
                variant="primary"
                onClick={handlePreview}
                disabled={previewDisabled}
                loading={preview.isPending}
              >
                {preview.isPending ? 'Previewing…' : 'Preview checklist'}
              </HbcButton>
              <HbcButton
                variant="primary"
                onClick={handleCommit}
                disabled={commitDisabled}
                loading={ingestion.isPending}
              >
                {ingestion.isPending ? 'Committing…' : 'Commit inspection'}
              </HbcButton>
              {ingestion.isPending && (
                <HbcButton
                  variant="secondary"
                  onClick={() => submitAbortRef.current?.abort()}
                >
                  Cancel commit
                </HbcButton>
              )}
              {preview.isPending && (
                <HbcButton
                  variant="secondary"
                  onClick={() => previewAbortRef.current?.abort()}
                >
                  Cancel preview
                </HbcButton>
              )}
              <div className="safety-intake-confirm">
                <HbcCheckbox
                  label="I confirm this commit uses the latest previewed checklist and intake context."
                  checked={previewConfirmed}
                  disabled={!preview.data?.commitReadiness || preview.isPending}
                  onChange={(checked) => setPreviewConfirmed(checked)}
                />
              </div>
              {previewBlockedReason && !ingestion.isPending && !preview.data && (
                <HbcTypography intent="bodySmall">
                  {previewBlockedReason}
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
                    Preview validates template compatibility, parser output, reporting period, project resolution, and duplicate risk.
                  </HbcTypography>
                </li>
                <li>
                  <HbcTypography intent="body">
                    Preview warnings and blockers are shown before commit. Blockers must be resolved before commit is enabled.
                  </HbcTypography>
                </li>
                <li>
                  <HbcTypography intent="body">
                    Commit runs only after a commit-ready preview and your explicit confirmation of the previewed context.
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

          {(ingestion.data || ingestion.error || preview.data || preview.error) && (
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
                  description={commitFailure.headline}
                  detail={commitFailure.detail}
                  role="alert"
                  ariaLive="assertive"
                  ariaAtomic={true}
                />
              )}
              {ingestion.error && (
                <SupportDetailsPanel
                  details={commitFailure.support}
                  suggestedAction={commitFailure.suggestedAction}
                  data-safety-ui="upload-ingestion-support-details"
                />
              )}
              {preview.data && (
                <PreviewSummary preview={preview.data} />
              )}
              {preview.error && (
                <SafetyStatusPanel
                  intent="partial-failure"
                  data-safety-ui="upload-preview-error"
                  description={previewFailure.headline}
                  detail={previewFailure.detail}
                  role="alert"
                  ariaLive="assertive"
                  ariaAtomic={true}
                />
              )}
              {preview.error && (
                <SupportDetailsPanel
                  details={previewFailure.support}
                  suggestedAction={previewFailure.suggestedAction}
                  data-safety-ui="upload-preview-support-details"
                />
              )}
            </section>
          )}
        </div>
      </div>
    </WorkspacePageShell>
  );
}

function PreviewSummary({
  preview,
}: {
  readonly preview: SafetyIngestionPreviewResult;
}): ReactNode {
  const authority = preview.metadataAuthority;
  const markerState = formatMarkerState(preview.diagnosticSummary.checks.parserContractMarkerState);
  return (
    <div className="safety-preview-summary" data-safety-ui="preview-summary">
      <HbcTypography intent="label">Preview diagnostics</HbcTypography>
      <HbcTypography intent="bodySmall">
        Commit readiness: {preview.commitReadiness ? 'ready' : 'blocked'} · failure class:{' '}
        {preview.diagnosticSummary.failureClass}
      </HbcTypography>
      <HbcTypography intent="bodySmall">
        Authority rule: for markered templates, parser-meta and named-range values are authoritative;
        intake context is advisory unless legacy fallback is used.
      </HbcTypography>
      <ul>
        <li>
          <HbcTypography intent="bodySmall">
            Template: {preview.template.valid ? 'compatible' : 'incompatible'} (
            {preview.template.templateVersion ?? 'unknown'})
          </HbcTypography>
        </li>
        <li>
          <HbcTypography intent="bodySmall">
            Parser contract: {preview.template.parserContractVersion ?? 'unknown'} / marker state:{' '}
            {markerState}
          </HbcTypography>
        </li>
        <li>
          <HbcTypography intent="bodySmall">
            Parse/metadata: {preview.metadata ? 'parsed' : 'not parsed'}
          </HbcTypography>
        </li>
        <li>
          <HbcTypography intent="bodySmall">
            Reporting period: {preview.reportingPeriod?.resolved ? 'resolved' : 'unresolved'} / date in range:{' '}
            {preview.reportingPeriod?.dateInRange ? 'yes' : 'no'}
          </HbcTypography>
        </li>
        <li>
          <HbcTypography intent="bodySmall">
            Project: {preview.projectResolution.resolved ? 'resolved' : 'unresolved'} (
            {preview.projectResolution.classification})
          </HbcTypography>
        </li>
        <li>
          <HbcTypography intent="bodySmall">
            Duplicate risk: {preview.duplicateRisk?.confidence ?? 'none'} / supersession risk:{' '}
            {preview.duplicateRisk?.supersessionRisk ? 'yes' : 'no'}
          </HbcTypography>
        </li>
      </ul>
      {authority && (
        <>
          <HbcTypography intent="label">Metadata authority</HbcTypography>
          <ul>
            <li>
              <HbcTypography intent="bodySmall">
                Inspection date: {authority.inspectionDate.source}
                {authority.inspectionDate.usedContext ? ' (context fallback used)' : ''}
              </HbcTypography>
            </li>
            <li>
              <HbcTypography intent="bodySmall">
                Inspection number: {authority.inspectionNumber.source}
                {authority.inspectionNumber.usedContext ? ' (context fallback used)' : ''}
              </HbcTypography>
            </li>
            <li>
              <HbcTypography intent="bodySmall">
                Project site: {formatAuthoritySource(authority.projectSite)} · key findings:{' '}
                {formatAuthoritySource(authority.keyFindings)}
              </HbcTypography>
            </li>
            <li>
              <HbcTypography intent="bodySmall">
                Reporting week start/end: {formatAuthoritySource(authority.reportingWeekStart)} /{' '}
                {formatAuthoritySource(authority.reportingWeekEnd)}
              </HbcTypography>
            </li>
            <li>
              <HbcTypography intent="bodySmall">
                Reporting period label: {formatAuthoritySource(authority.reportingPeriodLabel)}
              </HbcTypography>
            </li>
          </ul>
        </>
      )}
      <HbcTypography intent="label">Blocking errors ({preview.blockingErrors.length})</HbcTypography>
      <ul>
        {preview.blockingErrors.length === 0 ? (
          <li>
            <HbcTypography intent="bodySmall">No blockers.</HbcTypography>
          </li>
        ) : (
          preview.blockingErrors.map((item) => (
            <li key={`block-${item.code}`}>
              <HbcTypography intent="bodySmall">
                {item.code}: {item.message}
              </HbcTypography>
            </li>
          ))
        )}
      </ul>
      <HbcTypography intent="label">Warnings ({preview.warnings.length})</HbcTypography>
      <ul>
        {preview.warnings.length === 0 ? (
          <li>
            <HbcTypography intent="bodySmall">No warnings.</HbcTypography>
          </li>
        ) : (
          preview.warnings.map((item) => (
            <li key={`warn-${item.code}`}>
              <HbcTypography intent="bodySmall">
                {item.code}: {item.message}
              </HbcTypography>
            </li>
          ))
        )}
      </ul>
    </div>
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

