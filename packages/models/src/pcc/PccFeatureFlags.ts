/**
 * PCC feature-flag registry — read-model metadata only.
 *
 * Read-model only. This file does NOT:
 *   - read environment variables;
 *   - read localStorage, sessionStorage, or cookies;
 *   - read tenant config or runtime config;
 *   - implement runtime enablement logic;
 *   - perform permissions or auth enforcement.
 *
 * Flags are deterministic product-posture metadata only. Authoritative
 * enablement is the responsibility of later Phase 3 SPFx and backend waves.
 *
 * Phase 3 / Wave 1 / Prompt 06.
 */

import type { PccMvpSurfaceId } from './PccMvpSurfaces.js';
import type { WorkflowModuleId } from './WorkflowModules.js';

export const PCC_FEATURE_FLAG_IDS = [
  'priority-actions-rail',
  'document-control-procore-launch',
  'site-health-repair-request',
  'workflow-approvals',
  'business-audit-view',
  'external-system-launch-links',
  'external-system-missing-config',
  'comments-threading',
  'cupix-luxury-residential-conditional',
  'procore-launch-link',
  'compass-link',
] as const;

export type PccFeatureFlagId = (typeof PCC_FEATURE_FLAG_IDS)[number];

export const PCC_FEATURE_FLAG_POSTURES = ['mvp', 'later', 'deferred', 'proof-gated'] as const;

export type PccFeatureFlagPosture = (typeof PCC_FEATURE_FLAG_POSTURES)[number];

export interface IPccFeatureFlag {
  id: PccFeatureFlagId;
  displayName: string;
  description: string;
  posture: PccFeatureFlagPosture;
  defaultEnabled: boolean;
  surfaceId?: PccMvpSurfaceId;
  moduleId?: WorkflowModuleId;
}

export const PCC_FEATURE_FLAGS: Readonly<Record<PccFeatureFlagId, IPccFeatureFlag>> = {
  'priority-actions-rail': {
    id: 'priority-actions-rail',
    displayName: 'Priority Actions Rail',
    description: 'Top-of-page rail surfacing the highest-priority actions across modules.',
    posture: 'mvp',
    defaultEnabled: true,
    surfaceId: 'project-home',
    moduleId: 'priority-actions-rail',
  },
  'document-control-procore-launch': {
    id: 'document-control-procore-launch',
    displayName: 'Document Control — Procore Launch',
    description: 'Surface Procore-files launch links inside the unified Document Control hub.',
    posture: 'mvp',
    defaultEnabled: true,
    surfaceId: 'documents',
  },
  'site-health-repair-request': {
    id: 'site-health-repair-request',
    displayName: 'Site Health Repair Request',
    description: 'Allow PCC users to file structured repair requests from Site Health findings.',
    posture: 'mvp',
    defaultEnabled: true,
    surfaceId: 'site-health',
  },
  'workflow-approvals': {
    id: 'workflow-approvals',
    displayName: 'Workflow Approvals',
    description: 'Show approval checkpoints and reviewer actions on workflow items.',
    posture: 'mvp',
    defaultEnabled: true,
    surfaceId: 'approvals',
  },
  'business-audit-view': {
    id: 'business-audit-view',
    displayName: 'Business Audit View',
    description: 'Surface PCC business audit events to admin and IT personas.',
    posture: 'later',
    defaultEnabled: false,
    surfaceId: 'control-center-settings',
  },
  'external-system-launch-links': {
    id: 'external-system-launch-links',
    displayName: 'External System Launch Links',
    description:
      'Render launch links for configured external systems on the External Platforms surface.',
    posture: 'mvp',
    defaultEnabled: true,
    surfaceId: 'external-systems',
  },
  'external-system-missing-config': {
    id: 'external-system-missing-config',
    displayName: 'External System Missing Config',
    description:
      'Surface missing-configuration messages for external systems alongside launch links.',
    posture: 'mvp',
    defaultEnabled: true,
    surfaceId: 'external-systems',
  },
  'comments-threading': {
    id: 'comments-threading',
    displayName: 'Comments Threading',
    description: 'Allow threaded replies on PCC comments via parentCommentId.',
    posture: 'later',
    defaultEnabled: false,
  },
  'cupix-luxury-residential-conditional': {
    id: 'cupix-luxury-residential-conditional',
    displayName: 'Cupix (Luxury Residential)',
    description:
      'Conditional Cupix integration enablement when project type is luxury_residential.',
    posture: 'proof-gated',
    defaultEnabled: false,
    surfaceId: 'external-systems',
  },
  'procore-launch-link': {
    id: 'procore-launch-link',
    displayName: 'Procore Launch Link',
    description:
      'Render the read-only Procore launch link on Project Home and supporting surfaces.',
    posture: 'mvp',
    defaultEnabled: true,
    surfaceId: 'external-systems',
  },
  'compass-link': {
    id: 'compass-link',
    displayName: 'Compass Link',
    description: 'Render the HB Compass launch link on Project Home.',
    posture: 'mvp',
    defaultEnabled: true,
    surfaceId: 'project-home',
  },
};
