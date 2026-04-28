/**
 * PCC fixture — sample comments and comment history.
 *
 * Deterministic, non-secret. Includes a threaded reply via `parentCommentId`.
 * Phase 3 / Wave 1 / Prompt 06.
 */

import type { IComment, ICommentHistoryEntry } from '../Comments.js';
import type { PccProjectId } from '../types.js';

const projectId = 'fixture-pcc-project-001' as PccProjectId;

export const SAMPLE_COMMENTS: readonly IComment[] = [
  {
    id: 'fixture-cmt-001',
    projectId,
    subjectType: 'WorkflowItem',
    subjectId: 'fixture-wi-001',
    authorUpn: 'pm-sample@example.com',
    authorPersona: 'project-manager',
    body: 'Mobilization is on track for the 5/10 target.',
    createdAtUtc: '2026-04-22T09:00:00Z',
  },
  {
    id: 'fixture-cmt-002',
    projectId,
    subjectType: 'WorkflowItem',
    subjectId: 'fixture-wi-001',
    authorUpn: 'super-sample@example.com',
    authorPersona: 'superintendent',
    body: 'Confirmed; trailer lands Tuesday.',
    createdAtUtc: '2026-04-22T10:30:00Z',
    parentCommentId: 'fixture-cmt-001',
  },
];

export const SAMPLE_COMMENT_HISTORY: readonly ICommentHistoryEntry[] = [
  {
    commentId: 'fixture-cmt-001',
    version: 1,
    body: 'Mobilization on track.',
    editorUpn: 'pm-sample@example.com',
    editedAtUtc: '2026-04-22T09:00:00Z',
  },
  {
    commentId: 'fixture-cmt-001',
    version: 2,
    body: 'Mobilization is on track for the 5/10 target.',
    editorUpn: 'pm-sample@example.com',
    editedAtUtc: '2026-04-22T09:05:00Z',
  },
];
