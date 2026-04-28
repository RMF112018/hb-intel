/**
 * PCC project profile read-model shape.
 *
 * Minimal, contract-aligned identity/metadata view of a project as it appears
 * in the Project Control Center. Backend persistence and SPFx UI props are
 * derived from this shape; this file does not define a backend DTO or SPFx
 * component prop type.
 *
 * Deferred fields (intentionally out of scope for Wave 1):
 *   - Teams group/channel ids (provisioning-pending, governed by Team & Access).
 *   - Full integration metadata (sync profile, last sync timestamp, etc.).
 *   - Procore Sync Health, drift counters, and Site Health summary linkage —
 *     surfaced via separate Wave 1 types (`SiteHealth`, `ExternalSystems`).
 */

import type {
  PccProjectStage,
  PccProjectStatus,
  PccProjectType,
} from './PccProjectEnums.js';
import type {
  PccProjectId,
  PccProjectNumber,
  PccSiteUrl,
} from './types.js';

export interface IProjectProfile {
  /** Canonical project identifier. */
  projectId: PccProjectId;
  /** Human-assigned project number (legacy reference key). */
  projectNumber: PccProjectNumber;
  /** Display name shown across PCC surfaces. */
  projectName: string;
  /** Vertical / construction context (frozen MVP enumeration). */
  projectType: PccProjectType;
  /** Lifecycle stage (frozen MVP enumeration). */
  projectStage: PccProjectStage;
  /** Operational state (Active / On Hold / Closed / Archived). */
  projectStatus: PccProjectStatus;
  /** Owner / client display name. */
  clientName?: string;
  /** Geographic location string. */
  projectLocation?: string;
  /** ISO 8601 start date. */
  startDate?: string;
  /** ISO 8601 projected completion date. */
  scheduledCompletionDate?: string;
  /** Estimated contract value. */
  estimatedValue?: number;
  /** Primary SharePoint site URL. */
  siteUrl?: PccSiteUrl;
  /** Procore project identifier when integration is mapped. */
  procoreProjectId?: string;
  /** Sage Intacct project identifier when integration is mapped. */
  sageIntacctProjectId?: string;
}
