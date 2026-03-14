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
    { name: 'Commercial Documents', versioning: true },
  ],
  'luxury-residential': [
    { name: 'Luxury Residential Documents', versioning: true },
  ],
};

/**
 * W0-G2-T07: Department-specific folder trees created inside department libraries.
 * Folders are listed in parent-first order so sequential creation works without
 * needing path-segment walking.
 */
export const DEPARTMENT_FOLDER_TREES: Record<string, { libraryName: string; folders: string[] }> = {
  commercial: {
    libraryName: 'Commercial Documents',
    folders: [
      'Owner Files',
      'Owner Files/Contract',
      'Owner Files/Insurance',
      'Owner Files/Notices',
      'Engineering Reports',
      'Engineering Reports/Civil',
      'Engineering Reports/MEP',
      'Engineering Reports/Structural',
      'Engineering Reports/Surveyor',
      'Permits',
      'Permits/HBC Permits',
      'Permits/Sub Permits',
      'Testing and Inspection',
      'Testing and Inspection/Concrete',
      'Testing and Inspection/Soil',
      'Testing and Inspection/Special Inspections',
      'Meetings',
      'Safety',
      'Safety/JHA Forms',
      'Safety/Incident Reports',
      'Schedule',
      'Schedule/CPM',
      'Schedule/3 Week Look Ahead',
      'Accounting',
      'Accounting/Budget',
      'Accounting/Forecast',
      'Accounting/Pay Applications',
      'Change Orders',
      'Change Orders/PCO',
      'Change Orders/PCCO',
      'Subcontractor',
      'Closeout',
      'Closeout/Owner Manual',
      'Closeout/Punchlist',
    ],
  },
  'luxury-residential': {
    libraryName: 'Luxury Residential Documents',
    folders: [
      'Owner Files',
      'Owner Files/Contract',
      'Owner Files/Insurance',
      'Owner Files/Notices',
      'Owner Files/Owner Direct Subcontracts',
      'Engineering Reports',
      'Engineering Reports/Civil',
      'Engineering Reports/MEP',
      'Engineering Reports/Structural',
      'Engineering Reports/Surveyor',
      'Permits',
      'Permits/HBC Permits',
      'Permits/Sub Permits',
      'Testing and Inspection',
      'Testing and Inspection/Concrete',
      'Testing and Inspection/Soil',
      'Testing and Inspection/HVAC',
      'Meetings',
      'Safety',
      'Safety/JHA Forms',
      'Safety/Incident Reports',
      'Schedule',
      'Schedule/CPM',
      'Schedule/3 Week Look Ahead',
      'Accounting',
      'Accounting/Budget',
      'Accounting/Forecast',
      'Accounting/Pay Applications',
      'Change Orders',
      'Change Orders/PCO',
      'Change Orders/PCCO',
      'Subcontractor',
      'Subcontractor/Working Documents',
      'Closeout',
      'Closeout/Owner Manual',
      'Closeout/Punchlist',
      'Closeout/Survey',
    ],
  },
};
