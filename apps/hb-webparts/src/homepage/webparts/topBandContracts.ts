import type { HomepageCtaLink, HomepageMediaSlot } from '../models/contentModels.js';

export type WelcomeAlertSeverity = 'none' | 'info' | 'warning' | 'critical';

export interface PersonalizedWelcomeHeaderConfig {
  supportLine?: string;
  contextLine?: string;
  alertSeverity?: WelcomeAlertSeverity;
  alertTitle?: string;
  alertMessage?: string;
}

export interface HbHeroBannerConfig {
  headline: string;
  message?: string;
  eyebrow?: string;
  metadata?: string;
  background?: HomepageMediaSlot;
  cta?: HomepageCtaLink;
  secondaryCta?: HomepageCtaLink;
}

export const DEFAULT_WELCOME_HEADER_CONFIG: PersonalizedWelcomeHeaderConfig = {
  supportLine: 'Welcome back to HB Central.',
  contextLine: undefined,
  alertSeverity: 'none',
  alertTitle: undefined,
  alertMessage: undefined,
};

export const DEFAULT_HERO_BANNER_CONFIG: HbHeroBannerConfig = {
  headline: 'Build with confidence.',
  message: 'Keep teams aligned on priorities, updates, and field execution from one homepage experience.',
  eyebrow: undefined,
  metadata: undefined,
  background: undefined,
  cta: undefined,
  secondaryCta: undefined,
};
