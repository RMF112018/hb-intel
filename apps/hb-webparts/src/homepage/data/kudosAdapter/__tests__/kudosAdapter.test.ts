/**
 * Kudos domain-adapter (Layer 2) smoke tests.
 *
 * Verifies the adapter's own binding-validation logic and confirms
 * the re-exported front door exposes the expected domain functions.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  validateKudosBindings,
  submitKudosDraft,
  submitKudosGovernanceAction,
  applyKudosPatch,
  getKudosAuditTimeline,
  getKudosEntries,
} from '../index.js';
import { PEOPLE_CULTURE_LIST_REGISTRY } from '../../peopleCultureSpListRegistry.js';

const SITE = 'https://tenant.sharepoint.com/sites/HBCentral';

describe('kudosAdapter', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('front-door re-exports', () => {
    it('exposes submission, governance, reads, and validation entrypoints', () => {
      expect(typeof submitKudosDraft).toBe('function');
      expect(typeof submitKudosGovernanceAction).toBe('function');
      expect(typeof applyKudosPatch).toBe('function');
      expect(typeof getKudosAuditTimeline).toBe('function');
      expect(typeof getKudosEntries).toBe('function');
      expect(typeof validateKudosBindings).toBe('function');
    });

    it('aliases applyKudosPatch to submitKudosGovernanceAction', () => {
      expect(applyKudosPatch).toBe(submitKudosGovernanceAction);
    });
  });

  describe('validateKudosBindings', () => {
    beforeEach(() => {
      vi.spyOn(globalThis, 'fetch' as never);
    });

    it('returns ok when both lists expose every critical field', async () => {
      const kudosFields = (
        PEOPLE_CULTURE_LIST_REGISTRY.kudos.criticalFieldInternalNames ?? []
      ).map((InternalName) => ({ InternalName }));
      const auditFields = (
        PEOPLE_CULTURE_LIST_REGISTRY.kudosAuditEvents.criticalFieldInternalNames ?? []
      ).map((InternalName) => ({ InternalName }));

      (globalThis.fetch as unknown as ReturnType<typeof vi.fn>) = vi
        .fn()
        .mockImplementation((url: string) => {
          const value = url.includes(PEOPLE_CULTURE_LIST_REGISTRY.kudos.id)
            ? kudosFields
            : auditFields;
          return Promise.resolve({
            ok: true,
            status: 200,
            statusText: 'OK',
            json: () => Promise.resolve({ value }),
          });
        });

      const result = await validateKudosBindings(SITE);
      expect(result).toEqual({ ok: true });
    });

    it('reports missing critical fields per list', async () => {
      (globalThis.fetch as unknown as ReturnType<typeof vi.fn>) = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve({ value: [] }),
      });

      const result = await validateKudosBindings(SITE);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.missing.kudos.length).toBeGreaterThan(0);
        expect(result.missing.kudosAuditEvents.length).toBeGreaterThan(0);
      }
    });

    it('throws when the fields endpoint errors', async () => {
      (globalThis.fetch as unknown as ReturnType<typeof vi.fn>) = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Server Error',
        json: () => Promise.resolve({}),
      });

      await expect(validateKudosBindings(SITE)).rejects.toThrow(
        /Field metadata fetch failed/i,
      );
    });
  });
});
