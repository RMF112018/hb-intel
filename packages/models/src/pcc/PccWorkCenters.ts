/**
 * PCC work center registry.
 *
 * Source: `Standard_Project_Site_Template_Contract.md` §8.1 — 20 work centers
 * plus the governance Settings/Site Health surface (21 entries total).
 *
 * Wave 1 surfaces the registry as pure metadata. No navigation, routing,
 * SPFx web part, or backend permission wiring is implied by these types.
 */

import type { PccPersona } from './PccUserRoles.js';

export const PCC_WORK_CENTER_IDS = [
  'project-home',
  'team-and-access',
  'document-control',
  'project-directory',
  'action-center',
  'project-controls',
  'contract-and-compliance',
  'drawing-and-model',
  'field-operations',
  'meeting-and-communication',
  'risk-issues-decision',
  'procurement-and-buyout',
  'startup',
  'permit-and-ahj',
  'inspection-readiness',
  'responsibility-matrix',
  'subcontractor-performance',
  'lessons-learned',
  'closeout-and-warranty',
  'hbi-assistant',
  'control-center-settings',
] as const;

export type PccWorkCenterId = (typeof PCC_WORK_CENTER_IDS)[number];

export type PccWorkCenterMvpTier = 'MVP' | 'Later' | 'Governance';

export interface IPccWorkCenter {
  id: PccWorkCenterId;
  displayName: string;
  mvpTier: PccWorkCenterMvpTier;
  primaryUsers: readonly PccPersona[];
}

export const PCC_WORK_CENTERS: Readonly<Record<PccWorkCenterId, IPccWorkCenter>> = {
  'project-home': {
    id: 'project-home',
    displayName: 'Project Home / Command Center',
    mvpTier: 'MVP',
    primaryUsers: ['project-team-member', 'project-manager', 'superintendent', 'project-executive'],
  },
  'team-and-access': {
    id: 'team-and-access',
    displayName: 'Team & Access Center',
    mvpTier: 'MVP',
    primaryUsers: ['project-executive', 'project-manager', 'pcc-admin'],
  },
  'document-control': {
    id: 'document-control',
    displayName: 'Document Control Center',
    mvpTier: 'MVP',
    primaryUsers: ['project-team-member', 'project-manager', 'superintendent'],
  },
  'project-directory': {
    id: 'project-directory',
    displayName: 'Project Directory / Team Center',
    mvpTier: 'MVP',
    primaryUsers: ['project-team-member', 'project-manager', 'project-executive'],
  },
  'action-center': {
    id: 'action-center',
    displayName: 'Action Center',
    mvpTier: 'Later',
    primaryUsers: ['project-team-member', 'project-manager'],
  },
  'project-controls': {
    id: 'project-controls',
    displayName: 'Project Controls Center',
    mvpTier: 'Later',
    primaryUsers: ['project-manager', 'project-accounting', 'project-executive'],
  },
  'contract-and-compliance': {
    id: 'contract-and-compliance',
    displayName: 'Contract & Compliance Center',
    mvpTier: 'Later',
    primaryUsers: ['project-manager', 'project-accounting'],
  },
  'drawing-and-model': {
    id: 'drawing-and-model',
    displayName: 'Drawing & Model Center',
    mvpTier: 'Later',
    primaryUsers: ['project-team-member', 'project-manager', 'superintendent'],
  },
  'field-operations': {
    id: 'field-operations',
    displayName: 'Field Operations Center',
    mvpTier: 'Later',
    primaryUsers: ['superintendent', 'project-team-member'],
  },
  'meeting-and-communication': {
    id: 'meeting-and-communication',
    displayName: 'Meeting & Communication Center',
    mvpTier: 'Later',
    primaryUsers: ['project-team-member', 'project-manager'],
  },
  'risk-issues-decision': {
    id: 'risk-issues-decision',
    displayName: 'Risk / Issues / Decision Log',
    mvpTier: 'Later',
    primaryUsers: ['project-manager', 'project-executive'],
  },
  'procurement-and-buyout': {
    id: 'procurement-and-buyout',
    displayName: 'Procurement & Buyout Center',
    mvpTier: 'Later',
    primaryUsers: ['project-manager', 'project-accounting'],
  },
  'startup': {
    id: 'startup',
    displayName: 'Startup Center',
    mvpTier: 'MVP',
    primaryUsers: ['project-executive', 'project-manager'],
  },
  'permit-and-ahj': {
    id: 'permit-and-ahj',
    displayName: 'Permit & AHJ Center',
    mvpTier: 'MVP',
    primaryUsers: ['project-manager', 'superintendent'],
  },
  'inspection-readiness': {
    id: 'inspection-readiness',
    displayName: 'Inspection Readiness Center',
    mvpTier: 'MVP',
    primaryUsers: ['superintendent', 'project-team-member'],
  },
  'responsibility-matrix': {
    id: 'responsibility-matrix',
    displayName: 'Responsibility Matrix Center',
    mvpTier: 'MVP',
    primaryUsers: ['project-manager', 'project-executive', 'project-accounting'],
  },
  'subcontractor-performance': {
    id: 'subcontractor-performance',
    displayName: 'Subcontractor Performance Center',
    mvpTier: 'Later',
    primaryUsers: ['project-manager', 'project-executive'],
  },
  'lessons-learned': {
    id: 'lessons-learned',
    displayName: 'Lessons Learned Center',
    mvpTier: 'Later',
    primaryUsers: ['project-executive', 'project-manager'],
  },
  'closeout-and-warranty': {
    id: 'closeout-and-warranty',
    displayName: 'Closeout & Warranty Center',
    mvpTier: 'MVP',
    primaryUsers: ['project-manager', 'project-accounting', 'project-executive'],
  },
  'hbi-assistant': {
    id: 'hbi-assistant',
    displayName: 'HBI Assistant',
    mvpTier: 'Later',
    primaryUsers: ['project-team-member', 'project-manager'],
  },
  'control-center-settings': {
    id: 'control-center-settings',
    displayName: 'Control Center Settings / Site Health',
    mvpTier: 'Governance',
    primaryUsers: ['pcc-admin', 'it-admin'],
  },
};
