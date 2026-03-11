/**
 * Reference Tile Definitions tests — D-SF13-T07, D-02, D-09
 *
 * Covers registration, definition structure, variant rendering,
 * role-default integrity, governance, and catalog/editor compatibility.
 */
import React, { Suspense } from 'react';
import { render, screen } from '@testing-library/react';
import { _clearRegistryForTests, get, getAll } from '../registry/index.js';
import { _resetRegistrationFlagForTests, registerReferenceTiles } from '../tiles/registerReferenceTiles.js';
import {
  referenceTiles,
  bicMyItemsDef,
  pendingApprovalsDef,
  projectHealthPulseDef,
  aiInsightDef,
  relatedItemsDef,
} from '../tiles/referenceTileDefinitions.js';
import { ROLE_DEFAULT_TILES } from '../constants/canvasDefaults.js';

beforeEach(() => {
  _clearRegistryForTests();
  _resetRegistrationFlagForTests();
});

afterEach(() => {
  _clearRegistryForTests();
  _resetRegistrationFlagForTests();
});

describe('Reference Tile Definitions (D-SF13-T07)', () => {
  describe('Registration', () => {
    it('registerReferenceTiles registers all 12 tiles', () => {
      registerReferenceTiles();
      expect(getAll()).toHaveLength(12);
    });

    it('all 12 tiles retrievable via get() after registration', () => {
      registerReferenceTiles();
      for (const tile of referenceTiles) {
        expect(get(tile.tileKey)).toBeDefined();
        expect(get(tile.tileKey)?.tileKey).toBe(tile.tileKey);
      }
    });

    it('getAll() returns 12 definitions after registration', () => {
      registerReferenceTiles();
      const all = getAll();
      expect(all).toHaveLength(12);
      const keys = all.map((t) => t.tileKey);
      expect(keys).toContain('bic-my-items');
      expect(keys).toContain('ai-insight');
    });

    it('double-call is idempotent (no throw)', () => {
      registerReferenceTiles();
      expect(() => registerReferenceTiles()).not.toThrow();
      expect(getAll()).toHaveLength(12);
    });
  });

  describe('Definition structure', () => {
    it.each(referenceTiles)('$tileKey has non-empty tileKey, title, description', (tile) => {
      expect(tile.tileKey).toBeTruthy();
      expect(tile.title).toBeTruthy();
      expect(tile.description).toBeTruthy();
    });

    it.each(referenceTiles)('$tileKey has valid defaultColSpan (3|4|6|12)', (tile) => {
      expect([3, 4, 6, 12]).toContain(tile.defaultColSpan);
    });

    it.each(referenceTiles)('$tileKey has valid defaultRowSpan (1|2)', (tile) => {
      expect([1, 2]).toContain(tile.defaultRowSpan);
    });

    it.each(referenceTiles)('$tileKey has all 3 complexity variants', (tile) => {
      expect(tile.component.essential).toBeDefined();
      expect(tile.component.standard).toBeDefined();
      expect(tile.component.expert).toBeDefined();
    });

    it.each(referenceTiles)('$tileKey has boolean lockable', (tile) => {
      expect(typeof tile.lockable).toBe('boolean');
    });
  });

  describe('Governance', () => {
    it('bic-my-items is mandatory and lockable', () => {
      expect(bicMyItemsDef.mandatory).toBe(true);
      expect(bicMyItemsDef.lockable).toBe(true);
    });

    it('pending-approvals is mandatory and lockable', () => {
      expect(pendingApprovalsDef.mandatory).toBe(true);
      expect(pendingApprovalsDef.lockable).toBe(true);
    });

    it('project-health-pulse is mandatory and lockable', () => {
      expect(projectHealthPulseDef.mandatory).toBe(true);
      expect(projectHealthPulseDef.lockable).toBe(true);
    });

    it('non-mandatory tiles have mandatory !== true', () => {
      const nonMandatory = referenceTiles.filter(
        (t) => !['bic-my-items', 'pending-approvals', 'project-health-pulse'].includes(t.tileKey),
      );
      for (const tile of nonMandatory) {
        expect(tile.mandatory).not.toBe(true);
      }
    });
  });

  describe('AIInsightTile container path', () => {
    it('ai-insight definition has aiComponent field set', () => {
      expect(aiInsightDef.aiComponent).toBeDefined();
    });

    it('ai-insight tileKey is "ai-insight"', () => {
      expect(aiInsightDef.tileKey).toBe('ai-insight');
    });
  });

  describe('ROLE_DEFAULT_TILES integrity', () => {
    it('every key in every role resolves to a registered definition', () => {
      registerReferenceTiles();
      for (const [, keys] of Object.entries(ROLE_DEFAULT_TILES)) {
        for (const key of keys) {
          expect(get(key)).toBeDefined();
        }
      }
    });

    it('no role references an unregistered tile key', () => {
      registerReferenceTiles();
      const registeredKeys = new Set(getAll().map((t) => t.tileKey));
      for (const [, keys] of Object.entries(ROLE_DEFAULT_TILES)) {
        for (const key of keys) {
          expect(registeredKeys.has(key)).toBe(true);
        }
      }
    });
  });

  describe('Variant rendering', () => {
    it('reference tile renders with correct data-testid', async () => {
      const EssentialComponent = bicMyItemsDef.component.essential;
      render(
        <Suspense fallback={<div>loading</div>}>
          <EssentialComponent projectId="proj-1" tileKey="bic-my-items" />
        </Suspense>,
      );
      const el = await screen.findByTestId('tile-bic-my-items');
      expect(el).toBeInTheDocument();
    });

    it('tier badge shows correct complexity tier', async () => {
      const StandardComponent = bicMyItemsDef.component.standard;
      render(
        <Suspense fallback={<div>loading</div>}>
          <StandardComponent projectId="proj-1" tileKey="bic-my-items" />
        </Suspense>,
      );
      const el = await screen.findByTestId('tile-bic-my-items');
      expect(el).toHaveAttribute('data-tier', 'standard');
    });

    it('locked indicator renders when isLocked=true', async () => {
      const ExpertComponent = bicMyItemsDef.component.expert;
      render(
        <Suspense fallback={<div>loading</div>}>
          <ExpertComponent projectId="proj-1" tileKey="bic-my-items" isLocked />
        </Suspense>,
      );
      const locked = await screen.findByTestId('locked-indicator');
      expect(locked).toBeInTheDocument();
    });
  });

  describe('Catalog compatibility', () => {
    it('registered tiles appear in getAll() for catalog filtering', () => {
      registerReferenceTiles();
      const all = getAll();
      expect(all.length).toBe(12);
      const keys = all.map((t) => t.tileKey);
      expect(keys).toContain('bic-my-items');
      expect(keys).toContain('related-items');
      expect(keys).toContain('ai-insight');
    });

    it('related-items (catalog-only) has empty defaultForRoles', () => {
      expect(relatedItemsDef.defaultForRoles).toEqual([]);
    });
  });
});
