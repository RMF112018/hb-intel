import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HbcComplexityGate } from '../components/HbcComplexityGate';
import { createComplexityWrapper, allTiers } from '../../testing';
import { ComplexityContext } from '../context/ComplexityContext';
import { mockComplexityContext } from '../../testing/mockComplexityContext';
import React from 'react';

describe('HbcComplexityGate — unmount default (D-04)', () => {
  it('renders children when gate is open', () => {
    render(
      <HbcComplexityGate minTier="standard">
        <span>Expert content</span>
      </HbcComplexityGate>,
      { wrapper: createComplexityWrapper('standard') }
    );
    expect(screen.getByText('Expert content')).toBeInTheDocument();
  });

  it('unmounts children when gate is closed', () => {
    render(
      <HbcComplexityGate minTier="expert">
        <span>Expert content</span>
      </HbcComplexityGate>,
      { wrapper: createComplexityWrapper('standard') }
    );
    expect(screen.queryByText('Expert content')).not.toBeInTheDocument();
  });

  it('renders fallback when gate is closed', () => {
    render(
      <HbcComplexityGate minTier="expert" fallback={<span>Fallback</span>}>
        <span>Expert content</span>
      </HbcComplexityGate>,
      { wrapper: createComplexityWrapper('standard') }
    );
    expect(screen.getByText('Fallback')).toBeInTheDocument();
    expect(screen.queryByText('Expert content')).not.toBeInTheDocument();
  });

  it('keeps children in DOM when keepMounted=true (D-04)', () => {
    render(
      <HbcComplexityGate minTier="expert" keepMounted>
        <span>Expert content</span>
      </HbcComplexityGate>,
      { wrapper: createComplexityWrapper('standard') }
    );
    // In DOM but hidden
    const el = screen.getByText('Expert content');
    expect(el).toBeInTheDocument();
    expect(el.closest('[aria-hidden="true"]')).toBeInTheDocument();
  });
});

describe('HbcComplexityGate — maxTier', () => {
  it('renders coaching prompt at essential and standard', () => {
    for (const tier of ['essential', 'standard'] as const) {
      const { unmount } = render(
        <HbcComplexityGate maxTier="standard">
          <span>Coaching</span>
        </HbcComplexityGate>,
        { wrapper: createComplexityWrapper(tier) }
      );
      expect(screen.getByText('Coaching')).toBeInTheDocument();
      unmount();
    }
  });

  it('hides coaching prompt at expert', () => {
    render(
      <HbcComplexityGate maxTier="standard">
        <span>Coaching</span>
      </HbcComplexityGate>,
      { wrapper: createComplexityWrapper('expert') }
    );
    expect(screen.queryByText('Coaching')).not.toBeInTheDocument();
  });
});

describe('HbcComplexityGate — fade-in animation (D-09)', () => {
  it('applies entering class when gate opens', () => {
    vi.useFakeTimers();

    // Start with gate closed (essential), then re-render with gate open (expert)
    function TestComponent({ tier }: { tier: 'essential' | 'standard' | 'expert' }) {
      const ctx = mockComplexityContext({ tier });
      return (
        <ComplexityContext.Provider value={ctx}>
          <HbcComplexityGate minTier="standard">
            <span>Content</span>
          </HbcComplexityGate>
        </ComplexityContext.Provider>
      );
    }

    const { rerender } = render(<TestComponent tier="essential" />);
    expect(screen.queryByText('Content')).not.toBeInTheDocument();

    // Open the gate
    rerender(<TestComponent tier="standard" />);
    expect(screen.getByText('Content')).toBeInTheDocument();

    // The entering class should be present
    const wrapper = screen.getByText('Content').parentElement;
    expect(wrapper?.className).toContain('hbc-complexity-gate__content--entering');

    // After 150ms the class is removed
    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(wrapper?.className).not.toContain('hbc-complexity-gate__content--entering');

    vi.useRealTimers();
  });

  it('renders fallback alongside keepMounted hidden content', () => {
    render(
      <HbcComplexityGate minTier="expert" keepMounted fallback={<span>Upgrade needed</span>}>
        <span>Expert content</span>
      </HbcComplexityGate>,
      { wrapper: createComplexityWrapper('standard') }
    );
    expect(screen.getByText('Upgrade needed')).toBeInTheDocument();
    expect(screen.getByText('Expert content')).toBeInTheDocument();
  });

  it('applies entering class on keepMounted gate opening', () => {
    vi.useFakeTimers();

    function TestComponent({ tier }: { tier: 'essential' | 'standard' | 'expert' }) {
      const ctx = mockComplexityContext({ tier });
      return (
        <ComplexityContext.Provider value={ctx}>
          <HbcComplexityGate minTier="standard" keepMounted>
            <span>Content</span>
          </HbcComplexityGate>
        </ComplexityContext.Provider>
      );
    }

    const { rerender } = render(<TestComponent tier="essential" />);
    // Content is in DOM but hidden
    expect(screen.getByText('Content').closest('[aria-hidden="true"]')).toBeInTheDocument();

    // Open the gate
    rerender(<TestComponent tier="standard" />);
    const wrapper = screen.getByText('Content').parentElement;
    expect(wrapper?.className).toContain('hbc-complexity-gate__content--entering');

    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(wrapper?.className).not.toContain('hbc-complexity-gate__content--entering');

    vi.useRealTimers();
  });
});
