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

/**
 * Legacy homepage-authored safety item contract.
 * Older homepage instances persist SafetyFieldExcellence content in `items[]`
 * before the canonical top-line / spotlight / secondary split.
 */
export interface LegacySafetyFieldExcellenceItem {
  id?: string;
  title?: string;
  summary?: string;
  compactSummary?: string;
  metadata?: string;
  featured?: boolean;
  order?: number;
  urgency?: SafetyUrgencyLevel;
  eventType?: string;
  indicator?: OperationalStatusSignal;
  indicatorLabel?: string;
  indicatorVariant?: OperationalStatusVariant;
  freshness?: OperationalFreshness;
  updatedAt?: string;
  expiresAt?: string;
  context?: SafetyContextMetadata;
  region?: string;
  site?: string;
  project?: string;
  scope?: string;
  owner?: string;
  cta?: HomepageCtaLink;
  ctaLabel?: string;
  ctaHref?: string;
  ctaOpenInNewTab?: boolean;
  audiences?: string[];
}

export interface LegacySafetyFieldExcellenceConfig {
  heading?: string;
  summary?: string;
  statusLabel?: string;
  statusVariant?: OperationalStatusVariant;
  lastUpdatedLabel?: string;
  items?: LegacySafetyFieldExcellenceItem[];
  cta?: HomepageCtaLink;
  ctaLabel?: string;
  ctaHref?: string;
  ctaOpenInNewTab?: boolean;
  maxSecondaryItems?: number;
  staleAfterHours?: number;
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

export type SafetyFieldExcellenceConfigInput =
  | Partial<SafetyFieldExcellenceConfig>
  | Partial<LegacySafetyFieldExcellenceConfig>;

// -- Wave 05 — Safety Field Excellence dynamic source modes ---------------

/**
 * Source-mode contract for the Safety Field Excellence dynamic adapter.
 * Default behavior remains `curated-only` until explicitly cut over by
 * tenant operators.
 */
export type SafetyFieldExcellenceSourceMode =
  | 'curated-only'
  | 'dynamic-preview'
  | 'dynamic-with-curated-fallback'
  | 'dynamic-only';

/**
 * Frontend-only data adapter state. Maps the backend
 * `homepage/current` response into a renderable state machine.
 */
export type SafetyFieldExcellenceDynamicState =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'preview'
  | 'stale'
  | 'no-published-highlight'
  | 'invalid-payload'
  | 'auth-error'
  | 'network-error'
  | 'error';

/**
 * Frontend-only data-source classification recorded in the runtime
 * proof object. The shipped UI never exposes this label to end users.
 */
export type SafetyFieldExcellenceDataSource =
  | 'curated'
  | 'dynamic'
  | 'preview-fallback'
  | 'curated-fallback'
  | 'error-fallback';

export interface SafetyFieldExcellenceDynamicConfig {
  readonly sourceMode?: SafetyFieldExcellenceSourceMode;
  readonly functionAppBaseUrl?: string;
  readonly includeStale?: boolean;
  readonly diagnosticsEnabled?: boolean;
  readonly emergencyUseCuratedFallback?: boolean;
  readonly safetyHubUrl?: string;
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
