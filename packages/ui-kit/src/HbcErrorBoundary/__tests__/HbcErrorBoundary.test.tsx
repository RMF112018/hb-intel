import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HbcErrorBoundary } from '../index.js';

/* ── Helper that throws on demand ─────────────────────────────── */
function ThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('Test error');
  return <div>Normal content</div>;
}

describe('HbcErrorBoundary', () => {
  it('renders children normally when no error occurs', () => {
    render(
      <HbcErrorBoundary>
        <ThrowingComponent shouldThrow={false} />
      </HbcErrorBoundary>,
    );

    expect(screen.getByText('Normal content')).toBeInTheDocument();
  });

  it('renders default fallback with "Something went wrong" heading on error', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <HbcErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </HbcErrorBoundary>,
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('displays the error message in the default fallback', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <HbcErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </HbcErrorBoundary>,
    );

    expect(screen.getByText('Test error')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('clears the error and re-renders children when retry button is clicked', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { rerender } = render(
      <HbcErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </HbcErrorBoundary>,
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Re-render with shouldThrow=false so children succeed after retry
    rerender(
      <HbcErrorBoundary>
        <ThrowingComponent shouldThrow={false} />
      </HbcErrorBoundary>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Try Again' }));

    expect(screen.getByText('Normal content')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('renders custom fallback with error and retry function', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <HbcErrorBoundary
        fallback={(error, retry) => (
          <div>
            <span>Custom: {error.message}</span>
            <button onClick={retry}>Custom Retry</button>
          </div>
        )}
      >
        <ThrowingComponent shouldThrow={true} />
      </HbcErrorBoundary>,
    );

    expect(screen.getByText('Custom: Test error')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Custom Retry' })).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('calls onError callback when an error is caught', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onError = vi.fn();

    render(
      <HbcErrorBoundary onError={onError}>
        <ThrowingComponent shouldThrow={true} />
      </HbcErrorBoundary>,
    );

    expect(onError).toHaveBeenCalledOnce();
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Test error' }),
      expect.objectContaining({ componentStack: expect.any(String) }),
    );

    consoleSpy.mockRestore();
  });

  it('renders data-hbc-ui="error-boundary" on the default fallback', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <HbcErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </HbcErrorBoundary>,
    );

    expect(screen.getByText('Something went wrong').closest('[data-hbc-ui="error-boundary"]')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
