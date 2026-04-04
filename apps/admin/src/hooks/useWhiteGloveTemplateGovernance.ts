/**
 * P9.1-11: Hook for white-glove package template governance.
 *
 * Provides access to code-default package templates, NinjaOne bundle
 * mappings, and governance classification per attribute.
 */

import { useState, useMemo, useCallback } from 'react';
import {
  WhiteGlovePackageFamily,
  WHITE_GLOVE_PACKAGE_CATALOG,
  WhiteGloveTemplateAttributeGovernance,
} from '@hbc/models';
import type { IWhiteGlovePackageTemplate, IWhiteGloveDeviceSlot } from '@hbc/models';

/** Governance classification for a template attribute. */
export interface IAttributeGovernance {
  readonly field: string;
  readonly label: string;
  readonly governance: WhiteGloveTemplateAttributeGovernance;
  readonly editable: boolean;
}

/** Template governance attribute map. */
export const TEMPLATE_ATTRIBUTE_GOVERNANCE: readonly IAttributeGovernance[] = [
  { field: 'packageFamily', label: 'Package Family', governance: WhiteGloveTemplateAttributeGovernance.CodeDefined, editable: false },
  { field: 'deviceSlots[].platform', label: 'Device Platform', governance: WhiteGloveTemplateAttributeGovernance.CodeDefined, editable: false },
  { field: 'deviceSlots[].enrollmentAuthority', label: 'Enrollment Authority', governance: WhiteGloveTemplateAttributeGovernance.CodeDefined, editable: false },
  { field: 'deviceSlots[].allowedManufacturers', label: 'Allowed Manufacturers', governance: WhiteGloveTemplateAttributeGovernance.GovernedOverride, editable: true },
  { field: 'deviceSlots[].label', label: 'Device Label', governance: WhiteGloveTemplateAttributeGovernance.GovernedOverride, editable: true },
  { field: 'deviceSlots[].requiresNinjaOneStandardization', label: 'NinjaOne Standardization', governance: WhiteGloveTemplateAttributeGovernance.GovernedOverride, editable: true },
  { field: 'version', label: 'Version', governance: WhiteGloveTemplateAttributeGovernance.DerivedAtRuntime, editable: false },
  { field: 'source', label: 'Source', governance: WhiteGloveTemplateAttributeGovernance.DerivedAtRuntime, editable: false },
  { field: 'effectiveAt', label: 'Effective Date', governance: WhiteGloveTemplateAttributeGovernance.DerivedAtRuntime, editable: false },
];

export interface INinjaOneBundleInfo {
  readonly bundleType: string;
  readonly bundleId: string;
  readonly bundleName: string;
  readonly required: boolean;
}

export interface UseWhiteGloveTemplateGovernanceResult {
  readonly templates: readonly IWhiteGlovePackageTemplate[];
  readonly families: readonly WhiteGlovePackageFamily[];
  readonly selectedFamily: WhiteGlovePackageFamily | null;
  readonly selectedTemplate: IWhiteGlovePackageTemplate | null;
  readonly selectFamily: (family: WhiteGlovePackageFamily) => void;
  readonly attributeGovernance: readonly IAttributeGovernance[];
  readonly getBundlesForSlot: (slot: IWhiteGloveDeviceSlot) => readonly INinjaOneBundleInfo[];
}

export function useWhiteGloveTemplateGovernance(): UseWhiteGloveTemplateGovernanceResult {
  const [selectedFamily, setSelectedFamily] = useState<WhiteGlovePackageFamily | null>(null);

  const families = useMemo(() => Object.values(WhiteGlovePackageFamily), []);
  const templates = useMemo(() => families.map((f) => WHITE_GLOVE_PACKAGE_CATALOG[f]), [families]);

  const selectedTemplate = useMemo(
    () => (selectedFamily ? WHITE_GLOVE_PACKAGE_CATALOG[selectedFamily] : null),
    [selectedFamily],
  );

  const selectFamily = useCallback((family: WhiteGlovePackageFamily) => {
    setSelectedFamily(family);
  }, []);

  const getBundlesForSlot = useCallback(
    (slot: IWhiteGloveDeviceSlot): readonly INinjaOneBundleInfo[] => {
      if (!selectedFamily) return [];
      // Use the package catalog directly — bundles are resolved by family + platform
      // In a real implementation this would call resolveBundlesForDevice from the backend
      // For now, return a placeholder based on platform
      const platformBundles: INinjaOneBundleInfo[] = [];
      const isDesktop = slot.platform === 'windows-desktop' || slot.platform === 'windows-laptop' || slot.platform === 'macos-laptop';
      const prefix = slot.platform.startsWith('windows') ? 'win' : slot.platform === 'macos-laptop' ? 'mac' : slot.platform === 'iphone' ? 'ios' : 'ipados';

      platformBundles.push({ bundleType: 'policy', bundleId: `n1-${prefix}-baseline-policy`, bundleName: `${prefix.toUpperCase()} Baseline Policy`, required: true });
      if (isDesktop) {
        platformBundles.push({ bundleType: 'software', bundleId: `n1-${prefix}-standard-software`, bundleName: `${prefix.toUpperCase()} Standard Software`, required: true });
        platformBundles.push({ bundleType: 'script', bundleId: `n1-${prefix}-post-enroll-config`, bundleName: `${prefix.toUpperCase()} Post-Enrollment Config`, required: true });
      }
      platformBundles.push({ bundleType: 'validation', bundleId: `n1-${prefix}-validation`, bundleName: `${prefix.toUpperCase()} Validation`, required: true });

      return platformBundles;
    },
    [selectedFamily],
  );

  return {
    templates,
    families,
    selectedFamily,
    selectedTemplate,
    selectFamily,
    attributeGovernance: TEMPLATE_ATTRIBUTE_GOVERNANCE,
    getBundlesForSlot,
  };
}
