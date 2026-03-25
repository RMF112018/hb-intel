/**
 * P3-J1 E7 document-preview-adaptive TypeScript contracts.
 * Preview shell contract, adaptive behavior matrix, UI kit dependencies, readiness checks.
 */

import type { AdaptiveDeviceMode, PreviewCapability, UiKitAdaptiveDependency } from './enums.js';

export interface IPreviewShellContract {
  readonly contractId: string;
  readonly providerStrategy: string;
  readonly isProviderAbstract: true;
  readonly isNativeOpenFirst: false;
  readonly description: string;
}

export interface IAdaptiveBehaviorMatrixEntry {
  readonly mode: AdaptiveDeviceMode;
  readonly capability: PreviewCapability;
  readonly layoutBehavior: string;
  readonly chromeLevel: string;
}

export interface IUiKitAdaptiveDependencyEntry {
  readonly dependency: UiKitAdaptiveDependency;
  readonly description: string;
  readonly uiKitComponentRef: string;
  readonly isRequired: boolean;
}

export interface IPreviewFirstReadinessCheck {
  readonly checkId: string;
  readonly nativeOpenFirstAssumed: false;
  readonly desktopOnlyAssumed: false;
  readonly previewFirstCanBeIntroduced: true;
  readonly notes: string;
}
