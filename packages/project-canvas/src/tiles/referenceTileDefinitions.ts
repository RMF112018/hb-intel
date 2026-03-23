/**
 * referenceTileDefinitions — D-SF13-T07, D-02 (role defaults), D-09 (cross-package integration)
 *
 * All 12 reference tile definitions for the project canvas system.
 * Each definition uses createReferenceTileComponents() for lazy component variants.
 */
import React from 'react';
import type { ICanvasTileDefinition, ICanvasTileProps } from '../types/index.js';
import { createReferenceTileComponents } from './createReferenceTileComponent.js';

// --- ai-insight uses existing AIInsightTile placeholder ---
const aiLazy = React.lazy(
  () =>
    import('../components/AIInsightTile.js').then((m) => ({
      default: m.AIInsightTile as unknown as React.ComponentType<ICanvasTileProps>,
    })),
);

/** BIC My Items — mandatory, all 6 roles */
export const bicMyItemsDef: ICanvasTileDefinition = {
  tileKey: 'bic-my-items',
  title: 'BIC My Items',
  description: 'Displays the current user\'s assigned BIC items across all projects.',
  defaultForRoles: ['Superintendent', 'Project Manager', 'Project Engineer', 'Chief Estimator', 'VP of Operations', 'Director of Preconstruction'],
  mandatory: true,
  component: createReferenceTileComponents('bic-my-items', 'BIC My Items'),
  defaultColSpan: 4,
  defaultRowSpan: 1,
  lockable: true,
};

/** Active Constraints — Superintendent, PM, PE */
export const activeConstraintsDef: ICanvasTileDefinition = {
  tileKey: 'active-constraints',
  title: 'Active Constraints',
  description: 'Shows active project constraints requiring attention.',
  defaultForRoles: ['Superintendent', 'Project Manager', 'Project Engineer'],
  mandatory: false,
  component: createReferenceTileComponents('active-constraints', 'Active Constraints'),
  defaultColSpan: 4,
  defaultRowSpan: 1,
  lockable: false,
};

/** Project Health Pulse — mandatory, Superintendent, PM, VP */
export const projectHealthPulseDef: ICanvasTileDefinition = {
  tileKey: 'project-health-pulse',
  title: 'Project Health Pulse',
  description: 'Real-time project health indicators and trend summary.',
  defaultForRoles: ['Superintendent', 'Project Manager', 'VP of Operations'],
  mandatory: true,
  component: createReferenceTileComponents('project-health-pulse', 'Project Health Pulse'),
  defaultColSpan: 6,
  defaultRowSpan: 1,
  lockable: true,
};

/** Permit Status — Superintendent, PE */
export const permitStatusDef: ICanvasTileDefinition = {
  tileKey: 'permit-status',
  title: 'Permit Status',
  description: 'Tracks permit application and approval status.',
  defaultForRoles: ['Superintendent', 'Project Engineer'],
  mandatory: false,
  component: createReferenceTileComponents('permit-status', 'Permit Status'),
  defaultColSpan: 3,
  defaultRowSpan: 1,
  lockable: false,
};

/** Pending Approvals — mandatory, PM, VP, DirPrecon */
export const pendingApprovalsDef: ICanvasTileDefinition = {
  tileKey: 'pending-approvals',
  title: 'Pending Approvals',
  description: 'Items awaiting the current user\'s approval or review.',
  defaultForRoles: ['Project Manager', 'VP of Operations', 'Director of Preconstruction'],
  mandatory: true,
  component: createReferenceTileComponents('pending-approvals', 'Pending Approvals'),
  defaultColSpan: 4,
  defaultRowSpan: 1,
  lockable: true,
};

/** BD Heritage — PM, CE, DirPrecon */
export const bdHeritageDef: ICanvasTileDefinition = {
  tileKey: 'bd-heritage',
  title: 'BD Heritage',
  description: 'Business development heritage data and project lineage.',
  defaultForRoles: ['Project Manager', 'Chief Estimator', 'Director of Preconstruction'],
  mandatory: false,
  component: createReferenceTileComponents('bd-heritage', 'BD Heritage'),
  defaultColSpan: 4,
  defaultRowSpan: 1,
  lockable: false,
};

/** Workflow Handoff Inbox — PM, PE, CE, DirPrecon */
export const workflowHandoffInboxDef: ICanvasTileDefinition = {
  tileKey: 'workflow-handoff-inbox',
  title: 'Workflow Handoff Inbox',
  description: 'Incoming workflow handoffs requiring action.',
  defaultForRoles: ['Project Manager', 'Project Engineer', 'Chief Estimator', 'Director of Preconstruction'],
  mandatory: false,
  component: createReferenceTileComponents('workflow-handoff-inbox', 'Workflow Handoff Inbox'),
  defaultColSpan: 6,
  defaultRowSpan: 1,
  lockable: false,
};

/** Document Activity — PE */
export const documentActivityDef: ICanvasTileDefinition = {
  tileKey: 'document-activity',
  title: 'Document Activity',
  description: 'Recent document uploads, revisions, and review activity.',
  defaultForRoles: ['Project Engineer'],
  mandatory: false,
  component: createReferenceTileComponents('document-activity', 'Document Activity'),
  defaultColSpan: 4,
  defaultRowSpan: 1,
  lockable: false,
};

/** Estimating Pursuit — CE */
export const estimatingPursuitDef: ICanvasTileDefinition = {
  tileKey: 'estimating-pursuit',
  title: 'Estimating Pursuit',
  description: 'Active estimating pursuits and bid pipeline status.',
  defaultForRoles: ['Chief Estimator'],
  mandatory: false,
  component: createReferenceTileComponents('estimating-pursuit', 'Estimating Pursuit'),
  defaultColSpan: 4,
  defaultRowSpan: 1,
  lockable: false,
};

/** Notification Summary — VP */
export const notificationSummaryDef: ICanvasTileDefinition = {
  tileKey: 'notification-summary',
  title: 'Notification Summary',
  description: 'Aggregated notification summary across all projects.',
  defaultForRoles: ['VP of Operations'],
  mandatory: false,
  component: createReferenceTileComponents('notification-summary', 'Notification Summary'),
  defaultColSpan: 4,
  defaultRowSpan: 1,
  lockable: false,
};

/** Related Items — mandatory (Phase 3 P3-C2 §5.4), @hbc/related-items */
export const relatedItemsDef: ICanvasTileDefinition = {
  tileKey: 'related-items',
  title: 'Related Items',
  description: 'Cross-references related items across modules.',
  defaultForRoles: ['project-administrator', 'project-executive', 'project-manager', 'superintendent', 'project-team-member'],
  mandatory: true,
  component: createReferenceTileComponents('related-items', 'Related Items'),
  defaultColSpan: 4,
  defaultRowSpan: 1,
  lockable: true,
};

/** Project Work Queue — mandatory (Phase 3 P3-C2 §4), @hbc/my-work-feed */
export const projectWorkQueueDef: ICanvasTileDefinition = {
  tileKey: 'project-work-queue',
  title: 'Project Work Queue',
  description: 'Actionable work items for this project filtered from the unified work feed.',
  defaultForRoles: ['project-administrator', 'project-manager', 'superintendent', 'project-team-member'],
  mandatory: true,
  component: createReferenceTileComponents('project-work-queue', 'Project Work Queue'),
  defaultColSpan: 4,
  defaultRowSpan: 2,
  lockable: true,
};

/** Project Activity — mandatory (Phase 3 P3-C2 §6), Activity spine */
export const projectActivityDef: ICanvasTileDefinition = {
  tileKey: 'project-activity',
  title: 'Project Activity',
  description: 'Recent project activity timeline from all module sources.',
  defaultForRoles: ['project-administrator', 'project-executive', 'project-manager', 'superintendent', 'project-team-member', 'project-viewer'],
  mandatory: true,
  component: createReferenceTileComponents('project-activity', 'Project Activity'),
  defaultColSpan: 4,
  defaultRowSpan: 2,
  lockable: false,
};

/** AI Insight — catalog-only, wraps AIInsightTile placeholder, sets aiComponent */
export const aiInsightDef: ICanvasTileDefinition = {
  tileKey: 'ai-insight',
  title: 'AI Insight',
  description: 'AI-powered project insights and recommendations. Requires AI module activation.',
  defaultForRoles: [],
  mandatory: false,
  component: {
    essential: aiLazy,
    standard: aiLazy,
    expert: aiLazy,
  },
  aiComponent: aiLazy,
  defaultColSpan: 6,
  defaultRowSpan: 1,
  lockable: false,
};

/** Aggregated array of all 14 reference tile definitions — D-SF13-T07 + Phase 3 */
export const referenceTiles: ICanvasTileDefinition[] = [
  bicMyItemsDef,
  activeConstraintsDef,
  projectHealthPulseDef,
  permitStatusDef,
  pendingApprovalsDef,
  bdHeritageDef,
  workflowHandoffInboxDef,
  documentActivityDef,
  estimatingPursuitDef,
  notificationSummaryDef,
  relatedItemsDef,
  projectWorkQueueDef,
  projectActivityDef,
  aiInsightDef,
];
