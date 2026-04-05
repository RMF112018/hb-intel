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
