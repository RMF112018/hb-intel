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
