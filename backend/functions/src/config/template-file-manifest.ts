/**
 * W0-G1-T01: Template file manifest for provisioning saga Step 3.
 * Each entry describes a file to be uploaded from the template asset store
 * into the target SharePoint document library on a newly provisioned project site.
 */

export interface ITemplateFileEntry {
  /** File name as it appears in the target library. */
  fileName: string;
  /** Target document library name. Must match a CORE_LIBRARIES entry. */
  targetLibrary: string;
  /** Relative path within the template asset directory (backend/functions/src/assets/templates/). */
  assetPath: string;
}

/**
 * Core template files uploaded to every project site during Step 3.
 * Actual template asset files (.xlsx, .docx) are G2 scope — Step 3 will
 * gracefully skip any entry whose asset file is not yet on disk.
 */
export const TEMPLATE_FILE_MANIFEST: ITemplateFileEntry[] = [
  {
    fileName: 'Project Setup Checklist.xlsx',
    targetLibrary: 'Project Documents',
    assetPath: 'Project Setup Checklist.xlsx',
  },
  {
    fileName: 'Submittal Register Template.xlsx',
    targetLibrary: 'Project Documents',
    assetPath: 'Submittal Register Template.xlsx',
  },
  {
    fileName: 'Meeting Agenda Template.docx',
    targetLibrary: 'Project Documents',
    assetPath: 'Meeting Agenda Template.docx',
  },
  {
    fileName: 'RFI Log Template.xlsx',
    targetLibrary: 'Project Documents',
    assetPath: 'RFI Log Template.xlsx',
  },
  // W0-G2-T02: Startup-family seeded template files
  {
    fileName: 'Estimating Kickoff Template.xlsx',
    targetLibrary: 'Project Documents',
    assetPath: 'Estimating Kickoff Template.xlsx',
  },
  {
    fileName: 'Responsibility Matrix Template.xlsx',
    targetLibrary: 'Project Documents',
    assetPath: 'Responsibility Matrix Template.xlsx',
  },
  {
    fileName: 'Project Management Plan Template.docx',
    targetLibrary: 'Project Documents',
    assetPath: 'Project Management Plan Template.docx',
  },
  {
    fileName: 'Procore Startup Checklist Reference.pdf',
    targetLibrary: 'Project Documents',
    assetPath: 'Procore Startup Checklist Reference.pdf',
  },
  // W0-G2-T03: Closeout-family seeded template files
  {
    fileName: 'Project Closeout Guide.docx',
    targetLibrary: 'Project Documents',
    assetPath: 'Project Closeout Guide.docx',
  },
  {
    fileName: 'Closeout Checklist Reference.pdf',
    targetLibrary: 'Project Documents',
    assetPath: 'Closeout Checklist Reference.pdf',
  },
  // W0-G2-T04: Safety-family seeded template files
  {
    fileName: 'JHA Form Template.docx',
    targetLibrary: 'Project Documents',
    assetPath: 'JHA Form Template.docx',
  },
  {
    fileName: 'JHA Instructions.docx',
    targetLibrary: 'Project Documents',
    assetPath: 'JHA Instructions.docx',
  },
  {
    fileName: 'Incident Report Form.docx',
    targetLibrary: 'Project Documents',
    assetPath: 'Incident Report Form.docx',
  },
  {
    fileName: 'Site Specific Safety Plan Template.docx',
    targetLibrary: 'Project Documents',
    assetPath: 'Site Specific Safety Plan Template.docx',
  },
  // W0-G2-T05: Project-controls-family seeded template files
  {
    fileName: 'Required Inspections Template.xlsx',
    targetLibrary: 'Project Documents',
    assetPath: 'Required Inspections Template.xlsx',
  },
];
