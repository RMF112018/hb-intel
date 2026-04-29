import {
  DOCUMENT_CONTROL_SOURCES,
  DOCUMENT_CONTROL_SOURCE_IDS,
  type DocumentControlLane,
  type DocumentControlSourceId,
} from '@hbc/models/pcc';

/**
 * View-model helpers ONLY. Lane / action / source-lane-membership taxonomy
 * is canonical in `@hbc/models/pcc/DocumentControl.ts` and is not
 * duplicated app-locally.
 *
 * Iteration uses `DOCUMENT_CONTROL_SOURCE_IDS` (the canonical ordered
 * tuple) so source ordering is deterministic across runtimes and tests.
 */

export function sourceIdsInLane(
  lane: DocumentControlLane,
): readonly DocumentControlSourceId[] {
  return DOCUMENT_CONTROL_SOURCE_IDS.filter((id) => DOCUMENT_CONTROL_SOURCES[id].lane === lane);
}

export function laneDisplayLabel(lane: DocumentControlLane): string {
  switch (lane) {
    case 'microsoft-files':
      return 'Microsoft Files';
    case 'external-document-systems':
      return 'External Document Systems';
  }
}
