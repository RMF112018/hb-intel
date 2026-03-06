import { describe, expect, it } from 'vitest';
import { createInMemoryAccessControlAdminRepository } from './inMemoryRepository.js';

describe('admin repository', () => {
  it('returns snapshot data for all required Phase 5.11 queues', async () => {
    const repository = createInMemoryAccessControlAdminRepository();
    const snapshot = await repository.getSnapshot();

    expect(snapshot.users.length).toBeGreaterThan(0);
    expect(snapshot.roleAccess.length).toBeGreaterThan(0);
    expect(snapshot.overrideReviewQueue.length).toBeGreaterThan(0);
    expect(snapshot.renewalQueue.length).toBeGreaterThan(0);
    expect(snapshot.roleChangeReviewQueue.length).toBeGreaterThan(0);
    expect(snapshot.emergencyReviewQueue.length).toBeGreaterThan(0);
    expect(snapshot.auditEvents.length).toBeGreaterThan(0);
  });

  it('filters snapshot results by search term', async () => {
    const repository = createInMemoryAccessControlAdminRepository();
    const filtered = await repository.getSnapshot({ searchTerm: 'avery' });

    expect(filtered.users).toHaveLength(1);
    expect(filtered.users[0].displayName).toContain('Avery');
  });
});
