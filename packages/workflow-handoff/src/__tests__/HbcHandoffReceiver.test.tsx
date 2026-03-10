import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HbcHandoffReceiver } from '../components/HbcHandoffReceiver';
import { HandoffApi } from '../api/HandoffApi';
import { createMockHandoffConfig } from '../../testing/createMockHandoffConfig';
import { createMockHandoffPackage } from '../../testing/createMockHandoffPackage';
import { createMockContextNote } from '../../testing/createMockContextNote';
import type { IHandoffPackage } from '../types/IWorkflowHandoff';

vi.mock('../api/HandoffApi', () => ({
  HandoffApi: {
    create: vi.fn(),
    get: vi.fn(),
    inbox: vi.fn(),
    outbox: vi.fn(),
    send: vi.fn(),
    markReceived: vi.fn(),
    acknowledge: vi.fn(),
    reject: vi.fn(),
    updateContextNotes: vi.fn(),
  },
}));

vi.mock('@hbc/complexity', () => ({
  useComplexity: vi.fn(() => ({ tier: 'standard' })),
}));

interface MockSource { id: string; projectName: string }
interface MockDest { projectName: string }

function renderReceiver(
  pkgOverrides: Partial<IHandoffPackage<MockSource, MockDest>> = {},
  configOverrides = {},
  props = {},
) {
  const pkg = createMockHandoffPackage<MockSource, MockDest>({
    status: 'received',
    ...pkgOverrides,
  });
  vi.mocked(HandoffApi.get).mockResolvedValueOnce(pkg);

  // Don't mock markReceived for 'received' — only for 'sent'
  if (pkgOverrides.status === 'sent' || (!pkgOverrides.status)) {
    // For 'sent' status, also mock markReceived
    if (pkgOverrides.status === 'sent') {
      const receivedPkg = { ...pkg, status: 'received' as const };
      vi.mocked(HandoffApi.markReceived).mockResolvedValueOnce(receivedPkg);
    }
  }

  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const config = createMockHandoffConfig<MockSource, MockDest>(configOverrides);

  return render(
    <QueryClientProvider client={qc}>
      <HbcHandoffReceiver
        handoffId={pkg.handoffId}
        config={config}
        {...props}
      />
    </QueryClientProvider>
  );
}

beforeEach(() => {
  vi.mocked(HandoffApi.get).mockReset();
  vi.mocked(HandoffApi.markReceived).mockReset();
  vi.mocked(HandoffApi.acknowledge).mockReset();
  vi.mocked(HandoffApi.reject).mockReset();
});

describe('HbcHandoffReceiver', () => {
  it('shows loading state initially', () => {
    vi.mocked(HandoffApi.get).mockReturnValueOnce(new Promise(() => {}));

    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const config = createMockHandoffConfig();

    render(
      <QueryClientProvider client={qc}>
        <HbcHandoffReceiver handoffId="h1" config={config} />
      </QueryClientProvider>
    );

    expect(screen.getByText('Loading handoff package…')).toBeInTheDocument();
  });

  it('shows error state when fetch fails', async () => {
    vi.mocked(HandoffApi.get).mockRejectedValueOnce(new Error('Network error'));

    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const config = createMockHandoffConfig();

    render(
      <QueryClientProvider client={qc}>
        <HbcHandoffReceiver handoffId="h1" config={config} />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('auto-marks as received when package status is sent', async () => {
    const sentPkg = createMockHandoffPackage<MockSource, MockDest>({ status: 'sent' });
    const receivedPkg = { ...sentPkg, status: 'received' as const };

    vi.mocked(HandoffApi.get).mockResolvedValueOnce(sentPkg);
    vi.mocked(HandoffApi.markReceived).mockResolvedValueOnce(receivedPkg);

    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const config = createMockHandoffConfig<MockSource, MockDest>();

    render(
      <QueryClientProvider client={qc}>
        <HbcHandoffReceiver handoffId={sentPkg.handoffId} config={config} />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(HandoffApi.markReceived).toHaveBeenCalledWith(sentPkg.handoffId);
    });
  });

  it('renders sender info and route label', async () => {
    renderReceiver({ status: 'received' });

    await waitFor(() => {
      expect(screen.getByText('BD Win → Estimating Pursuit')).toBeInTheDocument();
      // Sender name is inside a <strong> within "From <strong>Name</strong> · Role"
      const fromEl = document.querySelector('.hbc-handoff-receiver__from');
      expect(fromEl).toBeInTheDocument();
      expect(fromEl?.textContent).toContain('John BD Director');
    });
  });

  it('renders source summary section with destination seed data', async () => {
    renderReceiver({
      status: 'received',
      destinationSeedData: { projectName: 'Test Project' } as Partial<MockDest>,
    });

    await waitFor(() => {
      expect(screen.getByText('projectName')).toBeInTheDocument();
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });
  });

  it('renders documents section with file links', async () => {
    renderReceiver({ status: 'received' });

    await waitFor(() => {
      const docLink = document.querySelector('.hbc-handoff-receiver__doc-link');
      expect(docLink).toBeInTheDocument();
    });
  });

  it('renders empty documents message when no documents', async () => {
    renderReceiver({ status: 'received', documents: [] });

    await waitFor(() => {
      expect(screen.getByText('No documents attached to this handoff.')).toBeInTheDocument();
    });
  });

  it('renders context notes with category and author', async () => {
    const note = createMockContextNote({ category: 'Risk', body: 'Budget risk identified' });
    renderReceiver({ status: 'received', contextNotes: [note] });

    await waitFor(() => {
      expect(screen.getByText('Budget risk identified')).toBeInTheDocument();
      expect(screen.getByText('Risk')).toBeInTheDocument();
    });
  });

  it('renders acknowledge and reject buttons for active packages', async () => {
    renderReceiver({ status: 'received' }, { destinationRecordType: 'estimating-pursuit' });

    await waitFor(() => {
      expect(screen.getByText('Acknowledge & Create estimating-pursuit')).toBeInTheDocument();
      expect(screen.getByText('Reject with Reason')).toBeInTheDocument();
    });
  });

  it('calls HandoffApi.acknowledge and fires onAcknowledged callback', async () => {
    const ackPkg = createMockHandoffPackage<MockSource, MockDest>({ status: 'acknowledged' });
    vi.mocked(HandoffApi.acknowledge).mockResolvedValueOnce(ackPkg);

    const onAcknowledged = vi.fn();
    renderReceiver(
      { status: 'received' },
      { destinationRecordType: 'estimating-pursuit' },
      { onAcknowledged },
    );

    await waitFor(() => {
      fireEvent.click(screen.getByText('Acknowledge & Create estimating-pursuit'));
    });

    await waitFor(() => {
      expect(HandoffApi.acknowledge).toHaveBeenCalled();
      expect(onAcknowledged).toHaveBeenCalledWith(ackPkg);
    });
  });

  it('shows reject form when Reject button is clicked', async () => {
    renderReceiver({ status: 'received' });

    await waitFor(() => {
      fireEvent.click(screen.getByText('Reject with Reason'));
    });

    expect(screen.getByText('Reject Handoff Package')).toBeInTheDocument();
    expect(screen.getByText(/Rejection will return BIC ownership/)).toBeInTheDocument();
  });

  it('calls HandoffApi.reject with reason and fires onRejected callback', async () => {
    const rejPkg = createMockHandoffPackage<MockSource, MockDest>({ status: 'rejected' });
    vi.mocked(HandoffApi.reject).mockResolvedValueOnce(rejPkg);

    const onRejected = vi.fn();
    renderReceiver({ status: 'received' }, {}, { onRejected });

    await waitFor(() => {
      fireEvent.click(screen.getByText('Reject with Reason'));
    });

    const textarea = screen.getByPlaceholderText(/Describe what needs to be addressed/);
    fireEvent.change(textarea, { target: { value: 'Missing docs' } });
    fireEvent.click(screen.getByText('Confirm Rejection'));

    await waitFor(() => {
      expect(HandoffApi.reject).toHaveBeenCalled();
      expect(onRejected).toHaveBeenCalledWith(rejPkg);
    });
  });

  it('disables Confirm Rejection when reason is empty', async () => {
    renderReceiver({ status: 'received' });

    await waitFor(() => {
      fireEvent.click(screen.getByText('Reject with Reason'));
    });

    expect(screen.getByText('Confirm Rejection')).toBeDisabled();
  });

  it('shows terminal acknowledged state', async () => {
    renderReceiver({
      status: 'acknowledged',
      acknowledgedAt: '2026-01-15T10:00:00Z',
      createdDestinationRecordId: 'dest-001',
    });

    await waitFor(() => {
      expect(screen.getByText(/Acknowledged on/)).toBeInTheDocument();
      expect(screen.getByText(/dest-001/)).toBeInTheDocument();
    });
  });

  it('shows terminal rejected state with reason', async () => {
    renderReceiver({
      status: 'rejected',
      rejectedAt: '2026-01-15T10:00:00Z',
      rejectionReason: 'Missing final bid documents',
    });

    await waitFor(() => {
      expect(screen.getByText(/Rejected on/)).toBeInTheDocument();
      expect(screen.getByText(/Missing final bid documents/)).toBeInTheDocument();
    });
  });

  it('hides CTAs for terminal states', async () => {
    renderReceiver({ status: 'acknowledged' });

    await waitFor(() => {
      expect(screen.queryByText(/Acknowledge & Create/)).not.toBeInTheDocument();
      expect(screen.queryByText('Reject with Reason')).not.toBeInTheDocument();
    });
  });

  it('shows acknowledge error when acknowledge fails', async () => {
    vi.mocked(HandoffApi.acknowledge).mockRejectedValueOnce(new Error('Ack failed'));

    renderReceiver(
      { status: 'received' },
      { destinationRecordType: 'estimating-pursuit' },
    );

    await waitFor(() => {
      fireEvent.click(screen.getByText('Acknowledge & Create estimating-pursuit'));
    });

    await waitFor(() => {
      expect(screen.getByText('Ack failed')).toBeInTheDocument();
    });
  });

  it('shows "What happens next" section for active packages', async () => {
    renderReceiver(
      { status: 'received' },
      { acknowledgeDescription: 'A pursuit will be created.' },
    );

    await waitFor(() => {
      expect(screen.getByText('What happens next')).toBeInTheDocument();
      expect(screen.getByText('A pursuit will be created.')).toBeInTheDocument();
    });
  });

  it('renders annotation slots when annotationConfig is provided', async () => {
    renderReceiver(
      {
        status: 'received',
        destinationSeedData: { projectName: 'Test' } as Partial<MockDest>,
      },
      {},
      { annotationConfig: { recordType: 'workflow-handoff', listTitle: 'test', siteUrl: 'https://sp' } },
    );

    await waitFor(() => {
      const slot = document.querySelector('.hbc-handoff-receiver__annotation-slot');
      expect(slot).toBeInTheDocument();
    });
  });

  it('shows error when reject fails', async () => {
    vi.mocked(HandoffApi.reject).mockRejectedValueOnce(new Error('Reject failed'));

    renderReceiver({ status: 'received' });

    await waitFor(() => {
      fireEvent.click(screen.getByText('Reject with Reason'));
    });

    const textarea = screen.getByPlaceholderText(/Describe what needs to be addressed/);
    fireEvent.change(textarea, { target: { value: 'Reason' } });
    fireEvent.click(screen.getByText('Confirm Rejection'));

    await waitFor(() => {
      expect(screen.getByText('Reject failed')).toBeInTheDocument();
    });
  });

  it('cancels reject form when Cancel is clicked', async () => {
    renderReceiver({ status: 'received' });

    await waitFor(() => {
      fireEvent.click(screen.getByText('Reject with Reason'));
    });

    expect(screen.getByText('Reject Handoff Package')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Reject Handoff Package')).not.toBeInTheDocument();
  });

  it('renders file size when documents have fileSizeBytes', async () => {
    renderReceiver({
      status: 'received',
      documents: [
        { documentId: 'd1', fileName: 'f.pdf', sharepointUrl: 'https://sp/f.pdf', category: 'RFP', fileSizeBytes: 51200 },
      ],
    });

    await waitFor(() => {
      expect(screen.getByText('50 KB')).toBeInTheDocument();
    });
  });

  it('does not call markReceived for already-received packages', async () => {
    renderReceiver({ status: 'received' });

    await waitFor(() => {
      expect(screen.getByText('BD Win → Estimating Pursuit')).toBeInTheDocument();
    });

    expect(HandoffApi.markReceived).not.toHaveBeenCalled();
  });

  it('shows fallback error message when acknowledge throws non-Error', async () => {
    vi.mocked(HandoffApi.acknowledge).mockRejectedValueOnce('not-an-error');

    renderReceiver(
      { status: 'received' },
      { destinationRecordType: 'estimating-pursuit' },
    );

    await waitFor(() => {
      fireEvent.click(screen.getByText('Acknowledge & Create estimating-pursuit'));
    });

    await waitFor(() => {
      expect(screen.getByText('Acknowledgment failed. Please try again.')).toBeInTheDocument();
    });
  });

  it('shows fallback error message when reject throws non-Error', async () => {
    vi.mocked(HandoffApi.reject).mockRejectedValueOnce('not-an-error');

    renderReceiver({ status: 'received' });

    await waitFor(() => {
      fireEvent.click(screen.getByText('Reject with Reason'));
    });

    const textarea = screen.getByPlaceholderText(/Describe what needs to be addressed/);
    fireEvent.change(textarea, { target: { value: 'Reason' } });
    fireEvent.click(screen.getByText('Confirm Rejection'));

    await waitFor(() => {
      expect(screen.getByText('Rejection failed. Please try again.')).toBeInTheDocument();
    });
  });

  it('shows generic error when get() throws a non-Error value', async () => {
    vi.mocked(HandoffApi.get).mockRejectedValueOnce({ status: 'broken' });

    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const config = createMockHandoffConfig<MockSource, MockDest>();

    render(
      <QueryClientProvider client={qc}>
        <HbcHandoffReceiver handoffId="h1" config={config} />
      </QueryClientProvider>
    );

    // When error is caught and err.message is accessed on a non-Error, it becomes undefined
    // The error state shows either the error message or the fallback
    await waitFor(() => {
      const errorEl = document.querySelector('.hbc-handoff-receiver--error');
      expect(errorEl).toBeInTheDocument();
    });
  });

  it('renders sent timestamp when sentAt is present', async () => {
    renderReceiver({
      status: 'received',
      sentAt: '2026-01-15T09:05:00Z',
    });

    await waitFor(() => {
      const timeEl = document.querySelector('.hbc-handoff-receiver__sent-at');
      expect(timeEl).toBeInTheDocument();
      expect(timeEl?.getAttribute('datetime')).toBe('2026-01-15T09:05:00Z');
    });
  });

  it('hides "What happens next" for terminal states', async () => {
    renderReceiver({ status: 'acknowledged' });

    await waitFor(() => {
      expect(screen.queryByText('What happens next')).not.toBeInTheDocument();
    });
  });

  it('groups documents by category', async () => {
    renderReceiver({
      status: 'received',
      documents: [
        { documentId: 'd1', fileName: 'rfp.pdf', sharepointUrl: 'https://sp/d1.pdf', category: 'RFP' },
        { documentId: 'd2', fileName: 'scope.pdf', sharepointUrl: 'https://sp/d2.pdf', category: 'Scope' },
      ],
    });

    await waitFor(() => {
      expect(screen.getByText('Documents (2)')).toBeInTheDocument();
      expect(screen.getByText('RFP')).toBeInTheDocument();
      expect(screen.getByText('Scope')).toBeInTheDocument();
    });
  });
});
