/**
 * Mandatory Spine Tiles — integration tests.
 *
 * Validates that all four mandatory spine tiles (Health, Work Queue,
 * Related Items, Activity) are correctly registered, render real content
 * (not placeholder "Loading..." text), and enforce mandatory policy.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  projectHealthPulseDef,
  projectWorkQueueDef,
  relatedItemsDef,
  projectActivityDef,
  referenceTiles,
} from '../tiles/referenceTileDefinitions.js';
import {
  HealthPulseTileEssential,
  HealthPulseTileStandard,
  HealthPulseTileExpert,
} from '../tiles/HealthPulseTileAdapter.js';
import {
  RelatedItemsTileEssential,
  RelatedItemsTileStandard,
  RelatedItemsTileExpert,
} from '../tiles/RelatedItemsTileAdapter.js';

const TILE_PROPS = {
  projectId: 'test-proj-001',
  tileKey: 'test-tile',
};

// ═══════════════════════════════════════════════════════════════════
// 1. MANDATORY TILE REGISTRATION
// ═══════════════════════════════════════════════════════════════════

describe('Mandatory tile registration', () => {
  it('all four spine tiles are registered in referenceTiles', () => {
    const tileKeys = referenceTiles.map((t) => t.tileKey);
    expect(tileKeys).toContain('project-health-pulse');
    expect(tileKeys).toContain('project-work-queue');
    expect(tileKeys).toContain('related-items');
    expect(tileKeys).toContain('project-activity');
  });

  it('Health tile is mandatory and lockable', () => {
    expect(projectHealthPulseDef.mandatory).toBe(true);
    expect(projectHealthPulseDef.lockable).toBe(true);
  });

  it('Work Queue tile is mandatory and lockable', () => {
    expect(projectWorkQueueDef.mandatory).toBe(true);
    expect(projectWorkQueueDef.lockable).toBe(true);
  });

  it('Related Items tile is mandatory and lockable', () => {
    expect(relatedItemsDef.mandatory).toBe(true);
    expect(relatedItemsDef.lockable).toBe(true);
  });

  it('Activity tile is mandatory', () => {
    expect(projectActivityDef.mandatory).toBe(true);
  });

  it('all four tiles have three complexity variants (not placeholder factory)', () => {
    for (const def of [projectHealthPulseDef, projectWorkQueueDef, relatedItemsDef, projectActivityDef]) {
      expect(def.component.essential).toBeDefined();
      expect(def.component.standard).toBeDefined();
      expect(def.component.expert).toBeDefined();
      // Verify they're lazy components (have $$typeof or _payload), not placeholder factories
      expect(typeof def.component.essential).toBe('object');
    }
  });
});

// ═══════════════════════════════════════════════════════════════════
// 2. HEALTH PULSE TILE RENDERING
// ═══════════════════════════════════════════════════════════════════

describe('Health Pulse tile rendering', () => {
  it('essential tier renders overall status and score', () => {
    render(<HealthPulseTileEssential {...TILE_PROPS} />);
    expect(screen.getByText('Health Pulse')).toBeTruthy();
    expect(screen.getByText('watch')).toBeTruthy();
    expect(screen.getByText('72')).toBeTruthy();
  });

  it('standard tier renders dimensions', () => {
    render(<HealthPulseTileStandard {...TILE_PROPS} />);
    expect(screen.getByText('Schedule')).toBeTruthy();
    expect(screen.getByText('Cost')).toBeTruthy();
    expect(screen.getByText('Quality / Safety')).toBeTruthy();
    expect(screen.getByText('Scope')).toBeTruthy();
  });

  it('expert tier includes detail link', () => {
    render(<HealthPulseTileExpert {...TILE_PROPS} />);
    expect(screen.getByText(/view detail/i)).toBeTruthy();
  });

  it('shows freshness indicator', () => {
    render(<HealthPulseTileEssential {...TILE_PROPS} />);
    expect(screen.getByText(/updated/i)).toBeTruthy();
  });

  it('shows locked indicator when isLocked=true', () => {
    render(<HealthPulseTileEssential {...TILE_PROPS} isLocked />);
    expect(screen.getByTestId('locked-indicator')).toBeTruthy();
  });
});

// ═══════════════════════════════════════════════════════════════════
// 3. RELATED ITEMS TILE RENDERING
// ═══════════════════════════════════════════════════════════════════

describe('Related Items tile rendering', () => {
  it('essential tier renders item count and top item', () => {
    render(<RelatedItemsTileEssential {...TILE_PROPS} />);
    expect(screen.getByText('Related Items')).toBeTruthy();
    expect(screen.getByText('5')).toBeTruthy();
    expect(screen.getByText(/blocks/)).toBeTruthy();
  });

  it('standard tier renders 3-item preview', () => {
    render(<RelatedItemsTileStandard {...TILE_PROPS} />);
    expect(screen.getByText(/blocks/)).toBeTruthy();
    expect(screen.getByText(/depends-on/)).toBeTruthy();
    expect(screen.getByText(/informs/)).toBeTruthy();
    expect(screen.getByText(/\+2 more/)).toBeTruthy();
  });

  it('expert tier renders all items', () => {
    render(<RelatedItemsTileExpert {...TILE_PROPS} />);
    expect(screen.getByText(/blocks/)).toBeTruthy();
    expect(screen.getByText(/triggered-by/)).toBeTruthy();
    expect(screen.getByText(/impacts/)).toBeTruthy();
  });

  it('shows locked indicator when locked', () => {
    render(<RelatedItemsTileEssential {...TILE_PROPS} isLocked />);
    expect(screen.getByTestId('locked-indicator')).toBeTruthy();
  });
});

// ═══════════════════════════════════════════════════════════════════
// 4. TILE ROLE DEFAULTS
// ═══════════════════════════════════════════════════════════════════

describe('Tile role defaults', () => {
  it('Health is default for Superintendent, PM, VP', () => {
    expect(projectHealthPulseDef.defaultForRoles).toContain('Superintendent');
    expect(projectHealthPulseDef.defaultForRoles).toContain('Project Manager');
    expect(projectHealthPulseDef.defaultForRoles).toContain('VP of Operations');
  });

  it('Work Queue is default for project-admin, PM, superintendent, team-member', () => {
    expect(projectWorkQueueDef.defaultForRoles).toContain('project-administrator');
    expect(projectWorkQueueDef.defaultForRoles).toContain('project-manager');
    expect(projectWorkQueueDef.defaultForRoles).toContain('superintendent');
    expect(projectWorkQueueDef.defaultForRoles).toContain('project-team-member');
  });

  it('Related Items includes all operational project roles', () => {
    expect(relatedItemsDef.defaultForRoles).toContain('project-administrator');
    expect(relatedItemsDef.defaultForRoles).toContain('project-executive');
    expect(relatedItemsDef.defaultForRoles).toContain('project-manager');
    expect(relatedItemsDef.defaultForRoles).toContain('superintendent');
    expect(relatedItemsDef.defaultForRoles).toContain('project-team-member');
  });

  it('Activity is default for all project roles except external-contributor', () => {
    expect(projectActivityDef.defaultForRoles).toContain('project-administrator');
    expect(projectActivityDef.defaultForRoles).toContain('project-viewer');
    expect(projectActivityDef.defaultForRoles).not.toContain('external-contributor');
  });
});

// ═══════════════════════════════════════════════════════════════════
// 5. TILE GRID PLACEMENT DEFAULTS
// ═══════════════════════════════════════════════════════════════════

describe('Tile grid placement', () => {
  it('Health has 6-col span for prominence', () => {
    expect(projectHealthPulseDef.defaultColSpan).toBe(6);
  });

  it('Work Queue has 2-row span for action depth', () => {
    expect(projectWorkQueueDef.defaultRowSpan).toBe(2);
  });

  it('Activity has 2-row span for timeline depth', () => {
    expect(projectActivityDef.defaultRowSpan).toBe(2);
  });

  it('Related Items has standard 4-col single-row', () => {
    expect(relatedItemsDef.defaultColSpan).toBe(4);
    expect(relatedItemsDef.defaultRowSpan).toBe(1);
  });
});
