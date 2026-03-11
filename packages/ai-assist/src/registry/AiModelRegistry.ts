/**
 * @hbc/ai-assist — AiModelRegistry (SF15-T03)
 *
 * Logical model key resolution from tenant configuration.
 * Conforms to IAiModelRegistry interface.
 */

import type { IAiModelRegistration, IAiModelRegistry, IAiActionInvokeContext } from '../types/index.js';

const models = new Map<string, IAiModelRegistration>();

function validateModel(model: IAiModelRegistration): void {
  if (!model.modelKey) {
    throw new Error('[ai-assist] Model validation failed: modelKey must be non-empty');
  }
  if (!model.displayName) {
    throw new Error('[ai-assist] Model validation failed: displayName must be non-empty');
  }
  if (!model.deploymentName) {
    throw new Error('[ai-assist] Model validation failed: deploymentName must be non-empty');
  }
  if (!model.deploymentVersion) {
    throw new Error('[ai-assist] Model validation failed: deploymentVersion must be non-empty');
  }
}

function registerModel(model: IAiModelRegistration): void {
  validateModel(model);
  if (models.has(model.modelKey)) {
    throw new Error(`[ai-assist] Duplicate model registration: "${model.modelKey}"`);
  }
  models.set(model.modelKey, model);
}

function resolveModel(modelKey: string, context: IAiActionInvokeContext): IAiModelRegistration {
  const model = models.get(modelKey);
  if (!model) {
    throw new Error(`[ai-assist] Unknown model key: "${modelKey}"`);
  }
  if (model.allowedRoles && !model.allowedRoles.includes(context.role)) {
    throw new Error(`[ai-assist] Role not authorized for model "${modelKey}": "${context.role}"`);
  }
  return model;
}

function listModels(): readonly IAiModelRegistration[] {
  return [...models.values()];
}

function _clearForTests(): void {
  models.clear();
}

/** Model registry for resolving logical model keys to deployment configurations. */
export const AiModelRegistry: IAiModelRegistry & { _clearForTests: () => void } = {
  registerModel,
  resolveModel,
  listModels,
  _clearForTests,
} as const;
