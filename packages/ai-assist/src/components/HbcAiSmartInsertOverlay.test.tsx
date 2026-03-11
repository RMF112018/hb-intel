import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HbcAiSmartInsertOverlay, type HbcAiSmartInsertOverlayProps } from './HbcAiSmartInsertOverlay.js';
import { createMockAiActionResult } from '../../testing/createMockAiActionResult.js';
import { createMockSmartInsertResult } from '../../testing/createMockSmartInsertResult.js';

const baseProps: HbcAiSmartInsertOverlayProps = {
  actionId: 'test-action',
  trustLevel: 'essential',
};

describe('HbcAiSmartInsertOverlay', () => {
  it('renders with data-testid="ai-smart-insert-overlay"', () => {
    render(
      <HbcAiSmartInsertOverlay
        {...baseProps}
        result={createMockAiActionResult()}
      />,
    );
    expect(screen.getByTestId('ai-smart-insert-overlay')).toBeDefined();
  });

  it('returns null when result is null and not loading', () => {
    const { container } = render(
      <HbcAiSmartInsertOverlay {...baseProps} result={null} />,
    );
    expect(container.innerHTML).toBe('');
  });

  it('shows loading state when isLoading=true', () => {
    render(<HbcAiSmartInsertOverlay {...baseProps} isLoading />);
    expect(screen.getByTestId('ai-smart-insert-overlay')).toBeDefined();
    expect(screen.getByTestId('ai-loading-state')).toBeDefined();
  });

  it('text output: renders content with data-testid="ai-result-text"', () => {
    const result = createMockAiActionResult({
      outputType: 'text',
      text: 'AI generated summary',
    });
    render(<HbcAiSmartInsertOverlay {...baseProps} result={result} />);
    const el = screen.getByTestId('ai-result-text');
    expect(el.textContent).toBe('AI generated summary');
  });

  it('bullet-list: renders <ul> with correct item count', () => {
    const result = createMockAiActionResult({
      outputType: 'bullet-list',
      items: ['Item A', 'Item B', 'Item C'],
    });
    render(<HbcAiSmartInsertOverlay {...baseProps} result={result} />);
    const list = screen.getByTestId('ai-result-list');
    expect(list.querySelectorAll('li')).toHaveLength(3);
  });

  it('structured-object with mappings: renders field mapping table', () => {
    const result = createMockAiActionResult({
      outputType: 'structured-object',
      data: { projectName: 'Acme' },
    });
    const smart = createMockSmartInsertResult();
    render(
      <HbcAiSmartInsertOverlay
        {...baseProps}
        result={result}
        smartInsertResult={smart}
      />,
    );
    expect(screen.getByTestId('ai-field-mapping-table')).toBeDefined();
    expect(screen.getByTestId('ai-field-mapping-projectName')).toBeDefined();
    expect(screen.getByTestId('ai-field-mapping-estimatedCost')).toBeDefined();
    expect(screen.getByTestId('ai-field-mapping-region')).toBeDefined();
  });

  it('structured-object without mappings: renders fallback key-value', () => {
    const result = createMockAiActionResult({
      outputType: 'structured-object',
      data: { foo: 'bar', baz: 42 },
    });
    render(<HbcAiSmartInsertOverlay {...baseProps} result={result} />);
    expect(screen.getByTestId('ai-result-fallback-kv')).toBeDefined();
  });

  it('per-field accept marks field as accepted', () => {
    const onFieldAccept = vi.fn();
    const result = createMockAiActionResult({
      outputType: 'structured-object',
      data: { projectName: 'Acme' },
    });
    const smart = createMockSmartInsertResult();
    render(
      <HbcAiSmartInsertOverlay
        {...baseProps}
        result={result}
        smartInsertResult={smart}
        onFieldAccept={onFieldAccept}
      />,
    );
    fireEvent.click(screen.getByTestId('ai-field-accept-projectName'));
    expect(onFieldAccept).toHaveBeenCalledWith('projectName', 'Acme Tower');
    expect(screen.getByTestId('ai-field-accepted-projectName')).toBeDefined();
  });

  it('apply all button visible when canApplyAll=true, calls onApplyAll', () => {
    const onApplyAll = vi.fn();
    const result = createMockAiActionResult({
      outputType: 'structured-object',
      data: { projectName: 'Acme' },
    });
    const smart = createMockSmartInsertResult({ canApplyAll: true });
    render(
      <HbcAiSmartInsertOverlay
        {...baseProps}
        result={result}
        smartInsertResult={smart}
        onApplyAll={onApplyAll}
      />,
    );
    fireEvent.click(screen.getByTestId('ai-overlay-apply-all'));
    expect(onApplyAll).toHaveBeenCalledOnce();
  });

  it('commit button calls onCommit', () => {
    const onCommit = vi.fn();
    const result = createMockAiActionResult({ outputType: 'text', text: 'result' });
    render(
      <HbcAiSmartInsertOverlay
        {...baseProps}
        result={result}
        onCommit={onCommit}
      />,
    );
    fireEvent.click(screen.getByTestId('ai-overlay-commit'));
    expect(onCommit).toHaveBeenCalledOnce();
  });

  it('dismiss button calls onDismiss', () => {
    const onDismiss = vi.fn();
    const result = createMockAiActionResult({ outputType: 'text', text: 'result' });
    render(
      <HbcAiSmartInsertOverlay
        {...baseProps}
        result={result}
        onDismiss={onDismiss}
      />,
    );
    fireEvent.click(screen.getByTestId('ai-overlay-dismiss'));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('embeds TrustMeter with confidenceDetails', () => {
    const result = createMockAiActionResult({ outputType: 'text', text: 'ok' });
    render(<HbcAiSmartInsertOverlay {...baseProps} result={result} />);
    expect(screen.getByTestId('ai-trust-meter')).toBeDefined();
  });

  it('unknown output type renders fallback message', () => {
    const result = createMockAiActionResult({
      outputType: 'unknown-type' as never,
    });
    render(<HbcAiSmartInsertOverlay {...baseProps} result={result} />);
    expect(screen.getByTestId('ai-result-unsupported').textContent).toBe(
      'Unsupported output format',
    );
  });

  it('cancel during loading delegates to onCancel', () => {
    const onCancel = vi.fn();
    render(<HbcAiSmartInsertOverlay {...baseProps} isLoading onCancel={onCancel} />);
    fireEvent.click(screen.getByTestId('ai-loading-cancel'));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
