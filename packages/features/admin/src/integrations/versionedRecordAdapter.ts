import type { IApprovalAuthorityRule } from '../types/IApprovalAuthorityRule.js';

/**
 * Versioned-record / governance snapshot integration adapter.
 *
 * Defines the contract for emitting rule-change snapshots without
 * importing @hbc/versioned-record directly.
 *
 * @design D-05, D-06, SF17-T07
 */

/** Payload representing a governance rule change snapshot. */
export interface IGovernanceSnapshotPayload {
  readonly snapshotId: string;
  readonly ruleId: string;
  readonly approvalContext: IApprovalAuthorityRule['approvalContext'];
  readonly approverUserIds: readonly string[];
  readonly approverGroupIds: readonly string[];
  readonly approvalMode: IApprovalAuthorityRule['approvalMode'];
  readonly capturedAt: string;
  readonly capturedBy: string;
}

/** Adapter interface for governance snapshot emission. */
export interface IGovernanceSnapshotAdapter {
  /** Emit a snapshot capturing the current state of a rule. */
  emitRuleChangeSnapshot(rule: IApprovalAuthorityRule, capturedBy: string): IGovernanceSnapshotPayload;
}

/**
 * Reference implementation that builds the snapshot payload
 * from an IApprovalAuthorityRule.
 */
export class ReferenceGovernanceSnapshotAdapter implements IGovernanceSnapshotAdapter {
  emitRuleChangeSnapshot(
    rule: IApprovalAuthorityRule,
    capturedBy: string,
  ): IGovernanceSnapshotPayload {
    return {
      snapshotId: `snap-${rule.ruleId}-${Date.now()}`,
      ruleId: rule.ruleId,
      approvalContext: rule.approvalContext,
      approverUserIds: rule.approverUserIds,
      approverGroupIds: rule.approverGroupIds,
      approvalMode: rule.approvalMode,
      capturedAt: new Date().toISOString(),
      capturedBy,
    };
  }
}
