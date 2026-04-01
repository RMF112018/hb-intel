/**
 * Repository for the projectViewerGroups SharePoint list.
 *
 * Provides read-only access to department-based default viewer-group policies.
 * The hybrid viewer model computes effective read-only membership as:
 *
 *   department default viewer groups (this list) + project-level viewerUPNs (Projects list)
 *
 * Runtime wiring into the provisioning saga (step6-permissions) is deferred
 * until the list data is populated. See the design note for the transition plan.
 *
 * @see viewer-groups-list-contract.ts for the persistence contract
 * @see viewer-groups-list-mapper.ts for the mapper
 * @see Gap-6-projectViewerGroups-Design-and-Adapter-Alignment.md
 */
import { DefaultAzureCredential } from '@azure/identity';
import { spfi } from '@pnp/sp';
import '@pnp/nodejs-commonjs';
import '@pnp/sp/items/index.js';
import '@pnp/sp/lists/index.js';
import '@pnp/sp/webs/index.js';
import type { IDepartmentViewerPolicy } from './viewer-groups-list-contract.js';
import { VIEWER_GROUPS_LIST_NAME, VIEWER_GROUPS_SELECT_FIELDS } from './viewer-groups-list-contract.js';
import { toDomain } from './viewer-groups-list-mapper.js';

// ─────────────────────────────────────────────────────────────────────────────
// Interface
// ─────────────────────────────────────────────────────────────────────────────

export interface IViewerGroupsRepository {
  /** Returns all active department viewer-group policies. */
  getActivePolicies(): Promise<IDepartmentViewerPolicy[]>;
  /** Returns the active policy for a specific department, or null if not found/inactive. */
  getPolicyForDepartment(department: string): Promise<IDepartmentViewerPolicy | null>;
}

// ─────────────────────────────────────────────────────────────────────────────
// SharePoint adapter
// ─────────────────────────────────────────────────────────────────────────────

/**
 * SharePoint adapter for the projectViewerGroups list.
 * Uses PnPjs with Managed Identity token binding.
 * Both `Projects` and `projectViewerGroups` live on the same HBCentral site.
 */
export class SharePointViewerGroupsAdapter implements IViewerGroupsRepository {
  private readonly siteUrl: string;
  private readonly credential = new DefaultAzureCredential();

  constructor() {
    this.siteUrl = process.env.SHAREPOINT_PROJECTS_SITE_URL ?? process.env.SHAREPOINT_TENANT_URL ?? '';
    if (!this.siteUrl) {
      throw new Error(
        'SHAREPOINT_PROJECTS_SITE_URL or SHAREPOINT_TENANT_URL env var is required for viewer-groups adapter.',
      );
    }
  }

  async getActivePolicies(): Promise<IDepartmentViewerPolicy[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sp: any = await this.getSP();
    const list = sp.web.lists.getByTitle(VIEWER_GROUPS_LIST_NAME);
    const items = await list.items
      .select(...VIEWER_GROUPS_SELECT_FIELDS)
      .filter("IsActive eq 'Yes'")();
    return items.map((item: Record<string, unknown>) => toDomain(item));
  }

  async getPolicyForDepartment(department: string): Promise<IDepartmentViewerPolicy | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sp: any = await this.getSP();
    const list = sp.web.lists.getByTitle(VIEWER_GROUPS_LIST_NAME);
    const escaped = department.replace(/'/g, "''");
    const items = await list.items
      .select(...VIEWER_GROUPS_SELECT_FIELDS)
      .filter(`Title eq '${escaped}' and IsActive eq 'Yes'`)
      .top(1)();
    if (items.length === 0) return null;
    return toDomain(items[0] as Record<string, unknown>);
  }

  private async getSP() {
    // Token binding follows the same pattern as SharePointProjectRequestsAdapter.
    // PnPjs with Managed Identity token binding via @pnp/nodejs-commonjs.
    return spfi(this.siteUrl);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock adapter (for tests and local development)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * In-memory mock for `IViewerGroupsRepository`.
 * Accepts seeded policies at construction time.
 */
export class MockViewerGroupsRepository implements IViewerGroupsRepository {
  private readonly policies: IDepartmentViewerPolicy[];

  constructor(policies: IDepartmentViewerPolicy[] = []) {
    this.policies = policies;
  }

  async getActivePolicies(): Promise<IDepartmentViewerPolicy[]> {
    return this.policies.filter((p) => p.isActive);
  }

  async getPolicyForDepartment(department: string): Promise<IDepartmentViewerPolicy | null> {
    return this.policies.find((p) => p.department === department && p.isActive) ?? null;
  }
}
