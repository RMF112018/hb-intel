import { CLOSEOUT_REPORT_ARTIFACT_FAMILIES } from '../closeout/consumption/constants.js';
import { QC_RECORD_FAMILIES } from '../qc/foundation/constants.js';
import { SAFETY_REPORTS } from '../safety/publication/constants.js';
import { WARRANTY_REPORT_DESIGNATION_DEFINITIONS } from '../warranty/reports-publication/constants.js';
import type {
  IProjectHubBaselineReportFamily,
  IProjectHubReportModuleAuditRow,
  IProjectHubReportsSummary,
} from './types.js';

export const PROJECT_HUB_BASELINE_REPORT_FAMILIES: ReadonlyArray<IProjectHubBaselineReportFamily> = [
  {
    key: 'px-review',
    label: 'PX Review',
    purpose: 'Internal executive review package built from normalized project summary inputs.',
    audience: 'PX, PM, PE',
    sourceModules: ['P3-E4 Financial', 'P3-E5 Schedule', 'P3-E6 Constraints', 'P3-E7 Permits', 'P3-E8 Safety'],
    currentStatus: 'Catalog baseline only',
    recommendedUsage: 'Primary internal baseline report family once central Reports can assemble normalized snapshots.',
    blocker: 'Central Reports registry, draft lifecycle, and module adapters are still missing.',
  },
  {
    key: 'owner-report',
    label: 'Owner Report',
    purpose: 'Trimmed owner-facing status package assembled from governed summary snapshots.',
    audience: 'Owner-facing stakeholders',
    sourceModules: ['P3-E4 Financial', 'P3-E5 Schedule', 'P3-E7 Permits', 'P3-E8 Safety'],
    currentStatus: 'Catalog baseline only',
    recommendedUsage: 'External-facing baseline report family with tighter release governance than PX Review.',
    blocker: 'Central Reports registry, generation, and release lifecycle are still missing.',
  },
  {
    key: 'sub-scorecard',
    label: 'Sub-scorecard',
    purpose: 'Closeout-generated scored subcontractor artifact assembled from PE-approved snapshots.',
    audience: 'PE, PM, Closeout consumers',
    sourceModules: ['P3-E10 Closeout'],
    currentStatus: 'Source snapshot defined',
    recommendedUsage: 'First baseline artifact family to wire once a central Reports consumer exists.',
    blocker: 'Closeout snapshot contracts are defined, but no central Reports runtime consumes them yet.',
  },
  {
    key: 'lessons-learned',
    label: 'Lessons-learned',
    purpose: 'Closeout-generated lessons artifact assembled from PE-approved frozen lesson snapshots.',
    audience: 'PM, PX, org intelligence consumers',
    sourceModules: ['P3-E10 Closeout'],
    currentStatus: 'Source snapshot defined',
    recommendedUsage: 'Baseline governed artifact sourced only from PE-approved Closeout snapshots.',
    blocker: 'Closeout snapshot contracts are defined, but no central Reports runtime consumes them yet.',
  },
] as const;

export const PROJECT_HUB_REPORT_MODULE_AUDIT: ReadonlyArray<IProjectHubReportModuleAuditRow> = [
  {
    module: 'P3-E4 Financial',
    governingPlanFiles: ['P3-E4', 'P3-E4-T03', 'P3-E4-T08', 'P3-E4-T09'],
    currentImplementationStatus: 'Contract-level implementation live in @hbc/features-project-hub',
    reportSupportContract: 'Confirmed snapshot lifecycle plus report-candidate designation and publication promotion hooks.',
    actualImplementationSeams: [
      'packages/features/project-hub/src/financial/versioning/index.ts',
      'packages/features/project-hub/src/financial/constants/index.ts',
      'packages/features/project-hub/src/financial/spine-events/*',
    ],
    canReportsConsumeToday: 'partial',
    gapOrBlocker: 'No normalized Reports snapshot adapter or central Reports consumer exists yet.',
    recommendedBaselineUsage: 'Core PX Review and Owner Report financial summary input.',
  },
  {
    module: 'P3-E5 Schedule',
    governingPlanFiles: ['P3-E5', 'P3-E5-T03', 'P3-E5-T07', 'P3-E5-T09'],
    currentImplementationStatus: 'Contract-level implementation live in @hbc/features-project-hub',
    reportSupportContract: 'Published forecast layer and schedule summary projections can back executive reporting.',
    actualImplementationSeams: [
      'packages/features/project-hub/src/schedule/publication/index.ts',
      'packages/features/project-hub/src/schedule/types/index.ts',
      'packages/features/project-hub/src/schedule/constants/index.ts',
    ],
    canReportsConsumeToday: 'partial',
    gapOrBlocker: 'Publication contracts exist, but there is no central snapshot adapter or report assembly consumer.',
    recommendedBaselineUsage: 'Core PX Review and Owner Report milestone / forecast input.',
  },
  {
    module: 'P3-E6 Constraints',
    governingPlanFiles: ['P3-E6', 'P3-E6-T06', 'P3-E6-T07', 'P3-E6-T08'],
    currentImplementationStatus: 'Contract-level implementation live in @hbc/features-project-hub',
    reportSupportContract: 'Published snapshots and review packages support downstream review-package and summary use.',
    actualImplementationSeams: [
      'packages/features/project-hub/src/constraints/publication/*',
      'packages/features/project-hub/src/constraints/integration/constants.ts',
    ],
    canReportsConsumeToday: 'partial',
    gapOrBlocker: 'Current report/export language is module-local; there is no central Reports adapter.',
    recommendedBaselineUsage: 'Use as summarized constraints / risk posture inside PX Review and Owner Report.',
  },
  {
    module: 'P3-E7 Permits',
    governingPlanFiles: ['P3-E7', 'P3-E7-T05', 'P3-E7-T06', 'P3-E7-T08'],
    currentImplementationStatus: 'Contract-level implementation live in @hbc/features-project-hub',
    reportSupportContract: 'Publishes downstream surfaces and local report/export configurations.',
    actualImplementationSeams: [
      'packages/features/project-hub/src/permits/workflow/*',
      'packages/features/project-hub/src/permits/views/constants.ts',
    ],
    canReportsConsumeToday: 'no',
    gapOrBlocker: 'Existing report definitions are permit-local configs, not normalized central Reports inputs.',
    recommendedBaselineUsage: 'Optional permit posture summary inside PX Review after a normalized adapter exists.',
  },
  {
    module: 'P3-E8 Safety',
    governingPlanFiles: ['P3-E8', 'P3-E8-T09'],
    currentImplementationStatus: 'Contract-level implementation live in @hbc/features-project-hub',
    reportSupportContract: 'Composite scorecard, PER projection, publication contracts, and local report definitions.',
    actualImplementationSeams: [
      'packages/features/project-hub/src/safety/publication/*',
      'packages/features/project-hub/src/safety/index.ts',
    ],
    canReportsConsumeToday: 'partial',
    gapOrBlocker: 'Current seven report definitions are module-local safety outputs, not P3-E9-ready snapshots.',
    recommendedBaselineUsage: 'Safety posture and composite summary input for PX Review and Owner Report.',
  },
  {
    module: 'P3-E9 Reports',
    governingPlanFiles: ['P3-E9', 'P3-F1'],
    currentImplementationStatus: 'No dedicated runtime package or workspace exists',
    reportSupportContract: 'Owns registry, draft model, run-ledger, generation, release, and spine publication.',
    actualImplementationSeams: [
      'No packages/features/reports package',
      'No PWA /reports workspace',
      'Baseline catalog seam only in Project Hub',
    ],
    canReportsConsumeToday: 'no',
    gapOrBlocker: 'The central Reports module itself has not been implemented.',
    recommendedBaselineUsage: 'Must be built before any governed report family can run end to end.',
  },
  {
    module: 'P3-E10 Closeout',
    governingPlanFiles: ['P3-E10', 'P3-E10-T05', 'P3-E10-T06', 'P3-E10-T08', 'P3-E10-T11'],
    currentImplementationStatus: 'Contract-level implementation live in @hbc/features-project-hub',
    reportSupportContract: 'Explicit snapshot ingestion contract for sub-scorecard and lessons-learned.',
    actualImplementationSeams: [
      'packages/features/project-hub/src/closeout/consumption/constants.ts',
      'packages/features/project-hub/src/closeout/consumption/business-rules.ts',
      'packages/features/project-hub/src/closeout/lessons/*',
      'packages/features/project-hub/src/closeout/scorecard/*',
    ],
    canReportsConsumeToday: 'partial',
    gapOrBlocker: 'Source snapshot contracts are strong, but no central Reports service consumes them yet.',
    recommendedBaselineUsage: 'Direct source for Sub-scorecard and Lessons-learned baseline artifacts.',
  },
  {
    module: 'P3-E11 Startup',
    governingPlanFiles: ['P3-E11', 'P3-E11-T08', 'P3-E11-T10'],
    currentImplementationStatus: 'Contract-level implementation live in @hbc/features-project-hub',
    reportSupportContract: 'Explicitly outside Reports source scope for Phase 3.',
    actualImplementationSeams: [
      'packages/features/project-hub/src/startup/baseline-lock/*',
    ],
    canReportsConsumeToday: 'no',
    gapOrBlocker: 'Boundary is intentional: Startup is not a Phase 3 Reports source.',
    recommendedBaselineUsage: 'Exclude from baseline central Reports.',
  },
  {
    module: 'P3-E12 Subcontract Compliance',
    governingPlanFiles: ['P3-E12 (historical)', 'P3-E13 (superseding family)'],
    currentImplementationStatus: 'Historical plan only; no active implementation',
    reportSupportContract: 'Historical checklist-and-waiver model only.',
    actualImplementationSeams: [
      'No active @hbc/features-project-hub implementation',
    ],
    canReportsConsumeToday: 'no',
    gapOrBlocker: 'Superseded by P3-E13 and should not drive baseline reporting work.',
    recommendedBaselineUsage: 'Exclude entirely.',
  },
  {
    module: 'P3-E13 Subcontract Execution Readiness',
    governingPlanFiles: ['P3-E13', 'P3-E13-T05', 'P3-E13-T07', 'P3-E13-T08'],
    currentImplementationStatus: 'Contract-level implementation live in @hbc/features-project-hub',
    reportSupportContract: 'Downstream Health / Work Queue / Reports publications are projections, not primary ledgers.',
    actualImplementationSeams: [
      'packages/features/project-hub/src/subcontract-readiness/workflow-publication/*',
      'packages/features/project-hub/src/subcontract-readiness/cross-module-contracts/*',
    ],
    canReportsConsumeToday: 'partial',
    gapOrBlocker: 'No concrete central Reports snapshot or artifact contract exists yet.',
    recommendedBaselineUsage: 'Possible later summary section; not its own baseline report family.',
  },
  {
    module: 'P3-E14 Warranty',
    governingPlanFiles: ['P3-E14', 'P3-E14-T09', 'P3-E14-T10'],
    currentImplementationStatus: 'Contract-level implementation live in @hbc/features-project-hub',
    reportSupportContract: 'Reports / health / work-queue publication and eight report designation keys.',
    actualImplementationSeams: [
      'packages/features/project-hub/src/warranty/reports-publication/*',
    ],
    canReportsConsumeToday: 'partial',
    gapOrBlocker: 'Current report designations are warranty-local analytic outputs, not central Reports families.',
    recommendedBaselineUsage: 'Do not make Warranty its own baseline central Reports family.',
  },
  {
    module: 'P3-E15 QC',
    governingPlanFiles: ['P3-E15', 'P3-E15-T05', 'P3-E15-T08', 'P3-E15-T09', 'P3-E15-T10'],
    currentImplementationStatus: 'Foundation-only implementation live in @hbc/features-project-hub',
    reportSupportContract: 'QC publishes health snapshots, responsible-org rollups, readiness signals, and report drillback patterns.',
    actualImplementationSeams: [
      'packages/features/project-hub/src/qc/foundation/constants.ts',
      'packages/features/project-hub/src/qc/foundation/types.ts',
      'packages/features/project-hub/src/qc/foundation/enums.ts',
    ],
    canReportsConsumeToday: 'no',
    gapOrBlocker: 'No published snapshot/rollup adapter or Project Hub QC runtime surface exists yet.',
    recommendedBaselineUsage: 'Exclude from baseline until the QC snapshot seam exists.',
  },
] as const;

export function getProjectHubReportsSummary(): IProjectHubReportsSummary {
  return {
    baselineFamilyCount: PROJECT_HUB_BASELINE_REPORT_FAMILIES.length,
    sourceModulesAudited: PROJECT_HUB_REPORT_MODULE_AUDIT.length,
    partialSourceCount: PROJECT_HUB_REPORT_MODULE_AUDIT.filter(
      (row) => row.canReportsConsumeToday === 'partial',
    ).length,
    blockedSourceCount: PROJECT_HUB_REPORT_MODULE_AUDIT.filter(
      (row) => row.canReportsConsumeToday === 'no',
    ).length,
    moduleLocalReportSurfaceCount: SAFETY_REPORTS.length + WARRANTY_REPORT_DESIGNATION_DEFINITIONS.length,
    closeoutArtifactFamilyCount: CLOSEOUT_REPORT_ARTIFACT_FAMILIES.length,
    qcFoundationRecordFamilyCount: QC_RECORD_FAMILIES.length,
  };
}
