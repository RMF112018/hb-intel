import { describe, it, expect } from 'vitest';
import { createPublishRequest, transitionPublishState, VALID_PUBLISH_TRANSITIONS, evaluateReadiness } from './lifecycle.js';

const fixedNow = new Date('2026-03-23T14:00:00.000Z');

describe('createPublishRequest', () => {
  it('creates request in draft state', () => {
    const r = createPublishRequest({ sourceModuleKey: 'fin', sourceRecordId: 'r1', requestedByUserId: 'u@e.com', targets: [] }, fixedNow);
    expect(r.state).toBe('draft');
    expect(r.publishRequestId).toBeTruthy();
  });
  it('throws on missing sourceModuleKey', () => { expect(() => createPublishRequest({ sourceModuleKey: '', sourceRecordId: 'r1', requestedByUserId: 'u', targets: [] })).toThrow('sourceModuleKey'); });
  it('throws on missing sourceRecordId', () => { expect(() => createPublishRequest({ sourceModuleKey: 'f', sourceRecordId: '', requestedByUserId: 'u', targets: [] })).toThrow('sourceRecordId'); });
  it('throws on missing requestedByUserId', () => { expect(() => createPublishRequest({ sourceModuleKey: 'f', sourceRecordId: 'r', requestedByUserId: '', targets: [] })).toThrow('requestedByUserId'); });
  it('uses current time when now not provided', () => {
    const r = createPublishRequest({ sourceModuleKey: 'f', sourceRecordId: 'r', requestedByUserId: 'u', targets: [] });
    expect(new Date(r.createdAtIso).getTime()).toBeGreaterThan(0);
  });
});

describe('transitionPublishState', () => {
  it('transitions draft → ready-for-review', () => {
    const r = createPublishRequest({ sourceModuleKey: 'f', sourceRecordId: 'r', requestedByUserId: 'u', targets: [] }, fixedNow);
    const next = transitionPublishState(r, 'ready-for-review', fixedNow);
    expect(next.state).toBe('ready-for-review');
  });
  it('transitions through full lifecycle', () => {
    let r = createPublishRequest({ sourceModuleKey: 'f', sourceRecordId: 'r', requestedByUserId: 'u', targets: [] }, fixedNow);
    r = transitionPublishState(r, 'ready-for-review', fixedNow);
    r = transitionPublishState(r, 'approved-for-publish', fixedNow);
    r = transitionPublishState(r, 'publishing', fixedNow);
    r = transitionPublishState(r, 'published', fixedNow);
    expect(r.state).toBe('published');
  });
  it('throws on invalid transition', () => {
    const r = createPublishRequest({ sourceModuleKey: 'f', sourceRecordId: 'r', requestedByUserId: 'u', targets: [] }, fixedNow);
    expect(() => transitionPublishState(r, 'published')).toThrow('invalid transition');
  });
  it('allows supersession from published', () => {
    let r = createPublishRequest({ sourceModuleKey: 'f', sourceRecordId: 'r', requestedByUserId: 'u', targets: [] }, fixedNow);
    r = transitionPublishState(r, 'ready-for-review', fixedNow);
    r = transitionPublishState(r, 'approved-for-publish', fixedNow);
    r = transitionPublishState(r, 'publishing', fixedNow);
    r = transitionPublishState(r, 'published', fixedNow);
    r = transitionPublishState(r, 'superseded', fixedNow);
    expect(r.state).toBe('superseded');
  });
  it('allows failed from draft', () => {
    const r = createPublishRequest({ sourceModuleKey: 'f', sourceRecordId: 'r', requestedByUserId: 'u', targets: [] }, fixedNow);
    expect(transitionPublishState(r, 'failed', fixedNow).state).toBe('failed');
  });
  it('uses current time when now not provided', () => {
    const r = createPublishRequest({ sourceModuleKey: 'f', sourceRecordId: 'r', requestedByUserId: 'u', targets: [] }, fixedNow);
    const next = transitionPublishState(r, 'ready-for-review');
    expect(new Date(next.updatedAtIso).getTime()).toBeGreaterThan(0);
  });
  it('throws with none for terminal state transitions', () => {
    let r = createPublishRequest({ sourceModuleKey: 'f', sourceRecordId: 'r', requestedByUserId: 'u', targets: [] }, fixedNow);
    r = transitionPublishState(r, 'ready-for-review', fixedNow);
    r = transitionPublishState(r, 'approved-for-publish', fixedNow);
    r = transitionPublishState(r, 'publishing', fixedNow);
    r = transitionPublishState(r, 'published', fixedNow);
    r = transitionPublishState(r, 'superseded', fixedNow);
    expect(() => transitionPublishState(r, 'draft')).toThrow('invalid transition');
  });
});

describe('evaluateReadiness', () => {
  it('returns not ready when no targets', () => {
    const r = createPublishRequest({ sourceModuleKey: 'f', sourceRecordId: 'r', requestedByUserId: 'u', targets: [] }, fixedNow);
    const result = evaluateReadiness(r, []);
    expect(result.isReady).toBe(false);
    expect(result.blockingReasons).toContain('No publish targets defined');
  });
  it('returns ready when targets present', () => {
    const r = createPublishRequest({ sourceModuleKey: 'f', sourceRecordId: 'r', requestedByUserId: 'u', targets: [{ targetId: 't1', targetType: 'sharepoint', label: 'SP', recipientScope: 'team' }] }, fixedNow);
    const result = evaluateReadiness(r, []);
    expect(result.isReady).toBe(true);
  });
  it('evaluates custom rules', () => {
    const r = createPublishRequest({ sourceModuleKey: 'f', sourceRecordId: 'r', requestedByUserId: 'u', targets: [{ targetId: 't1', targetType: 'sharepoint', label: 'SP', recipientScope: 'team' }] }, fixedNow);
    const failRule = { ruleId: 'r1', label: 'Test', evaluate: () => ({ pass: false, message: 'Custom fail' }) };
    const result = evaluateReadiness(r, [failRule]);
    expect(result.isReady).toBe(false);
    expect(result.blockingReasons).toContain('Custom fail');
  });
  it('uses current time when now not provided', () => {
    const r = createPublishRequest({ sourceModuleKey: 'f', sourceRecordId: 'r', requestedByUserId: 'u', targets: [{ targetId: 't1', targetType: 'sharepoint', label: 'SP', recipientScope: 'team' }] }, fixedNow);
    const result = evaluateReadiness(r, []);
    expect(new Date(result.checkedAtIso).getTime()).toBeGreaterThan(0);
  });
  it('blocks when sourceRecordId is empty', () => {
    const r = createPublishRequest({ sourceModuleKey: 'f', sourceRecordId: 'r', requestedByUserId: 'u', targets: [{ targetId: 't1', targetType: 'sharepoint', label: 'SP', recipientScope: 'team' }] }, fixedNow);
    const modified = { ...r, sourceRecordId: '' };
    const result = evaluateReadiness(modified, []);
    expect(result.isReady).toBe(false);
    expect(result.blockingReasons).toContain('Source record is required');
  });
  it('passes when rule passes', () => {
    const r = createPublishRequest({ sourceModuleKey: 'f', sourceRecordId: 'r', requestedByUserId: 'u', targets: [{ targetId: 't1', targetType: 'sharepoint', label: 'SP', recipientScope: 'team' }] }, fixedNow);
    const passRule = { ruleId: 'r1', label: 'Test', evaluate: () => ({ pass: true, message: 'OK' }) };
    const result = evaluateReadiness(r, [passRule]);
    expect(result.isReady).toBe(true);
  });
});

describe('VALID_PUBLISH_TRANSITIONS', () => {
  it('defines transitions for 8 states', () => { expect(Object.keys(VALID_PUBLISH_TRANSITIONS)).toHaveLength(8); });
});
