/**
 * P3-J1 E7 document-preview-adaptive contract and business-rule tests.
 */
import { describe, expect, it } from 'vitest';

import {
  // Enum arrays
  PREVIEW_PROVIDER_STRATEGIES,
  ADAPTIVE_DEVICE_MODES,
  PREVIEW_CAPABILITIES,
  UI_KIT_ADAPTIVE_DEPENDENCIES_ENUM,
  // Label maps
  PREVIEW_PROVIDER_STRATEGY_LABELS,
  ADAPTIVE_DEVICE_MODE_LABELS,
  PREVIEW_CAPABILITY_LABELS,
  // Contracts & constants
  ADAPTIVE_BEHAVIOR_MATRIX,
  UI_KIT_ADAPTIVE_DEPENDENCIES,
  PREVIEW_SHELL_CONTRACT,
  PREVIEW_FIRST_READINESS_CHECK,
  // Business rules
  isNativeOpenFirstAssumed,
  isDesktopOnlyAssumed,
  canFuturePreviewFirstBeIntroducedWithoutRedesign,
  isPreviewProviderAbstract,
  getAdaptiveBehavior,
  getUiKitDependencies,
  isPreviewAvailableForMode,
  isFieldModeSupported,
  // Types (compile-time checks)
  type IPreviewShellContract,
  type IAdaptiveBehaviorMatrixEntry,
  type IUiKitAdaptiveDependencyEntry,
  type IPreviewFirstReadinessCheck,
} from '../index.js';

// -- Contract stability -----------------------------------------------------------

describe('document-preview-adaptive contract stability', () => {
  it('PREVIEW_PROVIDER_STRATEGIES has 4 members', () => {
    expect(PREVIEW_PROVIDER_STRATEGIES).toHaveLength(4);
  });

  it('ADAPTIVE_DEVICE_MODES has 3 members', () => {
    expect(ADAPTIVE_DEVICE_MODES).toHaveLength(3);
  });

  it('PREVIEW_CAPABILITIES has 4 members', () => {
    expect(PREVIEW_CAPABILITIES).toHaveLength(4);
  });

  it('UI_KIT_ADAPTIVE_DEPENDENCIES_ENUM has 4 members', () => {
    expect(UI_KIT_ADAPTIVE_DEPENDENCIES_ENUM).toHaveLength(4);
  });

  it('PREVIEW_PROVIDER_STRATEGY_LABELS has 4 keys', () => {
    expect(Object.keys(PREVIEW_PROVIDER_STRATEGY_LABELS)).toHaveLength(4);
  });

  it('ADAPTIVE_DEVICE_MODE_LABELS has 3 keys', () => {
    expect(Object.keys(ADAPTIVE_DEVICE_MODE_LABELS)).toHaveLength(3);
  });

  it('PREVIEW_CAPABILITY_LABELS has 4 keys', () => {
    expect(Object.keys(PREVIEW_CAPABILITY_LABELS)).toHaveLength(4);
  });

  it('ADAPTIVE_BEHAVIOR_MATRIX has 12 entries (3 modes x 4 capabilities)', () => {
    expect(ADAPTIVE_BEHAVIOR_MATRIX).toHaveLength(12);
  });

  it('ADAPTIVE_BEHAVIOR_MATRIX covers all DESKTOP combinations', () => {
    const desktopEntries = ADAPTIVE_BEHAVIOR_MATRIX.filter((e) => e.mode === 'DESKTOP');
    expect(desktopEntries).toHaveLength(4);
  });

  it('ADAPTIVE_BEHAVIOR_MATRIX covers all TABLET combinations', () => {
    const tabletEntries = ADAPTIVE_BEHAVIOR_MATRIX.filter((e) => e.mode === 'TABLET');
    expect(tabletEntries).toHaveLength(4);
  });

  it('ADAPTIVE_BEHAVIOR_MATRIX covers all FIELD combinations', () => {
    const fieldEntries = ADAPTIVE_BEHAVIOR_MATRIX.filter((e) => e.mode === 'FIELD');
    expect(fieldEntries).toHaveLength(4);
  });

  it('ADAPTIVE_BEHAVIOR_MATRIX DESKTOP entries use Full chrome', () => {
    const desktopEntries = ADAPTIVE_BEHAVIOR_MATRIX.filter((e) => e.mode === 'DESKTOP');
    expect(desktopEntries.every((e) => e.chromeLevel === 'Full chrome')).toBe(true);
  });

  it('ADAPTIVE_BEHAVIOR_MATRIX TABLET entries use Reduced chrome', () => {
    const tabletEntries = ADAPTIVE_BEHAVIOR_MATRIX.filter((e) => e.mode === 'TABLET');
    expect(tabletEntries.every((e) => e.chromeLevel === 'Reduced chrome')).toBe(true);
  });

  it('ADAPTIVE_BEHAVIOR_MATRIX FIELD entries use Minimal chrome', () => {
    const fieldEntries = ADAPTIVE_BEHAVIOR_MATRIX.filter((e) => e.mode === 'FIELD');
    expect(fieldEntries.every((e) => e.chromeLevel === 'Minimal chrome')).toBe(true);
  });

  it('ADAPTIVE_BEHAVIOR_MATRIX covers all 4 capabilities for each mode', () => {
    for (const mode of ADAPTIVE_DEVICE_MODES) {
      const entries = ADAPTIVE_BEHAVIOR_MATRIX.filter((e) => e.mode === mode);
      const capabilities = entries.map((e) => e.capability);
      expect(capabilities).toEqual(expect.arrayContaining([...PREVIEW_CAPABILITIES]));
    }
  });

  it('UI_KIT_ADAPTIVE_DEPENDENCIES has 4 entries', () => {
    expect(UI_KIT_ADAPTIVE_DEPENDENCIES).toHaveLength(4);
  });

  it('all UI_KIT_ADAPTIVE_DEPENDENCIES are required', () => {
    expect(UI_KIT_ADAPTIVE_DEPENDENCIES.every((d) => d.isRequired)).toBe(true);
  });

  it('each UI_KIT_ADAPTIVE_DEPENDENCIES entry has a non-empty uiKitComponentRef', () => {
    expect(UI_KIT_ADAPTIVE_DEPENDENCIES.every((d) => d.uiKitComponentRef.length > 0)).toBe(true);
  });

  it('each UI_KIT_ADAPTIVE_DEPENDENCIES entry has a non-empty description', () => {
    expect(UI_KIT_ADAPTIVE_DEPENDENCIES.every((d) => d.description.length > 0)).toBe(true);
  });

  it('PREVIEW_SHELL_CONTRACT has isProviderAbstract true', () => {
    expect(PREVIEW_SHELL_CONTRACT.isProviderAbstract).toBe(true);
  });

  it('PREVIEW_SHELL_CONTRACT has isNativeOpenFirst false', () => {
    expect(PREVIEW_SHELL_CONTRACT.isNativeOpenFirst).toBe(false);
  });

  it('PREVIEW_FIRST_READINESS_CHECK has nativeOpenFirstAssumed false', () => {
    expect(PREVIEW_FIRST_READINESS_CHECK.nativeOpenFirstAssumed).toBe(false);
  });

  it('PREVIEW_FIRST_READINESS_CHECK has desktopOnlyAssumed false', () => {
    expect(PREVIEW_FIRST_READINESS_CHECK.desktopOnlyAssumed).toBe(false);
  });

  it('PREVIEW_FIRST_READINESS_CHECK has previewFirstCanBeIntroduced true', () => {
    expect(PREVIEW_FIRST_READINESS_CHECK.previewFirstCanBeIntroduced).toBe(true);
  });

  // Type-level compile checks (no runtime assertion needed)
  it('type contracts compile correctly', () => {
    const _shellContract: IPreviewShellContract = PREVIEW_SHELL_CONTRACT;
    const _matrixEntry: IAdaptiveBehaviorMatrixEntry = ADAPTIVE_BEHAVIOR_MATRIX[0]!;
    const _depEntry: IUiKitAdaptiveDependencyEntry = UI_KIT_ADAPTIVE_DEPENDENCIES[0]!;
    const _readinessCheck: IPreviewFirstReadinessCheck = PREVIEW_FIRST_READINESS_CHECK;

    expect(_shellContract).toBeDefined();
    expect(_matrixEntry).toBeDefined();
    expect(_depEntry).toBeDefined();
    expect(_readinessCheck).toBeDefined();
  });
});

// -- Business rules ---------------------------------------------------------------

describe('document-preview-adaptive business rules', () => {
  describe('isNativeOpenFirstAssumed', () => {
    it('returns false', () => {
      expect(isNativeOpenFirstAssumed()).toBe(false);
    });
  });

  describe('isDesktopOnlyAssumed', () => {
    it('returns false', () => {
      expect(isDesktopOnlyAssumed()).toBe(false);
    });
  });

  describe('canFuturePreviewFirstBeIntroducedWithoutRedesign', () => {
    it('returns true', () => {
      expect(canFuturePreviewFirstBeIntroducedWithoutRedesign()).toBe(true);
    });
  });

  describe('isPreviewProviderAbstract', () => {
    it('returns true', () => {
      expect(isPreviewProviderAbstract()).toBe(true);
    });
  });

  describe('getAdaptiveBehavior', () => {
    it('returns entry for DESKTOP + PREVIEW_SUPPORTED', () => {
      const entry = getAdaptiveBehavior('DESKTOP', 'PREVIEW_SUPPORTED');
      expect(entry).not.toBeNull();
      expect(entry?.mode).toBe('DESKTOP');
      expect(entry?.capability).toBe('PREVIEW_SUPPORTED');
    });

    it('returns entry for TABLET + DOWNLOAD_ONLY', () => {
      const entry = getAdaptiveBehavior('TABLET', 'DOWNLOAD_ONLY');
      expect(entry).not.toBeNull();
      expect(entry?.mode).toBe('TABLET');
      expect(entry?.capability).toBe('DOWNLOAD_ONLY');
    });

    it('returns entry for FIELD + METADATA_ONLY', () => {
      const entry = getAdaptiveBehavior('FIELD', 'METADATA_ONLY');
      expect(entry).not.toBeNull();
      expect(entry?.mode).toBe('FIELD');
      expect(entry?.capability).toBe('METADATA_ONLY');
    });

    it('returns null for unknown combination', () => {
      expect(getAdaptiveBehavior('UNKNOWN' as never, 'PREVIEW_SUPPORTED')).toBeNull();
    });
  });

  describe('getUiKitDependencies', () => {
    it('returns all 4 dependencies', () => {
      expect(getUiKitDependencies()).toHaveLength(4);
    });

    it('returns the same reference as UI_KIT_ADAPTIVE_DEPENDENCIES', () => {
      expect(getUiKitDependencies()).toBe(UI_KIT_ADAPTIVE_DEPENDENCIES);
    });
  });

  describe('isPreviewAvailableForMode', () => {
    it('returns true for DESKTOP', () => {
      expect(isPreviewAvailableForMode('DESKTOP')).toBe(true);
    });

    it('returns true for TABLET', () => {
      expect(isPreviewAvailableForMode('TABLET')).toBe(true);
    });

    it('returns true for FIELD', () => {
      expect(isPreviewAvailableForMode('FIELD')).toBe(true);
    });
  });

  describe('isFieldModeSupported', () => {
    it('returns true', () => {
      expect(isFieldModeSupported()).toBe(true);
    });
  });
});
