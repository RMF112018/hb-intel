import { describe, expect, it } from 'vitest';
import { createInMemoryAccessControlAdminRepository } from './inMemoryRepository.js';
import {
  loadAdminAccessControlSnapshot,
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
});
