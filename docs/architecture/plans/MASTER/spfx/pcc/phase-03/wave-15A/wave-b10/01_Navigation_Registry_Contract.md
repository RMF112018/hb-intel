# Phase 05 Navigation Registry Contract

## 1. Purpose

Define the source-of-truth registry that drives Phase 05 primary tabs, dropdown child module links, state behavior, disabled reason copy, accessibility markers, and tests.

This registry must prevent drift between:

- navigation rendering;
- module state;
- child module labels;
- disabled reason copy;
- active module selection;
- hero/module summary;
- dashboard preview shells;
- test expectations.

## 2. Recommended File Location

Preferred:

```text
packages/models/src/pcc/PccPrimaryNavigation.ts
```

Acceptable if package export churn is too high for one prompt:

```text
apps/project-control-center/src/shell/pccPrimaryNavigation.ts
```

If the app-local path is used first, include a TODO comment for future promotion to `@hbc/models/pcc`, but do not render that TODO into the UI.

## 3. Required Types

```ts
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
```

## 4. Required State Copy Constants

```ts
export const PCC_MODULE_STATE_COPY: Readonly<Record<PccModuleState, {
  readonly stateLabel: string;
  readonly reason: string;
}>> = {
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
```

## 5. Primary Tab Records

```ts
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
    dashboardDescription:
      'Cross-cutting project operating tools used across stages and roles.',
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
```

## 6. Module Records

The local agent may use this table to create exact registry records.

| Module ID | Label | Parent Tab | State | Selectable | Source |
|---|---|---|---|---:|---|
| action-center | Action Center | project-home | preview | true | PCC |
| my-responsibilities | My Responsibilities | project-home | preview | true | PCC |
| today-this-week | Today / This Week | project-home | preview | true | PCC |
| hbi-assistant | HBI Assistant | core-tools | preview | true | PCC |
| external-platforms | External Platforms | core-tools | launch-only | true | External |
| team-access | Team & Access | core-tools | preview | true | PCC |
| project-directory | Project Directory | core-tools | preview | true | PCC |
| approvals-checkpoints | Approvals & Checkpoints | core-tools | preview | true | PCC |
| primary-documents | Primary Documents Tool | documents | preview | true | SharePoint |
| document-control-center | Document Control Center | documents | available | true | SharePoint |
| drawing-model-center | Drawing & Model Center | documents | deferred | false | Future |
| sharepoint-project-record | SharePoint Project Record | documents | preview | true | SharePoint |
| my-project-files | My Project Files / OneDrive | documents | preview | true | OneDrive |
| procore-documents | Procore Documents | documents | launch-only | true | Procore |
| document-crunch | Document Crunch | documents | launch-only | true | Document Crunch |
| adobe-sign | Adobe Sign | documents | launch-only | true | Adobe Sign |
| future-estimating-modules | Future estimating modules | estimating-preconstruction | deferred | false | Future |
| preconstruction-handoff | Preconstruction Handoff | estimating-preconstruction | deferred | false | Future |
| estimate-assumptions-alternates-exclusions | Estimate Assumptions / Alternates / Exclusions | estimating-preconstruction | deferred | false | Future |
| startup-center | Startup Center | startup-closeout | preview | true | PCC |
| responsibility-matrix | Responsibility Matrix | startup-closeout | preview | true | PCC |
| closeout | Closeout | startup-closeout | preview | true | PCC |
| closeout-turnover-tracker | Closeout & Turnover Tracker | startup-closeout | deferred | false | Future |
| warranty | Warranty | startup-closeout | deferred | false | Future |
| lessons-learned | Lessons Learned | startup-closeout | deferred | false | Future |
| subcontractor-performance | Subcontractor Performance | startup-closeout | deferred | false | Future |
| project-controls-center | Project Controls | project-controls | deferred | false | Future |
| permits-inspections | Permits & Inspections | project-controls | preview | true | PCC |
| contract-compliance | Contract & Compliance | project-controls | deferred | false | Future |
| risk-issues-decisions | Risk / Issues / Decisions | project-controls | deferred | false | Future |
| constraints-log | Constraints Log | project-controls | preview | true | PCC |
| field-operations | Field Operations | project-controls | deferred | false | Future |
| meeting-communication | Meeting & Communication | project-controls | deferred | false | Future |
| financial-reporting | Financial Reporting | cost-time | deferred | false | Future |
| schedule-monitor | Schedule Monitor | cost-time | deferred | false | Future |
| procurement-buyout | Procurement & Buyout | cost-time | preview | true | PCC |
| commitment-cost-exposure | Commitment / Cost Exposure | cost-time | deferred | false | Future |
| site-health | Site Health | systems-administration | preview | true | PCC |
| control-center-settings | Control Center Settings | systems-administration | preview | true | PCC |
| integration-settings | Integration Settings | systems-administration | deferred | false | Future |
| procore-mapping-sync-health | Procore Mapping / Sync Health | systems-administration | preview | true | Procore |
| module-configuration | Module Configuration | systems-administration | preview | true | PCC |

## 7. Helper Functions

The registry must export helpers or local equivalents:

```ts
export function getPrimaryNavigationTab(id: PccPrimaryTabId): PccPrimaryNavigationTab;
export function getModule(id: PccModuleId): PccNavigationModule;
export function getModulesForPrimaryTab(id: PccPrimaryTabId): readonly PccNavigationModule[];
export function isSelectableModule(module: PccNavigationModule): boolean;
export function getParentTabForModule(id: PccModuleId): PccPrimaryTabId;
export function normalizePrimaryTabId(id: unknown): PccPrimaryTabId;
export function normalizeModuleId(id: unknown): PccModuleId | undefined;
```

## 8. Test Requirements

Add tests proving:

- `PCC_PRIMARY_TAB_IDS` contains exactly the eight locked IDs in order.
- Every tab in `PCC_PRIMARY_NAVIGATION_TABS` has matching ID, label, dashboard title, description, and at least one module.
- Every module ID exists exactly once.
- Every module parent tab exists.
- Every non-selectable module has `disabledReason`.
- Every selectable module has approved authority copy.
- No registry label/reason/summary contains forbidden developer-facing terms.
- `documents` visible label is exactly `Document Control`.

## 9. UI Copy Guardrail

No registry-provided visible copy may include any of these terms case-insensitively:

```text
TODO
TBD
placeholder
stub
mock
fixture
debug
dev-only
not implemented
lorem
developer
code agent
prompt
repo
test selector
internal only
```

If tests need to refer to those terms, keep them in test constants and assert they do not appear in rendered UI.
