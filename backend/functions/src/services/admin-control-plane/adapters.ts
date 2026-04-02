/**
 * Admin Control Plane — Phase 3 adapter descriptor definitions.
 *
 * Defines the adapter set available during Phase 3. Each descriptor declares
 * the adapter's capabilities, platform category, and implementation status.
 * Later phases add real invokers and new adapters without changing the
 * registry model.
 *
 * Adapter status:
 * - 'implemented' — fully functional with real invoker
 * - 'partial' — descriptor registered, invoker may be stub or limited
 * - 'planned' — descriptor registered for discovery, no invoker
 *
 * See: Phase 2 adapter registry contract, Phase 3 Summary Plan (P3-06)
 *
 * @module admin-control-plane/services
 */

import { AdminAdapterCategory } from '@hbc/models/admin-control-plane';
import type { IAdminAdapterDescriptor } from '@hbc/models/admin-control-plane';
import type { AdminAdapterRegistry } from './adapter-registry.js';
import { createProvisioningBridgeInvoker } from './orchestration-bridge.js';

// ─── Phase 3 Adapter Descriptors ────────────────────────────────────────────────

export const PROVISIONING_BRIDGE_ADAPTER: IAdminAdapterDescriptor = {
  adapterKey: 'provisioning:bridge',
  category: AdminAdapterCategory.SharePointSite,
  label: 'Provisioning Bridge',
  description: 'Bridges admin control plane runs to the existing provisioning saga orchestrator',
  domains: ['provisioning' as never],
  supportsDryRun: false,
  supportsCompensation: true,
  idempotent: false,
  operations: ['launchProvisioningSaga', 'retryProvisioningSaga'],
  implementationStatus: 'partial',
};

export const VALIDATION_PROBE_ADAPTER: IAdminAdapterDescriptor = {
  adapterKey: 'validation-probe:readiness',
  category: AdminAdapterCategory.ValidationProbe,
  label: 'Validation Probe',
  description: 'Executes environment readiness and health validation probes',
  domains: ['provisioning' as never, 'installBootstrap' as never],
  supportsDryRun: true,
  supportsCompensation: false,
  idempotent: true,
  operations: ['checkReadiness', 'probeHealth'],
  implementationStatus: 'partial',
};

export const CONFIG_LOOKUP_ADAPTER: IAdminAdapterDescriptor = {
  adapterKey: 'table-storage:config-lookup',
  category: AdminAdapterCategory.TableStorage,
  label: 'Config Lookup',
  description: 'Retrieves configuration and standards snapshots from Table Storage',
  domains: [],
  supportsDryRun: false,
  supportsCompensation: false,
  idempotent: true,
  operations: ['getConfig', 'snapshotConfig'],
  implementationStatus: 'planned',
};

export const ENTRA_GRAPH_ADAPTER: IAdminAdapterDescriptor = {
  adapterKey: 'entra-graph:group-lifecycle',
  category: AdminAdapterCategory.EntraGraph,
  label: 'Entra Graph — Group Lifecycle',
  description: 'Microsoft Graph operations for security group creation, membership, and site access grants',
  domains: ['provisioning' as never, 'entraControl' as never],
  supportsDryRun: false,
  supportsCompensation: true,
  idempotent: false,
  operations: ['createSecurityGroup', 'addGroupMembers', 'grantSiteAccess'],
  implementationStatus: 'partial',
};

export const SHAREPOINT_SITE_ADAPTER: IAdminAdapterDescriptor = {
  adapterKey: 'sharepoint-site:lifecycle',
  category: AdminAdapterCategory.SharePointSite,
  label: 'SharePoint Site Lifecycle',
  description: 'SharePoint site creation, content provisioning, hub association, and permissions',
  domains: ['provisioning' as never, 'sharepointControl' as never],
  supportsDryRun: false,
  supportsCompensation: true,
  idempotent: false,
  operations: ['createSite', 'createDocumentLibrary', 'uploadTemplates', 'createDataLists', 'associateHub', 'setPermissions'],
  implementationStatus: 'partial',
};

// ─── Placeholder Adapters (planned for later phases) ────────────────────────────

export const AZURE_DEPLOYMENT_ADAPTER: IAdminAdapterDescriptor = {
  adapterKey: 'azure-deployment:bicep',
  category: AdminAdapterCategory.AzureDeployment,
  label: 'Azure Deployment (Bicep)',
  description: 'ARM/Bicep resource deployment for backend install/bootstrap',
  domains: ['installBootstrap' as never],
  supportsDryRun: true,
  supportsCompensation: false,
  idempotent: false,
  operations: ['deployResourceGroup', 'deployFunctionApp', 'deployStorage'],
  implementationStatus: 'planned',
};

export const SHAREPOINT_ALM_ADAPTER: IAdminAdapterDescriptor = {
  adapterKey: 'sharepoint-alm:package-install',
  category: AdminAdapterCategory.SharePointAlm,
  label: 'SharePoint ALM — Package Install',
  description: 'App catalog and SPFx package deployment',
  domains: ['provisioning' as never, 'sharepointControl' as never],
  supportsDryRun: false,
  supportsCompensation: false,
  idempotent: true,
  operations: ['installWebParts'],
  implementationStatus: 'planned',
};

export const SHAREPOINT_API_ACCESS_ADAPTER: IAdminAdapterDescriptor = {
  adapterKey: 'sharepoint-api-access:permissions',
  category: AdminAdapterCategory.SharePointApiAccess,
  label: 'SharePoint API Access',
  description: 'API permission approvals and consent management',
  domains: ['sharepointControl' as never],
  supportsDryRun: true,
  supportsCompensation: false,
  idempotent: true,
  operations: ['checkPermissions', 'requestApproval'],
  implementationStatus: 'planned',
};

export const SIGNALR_PROGRESS_ADAPTER: IAdminAdapterDescriptor = {
  adapterKey: 'signalr:progress',
  category: AdminAdapterCategory.SignalR,
  label: 'SignalR Progress',
  description: 'Real-time progress updates via SignalR',
  domains: [],
  supportsDryRun: false,
  supportsCompensation: false,
  idempotent: true,
  operations: ['pushProgress', 'closeGroup'],
  implementationStatus: 'planned',
};

export const NOTIFICATION_DISPATCH_ADAPTER: IAdminAdapterDescriptor = {
  adapterKey: 'notification:dispatch',
  category: AdminAdapterCategory.Notification,
  label: 'Notification Dispatch',
  description: 'Email and Teams webhook notification delivery',
  domains: [],
  supportsDryRun: false,
  supportsCompensation: false,
  idempotent: false,
  operations: ['dispatch'],
  implementationStatus: 'planned',
};

// ─── All Phase 3 Adapter Descriptors ────────────────────────────────────────────

/** All adapter descriptors registered during Phase 3 initialization. */
export const PHASE_3_ADAPTERS: readonly IAdminAdapterDescriptor[] = [
  PROVISIONING_BRIDGE_ADAPTER,
  VALIDATION_PROBE_ADAPTER,
  CONFIG_LOOKUP_ADAPTER,
  ENTRA_GRAPH_ADAPTER,
  SHAREPOINT_SITE_ADAPTER,
  AZURE_DEPLOYMENT_ADAPTER,
  SHAREPOINT_ALM_ADAPTER,
  SHAREPOINT_API_ACCESS_ADAPTER,
  SIGNALR_PROGRESS_ADAPTER,
  NOTIFICATION_DISPATCH_ADAPTER,
];

/**
 * Register all Phase 3 adapter descriptors with the registry.
 *
 * Called during service factory initialization. Registers descriptors
 * with invokers where available. The provisioning bridge adapter gets
 * a real invoker (P3-07); other adapters get invokers in later prompts/phases.
 */
export function registerPhase3Adapters(registry: AdminAdapterRegistry): void {
  for (const descriptor of PHASE_3_ADAPTERS) {
    if (descriptor.adapterKey === 'provisioning:bridge') {
      // P3-07: Wire provisioning bridge with real invoker
      registry.register(descriptor, createProvisioningBridgeInvoker());
    } else {
      registry.register(descriptor);
    }
  }
  console.log(`[registerPhase3Adapters] Registered ${PHASE_3_ADAPTERS.length} adapter descriptors (1 with invoker)`);
}
