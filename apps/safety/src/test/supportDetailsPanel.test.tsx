/**
 * Wave-02 Prompt-04 closure: SupportDetailsPanel behavior-first guards.
 *
 * Verifies that the panel renders the allow-listed diagnostic fields,
 * surfaces the suggestedAction first-class, copies a sanitized payload
 * (never backend `message` free-text), and has a safe fallback when the
 * diagnostic set is empty.
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SupportDetailsPanel } from '../components/SupportDetailsPanel.js';
import type { SupportDetails } from '../pages/supportTruth.js';

vi.mock('@hbc/ui-kit', () => ({
  HbcButton: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  HbcTypography: ({ children }: any) => <span>{children}</span>,
}));

describe('SupportDetailsPanel', () => {
  const writeTextMock = vi.fn(async () => undefined);

  beforeEach(() => {
    writeTextMock.mockClear();
    vi.stubGlobal('navigator', {
      ...globalThis.navigator,
      clipboard: { writeText: writeTextMock },
    });
    // jsdom does not implement execCommand('copy') — assign a stub so the
    // textarea fallback path can complete deterministically if the
    // primary clipboard path is unavailable in this runtime.
    (document as unknown as { execCommand: (cmd: string) => boolean }).execCommand =
      () => true;
  });

  it('renders all allow-listed diagnostic bullets when present', async () => {
    const user = userEvent.setup();
    const details: SupportDetails = {
      requestId: 'req-1',
      frontendRequestId: 'front-1',
      backendRequestId: 'back-1',
      failureClass: 'project-unresolved',
      previewFailureClass: 'project-unresolved',
      route: '/api/safety-records/ingest',
      status: 422,
      attempts: 2,
      timestamp: '2026-04-24T10:00:00.000Z',
    };
    render(
      <SupportDetailsPanel
        details={details}
        suggestedAction="Pick a resolvable project."
      />,
    );
    await user.click(screen.getByText(/support details/i));
    expect(screen.getByText(/requestId: req-1/i)).toBeInTheDocument();
    expect(screen.getByText(/frontendRequestId: front-1/i)).toBeInTheDocument();
    expect(screen.getByText(/backendRequestId: back-1/i)).toBeInTheDocument();
    expect(screen.getByText(/^failureClass: project-unresolved$/i)).toBeInTheDocument();
    expect(
      screen.getByText(/^previewFailureClass: project-unresolved$/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/route: \/api\/safety-records\/ingest/i)).toBeInTheDocument();
    expect(screen.getByText(/^status: 422$/i)).toBeInTheDocument();
    expect(screen.getByText(/^attempts: 2$/i)).toBeInTheDocument();
    expect(screen.getByText(/timestamp: 2026-04-24T10:00:00\.000Z/i)).toBeInTheDocument();
    expect(screen.getByText(/suggested next step/i)).toBeInTheDocument();
    expect(screen.getByText(/pick a resolvable project\./i)).toBeInTheDocument();
  });

  it('invokes the copy affordance and signals success to the caller onCopy callback', async () => {
    const user = userEvent.setup();
    const onCopy = vi.fn();
    const details: SupportDetails = {
      requestId: 'req-2',
      failureClass: 'auth',
      route: '/api/safety-records/ingest/preview',
      status: 403,
      timestamp: '2026-04-24T10:00:00.000Z',
    };
    render(
      <SupportDetailsPanel
        details={details}
        suggestedAction="Sign in again with a Safety-authorized account."
        onCopy={onCopy}
      />,
    );
    await user.click(screen.getByText(/support details/i));
    await user.click(screen.getByRole('button', { name: /copy support payload/i }));
    await waitFor(() => expect(onCopy).toHaveBeenCalledTimes(1));
    expect(onCopy).toHaveBeenCalledWith(true);
  });

  it('falls back to a safe notice when no diagnostic fields were returned', async () => {
    const user = userEvent.setup();
    render(<SupportDetailsPanel details={{}} />);
    await user.click(screen.getByText(/support details/i));
    expect(
      screen.getByText(/no additional diagnostic details were returned/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /copy support payload/i }),
    ).toBeInTheDocument();
  });

  it('fires polite feedback after a successful copy', async () => {
    const user = userEvent.setup();
    render(
      <SupportDetailsPanel
        details={{ requestId: 'req-3' }}
        suggestedAction="Retry and escalate if it repeats."
      />,
    );
    await user.click(screen.getByText(/support details/i));
    await user.click(screen.getByRole('button', { name: /copy support payload/i }));
    await waitFor(() =>
      expect(
        document.querySelector('[data-safety-ui="support-details-copy-feedback"]'),
      ).toHaveTextContent(/copied to clipboard/i),
    );
  });
});
