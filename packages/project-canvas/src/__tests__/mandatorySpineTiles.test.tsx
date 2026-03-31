/**
 * Canvas-owned mandatory tiles — integration tests.
 *
 * Validates that the canvas-owned mandatory spine tiles remain correctly
 * registered, render real content, and enforce mandatory policy.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  projectHealthPulseDef,
  relatedItemsDef,
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
  it('canvas-owned spine tiles are registered in referenceTiles', () => {
    const tileKeys = referenceTiles.map((t) => t.tileKey);
    expect(tileKeys).toContain('project-health-pulse');
    expect(tileKeys).toContain('related-items');
    expect(tileKeys).not.toContain('project-work-queue');
    expect(tileKeys).not.toContain('project-activity');
  });

  it('Health tile is mandatory and lockable', () => {
    expect(projectHealthPulseDef.mandatory).toBe(true);
    expect(projectHealthPulseDef.lockable).toBe(true);
  });

  it('Related Items tile is mandatory and lockable', () => {
    expect(relatedItemsDef.mandatory).toBe(true);
    expect(relatedItemsDef.lockable).toBe(true);
  });

  it('canvas-owned mandatory tiles have three complexity variants', () => {
    for (const def of [projectHealthPulseDef, relatedItemsDef]) {
      expect(def.component.essential).toBeDefined();
      expect(def.component.standard).toBeDefined();
      expect(def.component.expert).toBeDefined();
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

  it('Related Items includes all operational project roles', () => {
    expect(relatedItemsDef.defaultForRoles).toContain('project-administrator');
    expect(relatedItemsDef.defaultForRoles).toContain('project-executive');
    expect(relatedItemsDef.defaultForRoles).toContain('project-manager');
    expect(relatedItemsDef.defaultForRoles).toContain('superintendent');
    expect(relatedItemsDef.defaultForRoles).toContain('project-team-member');
  });

});

// ═══════════════════════════════════════════════════════════════════
// 5. TILE GRID PLACEMENT DEFAULTS
// ═══════════════════════════════════════════════════════════════════

describe('Tile grid placement', () => {
  it('Health has 6-col span for prominence', () => {
    expect(projectHealthPulseDef.defaultColSpan).toBe(6);
  });

  it('Related Items has standard 4-col single-row', () => {
    expect(relatedItemsDef.defaultColSpan).toBe(4);
    expect(relatedItemsDef.defaultRowSpan).toBe(1);
  });
});
