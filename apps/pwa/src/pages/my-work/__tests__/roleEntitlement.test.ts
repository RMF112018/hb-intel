/**
 * Role entitlement and team mode tests — P2-D1, ROL-01, ROL-02, TM-01, ADR-0117.
 *
 * Verifies:
 * - No local role constants in tile definitions (ROL-01 regression)
 * - Single auth resolution source in MyWorkPage (ROL-02)
 * - Executive default team mode per ADR-0117
 * - Tile role gating correctness
 * - Team mode tab visibility rules
 */
import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { myWorkTileDefinitions } from '../tiles/myWorkTileDefinitions.js';

describe('Role entitlement and team mode (P2-D1, ADR-0117)', () => {
  describe('ROL-01: No local role constants in tile definitions', () => {
    it('myWorkTileDefinitions.ts does not declare EXECUTIVE_ROLES constant', () => {
      const filePath = path.resolve(__dirname, '../tiles/myWorkTileDefinitions.ts');
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).not.toMatch(/const\s+EXECUTIVE_ROLES/);
    });

    it('myWorkTileDefinitions.ts does not declare ADMIN_ROLES constant', () => {
      const filePath = path.resolve(__dirname, '../tiles/myWorkTileDefinitions.ts');
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).not.toMatch(/const\s+ADMIN_ROLES/);
    });

    it('role strings are inlined per P2-D1 §11.1', () => {
      const filePath = path.resolve(__dirname, '../tiles/myWorkTileDefinitions.ts');
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain("'Executive'");
      expect(content).toContain("'Administrator'");
    });
  });

  describe('ROL-02: Single auth resolution in MyWorkPage', () => {
    it('MyWorkPage imports useCurrentSession (not useAuthStore)', () => {
      const filePath = path.resolve(__dirname, '../MyWorkPage.tsx');
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain('useCurrentSession');
      expect(content).not.toContain('useAuthStore');
    });

    it('HubTeamModeSelector does not import useAuthStore', () => {
      const filePath = path.resolve(__dirname, '../HubTeamModeSelector.tsx');
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).not.toMatch(/import.*useAuthStore.*from/);
    });
  });

  describe('ADR-0117: Executive default team mode', () => {
    it('useHubPersonalization reads resolvedRoles for Executive check', () => {
      const filePath = path.resolve(__dirname, '../useHubPersonalization.ts');
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain("'Executive'");
      expect(content).toContain('my-team');
    });

    it('useHubPersonalization references ADR-0117', () => {
      const filePath = path.resolve(__dirname, '../useHubPersonalization.ts');
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain('ADR-0117');
    });
  });

  describe('Tile role gating', () => {
    it('hub:aging-blocked is gated to Executive', () => {
      const tile = myWorkTileDefinitions.find((d) => d.tileKey === 'hub:aging-blocked');
      expect(tile).toBeDefined();
      expect(tile!.defaultForRoles).toEqual(['Executive']);
    });

    it('hub:team-portfolio is gated to Executive', () => {
      const tile = myWorkTileDefinitions.find((d) => d.tileKey === 'hub:team-portfolio');
      expect(tile).toBeDefined();
      expect(tile!.defaultForRoles).toEqual(['Executive']);
    });

    it('hub:admin-oversight is gated to Administrator', () => {
      const tile = myWorkTileDefinitions.find((d) => d.tileKey === 'hub:admin-oversight');
      expect(tile).toBeDefined();
      expect(tile!.defaultForRoles).toEqual(['Administrator']);
    });

    it('hub:lane-summary is available to all roles', () => {
      const tile = myWorkTileDefinitions.find((d) => d.tileKey === 'hub:lane-summary');
      expect(tile!.defaultForRoles).toEqual([]);
    });

    it('hub:source-breakdown is available to all roles', () => {
      const tile = myWorkTileDefinitions.find((d) => d.tileKey === 'hub:source-breakdown');
      expect(tile!.defaultForRoles).toEqual([]);
    });
  });

  describe('TM-01: Team mode tab gate', () => {
    it('HubTeamModeSelector accepts isExecutive prop for team tab gate', () => {
      const filePath = path.resolve(__dirname, '../HubTeamModeSelector.tsx');
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain('isExecutive');
    });

    it('HubTeamModeSelector renders My Team tab conditionally on isExecutive', () => {
      const filePath = path.resolve(__dirname, '../HubTeamModeSelector.tsx');
      const content = fs.readFileSync(filePath, 'utf-8');
      // The My Team tab should only render when isExecutive is true
      expect(content).toMatch(/isExecutive.*my-team|my-team.*isExecutive/s);
    });
  });
});
