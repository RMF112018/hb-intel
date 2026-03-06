import { describe, expect, it } from 'vitest';
import {
  clearStructuredAuditEvents,
  seedStructuredAuditEvents,
} from '../audit/auditLogger.js';
import { createInMemoryAccessControlAdminRepository } from './inMemoryRepository.js';
import {
  loadAdminAccessControlSnapshot,
  toAdminAuditOperationalVisibility,
  toAdminSearchQuery,
} from './hooks.js';

describe('admin hooks helpers', () => {
  it('normalizes search input to query payload', () => {
    expect(toAdminSearchQuery('   ')).toBeUndefined();
    expect(toAdminSearchQuery('  admin  ')).toEqual({ searchTerm: 'admin' });
  });

  it('loads admin snapshot through repository abstraction', async () => {
    const repository = createInMemoryAccessControlAdminRepository();
    const snapshot = await loadAdminAccessControlSnapshot(repository, { searchTerm: 'project' });

    expect(snapshot.generatedAt).toBeTruthy();
    expect(snapshot.roleAccess.length).toBeGreaterThan(0);
  });

  it('builds retention-aware audit operational visibility', async () => {
    clearStructuredAuditEvents();
    seedStructuredAuditEvents([
      {
        id: 'ace-seeded-1',
        eventId: 'ace-seeded-1',
        eventType: 'sign-in',
        actorId: 'user-1',
        subjectUserId: 'user-1',
        runtimeMode: 'mock',
        source: 'auth-store',
        correlationId: 'corr-1',
        outcome: 'success',
        occurredAt: '2026-03-06T00:00:00.000Z',
      },
    ]);

    const repository = createInMemoryAccessControlAdminRepository();
    const snapshot = await loadAdminAccessControlSnapshot(repository);
    const visibility = toAdminAuditOperationalVisibility(snapshot.auditEvents);

    expect(visibility.activeCount).toBeGreaterThan(0);
    expect(visibility.policy.activeWindowDays).toBe(180);
    expect(visibility.recentEvents.length).toBeGreaterThan(0);
  });
});
