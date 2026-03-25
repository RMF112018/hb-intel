/**
 * P3-J1 E7 document-preview-adaptive enumerations.
 * Preview provider strategies, adaptive device modes, preview capabilities, UI kit dependencies.
 */

// -- Preview Provider Strategy ----------------------------------------------------

export type PreviewProviderStrategy =
  | 'ABSTRACT_PROVIDER'
  | 'NATIVE_OPEN_FALLBACK'
  | 'EMBEDDED_VIEWER'
  | 'EXTERNAL_VIEWER';

// -- Adaptive Device Mode ---------------------------------------------------------

export type AdaptiveDeviceMode = 'DESKTOP' | 'TABLET' | 'FIELD';

// -- Preview Capability -----------------------------------------------------------

export type PreviewCapability =
  | 'PREVIEW_SUPPORTED'
  | 'PREVIEW_UNAVAILABLE'
  | 'DOWNLOAD_ONLY'
  | 'METADATA_ONLY';

// -- UI Kit Adaptive Dependency ---------------------------------------------------

export type UiKitAdaptiveDependency =
  | 'RESPONSIVE_LAYOUT'
  | 'TOUCH_TARGET'
  | 'REDUCED_CHROME'
  | 'OFFLINE_INDICATOR';
