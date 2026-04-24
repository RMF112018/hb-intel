import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReviewQueuePage } from '../pages/ReviewQueuePage.js';

const replayMutate = vi.fn();
const replayReset = vi.fn();
const refetch = vi.fn();

const replayState: {
  isPending: boolean;
  data: unknown;
  error: unknown;
} = {
  isPending: false,
  data: null,
  error: null,
};

const reviewData = [
  {
    run: {
      id: 'run-1',
      terminalStatus: 'review-required',
      errorClass: 'duplicate-suspected',
      uploadFileName: 'checklist.xlsx',
    },
    reason: 'duplicate',
    projectNumber: 'P-1',
    projectNameSnapshot: 'Project 1',
  },
];

vi.mock('@hbc/features-safety', () => ({
  useReviewQueue: () => ({
    data: reviewData,
    isPending: false,
    isError: false,
    refetch,
  }),
  useReplayIngestion: () => ({
    mutate: replayMutate,
    reset: replayReset,
    ...replayState,
  }),
  isSafetyBackendCommandError: (error: any) => Boolean(error?.errorKind || error?.requestId),
  isSafetyConfigurationError: () => false,
  isSafetyAdapterFetchError: () => false,
  useSafetyCapabilities: () => ({
    canPreview: true,
    canIngest: true,
    canReplay: true,
  }),
  safetyCapabilityReason: () => 'Not authorized.',
}));

vi.mock('@hbc/ui-kit', () => ({
  WorkspacePageShell: ({ children }: any) => <div>{children}</div>,
  HbcTypography: ({ children }: any) => <span>{children}</span>,
  HbcStatusBadge: ({ label }: any) => <span>{label}</span>,
  HbcDataTable: () => <div>table</div>,
}));

vi.mock('../components/index.js', () => ({
  SafetyMasthead: () => <div>Masthead</div>,
  SafetyTriageSummary: () => <div>Summary</div>,
  SafetyTriageGroup: ({ children }: any) => <div>{children}</div>,
  SafetySectionHeader: () => <div>Header</div>,
  SafetyReviewEntryCard: ({ onRetry, entry }: any) => (
    <button onClick={() => onRetry(entry.run.id, false)}>Retry card</button>
  ),
  SafetyReviewActions: ({ onRetry, runId }: any) => (
    <button onClick={() => onRetry(runId, false)}>Retry row</button>
  ),
  SafetyStatusPanel: ({ description, detail, action }: any) => (
    <div>
      <div>{description}</div>
      <div>{detail}</div>
      {action ? <button onClick={action.onClick}>{action.label}</button> : null}
    </div>
  ),
  SupportDetailsPanel: ({ details, suggestedAction }: any) => (
    <details>
      <summary>Support details</summary>
      {suggestedAction ? <div>{suggestedAction}</div> : null}
      <ul>
        {details?.requestId && <li>requestId: {details.requestId}</li>}
        {details?.frontendRequestId && <li>frontendRequestId: {details.frontendRequestId}</li>}
        {details?.backendRequestId && <li>backendRequestId: {details.backendRequestId}</li>}
        {details?.failureClass && <li>failureClass: {details.failureClass}</li>}
        {details?.previewFailureClass && <li>previewFailureClass: {details.previewFailureClass}</li>}
        {details?.route && <li>route: {details.route}</li>}
        {details?.status !== undefined && <li>status: {details.status}</li>}
        {details?.attempts !== undefined && <li>attempts: {details.attempts}</li>}
        {details?.timestamp && <li>timestamp: {details.timestamp}</li>}
      </ul>
    </details>
  ),
}));

describe('ReviewQueue async accessibility semantics', () => {
  beforeEach(() => {
    replayMutate.mockReset();
    replayReset.mockReset();
    replayState.isPending = false;
    replayState.data = null;
    replayState.error = null;
  });

  it('keeps always-mounted polite and assertive live regions', () => {
    render(<ReviewQueuePage />);
    expect(document.querySelector('[data-safety-ui="review-live-status"]')).toBeInTheDocument();
    expect(document.querySelector('[data-safety-ui="review-live-alert"]')).toBeInTheDocument();
  });

  it('shows replay advisory with cancel while replay is pending', () => {
    replayState.isPending = true;
    render(<ReviewQueuePage />);
    expect(screen.getByText(/replay running/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel replay/i })).toBeInTheDocument();
  });

  it('announces replay completion in polite live region', () => {
    replayState.data = { state: 'committed' };
    render(<ReviewQueuePage />);
    expect(
      document.querySelector('[data-safety-ui="review-live-status"]'),
    ).toHaveTextContent(/review queue will refresh with latest state/i);
  });

  it('uses alert path for replay failures only', async () => {
    replayState.error = {
      message: 'failed',
      errorKind: 'auth',
      requestId: 'req-r1',
      frontendRequestId: 'front-r1',
      backendRequestId: 'back-r1',
      endpoint: '/api/safety-records/replay',
      httpStatus: 401,
      attempts: 1,
      failureClass: 'auth',
    };
    const user = userEvent.setup();
    render(<ReviewQueuePage />);
    expect(screen.getAllByText(/replay authentication failed/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/support details/i)).toBeInTheDocument();
    expect(screen.getByText(/frontendRequestId: front-r1/i)).toBeInTheDocument();
    expect(screen.getByText(/backendRequestId: back-r1/i)).toBeInTheDocument();
    expect(screen.getByText(/route: \/api\/safety-records\/replay/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(replayReset).toHaveBeenCalledTimes(1);
  });
});
