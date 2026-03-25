import type {
  ProjectHubSpfxEscalationScenario,
  ProjectHubSpfxEscalationScenarioId,
} from './types.js';

export const PROJECT_HUB_SPFX_ESCALATION_SCENARIOS: readonly ProjectHubSpfxEscalationScenario[] = [
  {
    id: 'cross-project-navigation',
    label: 'Switch to another project in PWA',
    description: 'Open the portfolio root when the next task requires a different project context.',
    placement: 'dashboard',
    target: 'project-hub-root',
    requiresProjectId: false,
  },
  {
    id: 'schedule-file-ingestion',
    label: 'Import schedule file',
    description: 'XER/XML/CSV ingestion is a governed PWA workflow.',
    placement: 'module',
    target: 'project-hub-module',
    module: 'schedule',
    action: 'import',
    requiresProjectId: true,
    requiresReturnTo: true,
  },
  {
    id: 'schedule-upload-history',
    label: 'View upload history',
    description: 'Upload history, restore, and canonical-source management remain PWA-depth.',
    placement: 'module',
    target: 'project-hub-module',
    module: 'schedule',
    view: 'history',
    requiresProjectId: true,
    requiresReturnTo: true,
  },
  {
    id: 'report-run-ledger-history',
    label: 'Open run-ledger history',
    description: 'Full run-ledger history and continuity browsing remain PWA-depth.',
    placement: 'module',
    target: 'project-hub-module',
    module: 'reports',
    view: 'history',
    requiresProjectId: true,
    requiresReturnTo: true,
  },
  {
    id: 'advanced-draft-recovery',
    label: 'Resume advanced draft recovery',
    description: 'IndexedDB-backed recovery continues in the full PWA recovery flow.',
    placement: 'reports-review',
    target: 'project-hub-control-center',
    requiresProjectId: true,
  },
  {
    id: 'multi-project-portfolio',
    label: 'Open multi-project portfolio',
    description: 'Open the full Project Hub portfolio root for cross-project oversight and switching.',
    placement: 'dashboard',
    target: 'project-hub-root',
    requiresProjectId: false,
  },
  {
    id: 'full-work-queue-feed',
    label: 'Open full work queue feed',
    description: 'The complete work queue feed remains a PWA-depth workspace.',
    placement: 'dashboard',
    target: 'my-work',
    requiresProjectId: true,
    requiresReturnTo: true,
  },
  {
    id: 'full-activity-timeline',
    label: 'Open full activity timeline',
    description: 'Timeline browsing beyond the SPFx summary tile continues in PWA.',
    placement: 'dashboard',
    target: 'project-activity',
    requiresProjectId: true,
    requiresReturnTo: true,
  },
  {
    id: 'advanced-canvas-admin',
    label: 'Open advanced canvas admin',
    description: 'Advanced canvas administration remains a PWA-depth workspace.',
    placement: 'dashboard',
    target: 'project-hub-control-center',
    requiresProjectId: true,
    requiresReturnTo: true,
  },
  {
    id: 'personal-work-hub',
    label: 'Open Personal Work Hub',
    description: 'Launch the workspace-level My Work experience in the PWA.',
    placement: 'dashboard',
    target: 'my-work',
    requiresProjectId: false,
  },
  {
    id: 'executive-review-thread-management',
    label: 'Manage selected review thread',
    description: 'Artifact-specific executive review thread management escalates to the PWA review workspace.',
    placement: 'reports-review',
    target: 'project-hub-module',
    module: 'review',
    view: 'thread',
    requiresProjectId: true,
    requiresReturnTo: true,
    requiresReviewArtifactId: true,
  },
  {
    id: 'multi-run-review-comparison',
    label: 'Compare reviewer-generated runs',
    description: 'Multi-run comparison remains a PWA-depth review capability.',
    placement: 'reports-review',
    target: 'project-hub-module',
    module: 'review',
    view: 'compare',
    requiresProjectId: true,
    requiresReturnTo: true,
  },
  {
    id: 'full-executive-review-history',
    label: 'Open full executive review history',
    description: 'Full review-history browsing remains a PWA-depth review capability.',
    placement: 'reports-review',
    target: 'project-hub-module',
    module: 'review',
    view: 'history',
    requiresProjectId: true,
    requiresReturnTo: true,
  },
] as const;

export const PROJECT_HUB_SPFX_ESCALATION_SCENARIO_MAP: Readonly<
Record<ProjectHubSpfxEscalationScenarioId, ProjectHubSpfxEscalationScenario>
> = Object.fromEntries(
  PROJECT_HUB_SPFX_ESCALATION_SCENARIOS.map((scenario) => [scenario.id, scenario]),
) as Readonly<Record<ProjectHubSpfxEscalationScenarioId, ProjectHubSpfxEscalationScenario>>;

export const PROJECT_HUB_SPFX_DASHBOARD_ESCALATIONS = PROJECT_HUB_SPFX_ESCALATION_SCENARIOS.filter(
  (scenario) => scenario.placement === 'dashboard',
);

export const PROJECT_HUB_SPFX_REPORTS_REVIEW_ESCALATIONS =
  PROJECT_HUB_SPFX_ESCALATION_SCENARIOS.filter(
    (scenario) => scenario.placement === 'reports-review',
  );
