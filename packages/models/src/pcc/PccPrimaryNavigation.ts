/**
 * PCC Phase 05 — Grouped Tab / Module Navigation Registry.
 *
 * Defines the typed contract for the Phase 05 navigation model:
 *   Primary Tab = Dashboard Surface
 *   Module      = Entry point under that Dashboard Surface
 *
 * This module is read-model metadata only. It defines no UI, no router,
 * no shell-state wiring, no SPFx host wiring, no SharePoint/Procore/Sage
 * runtime, and no writeback. Later prompts consume this registry to
 * implement the shell, state, surfaces, and live evidence.
 */

export const PCC_PRIMARY_TAB_IDS = [
  'project-home',
  'core-tools',
  'documents',
  'estimating-preconstruction',
  'startup-closeout',
  'project-controls',
  'cost-time',
  'systems-administration',
] as const;

export type PccPrimaryTabId = (typeof PCC_PRIMARY_TAB_IDS)[number];

export const PCC_MODULE_STATES = [
  'available',
  'preview',
  'read-only',
  'launch-only',
  'configuration-required',
  'source-unavailable',
  'deferred',
] as const;

export type PccModuleState = (typeof PCC_MODULE_STATES)[number];

export const PCC_MODULE_IDS = [
  'action-center',
  'my-responsibilities',
  'today-this-week',
  'hbi-assistant',
  'external-platforms',
  'team-access',
  'project-directory',
  'approvals-checkpoints',
  'primary-documents',
  'document-control-center',
  'drawing-model-center',
  'sharepoint-project-record',
  'my-project-files',
  'procore-documents',
  'document-crunch',
  'adobe-sign',
  'future-estimating-modules',
  'preconstruction-handoff',
  'estimate-assumptions-alternates-exclusions',
  'startup-center',
  'responsibility-matrix',
  'closeout',
  'closeout-turnover-tracker',
  'warranty',
  'lessons-learned',
  'subcontractor-performance',
  'project-controls-center',
  'permits-inspections',
  'contract-compliance',
  'risk-issues-decisions',
  'constraints-log',
  'field-operations',
  'meeting-communication',
  'financial-reporting',
  'schedule-monitor',
  'procurement-buyout',
  'commitment-cost-exposure',
  'site-health',
  'control-center-settings',
  'integration-settings',
  'procore-mapping-sync-health',
  'module-configuration',
] as const;

export type PccModuleId = (typeof PCC_MODULE_IDS)[number];

export type PccModuleSourceSystem =
  | 'PCC'
  | 'SharePoint'
  | 'Procore'
  | 'Sage'
  | 'Power BI'
  | 'Document Crunch'
  | 'Adobe Sign'
  | 'OneDrive'
  | 'External'
  | 'Future';

export interface PccModuleStateCopy {
  readonly stateLabel: string;
  readonly reason: string;
}

export interface PccNavigationModule {
  readonly id: PccModuleId;
  readonly label: string;
  readonly parentTabId: PccPrimaryTabId;
  readonly state: PccModuleState;
  readonly stateLabel: string;
  readonly summary: string;
  readonly disabledReason?: string;
  readonly authorityCue: string;
  readonly sourceSystem: PccModuleSourceSystem;
  readonly selectable: boolean;
  readonly dashboardSectionId?: string;
  readonly stageVisibility?: readonly string[];
  readonly roleVisibility?: readonly string[];
}

export interface PccPrimaryNavigationTab {
  readonly id: PccPrimaryTabId;
  readonly label: string;
  readonly dashboardTitle: string;
  readonly dashboardDescription: string;
  readonly modules: readonly PccModuleId[];
}

export const PCC_MODULE_STATE_COPY: Readonly<Record<PccModuleState, PccModuleStateCopy>> = {
  available: {
    stateLabel: 'Available',
    reason: 'Open this module to review current project information.',
  },
  preview: {
    stateLabel: 'Preview',
    reason: 'Preview only. Review source records before taking action.',
  },
  'read-only': {
    stateLabel: 'Read-only',
    reason: 'Read-only view. No approvals, decisions, or writeback are performed here.',
  },
  'launch-only': {
    stateLabel: 'Launch-only',
    reason: 'Opens or references the source system. PCC does not write back to that system.',
  },
  'configuration-required': {
    stateLabel: 'Configuration required',
    reason: 'Configuration is required before this module can open for the selected project.',
  },
  'source-unavailable': {
    stateLabel: 'Source unavailable',
    reason: 'Source data is not available for the selected project.',
  },
  deferred: {
    stateLabel: 'Future release',
    reason: 'Planned for a future release. This module is not active for the selected project.',
  },
};

export const PCC_PRIMARY_NAVIGATION_TABS: readonly PccPrimaryNavigationTab[] = [
  {
    id: 'project-home',
    label: 'Project Home',
    dashboardTitle: 'Project Home',
    dashboardDescription:
      'Daily project command dashboard for priorities, responsibilities, and near-term work.',
    modules: ['action-center', 'my-responsibilities', 'today-this-week'],
  },
  {
    id: 'core-tools',
    label: 'Core Tools',
    dashboardTitle: 'Core Tools',
    dashboardDescription: 'Cross-cutting project operating tools used across stages and roles.',
    modules: [
      'hbi-assistant',
      'external-platforms',
      'team-access',
      'project-directory',
      'approvals-checkpoints',
    ],
  },
  {
    id: 'documents',
    label: 'Document Control',
    dashboardTitle: 'Document Control',
    dashboardDescription:
      'Primary project document, drawing, model, and source-file control surface.',
    modules: [
      'primary-documents',
      'document-control-center',
      'drawing-model-center',
      'sharepoint-project-record',
      'my-project-files',
      'procore-documents',
      'document-crunch',
      'adobe-sign',
    ],
  },
  {
    id: 'estimating-preconstruction',
    label: 'Estimating & Preconstruction',
    dashboardTitle: 'Estimating & Preconstruction',
    dashboardDescription:
      'Continuity dashboard for preconstruction handoff, estimating assumptions, alternates, and exclusions.',
    modules: [
      'future-estimating-modules',
      'preconstruction-handoff',
      'estimate-assumptions-alternates-exclusions',
    ],
  },
  {
    id: 'startup-closeout',
    label: 'Project Startup & Closeout',
    dashboardTitle: 'Project Startup & Closeout',
    dashboardDescription:
      'Startup, responsibility, closeout, turnover, warranty, lessons learned, and subcontractor performance dashboard.',
    modules: [
      'startup-center',
      'responsibility-matrix',
      'closeout',
      'closeout-turnover-tracker',
      'warranty',
      'lessons-learned',
      'subcontractor-performance',
    ],
  },
  {
    id: 'project-controls',
    label: 'Project Controls',
    dashboardTitle: 'Project Controls',
    dashboardDescription:
      'Active project controls, field coordination, compliance, risks, constraints, and communication dashboard.',
    modules: [
      'project-controls-center',
      'permits-inspections',
      'contract-compliance',
      'risk-issues-decisions',
      'constraints-log',
      'field-operations',
      'meeting-communication',
    ],
  },
  {
    id: 'cost-time',
    label: 'Cost & Time',
    dashboardTitle: 'Cost & Time',
    dashboardDescription:
      'Financial, schedule, procurement, buyout, commitment, and time-risk dashboard.',
    modules: [
      'financial-reporting',
      'schedule-monitor',
      'procurement-buyout',
      'commitment-cost-exposure',
    ],
  },
  {
    id: 'systems-administration',
    label: 'Systems Administration',
    dashboardTitle: 'Systems Administration',
    dashboardDescription:
      'Governance, configuration, integration, site health, and template administration dashboard.',
    modules: [
      'site-health',
      'control-center-settings',
      'integration-settings',
      'procore-mapping-sync-health',
      'module-configuration',
    ],
  },
];

const PCC_PREVIEW_AUTHORITY_CUE =
  'Context and review only. No decisions, approvals, or writeback to source systems are performed here.';

const PCC_LAUNCH_ONLY_AUTHORITY_CUE =
  'Opens or references the source system. PCC does not write back to that system.';

const PCC_DEFERRED_AUTHORITY_CUE =
  'Not active for the selected project. Planned for a future release.';

export const PCC_NAVIGATION_MODULES: readonly PccNavigationModule[] = [
  // Project Home
  {
    id: 'action-center',
    label: 'Action Center',
    parentTabId: 'project-home',
    state: 'preview',
    stateLabel: PCC_MODULE_STATE_COPY.preview.stateLabel,
    summary: 'Daily action queue across the active project.',
    authorityCue: PCC_PREVIEW_AUTHORITY_CUE,
    sourceSystem: 'PCC',
    selectable: true,
  },
  {
    id: 'my-responsibilities',
    label: 'My Responsibilities',
    parentTabId: 'project-home',
    state: 'preview',
    stateLabel: PCC_MODULE_STATE_COPY.preview.stateLabel,
    summary: 'Items where the current user owns or shares responsibility.',
    authorityCue: PCC_PREVIEW_AUTHORITY_CUE,
    sourceSystem: 'PCC',
    selectable: true,
  },
  {
    id: 'today-this-week',
    label: 'Today / This Week',
    parentTabId: 'project-home',
    state: 'preview',
    stateLabel: PCC_MODULE_STATE_COPY.preview.stateLabel,
    summary: 'Near-term focus rollup across the next several days.',
    authorityCue: PCC_PREVIEW_AUTHORITY_CUE,
    sourceSystem: 'PCC',
    selectable: true,
  },

  // Core Tools
  {
    id: 'hbi-assistant',
    label: 'HBI Assistant',
    parentTabId: 'core-tools',
    state: 'preview',
    stateLabel: PCC_MODULE_STATE_COPY.preview.stateLabel,
    summary: 'Project-aware assistant for context lookups and grounded suggestions.',
    authorityCue:
      'Advisory only. HBI provides context and suggestions; no decisions, no approvals, and no writeback to source systems are performed here.',
    sourceSystem: 'PCC',
    selectable: true,
  },
  {
    id: 'external-platforms',
    label: 'External Platforms',
    parentTabId: 'core-tools',
    state: 'launch-only',
    stateLabel: PCC_MODULE_STATE_COPY['launch-only'].stateLabel,
    summary: 'Catalog of external platforms with launch links and mapping context.',
    authorityCue: PCC_LAUNCH_ONLY_AUTHORITY_CUE,
    sourceSystem: 'External',
    selectable: true,
  },
  {
    id: 'team-access',
    label: 'Team & Access',
    parentTabId: 'core-tools',
    state: 'preview',
    stateLabel: PCC_MODULE_STATE_COPY.preview.stateLabel,
    summary: 'Project team membership and access posture.',
    authorityCue: PCC_PREVIEW_AUTHORITY_CUE,
    sourceSystem: 'PCC',
    selectable: true,
  },
  {
    id: 'project-directory',
    label: 'Project Directory',
    parentTabId: 'core-tools',
    state: 'preview',
    stateLabel: PCC_MODULE_STATE_COPY.preview.stateLabel,
    summary: 'People, companies, and roles associated with the project.',
    authorityCue: PCC_PREVIEW_AUTHORITY_CUE,
    sourceSystem: 'PCC',
    selectable: true,
  },
  {
    id: 'approvals-checkpoints',
    label: 'Approvals & Checkpoints',
    parentTabId: 'core-tools',
    state: 'preview',
    stateLabel: PCC_MODULE_STATE_COPY.preview.stateLabel,
    summary: 'Checkpoint context across active project workflows.',
    authorityCue:
      'Checkpoint context only. Approval decisions remain in governed workflows; PCC does not perform them here.',
    sourceSystem: 'PCC',
    selectable: true,
  },

  // Document Control
  {
    id: 'primary-documents',
    label: 'Primary Documents Tool',
    parentTabId: 'documents',
    state: 'preview',
    stateLabel: PCC_MODULE_STATE_COPY.preview.stateLabel,
    summary: 'Primary project documents managed through the Document Control surface.',
    authorityCue: 'SharePoint-backed view. No SharePoint writeback is performed in this phase.',
    sourceSystem: 'SharePoint',
    selectable: true,
  },
  {
    id: 'document-control-center',
    label: 'Document Control Center',
    parentTabId: 'documents',
    state: 'available',
    stateLabel: PCC_MODULE_STATE_COPY.available.stateLabel,
    summary: 'Central document control surface for the active project.',
    authorityCue:
      'Read-only project view. No SharePoint or external-system writeback is performed here.',
    sourceSystem: 'SharePoint',
    selectable: true,
  },
  {
    id: 'drawing-model-center',
    label: 'Drawing & Model Center',
    parentTabId: 'documents',
    state: 'deferred',
    stateLabel: PCC_MODULE_STATE_COPY.deferred.stateLabel,
    summary: 'Drawing and model control center for the active project.',
    disabledReason: PCC_MODULE_STATE_COPY.deferred.reason,
    authorityCue: PCC_DEFERRED_AUTHORITY_CUE,
    sourceSystem: 'Future',
    selectable: false,
  },
  {
    id: 'sharepoint-project-record',
    label: 'SharePoint Project Record',
    parentTabId: 'documents',
    state: 'preview',
    stateLabel: PCC_MODULE_STATE_COPY.preview.stateLabel,
    summary: 'SharePoint project record reference for the active project.',
    authorityCue:
      'SharePoint-backed reference. No SharePoint writeback is performed in this phase.',
    sourceSystem: 'SharePoint',
    selectable: true,
  },
  {
    id: 'my-project-files',
    label: 'My Project Files / OneDrive',
    parentTabId: 'documents',
    state: 'preview',
    stateLabel: PCC_MODULE_STATE_COPY.preview.stateLabel,
    summary: 'Personal OneDrive folders and files associated with the active project.',
    authorityCue: 'OneDrive-backed view. No OneDrive writeback is performed in this phase.',
    sourceSystem: 'OneDrive',
    selectable: true,
  },
  {
    id: 'procore-documents',
    label: 'Procore Documents',
    parentTabId: 'documents',
    state: 'launch-only',
    stateLabel: PCC_MODULE_STATE_COPY['launch-only'].stateLabel,
    summary: 'Opens Procore Documents in the source system.',
    authorityCue:
      'Opens Procore Documents in the source system. PCC does not write back to Procore.',
    sourceSystem: 'Procore',
    selectable: true,
  },
  {
    id: 'document-crunch',
    label: 'Document Crunch',
    parentTabId: 'documents',
    state: 'launch-only',
    stateLabel: PCC_MODULE_STATE_COPY['launch-only'].stateLabel,
    summary: 'Opens Document Crunch in the source system.',
    authorityCue:
      'Opens Document Crunch in the source system. PCC does not write back to that system.',
    sourceSystem: 'Document Crunch',
    selectable: true,
  },
  {
    id: 'adobe-sign',
    label: 'Adobe Sign',
    parentTabId: 'documents',
    state: 'launch-only',
    stateLabel: PCC_MODULE_STATE_COPY['launch-only'].stateLabel,
    summary: 'Opens Adobe Sign in the source system.',
    authorityCue: 'Opens Adobe Sign in the source system. PCC does not write back to that system.',
    sourceSystem: 'Adobe Sign',
    selectable: true,
  },

  // Estimating & Preconstruction
  {
    id: 'future-estimating-modules',
    label: 'Future estimating modules',
    parentTabId: 'estimating-preconstruction',
    state: 'deferred',
    stateLabel: PCC_MODULE_STATE_COPY.deferred.stateLabel,
    summary: 'Planned estimating modules under the Estimating & Preconstruction surface.',
    disabledReason: PCC_MODULE_STATE_COPY.deferred.reason,
    authorityCue: PCC_DEFERRED_AUTHORITY_CUE,
    sourceSystem: 'Future',
    selectable: false,
  },
  {
    id: 'preconstruction-handoff',
    label: 'Preconstruction Handoff',
    parentTabId: 'estimating-preconstruction',
    state: 'deferred',
    stateLabel: PCC_MODULE_STATE_COPY.deferred.stateLabel,
    summary: 'Continuity record from preconstruction into project execution.',
    disabledReason: PCC_MODULE_STATE_COPY.deferred.reason,
    authorityCue: PCC_DEFERRED_AUTHORITY_CUE,
    sourceSystem: 'Future',
    selectable: false,
  },
  {
    id: 'estimate-assumptions-alternates-exclusions',
    label: 'Estimate Assumptions / Alternates / Exclusions',
    parentTabId: 'estimating-preconstruction',
    state: 'deferred',
    stateLabel: PCC_MODULE_STATE_COPY.deferred.stateLabel,
    summary: 'Estimate-stage assumptions, alternates, and exclusions reference.',
    disabledReason: PCC_MODULE_STATE_COPY.deferred.reason,
    authorityCue: PCC_DEFERRED_AUTHORITY_CUE,
    sourceSystem: 'Future',
    selectable: false,
  },

  // Project Startup & Closeout
  {
    id: 'startup-center',
    label: 'Startup Center',
    parentTabId: 'startup-closeout',
    state: 'preview',
    stateLabel: PCC_MODULE_STATE_COPY.preview.stateLabel,
    summary: 'Project startup readiness and onboarding tasks.',
    authorityCue: PCC_PREVIEW_AUTHORITY_CUE,
    sourceSystem: 'PCC',
    selectable: true,
  },
  {
    id: 'responsibility-matrix',
    label: 'Responsibility Matrix',
    parentTabId: 'startup-closeout',
    state: 'preview',
    stateLabel: PCC_MODULE_STATE_COPY.preview.stateLabel,
    summary: 'RACI assignments and contractual responsibility coverage for the project.',
    authorityCue: PCC_PREVIEW_AUTHORITY_CUE,
    sourceSystem: 'PCC',
    selectable: true,
  },
  {
    id: 'closeout',
    label: 'Closeout',
    parentTabId: 'startup-closeout',
    state: 'preview',
    stateLabel: PCC_MODULE_STATE_COPY.preview.stateLabel,
    summary: 'Closeout posture and outstanding closeout items for the project.',
    authorityCue: PCC_PREVIEW_AUTHORITY_CUE,
    sourceSystem: 'PCC',
    selectable: true,
  },
  {
    id: 'closeout-turnover-tracker',
    label: 'Closeout & Turnover Tracker',
    parentTabId: 'startup-closeout',
    state: 'deferred',
    stateLabel: PCC_MODULE_STATE_COPY.deferred.stateLabel,
    summary: 'Detailed closeout and turnover tracker for the active project.',
    disabledReason: PCC_MODULE_STATE_COPY.deferred.reason,
    authorityCue: PCC_DEFERRED_AUTHORITY_CUE,
    sourceSystem: 'Future',
    selectable: false,
  },
  {
    id: 'warranty',
    label: 'Warranty',
    parentTabId: 'startup-closeout',
    state: 'deferred',
    stateLabel: PCC_MODULE_STATE_COPY.deferred.stateLabel,
    summary: 'Warranty obligations, periods, and trace records.',
    disabledReason: PCC_MODULE_STATE_COPY.deferred.reason,
    authorityCue: PCC_DEFERRED_AUTHORITY_CUE,
    sourceSystem: 'Future',
    selectable: false,
  },
  {
    id: 'lessons-learned',
    label: 'Lessons Learned',
    parentTabId: 'startup-closeout',
    state: 'deferred',
    stateLabel: PCC_MODULE_STATE_COPY.deferred.stateLabel,
    summary: 'Captured lessons learned for the project.',
    disabledReason: PCC_MODULE_STATE_COPY.deferred.reason,
    authorityCue: PCC_DEFERRED_AUTHORITY_CUE,
    sourceSystem: 'Future',
    selectable: false,
  },
  {
    id: 'subcontractor-performance',
    label: 'Subcontractor Performance',
    parentTabId: 'startup-closeout',
    state: 'deferred',
    stateLabel: PCC_MODULE_STATE_COPY.deferred.stateLabel,
    summary: 'Subcontractor performance summary for the project.',
    disabledReason: PCC_MODULE_STATE_COPY.deferred.reason,
    authorityCue: PCC_DEFERRED_AUTHORITY_CUE,
    sourceSystem: 'Future',
    selectable: false,
  },

  // Project Controls
  {
    id: 'project-controls-center',
    label: 'Project Controls',
    parentTabId: 'project-controls',
    state: 'deferred',
    stateLabel: PCC_MODULE_STATE_COPY.deferred.stateLabel,
    summary: 'Project Controls operating center for the active project.',
    disabledReason: PCC_MODULE_STATE_COPY.deferred.reason,
    authorityCue: PCC_DEFERRED_AUTHORITY_CUE,
    sourceSystem: 'Future',
    selectable: false,
  },
  {
    id: 'permits-inspections',
    label: 'Permits & Inspections',
    parentTabId: 'project-controls',
    state: 'preview',
    stateLabel: PCC_MODULE_STATE_COPY.preview.stateLabel,
    summary: 'Permit and inspection control for the active project.',
    authorityCue: PCC_PREVIEW_AUTHORITY_CUE,
    sourceSystem: 'PCC',
    selectable: true,
  },
  {
    id: 'contract-compliance',
    label: 'Contract & Compliance',
    parentTabId: 'project-controls',
    state: 'deferred',
    stateLabel: PCC_MODULE_STATE_COPY.deferred.stateLabel,
    summary: 'Contractual compliance posture and obligations for the project.',
    disabledReason: PCC_MODULE_STATE_COPY.deferred.reason,
    authorityCue: PCC_DEFERRED_AUTHORITY_CUE,
    sourceSystem: 'Future',
    selectable: false,
  },
  {
    id: 'risk-issues-decisions',
    label: 'Risk / Issues / Decisions',
    parentTabId: 'project-controls',
    state: 'deferred',
    stateLabel: PCC_MODULE_STATE_COPY.deferred.stateLabel,
    summary: 'Risks, issues, and key project decisions log.',
    disabledReason: PCC_MODULE_STATE_COPY.deferred.reason,
    authorityCue: PCC_DEFERRED_AUTHORITY_CUE,
    sourceSystem: 'Future',
    selectable: false,
  },
  {
    id: 'constraints-log',
    label: 'Constraints Log',
    parentTabId: 'project-controls',
    state: 'preview',
    stateLabel: PCC_MODULE_STATE_COPY.preview.stateLabel,
    summary: 'Active constraints and exposure tracker for the project.',
    authorityCue: PCC_PREVIEW_AUTHORITY_CUE,
    sourceSystem: 'PCC',
    selectable: true,
  },
  {
    id: 'field-operations',
    label: 'Field Operations',
    parentTabId: 'project-controls',
    state: 'deferred',
    stateLabel: PCC_MODULE_STATE_COPY.deferred.stateLabel,
    summary: 'Field operations coordination surface for the project.',
    disabledReason: PCC_MODULE_STATE_COPY.deferred.reason,
    authorityCue: PCC_DEFERRED_AUTHORITY_CUE,
    sourceSystem: 'Future',
    selectable: false,
  },
  {
    id: 'meeting-communication',
    label: 'Meeting & Communication',
    parentTabId: 'project-controls',
    state: 'deferred',
    stateLabel: PCC_MODULE_STATE_COPY.deferred.stateLabel,
    summary: 'Meeting and communication coordination for the project.',
    disabledReason: PCC_MODULE_STATE_COPY.deferred.reason,
    authorityCue: PCC_DEFERRED_AUTHORITY_CUE,
    sourceSystem: 'Future',
    selectable: false,
  },

  // Cost & Time
  {
    id: 'financial-reporting',
    label: 'Financial Reporting',
    parentTabId: 'cost-time',
    state: 'deferred',
    stateLabel: PCC_MODULE_STATE_COPY.deferred.stateLabel,
    summary: 'Financial reporting surface for the project.',
    disabledReason: PCC_MODULE_STATE_COPY.deferred.reason,
    authorityCue: PCC_DEFERRED_AUTHORITY_CUE,
    sourceSystem: 'Future',
    selectable: false,
  },
  {
    id: 'schedule-monitor',
    label: 'Schedule Monitor',
    parentTabId: 'cost-time',
    state: 'deferred',
    stateLabel: PCC_MODULE_STATE_COPY.deferred.stateLabel,
    summary: 'Schedule monitoring surface for the project.',
    disabledReason: PCC_MODULE_STATE_COPY.deferred.reason,
    authorityCue: PCC_DEFERRED_AUTHORITY_CUE,
    sourceSystem: 'Future',
    selectable: false,
  },
  {
    id: 'procurement-buyout',
    label: 'Procurement & Buyout',
    parentTabId: 'cost-time',
    state: 'preview',
    stateLabel: PCC_MODULE_STATE_COPY.preview.stateLabel,
    summary: 'Procurement and buyout posture for the project.',
    authorityCue: PCC_PREVIEW_AUTHORITY_CUE,
    sourceSystem: 'PCC',
    selectable: true,
  },
  {
    id: 'commitment-cost-exposure',
    label: 'Commitment / Cost Exposure',
    parentTabId: 'cost-time',
    state: 'deferred',
    stateLabel: PCC_MODULE_STATE_COPY.deferred.stateLabel,
    summary: 'Commitment and cost exposure summary for the project.',
    disabledReason: PCC_MODULE_STATE_COPY.deferred.reason,
    authorityCue: PCC_DEFERRED_AUTHORITY_CUE,
    sourceSystem: 'Future',
    selectable: false,
  },

  // Systems Administration
  {
    id: 'site-health',
    label: 'Site Health',
    parentTabId: 'systems-administration',
    state: 'preview',
    stateLabel: PCC_MODULE_STATE_COPY.preview.stateLabel,
    summary: 'Site health, drift findings, and repair acknowledgement view.',
    authorityCue: PCC_PREVIEW_AUTHORITY_CUE,
    sourceSystem: 'PCC',
    selectable: true,
  },
  {
    id: 'control-center-settings',
    label: 'Control Center Settings',
    parentTabId: 'systems-administration',
    state: 'preview',
    stateLabel: PCC_MODULE_STATE_COPY.preview.stateLabel,
    summary: 'Settings for site, project, persona, and integration scopes.',
    authorityCue: PCC_PREVIEW_AUTHORITY_CUE,
    sourceSystem: 'PCC',
    selectable: true,
  },
  {
    id: 'integration-settings',
    label: 'Integration Settings',
    parentTabId: 'systems-administration',
    state: 'deferred',
    stateLabel: PCC_MODULE_STATE_COPY.deferred.stateLabel,
    summary: 'Integration settings for connected source systems.',
    disabledReason: PCC_MODULE_STATE_COPY.deferred.reason,
    authorityCue: PCC_DEFERRED_AUTHORITY_CUE,
    sourceSystem: 'Future',
    selectable: false,
  },
  {
    id: 'procore-mapping-sync-health',
    label: 'Procore Mapping / Sync Health',
    parentTabId: 'systems-administration',
    state: 'preview',
    stateLabel: PCC_MODULE_STATE_COPY.preview.stateLabel,
    summary: 'Procore project mapping posture and sync-health summary.',
    authorityCue:
      'Mapping and sync-health context only. No writeback to Procore is performed here.',
    sourceSystem: 'Procore',
    selectable: true,
  },
  {
    id: 'module-configuration',
    label: 'Module Configuration',
    parentTabId: 'systems-administration',
    state: 'preview',
    stateLabel: PCC_MODULE_STATE_COPY.preview.stateLabel,
    summary: 'Module configuration overview for the active site and project.',
    authorityCue: PCC_PREVIEW_AUTHORITY_CUE,
    sourceSystem: 'PCC',
    selectable: true,
  },
];

const PRIMARY_TAB_INDEX: ReadonlyMap<PccPrimaryTabId, PccPrimaryNavigationTab> = new Map(
  PCC_PRIMARY_NAVIGATION_TABS.map((tab) => [tab.id, tab]),
);

const MODULE_INDEX: ReadonlyMap<PccModuleId, PccNavigationModule> = new Map(
  PCC_NAVIGATION_MODULES.map((mod) => [mod.id, mod]),
);

const PRIMARY_TAB_ID_SET: ReadonlySet<PccPrimaryTabId> = new Set(PCC_PRIMARY_TAB_IDS);
const MODULE_ID_SET: ReadonlySet<PccModuleId> = new Set(PCC_MODULE_IDS);

export const getPrimaryNavigationTab = (id: PccPrimaryTabId): PccPrimaryNavigationTab => {
  const tab = PRIMARY_TAB_INDEX.get(id);
  if (!tab) {
    throw new Error(`Unknown PCC primary tab id: ${String(id)}`);
  }
  return tab;
};

export const getModule = (id: PccModuleId): PccNavigationModule => {
  const mod = MODULE_INDEX.get(id);
  if (!mod) {
    throw new Error(`Unknown PCC module id: ${String(id)}`);
  }
  return mod;
};

export const getModulesForPrimaryTab = (id: PccPrimaryTabId): readonly PccNavigationModule[] => {
  const tab = getPrimaryNavigationTab(id);
  return tab.modules.map((moduleId) => getModule(moduleId));
};

export const isSelectableModule = (mod: PccNavigationModule): boolean => mod.selectable;

export const getParentTabForModule = (id: PccModuleId): PccPrimaryTabId =>
  getModule(id).parentTabId;

export const normalizePrimaryTabId = (id: unknown): PccPrimaryTabId => {
  if (typeof id === 'string' && PRIMARY_TAB_ID_SET.has(id as PccPrimaryTabId)) {
    return id as PccPrimaryTabId;
  }
  return 'project-home';
};

export const normalizeModuleId = (id: unknown): PccModuleId | undefined => {
  if (typeof id === 'string' && MODULE_ID_SET.has(id as PccModuleId)) {
    return id as PccModuleId;
  }
  return undefined;
};
