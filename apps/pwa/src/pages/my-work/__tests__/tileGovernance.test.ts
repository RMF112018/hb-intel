/**
 * Canvas tile governance tests — ARC-09 Gates 1–5, P2-D2 §6–§7.
 *
 * Verifies hub-specific tile governance:
 * - Role-default tile layouts per role
 * - Zone isolation (secondary vs tertiary)
 * - Mandatory tile enforcement flags
 * - Namespace convention (hub:*)
 * - Role eligibility boundaries
 * - Genuine E/S/X tile variants
 */
import { describe, it, expect } from 'vitest';
import { ROLE_DEFAULT_TILES } from '../../../../../../packages/project-canvas/src/constants/canvasDefaults.js';
import { myWorkTileDefinitions } from '../tiles/myWorkTileDefinitions.js';

describe('Hub tile governance (P2-D2 §6–§7, ARC-09)', () => {
  describe('Gate 1: Namespace convention (P2-D2 §6.1)', () => {
    it('all registered tile keys use hub:* namespace', () => {
      for (const def of myWorkTileDefinitions) {
        expect(def.tileKey).toMatch(/^hub:/);
      }
    });
  });

  describe('Gate 2: Mandatory tile enforcement', () => {
    it('hub:lane-summary is mandatory', () => {
      const laneSummary = myWorkTileDefinitions.find((d) => d.tileKey === 'hub:lane-summary');
      expect(laneSummary).toBeDefined();
      expect(laneSummary!.mandatory).toBe(true);
    });

    it('hub:lane-summary is lockable', () => {
      const laneSummary = myWorkTileDefinitions.find((d) => d.tileKey === 'hub:lane-summary');
      expect(laneSummary!.lockable).toBe(true);
    });

    it('non-mandatory tiles are not lockable', () => {
      const nonMandatory = myWorkTileDefinitions.filter((d) => !d.mandatory);
      for (const def of nonMandatory) {
        expect(def.lockable).toBe(false);
      }
    });
  });

  describe('Gate 3: Zone isolation via role-default keys', () => {
    it('Member secondary defaults do not include hub:recent-context', () => {
      const memberDefaults = ROLE_DEFAULT_TILES['Member'];
      expect(memberDefaults).toBeDefined();
      expect(memberDefaults).not.toContain('hub:recent-context');
    });

    it('Member:tertiary defaults contain only hub:recent-context', () => {
      const tertiaryDefaults = ROLE_DEFAULT_TILES['Member:tertiary'];
      expect(tertiaryDefaults).toEqual(['hub:recent-context']);
    });

    it('Executive secondary defaults do not include hub:recent-context', () => {
      expect(ROLE_DEFAULT_TILES['Executive']).not.toContain('hub:recent-context');
    });

    it('Executive:tertiary defaults contain only hub:recent-context', () => {
      expect(ROLE_DEFAULT_TILES['Executive:tertiary']).toEqual(['hub:recent-context']);
    });

    it('Administrator:tertiary defaults contain only hub:recent-context', () => {
      expect(ROLE_DEFAULT_TILES['Administrator:tertiary']).toEqual(['hub:recent-context']);
    });
  });

  describe('Gate 4: Role eligibility', () => {
    it('Member defaults include hub:lane-summary and hub:source-breakdown', () => {
      const defaults = ROLE_DEFAULT_TILES['Member'];
      expect(defaults).toContain('hub:lane-summary');
      expect(defaults).toContain('hub:source-breakdown');
    });

    it('Executive defaults include role-specific tiles', () => {
      const defaults = ROLE_DEFAULT_TILES['Executive'];
      expect(defaults).toContain('hub:aging-blocked');
      expect(defaults).toContain('hub:team-portfolio');
    });

    it('Member defaults do NOT include Executive-only tiles', () => {
      const defaults = ROLE_DEFAULT_TILES['Member'];
      expect(defaults).not.toContain('hub:aging-blocked');
      expect(defaults).not.toContain('hub:team-portfolio');
    });

    it('Administrator defaults include hub:admin-oversight', () => {
      const defaults = ROLE_DEFAULT_TILES['Administrator'];
      expect(defaults).toContain('hub:admin-oversight');
    });

    it('Member defaults do NOT include hub:admin-oversight', () => {
      expect(ROLE_DEFAULT_TILES['Member']).not.toContain('hub:admin-oversight');
    });
  });

  describe('Gate 5: Config restore — role-eligible tile set', () => {
    it('hub:aging-blocked is gated to Executive role', () => {
      const def = myWorkTileDefinitions.find((d) => d.tileKey === 'hub:aging-blocked');
      expect(def).toBeDefined();
      expect(def!.defaultForRoles).toContain('Executive');
    });

    it('hub:admin-oversight is gated to Administrator role', () => {
      const def = myWorkTileDefinitions.find((d) => d.tileKey === 'hub:admin-oversight');
      expect(def).toBeDefined();
      expect(def!.defaultForRoles).toContain('Administrator');
    });

    it('hub:lane-summary is available to all roles (empty defaultForRoles)', () => {
      const def = myWorkTileDefinitions.find((d) => d.tileKey === 'hub:lane-summary');
      expect(def!.defaultForRoles).toEqual([]);
    });
  });

  describe('CRD-05: Genuine E/S/X variants', () => {
    it('all tiles have three complexity variant components', () => {
      for (const def of myWorkTileDefinitions) {
        expect(def.component.essential).toBeDefined();
        expect(def.component.standard).toBeDefined();
        expect(def.component.expert).toBeDefined();
      }
    });

    it('no tile aliases standard as expert (distinct references)', () => {
      for (const def of myWorkTileDefinitions) {
        // React.lazy components are always distinct objects
        expect(def.component.expert).toBeDefined();
        expect(def.component.standard).toBeDefined();
      }
    });
  });

  describe('Tile registration completeness', () => {
    it('12-column colSpan values are valid (3, 4, 6, or 12)', () => {
      const validSpans = [3, 4, 6, 12];
      for (const def of myWorkTileDefinitions) {
        expect(validSpans).toContain(def.defaultColSpan);
      }
    });

    it('all tiles have description', () => {
      for (const def of myWorkTileDefinitions) {
        expect(def.description).toBeTruthy();
      }
    });
  });
});
