/**
 * PCC External Systems Launch Pad read-model adapter (Phase 3 / Wave 15).
 *
 * Pure mapping layer. Converts a `PccReadModelEnvelope<IPccExternalSystemsLaunchPadReadModel>`
 * into a stable view-model. No React, no hooks, no fetch, no client calls,
 * no clock reads, no `evaluateExternalUrlPolicy` calls — the read-model
 * already publishes the per-link `urlPolicyState`/`policyReason` fields,
 * so the adapter consumes those directly.
 *
 * The adapter returns `status: 'ready'` for every envelope variant; the
 * envelope's `sourceStatus` flows through to `cardState`. The hook
 * (`useLaunchPadReadModel`) owns `loading` and `error`.
 *
 * Prompt 05 scope: header, summary band, project launch links.
 * Prompt 06 scope adds: review queue rows grouped by canonical reviewState,
 * Wave 14 `approvalRequestId` cross-reference (display-only — Wave 14 owns
 * approval semantics), and a role/action visibility map derived from the
 * composite envelope's optional `roleActionMatrix` (drives disabled-reason
 * copy only — never authority, hides nothing).
 *
 * Registry inventory, mapping health, audit history, and HBI lineage are
 * intentionally excluded.
 */

import {
  EXTERNAL_REVIEW_STATES,
  EXTERNAL_SYSTEM_REGISTRY,
  type ExternalReviewState,
  type ExternalSystemActionId,
  type ExternalSystemCategory,
  type IExternalReviewItem,
  type IPccExternalSystemsLaunchPadReadModel,
  type IProjectExternalLaunchLink,
  type PccPersona,
  type PccReadModelEnvelope,
  type ProjectExternalLinkApprovalState,
  type UrlPolicyReasonCode,
} from '@hbc/models/pcc';
import { mapPccSourceStatusToPreviewState } from '../../api/pccReadModelStateMapping.js';
import type {
  IPccLaunchPadHeaderViewModel,
  IPccLaunchPadLinkGroup,
  IPccLaunchPadLinkRow,
  IPccLaunchPadProjectLinksViewModel,
  IPccLaunchPadReadyViewModel,
  IPccLaunchPadReviewItemRow,
  IPccLaunchPadReviewQueueGroup,
  IPccLaunchPadReviewQueueViewModel,
  IPccLaunchPadRoleActionVisibility,
  IPccLaunchPadSummaryViewModel,
  IPccLaunchPadViewModel,
  PccLaunchPadActionDecision,
} from './launchPadViewModel.js';

const APPROVAL_STATE_REASONS: Readonly<Record<ProjectExternalLinkApprovalState, string>> = {
  draft: 'Draft — not yet submitted for approval.',
  submitted: 'Submitted — awaiting review.',
  approved: 'Approved.',
  rejected: 'Rejected — not available.',
  'blocked-by-policy': 'Blocked by URL policy.',
  archived: 'Archived — no longer active.',
  superseded: 'Superseded by a newer link.',
};

const URL_POLICY_REASON_LABELS: Readonly<Record<UrlPolicyReasonCode, string>> = {
  allowed: 'URL policy allowed.',
  'invalid-url': 'URL is invalid.',
  'scheme-blocked': 'URL scheme is not allowed.',
  'host-not-approved': 'Host is not on the approved domains list.',
  'host-blocked-local': 'Host points to a local or private network.',
  'query-contains-credential-like-parameter': 'Query string contains a credential-like parameter.',
  'custom-link-requires-approval': 'Custom link requires approval before opening.',
  'iframe-blocked-by-default': 'Iframe embedding is not permitted.',
  'current-image-blocked-by-default': 'Current-image embedding is not permitted.',
  'policy-unavailable': 'URL policy could not be evaluated.',
};

const SURFACE_SUBTITLE =
  'Launch and reference layer for project external systems. Read-only preview · no live external API calls in this prompt.';

const ZERO_SUMMARY: IPccLaunchPadSummaryViewModel = {
  totalProjects: 0,
  activeLinks: 0,
  mappingsWithWarnings: 0,
  pendingReviews: 0,
};

function resolveSystemMeta(link: IProjectExternalLaunchLink): {
  displayName: string;
  category: ExternalSystemCategory;
} {
  const def = EXTERNAL_SYSTEM_REGISTRY[link.systemKey];
  if (def) {
    return { displayName: def.displayName, category: def.category };
  }
  return { displayName: link.providerName, category: 'custom' };
}

function deriveLinkRow(link: IProjectExternalLaunchLink): IPccLaunchPadLinkRow {
  const meta = resolveSystemMeta(link);
  const policyAllowed = link.urlPolicyState === 'allowed';
  const approvalAllowed = link.approvalState === 'approved';
  const policyAndApprovalAllowed = policyAllowed && approvalAllowed;
  const disabledReason = policyAllowed
    ? APPROVAL_STATE_REASONS[link.approvalState]
    : (URL_POLICY_REASON_LABELS[link.policyReason] ??
      URL_POLICY_REASON_LABELS[link.urlPolicyState]);

  return {
    id: link.id,
    title: link.title,
    providerName: link.providerName,
    systemKey: link.systemKey,
    systemDisplayName: meta.displayName,
    category: meta.category,
    linkType: link.linkType,
    hostname: link.hostname,
    openInNewTab: link.openInNewTab,
    approvalState: link.approvalState,
    urlPolicyState: link.urlPolicyState,
    policyReason: link.policyReason,
    policyAndApprovalAllowed,
    disabledReason,
  };
}

function groupRowsByCategory(
  rows: readonly IPccLaunchPadLinkRow[],
): readonly IPccLaunchPadLinkGroup[] {
  const order: ExternalSystemCategory[] = [];
  const buckets = new Map<ExternalSystemCategory, IPccLaunchPadLinkRow[]>();
  for (const row of rows) {
    if (!buckets.has(row.category)) {
      buckets.set(row.category, []);
      order.push(row.category);
    }
    buckets.get(row.category)!.push(row);
  }
  return order.map((category) => ({
    category,
    rows: buckets.get(category) ?? [],
  }));
}

function formatDueAt(dueAtUtc: string | null): string {
  if (dueAtUtc === null) return 'No due date';
  return dueAtUtc.slice(0, 10);
}

function deriveReviewItemRow(
  item: IExternalReviewItem,
  linkLookup: ReadonlyMap<string, IPccLaunchPadLinkRow>,
): IPccLaunchPadReviewItemRow {
  const def = EXTERNAL_SYSTEM_REGISTRY[item.systemKey];
  const systemDisplayName = def?.displayName ?? item.systemKey;
  const subjectLinkRow =
    item.issueType === 'custom-link-approval' ? linkLookup.get(item.subjectKey) : undefined;
  const base: Omit<IPccLaunchPadReviewItemRow, 'resolutionSummary'> = {
    id: item.id,
    issueType: item.issueType,
    reviewState: item.reviewState,
    systemKey: item.systemKey,
    systemDisplayName,
    subjectKey: item.subjectKey,
    subjectLinkRow,
    currentOwnerPersona: item.currentOwnerPersona,
    currentOwnerUpn: item.currentOwnerUpn,
    priorityActionId: item.priorityActionId,
    approvalRequestId: item.approvalRequestId,
    dueAtUtc: item.dueAtUtc,
    dueAtDisplay: formatDueAt(item.dueAtUtc),
    issueSummary: item.issueSummary,
  };
  if (item.reviewState === 'closed') {
    return { ...base, resolutionSummary: item.resolutionSummary };
  }
  return base;
}

function groupRowsByReviewState(
  rows: readonly IPccLaunchPadReviewItemRow[],
): readonly IPccLaunchPadReviewQueueGroup[] {
  const buckets = new Map<ExternalReviewState, IPccLaunchPadReviewItemRow[]>();
  for (const state of EXTERNAL_REVIEW_STATES) {
    buckets.set(state, []);
  }
  for (const row of rows) {
    buckets.get(row.reviewState)!.push(row);
  }
  return EXTERNAL_REVIEW_STATES.map((reviewState) => ({
    reviewState,
    rows: buckets.get(reviewState) ?? [],
  }));
}

function buildHeaderViewModel(
  envelope: PccReadModelEnvelope<IPccExternalSystemsLaunchPadReadModel>,
): IPccLaunchPadHeaderViewModel {
  return {
    projectId: envelope.projectId,
    subtitle: SURFACE_SUBTITLE,
  };
}

function buildProjectLinksViewModel(data: IPccExternalSystemsLaunchPadReadModel): {
  vm: IPccLaunchPadProjectLinksViewModel;
  lookup: ReadonlyMap<string, IPccLaunchPadLinkRow>;
} {
  const rows = data.projectLaunchLinks.map(deriveLinkRow);
  const lookup = new Map<string, IPccLaunchPadLinkRow>();
  for (const row of rows) lookup.set(row.id, row);
  return {
    vm: { totalLinks: rows.length, groups: groupRowsByCategory(rows) },
    lookup,
  };
}

function buildReviewQueueViewModel(
  data: IPccExternalSystemsLaunchPadReadModel,
  linkLookup: ReadonlyMap<string, IPccLaunchPadLinkRow>,
): IPccLaunchPadReviewQueueViewModel {
  const rows = data.reviewItems.map((item) => deriveReviewItemRow(item, linkLookup));
  return { totalItems: rows.length, groups: groupRowsByReviewState(rows) };
}

function buildSummaryViewModel(
  data: IPccExternalSystemsLaunchPadReadModel,
): IPccLaunchPadSummaryViewModel {
  return data.summary ?? ZERO_SUMMARY;
}

function buildRoleActionVisibility(
  data: IPccExternalSystemsLaunchPadReadModel,
  viewerPersona: PccPersona | undefined,
): IPccLaunchPadRoleActionVisibility {
  if (!data.roleActionMatrix || viewerPersona === undefined) return {};
  // PccPersona is a structurally compatible role-id space for the matrix's
  // ExternalSystemRoleId values shared in @hbc/models/pcc.
  const out: Partial<Record<ExternalSystemActionId, PccLaunchPadActionDecision>> = {};
  for (const entry of data.roleActionMatrix) {
    if ((entry.roleId as unknown as PccPersona) !== viewerPersona) continue;
    out[entry.actionId] = entry.decision;
  }
  return out;
}

export function buildPccLaunchPadViewModel(
  envelope: PccReadModelEnvelope<IPccExternalSystemsLaunchPadReadModel>,
  viewerPersona?: PccPersona,
): IPccLaunchPadViewModel {
  const projectLinks = buildProjectLinksViewModel(envelope.data);
  const ready: IPccLaunchPadReadyViewModel = {
    status: 'ready',
    cardState: mapPccSourceStatusToPreviewState(envelope.sourceStatus),
    sourceStatus: envelope.sourceStatus,
    header: buildHeaderViewModel(envelope),
    summary: buildSummaryViewModel(envelope.data),
    projectLinks: projectLinks.vm,
    reviewQueue: buildReviewQueueViewModel(envelope.data, projectLinks.lookup),
    roleActionVisibility: buildRoleActionVisibility(envelope.data, viewerPersona),
  };
  return ready;
}
