import { describe, expect, it } from 'vitest';
import {
  resolveResumeDecision,
  buildResumeContext,
} from '../config/resumeDecision.js';

describe('resolveResumeDecision', () => {
  it('new-request with draft → prompt-user', () => {
    expect(resolveResumeDecision('new-request', true)).toBe('prompt-user');
  });

  it('new-request without draft → fresh-start', () => {
    expect(resolveResumeDecision('new-request', false)).toBe('fresh-start');
  });

  it('clarification-return with draft → auto-continue', () => {
    expect(resolveResumeDecision('clarification-return', true)).toBe('auto-continue');
  });

  it('clarification-return without draft → auto-continue', () => {
    expect(resolveResumeDecision('clarification-return', false)).toBe('auto-continue');
  });

  it('controller-review with draft → auto-continue', () => {
    expect(resolveResumeDecision('controller-review', true)).toBe('auto-continue');
  });

  it('controller-review without draft → auto-continue', () => {
    expect(resolveResumeDecision('controller-review', false)).toBe('auto-continue');
  });
});

describe('buildResumeContext', () => {
  it('extracts lastSavedAt from draft', () => {
    const draft = { lastSavedAt: '2026-03-14T12:00:00Z', foo: 'bar' };
    const ctx = buildResumeContext('new-request', draft);
    expect(ctx.mode).toBe('new-request');
    expect(ctx.existingDraft).toBe(draft);
    expect(ctx.decision).toBe('prompt-user');
    expect(ctx.draftTimestamp).toBe('2026-03-14T12:00:00Z');
  });

  it('returns null draftTimestamp when draft is null', () => {
    const ctx = buildResumeContext('new-request', null);
    expect(ctx.existingDraft).toBeNull();
    expect(ctx.decision).toBe('fresh-start');
    expect(ctx.draftTimestamp).toBeNull();
  });

  it('uses auto-continue for clarification-return with draft', () => {
    const draft = { lastSavedAt: '2026-03-14T10:00:00Z' };
    const ctx = buildResumeContext('clarification-return', draft);
    expect(ctx.decision).toBe('auto-continue');
    expect(ctx.draftTimestamp).toBe('2026-03-14T10:00:00Z');
  });

  it('uses auto-continue for controller-review with null draft', () => {
    const ctx = buildResumeContext('controller-review', null);
    expect(ctx.decision).toBe('auto-continue');
    expect(ctx.draftTimestamp).toBeNull();
  });
});
