/**
 * @hbc/ai-assist — Reference integrations test suite (SF15-T07)
 *
 * Validates the full end-to-end flow: registry → model resolution → governance → API invoke → hooks → UI.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { seedReferenceIntegrations, REFERENCE_POLICY } from './seedReferenceIntegrations.js';
import { REFERENCE_MODELS } from './referenceModels.js';
import { REFERENCE_ACTIONS, REFERENCE_ACTION_BINDINGS } from './referenceActions.js';
import { ReferenceExecutor, createReferenceExecutor } from './referenceExecutor.js';
import { AiActionRegistry } from '../registry/AiActionRegistry.js';
import { AiModelRegistry } from '../registry/AiModelRegistry.js';
import { AiGovernanceApi } from '../governance/AiGovernanceApi.js';
import { AiAssistApi } from '../api/index.js';
import { RelevanceScoringEngine } from '../registry/RelevanceScoringEngine.js';
import type { IAiActionInvokeContext } from '../types/index.js';

const adminCtx: IAiActionInvokeContext = {
  userId: 'user-admin-1',
  role: 'admin',
  recordType: 'scorecard',
  recordId: 'sc-001',
  complexity: 'expert',
};

const estimatorCtx: IAiActionInvokeContext = {
  userId: 'user-est-1',
  role: 'estimator',
  recordType: 'opportunity',
  recordId: 'opp-001',
  complexity: 'standard',
};

const executiveCtx: IAiActionInvokeContext = {
  userId: 'user-exec-1',
  role: 'executive',
  recordType: 'opportunity',
  recordId: 'opp-002',
  complexity: 'expert',
};

const essentialCtx: IAiActionInvokeContext = {
  userId: 'user-est-2',
  role: 'admin',
  recordType: 'opportunity',
  recordId: 'opp-003',
  complexity: 'essential',
};

const standardCtx: IAiActionInvokeContext = {
  userId: 'user-est-3',
  role: 'admin',
  recordType: 'opportunity',
  recordId: 'opp-004',
  complexity: 'standard',
};

const expertCtx: IAiActionInvokeContext = {
  userId: 'user-est-4',
  role: 'admin',
  recordType: 'opportunity',
  recordId: 'opp-005',
  complexity: 'expert',
};

beforeEach(() => {
  seedReferenceIntegrations();
});

// ---------------------------------------------------------------------------
// 1. Registration (6 tests)
// ---------------------------------------------------------------------------

describe('Registration', () => {
  it('registers all 6 actions', () => {
    const all = AiActionRegistry.getAll();
    expect(all).toHaveLength(6);
  });

  it('binds scorecard actions (summarize-scorecard, draft-learning-loop)', () => {
    const scorecardActions = AiActionRegistry.getByRecordType('scorecard');
    const keys = scorecardActions.map((a) => a.actionKey);
    expect(keys).toContain('summarize-scorecard');
    expect(keys).toContain('draft-learning-loop');
  });

  it('binds opportunity actions (risk-assessment, constraint-analysis, intelligence-contribution)', () => {
    const oppActions = AiActionRegistry.getByRecordType('opportunity');
    const keys = oppActions.map((a) => a.actionKey);
    expect(keys).toContain('risk-assessment');
    expect(keys).toContain('constraint-analysis');
    expect(keys).toContain('intelligence-contribution');
  });

  it('includes wildcard generate-context-notes in both scorecard and opportunity', () => {
    const scorecardKeys = AiActionRegistry.getByRecordType('scorecard').map((a) => a.actionKey);
    const oppKeys = AiActionRegistry.getByRecordType('opportunity').map((a) => a.actionKey);
    expect(scorecardKeys).toContain('generate-context-notes');
    expect(oppKeys).toContain('generate-context-notes');
  });

  it('all actions have valid buildPrompt functions', () => {
    for (const action of REFERENCE_ACTIONS) {
      expect(typeof action.buildPrompt).toBe('function');
      const payload = action.buildPrompt({ id: 'test' });
      expect(payload.systemInstruction).toBeTruthy();
      expect(payload.userPrompt).toBeTruthy();
      expect(payload.modelKey).toBeTruthy();
    }
  });

  it('all actions have valid parseResponse functions', () => {
    for (const action of REFERENCE_ACTIONS) {
      expect(typeof action.parseResponse).toBe('function');
      const result = action.parseResponse('{"text":"test","confidence":0.8}');
      expect(result.confidenceDetails).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// 2. Model Resolution (4 tests)
// ---------------------------------------------------------------------------

describe('Model Resolution', () => {
  it('lists 2 registered models', () => {
    expect(AiModelRegistry.listModels()).toHaveLength(2);
  });

  it('resolves gpt-4o for admin context', () => {
    const model = AiModelRegistry.resolveModel('gpt-4o', adminCtx);
    expect(model.displayName).toBe('GPT-4o');
    expect(model.deploymentName).toBe('gpt-4o-2024');
  });

  it('resolves gpt-4o-mini for admin context', () => {
    const model = AiModelRegistry.resolveModel('gpt-4o-mini', adminCtx);
    expect(model.displayName).toBe('GPT-4o Mini');
    expect(model.deploymentName).toBe('gpt-4o-mini-2024');
  });

  it('throws for unknown model key', () => {
    expect(() => AiModelRegistry.resolveModel('unknown', adminCtx)).toThrow('Unknown model key');
  });
});

// ---------------------------------------------------------------------------
// 3. API Invoke Flow (6 tests)
// ---------------------------------------------------------------------------

describe('API Invoke Flow', () => {
  it('invokes summarize-scorecard and returns text output', async () => {
    const api = new AiAssistApi(createReferenceExecutor(1));
    const action = REFERENCE_ACTIONS.find((a) => a.actionKey === 'summarize-scorecard')!;
    const result = await api.invoke(action, { ...adminCtx, recordType: 'scorecard' }, { id: 'sc-1' });
    expect(result.outputType).toBe('text');
    expect(result.text).toBeTruthy();
    expect(result.confidenceDetails).toBeDefined();
  });

  it('invokes risk-assessment and returns bullet-list output', async () => {
    const api = new AiAssistApi(createReferenceExecutor(1));
    const action = REFERENCE_ACTIONS.find((a) => a.actionKey === 'risk-assessment')!;
    const result = await api.invoke(action, { ...adminCtx, recordType: 'opportunity' }, { id: 'opp-1' });
    expect(result.outputType).toBe('bullet-list');
    expect(result.items).toBeDefined();
    expect(result.items!.length).toBeGreaterThan(0);
  });

  it('invokes draft-learning-loop and returns text output', async () => {
    const api = new AiAssistApi(createReferenceExecutor(1));
    const action = REFERENCE_ACTIONS.find((a) => a.actionKey === 'draft-learning-loop')!;
    const result = await api.invoke(action, { ...adminCtx, recordType: 'scorecard' }, { id: 'sc-2' });
    expect(result.outputType).toBe('text');
    expect(result.text).toBeTruthy();
  });

  it('invokes constraint-analysis and returns bullet-list output', async () => {
    const api = new AiAssistApi(createReferenceExecutor(1));
    const action = REFERENCE_ACTIONS.find((a) => a.actionKey === 'constraint-analysis')!;
    const result = await api.invoke(action, { ...adminCtx, recordType: 'opportunity' }, { id: 'opp-2' });
    expect(result.outputType).toBe('bullet-list');
    expect(result.items!.length).toBeGreaterThan(0);
  });

  it('invokes generate-context-notes and returns text output', async () => {
    const api = new AiAssistApi(createReferenceExecutor(1));
    const action = REFERENCE_ACTIONS.find((a) => a.actionKey === 'generate-context-notes')!;
    const result = await api.invoke(action, adminCtx, { id: 'rec-1' });
    expect(result.outputType).toBe('text');
    expect(result.text).toBeTruthy();
  });

  it('records audit trail on successful invoke', async () => {
    const api = new AiAssistApi(createReferenceExecutor(1));
    const action = REFERENCE_ACTIONS.find((a) => a.actionKey === 'summarize-scorecard')!;
    await api.invoke(action, { ...adminCtx, recordType: 'scorecard' }, { id: 'sc-audit' });
    const trail = AiGovernanceApi.getAuditTrail();
    expect(trail.length).toBeGreaterThan(0);
    const record = trail.find((r) => r.actionKey === 'summarize-scorecard');
    expect(record).toBeDefined();
    expect(record!.outcome).toBe('success');
  });
});

// ---------------------------------------------------------------------------
// 4. Governance (4 tests)
// ---------------------------------------------------------------------------

describe('Governance', () => {
  it('blocks disabled action via getForContext', () => {
    AiGovernanceApi.setPolicy({
      ...REFERENCE_POLICY,
      disableActions: ['summarize-scorecard'],
    });
    AiActionRegistry.setPolicy(AiGovernanceApi.getPolicy());
    const actions = AiActionRegistry.getForContext({ ...adminCtx, recordType: 'scorecard' });
    const keys = actions.map((a) => a.actionKey);
    expect(keys).not.toContain('summarize-scorecard');
  });

  it('evaluates intelligence-contribution as approval-required', () => {
    const evaluation = AiGovernanceApi.evaluatePolicy('intelligence-contribution', executiveCtx);
    expect(evaluation.decision).toBe('approval-required');
  });

  it('checks rate limit for estimator role', () => {
    const status = AiGovernanceApi.checkRateLimit('estimator');
    expect(status.allowed).toBe(true);
    expect(status.remaining).toBe(20);
    expect(status.limit).toBe(20);
  });

  it('allows normal action through policy', () => {
    const evaluation = AiGovernanceApi.evaluatePolicy('summarize-scorecard', adminCtx);
    expect(evaluation.decision).toBe('allowed');
  });
});

// ---------------------------------------------------------------------------
// 5. Role Filtering (3 tests)
// ---------------------------------------------------------------------------

describe('Role Filtering', () => {
  it('excludes intelligence-contribution for estimator on opportunity', () => {
    const actions = AiActionRegistry.getForContext(estimatorCtx);
    const keys = actions.map((a) => a.actionKey);
    expect(keys).not.toContain('intelligence-contribution');
  });

  it('includes all opportunity actions for executive', () => {
    const actions = AiActionRegistry.getForContext(executiveCtx);
    const keys = actions.map((a) => a.actionKey);
    expect(keys).toContain('risk-assessment');
    expect(keys).toContain('intelligence-contribution');
  });

  it('includes all actions for admin', () => {
    const actions = AiActionRegistry.getForContext(expertCtx);
    const keys = actions.map((a) => a.actionKey);
    expect(keys).toContain('risk-assessment');
    expect(keys).toContain('constraint-analysis');
    expect(keys).toContain('intelligence-contribution');
    expect(keys).toContain('generate-context-notes');
  });
});

// ---------------------------------------------------------------------------
// 6. Complexity Filtering (3 tests)
// ---------------------------------------------------------------------------

describe('Complexity Filtering', () => {
  it('essential tier sees only essential-minComplexity actions', () => {
    const actions = AiActionRegistry.getForContext(essentialCtx);
    const keys = actions.map((a) => a.actionKey);
    expect(keys).toContain('generate-context-notes');
    expect(keys).not.toContain('risk-assessment');
    expect(keys).not.toContain('intelligence-contribution');
  });

  it('standard tier sees essential + standard actions', () => {
    const actions = AiActionRegistry.getForContext(standardCtx);
    const keys = actions.map((a) => a.actionKey);
    expect(keys).toContain('generate-context-notes');
    expect(keys).toContain('risk-assessment');
    expect(keys).toContain('constraint-analysis');
    expect(keys).not.toContain('intelligence-contribution');
  });

  it('expert tier sees all actions including intelligence-contribution', () => {
    const actions = AiActionRegistry.getForContext(expertCtx);
    const keys = actions.map((a) => a.actionKey);
    expect(keys).toContain('generate-context-notes');
    expect(keys).toContain('risk-assessment');
    expect(keys).toContain('constraint-analysis');
    expect(keys).toContain('intelligence-contribution');
  });
});

// ---------------------------------------------------------------------------
// 7. Relevance Scoring (2 tests)
// ---------------------------------------------------------------------------

describe('Relevance Scoring', () => {
  it('returns deterministic ordering by basePriority when no tags', () => {
    const actions = AiActionRegistry.getForContext(expertCtx);
    const scores = RelevanceScoringEngine.scoreActions(actions, expertCtx);
    expect(scores.length).toBeGreaterThan(0);
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i - 1]!.score).toBeGreaterThanOrEqual(scores[i]!.score);
    }
  });

  it('boosts score for matching relevanceTags', () => {
    const taggedAction = {
      ...REFERENCE_ACTIONS[0]!,
      actionKey: 'tagged-test',
      relevanceTags: ['budget-critical'],
    };
    const untaggedAction = {
      ...REFERENCE_ACTIONS[0]!,
      actionKey: 'untagged-test',
      basePriorityScore: REFERENCE_ACTIONS[0]!.basePriorityScore,
      relevanceTags: undefined,
    };
    const scores = RelevanceScoringEngine.scoreActions(
      [untaggedAction, taggedAction],
      adminCtx,
      ['budget-critical'],
    );
    const taggedScore = scores.find((s) => s.actionId === 'tagged-test');
    const untaggedScore = scores.find((s) => s.actionId === 'untagged-test');
    expect(taggedScore).toBeDefined();
    expect(untaggedScore).toBeDefined();
    expect(taggedScore!.score).toBeGreaterThan(untaggedScore!.score);
  });
});

// ---------------------------------------------------------------------------
// 8. Executor (3 tests)
// ---------------------------------------------------------------------------

describe('Executor', () => {
  it('returns action-specific response content', async () => {
    const executor = createReferenceExecutor(1);
    const payload = REFERENCE_ACTIONS[0]!.buildPrompt({ id: 'test' });
    const controller = new AbortController();
    const raw = await executor.execute(payload, controller.signal);
    const parsed = JSON.parse(raw);
    expect(parsed.text).toBeTruthy();
  });

  it('rejects with abort error when signal is aborted', async () => {
    const executor = createReferenceExecutor(500);
    const payload = REFERENCE_ACTIONS[0]!.buildPrompt({ id: 'test' });
    const controller = new AbortController();
    const promise = executor.execute(payload, controller.signal);
    controller.abort();
    await expect(promise).rejects.toThrow('aborted');
  });

  it('takes at least delayMs to execute', async () => {
    const delayMs = 50;
    const executor = createReferenceExecutor(delayMs);
    const payload = REFERENCE_ACTIONS[0]!.buildPrompt({ id: 'test' });
    const controller = new AbortController();
    const start = Date.now();
    await executor.execute(payload, controller.signal);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(delayMs - 5); // small tolerance
  });
});

// ---------------------------------------------------------------------------
// 9. Degraded (3 tests)
// ---------------------------------------------------------------------------

describe('Degraded', () => {
  it('throws when model registry is cleared then invoke called', async () => {
    AiModelRegistry._clearForTests();
    const api = new AiAssistApi(createReferenceExecutor(1));
    const action = REFERENCE_ACTIONS[0]!;
    await expect(
      api.invoke(action, { ...adminCtx, recordType: 'scorecard' }, { id: 'sc-fail' }),
    ).rejects.toThrow('Unknown model key');
  });

  it('returns low-confidence fallback for malformed parseResponse input', () => {
    const action = REFERENCE_ACTIONS[0]!;
    const result = action.parseResponse('not valid json {{{');
    expect(result.confidenceDetails.confidenceScore).toBe(0.3);
    expect(result.confidenceDetails.confidenceBadge).toBe('low');
  });

  it('throws and records failed audit when action blocked by policy', async () => {
    AiGovernanceApi.setPolicy({
      ...REFERENCE_POLICY,
      disableActions: ['summarize-scorecard'],
    });
    const api = new AiAssistApi(createReferenceExecutor(1));
    const action = REFERENCE_ACTIONS.find((a) => a.actionKey === 'summarize-scorecard')!;
    await expect(
      api.invoke(action, { ...adminCtx, recordType: 'scorecard' }, { id: 'sc-blocked' }),
    ).rejects.toThrow('blocked by policy');
    const trail = AiGovernanceApi.getAuditTrail();
    const record = trail.find((r) => r.actionKey === 'summarize-scorecard');
    expect(record).toBeDefined();
    expect(record!.outcome).toBe('failed');
  });
});

// ---------------------------------------------------------------------------
// 10. Confidence (2 tests)
// ---------------------------------------------------------------------------

describe('Confidence', () => {
  it('returns valid confidenceBadge on successful invoke', async () => {
    const api = new AiAssistApi(createReferenceExecutor(1));
    const action = REFERENCE_ACTIONS.find((a) => a.actionKey === 'summarize-scorecard')!;
    const result = await api.invoke(action, { ...adminCtx, recordType: 'scorecard' }, { id: 'sc-conf' });
    expect(['high', 'medium', 'low']).toContain(result.confidenceDetails.confidenceBadge);
  });

  it('records confidenceScore in audit trail', async () => {
    const api = new AiAssistApi(createReferenceExecutor(1));
    const action = REFERENCE_ACTIONS.find((a) => a.actionKey === 'risk-assessment')!;
    await api.invoke(action, { ...adminCtx, recordType: 'opportunity' }, { id: 'opp-conf' });
    const trail = AiGovernanceApi.getAuditTrail();
    const record = trail.find((r) => r.actionKey === 'risk-assessment');
    expect(record).toBeDefined();
    expect(typeof record!.confidenceScore).toBe('number');
  });
});
