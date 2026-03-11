/**
 * @hbc/ai-assist — AiGovernanceApi (SF15-T03)
 *
 * Policy, rate-limit, and approval analytics surface for admin governance.
 */

import type { IAiAuditRecord, IAiAssistPolicy, IAiActionInvokeContext } from '../types/index.js';

/** Result of a policy evaluation for an action + context. */
export interface IPolicyEvaluation {
  readonly decision: 'allowed' | 'blocked' | 'approval-required';
  readonly notes: string[];
}

/** Rate limit status for a given role. */
export interface IRateLimitStatus {
  readonly allowed: boolean;
  readonly remaining: number;
  readonly limit: number;
}

/** Filters for querying the audit trail. */
export interface IAuditTrailFilters {
  readonly actionKey?: string;
  readonly recordType?: string;
  readonly userId?: string;
  readonly fromUtc?: string;
  readonly toUtc?: string;
}

let policy: IAiAssistPolicy = {};
const auditTrail: IAiAuditRecord[] = [];

function setPolicy(newPolicy: IAiAssistPolicy): void {
  policy = newPolicy;
}

function getPolicy(): IAiAssistPolicy {
  return policy;
}

function evaluatePolicy(actionKey: string, context: IAiActionInvokeContext): IPolicyEvaluation {
  const notes: string[] = [];

  if (policy.disableActions?.includes(actionKey)) {
    notes.push(`Action "${actionKey}" is disabled by policy`);
    return { decision: 'blocked', notes };
  }

  if (policy.requireApprovalActions?.includes(actionKey)) {
    notes.push(`Action "${actionKey}" requires approval`);
    return { decision: 'approval-required', notes };
  }

  const roleLimit = policy.rateLimitPerHourByRole?.[context.role];
  if (roleLimit !== undefined) {
    const rateLimitCheck = checkRateLimit(context.role);
    if (!rateLimitCheck.allowed) {
      notes.push(`Rate limit exceeded for role "${context.role}": ${rateLimitCheck.limit}/hour`);
      return { decision: 'blocked', notes };
    }
  }

  notes.push('Policy check passed');
  return { decision: 'allowed', notes };
}

function checkRateLimit(role: string): IRateLimitStatus {
  const limit = policy.rateLimitPerHourByRole?.[role];
  if (limit === undefined) {
    return { allowed: true, remaining: Infinity, limit: Infinity };
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const recentCount = auditTrail.filter(
    (r) => r.rateLimitBucket === role && r.invokedAtUtc > oneHourAgo,
  ).length;

  const remaining = Math.max(0, limit - recentCount);
  return { allowed: remaining > 0, remaining, limit };
}

function getAuditTrail(filters?: IAuditTrailFilters): readonly IAiAuditRecord[] {
  let result = [...auditTrail];

  if (filters?.actionKey) {
    result = result.filter((r) => r.actionKey === filters.actionKey);
  }
  if (filters?.recordType) {
    result = result.filter((r) => r.recordType === filters.recordType);
  }
  if (filters?.userId) {
    result = result.filter((r) => r.invokedByUserId === filters.userId);
  }
  if (filters?.fromUtc) {
    result = result.filter((r) => r.invokedAtUtc >= filters.fromUtc!);
  }
  if (filters?.toUtc) {
    result = result.filter((r) => r.invokedAtUtc <= filters.toUtc!);
  }

  return result.sort((a, b) => b.invokedAtUtc.localeCompare(a.invokedAtUtc));
}

function getPolicyStatus(): { readonly policy: IAiAssistPolicy; readonly auditCount: number } {
  return { policy, auditCount: auditTrail.length };
}

function getRateLimitStatus(): Record<string, IRateLimitStatus> {
  const roles = Object.keys(policy.rateLimitPerHourByRole ?? {});
  const result: Record<string, IRateLimitStatus> = {};
  for (const role of roles) {
    result[role] = checkRateLimit(role);
  }
  return result;
}

function recordAudit(record: IAiAuditRecord): void {
  auditTrail.push(record);
}

function _clearForTests(): void {
  policy = {};
  auditTrail.length = 0;
}

/** Governance API providing policy controls and analytics endpoints. */
export const AiGovernanceApi = {
  setPolicy,
  getPolicy,
  evaluatePolicy,
  checkRateLimit,
  getAuditTrail,
  getPolicyStatus,
  getRateLimitStatus,
  recordAudit,
  _clearForTests,
} as const;
