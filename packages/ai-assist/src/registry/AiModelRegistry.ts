/**
 * @hbc/ai-assist — AiModelRegistry (D-SF15-T01 scaffold)
 *
 * Logical model key resolution from tenant configuration.
 * Full implementation in SF15-T03.
 */

import type { IAiModelRegistration } from '../types/index.js';

const models = new Map<string, IAiModelRegistration>();

/** Model registry for resolving logical model keys to deployment configurations. */
export const AiModelRegistry = {
  register: (registration: IAiModelRegistration): void => {
    models.set(registration.modelKey, registration);
  },
  resolveModel: (modelKey: string): IAiModelRegistration | undefined => models.get(modelKey),
  getAll: (): readonly IAiModelRegistration[] => [...models.values()],
  clear: (): void => models.clear(),
} as const;
