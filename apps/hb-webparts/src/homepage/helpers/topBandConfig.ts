import { DEFAULT_HERO_BANNER_CONFIG, DEFAULT_WELCOME_HEADER_CONFIG, type HbHeroBannerConfig, type PersonalizedWelcomeHeaderConfig, type WelcomeAlertSeverity } from '../webparts/topBandContracts.js';

const VALID_ALERT_SEVERITIES: readonly WelcomeAlertSeverity[] = ['none', 'info', 'warning', 'critical'];

function hasText(value: string | undefined): value is string {
  return Boolean(value?.trim());
}

export function normalizeWelcomeHeaderConfig(input: Partial<PersonalizedWelcomeHeaderConfig> | undefined): PersonalizedWelcomeHeaderConfig {
  const alertSeverity = VALID_ALERT_SEVERITIES.includes(input?.alertSeverity ?? 'none') ? (input?.alertSeverity ?? 'none') : 'none';

  return {
    supportLine: hasText(input?.supportLine) ? input?.supportLine?.trim() : DEFAULT_WELCOME_HEADER_CONFIG.supportLine,
    contextLine: hasText(input?.contextLine) ? input?.contextLine?.trim() : undefined,
    alertSeverity,
    alertTitle: hasText(input?.alertTitle) ? input?.alertTitle?.trim() : undefined,
    alertMessage: hasText(input?.alertMessage) ? input?.alertMessage?.trim() : undefined,
  };
}

function normalizeCta(cta: { label?: string; href?: string; openInNewTab?: boolean } | undefined): { label: string; href: string; openInNewTab?: boolean } | undefined {
  if (!hasText(cta?.label) || !hasText(cta?.href)) return undefined;
  return {
    label: cta!.label!.trim(),
    href: cta!.href!.trim(),
    openInNewTab: cta?.openInNewTab,
  };
}

export function normalizeHeroBannerConfig(input: Partial<HbHeroBannerConfig> | undefined): HbHeroBannerConfig {
  const headline = hasText(input?.headline) ? input?.headline.trim() : DEFAULT_HERO_BANNER_CONFIG.headline;

  return {
    headline,
    message: hasText(input?.message) ? input?.message?.trim() : DEFAULT_HERO_BANNER_CONFIG.message,
    eyebrow: hasText(input?.eyebrow) ? input?.eyebrow?.trim() : undefined,
    metadata: hasText(input?.metadata) ? input?.metadata?.trim() : undefined,
    background: input?.background,
    cta: normalizeCta(input?.cta),
    secondaryCta: normalizeCta(input?.secondaryCta),
  };
}
