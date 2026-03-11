import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useComplexity } from '@hbc/complexity';
import { HbcSmartEmptyState } from '../components/HbcSmartEmptyState.js';
import { EMPTY_STATE_COACHING_COLLAPSE_LABEL } from '../constants/emptyStateDefaults.js';
import type {
  IEmptyStateContext,
  ISmartEmptyStateConfig,
  IEmptyStateConfig,
} from '../types/ISmartEmptyState.js';

// File-level mock overrides the global setup.ts mock with vi.fn() for per-test control
vi.mock('@hbc/complexity', () => ({
  __esModule: true,
  useComplexity: vi.fn(() => ({
    tier: 'standard',
    showCoaching: false,
    lockedBy: undefined,
    lockedUntil: undefined,
    isLocked: false,
    atLeast: () => true,
    is: (t: string) => t === 'standard',
    setTier: () => {},
    setShowCoaching: () => {},
  })),
}));

// ---------- helpers ----------

function makeContext(overrides: Partial<IEmptyStateContext> = {}): IEmptyStateContext {
  return {
    module: 'projects',
    view: 'list',
    hasActiveFilters: false,
    hasPermission: true,
    isFirstVisit: false,
    currentUserRole: 'user',
    isLoadError: false,
    ...overrides,
  };
}

function makeResolved(overrides: Partial<IEmptyStateConfig> = {}): IEmptyStateConfig {
  return {
    module: 'projects',
    view: 'list',
    classification: 'truly-empty',
    heading: 'No projects yet',
    description: 'Create your first project to get started.',
    ...overrides,
  };
}

function makeConfig(resolvedOverrides: Partial<IEmptyStateConfig> = {}): ISmartEmptyStateConfig {
  return { resolve: () => makeResolved(resolvedOverrides) };
}

function setTier(tier: 'essential' | 'standard' | 'expert'): void {
  vi.mocked(useComplexity).mockReturnValue({
    tier,
    showCoaching: false,
    lockedBy: undefined,
    lockedUntil: undefined,
    isLocked: false,
    atLeast: () => true,
    is: (t: string) => t === tier,
    setTier: () => {},
    setShowCoaching: () => {},
  });
}

// ---------- tests ----------

describe('HbcSmartEmptyState', () => {
  it('renders heading from resolved config', () => {
    render(<HbcSmartEmptyState config={makeConfig()} context={makeContext()} />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('No projects yet');
  });

  it('renders description from resolved config', () => {
    render(<HbcSmartEmptyState config={makeConfig()} context={makeContext()} />);
    expect(screen.getByText('Create your first project to get started.')).toBeInTheDocument();
  });

  it('renders primaryAction as button and fires onActionFired', async () => {
    const user = userEvent.setup();
    const onActionFired = vi.fn();
    render(
      <HbcSmartEmptyState
        config={makeConfig({
          primaryAction: { label: 'Create Project' },
        })}
        context={makeContext()}
        onActionFired={onActionFired}
      />,
    );
    const btn = screen.getByRole('button', { name: 'Create Project' });
    await user.click(btn);
    expect(onActionFired).toHaveBeenCalledWith('Create Project', 'truly-empty');
  });

  it('renders secondaryAction and fires onActionFired', async () => {
    const user = userEvent.setup();
    const onActionFired = vi.fn();
    render(
      <HbcSmartEmptyState
        config={makeConfig({
          secondaryAction: { label: 'Learn More' },
        })}
        context={makeContext()}
        onActionFired={onActionFired}
      />,
    );
    const btn = screen.getByRole('button', { name: 'Learn More' });
    await user.click(btn);
    expect(onActionFired).toHaveBeenCalledWith('Learn More', 'truly-empty');
  });

  it('primaryAction onClick is also called alongside onActionFired', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onActionFired = vi.fn();
    render(
      <HbcSmartEmptyState
        config={makeConfig({
          primaryAction: { label: 'Go', onClick },
        })}
        context={makeContext()}
        onActionFired={onActionFired}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Go' }));
    expect(onClick).toHaveBeenCalledOnce();
    expect(onActionFired).toHaveBeenCalledOnce();
  });

  it('renders filterClearAction for filter-empty classification', () => {
    render(
      <HbcSmartEmptyState
        config={makeConfig({
          classification: 'filter-empty',
          filterClearAction: { label: 'Clear Filters' },
        })}
        context={makeContext({ hasActiveFilters: true })}
      />,
    );
    expect(screen.getByRole('button', { name: 'Clear Filters' })).toBeInTheDocument();
  });

  it('does NOT render filterClearAction for non-filter-empty classification', () => {
    render(
      <HbcSmartEmptyState
        config={makeConfig({
          classification: 'truly-empty',
          filterClearAction: { label: 'Clear Filters' },
        })}
        context={makeContext()}
      />,
    );
    expect(screen.queryByRole('button', { name: 'Clear Filters' })).not.toBeInTheDocument();
  });

  it('essential tier: coaching tip rendered inline', () => {
    setTier('essential');
    const { container } = render(
      <HbcSmartEmptyState
        config={makeConfig({ coachingTip: 'Try creating a project first.' })}
        context={makeContext()}
      />,
    );
    expect(screen.getByText('Try creating a project first.')).toBeInTheDocument();
    expect(container.querySelector('details')).toBeNull();
  });

  it('standard tier: coaching tip in disclosure', () => {
    setTier('standard');
    const { container } = render(
      <HbcSmartEmptyState
        config={makeConfig({ coachingTip: 'Helpful tip here.' })}
        context={makeContext()}
      />,
    );
    const details = container.querySelector('details');
    expect(details).not.toBeNull();
    const summary = container.querySelector('summary');
    expect(summary).toHaveTextContent(EMPTY_STATE_COACHING_COLLAPSE_LABEL);
    expect(screen.getByText('Helpful tip here.')).toBeInTheDocument();
  });

  it('expert tier: coaching tip hidden', () => {
    setTier('expert');
    render(
      <HbcSmartEmptyState
        config={makeConfig({ coachingTip: 'Hidden tip.' })}
        context={makeContext()}
      />,
    );
    expect(screen.queryByText('Hidden tip.')).not.toBeInTheDocument();
  });

  it('no coaching section when coachingTip is falsy', () => {
    setTier('essential');
    const { container } = render(
      <HbcSmartEmptyState config={makeConfig()} context={makeContext()} />,
    );
    expect(container.querySelector('.hbc-empty-state__coaching')).toBeNull();
    expect(container.querySelector('details')).toBeNull();
  });

  it('full-page variant is the default', () => {
    const { container } = render(
      <HbcSmartEmptyState config={makeConfig()} context={makeContext()} />,
    );
    expect(container.querySelector('[data-variant="full-page"]')).not.toBeNull();
  });

  it('inline variant applied when specified', () => {
    const { container } = render(
      <HbcSmartEmptyState config={makeConfig()} context={makeContext()} variant="inline" />,
    );
    expect(container.querySelector('[data-variant="inline"]')).not.toBeNull();
  });

  it('aria-labelledby matches heading id', () => {
    render(<HbcSmartEmptyState config={makeConfig()} context={makeContext()} />);
    const region = screen.getByRole('region');
    const heading = screen.getByRole('heading', { level: 2 });
    expect(region.getAttribute('aria-labelledby')).toBe(heading.id);
  });

  it('aria-describedby matches description id', () => {
    render(<HbcSmartEmptyState config={makeConfig()} context={makeContext()} />);
    const region = screen.getByRole('region');
    const desc = screen.getByText('Create your first project to get started.');
    expect(region.getAttribute('aria-describedby')).toBe(desc.id);
  });

  it('decorative illustration has aria-hidden', () => {
    const { container } = render(
      <HbcSmartEmptyState config={makeConfig()} context={makeContext()} />,
    );
    const illustration = container.querySelector('.hbc-empty-state__illustration');
    expect(illustration).not.toBeNull();
    expect(illustration!.getAttribute('aria-hidden')).toBe('true');
  });

  it('action with href renders as anchor and fires onActionFired on click', async () => {
    const user = userEvent.setup();
    const onActionFired = vi.fn();
    render(
      <HbcSmartEmptyState
        config={makeConfig({
          secondaryAction: { label: 'Docs', href: 'https://docs.example.com' },
        })}
        context={makeContext()}
        onActionFired={onActionFired}
      />,
    );
    const link = screen.getByRole('link', { name: 'Docs' });
    expect(link).toHaveAttribute('href', 'https://docs.example.com');
    await user.click(link);
    expect(onActionFired).toHaveBeenCalledWith('Docs', 'truly-empty');
  });
});
