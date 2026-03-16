import { describe, expect, it, vi } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { HbcTooltip } from '../index.js';

describe('HbcTooltip', () => {
  it('renders trigger content', () => {
    render(
      <HbcTooltip content="Tooltip text">
        <button>Hover me</button>
      </HbcTooltip>,
    );
    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });

  it('tooltip is not visible initially', () => {
    render(
      <HbcTooltip content="Tooltip text">
        <button>Hover me</button>
      </HbcTooltip>,
    );
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('tooltip appears on hover after delay', () => {
    vi.useFakeTimers();

    render(
      <HbcTooltip content="Tooltip text" showDelay={300}>
        <button>Hover me</button>
      </HbcTooltip>,
    );

    fireEvent.mouseEnter(screen.getByText('Hover me'));

    // Not visible before delay elapses
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('tooltip has data-hbc-ui="tooltip" when visible', () => {
    vi.useFakeTimers();

    render(
      <HbcTooltip content="Tooltip text" showDelay={0}>
        <button>Hover me</button>
      </HbcTooltip>,
    );

    fireEvent.mouseEnter(screen.getByText('Hover me'));

    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(screen.getByRole('tooltip')).toHaveAttribute('data-hbc-ui', 'tooltip');

    vi.useRealTimers();
  });

  it('tooltip has role="tooltip"', () => {
    vi.useFakeTimers();

    render(
      <HbcTooltip content="Tooltip text" showDelay={0}>
        <button>Hover me</button>
      </HbcTooltip>,
    );

    fireEvent.mouseEnter(screen.getByText('Hover me'));

    act(() => {
      vi.advanceTimersByTime(0);
    });

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('renders content text in tooltip', () => {
    vi.useFakeTimers();

    render(
      <HbcTooltip content="Help information" showDelay={0}>
        <button>Hover me</button>
      </HbcTooltip>,
    );

    fireEvent.mouseEnter(screen.getByText('Hover me'));

    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(screen.getByText('Help information')).toBeInTheDocument();

    vi.useRealTimers();
  });
});
