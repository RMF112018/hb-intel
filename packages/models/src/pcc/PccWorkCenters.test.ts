import { describe, it, expect } from 'vitest';
import {
  PCC_WORK_CENTER_IDS,
  PCC_WORK_CENTERS,
} from './PccWorkCenters.js';

describe('PCC work centers', () => {
  it('registry exposes all 21 contract work centers', () => {
    expect(PCC_WORK_CENTER_IDS).toHaveLength(21);
  });

  it('every id has a registry entry with a display name and primary users', () => {
    for (const id of PCC_WORK_CENTER_IDS) {
      const entry = PCC_WORK_CENTERS[id];
      expect(entry).toBeDefined();
      expect(entry.id).toBe(id);
      expect(entry.displayName.length).toBeGreaterThan(0);
      expect(entry.primaryUsers.length).toBeGreaterThan(0);
      expect(['MVP', 'Later', 'Governance']).toContain(entry.mvpTier);
    }
  });

  it('control-center-settings is the governance surface', () => {
    expect(PCC_WORK_CENTERS['control-center-settings'].mvpTier).toBe('Governance');
  });
});
