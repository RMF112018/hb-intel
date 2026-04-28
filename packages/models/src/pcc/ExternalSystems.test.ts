import { describe, it, expect } from 'vitest';
import {
  EXTERNAL_SYSTEM_IDS,
  EXTERNAL_SYSTEM_POSTURES,
  EXTERNAL_SYSTEM_CATALOG,
} from './ExternalSystems.js';

const REQUIRED_MIN_IDS = [
  'sharepoint',
  'onedrive',
  'procore',
  'sage_intacct',
  'teams',
  'compass',
  'document_crunch',
  'cupix',
] as const;

const SECRET_TOKEN_PATTERNS = /(secret|token|bearer|apikey|api[-_]key|authorization|password)/i;

describe('PCC external system catalog', () => {
  it('covers the required minimum identifier set', () => {
    for (const id of REQUIRED_MIN_IDS) {
      expect(EXTERNAL_SYSTEM_IDS).toContain(id);
      expect(EXTERNAL_SYSTEM_CATALOG[id]).toBeDefined();
    }
  });

  it('every entry has a posture from the allowed literal set', () => {
    for (const id of EXTERNAL_SYSTEM_IDS) {
      const entry = EXTERNAL_SYSTEM_CATALOG[id];
      expect(EXTERNAL_SYSTEM_POSTURES).toContain(entry.posture);
    }
  });

  it('display names contain no secret/token-like substrings', () => {
    for (const id of EXTERNAL_SYSTEM_IDS) {
      const entry = EXTERNAL_SYSTEM_CATALOG[id];
      expect(entry.displayName).not.toMatch(SECRET_TOKEN_PATTERNS);
    }
  });

  it('every entry has at least one primary work center', () => {
    for (const id of EXTERNAL_SYSTEM_IDS) {
      expect(EXTERNAL_SYSTEM_CATALOG[id].primaryWorkCenterIds.length).toBeGreaterThan(0);
    }
  });
});
