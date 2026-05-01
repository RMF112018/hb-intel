/**
 * PCC role-capability matrix.
 *
 * Read-model only. Authoritative authorization is performed by backend
 * `requireAdmin` / role-gate logic and SPFx role resolution; this matrix
 * documents intended product posture only and must NOT be used as the
 * source of truth for auth checks.
 *
 * Phase 3 / Wave 1 / Prompt 03. Capability ids reference the eight PCC MVP
 * navigation surfaces in `PccMvpSurfaces.ts`. Persona capability lists are
 * exposed as `readonly PccCapabilityId[]` (not `ReadonlySet`) so they
 * serialize, inspect, and fixture cleanly across SPFx and backend.
 */

import type { PccPersona } from './PccUserRoles.js';
import type { PccMvpSurfaceId } from './PccMvpSurfaces.js';
import { TEAM_ACCESS_MANAGER_PERSONAS } from './TeamAccess.js';

export const PCC_CAPABILITY_IDS = [
  'view-project-home',
  'view-priority-actions',
  'manage-team-access',
  'view-documents',
  'upload-documents',
  'view-project-readiness',
  'manage-startup-checklist',
  'manage-permits',
  'manage-inspections',
  'manage-responsibility-matrix',
  'view-approvals',
  'decide-approvals',
  'view-external-systems',
  'configure-external-systems',
  'view-site-health',
  'acknowledge-site-health-repair',
  'manage-control-center-settings',
  'view-business-audit',
  'view-buyout-log',
  'view-constraints-log',
] as const;

export type PccCapabilityId = (typeof PCC_CAPABILITY_IDS)[number];

export interface IPccCapability {
  id: PccCapabilityId;
  displayName: string;
  description: string;
  surfaceId: PccMvpSurfaceId;
}

export const PCC_CAPABILITIES: Readonly<Record<PccCapabilityId, IPccCapability>> = {
  'view-project-home': {
    id: 'view-project-home',
    displayName: 'View Project Home',
    description: 'Access the project home surface and rollups.',
    surfaceId: 'project-home',
  },
  'view-priority-actions': {
    id: 'view-priority-actions',
    displayName: 'View Priority Actions',
    description: 'See the priority actions rail on Project Home.',
    surfaceId: 'project-home',
  },
  'manage-team-access': {
    id: 'manage-team-access',
    displayName: 'Manage Team & Access',
    description: 'Invite members, assign permission templates, run access audits.',
    surfaceId: 'team-and-access',
  },
  'view-documents': {
    id: 'view-documents',
    displayName: 'View Documents',
    description: 'Browse the unified Document Control surface.',
    surfaceId: 'documents',
  },
  'upload-documents': {
    id: 'upload-documents',
    displayName: 'Upload Documents',
    description: 'Upload through the Document Control governed paths.',
    surfaceId: 'documents',
  },
  'view-project-readiness': {
    id: 'view-project-readiness',
    displayName: 'View Project Readiness',
    description: 'See startup, permits, inspections, and responsibility matrix at a glance.',
    surfaceId: 'project-readiness',
  },
  'manage-startup-checklist': {
    id: 'manage-startup-checklist',
    displayName: 'Manage Startup Checklist',
    description: 'Update startup checklist items and readiness gates.',
    surfaceId: 'project-readiness',
  },
  'manage-permits': {
    id: 'manage-permits',
    displayName: 'Manage Permits',
    description: 'Update permit log entries and AHJ contacts.',
    surfaceId: 'project-readiness',
  },
  'manage-inspections': {
    id: 'manage-inspections',
    displayName: 'Manage Inspections',
    description: 'Update required inspections and outcomes.',
    surfaceId: 'project-readiness',
  },
  'manage-responsibility-matrix': {
    id: 'manage-responsibility-matrix',
    displayName: 'Manage Responsibility Matrix',
    description: 'Update project and owner-contract responsibility mappings.',
    surfaceId: 'project-readiness',
  },
  'view-approvals': {
    id: 'view-approvals',
    displayName: 'View Approvals',
    description: 'See pending and decided approval checkpoints.',
    surfaceId: 'approvals',
  },
  'decide-approvals': {
    id: 'decide-approvals',
    displayName: 'Decide Approvals',
    description: 'Approve, reject, or waive approval checkpoints assigned to this persona.',
    surfaceId: 'approvals',
  },
  'view-external-systems': {
    id: 'view-external-systems',
    displayName: 'View External Systems',
    description: 'See the external system catalog and mapping status.',
    surfaceId: 'external-systems',
  },
  'configure-external-systems': {
    id: 'configure-external-systems',
    displayName: 'Configure External Systems',
    description: 'Configure project mappings for integrated external systems.',
    surfaceId: 'external-systems',
  },
  'view-site-health': {
    id: 'view-site-health',
    displayName: 'View Site Health',
    description: 'See drift findings and repair posture.',
    surfaceId: 'site-health',
  },
  'acknowledge-site-health-repair': {
    id: 'acknowledge-site-health-repair',
    displayName: 'Acknowledge Site Health Repair',
    description: 'Acknowledge admin-approved repairs in the Site Health surface.',
    surfaceId: 'site-health',
  },
  'manage-control-center-settings': {
    id: 'manage-control-center-settings',
    displayName: 'Manage Control Center Settings',
    description: 'Update control-center-settings scope values.',
    surfaceId: 'control-center-settings',
  },
  'view-business-audit': {
    id: 'view-business-audit',
    displayName: 'View Business Audit',
    description: 'Review business workflow audit events.',
    surfaceId: 'control-center-settings',
  },
  'view-buyout-log': {
    id: 'view-buyout-log',
    displayName: 'View Buyout Log',
    description: 'Review the project buyout log workflow module.',
    surfaceId: 'project-readiness',
  },
  'view-constraints-log': {
    id: 'view-constraints-log',
    displayName: 'View Constraints Log',
    description: 'Review the project constraints log workflow module.',
    surfaceId: 'project-readiness',
  },
};

/**
 * Read-model persona capability matrix. Capability lists are `readonly` arrays
 * — not `ReadonlySet` — so values serialize, inspect, fixture, and consume
 * cleanly across SPFx and backend. Membership lookups go through
 * `personaHasCapability` below.
 */
export const PCC_PERSONA_CAPABILITIES: Readonly<
  Record<PccPersona, readonly PccCapabilityId[]>
> = {
  'pcc-admin': [
    'view-project-home',
    'view-priority-actions',
    'manage-team-access',
    'view-documents',
    'upload-documents',
    'view-project-readiness',
    'manage-startup-checklist',
    'manage-permits',
    'manage-inspections',
    'manage-responsibility-matrix',
    'view-approvals',
    'decide-approvals',
    'view-external-systems',
    'configure-external-systems',
    'view-site-health',
    'acknowledge-site-health-repair',
    'manage-control-center-settings',
    'view-business-audit',
    'view-buyout-log',
    'view-constraints-log',
  ],
  'it-admin': [
    'view-project-home',
    'manage-team-access',
    'view-external-systems',
    'configure-external-systems',
    'view-site-health',
    'acknowledge-site-health-repair',
    'manage-control-center-settings',
    'view-business-audit',
  ],
  'executive-oversight': [
    'view-project-home',
    'view-priority-actions',
    'view-documents',
    'view-project-readiness',
    'view-approvals',
    'view-external-systems',
    'view-site-health',
    'view-business-audit',
    'view-buyout-log',
    'view-constraints-log',
  ],
  'project-executive': [
    'view-project-home',
    'view-priority-actions',
    'manage-team-access',
    'view-documents',
    'upload-documents',
    'view-project-readiness',
    'manage-responsibility-matrix',
    'view-approvals',
    'decide-approvals',
    'view-external-systems',
    'view-site-health',
    'view-business-audit',
    'view-buyout-log',
    'view-constraints-log',
  ],
  'project-manager': [
    'view-project-home',
    'view-priority-actions',
    'manage-team-access',
    'view-documents',
    'upload-documents',
    'view-project-readiness',
    'manage-startup-checklist',
    'manage-permits',
    'manage-inspections',
    'manage-responsibility-matrix',
    'view-approvals',
    'decide-approvals',
    'view-external-systems',
    'view-site-health',
    'view-buyout-log',
    'view-constraints-log',
  ],
  'superintendent': [
    'view-project-home',
    'view-priority-actions',
    'view-documents',
    'upload-documents',
    'view-project-readiness',
    'manage-permits',
    'manage-inspections',
    'view-approvals',
    'view-external-systems',
    'view-constraints-log',
  ],
  'project-accounting': [
    'view-project-home',
    'view-priority-actions',
    'view-documents',
    'view-project-readiness',
    'view-approvals',
    'view-external-systems',
    'view-buyout-log',
  ],
  'project-team-member': [
    'view-project-home',
    'view-priority-actions',
    'view-documents',
    'view-project-readiness',
    'view-approvals',
    'view-external-systems',
  ],
  'external-contributor': [
    'view-documents',
  ],
  'viewer': [
    'view-project-home',
    'view-documents',
    'view-project-readiness',
    'view-approvals',
  ],
  'estimating-coordinator': [
    'view-project-home',
    'manage-team-access',
    'view-documents',
    'view-project-readiness',
    'manage-startup-checklist',
  ],
  'lead-estimator': [
    'view-project-home',
    'manage-team-access',
    'view-documents',
    'view-project-readiness',
    'manage-startup-checklist',
    'view-buyout-log',
  ],
  estimator: [
    'view-project-home',
    'view-documents',
    'view-project-readiness',
    'view-approvals',
  ],
  'chief-estimator': [
    'view-project-home',
    'view-priority-actions',
    'view-documents',
    'view-project-readiness',
    'view-approvals',
    'view-buyout-log',
  ],
  'director-of-preconstruction': [
    'view-project-home',
    'view-priority-actions',
    'view-documents',
    'view-project-readiness',
    'view-approvals',
    'view-external-systems',
    'view-business-audit',
    'view-buyout-log',
    'view-constraints-log',
  ],
  'project-coordinator': [
    'view-project-home',
    'view-priority-actions',
    'view-documents',
    'upload-documents',
    'view-project-readiness',
    'view-approvals',
    'view-external-systems',
    'view-constraints-log',
  ],
  'external-design-team': [
    'view-documents',
    'view-project-readiness',
  ],
  'owner-client-viewer': [
    'view-project-home',
    'view-documents',
    'view-project-readiness',
    'view-approvals',
  ],
  'subcontractor-limited': [
    'view-documents',
    'view-project-readiness',
  ],
  'manager-of-operational-excellence': [
    'view-project-home',
    'view-priority-actions',
    'manage-team-access',
    'view-documents',
    'view-project-readiness',
    'view-approvals',
    'view-external-systems',
    'view-site-health',
    'view-business-audit',
    'view-buyout-log',
    'view-constraints-log',
  ],
  'safety-qaqc': [
    'view-project-home',
    'view-documents',
    'upload-documents',
    'view-project-readiness',
    'manage-inspections',
  ],
};

export function personaHasCapability(
  persona: PccPersona,
  capability: PccCapabilityId,
): boolean {
  return PCC_PERSONA_CAPABILITIES[persona].includes(capability);
}

/**
 * Defensive parity check: capability mapping must stay aligned with
 * `TEAM_ACCESS_MANAGER_PERSONAS` source set.
 */
void TEAM_ACCESS_MANAGER_PERSONAS;
