/**
 * W0-G1-T01: Core document library definitions for SharePoint site provisioning.
 * Each library is created with versioning enabled during Step 2 of the provisioning saga.
 */

export interface ICoreLibraryDefinition {
  /** SharePoint library display name. */
  name: string;
  /** Whether versioning is enabled on the library. */
  versioning: boolean;
}

/**
 * The three core document libraries provisioned on every HB Intel project site.
 * Order matters: libraries are created sequentially in this order.
 */
export const CORE_LIBRARIES: ICoreLibraryDefinition[] = [
  { name: 'Project Documents', versioning: true },
  { name: 'Drawings', versioning: true },
  { name: 'Specifications', versioning: true },
];

/**
 * Department-specific library pruning model.
 * When a project's department field is set, libraries listed under that department
 * are added to the core set. Libraries not applicable to the department are omitted.
 *
 * Note: Actual pruning logic depends on the `department` field in the provisioning
 * status model, which is G2/T02 scope. This config is defined here so that the
 * pruning rules are centralized alongside core library definitions.
 */
export const DEPARTMENT_LIBRARIES: Record<string, ICoreLibraryDefinition[]> = {
  commercial: [
    { name: 'Bid Documents', versioning: true },
  ],
  'luxury-residential': [
    { name: 'Design Selections', versioning: true },
  ],
};
