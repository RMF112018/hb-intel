/**
 * @hbc/ai-assist — Reference model registrations (SF15-T07)
 *
 * Two IAiModelRegistration entries for GPT-4o and GPT-4o Mini,
 * demonstrating multi-model registry usage in the reference integration layer.
 */

import type { IAiModelRegistration } from '../types/index.js';
import { AiModelRegistry } from '../registry/AiModelRegistry.js';

const GPT_4O: IAiModelRegistration = {
  modelKey: 'gpt-4o',
  displayName: 'GPT-4o',
  deploymentName: 'gpt-4o-2024',
  deploymentVersion: '2024-05-13',
  allowedRoles: ['estimator', 'project-manager', 'executive', 'admin'],
  maxTokensDefault: 4096,
};

const GPT_4O_MINI: IAiModelRegistration = {
  modelKey: 'gpt-4o-mini',
  displayName: 'GPT-4o Mini',
  deploymentName: 'gpt-4o-mini-2024',
  deploymentVersion: '2024-07-18',
  allowedRoles: ['estimator', 'project-manager', 'executive', 'admin'],
  maxTokensDefault: 2048,
};

export const REFERENCE_MODELS = [GPT_4O, GPT_4O_MINI] as const;

/** Register all reference models idempotently (catches duplicate registration errors). */
export function registerReferenceModels(): void {
  for (const model of REFERENCE_MODELS) {
    try {
      AiModelRegistry.registerModel(model);
    } catch {
      // Idempotent — silently ignore duplicate registration
    }
  }
}
