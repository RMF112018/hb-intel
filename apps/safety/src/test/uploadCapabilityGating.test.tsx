/* eslint-disable @hb-intel/hbc/no-raw-form-elements */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UploadPage } from '../pages/UploadPage.js';

// Mirrors the mock wiring in uploadPreviewFlow.test.tsx so we only exercise
// the capability-gating surface without pulling real repositories.
const previewMutate = vi.fn();
const ingestMutate = vi.fn();

const previewState: {
  data: unknown;
  isPending: boolean;
  isSuccess: boolean;
  error: unknown;
} = {
  data: null,
  isPending: false,
  isSuccess: false,
  error: null,
};
const ingestState: {
  isPending: boolean;
  data: unknown;
  error: unknown;
} = {
  isPending: false,
  data: undefined,
  error: null,
};

const capabilitiesFixture: {
  canPreview: boolean;
  canIngest: boolean;
  canReplay: boolean;
  state: 'pending' | 'authorized' | 'unauthorized' | 'token-unavailable' | 'scope-missing';
} = {
  canPreview: true,
  canIngest: true,
  canReplay: true,
  state: 'authorized',
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
    ...ingestState,
  }),
  toSafetyProjectSourceClassification: () => 'project',
  isSafetyConfigurationError: () => false,
  isSafetyAdapterFetchError: () => false,
  isSafetyBackendCommandError: () => false,
  SafetyUploadError: class extends Error {},
  useSafetyCapabilities: () => capabilitiesFixture,
  safetyCapabilityReason: (
    key: 'canPreview' | 'canIngest' | 'canReplay',
    state?: 'pending' | 'authorized' | 'unauthorized' | 'token-unavailable' | 'scope-missing',
  ) => {
    if (state === 'token-unavailable') {
      return key === 'canPreview' ? 'TOKEN-UNAVAILABLE-PREVIEW' : 'TOKEN-UNAVAILABLE-INGEST';
    }
    if (state === 'scope-missing') {
      return key === 'canPreview' ? 'SCOPE-MISSING-PREVIEW' : 'SCOPE-MISSING-INGEST';
    }
    switch (key) {
      case 'canPreview':
        return 'NOT-AUTHORIZED-PREVIEW';
      case 'canIngest':
        return 'NOT-AUTHORIZED-INGEST';
      default:
        return 'NOT-AUTHORIZED-REPLAY';
    }
  },
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
  HbcCheckbox: ({ label, checked, onChange, disabled }: any) => (
    <label>
      <input
        type="checkbox"
        aria-label={label}
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      {label}
    </label>
  ),
  HbcTypography: ({ children }: any) => <span>{children}</span>,
}));

vi.mock('../components/index.js', () => ({
  SafetyMasthead: () => <div>Masthead</div>,
  SafetyIngestionOutcome: () => <div>Outcome</div>,
  SafetyIntakeReadiness: ({ rows }: any) => (
    <div>
      {rows.map((row: any) => (
        <div key={row.id}>{row.label}</div>
      ))}
    </div>
  ),
  SafetyIntakeStep: ({ children }: any) => <div>{children}</div>,
  SafetyStatusPanel: ({ description, detail }: any) => (
    <div>
      {description}
      {detail}
    </div>
  ),
  SupportDetailsPanel: () => <div>support</div>,
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

async function completeIntake(): Promise<void> {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: /pick project/i }));
  await user.click(screen.getByRole('button', { name: /select file/i }));
  await user.type(screen.getByLabelText(/inspection number/i), '3');
  await user.type(screen.getByLabelText(/inspection date/i), '2026-04-24');
}

describe('UploadPage — frontend capability gating', () => {
  beforeEach(() => {
    previewMutate.mockReset();
    ingestMutate.mockReset();
    previewState.data = null;
    previewState.isPending = false;
    previewState.isSuccess = false;
    previewState.error = null;
    ingestState.isPending = false;
    ingestState.data = undefined;
    ingestState.error = null;
    capabilitiesFixture.canPreview = true;
    capabilitiesFixture.canIngest = true;
    capabilitiesFixture.canReplay = true;
    capabilitiesFixture.state = 'authorized';
  });

  it('disables Preview and Commit and surfaces the preview reason when the user has no preview capability', async () => {
    capabilitiesFixture.canPreview = false;
    capabilitiesFixture.canIngest = false;
    capabilitiesFixture.state = 'unauthorized';
    render(<UploadPage />);
    await completeIntake();

    const previewButton = screen.getByRole('button', { name: /preview checklist/i });
    expect(previewButton).toBeDisabled();

    const commitButton = screen.getByRole('button', { name: /commit inspection/i });
    expect(commitButton).toBeDisabled();

    expect(
      document.querySelector('[data-safety-ui="upload-preview-capability-blocked"]'),
    ).toBeInTheDocument();

    await userEvent.click(previewButton);
    expect(previewMutate).toHaveBeenCalledTimes(0);
  });

  it('allows Preview but disables Commit with an ingest-specific reason for a Reviewer', async () => {
    capabilitiesFixture.canPreview = true;
    capabilitiesFixture.canIngest = false;
    capabilitiesFixture.state = 'authorized';
    render(<UploadPage />);
    await completeIntake();

    const previewButton = screen.getByRole('button', { name: /preview checklist/i });
    expect(previewButton).not.toBeDisabled();

    const commitButton = screen.getByRole('button', { name: /commit inspection/i });
    expect(commitButton).toBeDisabled();

    expect(
      document.querySelector('[data-safety-ui="upload-commit-capability-blocked"]'),
    ).toBeInTheDocument();
    expect(
      document.querySelector('[data-safety-ui="upload-preview-capability-blocked"]'),
    ).toBeNull();

    await userEvent.click(commitButton);
    expect(ingestMutate).toHaveBeenCalledTimes(0);
  });

  it('enables Preview for a Submitter and does not render capability-blocked text', async () => {
    capabilitiesFixture.canPreview = true;
    capabilitiesFixture.canIngest = true;
    render(<UploadPage />);
    await completeIntake();

    const previewButton = screen.getByRole('button', { name: /preview checklist/i });
    expect(previewButton).not.toBeDisabled();
    expect(
      document.querySelector('[data-safety-ui="upload-preview-capability-blocked"]'),
    ).toBeNull();
    expect(
      document.querySelector('[data-safety-ui="upload-commit-capability-blocked"]'),
    ).toBeNull();

    await userEvent.click(previewButton);
    expect(previewMutate).toHaveBeenCalledTimes(1);
  });

  it('renders the token-unavailable diagnostic distinct from generic unauthorized', async () => {
    capabilitiesFixture.canPreview = false;
    capabilitiesFixture.canIngest = false;
    capabilitiesFixture.state = 'token-unavailable';
    render(<UploadPage />);
    await completeIntake();

    const previewButton = screen.getByRole('button', { name: /preview checklist/i });
    expect(previewButton).toBeDisabled();

    const blocked = document.querySelector(
      '[data-safety-ui="upload-preview-capability-blocked"]',
    );
    expect(blocked).toBeInTheDocument();
    expect(blocked!.textContent).toContain('TOKEN-UNAVAILABLE-PREVIEW');
    expect(blocked!.textContent).not.toContain('NOT-AUTHORIZED-PREVIEW');
  });

  it('renders the scope-missing diagnostic distinct from generic unauthorized', async () => {
    capabilitiesFixture.canPreview = false;
    capabilitiesFixture.canIngest = false;
    capabilitiesFixture.state = 'scope-missing';
    render(<UploadPage />);
    await completeIntake();

    const blocked = document.querySelector(
      '[data-safety-ui="upload-preview-capability-blocked"]',
    );
    expect(blocked).toBeInTheDocument();
    expect(blocked!.textContent).toContain('SCOPE-MISSING-PREVIEW');
    expect(blocked!.textContent).not.toContain('NOT-AUTHORIZED-PREVIEW');
  });
});
