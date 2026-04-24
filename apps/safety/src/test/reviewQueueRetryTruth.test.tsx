/**
 * Wave-02 Prompt-04 closure: review-queue retry truthfulness.
 *
 * Replay only re-runs the retained source workbook through the same
 * pipeline; it cannot fix template, parse, period, or project-resolution
 * failures. For those classes the UI must replace the naive Retry CTA
 * with advisory next-step guidance. Duplicate suspects continue to flow
 * through the governed supersede dialog.
 */
/* eslint-disable @hb-intel/hbc/no-raw-form-elements -- test-scoped
   ui-kit mock: simulates HbcCheckbox with a raw input purely to satisfy
   the testing-library role query; production callers use HbcCheckbox. */
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SafetyReviewActions } from '../components/SafetyReviewActions.js';

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, params, ...rest }: any) => (
    <a
      href="#"
      data-to={to}
      data-params={params ? JSON.stringify(params) : ''}
      {...rest}
    >
      {children}
    </a>
  ),
}));

vi.mock('@hbc/ui-kit', () => ({
  HbcButton: ({ children, onClick, disabled, ...rest }: any) => (
    <button onClick={onClick} disabled={disabled} {...rest}>
      {children}
    </button>
  ),
  HbcTypography: ({ children }: any) => <span>{children}</span>,
  HbcStatusBadge: ({ label }: any) => <span>{label}</span>,
  HbcCheckbox: ({ label, checked, onChange, disabled }: any) => (
    <label>
      <input
        type="checkbox"
        checked={!!checked}
        disabled={!!disabled}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      {label}
    </label>
  ),
  HbcModal: ({ open, title, children, footer, role = 'dialog' }: any) =>
    open ? (
      <div role={role}>
        <div>{title}</div>
        {children}
        {footer}
      </div>
    ) : null,
}));

describe('SafetyReviewActions retry truthfulness', () => {
  const onRetry = vi.fn();

  beforeEach(() => {
    onRetry.mockReset();
  });

  it('renders plain Retry when the run has no blocking error class', () => {
    render(
      <SafetyReviewActions
        runId="run-1"
        isDuplicate={false}
        isPending={false}
        onRetry={onRetry}
        entryErrorClass="commit-error"
      />,
    );
    expect(screen.getByRole('button', { name: /^retry$/i })).toBeInTheDocument();
    expect(
      document.querySelector('[data-safety-ui="review-retry-guidance"]'),
    ).toBeNull();
  });

  it('replaces Retry with workbook-fix guidance for template-invalid runs', () => {
    render(
      <SafetyReviewActions
        runId="run-2"
        isDuplicate={false}
        isPending={false}
        onRetry={onRetry}
        entryErrorClass="template-invalid"
      />,
    );
    expect(screen.queryByRole('button', { name: /^retry$/i })).toBeNull();
    expect(screen.getByText(/correct the workbook/i)).toBeInTheDocument();
    expect(
      document
        .querySelector('[data-safety-ui="review-retry-guidance"]')
        ?.getAttribute('data-retry-posture'),
    ).toBe('needs-workbook-fix');
  });

  it('replaces Retry with workbook-fix guidance for parse-error runs', () => {
    render(
      <SafetyReviewActions
        runId="run-3"
        isDuplicate={false}
        isPending={false}
        onRetry={onRetry}
        entryErrorClass="parse-error"
      />,
    );
    expect(screen.queryByRole('button', { name: /^retry$/i })).toBeNull();
    expect(screen.getByText(/correct the workbook/i)).toBeInTheDocument();
  });

  it('replaces Retry with period-fix guidance for reporting-period-mismatch runs', () => {
    render(
      <SafetyReviewActions
        runId="run-4"
        isDuplicate={false}
        isPending={false}
        onRetry={onRetry}
        entryErrorClass="reporting-period-mismatch"
      />,
    );
    expect(screen.queryByRole('button', { name: /^retry$/i })).toBeNull();
    expect(screen.getByText(/select or open a reporting period/i)).toBeInTheDocument();
  });

  it('replaces Retry with project-fix guidance for project-unresolved runs', () => {
    render(
      <SafetyReviewActions
        runId="run-5"
        isDuplicate={false}
        isPending={false}
        onRetry={onRetry}
        entryErrorClass="project-unresolved"
      />,
    );
    expect(screen.queryByRole('button', { name: /^retry$/i })).toBeNull();
    expect(screen.getByText(/correct the workbook project cell/i)).toBeInTheDocument();
  });

  it('flags replay-source-missing runs as not replayable', () => {
    render(
      <SafetyReviewActions
        runId="run-6"
        isDuplicate={false}
        isPending={false}
        onRetry={onRetry}
        entryErrorClass="replay-source-missing"
      />,
    );
    expect(screen.queryByRole('button', { name: /^retry$/i })).toBeNull();
    expect(screen.getByText(/retained source workbook is unavailable/i)).toBeInTheDocument();
  });

  it('routes duplicate-suspected runs through the governed supersede dialog, not plain retry', () => {
    render(
      <SafetyReviewActions
        runId="run-7"
        isDuplicate={true}
        isPending={false}
        onRetry={onRetry}
        entryErrorClass="duplicate-suspected"
      />,
    );
    expect(screen.queryByRole('button', { name: /^retry$/i })).toBeNull();
    expect(
      screen.getByRole('button', { name: /supersede & commit/i }),
    ).toBeInTheDocument();
  });
});
