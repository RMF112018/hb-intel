import type { HomepageCtaLink, HomepageMediaSlot } from '../models/contentModels.js';

export type OperationalStatusVariant = 'info' | 'success' | 'warning' | 'critical' | 'neutral';

export interface OperationalStatusSignal {
  label: string;
  variant?: OperationalStatusVariant;
}

export type OperationalSignalSource = 'curated' | 'live';

export interface OperationalFreshness {
  source?: OperationalSignalSource;
  updatedAt?: string;
  expiresAt?: string;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  dueDate?: string;
  completed?: boolean;
}

export interface ProjectTeamMember {
  id: string;
  displayName: string;
  role?: string;
  photoUrl?: string;
}

export interface ProjectPortfolioSpotlightItem {
  id: string;
  title: string;
  summary: string;
  metadata?: string;
  status?: OperationalStatusSignal;
  milestones?: ProjectMilestone[];
  strategicEmphasis?: boolean;
  freshness?: OperationalFreshness;
  cta?: HomepageCtaLink;
  featured?: boolean;
  order?: number;
  audiences?: string[];
  /** Project photography for image-led editorial composition. */
  image?: HomepageMediaSlot;
  /** Short editorial headline (distinct from title). */
  highlightHeadline?: string;
  /** Project location (city, region). */
  location?: string;
  /** Project sector or market (e.g., "Commercial", "Luxury Residential"). */
  sector?: string;
  /** Project team members for the avatar strip. */
  teamMembers?: ProjectTeamMember[];
}

export interface ProjectPortfolioSpotlightConfig {
  heading?: string;
  items?: ProjectPortfolioSpotlightItem[];
  maxSecondaryItems?: number;
  staleAfterHours?: number;
  /** Label for the section-level "all projects" action (decoupled from featured CTA). */
  allProjectsLabel?: string;
  /** URL for the section-level "all projects" action. */
  allProjectsUrl?: string;
}

export type SafetyUrgencyLevel = 'routine' | 'attention' | 'urgent';

export interface SafetyContextMetadata {
  region?: string;
  site?: string;
  project?: string;
  scope?: string;
  owner?: string;
}

export interface SafetyTopLineSummary {
  statusLabel: string;
  statusVariant?: OperationalStatusVariant;
  summaryText: string;
  lastUpdatedLabel?: string;
}

export interface SafetyPrimarySpotlight {
  id: string;
  title: string;
  summary: string;
  urgency?: SafetyUrgencyLevel;
  context?: SafetyContextMetadata;
  compactSummary?: string;
  metadata?: string;
  indicator?: OperationalStatusSignal;
  freshness?: OperationalFreshness;
  cta?: HomepageCtaLink;
  audiences?: string[];
}

export interface SafetySecondarySignal {
  id: string;
  title: string;
  summary: string;
  urgency?: SafetyUrgencyLevel;
  context?: SafetyContextMetadata;
  compactSummary?: string;
  metadata?: string;
  indicator?: OperationalStatusSignal;
  freshness?: OperationalFreshness;
  cta?: HomepageCtaLink;
  order?: number;
  audiences?: string[];
}

export interface SafetyFieldExcellenceConfig {
  heading?: string;
  topLineSummary?: SafetyTopLineSummary;
  primarySpotlight?: SafetyPrimarySpotlight;
  secondarySignals?: SafetySecondarySignal[];
  sectionCta?: HomepageCtaLink;
  maxSecondaryItems?: number;
  staleAfterHours?: number;
}

export const DEFAULT_PROJECT_PORTFOLIO_SPOTLIGHT_CONFIG: Required<
  Pick<ProjectPortfolioSpotlightConfig, 'heading' | 'maxSecondaryItems' | 'staleAfterHours' | 'allProjectsLabel' | 'allProjectsUrl'>
> = {
  heading: 'Project and Portfolio Spotlight',
  maxSecondaryItems: 3,
  staleAfterHours: 168,
  allProjectsLabel: 'View all projects',
  allProjectsUrl: '/sites/hb-central/portfolio',
};

export const DEFAULT_SAFETY_FIELD_EXCELLENCE_CONFIG: Required<
  Pick<SafetyFieldExcellenceConfig, 'heading' | 'maxSecondaryItems' | 'staleAfterHours'>
> = {
  heading: 'Safety and Field Excellence',
  maxSecondaryItems: 4,
  staleAfterHours: 168,
};
