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
            <div key={module.id} className={styles.moduleStatusRow}>
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
      </PccDashboardCard>
    </Fragment>
  );
};

export default PccPrimaryDashboardSurface;
