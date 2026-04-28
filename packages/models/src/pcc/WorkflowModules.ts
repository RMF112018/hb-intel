/**
 * PCC workflow module registry.
 *
 * A workflow module is a logical grouping of workflow items hosted within a
 * work center. Wave 1 lists the MVP module families implied by the contract;
 * the registry is metadata-only and does not wire forms, persistence, or
 * approval routing.
 */

import type { PccWorkCenterId } from './PccWorkCenters.js';

export const PCC_WORKFLOW_MODULE_IDS = [
  'startup-tasks',
  'permits',
  'required-inspections',
  'responsibility-matrix',
  'team-and-access',
  'closeout-tasks',
  'site-health-checks',
  'document-control-register',
  'priority-actions-rail',
] as const;

export type WorkflowModuleId = (typeof PCC_WORKFLOW_MODULE_IDS)[number];

export type WorkflowModuleMvpTier = 'MVP' | 'Later';

export interface IWorkflowModule {
  id: WorkflowModuleId;
  displayName: string;
  workCenterId: PccWorkCenterId;
  mvpTier: WorkflowModuleMvpTier;
  description?: string;
}

export const PCC_WORKFLOW_MODULES: Readonly<Record<WorkflowModuleId, IWorkflowModule>> = {
  'startup-tasks': {
    id: 'startup-tasks',
    displayName: 'Startup Tasks',
    workCenterId: 'startup',
    mvpTier: 'MVP',
  },
  'permits': {
    id: 'permits',
    displayName: 'Permits',
    workCenterId: 'permit-and-ahj',
    mvpTier: 'MVP',
  },
  'required-inspections': {
    id: 'required-inspections',
    displayName: 'Required Inspections',
    workCenterId: 'inspection-readiness',
    mvpTier: 'MVP',
  },
  'responsibility-matrix': {
    id: 'responsibility-matrix',
    displayName: 'Responsibility Matrix',
    workCenterId: 'responsibility-matrix',
    mvpTier: 'MVP',
  },
  'team-and-access': {
    id: 'team-and-access',
    displayName: 'Team & Access',
    workCenterId: 'team-and-access',
    mvpTier: 'MVP',
  },
  'closeout-tasks': {
    id: 'closeout-tasks',
    displayName: 'Closeout Tasks',
    workCenterId: 'closeout-and-warranty',
    mvpTier: 'MVP',
  },
  'site-health-checks': {
    id: 'site-health-checks',
    displayName: 'Site Health Checks',
    workCenterId: 'control-center-settings',
    mvpTier: 'MVP',
  },
  'document-control-register': {
    id: 'document-control-register',
    displayName: 'Document Control Register',
    workCenterId: 'document-control',
    mvpTier: 'MVP',
  },
  'priority-actions-rail': {
    id: 'priority-actions-rail',
    displayName: 'Priority Actions Rail',
    workCenterId: 'project-home',
    mvpTier: 'MVP',
  },
};
