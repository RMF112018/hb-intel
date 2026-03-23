import { describe, expect, it } from 'vitest';
import {
  referenceTiles,
  relatedItemsDef,
  projectWorkQueueDef,
  projectActivityDef,
} from './referenceTileDefinitions.js';
import { PROJECT_ROLE_DEFAULT_TILES } from '../constants/canvasDefaults.js';

describe('Phase 3 tile definitions', () => {
  it('related-items is now mandatory', () => {
    expect(relatedItemsDef.mandatory).toBe(true);
    expect(relatedItemsDef.lockable).toBe(true);
  });

  it('related-items has Phase 3 project roles in defaultForRoles', () => {
    expect(relatedItemsDef.defaultForRoles).toContain('project-administrator');
    expect(relatedItemsDef.defaultForRoles).toContain('project-manager');
  });

  it('project-work-queue tile exists and is mandatory', () => {
    expect(projectWorkQueueDef.tileKey).toBe('project-work-queue');
    expect(projectWorkQueueDef.mandatory).toBe(true);
    expect(projectWorkQueueDef.lockable).toBe(true);
    expect(projectWorkQueueDef.defaultRowSpan).toBe(2);
  });

  it('project-activity tile exists and is mandatory', () => {
    expect(projectActivityDef.tileKey).toBe('project-activity');
    expect(projectActivityDef.mandatory).toBe(true);
    expect(projectActivityDef.lockable).toBe(false);
    expect(projectActivityDef.defaultRowSpan).toBe(2);
  });

  it('all tiles have 3 complexity variants', () => {
    for (const tile of referenceTiles) {
      expect(tile.component).toHaveProperty('essential');
      expect(tile.component).toHaveProperty('standard');
      expect(tile.component).toHaveProperty('expert');
    }
  });

  it('referenceTiles includes 14 tiles', () => {
    expect(referenceTiles).toHaveLength(14);
  });

  it('all tiles have unique tileKeys', () => {
    const keys = referenceTiles.map((t) => t.tileKey);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('PROJECT_ROLE_DEFAULT_TILES', () => {
  const roles = [
    'project-administrator',
    'project-executive',
    'project-manager',
    'superintendent',
    'project-team-member',
    'project-viewer',
    'external-contributor',
  ];

  it('covers all 7 Phase 3 project roles', () => {
    for (const role of roles) {
      expect(PROJECT_ROLE_DEFAULT_TILES).toHaveProperty(role);
    }
  });

  it('project-administrator has the most tiles', () => {
    expect(PROJECT_ROLE_DEFAULT_TILES['project-administrator'].length).toBeGreaterThan(
      PROJECT_ROLE_DEFAULT_TILES['project-viewer'].length,
    );
  });

  it('project-viewer has only health and activity (no work-queue)', () => {
    const viewerTiles = PROJECT_ROLE_DEFAULT_TILES['project-viewer'];
    expect(viewerTiles).toContain('project-health-pulse');
    expect(viewerTiles).toContain('project-activity');
    expect(viewerTiles).not.toContain('project-work-queue');
  });

  it('external-contributor has empty default set', () => {
    expect(PROJECT_ROLE_DEFAULT_TILES['external-contributor']).toEqual([]);
  });

  it('all member roles include mandatory tiles', () => {
    const mandatoryTiles = ['bic-my-items', 'project-health-pulse', 'pending-approvals'];
    for (const role of ['project-administrator', 'project-manager', 'superintendent', 'project-team-member']) {
      for (const tile of mandatoryTiles) {
        expect(PROJECT_ROLE_DEFAULT_TILES[role]).toContain(tile);
      }
    }
  });
});
