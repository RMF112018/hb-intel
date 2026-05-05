/**
 * PCC External Systems Launch Pad read-model adapter (Phase 3 / Wave 15 / Prompt 05).
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
 * Prompt 05 scope: header, summary band, project launch links. Review
 * queue, audit history, registry inventory, mapping health, and HBI
 * lineage are intentionally excluded.
 */

import {
  EXTERNAL_SYSTEM_REGISTRY,
  type ExternalSystemCategory,
  type IPccExternalSystemsLaunchPadReadModel,
  type IProjectExternalLaunchLink,
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
  IPccLaunchPadSummaryViewModel,
  IPccLaunchPadViewModel,
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

function buildHeaderViewModel(
  envelope: PccReadModelEnvelope<IPccExternalSystemsLaunchPadReadModel>,
): IPccLaunchPadHeaderViewModel {
  return {
    projectId: envelope.projectId,
    subtitle: SURFACE_SUBTITLE,
  };
}

function buildProjectLinksViewModel(
  data: IPccExternalSystemsLaunchPadReadModel,
): IPccLaunchPadProjectLinksViewModel {
  const rows = data.projectLaunchLinks.map(deriveLinkRow);
  return {
    totalLinks: rows.length,
    groups: groupRowsByCategory(rows),
  };
}

function buildSummaryViewModel(
  data: IPccExternalSystemsLaunchPadReadModel,
): IPccLaunchPadSummaryViewModel {
  return data.summary ?? ZERO_SUMMARY;
}

export function buildPccLaunchPadViewModel(
  envelope: PccReadModelEnvelope<IPccExternalSystemsLaunchPadReadModel>,
): IPccLaunchPadViewModel {
  const ready: IPccLaunchPadReadyViewModel = {
    status: 'ready',
    cardState: mapPccSourceStatusToPreviewState(envelope.sourceStatus),
    sourceStatus: envelope.sourceStatus,
    header: buildHeaderViewModel(envelope),
    summary: buildSummaryViewModel(envelope.data),
    projectLinks: buildProjectLinksViewModel(envelope.data),
  };
  return ready;
}
