import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HbcAiLoadingState } from './HbcAiLoadingState.js';

describe('HbcAiLoadingState', () => {
  it('renders with data-testid="ai-loading-state"', () => {
    render(<HbcAiLoadingState />);
    expect(screen.getByTestId('ai-loading-state')).toBeDefined();
  });

  it('shows streaming indicator when isStreaming=true', () => {
    render(<HbcAiLoadingState isStreaming />);
    expect(screen.getByTestId('ai-loading-streaming-indicator')).toBeDefined();
    expect(screen.getByTestId('ai-loading-streaming-indicator').textContent).toBe('Streaming...');
  });

  it('shows cancel button when onCancel provided', () => {
    render(<HbcAiLoadingState onCancel={() => {}} />);
    expect(screen.getByTestId('ai-loading-cancel')).toBeDefined();
  });

  it('cancel button calls onCancel on click', () => {
    const onCancel = vi.fn();
    render(<HbcAiLoadingState onCancel={onCancel} />);
    fireEvent.click(screen.getByTestId('ai-loading-cancel'));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('no cancel button when onCancel undefined', () => {
    render(<HbcAiLoadingState />);
    expect(screen.queryByTestId('ai-loading-cancel')).toBeNull();
  });

  it('shows streamedContent when provided', () => {
    render(<HbcAiLoadingState streamedContent="Partial result..." />);
    const el = screen.getByTestId('ai-loading-streamed-content');
    expect(el.textContent).toBe('Partial result...');
  });

  it('expert: shows token usage telemetry', () => {
    render(
      <HbcAiLoadingState
        trustLevel="expert"
        tokenUsage={{ prompt: 100, completion: 50, total: 150 }}
      />,
    );
    const el = screen.getByTestId('ai-loading-token-usage');
    expect(el.textContent).toContain('150');
  });

  it('essential: hides token telemetry', () => {
    render(
      <HbcAiLoadingState
        trustLevel="essential"
        tokenUsage={{ prompt: 100, completion: 50, total: 150 }}
      />,
    );
    expect(screen.queryByTestId('ai-loading-token-usage')).toBeNull();
  });
});
