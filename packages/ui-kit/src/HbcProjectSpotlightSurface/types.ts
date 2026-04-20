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
