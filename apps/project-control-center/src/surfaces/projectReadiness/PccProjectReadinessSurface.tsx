import { Fragment, type FC } from 'react';
import { PCC_MVP_SURFACES } from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState } from '../../ui/PccPreviewState';
import styles from './PccProjectReadinessSurface.module.css';

const SURFACE = PCC_MVP_SURFACES['project-readiness'];

const READINESS_PREVIEW = [
  {
    label: 'People & Access',
    score: '82%',
    detail: 'Team baseline mapped; execution remains manual/IT-handled in Wave 2.',
  },
  {
    label: 'Documents & Information',
    score: '76%',
    detail: 'Document lanes previewed; no live Graph/PnP/API file execution.',
  },
  {
    label: 'Processes & Workflows',
    score: '69%',
    detail: 'Approval/readiness checkpoints shown as fixture-only preview state.',
  },
  {
    label: 'Systems & Integrations',
    score: '71%',
    detail: 'Configuration/mapping visibility only; no external runtime mutation path.',
  },
];

export const PccProjectReadinessSurface: FC = () => (
  <Fragment>
    <PccDashboardCard
      footprint="full"
      eyebrow={SURFACE.displayName}
      title="Project Readiness Preview"
      dataActiveSurfacePanel="project-readiness"
    >
      <div className={styles.body}>
        <p>{SURFACE.description}</p>
        <PccPreviewState
          state="preview"
          title="Preview-only readiness rollup"
          description="No backend rollup calls, workflow execution, or persistence are enabled."
        />
      </div>
    </PccDashboardCard>

    <PccDashboardCard footprint="full" eyebrow="Readiness" title="Category Readiness Snapshot">
      {READINESS_PREVIEW.length === 0 ? (
        <PccPreviewState state="unavailable-fixture" />
      ) : (
        <div className={styles.categoryGrid}>
          {READINESS_PREVIEW.map((item) => (
            <section key={item.label} className={styles.categoryCell}>
              <span className={styles.categoryLabel}>{item.label}</span>
              <span className={styles.categoryValue}>{item.score}</span>
              <span className={styles.categoryDetail}>{item.detail}</span>
            </section>
          ))}
        </div>
      )}
    </PccDashboardCard>
  </Fragment>
);

export default PccProjectReadinessSurface;
