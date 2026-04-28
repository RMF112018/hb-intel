/**
 * PCC module-flag registry — read-model metadata only.
 *
 * Read-model only. This file does NOT:
 *   - read environment variables;
 *   - read localStorage, sessionStorage, or cookies;
 *   - read tenant config or runtime config;
 *   - implement runtime enablement logic;
 *   - perform permissions or auth enforcement.
 *
 * Module enablement metadata is deterministic product-posture only.
 * Authoritative enablement is the responsibility of later Phase 3 SPFx
 * and backend waves.
 *
 * Phase 3 / Wave 1 / Prompt 06.
 */

import type { WorkflowModuleId } from './WorkflowModules.js';

export const PCC_MODULE_FLAG_POSTURES = [
  'mvp',
  'later',
  'deferred',
  'proof-gated',
] as const;

export type PccModuleFlagPosture = (typeof PCC_MODULE_FLAG_POSTURES)[number];

export interface IPccModuleFlag {
  moduleId: WorkflowModuleId;
  posture: PccModuleFlagPosture;
  defaultEnabled: boolean;
  notes?: string;
}

export const PCC_MODULE_FLAGS: Readonly<Record<WorkflowModuleId, IPccModuleFlag>> = {
  'startup-tasks': {
    moduleId: 'startup-tasks',
    posture: 'mvp',
    defaultEnabled: true,
  },
  'permits': {
    moduleId: 'permits',
    posture: 'mvp',
    defaultEnabled: true,
  },
  'required-inspections': {
    moduleId: 'required-inspections',
    posture: 'mvp',
    defaultEnabled: true,
  },
  'responsibility-matrix': {
    moduleId: 'responsibility-matrix',
    posture: 'mvp',
    defaultEnabled: true,
  },
  'team-and-access': {
    moduleId: 'team-and-access',
    posture: 'mvp',
    defaultEnabled: true,
  },
  'closeout-tasks': {
    moduleId: 'closeout-tasks',
    posture: 'mvp',
    defaultEnabled: true,
  },
  'site-health-checks': {
    moduleId: 'site-health-checks',
    posture: 'mvp',
    defaultEnabled: true,
  },
  'document-control-register': {
    moduleId: 'document-control-register',
    posture: 'mvp',
    defaultEnabled: true,
  },
  'priority-actions-rail': {
    moduleId: 'priority-actions-rail',
    posture: 'mvp',
    defaultEnabled: true,
  },
  'constraints-log': {
    moduleId: 'constraints-log',
    posture: 'mvp',
    defaultEnabled: true,
  },
  'buyout-log': {
    moduleId: 'buyout-log',
    posture: 'mvp',
    defaultEnabled: true,
  },
  'estimating-kickoff': {
    moduleId: 'estimating-kickoff',
    posture: 'later',
    defaultEnabled: false,
  },
  'post-bid-autopsy': {
    moduleId: 'post-bid-autopsy',
    posture: 'later',
    defaultEnabled: false,
  },
};
