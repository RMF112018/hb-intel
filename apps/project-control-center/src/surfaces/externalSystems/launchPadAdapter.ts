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
 * Prompt 07 scope adds: registry inventory grouped by posture, mapping
 * status grouped by canonical mappingState, source health grouped by
 * severity, audit history sorted newest-first with metadata redacted by
 * construction (`metadataJson` never copied to the view-model), and HBI
 * source lineage grouped by canonical state with refusal copy mapped from
 * the canonical `HBI_REFUSED_CAPABILITIES` tuple.
 */

import {
  EXTERNAL_REVIEW_STATES,
  EXTERNAL_SYSTEM_MAPPING_STATES,
  EXTERNAL_SYSTEM_POSTURE_KINDS,
  EXTERNAL_SYSTEM_REGISTRY,
  HBI_REFUSAL_REASON_CODES,
  HBI_REFUSED_CAPABILITIES,
  HBI_SOURCE_LINEAGE_STATES,
  type ExternalReviewState,
  type ExternalSystemActionId,
  type ExternalSystemCategory,
  type ExternalSystemMappingState,
  type ExternalSystemPostureKind,
  type HbiRefusalReasonCode,
  type HbiSourceLineageState,
  type IExternalReviewItem,
  type IExternalSystemAuditEvent,
  type IExternalSystemDefinition,
  type IExternalSystemHealthSnapshot,
  type IHbiSourceLineageEntry,
  type IPccExternalSystemsLaunchPadReadModel,
  type IProjectExternalLaunchLink,
  type IProjectExternalSystemMapping,
  type PccPersona,
  type PccReadModelEnvelope,
  type ProjectExternalLinkApprovalState,
  type UrlPolicyReasonCode,
} from '@hbc/models/pcc';
import { mapPccSourceStatusToPreviewState } from '../../api/pccReadModelStateMapping.js';
import type {
  IPccLaunchPadAuditEventRow,
  IPccLaunchPadAuditHistoryViewModel,
  IPccLaunchPadHbiLineageEntry,
  IPccLaunchPadHbiLineageGroup,
  IPccLaunchPadHbiLineageViewModel,
  IPccLaunchPadHeaderViewModel,
  IPccLaunchPadHealthRow,
  IPccLaunchPadLinkGroup,
  IPccLaunchPadLinkRow,
  IPccLaunchPadMappingRow,
  IPccLaunchPadMappingStatusGroup,
  IPccLaunchPadMappingStatusViewModel,
  IPccLaunchPadProjectLinksViewModel,
  IPccLaunchPadReadyViewModel,
  IPccLaunchPadRegistryGroup,
  IPccLaunchPadRegistryRow,
  IPccLaunchPadRegistryViewModel,
  IPccLaunchPadReviewItemRow,
  IPccLaunchPadReviewQueueGroup,
  IPccLaunchPadReviewQueueViewModel,
  IPccLaunchPadRoleActionVisibility,
  IPccLaunchPadSourceHealthGroup,
  IPccLaunchPadSourceHealthViewModel,
  IPccLaunchPadSummaryViewModel,
  IPccLaunchPadViewModel,
  PccLaunchPadActionDecision,
  PccLaunchPadHealthSeverity,
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

const SURFACE_SUBTITLE = 'Launch and reference layer for project external systems.';

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

// ---------------------------------------------------------------------------
// Prompt 07 — registry / mapping / health / audit / HBI lineage derivations
// ---------------------------------------------------------------------------

function deriveRegistryRow(def: IExternalSystemDefinition): IPccLaunchPadRegistryRow {
  return {
    systemKey: def.systemKey,
    displayName: def.displayName,
    category: def.category,
    posture: def.posture,
    mvpMode: def.mvpMode,
    liveReadPosture: def.liveReadPosture,
    writebackPolicy: def.writebackPolicy,
    activeState: def.liveReadPosture === 'not-authorized' ? 'launch-only-inactive' : 'active',
    recordOwner: def.recordOwner,
    notes: def.notes,
  };
}

function groupRegistryRowsByPosture(
  rows: readonly IPccLaunchPadRegistryRow[],
): readonly IPccLaunchPadRegistryGroup[] {
  const buckets = new Map<ExternalSystemPostureKind, IPccLaunchPadRegistryRow[]>();
  for (const posture of EXTERNAL_SYSTEM_POSTURE_KINDS) {
    buckets.set(posture, []);
  }
  for (const row of rows) {
    buckets.get(row.posture)!.push(row);
  }
  return EXTERNAL_SYSTEM_POSTURE_KINDS.map((posture) => ({
    posture,
    rows: buckets.get(posture) ?? [],
  }));
}

function buildRegistryViewModel(
  data: IPccExternalSystemsLaunchPadReadModel,
): IPccLaunchPadRegistryViewModel {
  const rows = data.systemDefinitions.map(deriveRegistryRow);
  return { totalSystems: rows.length, groups: groupRegistryRowsByPosture(rows) };
}

function formatTimestampDate(iso: string | null): string {
  if (iso === null) return '—';
  return iso.slice(0, 10);
}

function deriveMappingRow(mapping: IProjectExternalSystemMapping): IPccLaunchPadMappingRow {
  const def = EXTERNAL_SYSTEM_REGISTRY[mapping.systemKey];
  const systemDisplayName = def?.displayName ?? mapping.systemKey;
  const base: Omit<
    IPccLaunchPadMappingRow,
    'externalObjectId' | 'externalObjectNumber' | 'conflictingMappingId'
  > = {
    id: mapping.id,
    systemKey: mapping.systemKey,
    systemDisplayName,
    mappingState: mapping.mappingState,
    mappingScope: mapping.mappingScope,
    sourceObjectType: mapping.sourceObjectType,
    externalDisplayName: mapping.externalDisplayName,
    ownerPersona: mapping.ownerPersona,
    ownerUpn: mapping.ownerUpn,
    lastVerifiedAtUtc: mapping.lastVerifiedAtUtc,
    lastVerifiedDisplay: formatTimestampDate(mapping.lastVerifiedAtUtc),
    reviewItemId: mapping.reviewItemId,
  };
  switch (mapping.mappingState) {
    case 'mapped':
    case 'confirmed':
    case 'stale':
      return {
        ...base,
        externalObjectId: mapping.externalObjectId,
        externalObjectNumber: mapping.externalObjectNumber,
      };
    case 'conflict':
    case 'review-required':
    case 'blocked':
      return {
        ...base,
        externalObjectId: mapping.externalObjectId,
        externalObjectNumber: mapping.externalObjectNumber,
        conflictingMappingId: mapping.conflictingMappingId,
      };
    case 'not-mapped':
    case 'missing':
    default:
      return base;
  }
}

function groupMappingsByState(
  rows: readonly IPccLaunchPadMappingRow[],
): readonly IPccLaunchPadMappingStatusGroup[] {
  const buckets = new Map<ExternalSystemMappingState, IPccLaunchPadMappingRow[]>();
  for (const state of EXTERNAL_SYSTEM_MAPPING_STATES) {
    buckets.set(state, []);
  }
  for (const row of rows) {
    buckets.get(row.mappingState)!.push(row);
  }
  return EXTERNAL_SYSTEM_MAPPING_STATES.map((mappingState) => ({
    mappingState,
    rows: buckets.get(mappingState) ?? [],
  }));
}

function buildMappingStatusViewModel(
  data: IPccExternalSystemsLaunchPadReadModel,
): IPccLaunchPadMappingStatusViewModel {
  const rows = data.projectMappings.map(deriveMappingRow);
  return { totalMappings: rows.length, groups: groupMappingsByState(rows) };
}

function deriveHealthRow(snap: IExternalSystemHealthSnapshot): IPccLaunchPadHealthRow {
  const def = EXTERNAL_SYSTEM_REGISTRY[snap.systemKey];
  const systemDisplayName = def?.displayName ?? snap.systemKey;
  const base: Omit<
    IPccLaunchPadHealthRow,
    'lastSuccessfulReadAtUtc' | 'lastSuccessfulReadDisplay'
  > = {
    healthSnapshotId: snap.healthSnapshotId,
    systemKey: snap.systemKey,
    systemDisplayName,
    healthState: snap.healthState,
    severity: snap.severity,
    statusMessage: snap.statusMessage,
    recommendedAction: snap.recommendedAction,
    observedAtUtc: snap.observedAtUtc,
    observedAtDisplay: formatTimestampDate(snap.observedAtUtc),
  };
  switch (snap.healthState) {
    case 'healthy':
    case 'warning':
    case 'degraded':
    case 'missing-config':
    case 'throttled':
    case 'stale':
      return {
        ...base,
        lastSuccessfulReadAtUtc: snap.lastSuccessfulReadAtUtc,
        lastSuccessfulReadDisplay: formatTimestampDate(snap.lastSuccessfulReadAtUtc),
      };
    case 'unavailable':
    case 'access-denied':
    case 'unknown':
    default:
      // Discriminant forbids `lastSuccessfulReadAtUtc` on these states; the
      // adapter mirrors that posture by omitting the field entirely.
      return base;
  }
}

const HEALTH_SEVERITY_ORDER: readonly PccLaunchPadHealthSeverity[] = [
  'critical',
  'warning',
  'info',
];

function groupHealthRowsBySeverity(
  rows: readonly IPccLaunchPadHealthRow[],
): readonly IPccLaunchPadSourceHealthGroup[] {
  const buckets = new Map<PccLaunchPadHealthSeverity, IPccLaunchPadHealthRow[]>();
  for (const sev of HEALTH_SEVERITY_ORDER) {
    buckets.set(sev, []);
  }
  for (const row of rows) {
    buckets.get(row.severity)!.push(row);
  }
  return HEALTH_SEVERITY_ORDER.map((severity) => ({
    severity,
    rows: buckets.get(severity) ?? [],
  }));
}

function buildSourceHealthViewModel(
  data: IPccExternalSystemsLaunchPadReadModel,
): IPccLaunchPadSourceHealthViewModel {
  const rows = data.healthSnapshots.map(deriveHealthRow);
  return { totalSnapshots: rows.length, groups: groupHealthRowsBySeverity(rows) };
}

function formatTimestampInstant(iso: string): string {
  // YYYY-MM-DD HH:mm UTC. Display only — no timezone conversion in the adapter.
  const datePart = iso.slice(0, 10);
  const timePart = iso.slice(11, 16);
  return `${datePart} ${timePart} UTC`;
}

function deriveAuditRow(event: IExternalSystemAuditEvent): IPccLaunchPadAuditEventRow {
  const def = EXTERNAL_SYSTEM_REGISTRY[event.systemKey];
  const systemDisplayName = def?.displayName ?? event.systemKey;
  // `metadataJson` is intentionally NOT copied into the row. The audit card
  // never renders metadata to text, `data-*`, `title`, or `aria-label`.
  return {
    eventId: event.eventId,
    eventType: event.eventType,
    systemKey: event.systemKey,
    systemDisplayName,
    actorPersona: event.actorPersona,
    actorUpn: event.actorUpn,
    actorDisplay: event.actorUpn ?? 'system',
    occurredAtUtc: event.occurredAtUtc,
    occurredAtDisplay: formatTimestampInstant(event.occurredAtUtc),
    subjectKey: event.subjectKey,
    correlationId: event.correlationId,
    summary: event.summary,
  };
}

function buildAuditHistoryViewModel(
  data: IPccExternalSystemsLaunchPadReadModel,
): IPccLaunchPadAuditHistoryViewModel {
  const rows = data.auditEvents.map(deriveAuditRow);
  // Sort newest-first by occurredAtUtc; ties broken by eventId for stable
  // test ordering.
  const sorted = [...rows].sort((a, b) => {
    if (a.occurredAtUtc === b.occurredAtUtc) {
      return a.eventId < b.eventId ? -1 : 1;
    }
    return a.occurredAtUtc < b.occurredAtUtc ? 1 : -1;
  });
  return { totalEvents: sorted.length, rows: sorted };
}

const HBI_REFUSAL_COPY: Readonly<Record<HbiRefusalReasonCode, string>> = (() => {
  // The canonical tuple `HBI_REFUSAL_REASON_CODES` and the user-facing
  // `HBI_REFUSED_CAPABILITIES` are index-aligned in `@hbc/models/pcc`.
  // Build the reason-code → user-facing copy map once.
  const out: Partial<Record<HbiRefusalReasonCode, string>> = {};
  HBI_REFUSAL_REASON_CODES.forEach((code, idx) => {
    const capability = HBI_REFUSED_CAPABILITIES[idx] ?? code;
    out[code] = `HBI cannot ${capability}.`;
  });
  return out as Readonly<Record<HbiRefusalReasonCode, string>>;
})();

const HBI_BOUNDARY_COPY =
  'HBI is not an authority. Citation-ready entries reflect lineage only — HBI never approves, posts, claims, or overrides.';

const HBI_UNAUTHORIZED_REDACTED_CAPTION =
  'Access redacted — source details are not visible to the current viewer.';

function deriveHbiLineageEntry(entry: IHbiSourceLineageEntry): IPccLaunchPadHbiLineageEntry {
  const base = {
    fieldKey: entry.fieldKey,
    fieldLabel: entry.fieldLabel,
    transformationNote: entry.transformationNote,
    confidenceBand: entry.confidenceBand,
    freshnessBand: entry.freshnessBand,
  } as const;
  switch (entry.state) {
    case 'citation-ready':
      return {
        ...base,
        state: 'citation-ready',
        sourceSystemKey: entry.sourceSystemKey,
        sourceListOrSystem: entry.sourceListOrSystem,
        sourceObjectType: entry.sourceObjectType,
        citationLabel: entry.citationLabel,
      };
    case 'refusal':
      return {
        ...base,
        state: 'refusal',
        refusalCode: entry.refusalCode,
        refusalCopy: HBI_REFUSAL_COPY[entry.refusalCode] ?? `HBI refused: ${entry.refusalCode}.`,
      };
    case 'unauthorized':
      return {
        ...base,
        state: 'unauthorized',
        redactedCaption: HBI_UNAUTHORIZED_REDACTED_CAPTION,
      };
    case 'loading':
    case 'unavailable':
    case 'insufficient-evidence':
    default:
      return { ...base, state: entry.state };
  }
}

function groupHbiLineageRowsByState(
  rows: readonly IPccLaunchPadHbiLineageEntry[],
): readonly IPccLaunchPadHbiLineageGroup[] {
  const buckets = new Map<HbiSourceLineageState, IPccLaunchPadHbiLineageEntry[]>();
  for (const state of HBI_SOURCE_LINEAGE_STATES) {
    buckets.set(state, []);
  }
  for (const row of rows) {
    buckets.get(row.state)!.push(row);
  }
  return HBI_SOURCE_LINEAGE_STATES.map((state) => ({
    state,
    rows: buckets.get(state) ?? [],
  }));
}

function buildHbiLineageViewModel(
  data: IPccExternalSystemsLaunchPadReadModel,
): IPccLaunchPadHbiLineageViewModel {
  const rows = data.hbiLineage.map(deriveHbiLineageEntry);
  return {
    totalEntries: rows.length,
    groups: groupHbiLineageRowsByState(rows),
    boundaryCopy: HBI_BOUNDARY_COPY,
  };
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
    registry: buildRegistryViewModel(envelope.data),
    mappingStatus: buildMappingStatusViewModel(envelope.data),
    sourceHealth: buildSourceHealthViewModel(envelope.data),
    auditHistory: buildAuditHistoryViewModel(envelope.data),
    hbiLineage: buildHbiLineageViewModel(envelope.data),
  };
  return ready;
}
