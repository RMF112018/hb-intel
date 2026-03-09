import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HbcStepProgress } from '../HbcStepProgress';
import { createMockWizardConfig } from '@hbc/step-wizard/testing';

// Mock useStepProgress to return controlled state
vi.mock('../../hooks/useStepProgress', () => ({
  useStepProgress: vi.fn(),
}));

import { useStepProgress } from '../../hooks/useStepProgress';

describe('HbcStepProgress', () => {
  const config = createMockWizardConfig();

  it('renders fraction variant with correct count', () => {
    vi.mocked(useStepProgress).mockReturnValue({
      completedCount: 2,
      requiredCount: 5,
      percentComplete: 40,
      isComplete: false,
      isStale: false,
    });
    render(<HbcStepProgress item={{}} config={config} variant="fraction" />);
    expect(screen.getByText(/2 of 5/)).toBeInTheDocument();
  });

  it('renders complete state in fraction variant', () => {
    vi.mocked(useStepProgress).mockReturnValue({
      completedCount: 3,
      requiredCount: 3,
      percentComplete: 100,
      isComplete: true,
      isStale: false,
    });
    render(<HbcStepProgress item={{}} config={config} variant="fraction" />);
    expect(screen.getByText('Complete')).toBeInTheDocument();
  });

  it('renders bar variant with correct aria attributes', () => {
    vi.mocked(useStepProgress).mockReturnValue({
      completedCount: 1,
      requiredCount: 3,
      percentComplete: 33,
      isComplete: false,
      isStale: false,
    });
    render(<HbcStepProgress item={{}} config={config} variant="bar" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '33');
  });

  it('shows stale indicator when isStale=true (D-09)', () => {
    vi.mocked(useStepProgress).mockReturnValue({
      completedCount: 0,
      requiredCount: 3,
      percentComplete: 0,
      isComplete: false,
      isStale: true,
    });
    render(<HbcStepProgress item={{}} config={config} />);
    expect(screen.getByTitle('Progress data may be out of date')).toBeInTheDocument();
  });
});
