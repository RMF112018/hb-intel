/**
 * Shell-extension placeholder types.
 *
 * Defines the supported SharePoint placeholder regions that Lane B
 * may render into. Only officially supported SPFx placeholder IDs
 * are permitted — no unsupported DOM anchors.
 */

/** Supported SharePoint placeholder identifiers */
export type PlaceholderRegion = 'Top' | 'Bottom';

/** Placeholder mount configuration */
export interface PlaceholderConfig {
  /** Whether to render content in this placeholder */
  enabled: boolean;
}

/** Shell-extension runtime configuration */
export interface ShellExtensionConfig {
  /** Top placeholder (ribbon, alert band) */
  top: PlaceholderConfig;
  /** Bottom placeholder (footer rail, support band) */
  bottom: PlaceholderConfig;
}

/** Default configuration — both placeholders enabled */
export const DEFAULT_SHELL_EXTENSION_CONFIG: ShellExtensionConfig = {
  top: { enabled: true },
  bottom: { enabled: true },
};

// ── Top ribbon types ───────────────────────────────────────────────────

/** A concise utility link in the top ribbon */
export interface RibbonUtilityItem {
  id: string;
  label: string;
  href: string;
  iconKey?: string;
}

/** Top ribbon configuration */
export interface TopRibbonConfig {
  items: RibbonUtilityItem[];
}

// ── Alert band types ───────────────────────────────────────────────────

/** Alert severity levels */
export type AlertSeverity = 'info' | 'warning' | 'critical';

/** A single alert/announcement in the alert band */
export interface AlertBandItem {
  id: string;
  severity: AlertSeverity;
  message: string;
  /** Optional CTA link */
  href?: string;
  /** Optional CTA label */
  ctaLabel?: string;
  /** Whether this alert can be dismissed */
  dismissible?: boolean;
}

/** Alert band configuration */
export interface AlertBandConfig {
  items: AlertBandItem[];
}

/** Combined top placeholder configuration */
export interface TopPlaceholderConfig {
  ribbon?: TopRibbonConfig;
  alerts?: AlertBandConfig;
}
