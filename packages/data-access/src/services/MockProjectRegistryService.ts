import type { IProjectRegistryRecord, ProjectDepartment } from '@hbc/models';
import type { IProjectRegistryService } from './IProjectRegistryService.js';

/**
 * In-memory mock implementation of IProjectRegistryService for dev/test.
 */
export class MockProjectRegistryService implements IProjectRegistryService {
  private store: IProjectRegistryRecord[] = [];

  /** Seed the store with registry records */
  seed(records: IProjectRegistryRecord[]): void {
    this.store = [...records];
  }

  /** Clear all records */
  clear(): void {
    this.store = [];
  }

  async getByProjectId(projectId: string): Promise<IProjectRegistryRecord | null> {
    return this.store.find((r) => r.projectId === projectId) ?? null;
  }

  async getByProjectNumber(projectNumber: string): Promise<IProjectRegistryRecord | null> {
    return this.store.find((r) => r.projectNumber === projectNumber) ?? null;
  }

  async getBySiteUrl(siteUrl: string): Promise<IProjectRegistryRecord | null> {
    return (
      this.store.find((r) =>
        r.siteAssociations.some((sa) => sa.siteUrl === siteUrl),
      ) ?? null
    );
  }

  async resolveProjectIdentity(key: string): Promise<IProjectRegistryRecord | null> {
    const trimmed = key.trim();
    if (!trimmed) return null;

    // Try by projectId first
    const byId = await this.getByProjectId(trimmed);
    if (byId) return byId;

    // Try by projectNumber
    const byNumber = await this.getByProjectNumber(trimmed);
    if (byNumber) return byNumber;

    // Try by siteUrl
    const bySite = await this.getBySiteUrl(trimmed);
    if (bySite) return bySite;

    return null;
  }

  async listByDepartment(department: ProjectDepartment): Promise<IProjectRegistryRecord[]> {
    return this.store.filter((r) => r.department === department);
  }
}
