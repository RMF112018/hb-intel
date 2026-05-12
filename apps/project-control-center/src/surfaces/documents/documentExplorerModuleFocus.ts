/**
 * Phase 08 wave-b13 Prompt 10B — pure Document Control module-id →
 * Explorer focus target mapping.
 *
 * Provides the deterministic mapping contract that Prompt 10D will
 * consume when it threads `activeModuleId` into the Documents surface.
 * Prompt 10B does NOT call this from any router/shell/surface
 * component; the helper is pure data + a lookup function only.
 */

import { type PccModuleId } from '@hbc/models/pcc';
import { type DocumentExplorerSourceId } from './documentExplorerModel';

export type IDocumentExplorerFocusTarget =
  | {
      readonly kind: 'explorer-source';
      readonly sourceId: DocumentExplorerSourceId;
      readonly initialRelativePath?: readonly string[];
    }
  | {
      readonly kind: 'external-reference';
      readonly moduleId: PccModuleId;
    }
  | {
      readonly kind: 'deferred';
      readonly moduleId: PccModuleId;
    };

/**
 * Locked Prompt 10D mapping. Modules not listed here intentionally
 * return `undefined` so the consumer can fall back to its default
 * surface behavior (e.g., open Document Control Home).
 */
export function resolveExplorerFocusTarget(
  moduleId: PccModuleId,
): IDocumentExplorerFocusTarget | undefined {
  switch (moduleId) {
    case 'primary-documents':
      return { kind: 'explorer-source', sourceId: 'home' };
    case 'document-control-center':
      return { kind: 'explorer-source', sourceId: 'home' };
    case 'sharepoint-project-record':
      return { kind: 'explorer-source', sourceId: 'project-record' };
    case 'my-project-files':
      return { kind: 'explorer-source', sourceId: 'my-project-files' };
    case 'procore-documents':
      return {
        kind: 'explorer-source',
        sourceId: 'procore',
        initialRelativePath: ['documents'],
      };
    case 'document-crunch':
      return { kind: 'external-reference', moduleId: 'document-crunch' };
    case 'adobe-sign':
      return { kind: 'external-reference', moduleId: 'adobe-sign' };
    case 'drawing-model-center':
      return { kind: 'deferred', moduleId: 'drawing-model-center' };
    default:
      return undefined;
  }
}
