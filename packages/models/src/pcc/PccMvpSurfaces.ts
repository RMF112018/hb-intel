/**
 * Phase 3 PCC MVP app navigation surfaces.
 *
 * Distinct from the 21 contract template work centers in `PccWorkCenters.ts`.
 * Surfaces are NEVER called "work centers" in any symbol, comment, test, or
 * doc. Where a surface aggregates one or more contract template work centers,
 * the references are made via `primaryWorkCenterIds` (the *referenced ids* are
 * contract work-center ids; the surface itself is a surface).
 *
 * Phase 3 / Wave 1 / Prompt 03 introduces this registry. It is read-model
 * metadata only — no navigation routing, no SPFx web part, no backend
 * permission wiring is implied.
 */

import type { PccWorkCenterId } from './PccWorkCenters.js';

export const PCC_MVP_SURFACE_IDS = [
  'project-home',
  'team-and-access',
  'documents',
  'project-readiness',
  'approvals',
  'external-systems',
  'control-center-settings',
  'site-health',
] as const;

export type PccMvpSurfaceId = (typeof PCC_MVP_SURFACE_IDS)[number];

export type PccMvpSurfaceTier = 'MVP' | 'Governance';

export interface IPccMvpSurface {
  id: PccMvpSurfaceId;
  displayName: string;
  description: string;
  mvpTier: PccMvpSurfaceTier;
  /**
   * Contract template work-center ids that this surface aggregates.
   * Field name uses "WorkCenterIds" because the referenced ids belong to
   * the contract work-center registry. The surface itself is not a work
   * center.
   */
  primaryWorkCenterIds: readonly PccWorkCenterId[];
}

export const PCC_MVP_SURFACES: Readonly<Record<PccMvpSurfaceId, IPccMvpSurface>> = {
  'project-home': {
    id: 'project-home',
    displayName: 'Project Home',
    description: 'Daily entry point with priority actions, project hero, and rollups.',
    mvpTier: 'MVP',
    primaryWorkCenterIds: ['project-home'],
  },
  'team-and-access': {
    id: 'team-and-access',
    displayName: 'Team & Access',
    description: 'Team listing, invite flow, permission templates, and access audit.',
    mvpTier: 'MVP',
    primaryWorkCenterIds: ['team-and-access', 'project-directory'],
  },
  'documents': {
    id: 'documents',
    displayName: 'Documents',
    description:
      'Unified access hub for SharePoint, OneDrive, and Procore files via the Document Control Center.',
    mvpTier: 'MVP',
    primaryWorkCenterIds: ['document-control'],
  },
  'project-readiness': {
    id: 'project-readiness',
    displayName: 'Project Readiness',
    description:
      'Project Readiness Module Framework shell aggregating readiness posture, blockers, evidence references, and source-health signals across upstream modules; the user-facing Project Readiness Center surface.',
    mvpTier: 'MVP',
    primaryWorkCenterIds: [
      'startup',
      'permit-and-ahj',
      'inspection-readiness',
      'responsibility-matrix',
    ],
  },
  'approvals': {
    id: 'approvals',
    displayName: 'Approvals',
    description: 'Approval checkpoints across PCC workflow modules.',
    mvpTier: 'MVP',
    primaryWorkCenterIds: ['action-center'],
  },
  'external-systems': {
    id: 'external-systems',
    displayName: 'External Systems',
    description: 'Catalog of integrated systems with launch links and mapping status.',
    mvpTier: 'MVP',
    primaryWorkCenterIds: ['control-center-settings'],
  },
  'control-center-settings': {
    id: 'control-center-settings',
    displayName: 'Control Center Settings',
    description: 'Settings for site, project, persona, and integration scopes.',
    mvpTier: 'Governance',
    primaryWorkCenterIds: ['control-center-settings'],
  },
  'site-health': {
    id: 'site-health',
    displayName: 'Site Health',
    description: 'Drift findings, severities, and repair acknowledgement entry.',
    mvpTier: 'Governance',
    primaryWorkCenterIds: ['control-center-settings'],
  },
};
