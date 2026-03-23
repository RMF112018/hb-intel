import { describe, expect, it } from 'vitest';
import {
  getTileVisibility,
  getVisibleTileKeys,
  getSpineVisibility,
} from './tileVisibility.js';
import type { CanvasTileKey } from './tileVisibility.js';

const ALL_TILES: CanvasTileKey[] = ['identity-header', 'health', 'work-queue', 'related-items', 'activity'];

describe('getTileVisibility', () => {
  describe('member roles (admin, PE, PM, supt, team)', () => {
    const memberRoles = ['project-administrator', 'project-executive', 'project-manager', 'superintendent', 'project-team-member'] as const;

    for (const role of memberRoles) {
      it(`${role} gets all tiles visible`, () => {
        for (const tile of ALL_TILES) {
          expect(getTileVisibility(role, tile)).toBe('visible');
        }
      });
    }
  });

  describe('portfolio-executive-reviewer', () => {
    it('sees identity-header', () => {
      expect(getTileVisibility('portfolio-executive-reviewer', 'identity-header')).toBe('visible');
    });

    it('gets read-only health', () => {
      expect(getTileVisibility('portfolio-executive-reviewer', 'health')).toBe('read-only');
    });

    it('gets hidden work-queue', () => {
      expect(getTileVisibility('portfolio-executive-reviewer', 'work-queue')).toBe('hidden');
    });

    it('gets read-only related-items', () => {
      expect(getTileVisibility('portfolio-executive-reviewer', 'related-items')).toBe('read-only');
    });

    it('gets read-only activity', () => {
      expect(getTileVisibility('portfolio-executive-reviewer', 'activity')).toBe('read-only');
    });
  });

  describe('project-viewer', () => {
    it('sees identity-header', () => {
      expect(getTileVisibility('project-viewer', 'identity-header')).toBe('visible');
    });

    it('gets hidden work-queue', () => {
      expect(getTileVisibility('project-viewer', 'work-queue')).toBe('hidden');
    });

    it('gets read-only health', () => {
      expect(getTileVisibility('project-viewer', 'health')).toBe('read-only');
    });

    it('gets read-only activity', () => {
      expect(getTileVisibility('project-viewer', 'activity')).toBe('read-only');
    });
  });

  describe('external-contributor', () => {
    it('sees identity-header', () => {
      expect(getTileVisibility('external-contributor', 'identity-header')).toBe('visible');
    });

    it('gets hidden health', () => {
      expect(getTileVisibility('external-contributor', 'health')).toBe('hidden');
    });

    it('gets hidden work-queue', () => {
      expect(getTileVisibility('external-contributor', 'work-queue')).toBe('hidden');
    });

    it('gets hidden related-items', () => {
      expect(getTileVisibility('external-contributor', 'related-items')).toBe('hidden');
    });

    it('gets hidden activity', () => {
      expect(getTileVisibility('external-contributor', 'activity')).toBe('hidden');
    });
  });
});

describe('getVisibleTileKeys', () => {
  it('returns all tiles for project-manager', () => {
    expect(getVisibleTileKeys('project-manager')).toEqual(ALL_TILES);
  });

  it('excludes work-queue for PER', () => {
    const visible = getVisibleTileKeys('portfolio-executive-reviewer');
    expect(visible).toContain('identity-header');
    expect(visible).toContain('health');
    expect(visible).not.toContain('work-queue');
    expect(visible).toContain('related-items');
    expect(visible).toContain('activity');
  });

  it('excludes work-queue for viewer', () => {
    const visible = getVisibleTileKeys('project-viewer');
    expect(visible).not.toContain('work-queue');
  });

  it('returns only identity-header for external', () => {
    const visible = getVisibleTileKeys('external-contributor');
    expect(visible).toEqual(['identity-header']);
  });
});

describe('getSpineVisibility', () => {
  it('delegates health spine to module visibility', () => {
    expect(getSpineVisibility('project-manager', 'health')).toBe('full');
    expect(getSpineVisibility('portfolio-executive-reviewer', 'health')).toBe('review-layer');
    expect(getSpineVisibility('project-viewer', 'health')).toBe('read-only');
  });

  it('delegates work-queue spine to module visibility', () => {
    expect(getSpineVisibility('project-manager', 'work-queue')).toBe('full');
    expect(getSpineVisibility('portfolio-executive-reviewer', 'work-queue')).toBe('read-only');
    expect(getSpineVisibility('project-viewer', 'work-queue')).toBe('hidden');
  });

  it('delegates activity spine to module visibility', () => {
    expect(getSpineVisibility('project-manager', 'activity')).toBe('full');
    expect(getSpineVisibility('portfolio-executive-reviewer', 'activity')).toBe('read-only');
  });

  it('delegates related-items spine to module visibility', () => {
    expect(getSpineVisibility('project-manager', 'related-items')).toBe('full');
    expect(getSpineVisibility('external-contributor', 'related-items')).toBe('hidden');
  });
});
