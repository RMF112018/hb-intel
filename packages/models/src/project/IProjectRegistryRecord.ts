/**
 * Phase 3 canonical project registry record (P3-A1 §2.1).
 *
 * This is the system-of-record type for all project identity, metadata, team
 * anchors, and lifecycle state in HB Intel. All internal state, links, and
 * cross-lane handoffs use `projectId` as the canonical identifier.
 *
 * @see docs/architecture/plans/MASTER/phase-3-deliverables/P3-A1-Project-Registry-and-Activation-Contract.md
 */

import type { IEntraGroupSet, ProjectDepartment } from '../provisioning/IProvisioning.js';
import type { ProjectLifecycleStatus } from './ProjectEnums.js';
import type { IActiveProject } from './IProject.js';

// ─────────────────────────────────────────────────────────────────────────────
// Site association (P3-A1 §2.1 — immutable after initial binding)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Binding between a project registry record and a SharePoint site.
 * The primary association is created during activation and is immutable.
 * Additional associations may be added for multi-site projects.
 */
export interface ISiteAssociation {
  /** SharePoint site URL */
  siteUrl: string;
  /** Whether this is the primary or an additional site binding */
  associationType: 'primary' | 'additional';
  /** ISO 8601 timestamp when the association was created */
  associatedAt: string;
  /** UPN of the user who created the association */
  associatedByUpn: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Canonical project registry record (P3-A1 §2.1)
// ─────────────────────────────────────────────────────────────────────────────

export interface IProjectRegistryRecord {
  // ── Immutable identity (set at activation, never modified) ─────────────

  /** System-generated primary key (UUID v4) */
  projectId: string;
  /** Human-assigned legacy reference key (format: ##-###-##); unique across registry */
  projectNumber: string;
  /** Primary SharePoint project site URL */
  siteUrl: string;
  /** ISO 8601 timestamp of activation transaction completion */
  activatedAt: string;
  /** UPN of the user who acknowledged handoff/activation */
  activatedByUpn: string;
  /** Reference to the originating handoff package ID */
  sourceHandoffId: string;
  /** Entra ID security group IDs created during provisioning */
  entraGroupSet: IEntraGroupSet;

  // ── Mutable metadata ──────────────────────────────────────────────────

  /** Project display name */
  projectName: string;
  /** Current lifecycle classification (P3-A1 §2.2) */
  lifecycleStatus: ProjectLifecycleStatus;
  /** Project type classification */
  projectType?: string;
  /** Geographic location */
  projectLocation?: string;
  /** ISO 8601 project start date */
  startDate: string;
  /** ISO 8601 projected completion date */
  scheduledCompletionDate?: string;
  /** Estimated contract value */
  estimatedValue?: number;
  /** Client / owner name */
  clientName?: string;

  // ── Team anchors ──────────────────────────────────────────────────────

  /** UPN of the Project Manager */
  projectManagerUpn: string;
  /** Display name of the Project Manager */
  projectManagerName: string;
  /** UPN of the Superintendent */
  superintendentUpn?: string;
  /** Display name of the Superintendent */
  superintendentName?: string;
  /** UPN of the Project Executive */
  projectExecutiveUpn?: string;
  /** Display name of the Project Executive */
  projectExecutiveName?: string;

  // ── Governed-mutable ──────────────────────────────────────────────────

  /**
   * Authority-defining department classification for PER scope (P3-A1 §3.6).
   * Reclassification requires Manager of OpEx approval with audit recording.
   */
  department: ProjectDepartment;

  // ── Site associations ─────────────────────────────────────────────────

  /** All site bindings; primary is immutable after activation */
  siteAssociations: ISiteAssociation[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Backward-compatible mapping (P3-A1 §2.3)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Map a canonical registry record to the legacy `IActiveProject` shape
 * for backward compatibility with existing consumers.
 */
export function toActiveProject(record: IProjectRegistryRecord): IActiveProject {
  return {
    id: record.projectId,
    name: record.projectName,
    number: record.projectNumber,
    status: record.lifecycleStatus,
    startDate: record.startDate,
    endDate: record.scheduledCompletionDate ?? '',
  };
}
