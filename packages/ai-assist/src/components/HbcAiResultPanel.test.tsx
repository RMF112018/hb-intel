import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HbcAiResultPanel } from './HbcAiResultPanel.js';
import { createMockAiActionResult } from '../../testing/createMockAiActionResult.js';

describe('HbcAiResultPanel', () => {
  it('renders wrapper with data-testid="ai-result-panel"', () => {
    render(
      <HbcAiResultPanel
        actionId="test"
        result={createMockAiActionResult()}
      />,
    );
    expect(screen.getByTestId('ai-result-panel')).toBeDefined();
  });

  it('passes className to wrapper', () => {
    render(
      <HbcAiResultPanel
        actionId="test"
        result={createMockAiActionResult()}
        className="custom-class"
      />,
    );
    expect(screen.getByTestId('ai-result-panel').className).toBe('custom-class');
  });

  it('renders SmartInsertOverlay inside', () => {
    render(
      <HbcAiResultPanel
        actionId="test"
        result={createMockAiActionResult()}
      />,
    );
    expect(screen.getByTestId('ai-smart-insert-overlay')).toBeDefined();
  });

  it('displayName set to HbcAiResultPanel', () => {
    expect(HbcAiResultPanel.displayName).toBe('HbcAiResultPanel');
  });
});
