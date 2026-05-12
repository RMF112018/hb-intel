/**
 * Phase 08 wave-b13 Prompt 10B — Document Control Explorer model vocabulary.
 *
 * Types-only module. Defines the source-root id union, node-kind union,
 * node interface, breadcrumb segment, and source-root metadata for the
 * Documents-surface Explorer. Tree fixtures, category nodes, and the
 * unified source-root node registry live in sibling files; this module
 * intentionally does not import them to keep the model layer
 * dependency-free and to prevent circular imports.
 *
 * Prompt 10C–10G consume these types. Prompt 10B does not modify any
 * render component, router, or shell file.
 */

export type DocumentExplorerSourceId = 'home' | 'project-record' | 'my-project-files' | 'procore';

export const DOCUMENT_EXPLORER_SOURCE_ID_ORDER: readonly DocumentExplorerSourceId[] = [
  'home',
  'project-record',
  'my-project-files',
  'procore',
];

export type DocumentExplorerNodeKind =
  | 'home'
  | 'source-root'
  | 'folder'
  | 'category'
  | 'linked-record';

export type DocumentExplorerNodePosture = 'read-only' | 'launch-only' | 'preview' | 'deferred';

/**
 * Linked-record reference shape reserved for Prompt 10E. Prompt 10B
 * neither populates nor consumes any node's `linkedRecordRef`; this
 * interface exists so 10E has a stable extension point.
 */
export interface IDocumentExplorerLinkedRecordRef {
  readonly recordKind: string;
}

/**
 * Tree-shaped Explorer node. Children are carried inline on `children`;
 * helpers walk the tree rather than consult a separate index. `parentId`
 * is set on every non-root node so parent navigation is O(1) when the
 * tree root is available.
 */
export interface IDocumentExplorerNode {
  readonly nodeId: string;
  readonly displayLabel: string;
  readonly sourceId: DocumentExplorerSourceId;
  readonly nodeKind: DocumentExplorerNodeKind;
  readonly parentId?: string;
  readonly relativePathSegments: readonly string[];
  readonly children?: readonly IDocumentExplorerNode[];
  readonly hasChildren: boolean;
  readonly posture: DocumentExplorerNodePosture;
  readonly disabledReason?: string;
  readonly linkedRecordRef?: IDocumentExplorerLinkedRecordRef;
}

export interface IDocumentExplorerBreadcrumbSegment {
  readonly label: string;
  readonly nodeId: string;
  readonly isCurrent: boolean;
}

export interface IDocumentExplorerSourceRootMetadata {
  readonly id: DocumentExplorerSourceId;
  readonly label: string;
  readonly summary: string;
  readonly posture: DocumentExplorerNodePosture;
  readonly authorityCue: string;
  readonly guardrailCopy?: string;
}

/**
 * User-facing source-root metadata. UI copy, not data. Co-located with
 * the source-id union so the metadata table is exhaustive at compile
 * time.
 */
export const DOCUMENT_EXPLORER_SOURCE_ROOTS: Readonly<
  Record<DocumentExplorerSourceId, IDocumentExplorerSourceRootMetadata>
> = {
  home: {
    id: 'home',
    label: 'Document Control Home',
    summary:
      'Neutral landing for Document Control. Choose Project Record, My Project Files, or Procore to browse project files.',
    posture: 'preview',
    authorityCue:
      'Context only. PCC does not write back to SharePoint, OneDrive, or external systems from this surface.',
  },
  'project-record': {
    id: 'project-record',
    label: 'Project Record',
    summary:
      'Formal project files in the SharePoint project-site libraries. Read-only project view; document actions are managed in SharePoint.',
    posture: 'read-only',
    authorityCue:
      'SharePoint-backed reference. No SharePoint writeback is performed from this surface.',
  },
  'my-project-files': {
    id: 'my-project-files',
    label: 'My Project Files',
    summary:
      'Project-scoped working files in the current user’s Microsoft 365 file space. Working files are not part of the formal project record unless submitted to Project Record.',
    posture: 'read-only',
    authorityCue: 'OneDrive-backed view. No OneDrive writeback is performed from this surface.',
    guardrailCopy:
      'My Project Files is project-scoped only. PCC does not browse the full OneDrive root or other-project folders.',
  },
  procore: {
    id: 'procore',
    label: 'Procore',
    summary:
      'Procore project records grouped by category. Launch-only / deep-link visibility — PCC does not write back to Procore.',
    posture: 'launch-only',
    authorityCue:
      'Opens or references Procore. PCC does not mirror, sync, or write back to Procore.',
  },
};
