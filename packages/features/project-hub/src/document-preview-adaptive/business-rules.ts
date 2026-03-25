/**
 * P3-J1 E7 document-preview-adaptive business rules.
 * Preview strategy invariants, adaptive behavior lookups, readiness checks.
 */

import type { AdaptiveDeviceMode, PreviewCapability } from './enums.js';
import type { IAdaptiveBehaviorMatrixEntry, IUiKitAdaptiveDependencyEntry } from './types.js';
import { ADAPTIVE_BEHAVIOR_MATRIX, UI_KIT_ADAPTIVE_DEPENDENCIES } from './constants.js';

export const isNativeOpenFirstAssumed = (): false => false;

export const isDesktopOnlyAssumed = (): false => false;

export const canFuturePreviewFirstBeIntroducedWithoutRedesign = (): true => true;

export const isPreviewProviderAbstract = (): true => true;

export const getAdaptiveBehavior = (
  mode: AdaptiveDeviceMode,
  capability: PreviewCapability,
): IAdaptiveBehaviorMatrixEntry | null =>
  ADAPTIVE_BEHAVIOR_MATRIX.find((entry) => entry.mode === mode && entry.capability === capability) ?? null;

export const getUiKitDependencies = (): ReadonlyArray<IUiKitAdaptiveDependencyEntry> =>
  UI_KIT_ADAPTIVE_DEPENDENCIES;

export const isPreviewAvailableForMode = (_mode: AdaptiveDeviceMode): boolean => true;

export const isFieldModeSupported = (): true => true;
