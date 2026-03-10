import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useComplexity } from '@hbc/complexity';
import { HbcAnnotationThread } from '../components/HbcAnnotationThread';
import { AnnotationApi } from '../api/AnnotationApi';
import { createMockAnnotation } from '../../testing/createMockAnnotation';
import { createMockAnnotationConfig } from '../../testing/createMockAnnotationConfig';
import { createMockAnnotationReply } from '../../testing/createMockAnnotationReply';

vi.mock('@hbc/complexity', () => ({
  useComplexity: vi.fn(() => ({ tier: 'standard' })),
}));

vi.mock('../api/AnnotationApi', () => ({
  AnnotationApi: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    addReply: vi.fn(),
    resolve: vi.fn(),
    withdraw: vi.fn(),
  },
}));

vi.mock('@hbc/ui-kit/app-shell', () => ({
  Popover: ({ children, className, ...props }: any) =>
    React.createElement('div', {
      role: 'dialog',
      'data-testid': 'popover',
      className,
      ...props,
    }, children),
}));

const anchorRef = { current: document.createElement('button') };

function renderWithQuery(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(React.createElement(QueryClientProvider, { client: qc }, ui));
}

const defaultProps = {
  recordType: 'bd-scorecard',
  recordId: 'rec-001',
  fieldKey: 'totalBuildableArea',
  fieldLabel: 'Total Buildable Area',
  config: createMockAnnotationConfig() as Required<ReturnType<typeof createMockAnnotationConfig>>,
  canAnnotate: true,
  canResolve: true,
  anchorRef,
  onClose: vi.fn(),
};

beforeEach(() => {
  vi.mocked(useComplexity).mockReturnValue({ tier: 'standard' });
  vi.mocked(AnnotationApi.list).mockReset();
  vi.mocked(AnnotationApi.create).mockReset();
  vi.mocked(AnnotationApi.addReply).mockReset();
  vi.mocked(AnnotationApi.resolve).mockReset();
  vi.mocked(AnnotationApi.withdraw).mockReset();
  defaultProps.onClose.mockReset();
});

describe('HbcAnnotationThread', () => {
  it('renders in a Popover with field label header', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue([]);
    renderWithQuery(React.createElement(HbcAnnotationThread, defaultProps));

    expect(await screen.findByTestId('popover')).toBeInTheDocument();
    expect(screen.getByText('Total Buildable Area')).toBeInTheDocument();
  });

  it('displays annotation cards with intent badges and author info', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue([
      createMockAnnotation({
        intent: 'clarification-request',
        status: 'open',
        body: 'Please clarify this number.',
        author: { userId: 'u1', displayName: 'Jane Doe', role: 'Director' },
      }),
    ]);
    renderWithQuery(React.createElement(HbcAnnotationThread, defaultProps));

    // Wait for annotation body to appear (confirms data loaded)
    expect(await screen.findByText('Please clarify this number.')).toBeInTheDocument();
    // Author is split across elements, use partial match
    expect(screen.getByText(/Jane Doe/)).toBeInTheDocument();
  });

  it('shows open count in header', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue([
      createMockAnnotation({ status: 'open', annotationId: 'a1', body: 'First annotation' }),
      createMockAnnotation({ status: 'open', annotationId: 'a2', body: 'Second annotation' }),
    ]);
    renderWithQuery(React.createElement(HbcAnnotationThread, defaultProps));

    expect(await screen.findByText('2 open')).toBeInTheDocument();
  });

  it('displays replies within annotation cards', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue([
      createMockAnnotation({
        status: 'open',
        body: 'Main annotation body.',
        replies: [
          createMockAnnotationReply({ replyId: 'r1', body: 'Reply text here', author: { userId: 'r-u1', displayName: 'Replier', role: 'PM' } }),
        ],
      }),
    ]);
    renderWithQuery(React.createElement(HbcAnnotationThread, defaultProps));

    expect(await screen.findByText('Reply text here')).toBeInTheDocument();
    expect(screen.getByText('Replier')).toBeInTheDocument();
  });

  it('shows reply form in expert mode when Reply is clicked', async () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'expert' });
    vi.mocked(AnnotationApi.list).mockResolvedValue([
      createMockAnnotation({ status: 'open', body: 'Test annotation body' }),
    ]);
    renderWithQuery(React.createElement(HbcAnnotationThread, defaultProps));

    // Wait for annotation to load first
    await screen.findByText('Test annotation body');
    const replyBtns = screen.getAllByText('Reply');
    // The action row Reply button (not the reply form)
    fireEvent.click(replyBtns[0]);

    expect(screen.getByLabelText('Reply text')).toBeInTheDocument();
  });

  it('reply cancel hides the reply form', async () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'expert' });
    vi.mocked(AnnotationApi.list).mockResolvedValue([
      createMockAnnotation({ status: 'open', body: 'Test body for reply' }),
    ]);
    renderWithQuery(React.createElement(HbcAnnotationThread, defaultProps));

    await screen.findByText('Test body for reply');
    const replyBtns = screen.getAllByText('Reply');
    fireEvent.click(replyBtns[0]);
    expect(screen.getByLabelText('Reply text')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByLabelText('Reply text')).not.toBeInTheDocument();
  });

  it('shows resolve form with required note for clarification-request', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue([
      createMockAnnotation({ intent: 'clarification-request', status: 'open', body: 'Need clarification on this.' }),
    ]);
    renderWithQuery(React.createElement(HbcAnnotationThread, defaultProps));

    await screen.findByText('Need clarification on this.');
    const resolveBtn = screen.getByText('Resolve');
    fireEvent.click(resolveBtn);

    expect(screen.getByRole('form', { name: 'Resolve annotation' })).toBeInTheDocument();
    expect(screen.getByText('Resolution note (required)')).toBeInTheDocument();
  });

  it('resolve button is disabled when note is required but empty', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue([
      createMockAnnotation({ intent: 'clarification-request', status: 'open', body: 'Clarify please.' }),
    ]);
    renderWithQuery(React.createElement(HbcAnnotationThread, defaultProps));

    await screen.findByText('Clarify please.');
    fireEvent.click(screen.getByText('Resolve'));
    const submitBtn = screen.getByText('Mark Resolved');
    expect(submitBtn).toBeDisabled();
  });

  it('resolve cancel hides the resolve form', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue([
      createMockAnnotation({ intent: 'clarification-request', status: 'open', body: 'Question about value.' }),
    ]);
    renderWithQuery(React.createElement(HbcAnnotationThread, defaultProps));

    await screen.findByText('Question about value.');
    fireEvent.click(screen.getByText('Resolve'));
    expect(screen.getByRole('form', { name: 'Resolve annotation' })).toBeInTheDocument();

    const cancelButtons = screen.getAllByText('Cancel');
    fireEvent.click(cancelButtons[cancelButtons.length - 1]);
    expect(screen.queryByRole('form', { name: 'Resolve annotation' })).not.toBeInTheDocument();
  });

  it('withdraw button calls withdrawAnnotation', async () => {
    const withdrawn = createMockAnnotation({ status: 'withdrawn' });
    vi.mocked(AnnotationApi.withdraw).mockResolvedValue(withdrawn);
    vi.mocked(AnnotationApi.list).mockResolvedValue([
      createMockAnnotation({ status: 'open', body: 'Body for withdraw test.' }),
    ]);
    renderWithQuery(React.createElement(HbcAnnotationThread, defaultProps));

    await screen.findByText('Body for withdraw test.');
    fireEvent.click(screen.getByText('Withdraw'));

    await waitFor(() => {
      expect(AnnotationApi.withdraw).toHaveBeenCalledOnce();
    });
  });

  it('shows resolved annotations toggle when resolved exist', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue([
      createMockAnnotation({ status: 'resolved', annotationId: 'res-1', resolutionNote: 'Done.', body: 'Old annotation' }),
    ]);
    renderWithQuery(React.createElement(HbcAnnotationThread, defaultProps));

    const toggle = await screen.findByText(/Show resolved/);
    expect(toggle).toBeInTheDocument();

    fireEvent.click(toggle);
    expect(screen.getByText(/Hide resolved/)).toBeInTheDocument();
    expect(screen.getByText('Done.')).toBeInTheDocument();
  });

  it('closes on Escape key', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue([]);
    renderWithQuery(React.createElement(HbcAnnotationThread, defaultProps));

    await screen.findByTestId('popover');
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(defaultProps.onClose).toHaveBeenCalledOnce();
  });

  it('renders close button that calls onClose', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue([]);
    renderWithQuery(React.createElement(HbcAnnotationThread, defaultProps));

    const closeBtn = await screen.findByLabelText('Close annotation thread');
    fireEvent.click(closeBtn);

    expect(defaultProps.onClose).toHaveBeenCalledOnce();
  });

  it('shows AddAnnotationForm when canAnnotate=true', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue([]);
    renderWithQuery(React.createElement(HbcAnnotationThread, defaultProps));

    expect(await screen.findByText('Add annotation')).toBeInTheDocument();
    expect(screen.getByRole('form', { name: 'Add annotation' })).toBeInTheDocument();
  });

  it('hides AddAnnotationForm when canAnnotate=false', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue([]);
    renderWithQuery(React.createElement(HbcAnnotationThread, { ...defaultProps, canAnnotate: false }));

    await screen.findByTestId('popover');
    expect(screen.queryByRole('form', { name: 'Add annotation' })).not.toBeInTheDocument();
  });

  it('AddAnnotationForm intent select and submit creates annotation', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue([]);
    vi.mocked(AnnotationApi.create).mockResolvedValue(createMockAnnotation());
    renderWithQuery(React.createElement(HbcAnnotationThread, defaultProps));

    const select = await screen.findByLabelText('Type');
    fireEvent.change(select, { target: { value: 'clarification-request' } });

    const textarea = screen.getByLabelText('Annotation text');
    fireEvent.change(textarea, { target: { value: 'Need clarification.' } });

    const addBtn = screen.getByText('Add');
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(AnnotationApi.create).toHaveBeenCalledWith(
        expect.objectContaining({
          intent: 'clarification-request',
          body: 'Need clarification.',
        })
      );
    });
  });

  it('hides Resolve button when canResolve=false', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue([
      createMockAnnotation({ status: 'open', body: 'Body for resolve test' }),
    ]);
    renderWithQuery(React.createElement(HbcAnnotationThread, { ...defaultProps, canResolve: false }));

    await screen.findByText('Body for resolve test');
    expect(screen.getByText('Reply')).toBeInTheDocument();
    expect(screen.queryByText('Resolve')).not.toBeInTheDocument();
  });

  it('shows assignee info for assigned annotation', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue([
      createMockAnnotation({
        status: 'open',
        body: 'Assigned annotation body.',
        assignedTo: { userId: 'a1', displayName: 'Assigned Person', role: 'Manager' },
      }),
    ]);
    renderWithQuery(React.createElement(HbcAnnotationThread, defaultProps));

    await screen.findByText('Assigned annotation body.');
    expect(screen.getByText('Assigned Person')).toBeInTheDocument();
  });

  it('shows resolution details for resolved annotations', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue([
      createMockAnnotation({
        status: 'resolved',
        body: 'Resolved annotation body.',
        resolutionNote: 'This has been addressed.',
        resolvedBy: { userId: 'rb1', displayName: 'Resolver Person', role: 'Director' },
      }),
    ]);
    renderWithQuery(React.createElement(HbcAnnotationThread, defaultProps));

    const toggle = await screen.findByText(/Show resolved/);
    fireEvent.click(toggle);

    expect(screen.getByText('This has been addressed.')).toBeInTheDocument();
    expect(screen.getByText(/Resolver Person/)).toBeInTheDocument();
  });

  it('shows empty message when no open annotations and canAnnotate=false', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue([]);
    renderWithQuery(React.createElement(HbcAnnotationThread, { ...defaultProps, canAnnotate: false }));

    expect(await screen.findByText('No open annotations.')).toBeInTheDocument();
  });

  it('submits reply with body text (expert mode)', async () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'expert' });
    vi.mocked(AnnotationApi.addReply).mockResolvedValue(
      createMockAnnotationReply({ replyId: 'new-reply' })
    );
    vi.mocked(AnnotationApi.list).mockResolvedValue([
      createMockAnnotation({ status: 'open', body: 'Reply submit test' }),
    ]);
    renderWithQuery(React.createElement(HbcAnnotationThread, defaultProps));

    await screen.findByText('Reply submit test');
    const replyBtns = screen.getAllByText('Reply');
    fireEvent.click(replyBtns[0]);

    const textarea = screen.getByLabelText('Reply text');
    fireEvent.change(textarea, { target: { value: 'My reply text' } });

    const sendBtn = screen.getByText('Reply', { selector: 'button.hbc-btn' });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(AnnotationApi.addReply).toHaveBeenCalledWith({
        annotationId: 'mock-annotation-001',
        body: 'My reply text',
      });
    });
  });

  it('resolves annotation with resolution note', async () => {
    vi.mocked(AnnotationApi.resolve).mockResolvedValue(
      createMockAnnotation({ status: 'resolved' })
    );
    vi.mocked(AnnotationApi.list).mockResolvedValue([
      createMockAnnotation({ intent: 'clarification-request', status: 'open', body: 'Resolve submit test' }),
    ]);
    renderWithQuery(React.createElement(HbcAnnotationThread, defaultProps));

    await screen.findByText('Resolve submit test');
    fireEvent.click(screen.getByText('Resolve'));

    const noteTextarea = screen.getByPlaceholderText('Describe how this was addressed…');
    fireEvent.change(noteTextarea, { target: { value: 'Addressed the concern.' } });

    fireEvent.click(screen.getByText('Mark Resolved'));

    await waitFor(() => {
      expect(AnnotationApi.resolve).toHaveBeenCalledWith({
        annotationId: 'mock-annotation-001',
        resolutionNote: 'Addressed the concern.',
      });
    });
  });

  it('resolves comment annotation without requiring note', async () => {
    const config = createMockAnnotationConfig({ requireResolutionNote: true }) as Required<ReturnType<typeof createMockAnnotationConfig>>;
    vi.mocked(AnnotationApi.resolve).mockResolvedValue(
      createMockAnnotation({ status: 'resolved' })
    );
    vi.mocked(AnnotationApi.list).mockResolvedValue([
      createMockAnnotation({ intent: 'comment', status: 'open', body: 'Comment resolve test' }),
    ]);
    renderWithQuery(React.createElement(HbcAnnotationThread, { ...defaultProps, config }));

    await screen.findByText('Comment resolve test');
    fireEvent.click(screen.getByText('Resolve'));

    // Comment intent should not require note — Mark Resolved should be enabled
    const markResolved = screen.getByText('Mark Resolved');
    expect(markResolved).not.toBeDisabled();
    fireEvent.click(markResolved);

    await waitFor(() => {
      expect(AnnotationApi.resolve).toHaveBeenCalledOnce();
    });
  });

  it('shows flag-for-revision placeholder text in add form', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue([]);
    renderWithQuery(React.createElement(HbcAnnotationThread, defaultProps));

    const select = await screen.findByLabelText('Type');
    fireEvent.change(select, { target: { value: 'flag-for-revision' } });

    expect(screen.getByPlaceholderText('What needs to be revised?')).toBeInTheDocument();
  });

  it('shows clarification-request placeholder text in add form', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue([]);
    renderWithQuery(React.createElement(HbcAnnotationThread, defaultProps));

    const select = await screen.findByLabelText('Type');
    fireEvent.change(select, { target: { value: 'clarification-request' } });

    expect(screen.getByPlaceholderText('What needs clarification?')).toBeInTheDocument();
  });
});
