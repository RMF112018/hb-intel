import { describe, expect, it } from 'vitest';
import {
  getModuleVisibility,
  getPerModuleVisibility,
  canAnnotateModule,
} from './moduleVisibility.js';
import type { ProjectModuleId } from './moduleVisibility.js';

describe('getModuleVisibility', () => {
  describe('project-administrator', () => {
    it('gets full access to all modules', () => {
      const modules: ProjectModuleId[] = [
        'home', 'financial', 'schedule', 'constraints', 'permits',
        'safety', 'reports', 'health', 'activity', 'work-queue',
        'related-items', 'quality-control', 'warranty',
      ];
      for (const m of modules) {
        expect(getModuleVisibility('project-administrator', m)).toBe('full');
      }
    });
  });

  describe('portfolio-executive-reviewer', () => {
    it('gets review-layer for Financial', () => {
      expect(getModuleVisibility('portfolio-executive-reviewer', 'financial')).toBe('review-layer');
    });

    it('gets review-layer for Schedule', () => {
      expect(getModuleVisibility('portfolio-executive-reviewer', 'schedule')).toBe('review-layer');
    });

    it('gets review-layer for Constraints', () => {
      expect(getModuleVisibility('portfolio-executive-reviewer', 'constraints')).toBe('review-layer');
    });

    it('gets review-layer for Permits', () => {
      expect(getModuleVisibility('portfolio-executive-reviewer', 'permits')).toBe('review-layer');
    });

    it('gets review-layer for Health', () => {
      expect(getModuleVisibility('portfolio-executive-reviewer', 'health')).toBe('review-layer');
    });

    it('gets review-layer for Reports', () => {
      expect(getModuleVisibility('portfolio-executive-reviewer', 'reports')).toBe('review-layer');
    });

    it('gets read-only for Safety (P3-E1 §9.3 exclusion)', () => {
      expect(getModuleVisibility('portfolio-executive-reviewer', 'safety')).toBe('read-only');
    });

    it('gets read-only for Home', () => {
      expect(getModuleVisibility('portfolio-executive-reviewer', 'home')).toBe('read-only');
    });

    it('gets read-only for Activity', () => {
      expect(getModuleVisibility('portfolio-executive-reviewer', 'activity')).toBe('read-only');
    });

    it('gets read-only for Work Queue', () => {
      expect(getModuleVisibility('portfolio-executive-reviewer', 'work-queue')).toBe('read-only');
    });

    it('gets hidden for Quality Control', () => {
      expect(getModuleVisibility('portfolio-executive-reviewer', 'quality-control')).toBe('hidden');
    });

    it('gets hidden for Warranty', () => {
      expect(getModuleVisibility('portfolio-executive-reviewer', 'warranty')).toBe('hidden');
    });
  });

  describe('project-viewer', () => {
    it('gets read-only for most modules', () => {
      expect(getModuleVisibility('project-viewer', 'financial')).toBe('read-only');
      expect(getModuleVisibility('project-viewer', 'schedule')).toBe('read-only');
    });

    it('gets hidden for work-queue', () => {
      expect(getModuleVisibility('project-viewer', 'work-queue')).toBe('hidden');
    });
  });

  describe('external-contributor', () => {
    it('gets read-only for home only', () => {
      expect(getModuleVisibility('external-contributor', 'home')).toBe('read-only');
    });

    it('gets hidden for all operational modules', () => {
      expect(getModuleVisibility('external-contributor', 'financial')).toBe('hidden');
      expect(getModuleVisibility('external-contributor', 'safety')).toBe('hidden');
    });
  });

  describe('member roles', () => {
    it('project-manager gets full access', () => {
      expect(getModuleVisibility('project-manager', 'financial')).toBe('full');
      expect(getModuleVisibility('project-manager', 'safety')).toBe('full');
    });

    it('superintendent gets full access', () => {
      expect(getModuleVisibility('superintendent', 'safety')).toBe('full');
    });
  });
});

describe('getPerModuleVisibility', () => {
  it('returns review-layer for Financial', () => {
    expect(getPerModuleVisibility('financial')).toBe('review-layer');
  });

  it('returns read-only for Safety', () => {
    expect(getPerModuleVisibility('safety')).toBe('read-only');
  });
});

describe('canAnnotateModule', () => {
  it('returns true for PER on review-layer modules', () => {
    expect(canAnnotateModule('portfolio-executive-reviewer', 'financial')).toBe(true);
    expect(canAnnotateModule('portfolio-executive-reviewer', 'schedule')).toBe(true);
  });

  it('returns false for PER on Safety (P3-E1 §9.3)', () => {
    expect(canAnnotateModule('portfolio-executive-reviewer', 'safety')).toBe(false);
  });

  it('returns false for PER on read-only modules', () => {
    expect(canAnnotateModule('portfolio-executive-reviewer', 'home')).toBe(false);
    expect(canAnnotateModule('portfolio-executive-reviewer', 'activity')).toBe(false);
  });

  it('returns true for full-access member roles', () => {
    expect(canAnnotateModule('project-manager', 'financial')).toBe(true);
    expect(canAnnotateModule('project-manager', 'safety')).toBe(true);
  });

  it('returns false for viewer roles', () => {
    expect(canAnnotateModule('project-viewer', 'financial')).toBe(false);
  });
});
