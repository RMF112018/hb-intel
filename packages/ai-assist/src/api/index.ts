/**
 * @hbc/ai-assist — AiAssistApi (SF15-T03)
 *
 * Core API surface for invoking AI actions via injectable executor pattern.
 */

import type { IAiAction, IAiActionResult, IAiActionInvokeContext, IAiPromptPayload, IAiAuditRecord } from '../types/index.js';
import { AiModelRegistry } from '../registry/AiModelRegistry.js';
import { AiGovernanceApi } from '../governance/AiGovernanceApi.js';
import { AiAuditWriter } from '../governance/AiAuditWriter.js';

/** Injectable executor interface for AI action invocation. */
export interface IAiActionExecutor {
  execute(payload: IAiPromptPayload, signal: AbortSignal): Promise<string>;
}

/** API interface for the AI assist invoke contract. */
export interface IAiAssistApi {
  invoke(action: IAiAction, context: IAiActionInvokeContext, record: unknown): Promise<IAiActionResult>;
  cancel(actionKey: string): void;
}

/** Default executor returns placeholder JSON for dev/testing. */
const defaultExecutor: IAiActionExecutor = {
  async execute(_payload: IAiPromptPayload, _signal: AbortSignal): Promise<string> {
    return JSON.stringify({
      outputType: 'text',
      text: '[ai-assist] Default executor placeholder response',
    });
  },
};

/** AI Assist API providing action invocation and cancellation. */
export class AiAssistApi implements IAiAssistApi {
  private readonly executor: IAiActionExecutor;
  private readonly controllers = new Map<string, AbortController>();

  constructor(executor?: IAiActionExecutor) {
    this.executor = executor ?? defaultExecutor;
  }

  async invoke(
    action: IAiAction,
    context: IAiActionInvokeContext,
    record: unknown,
  ): Promise<IAiActionResult> {
    const model = AiModelRegistry.resolveModel(action.modelKey, context);
    const policyResult = AiGovernanceApi.evaluatePolicy(action.actionKey, context);

    if (policyResult.decision === 'blocked') {
      this.writeAudit(action, context, model.deploymentName, model.deploymentVersion, policyResult.decision, 'failed', policyResult.notes);
      throw new Error(`[ai-assist] Action blocked by policy: "${action.actionKey}"`);
    }

    const abortController = new AbortController();
    this.controllers.set(action.actionKey, abortController);

    try {
      const payload = action.buildPrompt(record);
      const rawResponse = await this.executor.execute(payload, abortController.signal);
      const result = action.parseResponse(rawResponse);

      this.writeAudit(action, context, model.deploymentName, model.deploymentVersion, policyResult.decision, 'success', policyResult.notes, result.confidenceDetails?.confidenceScore);
      return result;
    } catch (error) {
      const outcome = abortController.signal.aborted ? 'cancelled' : 'failed';
      this.writeAudit(action, context, model.deploymentName, model.deploymentVersion, policyResult.decision, outcome, policyResult.notes);
      throw error;
    } finally {
      this.controllers.delete(action.actionKey);
    }
  }

  cancel(actionKey: string): void {
    const controller = this.controllers.get(actionKey);
    if (controller) {
      controller.abort();
      this.controllers.delete(actionKey);
    }
  }

  private writeAudit(
    action: IAiAction,
    context: IAiActionInvokeContext,
    resolvedModelName: string,
    resolvedModelVersion: string,
    policyDecision: IAiAuditRecord['policyDecision'],
    outcome: IAiAuditRecord['outcome'],
    policyNotes: string[],
    confidenceScore?: number,
  ): void {
    const record: IAiAuditRecord = {
      auditId: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      actionKey: action.actionKey,
      recordType: context.recordType,
      recordId: context.recordId,
      invokedByUserId: context.userId,
      invokedAtUtc: new Date().toISOString(),
      modelKey: action.modelKey,
      resolvedModelName,
      resolvedModelVersion,
      contextSourceKeys: [],
      policyDecision,
      policyNotes,
      rateLimitBucket: context.role,
      outcome,
      confidenceScore,
    };
    AiAuditWriter.write(record);
  }
}
