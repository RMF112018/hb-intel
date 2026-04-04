import type { HomepageCtaLink } from '../models/contentModels.js';

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
}

export interface ProjectPortfolioSpotlightConfig {
  heading?: string;
  items?: ProjectPortfolioSpotlightItem[];
  maxSecondaryItems?: number;
  staleAfterHours?: number;
}

export type SafetyFieldEventType = 'highlight' | 'recognition' | 'reminder' | 'notice';

export interface SafetyFieldExcellenceItem {
  id: string;
  title: string;
  summary: string;
  eventType: SafetyFieldEventType;
  metadata?: string;
  indicator?: OperationalStatusSignal;
  freshness?: OperationalFreshness;
  cta?: HomepageCtaLink;
  featured?: boolean;
  order?: number;
  audiences?: string[];
}

export interface SafetyFieldExcellenceConfig {
  heading?: string;
  items?: SafetyFieldExcellenceItem[];
  maxSecondaryItems?: number;
  staleAfterHours?: number;
}

export const DEFAULT_PROJECT_PORTFOLIO_SPOTLIGHT_CONFIG: Required<
  Pick<ProjectPortfolioSpotlightConfig, 'heading' | 'maxSecondaryItems' | 'staleAfterHours'>
> = {
  heading: 'Project and Portfolio Spotlight',
  maxSecondaryItems: 3,
  staleAfterHours: 168,
};

export const DEFAULT_SAFETY_FIELD_EXCELLENCE_CONFIG: Required<
  Pick<SafetyFieldExcellenceConfig, 'heading' | 'maxSecondaryItems' | 'staleAfterHours'>
> = {
  heading: 'Safety and Field Excellence',
  maxSecondaryItems: 4,
  staleAfterHours: 168,
};
