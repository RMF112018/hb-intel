/**
 * P9-05: Workflow routing primitives for hybrid identity actions.
 *
 * Resolves source-of-authority, execution boundary, required connectors,
 * preflight checks, and risk tier for each action. Later prompts (06–09)
 * use these routing decisions to dispatch to the correct adapter.
 */

import type {
  HybridIdentityActionId,
  IHybridIdentityActionDescriptor,
  IWorkflowRoutingDecision,
  HybridIdentityDomain,
  HybridIdentityRiskTier,
  CheckpointRequirement,
  ExecutionBoundary,
} from './hybrid-identity-contracts.js';
import type { IdentityAuthorityType } from './graph-service.js';
import type { ConnectorClass } from './connection-registry-service.js';

// ─── Action catalog (static descriptors) ───────────────────────────────────────

const ACTION_CATALOG: readonly IHybridIdentityActionDescriptor[] = [
  // User read
  { id: 'user:search', domain: 'user', label: 'Search users', sourceOfAuthority: 'visibility', riskTier: 'routine', destructive: false, checkpoint: 'none', executionBoundary: 'graph', requiredConnector: 'graph-identity', graphPermission: 'User.Read.All', addsRequirement: null, auditLevel: 'read', phaseDisposition: 'implement-now' },
  { id: 'user:read', domain: 'user', label: 'Read user profile', sourceOfAuthority: 'visibility', riskTier: 'routine', destructive: false, checkpoint: 'none', executionBoundary: 'graph', requiredConnector: 'graph-identity', graphPermission: 'User.Read.All', addsRequirement: null, auditLevel: 'read', phaseDisposition: 'implement-now' },
  // User lifecycle — AD DS
  { id: 'user:create-adds', domain: 'user', label: 'Create user (AD DS)', sourceOfAuthority: 'ad-ds', riskTier: 'elevated', destructive: false, checkpoint: 'preview', executionBoundary: 'ad-ds', requiredConnector: 'ad-ds', graphPermission: null, addsRequirement: 'Create user in target OU', auditLevel: 'full-with-evidence', phaseDisposition: 'implement-now' },
  { id: 'user:update-adds', domain: 'user', label: 'Update user (AD DS)', sourceOfAuthority: 'ad-ds', riskTier: 'routine', destructive: false, checkpoint: 'preview', executionBoundary: 'ad-ds', requiredConnector: 'ad-ds', graphPermission: null, addsRequirement: 'Modify user attributes', auditLevel: 'full', phaseDisposition: 'implement-now' },
  { id: 'user:disable-adds', domain: 'user', label: 'Disable user (AD DS)', sourceOfAuthority: 'ad-ds', riskTier: 'elevated', destructive: false, checkpoint: 'confirmation', executionBoundary: 'ad-ds', requiredConnector: 'ad-ds', graphPermission: null, addsRequirement: 'Disable account', auditLevel: 'full-with-evidence', phaseDisposition: 'implement-now' },
  { id: 'user:enable-adds', domain: 'user', label: 'Enable user (AD DS)', sourceOfAuthority: 'ad-ds', riskTier: 'routine', destructive: false, checkpoint: 'confirmation', executionBoundary: 'ad-ds', requiredConnector: 'ad-ds', graphPermission: null, addsRequirement: 'Enable account', auditLevel: 'full', phaseDisposition: 'implement-now' },
  { id: 'user:delete-adds', domain: 'user', label: 'Delete user (AD DS)', sourceOfAuthority: 'ad-ds', riskTier: 'destructive', destructive: true, checkpoint: 'double-confirmation', executionBoundary: 'ad-ds', requiredConnector: 'ad-ds', graphPermission: null, addsRequirement: 'Delete user', auditLevel: 'full-with-evidence', phaseDisposition: 'implement-now' },
  // User lifecycle — Cloud
  { id: 'user:create-cloud', domain: 'user', label: 'Create cloud-only user', sourceOfAuthority: 'entra', riskTier: 'elevated', destructive: false, checkpoint: 'preview', executionBoundary: 'graph', requiredConnector: 'graph-identity', graphPermission: 'User.ReadWrite.All', addsRequirement: null, auditLevel: 'full-with-evidence', phaseDisposition: 'implement-now' },
  { id: 'user:update-cloud', domain: 'user', label: 'Update cloud-only user', sourceOfAuthority: 'entra', riskTier: 'routine', destructive: false, checkpoint: 'preview', executionBoundary: 'graph', requiredConnector: 'graph-identity', graphPermission: 'User.ReadWrite.All', addsRequirement: null, auditLevel: 'full', phaseDisposition: 'implement-now' },
  { id: 'user:disable-cloud', domain: 'user', label: 'Disable cloud-only user', sourceOfAuthority: 'entra', riskTier: 'elevated', destructive: false, checkpoint: 'confirmation', executionBoundary: 'graph', requiredConnector: 'graph-identity', graphPermission: 'User.ReadWrite.All', addsRequirement: null, auditLevel: 'full-with-evidence', phaseDisposition: 'implement-now' },
  { id: 'user:enable-cloud', domain: 'user', label: 'Enable cloud-only user', sourceOfAuthority: 'entra', riskTier: 'routine', destructive: false, checkpoint: 'confirmation', executionBoundary: 'graph', requiredConnector: 'graph-identity', graphPermission: 'User.ReadWrite.All', addsRequirement: null, auditLevel: 'full', phaseDisposition: 'implement-now' },
  { id: 'user:delete-cloud', domain: 'user', label: 'Delete cloud-only user', sourceOfAuthority: 'entra', riskTier: 'destructive', destructive: true, checkpoint: 'double-confirmation', executionBoundary: 'graph', requiredConnector: 'graph-identity', graphPermission: 'User.ReadWrite.All', addsRequirement: null, auditLevel: 'full-with-evidence', phaseDisposition: 'implement-now' },
  // Group read
  { id: 'group:search', domain: 'group', label: 'Search groups', sourceOfAuthority: 'visibility', riskTier: 'routine', destructive: false, checkpoint: 'none', executionBoundary: 'graph', requiredConnector: 'graph-identity', graphPermission: 'Group.Read.All', addsRequirement: null, auditLevel: 'read', phaseDisposition: 'implement-now' },
  { id: 'group:read', domain: 'group', label: 'Read group', sourceOfAuthority: 'visibility', riskTier: 'routine', destructive: false, checkpoint: 'none', executionBoundary: 'graph', requiredConnector: 'graph-identity', graphPermission: 'Group.Read.All', addsRequirement: null, auditLevel: 'read', phaseDisposition: 'implement-now' },
  { id: 'group:read-members', domain: 'group', label: 'Read group members', sourceOfAuthority: 'visibility', riskTier: 'routine', destructive: false, checkpoint: 'none', executionBoundary: 'graph', requiredConnector: 'graph-identity', graphPermission: 'GroupMember.Read.All', addsRequirement: null, auditLevel: 'read', phaseDisposition: 'implement-now' },
  // Group lifecycle — Cloud
  { id: 'group:create-cloud', domain: 'group', label: 'Create cloud-only group', sourceOfAuthority: 'entra', riskTier: 'elevated', destructive: false, checkpoint: 'preview', executionBoundary: 'graph', requiredConnector: 'graph-identity', graphPermission: 'Group.ReadWrite.All', addsRequirement: null, auditLevel: 'full-with-evidence', phaseDisposition: 'implement-now' },
  { id: 'group:update-cloud', domain: 'group', label: 'Update cloud-only group', sourceOfAuthority: 'entra', riskTier: 'routine', destructive: false, checkpoint: 'preview', executionBoundary: 'graph', requiredConnector: 'graph-identity', graphPermission: 'Group.ReadWrite.All', addsRequirement: null, auditLevel: 'full', phaseDisposition: 'implement-now' },
  { id: 'group:add-members-cloud', domain: 'group', label: 'Add members (cloud group)', sourceOfAuthority: 'entra', riskTier: 'routine', destructive: false, checkpoint: 'preview', executionBoundary: 'graph', requiredConnector: 'graph-identity', graphPermission: 'GroupMember.ReadWrite.All', addsRequirement: null, auditLevel: 'full', phaseDisposition: 'implement-now' },
  { id: 'group:remove-members-cloud', domain: 'group', label: 'Remove members (cloud group)', sourceOfAuthority: 'entra', riskTier: 'elevated', destructive: false, checkpoint: 'confirmation', executionBoundary: 'graph', requiredConnector: 'graph-identity', graphPermission: 'GroupMember.ReadWrite.All', addsRequirement: null, auditLevel: 'full', phaseDisposition: 'implement-now' },
  { id: 'group:delete-cloud', domain: 'group', label: 'Delete cloud-only group', sourceOfAuthority: 'entra', riskTier: 'destructive', destructive: true, checkpoint: 'double-confirmation', executionBoundary: 'graph', requiredConnector: 'graph-identity', graphPermission: 'Group.ReadWrite.All', addsRequirement: null, auditLevel: 'full-with-evidence', phaseDisposition: 'implement-now' },
  // Group lifecycle — AD DS
  { id: 'group:create-adds', domain: 'group', label: 'Create AD-synced group', sourceOfAuthority: 'ad-ds', riskTier: 'elevated', destructive: false, checkpoint: 'preview', executionBoundary: 'ad-ds', requiredConnector: 'ad-ds', graphPermission: null, addsRequirement: 'Create group in target OU', auditLevel: 'full-with-evidence', phaseDisposition: 'implement-now' },
  { id: 'group:add-members-adds', domain: 'group', label: 'Add members (AD group)', sourceOfAuthority: 'ad-ds', riskTier: 'routine', destructive: false, checkpoint: 'preview', executionBoundary: 'ad-ds', requiredConnector: 'ad-ds', graphPermission: null, addsRequirement: 'Modify group membership', auditLevel: 'full', phaseDisposition: 'implement-now' },
  { id: 'group:remove-members-adds', domain: 'group', label: 'Remove members (AD group)', sourceOfAuthority: 'ad-ds', riskTier: 'elevated', destructive: false, checkpoint: 'confirmation', executionBoundary: 'ad-ds', requiredConnector: 'ad-ds', graphPermission: null, addsRequirement: 'Modify group membership', auditLevel: 'full', phaseDisposition: 'implement-now' },
  { id: 'group:delete-adds', domain: 'group', label: 'Delete AD-synced group', sourceOfAuthority: 'ad-ds', riskTier: 'destructive', destructive: true, checkpoint: 'double-confirmation', executionBoundary: 'ad-ds', requiredConnector: 'ad-ds', graphPermission: null, addsRequirement: 'Delete group', auditLevel: 'full-with-evidence', phaseDisposition: 'implement-now' },
  // Access-setup
  { id: 'access:grant-rollout', domain: 'access-setup', label: 'Grant rollout-critical membership', sourceOfAuthority: 'coordinated', riskTier: 'elevated', destructive: false, checkpoint: 'preview', executionBoundary: 'authority-routed', requiredConnector: 'authority-dependent', graphPermission: 'GroupMember.ReadWrite.All', addsRequirement: 'Modify group membership', auditLevel: 'full-with-evidence', phaseDisposition: 'implement-now' },
  { id: 'access:normalize-employee', domain: 'access-setup', label: 'Normalize new-employee access', sourceOfAuthority: 'coordinated', riskTier: 'elevated', destructive: false, checkpoint: 'preview', executionBoundary: 'authority-routed', requiredConnector: 'authority-dependent', graphPermission: 'GroupMember.ReadWrite.All', addsRequirement: 'Modify group membership', auditLevel: 'full-with-evidence', phaseDisposition: 'implement-now' },
  // Sync
  { id: 'sync:check-user', domain: 'sync', label: 'Check user sync status', sourceOfAuthority: 'visibility', riskTier: 'routine', destructive: false, checkpoint: 'none', executionBoundary: 'graph', requiredConnector: 'graph-identity', graphPermission: 'User.Read.All', addsRequirement: null, auditLevel: 'read', phaseDisposition: 'implement-now' },
  { id: 'sync:check-group', domain: 'sync', label: 'Check group sync status', sourceOfAuthority: 'visibility', riskTier: 'routine', destructive: false, checkpoint: 'none', executionBoundary: 'graph', requiredConnector: 'graph-identity', graphPermission: 'Group.Read.All', addsRequirement: null, auditLevel: 'read', phaseDisposition: 'implement-now' },
  { id: 'sync:check-org', domain: 'sync', label: 'Check org sync time', sourceOfAuthority: 'visibility', riskTier: 'routine', destructive: false, checkpoint: 'none', executionBoundary: 'graph', requiredConnector: 'graph-identity', graphPermission: 'Organization.Read.All', addsRequirement: null, auditLevel: 'read', phaseDisposition: 'implement-now' },
  { id: 'sync:verify-propagation', domain: 'sync', label: 'Verify sync propagation', sourceOfAuthority: 'visibility', riskTier: 'sync-sensitive', destructive: false, checkpoint: 'none', executionBoundary: 'graph', requiredConnector: 'graph-identity', graphPermission: 'User.Read.All', addsRequirement: null, auditLevel: 'read', phaseDisposition: 'implement-now' },
];

// ─── Catalog lookup ────────────────────────────────────────────────────────────

const catalogMap = new Map(ACTION_CATALOG.map((d) => [d.id, d]));

/** Look up a static action descriptor by ID. Returns null if unknown. */
export function getActionDescriptor(actionId: HybridIdentityActionId): IHybridIdentityActionDescriptor | null {
  return catalogMap.get(actionId) ?? null;
}

/** Get all action descriptors. */
export function getAllActionDescriptors(): readonly IHybridIdentityActionDescriptor[] {
  return ACTION_CATALOG;
}

/** Get all implement-now action descriptors. */
export function getImplementNowActions(): readonly IHybridIdentityActionDescriptor[] {
  return ACTION_CATALOG.filter((d) => d.phaseDisposition === 'implement-now');
}

// ─── Routing decision ──────────────────────────────────────────────────────────

/**
 * Resolve the workflow routing decision for an action.
 *
 * This is the central routing function that later prompts use to determine
 * which adapter to call, what connectors to check, and what safety UX to show.
 */
export function resolveRoutingDecision(actionId: HybridIdentityActionId): IWorkflowRoutingDecision | null {
  const descriptor = getActionDescriptor(actionId);
  if (!descriptor) return null;

  const requiredConnectors: ConnectorClass[] = [];
  if (descriptor.requiredConnector === 'ad-ds') requiredConnectors.push('ad-ds');
  else if (descriptor.requiredConnector === 'graph-identity') requiredConnectors.push('graph-identity');
  else if (descriptor.requiredConnector === 'authority-dependent') {
    requiredConnectors.push('graph-identity'); // always need Graph for lookup
    // AD DS connector added dynamically at execution time based on target authority
  }

  const preflightChecks: string[] = [];
  for (const conn of requiredConnectors) {
    preflightChecks.push(`${conn}:healthy`);
  }
  if (descriptor.riskTier === 'destructive') {
    preflightChecks.push('confirmation-token:required');
  }

  const resolvedAuthority = descriptor.sourceOfAuthority === 'visibility'
    ? 'entra' as IdentityAuthorityType  // visibility always routes to Graph
    : descriptor.sourceOfAuthority === 'coordinated'
      ? 'coordinated' as const
      : descriptor.sourceOfAuthority as IdentityAuthorityType;

  return {
    actionId,
    resolvedAuthority,
    executionBoundary: descriptor.executionBoundary,
    requiredConnectors,
    preflightChecks,
    riskTier: descriptor.riskTier,
    checkpoint: descriptor.checkpoint,
  };
}

// ─── Audit payload builder ─────────────────────────────────────────────────────

import type {
  IHybridIdentityAuditPayload,
  IHybridIdentityActor,
  IHybridIdentityAuditTarget,
  IHybridIdentitySyncState,
} from './hybrid-identity-contracts.js';

/**
 * Build a normalized audit payload for a hybrid identity action.
 */
export function buildAuditPayload(params: {
  actionId: HybridIdentityActionId;
  actor: IHybridIdentityActor;
  target: IHybridIdentityAuditTarget;
  correlationId: string;
  success: boolean;
  errorCode?: string;
  errorMessage?: string;
  connectorUsed?: ConnectorClass;
  syncState?: IHybridIdentitySyncState;
  evidenceSummary?: string;
}): IHybridIdentityAuditPayload {
  const descriptor = getActionDescriptor(params.actionId);

  return {
    actionId: params.actionId,
    domain: descriptor?.domain ?? 'user',
    actor: params.actor,
    target: params.target,
    sourceOfAuthority: descriptor?.sourceOfAuthority ?? 'unknown',
    riskTier: descriptor?.riskTier ?? 'routine',
    executionBoundary: descriptor?.executionBoundary ?? 'graph',
    connectorUsed: params.connectorUsed ?? null,
    correlationId: params.correlationId,
    timestamp: new Date().toISOString(),
    success: params.success,
    errorCode: params.errorCode ?? null,
    errorMessage: params.errorMessage ?? null,
    syncState: params.syncState ?? null,
    evidenceSummary: params.evidenceSummary ?? null,
  };
}
