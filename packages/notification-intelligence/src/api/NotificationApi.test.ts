import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationApi } from './NotificationApi';
import { NotificationRegistry } from '../registry/NotificationRegistry';

describe('NotificationApi', () => {
  beforeEach(() => {
    NotificationRegistry._clearForTesting();
    vi.mocked(global.fetch).mockReset();
  });

  describe('send()', () => {
    it('throws if eventType is not registered', async () => {
      await expect(
        NotificationApi.send({
          eventType: 'unregistered.event',
          sourceModule: 'test',
          sourceRecordType: 'record',
          sourceRecordId: '1',
          recipientUserId: 'user-1',
          title: 'Test',
          body: 'Body',
          actionUrl: '/test',
        })
      ).rejects.toThrow('unknown eventType "unregistered.event"');
    });

    it('calls the /send endpoint when eventType is registered', async () => {
      NotificationRegistry.register([
        { eventType: 'test.send', defaultTier: 'watch', description: 'Test', tierOverridable: true, channels: ['in-app'] },
      ]);
      vi.mocked(global.fetch).mockResolvedValueOnce({ ok: true, json: async () => ({}) } as Response);

      await NotificationApi.send({
        eventType: 'test.send',
        sourceModule: 'test',
        sourceRecordType: 'record',
        sourceRecordId: '1',
        recipientUserId: 'user-1',
        title: 'Test',
        body: 'Body',
        actionUrl: '/test',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/notifications/send',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  describe('getCenter()', () => {
    it('calls the /center endpoint with tier filter', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [], totalCount: 0, immediateUnreadCount: 0, hasMore: false, nextCursor: null }),
      } as Response);

      await NotificationApi.getCenter({ tier: 'immediate', pageSize: 20 });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('tier=immediate'),
        expect.any(Object)
      );
    });
  });

  describe('markRead()', () => {
    it('calls the /{id}/read endpoint with PATCH', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({ ok: true, json: async () => ({}) } as Response);
      await NotificationApi.markRead('notif-42');
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/notifications/notif-42/read',
        expect.objectContaining({ method: 'PATCH' })
      );
    });
  });

  describe('markAllRead()', () => {
    it('calls mark-all-read with the specified tier', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({ ok: true, json: async () => ({}) } as Response);
      await NotificationApi.markAllRead('watch');
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/notifications/mark-all-read',
        expect.objectContaining({ method: 'POST', body: JSON.stringify({ tier: 'watch' }) })
      );
    });

    it('defaults tier to "all" when not specified', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({ ok: true, json: async () => ({}) } as Response);
      await NotificationApi.markAllRead();
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/notifications/mark-all-read',
        expect.objectContaining({ body: JSON.stringify({ tier: 'all' }) })
      );
    });
  });

  describe('dismiss()', () => {
    it('calls the /{id}/dismiss endpoint with PATCH', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({ ok: true, json: async () => ({}) } as Response);
      await NotificationApi.dismiss('notif-99');
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/notifications/notif-99/dismiss',
        expect.objectContaining({ method: 'PATCH' })
      );
    });
  });
});
