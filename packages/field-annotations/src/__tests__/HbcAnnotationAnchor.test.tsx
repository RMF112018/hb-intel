import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useComplexity } from '@hbc/complexity';
import { HbcAnnotationAnchor } from '../components/HbcAnnotationAnchor';
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

vi.mock('@hbc/ui-kit/app-shell', () => ({
  Popover: ({ children, ...props }: any) =>
    React.createElement('div', { role: 'dialog', 'data-testid': 'popover', ...props }, children),
}));

function renderWithQuery(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    React.createElement(QueryClientProvider, { client: qc }, ui)
  );
}

const defaultProps = {
  recordType: 'project-hub-pmp',
  recordId: 'rec-001',
  anchorKey: 'section:financial-summary',
  anchorLabel: 'Financial Summary',
  anchorType: 'section' as const,
  config: createMockAnnotationConfig({ recordType: 'project-hub-pmp' }),
};

const childContent = React.createElement('div', { 'data-testid': 'wrapped-content' }, 'Section Content');

beforeEach(() => {
  vi.mocked(useComplexity).mockReturnValue({ tier: 'standard' });
  vi.mocked(AnnotationApi.list).mockReset();
});

describe('HbcAnnotationAnchor', () => {
  it('renders children content', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue([]);
    renderWithQuery(
      React.createElement(HbcAnnotationAnchor, { ...defaultProps, canAnnotate: true }, childContent)
    );

    expect(screen.getByTestId('wrapped-content')).toBeInTheDocument();
    expect(screen.getByText('Section Content')).toBeInTheDocument();
  });

  it('renders only children in essential mode (D-05)', () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'essential' });
    renderWithQuery(
      React.createElement(HbcAnnotationAnchor, { ...defaultProps, canAnnotate: true }, childContent)
    );

    expect(screen.getByTestId('wrapped-content')).toBeInTheDocument();
    expect(screen.queryByTestId('hbc-annotation-anchor')).not.toBeInTheDocument();
  });

  it('renders only children for viewer when visibleToViewers=false', () => {
    const config = createMockAnnotationConfig({ visibleToViewers: false });
    renderWithQuery(
      React.createElement(
        HbcAnnotationAnchor,
        { ...defaultProps, config, canAnnotate: false, canResolve: false },
        childContent
      )
    );

    expect(screen.getByTestId('wrapped-content')).toBeInTheDocument();
    expect(screen.queryByTestId('hbc-annotation-anchor')).not.toBeInTheDocument();
  });

  it('shows indicator when annotations exist', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue([
      createMockAnnotation({
        fieldKey: 'section:financial-summary',
        anchorType: 'section',
        intent: 'comment',
        status: 'open',
      }),
    ]);
    renderWithQuery(
      React.createElement(HbcAnnotationAnchor, { ...defaultProps, canAnnotate: true }, childContent)
    );

    await waitFor(() => {
      const indicator = screen.getByTestId('hbc-annotation-anchor-indicator');
      expect(indicator.className).toContain('blue');
    });
  });

  it('renders add-only indicator when canAnnotate=true with no annotations', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue([]);
    renderWithQuery(
      React.createElement(HbcAnnotationAnchor, { ...defaultProps, canAnnotate: true }, childContent)
    );

    const indicator = await screen.findByTestId('hbc-annotation-anchor-indicator');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveAttribute('aria-label', 'Add annotation to Financial Summary');
    expect(indicator.className).toContain('add-only');
  });

  it('has no indicator for non-annotator with no annotations', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue([]);
    renderWithQuery(
      React.createElement(HbcAnnotationAnchor, { ...defaultProps, canAnnotate: false }, childContent)
    );

    await waitFor(() => {
      expect(screen.queryByTestId('hbc-annotation-anchor-indicator')).not.toBeInTheDocument();
    });
  });

  it('opens thread on indicator click', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue([
      createMockAnnotation({
        fieldKey: 'section:financial-summary',
        anchorType: 'section',
        status: 'open',
      }),
    ]);
    renderWithQuery(
      React.createElement(HbcAnnotationAnchor, { ...defaultProps, canAnnotate: true }, childContent)
    );

    await waitFor(() => {
      expect(screen.getByTestId('hbc-annotation-anchor-indicator').className).toContain('blue');
    });

    fireEvent.click(screen.getByTestId('hbc-annotation-anchor-indicator'));
    expect(screen.getByTestId('hbc-annotation-anchor-indicator')).toHaveAttribute('aria-expanded', 'true');
  });

  it('shows count badge in expert mode (D-05)', async () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'expert' });
    vi.mocked(AnnotationApi.list).mockResolvedValue([
      createMockAnnotation({ status: 'open', annotationId: 'a1', fieldKey: 'section:financial-summary', anchorType: 'section' }),
      createMockAnnotation({ status: 'open', annotationId: 'a2', fieldKey: 'section:financial-summary', anchorType: 'section' }),
    ]);
    renderWithQuery(
      React.createElement(HbcAnnotationAnchor, { ...defaultProps, canAnnotate: true }, childContent)
    );

    await waitFor(() => {
      const indicator = screen.getByTestId('hbc-annotation-anchor-indicator');
      expect(indicator.textContent).toContain('2');
    });
  });

  it('sets data-anchor-type attribute on wrapper', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue([]);
    renderWithQuery(
      React.createElement(HbcAnnotationAnchor, { ...defaultProps, canAnnotate: true }, childContent)
    );

    const anchor = await screen.findByTestId('hbc-annotation-anchor');
    expect(anchor).toHaveAttribute('data-anchor-type', 'section');
  });

  it('renders block anchor type correctly', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue([]);
    renderWithQuery(
      React.createElement(
        HbcAnnotationAnchor,
        { ...defaultProps, anchorKey: 'block:cash-flow-table', anchorLabel: 'Cash Flow Table', anchorType: 'block', canAnnotate: true },
        childContent
      )
    );

    const anchor = await screen.findByTestId('hbc-annotation-anchor');
    expect(anchor).toHaveAttribute('data-anchor-type', 'block');
    expect(anchor.className).toContain('hbc-annotation-anchor--block');
  });

  it('forceVariant=essential renders only children', () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'standard' });
    renderWithQuery(
      React.createElement(
        HbcAnnotationAnchor,
        { ...defaultProps, canAnnotate: true, forceVariant: 'essential' },
        childContent
      )
    );

    expect(screen.getByTestId('wrapped-content')).toBeInTheDocument();
    expect(screen.queryByTestId('hbc-annotation-anchor')).not.toBeInTheDocument();
  });

  it('renders grey indicator with checkmark for resolved-only', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue([
      createMockAnnotation({ status: 'resolved', fieldKey: 'section:financial-summary', anchorType: 'section' }),
    ]);
    renderWithQuery(
      React.createElement(HbcAnnotationAnchor, { ...defaultProps, canAnnotate: true }, childContent)
    );

    await waitFor(() => {
      const indicator = screen.getByTestId('hbc-annotation-anchor-indicator');
      expect(indicator.className).toContain('grey');
      expect(indicator.textContent).toContain('✓');
    });
  });
});
