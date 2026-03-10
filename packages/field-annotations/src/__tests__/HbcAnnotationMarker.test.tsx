import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useComplexity } from '@hbc/complexity';
import { HbcAnnotationMarker } from '../components/HbcAnnotationMarker';
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
  recordType: 'bd-scorecard',
  recordId: 'rec-001',
  fieldKey: 'totalBuildableArea',
  fieldLabel: 'Total Buildable Area',
  config: createMockAnnotationConfig(),
};

beforeEach(() => {
  vi.mocked(useComplexity).mockReturnValue({ tier: 'standard' });
  vi.mocked(AnnotationApi.list).mockReset();
});

describe('HbcAnnotationMarker', () => {
  it('returns null in essential mode (D-05)', () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'essential' });
    const { container } = renderWithQuery(
      React.createElement(HbcAnnotationMarker, { ...defaultProps, canAnnotate: true })
    );
    expect(container.innerHTML).toBe('');
  });

  it('returns null for viewer when visibleToViewers=false', () => {
    const config = createMockAnnotationConfig({ visibleToViewers: false });
    const { container } = renderWithQuery(
      React.createElement(HbcAnnotationMarker, { ...defaultProps, config, canAnnotate: false, canResolve: false })
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders marker when canAnnotate=true even with no annotations (add-only state)', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue([]);
    renderWithQuery(
      React.createElement(HbcAnnotationMarker, { ...defaultProps, canAnnotate: true })
    );

    const marker = await screen.findByTestId('hbc-annotation-marker');
    expect(marker).toBeInTheDocument();
    expect(marker).toHaveAttribute('aria-label', 'Add annotation');
    expect(marker.className).toContain('add-only');
  });

  it('returns null for non-annotator with no annotations (hidden state)', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue([]);
    renderWithQuery(
      React.createElement(HbcAnnotationMarker, { ...defaultProps, canAnnotate: false })
    );

    await waitFor(() => {
      expect(screen.queryByTestId('hbc-annotation-marker')).not.toBeInTheDocument();
    });
  });

  it('renders red dot for open clarification-request', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue([
      createMockAnnotation({ intent: 'clarification-request', status: 'open' }),
    ]);
    renderWithQuery(
      React.createElement(HbcAnnotationMarker, { ...defaultProps, canAnnotate: true })
    );

    await waitFor(() => {
      const marker = screen.getByTestId('hbc-annotation-marker');
      expect(marker.className).toContain('red');
    });
  });

  it('renders amber dot for open flag-for-revision', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue([
      createMockAnnotation({ intent: 'flag-for-revision', status: 'open' }),
    ]);
    renderWithQuery(
      React.createElement(HbcAnnotationMarker, { ...defaultProps, canAnnotate: true })
    );

    await waitFor(() => {
      const marker = screen.getByTestId('hbc-annotation-marker');
      expect(marker.className).toContain('amber');
    });
  });

  it('renders blue dot for open comment', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue([
      createMockAnnotation({ intent: 'comment', status: 'open' }),
    ]);
    renderWithQuery(
      React.createElement(HbcAnnotationMarker, { ...defaultProps, canAnnotate: true })
    );

    await waitFor(() => {
      const marker = screen.getByTestId('hbc-annotation-marker');
      expect(marker.className).toContain('blue');
    });
  });

  it('renders grey dot with checkmark for resolved-only', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue([
      createMockAnnotation({ status: 'resolved' }),
    ]);
    renderWithQuery(
      React.createElement(HbcAnnotationMarker, { ...defaultProps, canAnnotate: true })
    );

    await waitFor(() => {
      const marker = screen.getByTestId('hbc-annotation-marker');
      expect(marker.className).toContain('grey');
      expect(marker.textContent).toContain('✓');
    });
  });

  it('shows expert badge with open count in expert mode (D-05)', async () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'expert' });
    vi.mocked(AnnotationApi.list).mockResolvedValue([
      createMockAnnotation({ status: 'open', annotationId: 'a1' }),
      createMockAnnotation({ status: 'open', annotationId: 'a2' }),
    ]);
    renderWithQuery(
      React.createElement(HbcAnnotationMarker, { ...defaultProps, canAnnotate: true })
    );

    await waitFor(() => {
      const marker = screen.getByTestId('hbc-annotation-marker');
      expect(marker.textContent).toContain('2');
    });
  });

  it('respects forceVariant override', async () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'standard' });
    vi.mocked(AnnotationApi.list).mockResolvedValue([
      createMockAnnotation({ status: 'open' }),
    ]);
    renderWithQuery(
      React.createElement(HbcAnnotationMarker, { ...defaultProps, canAnnotate: true, forceVariant: 'expert' })
    );

    await waitFor(() => {
      const marker = screen.getByTestId('hbc-annotation-marker');
      expect(marker.textContent).toContain('1');
    });
  });

  it('forceVariant=essential returns null', () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'standard' });
    const { container } = renderWithQuery(
      React.createElement(HbcAnnotationMarker, { ...defaultProps, canAnnotate: true, forceVariant: 'essential' })
    );
    expect(container.innerHTML).toBe('');
  });

  it('opens thread on click', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue([
      createMockAnnotation({ status: 'open' }),
    ]);
    renderWithQuery(
      React.createElement(HbcAnnotationMarker, { ...defaultProps, canAnnotate: true })
    );

    await waitFor(() => {
      expect(screen.getByTestId('hbc-annotation-marker').className).toContain('blue');
    });

    fireEvent.click(screen.getByTestId('hbc-annotation-marker'));
    expect(screen.getByTestId('hbc-annotation-marker')).toHaveAttribute('aria-expanded', 'true');
  });

  it('prioritizes clarification-request over comment in mixed state', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue([
      createMockAnnotation({ intent: 'comment', status: 'open', annotationId: 'c1' }),
      createMockAnnotation({ intent: 'clarification-request', status: 'open', annotationId: 'c2' }),
    ]);
    renderWithQuery(
      React.createElement(HbcAnnotationMarker, { ...defaultProps, canAnnotate: true })
    );

    await waitFor(() => {
      const marker = screen.getByTestId('hbc-annotation-marker');
      expect(marker.className).toContain('red');
    });
  });

  it('shows single open annotation tooltip text', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue([
      createMockAnnotation({ status: 'open' }),
    ]);
    renderWithQuery(
      React.createElement(HbcAnnotationMarker, { ...defaultProps, canAnnotate: true })
    );

    await waitFor(() => {
      expect(screen.getByTestId('hbc-annotation-marker')).toHaveAttribute('title', '1 open annotation');
    });
  });

  it('closes thread via Escape (handleThreadClose)', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue([
      createMockAnnotation({ status: 'open' }),
    ]);
    renderWithQuery(
      React.createElement(HbcAnnotationMarker, { ...defaultProps, canAnnotate: true })
    );

    await waitFor(() => {
      expect(screen.getByTestId('hbc-annotation-marker').className).toContain('blue');
    });

    // Open the thread
    fireEvent.click(screen.getByTestId('hbc-annotation-marker'));
    expect(screen.getByTestId('hbc-annotation-marker')).toHaveAttribute('aria-expanded', 'true');

    // Close via Escape
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.getByTestId('hbc-annotation-marker')).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('shows multiple open annotations tooltip text', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue([
      createMockAnnotation({ status: 'open', annotationId: 'a1' }),
      createMockAnnotation({ status: 'open', annotationId: 'a2' }),
      createMockAnnotation({ status: 'open', annotationId: 'a3' }),
    ]);
    renderWithQuery(
      React.createElement(HbcAnnotationMarker, { ...defaultProps, canAnnotate: true })
    );

    await waitFor(() => {
      expect(screen.getByTestId('hbc-annotation-marker')).toHaveAttribute('title', '3 open annotations');
    });
  });
});
