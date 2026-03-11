import { describe, it, expect } from 'vitest';
import { classifyEmptyState } from '../classification/classifyEmptyState.js';
import { createMockEmptyStateContext } from '@hbc/smart-empty-state/testing';

describe('classifyEmptyState', () => {
  describe('branch coverage — one classification per test', () => {
    it('returns loading-failed when isLoadError is true', () => {
      const ctx = createMockEmptyStateContext({ isLoadError: true });
      expect(classifyEmptyState(ctx)).toBe('loading-failed');
    });

    it('returns permission-empty when hasPermission is false', () => {
      const ctx = createMockEmptyStateContext({ hasPermission: false });
      expect(classifyEmptyState(ctx)).toBe('permission-empty');
    });

    it('returns filter-empty when hasActiveFilters is true', () => {
      const ctx = createMockEmptyStateContext({ hasActiveFilters: true });
      expect(classifyEmptyState(ctx)).toBe('filter-empty');
    });

    it('returns first-use when isFirstVisit is true', () => {
      const ctx = createMockEmptyStateContext({ isFirstVisit: true });
      expect(classifyEmptyState(ctx)).toBe('first-use');
    });

    it('returns truly-empty when no special conditions', () => {
      const ctx = createMockEmptyStateContext();
      expect(classifyEmptyState(ctx)).toBe('truly-empty');
    });
  });

  describe('D-01 precedence enforcement', () => {
    it('loading-failed takes precedence over permission-empty', () => {
      const ctx = createMockEmptyStateContext({ isLoadError: true, hasPermission: false });
      expect(classifyEmptyState(ctx)).toBe('loading-failed');
    });

    it('loading-failed takes precedence over filter-empty', () => {
      const ctx = createMockEmptyStateContext({ isLoadError: true, hasActiveFilters: true });
      expect(classifyEmptyState(ctx)).toBe('loading-failed');
    });

    it('loading-failed takes precedence over first-use', () => {
      const ctx = createMockEmptyStateContext({ isLoadError: true, isFirstVisit: true });
      expect(classifyEmptyState(ctx)).toBe('loading-failed');
    });

    it('permission-empty takes precedence over filter-empty', () => {
      const ctx = createMockEmptyStateContext({ hasPermission: false, hasActiveFilters: true });
      expect(classifyEmptyState(ctx)).toBe('permission-empty');
    });

    it('permission-empty takes precedence over first-use', () => {
      const ctx = createMockEmptyStateContext({ hasPermission: false, isFirstVisit: true });
      expect(classifyEmptyState(ctx)).toBe('permission-empty');
    });

    it('filter-empty takes precedence over first-use', () => {
      const ctx = createMockEmptyStateContext({ hasActiveFilters: true, isFirstVisit: true });
      expect(classifyEmptyState(ctx)).toBe('filter-empty');
    });

    it('all flags true returns loading-failed (highest precedence)', () => {
      const ctx = createMockEmptyStateContext({
        isLoadError: true,
        hasPermission: false,
        hasActiveFilters: true,
        isFirstVisit: true,
      });
      expect(classifyEmptyState(ctx)).toBe('loading-failed');
    });
  });
});
