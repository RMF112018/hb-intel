import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { createElement } from 'react';
import {
  EMPTY_STATE_DEFAULTS,
  classifyEmptyState,
  noopVisitStore,
  useFirstVisit,
  useEmptyState,
  HbcSmartEmptyState,
  HbcEmptyStateIllustration,
} from '../index.js';

describe('@hbc/smart-empty-state scaffold', () => {
  it('exports EMPTY_STATE_DEFAULTS', () => {
    expect(EMPTY_STATE_DEFAULTS).toBeDefined();
    expect(EMPTY_STATE_DEFAULTS.moduleId).toBe('unknown');
    expect(EMPTY_STATE_DEFAULTS.enableFirstVisit).toBe(true);
  });

  it('exports classifyEmptyState', () => {
    expect(typeof classifyEmptyState).toBe('function');
    expect(classifyEmptyState({ moduleId: 'test' })).toBe('truly-empty');
  });

  it('exports noopVisitStore', () => {
    expect(noopVisitStore).toBeDefined();
    expect(noopVisitStore.isFirstVisit('test')).toBe(true);
    expect(noopVisitStore.recordVisit('test')).toBeUndefined();
  });

  it('exports useFirstVisit', () => {
    expect(typeof useFirstVisit).toBe('function');
    expect(useFirstVisit('test')).toBe(true);
  });

  it('exports useEmptyState', () => {
    expect(typeof useEmptyState).toBe('function');
    const result = useEmptyState('test');
    expect(result.classification).toBe('truly-empty');
  });

  it('renders HbcSmartEmptyState', () => {
    const { container } = render(createElement(HbcSmartEmptyState));
    expect(container).toBeDefined();
  });

  it('renders HbcEmptyStateIllustration', () => {
    const { container } = render(createElement(HbcEmptyStateIllustration));
    expect(container).toBeDefined();
  });
});
