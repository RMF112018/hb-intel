import { describe, it, expect } from 'vitest';
import type { IComment, ICommentHistoryEntry } from './Comments.js';
import type { PccProjectId } from './types.js';

const projectId = 'proj-001' as PccProjectId;

describe('PCC comments', () => {
  it('IComment shape supports threading via parentCommentId', () => {
    const root: IComment = {
      id: 'c-1',
      projectId,
      subjectType: 'WorkflowItem',
      subjectId: 'wi-1',
      authorUpn: 'pm@example.com',
      authorPersona: 'project-manager',
      body: 'Initial review note',
      createdAtUtc: '2026-04-28T12:00:00Z',
    };
    const reply: IComment = {
      id: 'c-2',
      projectId,
      subjectType: 'WorkflowItem',
      subjectId: 'wi-1',
      authorUpn: 'super@example.com',
      authorPersona: 'superintendent',
      body: 'Acknowledged',
      createdAtUtc: '2026-04-28T12:05:00Z',
      parentCommentId: 'c-1',
    };
    expect(root.id).toBe('c-1');
    expect(reply.parentCommentId).toBe('c-1');
  });

  it('ICommentHistoryEntry version is monotonic and body editable', () => {
    const v1: ICommentHistoryEntry = {
      commentId: 'c-1',
      version: 1,
      body: 'Initial review note',
      editorUpn: 'pm@example.com',
      editedAtUtc: '2026-04-28T12:00:00Z',
    };
    const v2: ICommentHistoryEntry = {
      commentId: 'c-1',
      version: 2,
      body: 'Initial review note (clarified)',
      editorUpn: 'pm@example.com',
      editedAtUtc: '2026-04-28T12:30:00Z',
    };
    expect(v1.version).toBe(1);
    expect(v2.version).toBeGreaterThan(v1.version);
    expect(v2.body).not.toBe(v1.body);
  });

  it('IComment shape has no persistence/sync fields', () => {
    const c: IComment = {
      id: 'c-1',
      projectId,
      subjectType: 'WorkflowItem',
      subjectId: 'wi-1',
      authorUpn: 'pm@example.com',
      body: 'note',
      createdAtUtc: '2026-04-28T12:00:00Z',
    };
    const keys = Object.keys(c);
    const forbidden = ['payload', 'storage', 'syncStatus', 'mirrorState', 'writeback'];
    for (const f of forbidden) {
      expect(keys).not.toContain(f);
    }
  });
});
