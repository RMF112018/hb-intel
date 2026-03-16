import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

let mockIsLoading = false;

// Mock hooks before importing the component
vi.mock('../hooks/usePdfRenderer.js', () => ({
  usePdfRenderer: () => ({
    canvasRef: { current: null },
    isLoading: mockIsLoading,
    error: null,
    pageCount: 1,
    currentPage: 1,
    renderPage: vi.fn(),
  }),
}));

vi.mock('../hooks/useTouchGestures.js', () => ({
  useTouchGestures: () => ({
    containerRef: { current: null },
    transform: { scale: 1, translateX: 0, translateY: 0 },
    resetTransform: vi.fn(),
    gestureHandlers: {
      onPointerDown: vi.fn(),
      onPointerMove: vi.fn(),
      onPointerUp: vi.fn(),
      onPointerCancel: vi.fn(),
      onWheel: vi.fn(),
    },
  }),
}));

vi.mock('../hooks/useMarkupState.js', () => ({
  useMarkupState: () => ({
    activeTool: 'select',
    setActiveTool: vi.fn(),
    currentMarkup: null,
    handlers: {
      onPointerDown: vi.fn(),
      onPointerMove: vi.fn(),
      onPointerUp: vi.fn(),
    },
  }),
}));

// Import after mocks
const { HbcDrawingViewer } = await import('../index.js');

describe('HbcDrawingViewer', () => {
  it('renders with data-hbc-ui="drawing-viewer"', () => {
    const { container } = render(<HbcDrawingViewer pdfUrl="/test.pdf" />);
    expect(
      container.querySelector('[data-hbc-ui="drawing-viewer"]'),
    ).toBeInTheDocument();
  });

  it('shows loading overlay when PDF is loading', () => {
    mockIsLoading = true;
    render(<HbcDrawingViewer pdfUrl="/test.pdf" />);
    expect(screen.getByText('Loading PDF...')).toBeInTheDocument();
    mockIsLoading = false;
  });

  it('renders sheet selector when sheetOptions provided', () => {
    render(
      <HbcDrawingViewer
        pdfUrl="/test.pdf"
        sheetOptions={[
          { id: 's1', label: 'Sheet 1' },
          { id: 's2', label: 'Sheet 2' },
        ]}
      />,
    );
    expect(screen.getByLabelText('Sheet')).toBeInTheDocument();
  });

  it('renders revision selector when revisionOptions provided', () => {
    render(
      <HbcDrawingViewer
        pdfUrl="/test.pdf"
        revisionOptions={[
          { id: 'r1', label: 'Rev A' },
          { id: 'r2', label: 'Rev B' },
        ]}
      />,
    );
    expect(screen.getByLabelText('Revision')).toBeInTheDocument();
  });

  it('toggles markup mode on button click', async () => {
    const user = userEvent.setup();
    render(<HbcDrawingViewer pdfUrl="/test.pdf" />);

    const button = screen.getByText(/Markup OFF/);
    expect(button).toHaveAttribute('aria-pressed', 'false');

    await user.click(button);
    expect(screen.getByText(/Markup ON/)).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows reset button', () => {
    render(<HbcDrawingViewer pdfUrl="/test.pdf" />);
    expect(screen.getByText('Reset')).toBeInTheDocument();
  });
});
