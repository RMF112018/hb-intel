import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { IntelligenceExplainabilityDrawer } from './IntelligenceExplainabilityDrawer.js';

describe('IntelligenceExplainabilityDrawer', () => {
  it('renders explainability details and close action', () => {
    const onClose = vi.fn();

    render(
      <IntelligenceExplainabilityDrawer
        suggestion={{
          suggestionId: 'drawer-1',
          reason: 'metadata overlap in sector + geography',
          matchedDimensions: ['sector', 'geography'],
          reuseHistoryCount: 3,
        }}
        onClose={onClose}
      />
    );

    expect(screen.getByRole('dialog', { name: 'Strategic intelligence explainability' })).toBeInTheDocument();
    expect(screen.getByText('Why shown: metadata overlap in sector + geography')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close explainability drawer' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not render when closed', () => {
    render(
      <IntelligenceExplainabilityDrawer
        isOpen={false}
        suggestion={{
          suggestionId: 'drawer-2',
          reason: 'not visible',
          matchedDimensions: [],
          reuseHistoryCount: 0,
        }}
      />
    );

    expect(screen.queryByTestId('intelligence-explainability-drawer')).not.toBeInTheDocument();
  });
});
