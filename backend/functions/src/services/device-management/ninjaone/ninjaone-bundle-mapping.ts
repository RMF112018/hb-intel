/**
 * P9.1-07: NinjaOne bundle mapping — package template to NinjaOne standard mapping.
 *
 * Maps white-glove package families and device platforms to the
 * NinjaOne bundles (policy, software, script, validation) that
 * should be applied during post-enrollment standardization.
 *
 * @module device-management/ninjaone
 */

import { WhiteGlovePackageFamily, WhiteGloveDevicePlatform } from '@hbc/models/admin-control-plane';

// ─── Types ──────────────────────────────────────────────────────────────────

export type NinjaOneBundleType = 'policy' | 'software' | 'script' | 'validation';

export interface INinjaOneBundleRef {
  readonly bundleType: NinjaOneBundleType;
  readonly bundleId: string;
  readonly bundleName: string;
  readonly required: boolean;
}

export interface INinjaOneBundleMapping {
  readonly packageFamily: WhiteGlovePackageFamily;
  readonly platform: WhiteGloveDevicePlatform;
  readonly bundles: readonly INinjaOneBundleRef[];
}

// ─── Code-Default Bundle Mappings ───────────────────────────────────────────

/**
 * Default NinjaOne bundle mappings per package family and device platform.
 *
 * These are code-defined baselines. The governed configuration system
 * may overlay admin-maintained overrides at runtime.
 */
export const DEFAULT_BUNDLE_MAPPINGS: readonly INinjaOneBundleMapping[] = [
  // ── Windows devices (all families) ─────────────────────────────────────
  ...[
    WhiteGlovePackageFamily.VdcPersonnel,
    WhiteGlovePackageFamily.EstimatingPersonnel,
    WhiteGlovePackageFamily.OfficePersonnel,
    WhiteGlovePackageFamily.OperationsManagement,
    WhiteGlovePackageFamily.OperationsFieldStaff,
  ].flatMap((family) =>
    [WhiteGloveDevicePlatform.WindowsDesktop, WhiteGloveDevicePlatform.WindowsLaptop]
      .filter((platform) => {
        // VDC only has WindowsDesktop, Estimating only has WindowsLaptop
        if (family === WhiteGlovePackageFamily.VdcPersonnel && platform === WhiteGloveDevicePlatform.WindowsLaptop) return false;
        if (family === WhiteGlovePackageFamily.EstimatingPersonnel && platform === WhiteGloveDevicePlatform.WindowsDesktop) return false;
        return true;
      })
      .map((platform): INinjaOneBundleMapping => ({
        packageFamily: family,
        platform,
        bundles: [
          { bundleType: 'policy', bundleId: 'n1-win-baseline-policy', bundleName: 'Windows Baseline Policy', required: true },
          { bundleType: 'software', bundleId: 'n1-win-standard-software', bundleName: 'Windows Standard Software Bundle', required: true },
          { bundleType: 'script', bundleId: 'n1-win-post-enroll-config', bundleName: 'Windows Post-Enrollment Configuration', required: true },
          { bundleType: 'validation', bundleId: 'n1-win-validation', bundleName: 'Windows Standardization Validation', required: true },
        ],
      })),
  ),

  // ── macOS devices (Operations Management Alt only) ─────────────────────
  {
    packageFamily: WhiteGlovePackageFamily.OperationsManagementAlt,
    platform: WhiteGloveDevicePlatform.MacOsLaptop,
    bundles: [
      { bundleType: 'policy', bundleId: 'n1-mac-baseline-policy', bundleName: 'macOS Baseline Policy', required: true },
      { bundleType: 'software', bundleId: 'n1-mac-standard-software', bundleName: 'macOS Standard Software Bundle', required: true },
      { bundleType: 'script', bundleId: 'n1-mac-post-enroll-config', bundleName: 'macOS Post-Enrollment Configuration', required: true },
      { bundleType: 'validation', bundleId: 'n1-mac-validation', bundleName: 'macOS Standardization Validation', required: true },
    ],
  },

  // ── iPhone devices (families that include iPhone) ──────────────────────
  ...[
    WhiteGlovePackageFamily.VdcPersonnel,
    WhiteGlovePackageFamily.EstimatingPersonnel,
    WhiteGlovePackageFamily.OperationsManagement,
    WhiteGlovePackageFamily.OperationsManagementAlt,
    WhiteGlovePackageFamily.OperationsFieldStaff,
  ].map((family): INinjaOneBundleMapping => ({
    packageFamily: family,
    platform: WhiteGloveDevicePlatform.IPhone,
    bundles: [
      { bundleType: 'policy', bundleId: 'n1-ios-baseline-policy', bundleName: 'iOS Baseline Policy', required: true },
      { bundleType: 'validation', bundleId: 'n1-ios-validation', bundleName: 'iOS Standardization Validation', required: true },
    ],
  })),

  // ── iPad devices (VDC and Field Staff only) ────────────────────────────
  ...[
    WhiteGlovePackageFamily.VdcPersonnel,
    WhiteGlovePackageFamily.OperationsFieldStaff,
  ].map((family): INinjaOneBundleMapping => ({
    packageFamily: family,
    platform: WhiteGloveDevicePlatform.IPad,
    bundles: [
      { bundleType: 'policy', bundleId: 'n1-ipados-baseline-policy', bundleName: 'iPadOS Baseline Policy', required: true },
      { bundleType: 'validation', bundleId: 'n1-ipados-validation', bundleName: 'iPadOS Standardization Validation', required: true },
    ],
  })),
];

// ─── Resolution ─────────────────────────────────────────────────────────────

/**
 * Resolve the NinjaOne bundles applicable to a specific device.
 *
 * Returns the code-default bundles for the given package family and platform.
 * Returns an empty array if no mapping exists (device does not require
 * NinjaOne standardization).
 */
export function resolveBundlesForDevice(
  packageFamily: WhiteGlovePackageFamily,
  platform: WhiteGloveDevicePlatform,
): readonly INinjaOneBundleRef[] {
  const mapping = DEFAULT_BUNDLE_MAPPINGS.find(
    (m) => m.packageFamily === packageFamily && m.platform === platform,
  );
  return mapping?.bundles ?? [];
}
