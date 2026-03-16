import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HbcScoreBar } from '../index.js';

describe('HbcScoreBar', () => {
  it('renders with data-hbc-ui="score-bar"', () => {
    const { container } = render(<HbcScoreBar score={50} />);
    expect(container.querySelector('[data-hbc-ui="score-bar"]')).toBeInTheDocument();
  });

  it('has role="meter" with aria-valuenow, aria-valuemin, aria-valuemax', () => {
    render(<HbcScoreBar score={75} />);
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '75');
    expect(meter).toHaveAttribute('aria-valuemin', '0');
    expect(meter).toHaveAttribute('aria-valuemax', '100');
  });

  it('clamps score to 0–100 range', () => {
    const { rerender } = render(<HbcScoreBar score={150} />);
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '100');

    rerender(<HbcScoreBar score={-20} />);
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '0');
  });

  it('shows label when showLabel=true', () => {
    render(<HbcScoreBar score={42} showLabel />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('hides label when showLabel=false (default)', () => {
    render(<HbcScoreBar score={42} />);
    expect(screen.queryByText('42')).not.toBeInTheDocument();
  });
});
