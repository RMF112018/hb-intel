/**
 * @hbc/ai-assist — AiAssistApi (D-SF15-T01 scaffold)
 *
 * Core API surface for invoking AI actions via Azure AI Foundry proxy.
 * Full implementation in SF15-T03.
 */

import type { IAiAction, IAiActionResult } from '../types/index.js';

/** API interface for the AI assist invoke contract. */
export interface IAiAssistApi {
  invoke(action: IAiAction, context: Record<string, unknown>): Promise<IAiActionResult>;
  cancel(actionKey: string): void;
}

/** AI Assist API providing action invocation and cancellation. */
export class AiAssistApi implements IAiAssistApi {
  async invoke(
    _action: IAiAction,
    _context: Record<string, unknown>,
  ): Promise<IAiActionResult> {
    throw new Error('AiAssistApi.invoke is a scaffold stub — implement in SF15-T03');
  }

  cancel(_actionKey: string): void {
    // Stub — full implementation in SF15-T03
  }
}
