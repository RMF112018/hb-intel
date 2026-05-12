/**
 * Phase 08 wave-b13 Prompt 10B — Project Record canonical relative-path
 * manifest + deterministic pure tree builder.
 *
 * The single source of repository truth is `PROJECT_RECORD_RELATIVE_FOLDER_PATHS`
 * — a readonly array of normalized relative path-segment arrays
 * transcribed once from the verified on-disk contents of
 * `docs/reference/example/ComDir/`. The tree is derived via the pure
 * builder `buildProjectRecordExplorerTree`; counts and depth are
 * derived by walking the built tree at module load. No `fs` access,
 * no runtime traversal of the docs reference directory.
 *
 * Deterministic ordering rule: ascending lexicographic on joined path.
 * Applied at the manifest authoring stage (path list is pre-sorted) and
 * preserved by the builder, which also sorts children by displayLabel
 * ascending. This produces a stable, locale-independent traversal order.
 */

import {
  type DocumentExplorerNodePosture,
  type IDocumentExplorerNode,
} from './documentExplorerModel';

/**
 * Canonical Project Record relative folder paths (excluding the
 * `project-record` source root). Pre-sorted ascending lexicographic on
 * joined path for deterministic ordering. Transcribed from a verified
 * `find docs/reference/example/ComDir -mindepth 1 -type d | sort` at
 * Prompt 10B execution time.
 */
export const PROJECT_RECORD_RELATIVE_FOLDER_PATHS: readonly (readonly string[])[] = [
  ['01-Owner'],
  ['01-Owner', 'Insurance'],
  ['03-Engineer'],
  ['04-Permit'],
  ['05-TestingInspect'],
  ['06-Meeting'],
  ['06-Meeting', 'OAC'],
  ['06-Meeting', 'OAC', 'Mtg #01 (07.10.12)'],
  ['07-RFI'],
  ['07-RFI', '001.Description.R'],
  ['07-RFI', '001.Description.R', 'Returned.Date'],
  ['07-RFI', '001.Description.R', 'Sent.Date'],
  ['08-Safety'],
  ['08-Safety', 'Accident Reports'],
  ['08-Safety', 'Tool Box Talks'],
  ['11-Schedule'],
  ['12-Accounting'],
  ['12-Accounting', 'Budget'],
  ['12-Accounting', 'Budget', 'Revision'],
  ['12-Accounting', 'Form'],
  ['12-Accounting', 'LienRelease'],
  ['12-Accounting', 'PayApp'],
  ['12-Accounting', 'PayApp', 'Owner'],
  ['12-Accounting', 'PayApp', 'Owner', 'PA.001.Date'],
  ['12-Accounting', 'PayApp', 'Sub'],
  ['12-Accounting', 'PayApp', 'Sub', 'Progress'],
  ['12-Accounting', 'PayApp', 'Sub', 'Progress', 'PayApp.001'],
  ['13-ChangeOrder'],
  ['13-ChangeOrder', 'COR'],
  ['13-ChangeOrder', 'COR', 'COR.001'],
  ['13-ChangeOrder', 'PCCO'],
  ['13-ChangeOrder', 'PCCO', 'PCCO.001.Discription.E'],
  ['13-ChangeOrder', 'SCO'],
  ['14-Subcontractor'],
  ['14-Subcontractor', 'Div.Sub'],
  ['14-Subcontractor', 'Div.Sub', 'Contract'],
  ['14-Subcontractor', 'Div.Sub', 'Insurance'],
  ['14-Subcontractor', 'Div.Sub', 'PayApp'],
  ['14-Subcontractor', 'Div.Sub', 'SCO'],
  ['14-Subcontractor', 'Exhibit'],
  ['16-DrawSpecPic'],
  ['17-Closeout'],
];

const PROJECT_RECORD_SOURCE_ROOT_ID = 'project-record';
const PROJECT_RECORD_ROOT_NODE_ID = PROJECT_RECORD_SOURCE_ROOT_ID;
const PROJECT_RECORD_DISPLAY_LABEL = 'Project Record';
const PROJECT_RECORD_FOLDER_POSTURE: DocumentExplorerNodePosture = 'read-only';

type MutableNode = {
  nodeId: string;
  displayLabel: string;
  parentId?: string;
  relativePathSegments: readonly string[];
  children: MutableNode[];
};

function buildNodeId(segments: readonly string[]): string {
  return [PROJECT_RECORD_SOURCE_ROOT_ID, ...segments].join('/');
}

/**
 * Deterministic pure tree builder. Reconstructs the Project Record
 * hierarchy from `paths` by inserting each path as a folder chain and
 * deduplicating intermediate ancestors. Sibling order is ascending
 * lexicographic on `displayLabel`.
 *
 * Pure: same input ⇒ same output, no side effects, no time/locale
 * dependence beyond `localeCompare` which is locked to `'en-US'`.
 */
export function buildProjectRecordExplorerTree(
  paths: readonly (readonly string[])[],
): IDocumentExplorerNode {
  const root: MutableNode = {
    nodeId: PROJECT_RECORD_ROOT_NODE_ID,
    displayLabel: PROJECT_RECORD_DISPLAY_LABEL,
    relativePathSegments: [],
    children: [],
  };

  const nodeIndex = new Map<string, MutableNode>();
  nodeIndex.set(root.nodeId, root);

  for (const segments of paths) {
    let parent = root;
    const accumulated: string[] = [];
    for (const segment of segments) {
      accumulated.push(segment);
      const nodeId = buildNodeId(accumulated);
      let node = nodeIndex.get(nodeId);
      if (!node) {
        node = {
          nodeId,
          displayLabel: segment,
          parentId: parent.nodeId,
          relativePathSegments: [...accumulated],
          children: [],
        };
        nodeIndex.set(nodeId, node);
        parent.children.push(node);
      }
      parent = node;
    }
  }

  const sortChildren = (node: MutableNode): void => {
    node.children.sort((a, b) => a.displayLabel.localeCompare(b.displayLabel, 'en-US'));
    for (const child of node.children) sortChildren(child);
  };
  sortChildren(root);

  const freeze = (node: MutableNode, isRoot: boolean): IDocumentExplorerNode => {
    const children = node.children.map((child) => freeze(child, false));
    return {
      nodeId: node.nodeId,
      displayLabel: node.displayLabel,
      sourceId: PROJECT_RECORD_SOURCE_ROOT_ID,
      nodeKind: isRoot ? 'source-root' : 'folder',
      ...(node.parentId !== undefined ? { parentId: node.parentId } : {}),
      relativePathSegments: node.relativePathSegments,
      hasChildren: children.length > 0,
      ...(children.length > 0 ? { children } : {}),
      posture: PROJECT_RECORD_FOLDER_POSTURE,
    };
  };

  return freeze(root, true);
}

export const PROJECT_RECORD_TREE_ROOT: IDocumentExplorerNode = buildProjectRecordExplorerTree(
  PROJECT_RECORD_RELATIVE_FOLDER_PATHS,
);

function walkCount(node: IDocumentExplorerNode): number {
  const children = node.children ?? [];
  return 1 + children.reduce((sum, child) => sum + walkCount(child), 0);
}

function walkMaxDepth(node: IDocumentExplorerNode, currentDepth: number): number {
  const children = node.children ?? [];
  if (children.length === 0) return currentDepth;
  return children.reduce(
    (deepest, child) => Math.max(deepest, walkMaxDepth(child, currentDepth + 1)),
    currentDepth,
  );
}

export const PROJECT_RECORD_TOTAL_NODE_COUNT: number = walkCount(PROJECT_RECORD_TREE_ROOT);
export const PROJECT_RECORD_RELATIVE_NODE_COUNT: number = PROJECT_RECORD_TOTAL_NODE_COUNT - 1;
export const PROJECT_RECORD_MAX_DEPTH: number = walkMaxDepth(PROJECT_RECORD_TREE_ROOT, 0);
