/** SF25-T07 — Module publish request creation helper. */
import type { IPublishRequest } from '../types/index.js';
import { PublishModuleRegistry } from './PublishModuleRegistry.js';
import { createPublishRequest } from '../model/lifecycle.js';

export function createModulePublishRequest(
  moduleKey: string, sourceRecordId: string, requestedByUserId: string,
  options?: { sourceVersionId?: string | null; issueLabel?: string | null },
  now?: Date,
): IPublishRequest {
  const reg = PublishModuleRegistry.getByModule(moduleKey);
  if (!reg) throw new Error(`PublishModuleRegistry: "${moduleKey}" not registered.`);
  return createPublishRequest({
    sourceModuleKey: moduleKey, sourceRecordId, requestedByUserId,
    targets: reg.defaultTargets, approvalRules: reg.approvalRules,
    sourceVersionId: options?.sourceVersionId, issueLabel: options?.issueLabel,
  }, now);
}
