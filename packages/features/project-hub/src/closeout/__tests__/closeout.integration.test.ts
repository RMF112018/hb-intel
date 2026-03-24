import { describe, expect, it } from 'vitest';

import {
  isAllowedDependency,
  getSurfaceCapability,
  isRelatedItemAutoWriteBlocked,
} from '../../index.js';

describe('P3-E10-T10 Closeout integration business rules', () => {
  describe('isAllowedDependency', () => {
    it('allows shared packages', () => {
      expect(isAllowedDependency('@hbc/related-items')).toBe(true);
      expect(isAllowedDependency('@hbc/versioned-record')).toBe(true);
      expect(isAllowedDependency('@hbc/ui-kit')).toBe(true);
    });

    it('prohibits feature-to-feature imports per §5.1', () => {
      expect(isAllowedDependency('@hbc/financial')).toBe(false);
      expect(isAllowedDependency('@hbc/permits')).toBe(false);
      expect(isAllowedDependency('@hbc/safety')).toBe(false);
      expect(isAllowedDependency('@hbc/schedule')).toBe(false);
      expect(isAllowedDependency('@hbc/reports')).toBe(false);
    });
  });

  describe('getSurfaceCapability', () => {
    it('returns PWA capability for checklist', () => {
      expect(getSurfaceCapability('Closeout Execution Checklist', 'PWA')).toBe('Full interactive surface');
    });

    it('returns SPFx read-only for Autopsy', () => {
      expect(getSurfaceCapability('Project Autopsy', 'SPFx')).toBe('Read-only summary');
    });

    it('returns null for unknown sub-surface', () => {
      expect(getSurfaceCapability('Unknown', 'PWA')).toBeNull();
    });
  });

  describe('isRelatedItemAutoWriteBlocked', () => {
    it('always returns true per §3.1', () => {
      expect(isRelatedItemAutoWriteBlocked()).toBe(true);
    });
  });
});
