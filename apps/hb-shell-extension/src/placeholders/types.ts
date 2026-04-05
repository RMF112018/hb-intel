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

// ── Footer rail types ──────────────────────────────────────────────────

/** A footer utility link */
export interface FooterUtilityItem {
  id: string;
  label: string;
  href: string;
}

/** A support/help affordance */
export interface SupportItem {
  id: string;
  label: string;
  href?: string;
  description?: string;
}

/** Bottom placeholder configuration */
export interface BottomPlaceholderConfig {
  /** Footer utility links (e.g., Help, Feedback, Privacy) */
  footerLinks?: FooterUtilityItem[];
  /** Support band items (e.g., help resources, operational notes) */
  supportItems?: SupportItem[];
  /** Optional operational text (e.g., "HB Central — Hedrick Brothers") */
  operationalText?: string;
}

// ── Activation governance ──────────────────────────────────────────────

/**
 * Shell-extension activation posture.
 *
 * The extension is designed to run on ALL modern SharePoint pages where
 * the App Catalog has deployed it. Activation governance rules:
 *
 * 1. The extension renders only into officially supported placeholder
 *    regions (Top and Bottom). If a placeholder is not available on a
 *    given page, the extension renders nothing for that region — no
 *    crash, no fallback DOM injection.
 *
 * 2. If no config/content is provided for a placeholder, the extension
 *    renders a minimal empty container — not a broken or missing state.
 *
 * 3. Partial configuration (e.g., ribbon but no alerts, footer but no
 *    support items) renders only the configured sub-surfaces.
 *
 * 4. Top and bottom surfaces are independent — one can render while the
 *    other is unavailable or unconfigured.
 *
 * 5. The extension does not compete with Lane A homepage webparts for
 *    page-canvas space. Shell-extension surfaces render in placeholder
 *    regions that exist outside the page-canvas content area.
 */
export const ACTIVATION_GOVERNANCE = {
  /** Extension targets all modern SharePoint pages via App Catalog deployment */
  scope: 'tenant-wide' as const,
  /** Rendering is gated by placeholder availability, not page URL matching */
  activationGate: 'placeholder-availability' as const,
  /** Missing placeholder = safe no-op, not error */
  missingPlaceholderBehavior: 'no-op' as const,
  /** Missing config = empty container, not broken state */
  missingConfigBehavior: 'empty-container' as const,
  /** Top and bottom are independent — partial availability is normal */
  partialAvailability: 'independent-surfaces' as const,
} as const;
