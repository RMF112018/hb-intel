import { describe, expect, it, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { HbcToastProvider, useToast, HbcToastContainer } from '../index.js';

/** Test consumer that exposes the toast API via buttons */
const ToastConsumer: React.FC = () => {
  const { toast } = useToast();
  return (
    <>
      <button onClick={() => toast.success('Success toast')}>Show Success</button>
      <button onClick={() => toast.error('Error toast')}>Show Error</button>
      <button onClick={() => toast.info('Info toast')}>Show Info</button>
    </>
  );
};

function renderWithProvider(ui?: React.ReactNode) {
  return render(
    <HbcToastProvider>
      <HbcToastContainer />
      {ui}
    </HbcToastProvider>,
  );
}

describe('HbcToast', () => {
  it('HbcToastProvider renders children', () => {
    render(
      <HbcToastProvider>
        <span data-testid="child">Hello</span>
      </HbcToastProvider>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('useToast throws when used outside provider', () => {
    const Broken: React.FC = () => {
      useToast();
      return null;
    };
    expect(() => render(<Broken />)).toThrow('useToast must be used within <HbcToastProvider>');
  });

  it('useToast returns toast API with category methods', () => {
    let api: ReturnType<typeof useToast> | null = null;
    const Capture: React.FC = () => {
      api = useToast();
      return null;
    };
    render(
      <HbcToastProvider>
        <Capture />
      </HbcToastProvider>,
    );
    expect(api).not.toBeNull();
    expect(typeof api!.toast.success).toBe('function');
    expect(typeof api!.toast.error).toBe('function');
    expect(typeof api!.toast.warning).toBe('function');
    expect(typeof api!.toast.info).toBe('function');
    expect(typeof api!.dismissToast).toBe('function');
  });

  it('toast container renders with aria-live when toasts are present', async () => {
    renderWithProvider(<ToastConsumer />);

    await act(async () => {
      await userEvent.click(screen.getByText('Show Success'));
    });

    const container = document.querySelector('[aria-live="polite"]');
    expect(container).toBeInTheDocument();
  });

  it('toast appears when show() is called', async () => {
    renderWithProvider(<ToastConsumer />);

    await act(async () => {
      await userEvent.click(screen.getByText('Show Info'));
    });

    expect(screen.getByText('Info toast')).toBeInTheDocument();
  });

  it('error toast has dismiss button', async () => {
    renderWithProvider(<ToastConsumer />);

    await act(async () => {
      await userEvent.click(screen.getByText('Show Error'));
    });

    expect(screen.getByText('Error toast')).toBeInTheDocument();
    expect(screen.getByLabelText('Dismiss toast')).toBeInTheDocument();
  });
});
