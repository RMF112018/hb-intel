/**
 * @hbc/ai-assist — seedReferenceIntegrations (SF15-T07)
 *
 * Seeds all reference integration registries with production-ready reference data.
 *
 * Cross-package integration contracts exercised:
 * 1. AiModelRegistry.registerModel — model key → deployment resolution
 * 2. AiActionRegistry.register — composite-key action binding
 * 3. AiGovernanceApi.setPolicy — policy-based action filtering
 * 4. AiGovernanceApi.evaluatePolicy — action + context → decision
 * 5. AiGovernanceApi.checkRateLimit — role-based rate limiting
 * 6. AiAuditWriter.write — audit record persistence
 * 7. AiAssistApi.invoke — executor → model → governance → audit pipeline
 */

import type { IAiAssistPolicy } from '../types/index.js';
import { AiActionRegistry } from '../registry/AiActionRegistry.js';
import { AiModelRegistry } from '../registry/AiModelRegistry.js';
import { AiGovernanceApi } from '../governance/AiGovernanceApi.js';
import { AiAuditWriter } from '../governance/AiAuditWriter.js';
import { registerReferenceModels } from './referenceModels.js';
import { REFERENCE_ACTION_BINDINGS } from './referenceActions.js';

export const REFERENCE_POLICY: IAiAssistPolicy = {
  disableActions: [],
  rateLimitPerHourByRole: { estimator: 20, 'project-manager': 30, executive: 40, admin: 100 },
  requireApprovalActions: ['intelligence-contribution'],
};

/** Seed all registries with reference integration data. Clears existing state first. */
export function seedReferenceIntegrations(): void {
  // 1. Clear all registries
  AiActionRegistry._clearForTests();
  AiModelRegistry._clearForTests();
  AiGovernanceApi._clearForTests();
  AiAuditWriter._clearForTests();

  // 2. Register models
  registerReferenceModels();

  // 3. Register action bindings
  for (const binding of REFERENCE_ACTION_BINDINGS) {
    AiActionRegistry.register(binding.recordType, binding.action);
  }

  // 4. Set governance policy
  AiGovernanceApi.setPolicy(REFERENCE_POLICY);
}
