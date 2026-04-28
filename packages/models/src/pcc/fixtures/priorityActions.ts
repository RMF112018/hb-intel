/**
 * PCC fixture — sample priority actions.
 *
 * Deterministic, non-secret. Phase 3 / Wave 1 / Prompt 06.
 */

import type { IPriorityAction } from '../PriorityActions.js';
import type { PccWorkflowItemId } from '../types.js';

export const SAMPLE_PRIORITY_ACTIONS: readonly IPriorityAction[] = [
  {
    id: 'fixture-pa-workflow-001',
    category: 'workflow',
    title: 'Review startup checklist',
    summary: 'Two startup checklist items remain in pending review.',
    dueDate: '2026-05-10',
    assigneePersona: 'project-manager',
    relatedWorkCenter: 'startup',
    relatedWorkflowItemId: 'fixture-wi-001' as PccWorkflowItemId,
  },
  {
    id: 'fixture-pa-approval-001',
    category: 'approval',
    title: 'Project executive sign-off pending',
    summary: 'One approval checkpoint awaiting Project Executive decision.',
    assigneePersona: 'project-executive',
    relatedWorkCenter: 'team-and-access',
  },
  {
    id: 'fixture-pa-compliance-001',
    category: 'compliance',
    title: 'Annual COI renewal',
    summary: 'Subcontractor COI expires in 30 days.',
    dueDate: '2026-05-28',
    assigneePersona: 'project-accounting',
    relatedWorkCenter: 'contract-and-compliance',
  },
  {
    id: 'fixture-pa-inspection-001',
    category: 'inspection',
    title: 'Foundation inspection scheduled',
    summary: 'Foundation pour inspection scheduled for next week.',
    dueDate: '2026-05-05',
    assigneePersona: 'superintendent',
    relatedWorkCenter: 'inspection-readiness',
  },
  {
    id: 'fixture-pa-permit-001',
    category: 'permit',
    title: 'Building permit expiring soon',
    summary: 'Master building permit expires in 60 days.',
    dueDate: '2026-06-27',
    assigneePersona: 'project-manager',
    relatedWorkCenter: 'permit-and-ahj',
  },
  {
    id: 'fixture-pa-closeout-001',
    category: 'closeout',
    title: 'Final inspection items',
    summary: 'Three closeout deliverables awaiting submission.',
    assigneePersona: 'project-manager',
    relatedWorkCenter: 'closeout-and-warranty',
  },
  {
    id: 'fixture-pa-health-001',
    category: 'health',
    title: 'Site Health drift detected',
    summary: 'One repair-required finding on contracts library.',
    severity: 'Repair Required',
    assigneePersona: 'pcc-admin',
    relatedWorkCenter: 'control-center-settings',
  },
  {
    id: 'fixture-pa-procore-sync-001',
    category: 'procore-sync',
    title: 'Procore mapping required',
    summary: 'Procore project mapping required before active construction.',
    severity: 'Repair Required',
    assigneePersona: 'pcc-admin',
    relatedWorkCenter: 'control-center-settings',
  },
  {
    id: 'fixture-pa-documents-001',
    category: 'documents',
    title: 'Drawing set update available',
    summary: 'New drawing set version posted in Document Control.',
    assigneePersona: 'project-team-member',
    relatedWorkCenter: 'document-control',
  },
  {
    id: 'fixture-pa-safety-001',
    category: 'safety',
    title: 'Daily safety acknowledgement pending',
    summary: 'Three field acknowledgements outstanding for the week.',
    assigneePersona: 'safety-qaqc',
    relatedWorkCenter: 'field-operations',
  },
];
