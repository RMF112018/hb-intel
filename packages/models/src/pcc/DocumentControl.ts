/**
 * PCC Document Control Center source registry.
 *
 * The Document Control Center is modeled as a UNIFIED ACCESS HUB for files
 * surfaced from multiple sources, NOT as a document-control management
 * workflow surface. Wave 1 surfaces only the source taxonomy and access
 * posture.
 *
 * Sensitive-library categorization, sync-policy enforcement, retention,
 * archive lifecycle, upload semantics, permissioning, and review/approval
 * behavior are explicitly DEFERRED to later waves.
 */

export const DOCUMENT_CONTROL_SOURCE_IDS = [
  'sharepoint-drive',
  'onedrive',
  'procore-files',
  'document-crunch',
  'adobe-sign',
] as const;

export type DocumentControlSourceId = (typeof DOCUMENT_CONTROL_SOURCE_IDS)[number];

/**
 * `DocumentControlSource` is exported for vocabulary alignment with the
 * Wave 1 prompt package and the contract.
 */
export type DocumentControlSource = DocumentControlSourceId;

export type DocumentControlSourcePosture = 'mvp-required' | 'mvp-optional' | 'conditional';

export type DocumentControlLinkBehavior = 'browse-in-place' | 'launch-link';

export interface IDocumentControlSource {
  id: DocumentControlSourceId;
  displayName: string;
  posture: DocumentControlSourcePosture;
  linkBehavior: DocumentControlLinkBehavior;
  notes?: string;
}

export const DOCUMENT_CONTROL_SOURCES: Readonly<Record<DocumentControlSourceId, IDocumentControlSource>> = {
  'sharepoint-drive': {
    id: 'sharepoint-drive',
    displayName: 'SharePoint Drive',
    posture: 'mvp-required',
    linkBehavior: 'browse-in-place',
  },
  'onedrive': {
    id: 'onedrive',
    displayName: 'OneDrive',
    posture: 'mvp-required',
    linkBehavior: 'browse-in-place',
  },
  'procore-files': {
    id: 'procore-files',
    displayName: 'Procore Files',
    posture: 'mvp-required',
    linkBehavior: 'launch-link',
  },
  'document-crunch': {
    id: 'document-crunch',
    displayName: 'Document Crunch',
    posture: 'conditional',
    linkBehavior: 'launch-link',
  },
  'adobe-sign': {
    id: 'adobe-sign',
    displayName: 'Adobe Sign',
    posture: 'mvp-optional',
    linkBehavior: 'launch-link',
  },
};
