import { Fragment, type FC, type ReactElement } from 'react';
import {
  PCC_MODULE_STATE_COPY,
  getModule,
  getModulesForPrimaryTab,
  type PccModuleId,
  type PccNavigationModule,
  type PccPrimaryTabId,
} from '@hbc/models/pcc';
import { PccAnalyticsCard } from '../../analytics';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import {
  ESTIMATING_PRECONSTRUCTION_ANALYTICS_SPAN_OVERRIDES,
  ESTIMATING_PRECONSTRUCTION_ANALYTICS_VIEW_MODELS,
} from './estimatingPreconstructionAnalytics';
import {
  COST_TIME_ANALYTICS_SPAN_OVERRIDES,
  COST_TIME_ANALYTICS_VIEW_MODELS,
} from './costTimeAnalytics';
import {
  PROJECT_CONTROLS_ANALYTICS_SPAN_OVERRIDES,
  PROJECT_CONTROLS_ANALYTICS_VIEW_MODELS,
} from './projectControlsAnalytics';
import {
  SYSTEMS_ADMINISTRATION_ANALYTICS_SPAN_OVERRIDES,
  SYSTEMS_ADMINISTRATION_ANALYTICS_VIEW_MODELS,
} from './systemsAdministrationAnalytics';
import {
  STARTUP_CLOSEOUT_ANALYTICS_SPAN_OVERRIDES,
  STARTUP_CLOSEOUT_ANALYTICS_VIEW_MODELS,
} from './startupCloseoutAnalytics';
import styles from './PccPrimaryDashboardSurface.module.css';

export interface PccPrimaryDashboardSurfaceProps {
  activePrimaryTabId: PccPrimaryTabId;
  activeModuleId?: PccModuleId;
}

const SELECT_MODULE_HINT = 'Open the menu on this tab to review a project module in context.';

// Phase 05 wave-b10 Prompt 05 — per-primary-tab governance / book-of-record
// posture line. Currently only `cost-time` carries an additional
// posture cue (Sage book-of-record) per the Prompt 05 financial-copy
// requirement. Adding more entries is a copy-only change.
const PRIMARY_TAB_POSTURE_NOTE: Partial<Record<PccPrimaryTabId, string>> = {
  'cost-time':
    'Sage remains the accounting book of record for cost, commitment, and exposure data; PCC does not write back to Sage.',
};

function resolveContextModule(
  activePrimaryTabId: PccPrimaryTabId,
  activeModuleId: PccModuleId | undefined,
): PccNavigationModule | undefined {
  if (!activeModuleId) {
    return undefined;
  }
  const mod = getModule(activeModuleId);
  return mod.parentTabId === activePrimaryTabId ? mod : undefined;
}

/**
 * Phase 06 Prompts 07 + 08 + 09 + 10 + 11 — preview analytics insertion
 * for the shared primary dashboard surface. Routes:
 *   - `estimating-preconstruction` → 2 Estimating cards (Prompt 07);
 *   - `startup-closeout` → 3 Startup & Closeout cards (Prompt 08);
 *   - `project-controls` → 3 Project Controls cards (Prompt 09);
 *   - `cost-time` → 3 Cost & Time cards (Prompt 10);
 *   - `systems-administration` → 3 Systems Administration cards (Prompt 11);
 *   - all other primary tabs → null.
 *
 * Renders between `Module status` and the selected-module card so analytics
 * cards remain direct children of the bento grid via `PccDashboardCard`
 * inside `PccAnalyticsCard`.
 *
 * TODO(post-mvp): Replace the current primary-tab-only analytics routing
 * with read-model-backed stage/lifecycle/role emphasis once the route/module
 * model exposes project stage, lifecycle phase, source authority, and persona
 * context. Work-center analytics should remain deterministic projections over
 * source-backed envelopes and must not imply command execution, approval
 * execution, source-system mutation, or autonomous decisioning.
 */
function renderPrimaryDashboardAnalytics(activePrimaryTabId: PccPrimaryTabId): ReactElement | null {
  if (activePrimaryTabId === 'estimating-preconstruction') {
    return (
      <>
        <PccAnalyticsCard
          viewModel={ESTIMATING_PRECONSTRUCTION_ANALYTICS_VIEW_MODELS.handoffContinuityPreview}
          footprint="standard"
          tier="tier2"
          region="operational"
          spanOverrides={
            ESTIMATING_PRECONSTRUCTION_ANALYTICS_SPAN_OVERRIDES.handoffContinuityPreview
          }
        />
        <PccAnalyticsCard
          viewModel={ESTIMATING_PRECONSTRUCTION_ANALYTICS_VIEW_MODELS.estimateExposurePreview}
          footprint="standard"
          tier="tier2"
          region="operational"
          spanOverrides={
            ESTIMATING_PRECONSTRUCTION_ANALYTICS_SPAN_OVERRIDES.estimateExposurePreview
          }
        />
      </>
    );
  }

  if (activePrimaryTabId === 'startup-closeout') {
    return (
      <>
        <PccAnalyticsCard
          viewModel={STARTUP_CLOSEOUT_ANALYTICS_VIEW_MODELS.startupReadinessCompletion}
          footprint="standard"
          tier="tier2"
          region="operational"
          spanOverrides={STARTUP_CLOSEOUT_ANALYTICS_SPAN_OVERRIDES.startupReadinessCompletion}
        />
        <PccAnalyticsCard
          viewModel={STARTUP_CLOSEOUT_ANALYTICS_VIEW_MODELS.responsibilityCoverage}
          footprint="standard"
          tier="tier2"
          region="operational"
          spanOverrides={STARTUP_CLOSEOUT_ANALYTICS_SPAN_OVERRIDES.responsibilityCoverage}
        />
        <PccAnalyticsCard
          viewModel={STARTUP_CLOSEOUT_ANALYTICS_VIEW_MODELS.closeoutWarrantyReadiness}
          footprint="standard"
          tier="tier2"
          region="operational"
          spanOverrides={STARTUP_CLOSEOUT_ANALYTICS_SPAN_OVERRIDES.closeoutWarrantyReadiness}
        />
      </>
    );
  }

  if (activePrimaryTabId === 'project-controls') {
    return (
      <>
        <PccAnalyticsCard
          viewModel={PROJECT_CONTROLS_ANALYTICS_VIEW_MODELS.constraintsAging}
          footprint="standard"
          tier="tier2"
          region="operational"
          spanOverrides={PROJECT_CONTROLS_ANALYTICS_SPAN_OVERRIDES.constraintsAging}
        />
        <PccAnalyticsCard
          viewModel={PROJECT_CONTROLS_ANALYTICS_VIEW_MODELS.permitInspectionReadiness}
          footprint="standard"
          tier="tier2"
          region="operational"
          spanOverrides={PROJECT_CONTROLS_ANALYTICS_SPAN_OVERRIDES.permitInspectionReadiness}
        />
        <PccAnalyticsCard
          viewModel={PROJECT_CONTROLS_ANALYTICS_VIEW_MODELS.riskIssueSeverityDistribution}
          footprint="standard"
          tier="tier2"
          region="operational"
          spanOverrides={PROJECT_CONTROLS_ANALYTICS_SPAN_OVERRIDES.riskIssueSeverityDistribution}
        />
      </>
    );
  }

  if (activePrimaryTabId === 'cost-time') {
    return (
      <>
        <PccAnalyticsCard
          viewModel={COST_TIME_ANALYTICS_VIEW_MODELS.scheduleMilestonePosture}
          footprint="standard"
          tier="tier2"
          region="operational"
          spanOverrides={COST_TIME_ANALYTICS_SPAN_OVERRIDES.scheduleMilestonePosture}
        />
        <PccAnalyticsCard
          viewModel={COST_TIME_ANALYTICS_VIEW_MODELS.procurementBuyoutExposure}
          footprint="standard"
          tier="tier2"
          region="operational"
          spanOverrides={COST_TIME_ANALYTICS_SPAN_OVERRIDES.procurementBuyoutExposure}
        />
        <PccAnalyticsCard
          viewModel={COST_TIME_ANALYTICS_VIEW_MODELS.commitmentCostExposurePreview}
          footprint="standard"
          tier="tier2"
          region="operational"
          spanOverrides={COST_TIME_ANALYTICS_SPAN_OVERRIDES.commitmentCostExposurePreview}
        />
      </>
    );
  }

  if (activePrimaryTabId === 'systems-administration') {
    return (
      <>
        <PccAnalyticsCard
          viewModel={SYSTEMS_ADMINISTRATION_ANALYTICS_VIEW_MODELS.integrationHealthSummary}
          footprint="standard"
          tier="tier2"
          region="operational"
          spanOverrides={SYSTEMS_ADMINISTRATION_ANALYTICS_SPAN_OVERRIDES.integrationHealthSummary}
        />
        <PccAnalyticsCard
          viewModel={SYSTEMS_ADMINISTRATION_ANALYTICS_VIEW_MODELS.configurationSeverity}
          footprint="standard"
          tier="tier2"
          region="operational"
          spanOverrides={SYSTEMS_ADMINISTRATION_ANALYTICS_SPAN_OVERRIDES.configurationSeverity}
        />
        <PccAnalyticsCard
          viewModel={SYSTEMS_ADMINISTRATION_ANALYTICS_VIEW_MODELS.procoreMappingSyncPosture}
          footprint="standard"
          tier="tier2"
          region="operational"
          spanOverrides={SYSTEMS_ADMINISTRATION_ANALYTICS_SPAN_OVERRIDES.procoreMappingSyncPosture}
        />
      </>
    );
  }

  return null;
}

export const PccPrimaryDashboardSurface: FC<PccPrimaryDashboardSurfaceProps> = ({
  activePrimaryTabId,
  activeModuleId,
}) => {
  const modules = getModulesForPrimaryTab(activePrimaryTabId);
  const contextModule = resolveContextModule(activePrimaryTabId, activeModuleId);
  const postureNote = PRIMARY_TAB_POSTURE_NOTE[activePrimaryTabId];

  return (
    <Fragment>
      <PccDashboardCard
        footprint="wide"
        hierarchy="standard"
        tier="tier2"
        region="operational"
        eyebrow="Modules"
        title="Module status"
      >
        <dl className={styles.moduleStatusList}>
          {modules.map((module) => (
            <div
              key={module.id}
              className={styles.moduleStatusRow}
              data-pcc-dashboard-module-row={module.id}
              data-pcc-dashboard-module-selectable={module.selectable ? 'true' : 'false'}
              data-pcc-dashboard-module-state={module.state}
            >
              <dt className={styles.moduleStatusLabel}>{module.label}</dt>
              <dd className={styles.moduleStatusValue}>
                <span
                  className={styles.moduleStatusChip}
                  data-pcc-dashboard-module-state={module.state}
                >
                  {module.stateLabel}
                </span>
                <span className={styles.moduleStatusSummary}>{module.summary}</span>
              </dd>
            </div>
          ))}
        </dl>
        {postureNote ? (
          <p
            className={styles.overviewBookOfRecord}
            data-pcc-dashboard-book-of-record={activePrimaryTabId}
          >
            {postureNote}
          </p>
        ) : null}
      </PccDashboardCard>

      {renderPrimaryDashboardAnalytics(activePrimaryTabId)}

      <PccDashboardCard
        footprint="standard"
        hierarchy="supporting"
        tier="tier3"
        region="reference"
        eyebrow="Selected module"
        title={contextModule ? contextModule.label : 'Select a module'}
      >
        <div
          className={styles.selectedModuleBody}
          data-pcc-selected-module-card=""
          data-pcc-selected-module-id={contextModule?.id ?? ''}
          data-pcc-selected-module-state={contextModule?.state ?? ''}
          data-pcc-selected-module-parent-tab={contextModule?.parentTabId ?? ''}
          data-pcc-selected-module-empty={contextModule ? undefined : 'true'}
        >
          {contextModule ? (
            <div className={styles.activeModuleBody}>
              <p className={styles.activeModuleStateLine}>
                <span
                  className={styles.moduleStatusChip}
                  data-pcc-dashboard-module-state={contextModule.state}
                >
                  {contextModule.stateLabel}
                </span>
              </p>
              <p className={styles.activeModuleSummary}>{contextModule.summary}</p>
              <p className={styles.activeModuleAuthority}>{contextModule.authorityCue}</p>
              {!contextModule.selectable && contextModule.disabledReason ? (
                <p className={styles.activeModuleDisabledReason}>{contextModule.disabledReason}</p>
              ) : null}
              <p className={styles.activeModuleStatePosture}>
                {PCC_MODULE_STATE_COPY[contextModule.state].reason}
              </p>
            </div>
          ) : (
            <p className={styles.activeModuleEmptyHint}>{SELECT_MODULE_HINT}</p>
          )}
        </div>
      </PccDashboardCard>
    </Fragment>
  );
};

export default PccPrimaryDashboardSurface;
