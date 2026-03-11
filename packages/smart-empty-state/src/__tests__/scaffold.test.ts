import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { createElement } from 'react';
import {
  EMPTY_STATE_VISIT_KEY_PREFIX,
  EMPTY_STATE_COACHING_COLLAPSE_LABEL,
  emptyStateClassificationLabel,
  classifyEmptyState,
  noopVisitStore,
  useFirstVisit,
  useEmptyState,
  HbcSmartEmptyState,
  HbcEmptyStateIllustration,
} from '../index.js';

describe('@hbc/smart-empty-state scaffold', () => {
  it('exports EMPTY_STATE_VISIT_KEY_PREFIX', () => {
    expect(EMPTY_STATE_VISIT_KEY_PREFIX).toBe('hbc::empty-state::visited');
  });

  it('exports EMPTY_STATE_COACHING_COLLAPSE_LABEL', () => {
    expect(EMPTY_STATE_COACHING_COLLAPSE_LABEL).toBe('Need help getting started?');
  });

  it('exports emptyStateClassificationLabel with all classifications', () => {
    expect(emptyStateClassificationLabel).toBeDefined();
    expect(emptyStateClassificationLabel['first-use']).toBe('First Use');
    expect(emptyStateClassificationLabel['truly-empty']).toBe('No Data');
    expect(emptyStateClassificationLabel['filter-empty']).toBe('No Filter Matches');
    expect(emptyStateClassificationLabel['permission-empty']).toBe('No Access');
    expect(emptyStateClassificationLabel['loading-failed']).toBe('Load Failed');
  });

  it('exports classifyEmptyState', () => {
    expect(typeof classifyEmptyState).toBe('function');
    const result = classifyEmptyState({
      module: 'test',
      view: 'list',
      hasActiveFilters: false,
      hasPermission: true,
      isFirstVisit: false,
      currentUserRole: 'user',
      isLoadError: false,
    });
    expect(result).toBe('truly-empty');
  });

  it('exports noopVisitStore with hasVisited/markVisited', () => {
    expect(noopVisitStore).toBeDefined();
    expect(noopVisitStore.hasVisited('test', 'list')).toBe(false);
    expect(noopVisitStore.markVisited('test', 'list')).toBeUndefined();
  });

  it('exports useFirstVisit returning IUseFirstVisitResult', () => {
    expect(typeof useFirstVisit).toBe('function');
    const { result } = renderHook(() => useFirstVisit({ module: 'test', view: 'list' }));
    expect(result.current.isFirstVisit).toBe(true);
    expect(typeof result.current.markVisited).toBe('function');
  });

  it('exports useEmptyState returning IUseEmptyStateResult', () => {
    expect(typeof useEmptyState).toBe('function');
    const { result } = renderHook(() =>
      useEmptyState({
        config: {
          resolve: (ctx) => ({
            module: ctx.module,
            view: ctx.view,
            classification: 'truly-empty',
            heading: 'No data',
            description: 'Nothing here',
          }),
        },
        context: {
          module: 'test',
          view: 'list',
          hasActiveFilters: false,
          hasPermission: true,
          isFirstVisit: false,
          currentUserRole: 'user',
          isLoadError: false,
        },
      }),
    );
    expect(result.current.classification).toBe('truly-empty');
    expect(result.current.resolved).toBeDefined();
    expect(result.current.resolved.heading).toBeDefined();
    expect(result.current.resolved.description).toBeDefined();
  });

  it('renders HbcSmartEmptyState', () => {
    const { container } = render(
      createElement(HbcSmartEmptyState, {
        config: {
          resolve: () => ({
            module: 'test',
            view: 'list',
            classification: 'truly-empty' as const,
            heading: 'No data',
            description: 'Nothing here',
          }),
        },
        context: {
          module: 'test',
          view: 'list',
          hasActiveFilters: false,
          hasPermission: true,
          isFirstVisit: false,
          currentUserRole: 'user',
          isLoadError: false,
        },
      }),
    );
    expect(container).toBeDefined();
  });

  it('renders HbcEmptyStateIllustration', () => {
    const { container } = render(createElement(HbcEmptyStateIllustration));
    expect(container).toBeDefined();
  });
});
