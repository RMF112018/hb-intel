/**
 * Phase 3 Stage 1.5 — Project Registry Lookup Service.
 *
 * The single resolution point for projectNumber → projectId normalization,
 * SPFx site-URL resolution, and authority-scoped queries.
 *
 * Governing: P3-A1 §3.5 (Project identity in routes), §4.3 (SPFx site resolution)
 */

import type { IProjectRegistryRecord, ProjectDepartment } from '@hbc/models';

/**
 * Registry-focused lookup service operating on canonical IProjectRegistryRecord.
 *
 * Consumers: PWA routing layer, SPFx site resolution, authority scoping (PER),
 * cross-lane handoff construction.
 */
export interface IProjectRegistryService {
  /** Retrieve a registry record by canonical projectId (UUID) */
  getByProjectId(projectId: string): Promise<IProjectRegistryRecord | null>;

  /** Retrieve a registry record by legacy projectNumber (##-###-##) */
  getByProjectNumber(projectNumber: string): Promise<IProjectRegistryRecord | null>;

  /** Retrieve a registry record by site URL (P3-A1 §4.3 — SPFx site resolution) */
  getBySiteUrl(siteUrl: string): Promise<IProjectRegistryRecord | null>;

  /**
   * Resolve a project identity from any key format.
   *
   * Accepts projectId (UUID), projectNumber (##-###-##), or ambiguous string.
   * Tries projectId first, then projectNumber, then site URL.
   */
  resolveProjectIdentity(key: string): Promise<IProjectRegistryRecord | null>;

  /** List all registry records for a given department (P3-A2 §3 — PER authority scoping) */
  listByDepartment(department: ProjectDepartment): Promise<IProjectRegistryRecord[]>;
}
