/**
 * W0-G1-T01: Add-on registry for optional template file packs.
 * Add-ons are template-file-only bundles that extend the core provisioning
 * when explicitly requested via the provisioning request's `addOns` array.
 */

import type { ITemplateFileEntry } from './template-file-manifest.js';

export interface IAddOnDefinition {
  /** Human-readable add-on name. */
  displayName: string;
  /** Template files to upload when this add-on is activated. */
  templateFiles: ITemplateFileEntry[];
  /** Additional SharePoint lists to create (empty for template-file-only add-ons). */
  lists: string[];
}

/**
 * Registry of available add-on packs keyed by slug identifier.
 * Each add-on's `templateFiles` follow the same contract as TEMPLATE_FILE_MANIFEST entries.
 * Actual asset files are G2 scope — upload is a graceful no-op when files are absent.
 */
export const ADD_ON_DEFINITIONS: Record<string, IAddOnDefinition> = {
  'safety-pack': {
    displayName: 'Safety Pack',
    templateFiles: [
      {
        fileName: 'Safety Plan Template.docx',
        targetLibrary: 'Project Documents',
        assetPath: 'add-ons/safety-pack/Safety Plan Template.docx',
      },
    ],
    lists: [],
  },
  'closeout-pack': {
    displayName: 'Close-Out Pack',
    templateFiles: [
      {
        fileName: 'Close-Out Checklist.xlsx',
        targetLibrary: 'Project Documents',
        assetPath: 'add-ons/closeout-pack/Close-Out Checklist.xlsx',
      },
    ],
    lists: [],
  },
};
