import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HbcHandoffComposer } from '../components/HbcHandoffComposer';
import { HandoffApi } from '../api/HandoffApi';
import { createMockHandoffConfig } from '../../testing/createMockHandoffConfig';
import { createMockHandoffPackage } from '../../testing/createMockHandoffPackage';
import type { IBicOwner } from '../types/IWorkflowHandoff';

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

const currentUser: IBicOwner = {
  userId: 'user-001',
  displayName: 'Test User',
  role: 'BD Director',
};

const sourceRecord: MockSource = { id: 'src-001', projectName: 'Test Project' };

function renderComposer(configOverrides = {}, props = {}) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const config = createMockHandoffConfig<MockSource, MockDest>(configOverrides);

  return render(
    <QueryClientProvider client={qc}>
      <HbcHandoffComposer
        sourceRecord={sourceRecord}
        config={config}
        currentUser={currentUser}
        {...props}
      />
    </QueryClientProvider>
  );
}

beforeEach(() => {
  vi.mocked(HandoffApi.create).mockReset();
  vi.mocked(HandoffApi.send).mockReset();
});

describe('HbcHandoffComposer', () => {
  it('renders with step 1 (preflight) active', async () => {
    renderComposer();
    // Step label is always visible in the step indicator
    expect(screen.getByText('1. Readiness Check')).toBeInTheDocument();
    // Step title renders after async assembly
    await waitFor(() => {
      expect(screen.getByText('Readiness Check')).toBeInTheDocument();
    });
  });

  it('shows "Continue →" when preflight passes', async () => {
    renderComposer();

    await waitFor(() => {
      expect(screen.getByText('Continue →')).toBeInTheDocument();
    });
  });

  it('shows "Address issues to continue" when preflight fails', async () => {
    renderComposer({ validateReadiness: () => 'Not ready yet' });

    await waitFor(() => {
      expect(screen.getByText('Address issues to continue')).toBeInTheDocument();
    });
  });

  it('disables Continue button when preflight fails', async () => {
    renderComposer({ validateReadiness: () => 'Not ready' });

    await waitFor(() => {
      const btn = screen.getByText('Address issues to continue');
      expect(btn).toBeDisabled();
    });
  });

  it('navigates from step 1 to step 2 (review) on Continue', async () => {
    renderComposer();

    await waitFor(() => {
      expect(screen.getByText('Continue →')).not.toBeDisabled();
    });

    fireEvent.click(screen.getByText('Continue →'));
    expect(screen.getByText('Review Handoff Package')).toBeInTheDocument();
  });

  it('navigates back from step 2 to step 1', async () => {
    renderComposer();

    await waitFor(() => {
      fireEvent.click(screen.getByText('Continue →'));
    });

    fireEvent.click(screen.getByText('← Back'));
    // After going back, the step indicator should show preflight as active
    await waitFor(() => {
      expect(screen.getByText('Readiness Check')).toBeInTheDocument();
    });
  });

  it('navigates through all 4 steps to send', async () => {
    renderComposer();

    // Step 1 → Step 2
    await waitFor(() => {
      fireEvent.click(screen.getByText('Continue →'));
    });
    expect(screen.getByText('Review Handoff Package')).toBeInTheDocument();

    // Step 2 → Step 3
    fireEvent.click(screen.getAllByText('Continue →')[0]);
    expect(screen.getByText('Confirm Recipient')).toBeInTheDocument();

    // Step 3 → Step 4
    fireEvent.click(screen.getByText('Continue →'));
    // "Send Handoff Package" appears as both h3 title and button; check the button
    const sendBtn = screen.getByRole('button', { name: 'Send Handoff Package' });
    expect(sendBtn).toBeInTheDocument();
  });

  it('shows route label and acknowledge description in send step', async () => {
    renderComposer({
      routeLabel: 'Test Route',
      acknowledgeDescription: 'A record will be created.',
    });

    // Navigate to send step
    await waitFor(() => fireEvent.click(screen.getByText('Continue →')));
    fireEvent.click(screen.getAllByText('Continue →')[0]);
    fireEvent.click(screen.getByText('Continue →'));

    // Route label appears in both header and send confirm — verify at least one
    expect(screen.getAllByText('Test Route').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('A record will be created.')).toBeInTheDocument();
  });

  it('calls HandoffApi.create and HandoffApi.send on send', async () => {
    const draftPkg = createMockHandoffPackage({ status: 'draft', handoffId: 'draft-1' });
    const sentPkg = createMockHandoffPackage({ status: 'sent', handoffId: 'draft-1' });
    vi.mocked(HandoffApi.create).mockResolvedValueOnce(draftPkg);
    vi.mocked(HandoffApi.send).mockResolvedValueOnce(sentPkg);

    const onHandoffSent = vi.fn();
    renderComposer({}, { onHandoffSent });

    // Navigate to send step
    await waitFor(() => fireEvent.click(screen.getByText('Continue →')));
    fireEvent.click(screen.getAllByText('Continue →')[0]);
    fireEvent.click(screen.getByText('Continue →'));

    // Click send button
    fireEvent.click(screen.getByRole('button', { name: 'Send Handoff Package' }));

    await waitFor(() => {
      expect(HandoffApi.create).toHaveBeenCalled();
      expect(HandoffApi.send).toHaveBeenCalledWith('draft-1');
      expect(onHandoffSent).toHaveBeenCalledWith(sentPkg);
    });
  });

  it('shows error message when send fails', async () => {
    vi.mocked(HandoffApi.create).mockRejectedValueOnce(new Error('Create failed'));

    renderComposer();

    // Navigate to send step
    await waitFor(() => fireEvent.click(screen.getByText('Continue →')));
    fireEvent.click(screen.getAllByText('Continue →')[0]);
    fireEvent.click(screen.getByText('Continue →'));

    fireEvent.click(screen.getByRole('button', { name: 'Send Handoff Package' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Create failed');
    });
  });

  it('calls onCancel when close button is clicked', () => {
    const onCancel = vi.fn();
    renderComposer({}, { onCancel });

    fireEvent.click(screen.getByLabelText('Cancel handoff'));
    expect(onCancel).toHaveBeenCalled();
  });

  it('shows warning when resolveRecipient returns null', async () => {
    renderComposer({ resolveRecipient: () => null });

    // Navigate to recipient step
    await waitFor(() => fireEvent.click(screen.getByText('Continue →')));
    fireEvent.click(screen.getAllByText('Continue →')[0]);

    expect(screen.getByText(/could not automatically determine the recipient/)).toBeInTheDocument();
  });

  it('can add context notes in review step', async () => {
    renderComposer();

    // Navigate to review step
    await waitFor(() => fireEvent.click(screen.getByText('Continue →')));

    // Add a note
    const textarea = screen.getByLabelText('Note text');
    fireEvent.change(textarea, { target: { value: 'Important context' } });
    fireEvent.click(screen.getByText('Add Note'));

    expect(screen.getByText('Important context')).toBeInTheDocument();
  });

  it('shows preflight check pass/fail icons', async () => {
    renderComposer();

    await waitFor(() => {
      expect(document.querySelector('.hbc-preflight-check--pass')).toBeInTheDocument();
    });
  });

  it('renders documents in review step when resolveDocuments returns items', async () => {
    renderComposer({
      resolveDocuments: async () => [
        { documentId: 'd1', fileName: 'RFP-Doc.pdf', sharepointUrl: 'https://sp/d1.pdf', category: 'RFP' },
      ],
    });

    // Navigate to review step
    await waitFor(() => fireEvent.click(screen.getByText('Continue →')));

    expect(screen.getByText('RFP-Doc.pdf')).toBeInTheDocument();
    expect(screen.getByText('RFP')).toBeInTheDocument();
  });

  it('can remove a context note in review step', async () => {
    renderComposer();

    // Navigate to review step
    await waitFor(() => fireEvent.click(screen.getByText('Continue →')));

    // Add a note
    const textarea = screen.getByLabelText('Note text');
    fireEvent.change(textarea, { target: { value: 'Note to remove' } });
    fireEvent.click(screen.getByText('Add Note'));
    expect(screen.getByText('Note to remove')).toBeInTheDocument();

    // Remove the note
    fireEvent.click(screen.getByLabelText('Remove note: Note to remove'));
    expect(screen.queryByText('Note to remove')).not.toBeInTheDocument();
  });

  it('can change note category in review step', async () => {
    renderComposer();

    // Navigate to review step
    await waitFor(() => fireEvent.click(screen.getByText('Continue →')));

    // Change category to Risk
    const select = screen.getByLabelText('Note category');
    fireEvent.change(select, { target: { value: 'Risk' } });

    // Add a note with the new category
    const textarea = screen.getByLabelText('Note text');
    fireEvent.change(textarea, { target: { value: 'Risk note' } });
    fireEvent.click(screen.getByText('Add Note'));

    // Verify the note was added with Risk category via the note element class
    const riskNote = document.querySelector('.hbc-handoff-note--red');
    expect(riskNote).toBeInTheDocument();
  });

  it('renders object-type values as JSON in review step', async () => {
    renderComposer({
      mapSourceToDestination: () => ({ nested: { a: 1 } } as unknown as MockDest),
    });

    await waitFor(() => fireEvent.click(screen.getByText('Continue →')));
    expect(screen.getByText('{"a":1}')).toBeInTheDocument();
  });

  it('does not add empty note when body is blank', async () => {
    renderComposer();

    await waitFor(() => fireEvent.click(screen.getByText('Continue →')));

    // Add Note should be disabled when textarea is empty
    const addBtn = screen.getByText('Add Note');
    expect(addBtn).toBeDisabled();
  });

  it('shows "Sending…" text while send is in progress', async () => {
    // Never-resolving promise to keep sending state
    vi.mocked(HandoffApi.create).mockReturnValueOnce(new Promise(() => {}));

    renderComposer();

    await waitFor(() => fireEvent.click(screen.getByText('Continue →')));
    fireEvent.click(screen.getAllByText('Continue →')[0]);
    fireEvent.click(screen.getByText('Continue →'));

    fireEvent.click(screen.getByRole('button', { name: 'Send Handoff Package' }));

    await waitFor(() => {
      expect(screen.getByText('Sending…')).toBeInTheDocument();
    });
  });
});
