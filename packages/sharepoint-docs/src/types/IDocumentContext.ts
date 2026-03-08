/**
 * Core context interface contract for @hbc/sharepoint-docs.
 * Derived from: Interview decisions D-01 through D-05, D-12.
 *
 * A DocumentContext represents the "owner" of a set of documents —
 * either a pre-provisioning record (BD lead, Estimating pursuit) or
 * a provisioned project. All documents are organized under one context.
 */

/** All context types the package currently supports (D-05). */
export type DocumentContextType =
  | 'bd-lead'            // Business Development Go/No-Go Scorecard
  | 'estimating-pursuit' // Estimating Active Pursuit
  | 'project'            // Provisioned SharePoint project site (post-provisioning)
  | 'system';            // Reserved for @hbc/data-seeding and system operations

/**
 * Configuration passed by a consuming module when initializing a document context.
 * This is the primary integration contract between @hbc/sharepoint-docs and all modules.
 */
export interface IDocumentContextConfig {
  /** Unique identifier for the owning record. Used as the registry lookup key. */
  contextId: string;

  /** Determines folder structure and storage location. */
  contextType: DocumentContextType;

  /**
   * Human-readable label shown in UI and used to derive the sanitized folder name.
   * Example: "BD Lead: Riverside Medical Center Expansion"
   */
  contextLabel: string;

  /**
   * SharePoint site URL where documents will be stored.
   * Set to null for pre-provisioning contexts (bd-lead, estimating-pursuit).
   * Required for post-provisioning contexts (project).
   */
  siteUrl: string | null;

  /**
   * Optional relative path within the site's document library.
   * Defaults to the module-appropriate subfolder when omitted.
   * Example: "BD Heritage/RFP Documents"
   */
  libraryPath?: string;

  /**
   * Permissions to apply when creating the context folder.
   * If omitted, the 3-tier permission model (D-04) is applied automatically.
   */
  permissions?: IDocumentPermissions;

  /**
   * The UPN (email) of the user creating the record. Used for folder naming (D-12)
   * and as the Tier-1 permission holder. Sourced from @hbc/auth context.
   */
  ownerUpn: string;

  /**
   * The last name of the uploading user. Used in folder name: yyyymmdd_{Name}_{LastName}.
   * Sourced from @hbc/auth context at folder creation time.
   * Never changes even if the user's name changes — folder name is immutable (D-12).
   */
  ownerLastName: string;
}

/**
 * 3-tier permission model applied to every staging folder (D-04).
 * Tier 1: Record owner + explicit collaborators → full read/write.
 * Tier 2: Department managers/directors → read-only across department staging.
 * Tier 3: Company executives (VP+) → read-only across all staging areas.
 */
export interface IDocumentPermissions {
  /** SharePoint group names with Contribute (read/write) access — Tier 1. */
  contributeGroups: string[];
  /** User UPNs with Contribute access (individual collaborators) — Tier 1. */
  contributeUsers: string[];
  /** SharePoint group names with Read access — Tier 2 (dept managers/directors). */
  readGroups: string[];
  /** SharePoint group names with Read access — Tier 3 (executives). */
  executiveReadGroups: string[];
}

/**
 * Resolved context folder returned by useDocumentContext after creation/resolution.
 * This is the hydrated version of IDocumentContextConfig with actual SharePoint paths.
 */
export interface IResolvedDocumentContext extends IDocumentContextConfig {
  /** Absolute SharePoint URL to the context's root staging folder. */
  folderUrl: string;
  /** The exact folder name as created in SharePoint (yyyymmdd_{Name}_{LastName}). */
  folderName: string;
  /** UTC timestamp when the folder was first created. */
  createdAt: string;
  /** Whether the folder already existed (true) or was just created (false). */
  wasExisting: boolean;
}
