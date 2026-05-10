import { Fragment, type FC } from 'react';
import {
  PCC_MODULE_STATE_COPY,
  getModule,
  getModulesForPrimaryTab,
  getPrimaryNavigationTab,
  type PccModuleId,
  type PccNavigationModule,
  type PccPrimaryTabId,
} from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import styles from './PccPrimaryDashboardSurface.module.css';

export interface PccPrimaryDashboardSurfaceProps {
  activePrimaryTabId: PccPrimaryTabId;
  activeModuleId?: PccModuleId;
}

const NO_WRITEBACK_POSTURE =
  'Read-only project dashboard. PCC does not write back to source systems from this view.';

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

export const PccPrimaryDashboardSurface: FC<PccPrimaryDashboardSurfaceProps> = ({
  activePrimaryTabId,
  activeModuleId,
}) => {
  const tab = getPrimaryNavigationTab(activePrimaryTabId);
  const modules = getModulesForPrimaryTab(activePrimaryTabId);
  const contextModule = resolveContextModule(activePrimaryTabId, activeModuleId);
  const postureNote = PRIMARY_TAB_POSTURE_NOTE[activePrimaryTabId];

  return (
    <Fragment>
      <PccDashboardCard
        footprint="hero"
        hierarchy="primary"
        tier="tier1"
        region="command"
        eyebrow="Dashboard"
        title={tab.dashboardTitle}
      >
        <p className={styles.overviewBody}>{tab.dashboardDescription}</p>
        <p className={styles.overviewPosture}>{NO_WRITEBACK_POSTURE}</p>
        {postureNote ? (
          <p
            className={styles.overviewBookOfRecord}
            data-pcc-dashboard-book-of-record={activePrimaryTabId}
          >
            {postureNote}
          </p>
        ) : null}
      </PccDashboardCard>

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
      </PccDashboardCard>

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
