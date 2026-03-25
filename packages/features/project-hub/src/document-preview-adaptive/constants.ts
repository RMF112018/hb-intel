/**
 * P3-J1 E7 document-preview-adaptive constants.
 * Enum arrays, label maps, adaptive behavior matrix, UI kit dependencies, contract & readiness.
 */

import type {
  AdaptiveDeviceMode,
  PreviewCapability,
  PreviewProviderStrategy,
  UiKitAdaptiveDependency,
} from './enums.js';
import type {
  IAdaptiveBehaviorMatrixEntry,
  IPreviewFirstReadinessCheck,
  IPreviewShellContract,
  IUiKitAdaptiveDependencyEntry,
} from './types.js';

// -- Enum Arrays ------------------------------------------------------------------

export const PREVIEW_PROVIDER_STRATEGIES = [
  'ABSTRACT_PROVIDER',
  'NATIVE_OPEN_FALLBACK',
  'EMBEDDED_VIEWER',
  'EXTERNAL_VIEWER',
] as const satisfies ReadonlyArray<PreviewProviderStrategy>;

export const ADAPTIVE_DEVICE_MODES = [
  'DESKTOP',
  'TABLET',
  'FIELD',
] as const satisfies ReadonlyArray<AdaptiveDeviceMode>;

export const PREVIEW_CAPABILITIES = [
  'PREVIEW_SUPPORTED',
  'PREVIEW_UNAVAILABLE',
  'DOWNLOAD_ONLY',
  'METADATA_ONLY',
] as const satisfies ReadonlyArray<PreviewCapability>;

export const UI_KIT_ADAPTIVE_DEPENDENCIES_ENUM = [
  'RESPONSIVE_LAYOUT',
  'TOUCH_TARGET',
  'REDUCED_CHROME',
  'OFFLINE_INDICATOR',
] as const satisfies ReadonlyArray<UiKitAdaptiveDependency>;

// -- Label Maps -------------------------------------------------------------------

export const PREVIEW_PROVIDER_STRATEGY_LABELS: Readonly<Record<PreviewProviderStrategy, string>> = {
  ABSTRACT_PROVIDER: 'Abstract Provider',
  NATIVE_OPEN_FALLBACK: 'Native Open Fallback',
  EMBEDDED_VIEWER: 'Embedded Viewer',
  EXTERNAL_VIEWER: 'External Viewer',
};

export const ADAPTIVE_DEVICE_MODE_LABELS: Readonly<Record<AdaptiveDeviceMode, string>> = {
  DESKTOP: 'Desktop',
  TABLET: 'Tablet',
  FIELD: 'Field',
};

export const PREVIEW_CAPABILITY_LABELS: Readonly<Record<PreviewCapability, string>> = {
  PREVIEW_SUPPORTED: 'Preview Supported',
  PREVIEW_UNAVAILABLE: 'Preview Unavailable',
  DOWNLOAD_ONLY: 'Download Only',
  METADATA_ONLY: 'Metadata Only',
};

// -- Adaptive Behavior Matrix (3 modes x 4 capabilities = 12 rows) ----------------

export const ADAPTIVE_BEHAVIOR_MATRIX: ReadonlyArray<IAdaptiveBehaviorMatrixEntry> = [
  { mode: 'DESKTOP', capability: 'PREVIEW_SUPPORTED', layoutBehavior: 'Full inline preview with side panel', chromeLevel: 'Full chrome' },
  { mode: 'DESKTOP', capability: 'PREVIEW_UNAVAILABLE', layoutBehavior: 'Metadata card with download action', chromeLevel: 'Full chrome' },
  { mode: 'DESKTOP', capability: 'DOWNLOAD_ONLY', layoutBehavior: 'Download prompt with metadata summary', chromeLevel: 'Full chrome' },
  { mode: 'DESKTOP', capability: 'METADATA_ONLY', layoutBehavior: 'Metadata detail view only', chromeLevel: 'Full chrome' },
  { mode: 'TABLET', capability: 'PREVIEW_SUPPORTED', layoutBehavior: 'Responsive inline preview with collapsed panel', chromeLevel: 'Reduced chrome' },
  { mode: 'TABLET', capability: 'PREVIEW_UNAVAILABLE', layoutBehavior: 'Metadata card with touch-friendly download', chromeLevel: 'Reduced chrome' },
  { mode: 'TABLET', capability: 'DOWNLOAD_ONLY', layoutBehavior: 'Touch-optimized download prompt', chromeLevel: 'Reduced chrome' },
  { mode: 'TABLET', capability: 'METADATA_ONLY', layoutBehavior: 'Compact metadata view', chromeLevel: 'Reduced chrome' },
  { mode: 'FIELD', capability: 'PREVIEW_SUPPORTED', layoutBehavior: 'Simplified preview with minimal controls', chromeLevel: 'Minimal chrome' },
  { mode: 'FIELD', capability: 'PREVIEW_UNAVAILABLE', layoutBehavior: 'Offline-aware metadata with cached indicator', chromeLevel: 'Minimal chrome' },
  { mode: 'FIELD', capability: 'DOWNLOAD_ONLY', layoutBehavior: 'Offline queue download action', chromeLevel: 'Minimal chrome' },
  { mode: 'FIELD', capability: 'METADATA_ONLY', layoutBehavior: 'Minimal metadata with offline indicator', chromeLevel: 'Minimal chrome' },
];

// -- UI Kit Adaptive Dependencies --------------------------------------------------

export const UI_KIT_ADAPTIVE_DEPENDENCIES: ReadonlyArray<IUiKitAdaptiveDependencyEntry> = [
  { dependency: 'RESPONSIVE_LAYOUT', description: 'Responsive layout container for adaptive preview shell', uiKitComponentRef: 'ResponsiveContainer', isRequired: true },
  { dependency: 'TOUCH_TARGET', description: 'Touch-friendly target sizing for tablet and field modes', uiKitComponentRef: 'TouchTarget', isRequired: true },
  { dependency: 'REDUCED_CHROME', description: 'Reduced chrome shell variant for constrained viewports', uiKitComponentRef: 'ReducedChromeShell', isRequired: true },
  { dependency: 'OFFLINE_INDICATOR', description: 'Offline status indicator for field mode connectivity awareness', uiKitComponentRef: 'OfflineIndicator', isRequired: true },
];

// -- Preview Shell Contract --------------------------------------------------------

export const PREVIEW_SHELL_CONTRACT: IPreviewShellContract = {
  contractId: 'preview-shell-abstract',
  providerStrategy: 'ABSTRACT_PROVIDER',
  isProviderAbstract: true,
  isNativeOpenFirst: false,
  description: 'Abstract preview shell contract — provider strategy is pluggable, native-open is not the primary path',
};

// -- Preview-First Readiness Check -------------------------------------------------

export const PREVIEW_FIRST_READINESS_CHECK: IPreviewFirstReadinessCheck = {
  checkId: 'preview-first-readiness',
  nativeOpenFirstAssumed: false,
  desktopOnlyAssumed: false,
  previewFirstCanBeIntroduced: true,
  notes: 'Preview-first can be introduced without redesign — provider abstraction and adaptive layout support future preview integration',
};
