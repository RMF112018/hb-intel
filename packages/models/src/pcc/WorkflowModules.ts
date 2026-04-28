/**
 * PCC workflow module registry.
 *
 * A workflow module is a logical grouping of workflow items hosted within a
 * contract template work center. Wave 1 lists the MVP module families implied
 * by the contract; the registry is metadata-only and does not wire forms,
 * persistence, or approval routing.
 *
 * Phase 3 / Wave 1 / Prompt 03 extends this registry with constraints log,
 * buyout log, estimating kickoff, and post-bid autopsy modules, and adds an
 * optional `description` field on `IWorkflowModule`.
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
  'constraints-log',
  'buyout-log',
  'estimating-kickoff',
  'post-bid-autopsy',
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
    displayName: 'Job Startup Checklist',
    workCenterId: 'startup',
    mvpTier: 'MVP',
    description: 'Project startup checklist with readiness gates.',
  },
  'permits': {
    id: 'permits',
    displayName: 'Permit Log',
    workCenterId: 'permit-and-ahj',
    mvpTier: 'MVP',
    description: 'Project permits, AHJ contacts, and status tracking.',
  },
  'required-inspections': {
    id: 'required-inspections',
    displayName: 'Required Inspections',
    workCenterId: 'inspection-readiness',
    mvpTier: 'MVP',
    description: 'Required inspection items, results, and readiness state.',
  },
  'responsibility-matrix': {
    id: 'responsibility-matrix',
    displayName: 'Responsibility Matrix',
    workCenterId: 'responsibility-matrix',
    mvpTier: 'MVP',
    description: 'Project and owner-contract responsibility mapping.',
  },
  'team-and-access': {
    id: 'team-and-access',
    displayName: 'Team & Access',
    workCenterId: 'team-and-access',
    mvpTier: 'MVP',
    description: 'Team membership, access requests, and audit trail.',
  },
  'closeout-tasks': {
    id: 'closeout-tasks',
    displayName: 'Job Closeout Checklist',
    workCenterId: 'closeout-and-warranty',
    mvpTier: 'MVP',
    description: 'Closeout deliverables, turnover, and warranty handoff.',
  },
  'site-health-checks': {
    id: 'site-health-checks',
    displayName: 'Site Health Checks',
    workCenterId: 'control-center-settings',
    mvpTier: 'MVP',
    description: 'Drift detection findings and repair posture.',
  },
  'document-control-register': {
    id: 'document-control-register',
    displayName: 'Document Control Register',
    workCenterId: 'document-control',
    mvpTier: 'MVP',
    description: 'Document register entries surfaced via Document Control sources.',
  },
  'priority-actions-rail': {
    id: 'priority-actions-rail',
    displayName: 'Priority Actions Rail',
    workCenterId: 'project-home',
    mvpTier: 'MVP',
    description: 'Top priority actions across modules.',
  },
  'constraints-log': {
    id: 'constraints-log',
    displayName: 'Constraints Log',
    workCenterId: 'risk-issues-decision',
    mvpTier: 'MVP',
    description: 'Active project constraints, blockers, and dependency tracking.',
  },
  'buyout-log': {
    id: 'buyout-log',
    displayName: 'Buyout Log',
    workCenterId: 'procurement-and-buyout',
    mvpTier: 'MVP',
    description: 'Procurement and buyout commitments tracked at project level.',
  },
  'estimating-kickoff': {
    id: 'estimating-kickoff',
    displayName: 'Estimating Kickoff',
    workCenterId: 'startup',
    mvpTier: 'Later',
    description: 'Estimating-to-construction handoff package.',
  },
  'post-bid-autopsy': {
    id: 'post-bid-autopsy',
    displayName: 'Post-Bid Autopsy',
    workCenterId: 'lessons-learned',
    mvpTier: 'Later',
    description: 'Post-bid review of estimating accuracy and lessons learned.',
  },
};
