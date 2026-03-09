import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchPreference, patchPreference, deriveInitialTierFromADGroups } from '../storage/complexityApiClient';
import type { IComplexityPreference } from '../types/IComplexityPreference';

describe('complexityApiClient', () => {
  beforeEach(() => {
    vi.mocked(fetch).mockReset();
  });

  describe('fetchPreference', () => {
    it('returns preference on 200', async () => {
      const pref: IComplexityPreference = { tier: 'expert', showCoaching: false };
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => pref,
      } as Response);

      const result = await fetchPreference();
      expect(result).toEqual(pref);
    });

    it('returns null on 404 (new user)', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      const result = await fetchPreference();
      expect(result).toBeNull();
    });

    it('throws on 500', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      await expect(fetchPreference()).rejects.toThrow('failed: 500');
    });
  });

  describe('patchPreference', () => {
    it('returns saved preference on success', async () => {
      const pref: IComplexityPreference = { tier: 'standard', showCoaching: true };
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => pref,
      } as Response);

      const result = await patchPreference(pref);
      expect(result).toEqual(pref);
    });

    it('returns null on non-ok response', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 400,
      } as Response);

      const result = await patchPreference({ tier: 'standard', showCoaching: false });
      expect(result).toBeNull();
    });

    it('returns null on network error', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      const result = await patchPreference({ tier: 'standard', showCoaching: false });
      expect(result).toBeNull();
    });
  });

  describe('deriveInitialTierFromADGroups', () => {
    it('returns derived tier from AD groups', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ groups: ['HBC-VP'] }),
      } as Response);

      const result = await deriveInitialTierFromADGroups();
      expect(result).toBe('expert');
    });

    it('returns standard on non-ok response', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      const result = await deriveInitialTierFromADGroups();
      expect(result).toBe('standard');
    });

    it('returns standard on network error', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      const result = await deriveInitialTierFromADGroups();
      expect(result).toBe('standard');
    });

    it('returns fallback tier when no AD groups match', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ groups: ['Unknown-Group'] }),
      } as Response);

      const result = await deriveInitialTierFromADGroups();
      expect(result).toBe('standard');
    });
  });
});
