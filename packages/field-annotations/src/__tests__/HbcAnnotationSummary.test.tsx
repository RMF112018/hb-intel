import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useComplexity } from '@hbc/complexity';
import { HbcAnnotationSummary } from '../components/HbcAnnotationSummary';
import { AnnotationApi } from '../api/AnnotationApi';
import { createMockAnnotation } from '../../testing/createMockAnnotation';
import { createMockAnnotationConfig } from '../../testing/createMockAnnotationConfig';

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

function renderWithQuery(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(React.createElement(QueryClientProvider, { client: qc }, ui));
}

const defaultProps = {
  recordType: 'bd-scorecard',
  recordId: 'rec-001',
  config: createMockAnnotationConfig(),
};

beforeEach(() => {
  vi.mocked(useComplexity).mockReturnValue({ tier: 'standard' });
  vi.mocked(AnnotationApi.list).mockReset();
});

describe('HbcAnnotationSummary', () => {
  it('returns null in essential mode (D-05)', async () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'essential' });
    vi.mocked(AnnotationApi.list).mockResolvedValue([]);
    const { container } = renderWithQuery(
      React.createElement(HbcAnnotationSummary, defaultProps)
    );

    // Must still call hooks before early return
    await waitFor(() => {
      expect(container.innerHTML).toBe('');
    });
  });

  it('shows loading state', () => {
    // Never resolve the promise to keep loading
    vi.mocked(AnnotationApi.list).mockReturnValue(new Promise(() => {}));
    renderWithQuery(React.createElement(HbcAnnotationSummary, defaultProps));

    expect(screen.getByText('Loading annotations…')).toBeInTheDocument();
  });

  it('shows empty state when no open annotations', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue([]);
    renderWithQuery(React.createElement(HbcAnnotationSummary, defaultProps));

    expect(await screen.findByText('No open annotations')).toBeInTheDocument();
  });

  it('shows resolved count in empty state', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue([
      createMockAnnotation({ status: 'resolved' }),
      createMockAnnotation({ status: 'resolved', annotationId: 'r2' }),
    ]);
    renderWithQuery(React.createElement(HbcAnnotationSummary, defaultProps));

    expect(await screen.findByText('No open annotations')).toBeInTheDocument();
    expect(screen.getByText('2 resolved')).toBeInTheDocument();
  });

  it('shows open count and breakdown by intent', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue([
      createMockAnnotation({ intent: 'clarification-request', status: 'open', annotationId: 'a1' }),
      createMockAnnotation({ intent: 'clarification-request', status: 'open', annotationId: 'a2' }),
      createMockAnnotation({ intent: 'flag-for-revision', status: 'open', annotationId: 'a3' }),
      createMockAnnotation({ intent: 'comment', status: 'open', annotationId: 'a4' }),
    ]);
    renderWithQuery(React.createElement(HbcAnnotationSummary, defaultProps));

    expect(await screen.findByText('4 open annotations')).toBeInTheDocument();
    expect(screen.getByText('2 clarifications')).toBeInTheDocument();
    expect(screen.getByText('1 revision flag')).toBeInTheDocument();
    expect(screen.getByText('1 comment')).toBeInTheDocument();
  });

  it('shows singular text for single open annotation', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue([
      createMockAnnotation({ intent: 'comment', status: 'open' }),
    ]);
    renderWithQuery(React.createElement(HbcAnnotationSummary, defaultProps));

    expect(await screen.findByText('1 open annotation')).toBeInTheDocument();
    expect(screen.getByText('1 comment')).toBeInTheDocument();
  });

  it('shows per-field breakdown in expert mode (D-05)', async () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'expert' });
    vi.mocked(AnnotationApi.list).mockResolvedValue([
      createMockAnnotation({
        fieldKey: 'gmp',
        fieldLabel: 'Estimated GMP',
        intent: 'clarification-request',
        status: 'open',
        body: 'Need to verify this GMP value.',
        author: { userId: 'u1', displayName: 'Alice', role: 'PM' },
      }),
      createMockAnnotation({
        fieldKey: 'area',
        fieldLabel: 'Total Area',
        intent: 'comment',
        status: 'open',
        annotationId: 'a2',
        body: 'Looks correct.',
        author: { userId: 'u2', displayName: 'Bob', role: 'Estimator' },
      }),
    ]);
    renderWithQuery(React.createElement(HbcAnnotationSummary, defaultProps));

    expect(await screen.findByText('Estimated GMP')).toBeInTheDocument();
    expect(screen.getByText('Total Area')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('calls onFieldFocus when field item is clicked in expert mode', async () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'expert' });
    const onFieldFocus = vi.fn();
    vi.mocked(AnnotationApi.list).mockResolvedValue([
      createMockAnnotation({ fieldKey: 'gmp', fieldLabel: 'Estimated GMP', status: 'open' }),
    ]);
    renderWithQuery(
      React.createElement(HbcAnnotationSummary, { ...defaultProps, onFieldFocus })
    );

    const btn = await screen.findByLabelText(/Go to Estimated GMP/);
    fireEvent.click(btn);

    expect(onFieldFocus).toHaveBeenCalledWith('gmp');
  });

  it('shows field count summary in standard mode (not expanded)', async () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'standard' });
    vi.mocked(AnnotationApi.list).mockResolvedValue([
      createMockAnnotation({ fieldKey: 'gmp', status: 'open', annotationId: 'a1' }),
      createMockAnnotation({ fieldKey: 'area', status: 'open', annotationId: 'a2' }),
    ]);
    renderWithQuery(React.createElement(HbcAnnotationSummary, defaultProps));

    expect(await screen.findByText('Across 2 fields')).toBeInTheDocument();
  });

  it('shows singular field text for single field', async () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'standard' });
    vi.mocked(AnnotationApi.list).mockResolvedValue([
      createMockAnnotation({ fieldKey: 'gmp', status: 'open' }),
    ]);
    renderWithQuery(React.createElement(HbcAnnotationSummary, defaultProps));

    expect(await screen.findByText('Across 1 field')).toBeInTheDocument();
  });

  it('respects forceVariant override to expert', async () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'standard' });
    vi.mocked(AnnotationApi.list).mockResolvedValue([
      createMockAnnotation({ fieldKey: 'gmp', fieldLabel: 'GMP', status: 'open' }),
    ]);
    renderWithQuery(
      React.createElement(HbcAnnotationSummary, { ...defaultProps, forceVariant: 'expert' })
    );

    // Expert mode shows field list, not the "Across X fields" summary
    expect(await screen.findByText('GMP')).toBeInTheDocument();
  });

  it('forceVariant=essential returns null', async () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'standard' });
    vi.mocked(AnnotationApi.list).mockResolvedValue([]);
    const { container } = renderWithQuery(
      React.createElement(HbcAnnotationSummary, { ...defaultProps, forceVariant: 'essential' as any })
    );

    await waitFor(() => {
      expect(container.innerHTML).toBe('');
    });
  });

  it('truncates long body text in expert field list', async () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'expert' });
    const longBody = 'A'.repeat(80);
    vi.mocked(AnnotationApi.list).mockResolvedValue([
      createMockAnnotation({ fieldKey: 'gmp', fieldLabel: 'GMP', status: 'open', body: longBody }),
    ]);
    renderWithQuery(React.createElement(HbcAnnotationSummary, defaultProps));

    await screen.findByText('GMP');
    const excerpt = screen.getByText(/A{50,}…/);
    expect(excerpt.textContent!.length).toBeLessThanOrEqual(61); // 60 chars + ellipsis
  });

  it('shows plural revision flags text', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue([
      createMockAnnotation({ intent: 'flag-for-revision', status: 'open', annotationId: 'r1' }),
      createMockAnnotation({ intent: 'flag-for-revision', status: 'open', annotationId: 'r2' }),
    ]);
    renderWithQuery(React.createElement(HbcAnnotationSummary, defaultProps));

    expect(await screen.findByText('2 revision flags')).toBeInTheDocument();
  });

  it('shows plural comments text', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue([
      createMockAnnotation({ intent: 'comment', status: 'open', annotationId: 'c1' }),
      createMockAnnotation({ intent: 'comment', status: 'open', annotationId: 'c2' }),
    ]);
    renderWithQuery(React.createElement(HbcAnnotationSummary, defaultProps));

    expect(await screen.findByText('2 comments')).toBeInTheDocument();
  });

  it('shows singular clarification text', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue([
      createMockAnnotation({ intent: 'clarification-request', status: 'open' }),
    ]);
    renderWithQuery(React.createElement(HbcAnnotationSummary, defaultProps));

    expect(await screen.findByText('1 clarification')).toBeInTheDocument();
  });

  it('expert mode field button aria-label with plural annotations', async () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'expert' });
    vi.mocked(AnnotationApi.list).mockResolvedValue([
      createMockAnnotation({ fieldKey: 'gmp', fieldLabel: 'GMP', status: 'open', annotationId: 'a1' }),
      createMockAnnotation({ fieldKey: 'gmp', fieldLabel: 'GMP', status: 'open', annotationId: 'a2' }),
    ]);
    renderWithQuery(React.createElement(HbcAnnotationSummary, defaultProps));

    const btn = await screen.findByLabelText('Go to GMP — 2 open annotations');
    expect(btn).toBeInTheDocument();
  });

  it('expert mode field button aria-label with single annotation', async () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'expert' });
    vi.mocked(AnnotationApi.list).mockResolvedValue([
      createMockAnnotation({ fieldKey: 'gmp', fieldLabel: 'GMP', status: 'open' }),
    ]);
    renderWithQuery(React.createElement(HbcAnnotationSummary, defaultProps));

    const btn = await screen.findByLabelText('Go to GMP — 1 open annotation');
    expect(btn).toBeInTheDocument();
  });
});
