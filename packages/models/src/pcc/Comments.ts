/**
 * PCC business comment + history read model.
 *
 * Phase 3 / Wave 1 / Prompt 04. Read-model only: no persistence, no
 * notification fan-out, no moderation logic. Threaded replies are represented
 * by `parentCommentId` linkage; consumers are responsible for tree traversal.
 */

import type { PccProjectId } from './types.js';
import type { PccPersona } from './PccUserRoles.js';

export interface IComment {
  id: string;
  projectId: PccProjectId;
  /** Entity type the comment is anchored to (e.g., 'WorkflowItem', 'ApprovalCheckpoint'). */
  subjectType: string;
  /** Entity identifier the comment is anchored to. */
  subjectId: string;
  authorUpn: string;
  authorPersona?: PccPersona;
  body: string;
  /** ISO 8601 UTC. */
  createdAtUtc: string;
  /** ISO 8601 UTC of the most recent edit, when known. */
  editedAtUtc?: string;
  /** Parent comment id when this comment is a threaded reply. */
  parentCommentId?: string;
  correlationId?: string;
}

export interface ICommentHistoryEntry {
  commentId: string;
  /** Monotonically increasing version starting at 1. */
  version: number;
  body: string;
  editorUpn: string;
  /** ISO 8601 UTC. */
  editedAtUtc: string;
}
