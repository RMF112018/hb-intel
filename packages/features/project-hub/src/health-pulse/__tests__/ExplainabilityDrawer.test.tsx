import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ExplainabilityDrawer } from '../components/ExplainabilityDrawer.js';

describe('ExplainabilityDrawer', () => {
  it('renders required sections and opens at requested section', () => {
    render(
      <ExplainabilityDrawer
        open
        onClose={() => {}}
        initialSection="contributors"
        confidenceTier="low"
        confidenceReasons={['stale source']}
        explainability={{
          whyThisStatus: ['Why signal'],
          whatChanged: ['Changed signal'],
          topContributors: ['Contributor signal'],
          whatMattersMost: 'Most important signal',
        }}
      />
    );

    expect(screen.getByText('Health Explainability')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confidence' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Why this status' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'What changed' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Top contributors' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'What matters most' })).toBeInTheDocument();
    expect(screen.getByLabelText('Top contributors')).toHaveAttribute('aria-current', 'true');
    expect(screen.getByText('Contributor signal')).toBeInTheDocument();
  });

  it('supports section switching, close behavior, and keyboard close', () => {
    const onClose = vi.fn();
    render(
      <ExplainabilityDrawer
        open
        onClose={onClose}
        initialSection="why"
        confidenceTier="unreliable"
        confidenceReasons={['missing integrations']}
        explainability={{
          whyThisStatus: ['Why signal'],
          whatChanged: ['Changed signal'],
          topContributors: ['Contributor signal'],
          whatMattersMost: 'Most important signal',
        }}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'What changed' }));
    expect(screen.getByLabelText('What changed')).toHaveAttribute('aria-current', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('renders fallback explainability copy when data is unavailable', () => {
    const onClose = vi.fn();
    render(
      <ExplainabilityDrawer
        open
        onClose={onClose}
        initialSection="confidence"
        confidenceTier={null}
        confidenceReasons={[]}
        explainability={null}
      />
    );

    fireEvent.keyDown(window, { key: 'Enter' });
    expect(onClose).not.toHaveBeenCalled();

    expect(screen.getByText(/Current confidence tier: Unknown./i)).toBeInTheDocument();
    expect(screen.getByText(/No confidence degradation reasons were reported./i)).toBeInTheDocument();
    expect(screen.getAllByText(/No explainability data is available yet./i).length).toBeGreaterThan(0);
    expect(screen.getByText(/No key leverage guidance available./i)).toBeInTheDocument();
  });
});
