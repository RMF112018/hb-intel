import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PreferencesApi } from './PreferencesApi';

describe('PreferencesApi', () => {
  beforeEach(() => {
    vi.mocked(global.fetch).mockReset();
  });

  describe('getPreferences()', () => {
    it('calls GET /api/notifications/preferences', async () => {
      const mockPrefs = {
        userId: 'user-1',
        tierOverrides: {},
        pushEnabled: true,
        digestDay: 0,
        digestHour: 8,
      };
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPrefs,
      } as Response);

      const result = await PreferencesApi.getPreferences();

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/notifications/preferences',
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(result).toEqual(mockPrefs);
    });
  });

  describe('updatePreferences()', () => {
    it('calls PATCH /api/notifications/preferences with partial body', async () => {
      const updated = {
        userId: 'user-1',
        tierOverrides: {},
        pushEnabled: false,
        digestDay: 1,
        digestHour: 9,
      };
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => updated,
      } as Response);

      const result = await PreferencesApi.updatePreferences({ pushEnabled: false, digestDay: 1, digestHour: 9 });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/notifications/preferences',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ pushEnabled: false, digestDay: 1, digestHour: 9 }),
        })
      );
      expect(result).toEqual(updated);
    });
  });
});
