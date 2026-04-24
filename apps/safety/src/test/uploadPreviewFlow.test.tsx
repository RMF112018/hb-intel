import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UploadPage } from '../pages/UploadPage.js';

const previewMutate = vi.fn();
const ingestMutate = vi.fn();

const previewState: {
  data: any;
  isPending: boolean;
  isSuccess: boolean;
  error: unknown;
} = {
  data: null,
  isPending: false,
  isSuccess: false,
  error: null,
};

vi.mock('@hbc/features-safety', () => ({
  useReportingPeriods: () => ({
    data: [
      {
        id: 'period-1',
        spItemId: 1,
        periodLabel: 'Week of 2026-04-20',
        status: 'open',
      },
    ],
    isPending: false,
    isError: false,
    isFetching: false,
    refetch: vi.fn(),
  }),
  useSafetyIngestionPreview: () => ({
    mutate: previewMutate,
    ...previewState,
  }),
  useSafetyIngestion: () => ({
    mutate: ingestMutate,
    isPending: false,
    data: undefined,
    error: null,
  }),
  toSafetyProjectSourceClassification: () => 'project',
  isSafetyConfigurationError: () => false,
  isSafetyAdapterFetchError: () => false,
  isSafetyBackendCommandError: () => false,
  SafetyUploadError: class extends Error {},
}));

vi.mock('@hbc/ui-kit', () => ({
  WorkspacePageShell: ({ children }: any) => <div>{children}</div>,
  HbcButton: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  HbcCard: ({ children }: any) => <div>{children}</div>,
  HbcSelect: ({ label, value, onChange, options = [] }: any) => (
    <label>
      {label}
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option: any) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  ),
  HbcStatusBadge: ({ label }: any) => <span>{label}</span>,
  HbcTextField: ({ label, value, onChange, type = 'text' }: any) => (
    <label>
      {label}
      <input
        aria-label={label}
        value={value}
        type={type}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  ),
  HbcTypography: ({ children }: any) => <span>{children}</span>,
}));

vi.mock('../components/index.js', () => ({
  SafetyMasthead: () => <div>Masthead</div>,
  SafetyIngestionOutcome: () => <div>Outcome</div>,
  SafetyIntakeReadiness: ({ rows }: any) => (
    <div>{rows.map((row: any) => <div key={row.id}>{row.label}</div>)}</div>
  ),
  SafetyIntakeStep: ({ children }: any) => <div>{children}</div>,
  SafetyStatusPanel: ({ description, detail }: any) => (
    <div>
      {description}
      {detail}
    </div>
  ),
  SafetyProjectPicker: ({ onSelect }: any) => (
    <button
      onClick={() =>
        onSelect({
          id: 'proj-1',
          projectNumber: 'P-1234',
          projectName: 'Project One',
          projectLocation: 'HQ',
          projectStage: 'Active',
          sourceClassification: 'project',
          sourceRefs: { projectsListId: 123 },
        })
      }
    >
      Pick project
    </button>
  ),
  SafetyFileInput: ({ onFileSelected }: any) => (
    <button
      onClick={() =>
        onFileSelected(
          new File(['test'], 'test.xlsx', {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          }),
        )
      }
    >
      Select file
    </button>
  ),
  toSafetyProjectSourceClassification: () => 'project',
}));

function configurePreview(
  options: {
    commitReadiness: boolean;
    blockers?: Array<{ code: string; message: string; severity: 'error' }>;
    warnings?: Array<{ code: string; message: string; severity: 'warning' }>;
  },
): void {
  previewState.data = {
    commitReadiness: options.commitReadiness,
    template: { valid: true, templateVersion: 'v1', parserContractVersion: 'p1' },
    metadata: {},
    reportingPeriod: { resolved: true, dateInRange: true },
    projectResolution: { resolved: true, classification: 'project' },
    duplicateRisk: { confidence: 'none', supersessionRisk: false },
    blockingErrors: options.blockers ?? [],
    warnings: options.warnings ?? [],
    diagnosticSummary: {
      commitReady: options.commitReadiness,
      failureClass: options.commitReadiness ? 'none' : 'parse-failure',
      blockingCodes: (options.blockers ?? []).map((item) => item.code),
      warningCodes: (options.warnings ?? []).map((item) => item.code),
      checks: {
        templateValid: true,
        parserContractMarkerState: 'markered-valid',
        parseSucceeded: true,
        reportingPeriodResolved: true,
        reportingPeriodDateInRange: true,
        projectResolved: true,
        duplicateConfidence: 'none',
      },
    },
  };
  previewState.isSuccess = true;
  previewState.error = null;
}

describe('UploadPage preview-before-commit flow', () => {
  beforeEach(() => {
    previewMutate.mockReset();
    ingestMutate.mockReset();
    previewState.data = null;
    previewState.isPending = false;
    previewState.isSuccess = false;
    previewState.error = null;
  });

  it('runs preview before commit and exercises preview mutation route', async () => {
    configurePreview({ commitReadiness: true });
    const user = userEvent.setup();
    render(<UploadPage />);

    await user.click(screen.getByRole('button', { name: /pick project/i }));
    await user.click(screen.getByRole('button', { name: /select file/i }));
    await user.type(screen.getByLabelText(/inspection number/i), '3');
    await user.type(screen.getByLabelText(/inspection date/i), '2026-04-24');

    await user.click(screen.getByRole('button', { name: /preview checklist/i }));
    expect(previewMutate).toHaveBeenCalledTimes(1);
    expect(ingestMutate).toHaveBeenCalledTimes(0);
  });

  it('prevents commit when preview has blockers and renders warning/blocker separation', async () => {
    configurePreview({
      commitReadiness: false,
      blockers: [{ code: 'PARSE_BLOCKER', message: 'Parse failed', severity: 'error' }],
      warnings: [{ code: 'META_WARN', message: 'Metadata mismatch', severity: 'warning' }],
    });
    const user = userEvent.setup();
    render(<UploadPage />);

    await user.click(screen.getByRole('button', { name: /pick project/i }));
    await user.click(screen.getByRole('button', { name: /select file/i }));
    await user.type(screen.getByLabelText(/inspection number/i), '4');
    await user.type(screen.getByLabelText(/inspection date/i), '2026-04-24');
    await user.click(screen.getByRole('button', { name: /preview checklist/i }));

    expect(screen.getByText(/blocking errors \(1\)/i)).toBeInTheDocument();
    expect(screen.getByText(/warnings \(1\)/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /commit inspection/i }));
    expect(ingestMutate).toHaveBeenCalledTimes(0);
  });

  it('requires confirmation checkbox before commit when preview is commit-ready', async () => {
    configurePreview({ commitReadiness: true });
    const user = userEvent.setup();
    render(<UploadPage />);

    await user.click(screen.getByRole('button', { name: /pick project/i }));
    await user.click(screen.getByRole('button', { name: /select file/i }));
    await user.type(screen.getByLabelText(/inspection number/i), '7');
    await user.type(screen.getByLabelText(/inspection date/i), '2026-04-24');
    await user.click(screen.getByRole('button', { name: /preview checklist/i }));

    await user.click(screen.getByRole('button', { name: /commit inspection/i }));
    expect(ingestMutate).toHaveBeenCalledTimes(0);
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /commit inspection/i }));
    expect(ingestMutate).toHaveBeenCalledTimes(1);
  });

  it('auto-repreviews when intake context changes after a preview run', async () => {
    configurePreview({ commitReadiness: true });
    const user = userEvent.setup();
    render(<UploadPage />);

    await user.click(screen.getByRole('button', { name: /pick project/i }));
    await user.click(screen.getByRole('button', { name: /select file/i }));
    await user.type(screen.getByLabelText(/inspection number/i), '9');
    await user.type(screen.getByLabelText(/inspection date/i), '2026-04-24');
    await user.click(screen.getByRole('button', { name: /preview checklist/i }));
    expect(previewMutate).toHaveBeenCalledTimes(1);

    await user.clear(screen.getByLabelText(/inspection number/i));
    await user.type(screen.getByLabelText(/inspection number/i), '10');

    await waitFor(() => {
      expect(previewMutate.mock.calls.length).toBeGreaterThanOrEqual(2);
    });
  });
});
