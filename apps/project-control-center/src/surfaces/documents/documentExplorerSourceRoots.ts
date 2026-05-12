/**
 * Phase 08 wave-b13 Prompt 10B — unified Explorer source-root node
 * registry.
 *
 * Single composition point: imports the type vocabulary from
 * `documentExplorerModel`, the Project Record tree from
 * `documentExplorerProjectRecordTree`, and the Procore categories from
 * `documentExplorerProcoreCategories`. The model module does not import
 * from either, so this file is the only place where the tree/category
 * dependencies meet — preventing circular imports.
 *
 * Consumers (Prompt 10C–10G shell, helpers, and module-focus mapping)
 * should read `DOCUMENT_EXPLORER_SOURCE_ROOT_NODE_MAP` rather than
 * individual constants when symmetric root handling is needed.
 */

import {
  DOCUMENT_EXPLORER_SOURCE_ROOTS,
  type DocumentExplorerSourceId,
  type IDocumentExplorerNode,
} from './documentExplorerModel';
import { PROJECT_RECORD_TREE_ROOT } from './documentExplorerProjectRecordTree';
import { PROCORE_CATEGORY_DIRECTORY_NODES } from './documentExplorerProcoreCategories';

/**
 * Document Control Home destination shell node. Children are empty in
 * Prompt 10B; Prompt 10C may populate destination tile nodes (Project
 * Record / My Project Files / Procore navigation tiles) as part of the
 * Home UI composition.
 */
export const DOCUMENT_CONTROL_HOME_ROOT_NODE: IDocumentExplorerNode = {
  nodeId: 'home',
  displayLabel: DOCUMENT_EXPLORER_SOURCE_ROOTS.home.label,
  sourceId: 'home',
  nodeKind: 'home',
  relativePathSegments: [],
  hasChildren: false,
  posture: DOCUMENT_EXPLORER_SOURCE_ROOTS.home.posture,
};

/**
 * My Project Files Explorer root. Project-scoped only — no fabricated
 * nested OneDrive directory hierarchy. The existing `documentControlViewModel`
 * MPF safety filter (`isSafeMyProjectFilesEntry` + `ALLOWED_MY_PROJECT_FILES_PATH`)
 * remains the runtime safety boundary for the lane view; this Explorer
 * root simply documents the same boundary at the source-root level.
 */
export const MY_PROJECT_FILES_SOURCE_ROOT_NODE: IDocumentExplorerNode = {
  nodeId: 'my-project-files',
  displayLabel: DOCUMENT_EXPLORER_SOURCE_ROOTS['my-project-files'].label,
  sourceId: 'my-project-files',
  nodeKind: 'source-root',
  relativePathSegments: [],
  hasChildren: false,
  posture: DOCUMENT_EXPLORER_SOURCE_ROOTS['my-project-files'].posture,
};

/**
 * Procore Explorer root with the locked 11 category nodes as children.
 * Linked-record rows under each category are Prompt 10E scope.
 */
export const PROCORE_SOURCE_ROOT_NODE: IDocumentExplorerNode = {
  nodeId: 'procore',
  displayLabel: DOCUMENT_EXPLORER_SOURCE_ROOTS.procore.label,
  sourceId: 'procore',
  nodeKind: 'source-root',
  relativePathSegments: [],
  children: PROCORE_CATEGORY_DIRECTORY_NODES,
  hasChildren: PROCORE_CATEGORY_DIRECTORY_NODES.length > 0,
  posture: DOCUMENT_EXPLORER_SOURCE_ROOTS.procore.posture,
};

export const DOCUMENT_EXPLORER_SOURCE_ROOT_NODE_MAP: Readonly<
  Record<DocumentExplorerSourceId, IDocumentExplorerNode>
> = {
  home: DOCUMENT_CONTROL_HOME_ROOT_NODE,
  'project-record': PROJECT_RECORD_TREE_ROOT,
  'my-project-files': MY_PROJECT_FILES_SOURCE_ROOT_NODE,
  procore: PROCORE_SOURCE_ROOT_NODE,
};
