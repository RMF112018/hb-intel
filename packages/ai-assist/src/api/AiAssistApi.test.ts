import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AiAssistApi } from './index.js';
import type { IAiActionExecutor } from './index.js';
import { AiModelRegistry } from '../registry/AiModelRegistry.js';
import { AiGovernanceApi } from '../governance/AiGovernanceApi.js';
import { AiAuditWriter } from '../governance/AiAuditWriter.js';
import { createMockAiAction } from '../../testing/createMockAiAction.js';
import { createMockAiModelRegistration } from '../../testing/createMockAiModelRegistration.js';
import type { IAiActionInvokeContext } from '../types/index.js';

const baseContext: IAiActionInvokeContext = {
  userId: 'user-1',
  role: 'estimator',
  recordType: 'scorecard',
  recordId: 'sc-1',
  complexity: 'standard',
};

beforeEach(() => {
  AiModelRegistry._clearForTests();
  AiGovernanceApi._clearForTests();
  AiAuditWriter._clearForTests();
  AiModelRegistry.registerModel(createMockAiModelRegistration());
});

describe('AiAssistApi', () => {
  it('full invoke orchestration with custom executor', async () => {
    const executor: IAiActionExecutor = {
      execute: vi.fn().mockResolvedValue('raw response'),
    };
    const api = new AiAssistApi(executor);
    const action = createMockAiAction();

    const result = await api.invoke(action, baseContext, { data: 'test' });
    expect(result.outputType).toBe('text');
    expect(executor.execute).toHaveBeenCalled();

    // Audit record should have been written
    const trail = AiGovernanceApi.getAuditTrail();
    expect(trail).toHaveLength(1);
    expect(trail[0].outcome).toBe('success');
  });

  it('throws and writes failed audit when policy blocks', async () => {
    AiGovernanceApi.setPolicy({ disableActions: ['mock-summarize-scorecard'] });
    const api = new AiAssistApi();
    const action = createMockAiAction();

    await expect(api.invoke(action, baseContext, {})).rejects.toThrow(
      '[ai-assist] Action blocked by policy',
    );

    const trail = AiGovernanceApi.getAuditTrail();
    expect(trail).toHaveLength(1);
    expect(trail[0].outcome).toBe('failed');
    expect(trail[0].policyDecision).toBe('blocked');
  });

  it('custom executor receives prompt payload', async () => {
    const executor: IAiActionExecutor = {
      execute: vi.fn().mockResolvedValue('raw'),
    };
    const api = new AiAssistApi(executor);
    const action = createMockAiAction();

    await api.invoke(action, baseContext, { id: '123' });
    const [payload, signal] = (executor.execute as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(payload).toHaveProperty('systemInstruction');
    expect(payload).toHaveProperty('userPrompt');
    expect(signal).toBeInstanceOf(AbortSignal);
  });

  it('cancel aborts in-flight request', async () => {
    let capturedSignal: AbortSignal | undefined;
    const executor: IAiActionExecutor = {
      execute: vi.fn().mockImplementation((_payload, signal: AbortSignal) => {
        capturedSignal = signal;
        return new Promise((_, reject) => {
          signal.addEventListener('abort', () => reject(new Error('Aborted')));
        });
      }),
    };
    const api = new AiAssistApi(executor);
    const action = createMockAiAction();

    const promise = api.invoke(action, baseContext, {});
    api.cancel(action.actionKey);

    await expect(promise).rejects.toThrow('Aborted');
    expect(capturedSignal?.aborted).toBe(true);
  });

  it('default executor returns placeholder', async () => {
    const api = new AiAssistApi();
    const action = createMockAiAction();
    const result = await api.invoke(action, baseContext, {});
    expect(result).toBeDefined();
  });

  it('throws for unregistered model', async () => {
    AiModelRegistry._clearForTests(); // remove the default registration
    const api = new AiAssistApi();
    const action = createMockAiAction();
    await expect(api.invoke(action, baseContext, {})).rejects.toThrow(
      '[ai-assist] Unknown model key',
    );
  });

  it('writes failed audit on executor error', async () => {
    const executor: IAiActionExecutor = {
      execute: vi.fn().mockRejectedValue(new Error('Network error')),
    };
    const api = new AiAssistApi(executor);
    const action = createMockAiAction();

    await expect(api.invoke(action, baseContext, {})).rejects.toThrow('Network error');

    const trail = AiGovernanceApi.getAuditTrail();
    expect(trail).toHaveLength(1);
    expect(trail[0].outcome).toBe('failed');
  });
});
