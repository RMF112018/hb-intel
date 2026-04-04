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

// ─── Phase 9.1 Microsoft Device Management Adapters ─────────────────────────────

export const MICROSOFT_INTUNE_ADAPTER: IAdminAdapterDescriptor = {
  adapterKey: 'microsoft-intune:device-enrollment',
  category: AdminAdapterCategory.MicrosoftIntune,
  label: 'Microsoft Intune — Device Enrollment',
  description: 'Intune device enrollment, compliance policy, and configuration profile operations',
  domains: ['white-glove-deployment' as never],
  supportsDryRun: true,
  supportsCompensation: true,
  idempotent: false,
  operations: ['checkEnrollment', 'assignCompliancePolicy', 'assignConfigProfile', 'getComplianceState'],
  implementationStatus: 'partial',
};

export const MICROSOFT_AUTOPILOT_ADAPTER: IAdminAdapterDescriptor = {
  adapterKey: 'microsoft-autopilot:device-registration',
  category: AdminAdapterCategory.MicrosoftAutopilot,
  label: 'Windows Autopilot — Device Registration',
  description: 'Autopilot device registration, deployment profile assignment, and technician pre-provisioning',
  domains: ['white-glove-deployment' as never],
  supportsDryRun: true,
  supportsCompensation: true,
  idempotent: false,
  operations: ['registerDevice', 'assignProfile', 'getProfileStatus', 'technicianPreProvision'],
  implementationStatus: 'partial',
};

export const MICROSOFT_IDENTITY_DEVICE_ADAPTER: IAdminAdapterDescriptor = {
  adapterKey: 'microsoft-identity:device-group',
  category: AdminAdapterCategory.MicrosoftIdentity,
  label: 'Microsoft Identity — Device Group Resolution',
  description: 'Entra ID identity resolution and device group management for white-glove deployment',
  domains: ['white-glove-deployment' as never],
  supportsDryRun: false,
  supportsCompensation: true,
  idempotent: false,
  operations: ['resolveIdentity', 'resolveGroup', 'addDeviceToGroup', 'validateReadiness'],
  implementationStatus: 'partial',
};

// ─── Phase 9.1 Apple Device Management Adapters ─────────────────────────────────

export const APPLE_ABM_ADAPTER: IAdminAdapterDescriptor = {
  adapterKey: 'apple-abm:device-assignment',
  category: AdminAdapterCategory.AppleAbm,
  label: 'Apple Business Manager — Device Assignment',
  description: 'ABM device assignment lookup, server token validation, and MDM server assignment',
  domains: ['white-glove-deployment' as never],
  supportsDryRun: true,
  supportsCompensation: false,
  idempotent: true,
  operations: ['getAssignment', 'validateToken', 'getAssignmentProfile'],
  implementationStatus: 'partial',
};

export const APPLE_ADE_ADAPTER: IAdminAdapterDescriptor = {
  adapterKey: 'apple-ade:enrollment',
  category: AdminAdapterCategory.AppleAde,
  label: 'Apple ADE — Automated Device Enrollment',
  description: 'ADE device enrollment, profile assignment, and platform-specific posture validation',
  domains: ['white-glove-deployment' as never],
  supportsDryRun: true,
  supportsCompensation: true,
  idempotent: false,
  operations: ['getDevice', 'getEnrollmentProfile', 'validatePosture'],
  implementationStatus: 'partial',
};

export const APPLE_MDM_ADAPTER: IAdminAdapterDescriptor = {
  adapterKey: 'apple-mdm:supervised-enrollment',
  category: AdminAdapterCategory.AppleMdm,
  label: 'Apple MDM — Supervised Enrollment',
  description: 'Apple MDM enrollment status, supervised state, and APNs-backed device management',
  domains: ['white-glove-deployment' as never],
  supportsDryRun: true,
  supportsCompensation: true,
  idempotent: false,
  operations: ['getEnrollmentStatus', 'getSupervisedState', 'getMdmProfile'],
  implementationStatus: 'partial',
};

// ─── Phase 9.1 NinjaOne Adapter ─────────────────────────────────────────────────

export const NINJAONE_STANDARDIZATION_ADAPTER: IAdminAdapterDescriptor = {
  adapterKey: 'ninjaone:standardization',
  category: AdminAdapterCategory.NinjaOne,
  label: 'NinjaOne — Post-Enrollment Standardization',
  description: 'Policy bundle assignment, software deployment, script execution, and device standardization',
  domains: ['white-glove-deployment' as never],
  supportsDryRun: true,
  supportsCompensation: false,
  idempotent: true,
  operations: ['assignPolicy', 'triggerSoftware', 'triggerScript', 'getStatus'],
  implementationStatus: 'partial',
};

export const NINJAONE_VALIDATION_ADAPTER: IAdminAdapterDescriptor = {
  adapterKey: 'ninjaone:validation',
  category: AdminAdapterCategory.NinjaOne,
  label: 'NinjaOne — Post-Standardization Validation',
  description: 'Post-enrollment validation checks and remediation verification',
  domains: ['white-glove-deployment' as never],
  supportsDryRun: true,
  supportsCompensation: false,
  idempotent: true,
  operations: ['validate', 'getValidationResult'],
  implementationStatus: 'partial',
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
  // Phase 9.1: Microsoft device management
  MICROSOFT_INTUNE_ADAPTER,
  MICROSOFT_AUTOPILOT_ADAPTER,
  MICROSOFT_IDENTITY_DEVICE_ADAPTER,
  // Phase 9.1: Apple device management
  APPLE_ABM_ADAPTER,
  APPLE_ADE_ADAPTER,
  APPLE_MDM_ADAPTER,
  // Phase 9.1: NinjaOne standardization
  NINJAONE_STANDARDIZATION_ADAPTER,
  NINJAONE_VALIDATION_ADAPTER,
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
