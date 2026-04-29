import { Fragment, type FC } from 'react';
import { PCC_MVP_SURFACES } from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import styles from './PccControlCenterSettingsSurface.module.css';

const SURFACE = PCC_MVP_SURFACES['control-center-settings'];

const SETTINGS_SCOPE_PREVIEW = [
  { label: 'Project scope', value: 'PCC Project Profile (fixture)' },
  { label: 'Site scope', value: 'Project Site baseline labels (preview)' },
  { label: 'Persona scope', value: 'Role template selector preview' },
  { label: 'Integration scope', value: 'External mapping visibility only' },
] as const;

const MISSING_CONFIG_PREVIEW = [
  'Template-to-role mapping review pending',
  'Integration endpoint ownership confirmation pending',
  'Deployment readiness checklist not executed (Wave 2)',
] as const;

export const PccControlCenterSettingsSurface: FC = () => (
  <Fragment>
    <PccDashboardCard
      footprint="full"
      eyebrow={SURFACE.displayName}
      title="Control Center Settings Preview"
      dataActiveSurfacePanel="control-center-settings"
    >
      <div className={styles.body}>
        <p>{SURFACE.description}</p>
        <p className={styles.previewCue}>
          Preview-only settings visibility. No save, update, tenant mutation, or backend/API execution.
        </p>
      </div>
    </PccDashboardCard>

    <PccDashboardCard footprint="full" eyebrow="Settings Lanes" title="Project / Site / Persona / Integration Scope">
      <div className={styles.scopeGrid}>
        {SETTINGS_SCOPE_PREVIEW.map((item) => (
          <section key={item.label} className={styles.scopeCell}>
            <span className={styles.scopeLabel}>{item.label}</span>
            <span className={styles.scopeValue}>{item.value}</span>
          </section>
        ))}
      </div>
    </PccDashboardCard>

    <PccDashboardCard footprint="wide" eyebrow="Missing Configuration" title="Preview Backlog Items">
      <ul className={styles.missingList}>
        {MISSING_CONFIG_PREVIEW.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </PccDashboardCard>
  </Fragment>
);

export default PccControlCenterSettingsSurface;
