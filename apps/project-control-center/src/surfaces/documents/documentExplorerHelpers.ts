/**
 * Phase 08 wave-b13 Prompt 10B — pure tree-walking helpers for the
 * Documents-surface Explorer.
 *
 * All helpers are deterministic and side-effect-free. They operate over
 * the tree-shaped `IDocumentExplorerNode` graph rooted at the registry
 * entries in `DOCUMENT_EXPLORER_SOURCE_ROOT_NODE_MAP`. Prompt 10B does
 * not implement mounted state retention; that is Prompt 10D scope.
 */

import {
  DOCUMENT_EXPLORER_SOURCE_ROOTS,
  type DocumentExplorerSourceId,
  type IDocumentExplorerBreadcrumbSegment,
  type IDocumentExplorerNode,
} from './documentExplorerModel';
import { DOCUMENT_EXPLORER_SOURCE_ROOT_NODE_MAP } from './documentExplorerSourceRoots';

export function resolveSourceRoot(sourceId: DocumentExplorerSourceId): IDocumentExplorerNode {
  return DOCUMENT_EXPLORER_SOURCE_ROOT_NODE_MAP[sourceId];
}

export function getChildren(node: IDocumentExplorerNode): readonly IDocumentExplorerNode[] {
  return node.children ?? [];
}

export function findNodeByRelativePath(
  root: IDocumentExplorerNode,
  segments: readonly string[],
): IDocumentExplorerNode | undefined {
  let current: IDocumentExplorerNode = root;
  for (const segment of segments) {
    const next = (current.children ?? []).find((child) => child.displayLabel === segment);
    if (!next) return undefined;
    current = next;
  }
  return current;
}

export function hasChildPath(root: IDocumentExplorerNode, segments: readonly string[]): boolean {
  return findNodeByRelativePath(root, segments) !== undefined;
}

export function getParentNode(
  node: IDocumentExplorerNode,
  root: IDocumentExplorerNode,
): IDocumentExplorerNode | undefined {
  if (node.parentId === undefined) return undefined;
  if (node.relativePathSegments.length === 0) return undefined;
  const parentSegments = node.relativePathSegments.slice(0, -1);
  return findNodeByRelativePath(root, parentSegments);
}

export function getBreadcrumbSegments(
  node: IDocumentExplorerNode,
  root: IDocumentExplorerNode,
): readonly IDocumentExplorerBreadcrumbSegment[] {
  const segments: IDocumentExplorerBreadcrumbSegment[] = [
    { label: root.displayLabel, nodeId: root.nodeId, isCurrent: node.nodeId === root.nodeId },
  ];
  let cursor: IDocumentExplorerNode = root;
  for (let i = 0; i < node.relativePathSegments.length; i += 1) {
    const labelAtDepth = node.relativePathSegments[i];
    const next = (cursor.children ?? []).find((child) => child.displayLabel === labelAtDepth);
    if (!next) break;
    cursor = next;
    segments.push({
      label: cursor.displayLabel,
      nodeId: cursor.nodeId,
      isCurrent: cursor.nodeId === node.nodeId,
    });
  }
  return segments;
}

/**
 * Normalize a Project Record relative path input. Accepts either a
 * slash-joined string or a path-segment array. Removes empty segments
 * (consecutive slashes, leading/trailing slash) but does NOT alter
 * label case or punctuation — folder labels are preserved exactly as
 * authored in `PROJECT_RECORD_RELATIVE_FOLDER_PATHS`.
 */
export function normalizeProjectRecordRelativePath(
  input: string | readonly string[],
): readonly string[] {
  const raw = typeof input === 'string' ? input.split('/') : input;
  return raw.map((segment) => segment.trim()).filter((segment) => segment.length > 0);
}

/**
 * Phase 08 wave-b13 Prompt 10D — path-segment-based tree traversal.
 *
 * Walks the tree by matching each `child.relativePathSegments[last]`
 * against the supplied segment. This works for Project Record (where
 * the segment equals the `displayLabel`) AND for Procore categories
 * (where the segment is a stable kebab-case `categoryId` that differs
 * from the user-facing `displayLabel`). The label-based
 * `findNodeByRelativePath` above remains intact for callers that key
 * by display label.
 */
export function findNodeByPathSegments(
  root: IDocumentExplorerNode,
  segments: readonly string[],
): IDocumentExplorerNode | undefined {
  let current: IDocumentExplorerNode = root;
  for (const segment of segments) {
    const next = (current.children ?? []).find((child) => {
      const childSegments = child.relativePathSegments;
      const tail = childSegments[childSegments.length - 1];
      return tail === segment;
    });
    if (!next) return undefined;
    current = next;
  }
  return current;
}

/**
 * Phase 08 wave-b13 Prompt 10D — Explorer-shell-aware breadcrumb
 * builder.
 *
 * Produces the breadcrumb segments visible to the user in the Explorer
 * shell:
 *   - Home segment is always present.
 *   - When `activeSourceId !== 'home'`, a source-root segment follows.
 *   - One segment per path level inside the active source, resolved by
 *     `findNodeByPathSegments`.
 *
 * Each segment's `nodeId` uses the existing Explorer node-id contract
 * already emitted by `IDocumentExplorerNode.nodeId`
 * (`<sourceId>(/<segment1>/<segment2>...)`), so click handlers in the
 * shell can derive both `sourceId` and `currentPath` directly from the
 * `nodeId` without a parallel id schema.
 */
export function buildExplorerBreadcrumb(
  activeSourceId: DocumentExplorerSourceId,
  currentPath: readonly string[],
): readonly IDocumentExplorerBreadcrumbSegment[] {
  const segments: IDocumentExplorerBreadcrumbSegment[] = [
    {
      label: DOCUMENT_EXPLORER_SOURCE_ROOTS.home.label,
      nodeId: 'home',
      isCurrent: activeSourceId === 'home',
    },
  ];
  if (activeSourceId === 'home') return segments;

  const sourceRoot = DOCUMENT_EXPLORER_SOURCE_ROOT_NODE_MAP[activeSourceId];
  segments.push({
    label: sourceRoot.displayLabel,
    nodeId: sourceRoot.nodeId,
    isCurrent: currentPath.length === 0,
  });

  let cursor: IDocumentExplorerNode = sourceRoot;
  for (let i = 0; i < currentPath.length; i += 1) {
    const segment = currentPath[i]!;
    const next = (cursor.children ?? []).find((child) => {
      const childSegments = child.relativePathSegments;
      const tail = childSegments[childSegments.length - 1];
      return tail === segment;
    });
    if (!next) break;
    cursor = next;
    segments.push({
      label: cursor.displayLabel,
      nodeId: cursor.nodeId,
      isCurrent: i === currentPath.length - 1,
    });
  }

  return segments;
}
