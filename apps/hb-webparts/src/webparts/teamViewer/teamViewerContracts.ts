/**
 * teamViewerContracts — normalized contracts for the TeamViewer webpart.
 *
 * All external sources (HB Articles child rows, webpart-property arrays,
 * harness fixtures) must normalize into these shapes before reaching
 * selectors or the surface. This keeps the renderer decoupled from
 * SharePoint column drift.
 */

/** A normalized article-linked team member. */
export interface TeamViewerPerson {
  /** Stable id (prefer article-team-member row id; fall back to UPN/email hash). */
  id: string;
  /** Article this person is bound to. */
  articleId: string;
  /** Original child-row id in `HB Article Team Members`, when known. */
  articleTeamMemberId?: string;
  /** Display name. Required — a person without a name is dropped at normalization. */
  displayName: string;
  email?: string;
  upn?: string;
  jobTitle?: string;
  /** Explicit photo URL when provided directly on the child row. */
  photoUrl?: string;
  department?: string;
  teamLabel?: string;
  projectRole?: string;
  /** Grouping key for `grouped` layout; when omitted, ungrouped. */
  groupKey?: string;
  /** Ordering within a group / overall list; lower sorts first. */
  sortOrder?: number;
  /** Optional deep link to a richer profile page. */
  profileUrl?: string;
  /** Short bio (plain text or lightly formatted). */
  bio?: string;
  /** Rich HTML resume body (sanitized upstream). */
  resumeRichText?: string;
  /** Link to a resume document (Documents library). */
  resumeDocumentUrl?: string;
  /** Optional editor-supplied label for the resume-document link. */
  resumeDocumentLabel?: string;
}

/** Resolution of the active article for the TeamViewer instance. */
export interface TeamViewerArticleBinding {
  /**
   * Canonical site that hosts the publisher lists (HBCentral).
   * Always populated. All list reads MUST target this URL — never
   * the render host.
   */
  listHostUrl: string;
  /** Current render host (e.g. `/sites/CompanyPulse`). Used only for binding lookup. */
  renderSiteUrl?: string;
  /** Current page URL. Used only for binding lookup. */
  renderPageUrl?: string;
  /** Known article id. Empty when a host-context lookup is still required. */
  articleId: string;
  /** Stable destination key when resolved via `HB Article Destination Pages`. */
  destinationKey?: string;
  resolutionSource: 'direct-binding' | 'property' | 'host-context';
}

/** A grouping of people for the `grouped` layout. */
export interface TeamViewerGroup {
  id: string;
  label: string;
  people: TeamViewerPerson[];
}

export type TeamViewerDensity = 'compact' | 'standard' | 'expanded';
export type TeamViewerLayout = 'grid' | 'rail' | 'strip' | 'grouped';

/** Flags that gate optional interaction paths. */
export interface TeamViewerFeatureFlags {
  /**
   * Profile-detail drawer for bio/resume. Implemented for real, but
   * ships disabled by default until the business turns it on per host.
   */
  profileDetailDrawer: boolean;
}

/** Resolved, renderer-facing configuration. */
export interface TeamViewerConfig {
  heading: string;
  /** Optional article-id override; short-circuits host-context resolution. */
  articleId?: string;
  /** Optional destination-key override for `HB Article Destination Pages`. */
  destinationKey?: string;
  /**
   * Optional list-host override (absolute URL). Falls back to the
   * canonical HBCentral URL when empty. Intended for dev harness and
   * cross-tenant migrations, not routine configuration.
   */
  listHostOverride?: string;
  layout: TeamViewerLayout;
  density: TeamViewerDensity;
  flags: TeamViewerFeatureFlags;
}
