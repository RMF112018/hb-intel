/**
 * Project Home command-summary derivation (Wave 15A wave-b6 Prompt 02).
 *
 * Pure helper used by both the fixture-only and read-model-driven Project
 * Home render paths to derive the compact first-fold posture row rendered
 * inside the Project Intelligence command card. Counts and labels are
 * derived from data the surface already owns — no new endpoints, no
 * fabricated fields. Indicators that resolve to `undefined` are omitted
 * by the consumer; chips for unsupported counts are never rendered.
 */

import type {
  IExternalSystemMissingConfig,
  IPriorityAction,
  PccReadModelSourceStatus,
  SiteHealthSeverity,
} from '@hbc/models/pcc';
import { priorityToneForAction } from './shared';
import type { IPccApprovalsCheckpointsCardViewModel } from './PccApprovalsCheckpointsCard';

export type ProjectHomeSourceMode = 'fixture' | 'read-model';

export interface IProjectCommandSummary {
  readonly highPriorityActionCount?: number;
  readonly pendingApprovalCount?: number;
  readonly blockingMissingConfigCount?: number;
  readonly sourceLabel: string;
  readonly hbiAdvisoryCue: string;
}

export interface IBuildProjectCommandSummaryInput {
  readonly priorityActions?: readonly IPriorityAction[];
  readonly approvalsCard?: IPccApprovalsCheckpointsCardViewModel;
  readonly missingConfigurations?: readonly IExternalSystemMissingConfig[];
  readonly sourceMode: ProjectHomeSourceMode;
  /** Used when `sourceMode === 'read-model'`. Ignored for fixture mode. */
  readonly sourceStatus?: PccReadModelSourceStatus;
}

export const PROJECT_COMMAND_HBI_ADVISORY_CUE = 'HBI advisory · no writeback';

const HIGH_SEVERITIES: readonly SiteHealthSeverity[] = [
  'Blocking',
  'Security Risk',
  'Repair Required',
];

function isHighSeverity(severity: SiteHealthSeverity | undefined): boolean {
  return severity !== undefined && HIGH_SEVERITIES.includes(severity);
}

function readModelSourceLabel(status: PccReadModelSourceStatus): string {
  switch (status) {
    case 'available':
      return 'Source: PCC read-model available';
    case 'backend-unavailable':
      return 'Source: backend unavailable · preview posture';
    case 'source-unavailable':
      return 'Source: system unavailable · preview posture';
    case 'missing-config':
      return 'Source: missing configuration · setup required';
    case 'stale':
      return 'Source: stale data · refresh pending';
    case 'unauthorized':
      return 'Source: unauthorized · contact admin';
    case 'forbidden':
      return 'Source: forbidden · contact admin';
  }
}

function sourceLabelFor(input: IBuildProjectCommandSummaryInput): string {
  if (input.sourceMode === 'fixture') {
    return 'Source: fixture preview';
  }
  return input.sourceStatus !== undefined
    ? readModelSourceLabel(input.sourceStatus)
    : 'Source: read-model · status pending';
}

export function buildProjectCommandSummary(
  input: IBuildProjectCommandSummaryInput,
): IProjectCommandSummary {
  const highPriorityActionCount = input.priorityActions
    ? input.priorityActions.filter((a) => priorityToneForAction(a) === 'high').length
    : undefined;

  const pendingApprovalCount = input.approvalsCard?.pendingActiveCount;

  const blockingMissingConfigCount = input.missingConfigurations
    ? input.missingConfigurations.filter((c) => isHighSeverity(c.severity)).length
    : undefined;

  return {
    highPriorityActionCount,
    pendingApprovalCount,
    blockingMissingConfigCount,
    sourceLabel: sourceLabelFor(input),
    hbiAdvisoryCue: PROJECT_COMMAND_HBI_ADVISORY_CUE,
  };
}
