import type {
  ProjectHubSpfxDashboardSurfaceDefinition,
  ProjectHubSpfxModuleDefinition,
} from './types.js';
import { PROJECT_HUB_SPFX_ESCALATION_SCENARIO_MAP } from './escalationScenarios.js';

export const PROJECT_HUB_SPFX_DASHBOARD_SURFACES: readonly ProjectHubSpfxDashboardSurfaceDefinition[] = [
  {
    id: 'summary-strip',
    label: 'Dashboard summary strip',
    primaryDataSurfaceType: 'summary-strip-kpi',
  },
  {
    id: 'escalation-hub',
    label: 'Dashboard escalation hub',
    primaryDataSurfaceType: 'card-list-view',
  },
  {
    id: 'module-launchers',
    label: 'Dashboard module launchers',
    primaryDataSurfaceType: 'card-list-view',
  },
] as const;

export const PROJECT_HUB_SPFX_MODULES: readonly ProjectHubSpfxModuleDefinition[] = [
  {
    slug: 'financial',
    navLabel: 'Financial',
    title: 'Financial',
    depth: 'broad',
    pageLayout: 'dashboard',
    primaryDataSurfaceType: 'card-list-view',
    summary:
      'Operational financial-control surface for confirmed versions, working forecasts, reconciliation, and buyout tracking.',
    spfxCapabilities: [
      'View and edit the Financial Summary working state.',
      'Reconcile budget lines, manage versions, and work confirmed/published comparisons.',
      'Work GC/GR, cash flow, A/R aging visibility, buyout logs, and forecast checklist gates.',
    ],
    pwaEscalations: [
      {
        label: 'Open buyout disposition workflow',
        description: 'Savings disposition remains a PWA-depth multi-step workflow.',
        module: 'financial',
      },
      {
        label: 'Open PER version review',
        description: 'Confirmed-version executive-review threads and deeper review workflows continue in PWA.',
        module: 'financial',
      },
    ],
  },
  {
    slug: 'schedule',
    navLabel: 'Schedule',
    title: 'Schedule',
    depth: 'broad',
    pageLayout: 'dashboard',
    primaryDataSurfaceType: 'card-list-view',
    summary:
      'Operational schedule surface for published views, milestones, work packages, blockers, readiness, and PPC.',
    spfxCapabilities: [
      'View published schedule summaries, milestones, grading, and confidence outputs.',
      'Manage work packages, commitments, blockers, readiness tracking, and look-ahead planning.',
      'Support milestone management and field-operational schedule work without leaving SharePoint.',
    ],
    pwaEscalations: [
      {
        scenarioId: 'schedule-file-ingestion',
        label: PROJECT_HUB_SPFX_ESCALATION_SCENARIO_MAP['schedule-file-ingestion'].label,
        description: PROJECT_HUB_SPFX_ESCALATION_SCENARIO_MAP['schedule-file-ingestion'].description,
        module: 'schedule',
        action: 'import',
      },
      {
        scenarioId: 'schedule-upload-history',
        label: PROJECT_HUB_SPFX_ESCALATION_SCENARIO_MAP['schedule-upload-history'].label,
        description: PROJECT_HUB_SPFX_ESCALATION_SCENARIO_MAP['schedule-upload-history'].description,
        module: 'schedule',
        view: 'history',
      },
      {
        label: 'Open publication and scenario tools',
        description: 'Stage-gated publication, progress verification, scenario branching, and export continue in PWA.',
        module: 'schedule',
      },
    ],
  },
  {
    slug: 'constraints',
    navLabel: 'Constraints',
    title: 'Constraints',
    depth: 'broad',
    pageLayout: 'dashboard',
    primaryDataSurfaceType: 'card-list-view',
    summary:
      'Full four-ledger operational surface for risk, constraint, delay, and change management with shared lineage.',
    spfxCapabilities: [
      'Create and manage Risk, Constraint, Delay, and Change ledgers.',
      'Work lifecycle state, scoring, time/commercial separation, and cross-ledger lineage.',
      'Use related-items linkage and export the main ledger outputs directly from SPFx.',
    ],
    pwaEscalations: [
      {
        label: 'Open published review packages',
        description: 'Published snapshots and deeper review-package workflows remain PWA-depth.',
        module: 'constraints',
      },
    ],
  },
  {
    slug: 'permits',
    navLabel: 'Permits',
    title: 'Permits',
    depth: 'broad',
    pageLayout: 'dashboard',
    primaryDataSurfaceType: 'card-list-view',
    summary:
      'Operational permit-management lane for application CRUD, issued permits, inspections, deficiencies, and compliance visibility.',
    spfxCapabilities: [
      'Manage permit applications, issued permits, lifecycle actions, and inspection records.',
      'Track deficiencies, expiration risk, derived health, compliance dashboards, and work queue items.',
      'Use permit-thread views, inspection checkpoints, and project-level compliance visibility in-lane.',
    ],
    pwaEscalations: [
      {
        label: 'Import required inspections',
        description: 'The xlsx required-inspections import experience remains PWA-depth.',
        module: 'permits',
        action: 'import',
      },
      {
        label: 'Upload permit evidence',
        description: 'Evidence uploads continue in PWA even though evidence records remain visible in both lanes.',
        module: 'permits',
      },
      {
        label: 'Open annotated permit export',
        description: 'Annotated PER-oriented permit summary export is governed as a PWA workflow.',
        module: 'permits',
      },
    ],
  },
  {
    slug: 'safety',
    navLabel: 'Safety',
    title: 'Safety',
    depth: 'broad',
    pageLayout: 'dashboard',
    primaryDataSurfaceType: 'card-list-view',
    summary:
      'Operational safety lane for weekly execution, corrective action handling, readiness decisions, and field-team safety work.',
    spfxCapabilities: [
      'Work SSSP approvals, inspections, corrective actions, JHAs, daily pre-task plans, and worker records.',
      'Use readiness surfaces, override workflows, scorecards, and read-only schedule intelligence.',
      'Handle standard-tier operational safety work directly in SPFx.',
    ],
    pwaEscalations: [
      {
        label: 'Open governed safety reports',
        description: 'The dedicated Safety reports workspace remains a PWA-only surface.',
        module: 'safety',
      },
    ],
    note:
      'Safety stays outside the PER annotation layer in both lanes. SPFx remains broad, but governed sections and sensitive record creation still escalate where the matrix requires it.',
  },
  {
    slug: 'reports',
    navLabel: 'Reports',
    title: 'Reports',
    depth: 'broad',
    pageLayout: 'dashboard',
    primaryDataSurfaceType: 'card-list-view',
    summary:
      'Report interaction surface for view, preview, generate, approval, release status, and basic draft editing.',
    spfxCapabilities: [
      'View report lists, statuses, previews, and export surfaces.',
      'Generate and queue report runs, approve PX Review, and release where supported.',
      'Handle basic draft editing and staleness visibility in the SharePoint lane.',
    ],
    pwaEscalations: [
      {
        scenarioId: 'report-run-ledger-history',
        label: PROJECT_HUB_SPFX_ESCALATION_SCENARIO_MAP['report-run-ledger-history'].label,
        description: PROJECT_HUB_SPFX_ESCALATION_SCENARIO_MAP['report-run-ledger-history'].description,
        module: 'reports',
        view: 'history',
      },
    ],
  },
  {
    slug: 'qc',
    navLabel: 'QC',
    title: 'Quality Control',
    depth: 'baseline-visible',
    pageLayout: 'dashboard',
    primaryDataSurfaceType: 'card-list-view',
    summary:
      'Baseline-visible internal-control surface for quality-plan, review, issue, advisory, and readiness visibility.',
    spfxCapabilities: [
      'Show quality-plan, review, issue, advisory, and readiness visibility in the project lane.',
      'Keep QC visible in the same governed project context as other Phase 3 modules.',
    ],
    pwaEscalations: [],
    note:
      'Deep operational field/mobile execution and package-file ownership remain deferred to Phase 6 in both lanes.',
  },
  {
    slug: 'closeout',
    navLabel: 'Closeout',
    title: 'Project Closeout',
    depth: 'broad',
    pageLayout: 'dashboard',
    primaryDataSurfaceType: 'card-list-view',
    summary:
      'Always-on lifecycle module for checklist execution, scorecards, lessons, autopsy summary, and archive-readiness review.',
    spfxCapabilities: [
      'Work checklist execution, milestones, scorecards, and closeout-lifecycle visibility.',
      'Use current scorecard evaluations, autopsy summaries, lessons lists, and archive-ready approval actions.',
      'Consume contextual org-intelligence and derived closeout read models directly in-lane.',
    ],
    pwaEscalations: [
      {
        label: 'Submit lessons-learning report',
        description: 'Lessons synthesis and report submission stay PWA-depth.',
        module: 'closeout',
      },
      {
        label: 'Open autopsy authoring workspace',
        description: 'Workshop facilitation, findings authoring, and legacy-output creation continue in PWA.',
        module: 'closeout',
      },
    ],
  },
  {
    slug: 'startup',
    navLabel: 'Startup',
    title: 'Project Startup',
    depth: 'required',
    pageLayout: 'dashboard',
    primaryDataSurfaceType: 'card-list-view',
    summary:
      'Full-parity startup and mobilization lane with only a small set of governed PWA escalations for depth-specific interactions.',
    spfxCapabilities: [
      'Work readiness tasks, certifications, obligations, responsibility matrix, PM plan, and gate actions.',
      'Handle permit-posting metadata, waiver records, blockers, baseline locking, and mobilization authorization.',
      'Use the full startup certification surface directly in SPFx.',
    ],
    pwaEscalations: [
      {
        label: 'Upload permit-posting photo evidence',
        description: 'Photo evidence upload remains a governed PWA interaction.',
        module: 'startup',
      },
      {
        label: 'Open state-history timeline',
        description: 'State-machine history and advanced dependency visualization remain PWA-depth.',
        module: 'startup',
      },
    ],
  },
  {
    slug: 'subcontract-readiness',
    navLabel: 'Sub Readiness',
    title: 'Subcontract Execution Readiness',
    depth: 'broad',
    pageLayout: 'dashboard',
    primaryDataSurfaceType: 'card-list-view',
    summary:
      'Operational readiness lane for case maintenance, intake, exception handling, and Financial gate projection continuity.',
    spfxCapabilities: [
      'Maintain readiness cases and requirement-item artifact intake.',
      'Work broad compliance/risk evaluation and exception submission workflows.',
      'Surface readiness-gate projection into Financial without leaving the project lane.',
    ],
    pwaEscalations: [
      {
        label: 'Open reassignment audit trail',
        description: 'Controlled reassignment audit history remains PWA-depth.',
        module: 'subcontract-readiness',
      },
      {
        label: 'Open precedent publication management',
        description: 'Precedent publication management stays in the richer PWA workflow.',
        module: 'subcontract-readiness',
      },
    ],
  },
  {
    slug: 'warranty',
    navLabel: 'Warranty',
    title: 'Warranty',
    depth: 'read-only',
    pageLayout: 'dashboard',
    primaryDataSurfaceType: 'card-list-view',
    summary:
      'Essential read-only warranty lane for coverage visibility, SLA status, and canvas metrics, with all mutation workflows escalating to PWA.',
    spfxCapabilities: [
      'View Coverage Registry essentials, filters, saved views, and complexity dial in read-only mode.',
      'See SLA status, escalation visibility, and warranty health-derived canvas metrics in project context.',
      'Retain governed visibility into warranty posture without creating a field-local mutation fork.',
    ],
    pwaEscalations: [
      {
        label: 'Open warranty case workspace',
        description: 'Case authoring, assignment, communications, and resolution remain PWA-depth.',
        module: 'warranty',
      },
      {
        label: 'Create or edit coverage items',
        description: 'Coverage item mutation, owner intake, acknowledgments, and evidence upload continue in PWA.',
        module: 'warranty',
      },
    ],
  },
] as const;

export const PROJECT_HUB_SPFX_MODULE_MAP: Readonly<Record<string, ProjectHubSpfxModuleDefinition>> =
  Object.fromEntries(PROJECT_HUB_SPFX_MODULES.map((module) => [module.slug, module]));
