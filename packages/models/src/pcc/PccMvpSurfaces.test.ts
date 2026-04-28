import { describe, it, expect } from 'vitest';
import {
  PCC_MVP_SURFACE_IDS,
  PCC_MVP_SURFACES,
} from './PccMvpSurfaces.js';
import { PCC_WORK_CENTER_IDS } from './PccWorkCenters.js';

describe('PCC MVP surfaces', () => {
  it('registry exposes the eight Phase 3 PCC MVP surfaces', () => {
    expect(PCC_MVP_SURFACE_IDS).toHaveLength(8);
  });

  it('every surface has a registry entry with id, display name, description, and tier', () => {
    for (const id of PCC_MVP_SURFACE_IDS) {
      const entry = PCC_MVP_SURFACES[id];
      expect(entry).toBeDefined();
      expect(entry.id).toBe(id);
      expect(entry.displayName.length).toBeGreaterThan(0);
      expect(entry.description.length).toBeGreaterThan(0);
      expect(['MVP', 'Governance']).toContain(entry.mvpTier);
    }
  });

  it('every surface references existing contract work-center ids in primaryWorkCenterIds', () => {
    for (const id of PCC_MVP_SURFACE_IDS) {
      const entry = PCC_MVP_SURFACES[id];
      expect(entry.primaryWorkCenterIds.length).toBeGreaterThan(0);
      for (const wcId of entry.primaryWorkCenterIds) {
        expect(PCC_WORK_CENTER_IDS).toContain(wcId);
      }
    }
  });

  it('site-health and control-center-settings surfaces are governance-tier', () => {
    expect(PCC_MVP_SURFACES['site-health'].mvpTier).toBe('Governance');
    expect(PCC_MVP_SURFACES['control-center-settings'].mvpTier).toBe('Governance');
  });
});
