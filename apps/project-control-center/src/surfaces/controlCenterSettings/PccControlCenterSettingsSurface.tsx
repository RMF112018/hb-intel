import { Fragment, type FC } from 'react';
import { PCC_MVP_SURFACES } from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState } from '../../ui/PccPreviewState';
import { PccSurfaceContextHeader } from '../shared/PccSurfaceContextHeader';
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
        <PccSurfaceContextHeader
          surfaceId="control-center-settings"
          projectLabel="Project 26-000-00 · Governance Configuration"
          postureLabel="Read-only preview"
          sourceStatusLabel="Fixture default"
          sourceConfidenceLabel="Preview confidence"
          lastUpdatedLabel="Not connected in this prompt"
        />
        <PccPreviewState
          state="preview"
          title="Preview-only settings visibility"
          description="No save, update, tenant mutation, or backend/API execution is enabled."
        />
      </div>
    </PccDashboardCard>

    <PccDashboardCard
      footprint="full"
      eyebrow="Settings Lanes"
      title="Project / Site / Persona / Integration Scope"
    >
      <div className={styles.scopeGrid}>
        {SETTINGS_SCOPE_PREVIEW.map((item) => (
          <section key={item.label} className={styles.scopeCell}>
            <span className={styles.scopeLabel}>{item.label}</span>
            <span className={styles.scopeValue}>{item.value}</span>
          </section>
        ))}
      </div>
    </PccDashboardCard>

    <PccDashboardCard
      footprint="wide"
      eyebrow="Missing Configuration"
      title="Preview Backlog Items"
    >
      <div className={styles.body}>
        <PccPreviewState state="missing-config" />
        <ul className={styles.missingList}>
          {MISSING_CONFIG_PREVIEW.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </PccDashboardCard>
  </Fragment>
);

export default PccControlCenterSettingsSurface;
