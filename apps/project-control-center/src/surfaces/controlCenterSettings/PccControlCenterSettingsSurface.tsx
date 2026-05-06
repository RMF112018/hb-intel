import { Fragment, type FC } from 'react';
import { PCC_MVP_SURFACES } from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState } from '../../ui/PccPreviewState';
import styles from './PccControlCenterSettingsSurface.module.css';

const SURFACE = PCC_MVP_SURFACES['control-center-settings'];

const SETTINGS_SCOPE_PREVIEW = [
  { id: 'project', label: 'Project scope', value: 'Project profile' },
  { id: 'site', label: 'Site scope', value: 'Project site baseline labels' },
  { id: 'persona', label: 'Persona scope', value: 'Role template selector' },
  { id: 'integration', label: 'Integration scope', value: 'External mapping visibility only' },
] as const;

const MISSING_CONFIG_ITEMS = [
  'Template-to-role mapping review pending',
  'Integration endpoint ownership confirmation pending',
  'Deployment readiness checklist not yet completed',
] as const;

export const PccControlCenterSettingsSurface: FC = () => (
  <Fragment>
    <PccDashboardCard
      footprint="full"
      hierarchy="primary"
      eyebrow={SURFACE.displayName}
      title="Control Center Settings"
      dataActiveSurfacePanel="control-center-settings"
    >
      <div className={styles.body}>
        <PccPreviewState
          state="preview"
          title="Settings overview"
          description="Saving, updating, and tenant changes are managed by your PCC administrator."
        />
      </div>
    </PccDashboardCard>

    <PccDashboardCard
      footprint="full"
      eyebrow="Settings Lanes"
      title="Project / Site / Persona / Integration Scope"
    >
      <div className={styles.scopeGrid} data-pcc-settings-scope-grid="">
        {SETTINGS_SCOPE_PREVIEW.map((item) => (
          <section
            key={item.id}
            className={styles.scopeCell}
            data-pcc-settings-scope-id={item.id}
            data-pcc-settings-scope-state="preview"
          >
            <span className={styles.scopeLabel}>{item.label}</span>
            <span className={styles.scopeValue}>{item.value}</span>
          </section>
        ))}
      </div>
    </PccDashboardCard>

    <PccDashboardCard footprint="wide" eyebrow="Configuration" title="Items needing setup">
      <div className={styles.body}>
        <PccPreviewState state="missing-config" />
        <ul className={styles.missingList}>
          {MISSING_CONFIG_ITEMS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </PccDashboardCard>
  </Fragment>
);

export default PccControlCenterSettingsSurface;
