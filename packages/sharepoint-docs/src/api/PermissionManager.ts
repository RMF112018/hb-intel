import type { IDocumentContextConfig, IDocumentPermissions } from '../types/index.js';
import { SharePointDocsApi } from './SharePointDocsApi.js';

/**
 * Applies the 3-tier staging permission model to context folders (D-04):
 *
 * Tier 1 — Owner + Collaborators:
 *   - The record's ownerUpn gets Contribute (read/write) on their specific folder.
 *   - Explicit collaborators (if any) added later via addCollaborator().
 *
 * Tier 2 — Department Managers + Directors:
 *   - Applied at the parent folder level (BD Leads/, Estimating Pursuits/) via
 *     Azure AD group membership — NOT per-folder unique permissions.
 *   - This avoids SharePoint's unique permission limit (high item count = perf degradation).
 *
 * Tier 3 — Executives:
 *   - Applied at the parent folder level via an Executives AD group.
 *   - Read-only access across all staging areas.
 *
 * Only record-level folders get unique permissions (to isolate Tier 1 owners).
 * Parent folders inherit Tier 2 and Tier 3 from group membership — no per-item permissions.
 */
export class PermissionManager {
  private api: SharePointDocsApi;

  constructor(api: SharePointDocsApi) {
    this.api = api;
  }

  /**
   * Applies default 3-tier permissions to a newly created record folder.
   * Called by FolderManager.createFolderWithSubfolders().
   */
  async applyDefaultPermissions(
    siteUrl: string,
    folderPath: string,
    config: IDocumentContextConfig
  ): Promise<void> {
    // Break inheritance on this folder so Tier-1 permissions can be applied uniquely
    await this.api.breakFolderInheritance(siteUrl, folderPath, false);

    // Tier 1: Grant the record owner Contribute access
    await this.api.grantFolderPermission(siteUrl, folderPath, {
      principalType: 'user',
      principal: config.ownerUpn,
      roleType: 'Contribute',
    });

    // Tier 2 and Tier 3: Groups are granted at the parent folder level during provisioning
    // (provision-permissions.ps1). No per-folder Tier 2/3 grants needed here.
    // This is by design — see ADR 0010.
  }

  /** Apply custom permissions passed explicitly in IDocumentContextConfig. */
  async applyCustomPermissions(
    siteUrl: string,
    folderPath: string,
    permissions: IDocumentPermissions
  ): Promise<void> {
    await this.api.breakFolderInheritance(siteUrl, folderPath, false);

    for (const group of permissions.contributeGroups) {
      await this.api.grantFolderPermission(siteUrl, folderPath, { principalType: 'group', principal: group, roleType: 'Contribute' });
    }
    for (const upn of permissions.contributeUsers) {
      await this.api.grantFolderPermission(siteUrl, folderPath, { principalType: 'user', principal: upn, roleType: 'Contribute' });
    }
    for (const group of permissions.readGroups) {
      await this.api.grantFolderPermission(siteUrl, folderPath, { principalType: 'group', principal: group, roleType: 'Read' });
    }
    for (const group of permissions.executiveReadGroups) {
      await this.api.grantFolderPermission(siteUrl, folderPath, { principalType: 'group', principal: group, roleType: 'Read' });
    }
  }

  /**
   * Adds a collaborator to an existing record folder (Tier 1 expansion).
   * Called when a user explicitly adds a collaborator to a record.
   */
  async addCollaborator(siteUrl: string, folderPath: string, collaboratorUpn: string): Promise<void> {
    await this.api.grantFolderPermission(siteUrl, folderPath, {
      principalType: 'user',
      principal: collaboratorUpn,
      roleType: 'Contribute',
    });
  }
}
