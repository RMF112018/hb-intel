/**
 * HbcProjectSpotlightSurface — view-model contract.
 *
 * Decoupled from any consumer data shape. SPFx webparts and other
 * callers normalize their data into this model and hand it to the
 * surface; the surface itself never reads list items or business
 * entities directly.
 */

export type ProjectSpotlightStatusVariant =
  | 'info'
  | 'success'
  | 'warning'
  | 'critical'
  | 'neutral';

export interface ProjectSpotlightStatus {
  label: string;
  variant?: ProjectSpotlightStatusVariant;
}

export interface ProjectSpotlightMedia {
  src: string;
  alt: string;
}

export interface ProjectSpotlightCta {
  label: string;
  href: string;
  openInNewTab?: boolean;
}

export interface ProjectSpotlightMilestone {
  id: string;
  title: string;
  completed?: boolean;
}

export interface ProjectSpotlightTeamMember {
  id: string;
  displayName: string;
  role?: string;
  photoUrl?: string;
}

/**
 * Authored-content completeness signal. Computed upstream by the
 * normalizer based on the density of authored signals (image,
 * headline, status, etc.). The surface uses this to trim optional
 * content so thin payloads don't leave filler-looking detail regions.
 * Callers that don't provide it are treated as `'full'`.
 */
export type ProjectSpotlightCompleteness = 'full' | 'partial' | 'minimal';

export interface ProjectSpotlightFeaturedItem {
  id: string;
  title: string;
  /** Short editorial headline shown below the title. */
  headline?: string;
  summary: string;
  location?: string;
  sector?: string;
  image?: ProjectSpotlightMedia;
  status?: ProjectSpotlightStatus;
  strategicEmphasis?: boolean;
  isStale?: boolean;
  freshnessLabel?: string;
  milestones?: ProjectSpotlightMilestone[];
  teamMembers?: ProjectSpotlightTeamMember[];
  cta?: ProjectSpotlightCta;
  /**
   * Authored-content completeness, sourced from normalization. Drives
   * rendering polish (suppress headline on minimal payloads, skip
   * milestone list when sparse, force tight summary, keep details
   * closed by default when there is effectively nothing to reveal).
   */
  completeness?: ProjectSpotlightCompleteness;
}

export interface ProjectSpotlightRailItem {
  id: string;
  title: string;
  location?: string;
  sector?: string;
  image?: ProjectSpotlightMedia;
  status?: ProjectSpotlightStatus;
  isStale?: boolean;
  freshnessLabel?: string;
  cta?: ProjectSpotlightCta;
  /**
   * Advisory completeness for rail tiles. Reserved for future rail
   * polish (e.g., dimmed meta treatment for `minimal` items); not
   * currently consumed by the rail visuals.
   */
  completeness?: ProjectSpotlightCompleteness;
}

export interface ProjectSpotlightSurfaceModel {
  heading: string;
  allProjectsLabel?: string;
  allProjectsUrl?: string;
  featured: ProjectSpotlightFeaturedItem;
  secondary: ProjectSpotlightRailItem[];
  /** Masthead eyebrow. Defaults to "Portfolio". */
  sectionEyebrow?: string;
  /** Label for the supporting rail column. Defaults to "More projects". */
  railLabel?: string;
}
