import type { FC } from 'react';
import { PCC_MVP_SURFACES, PCC_MVP_SURFACE_IDS } from '@hbc/models/pcc';
import styles from './styles/PccApp.module.css';

export const PccApp: FC = () => {
  const surfaces = PCC_MVP_SURFACE_IDS.map((id) => PCC_MVP_SURFACES[id]);

  return (
    <div className={styles.shell} data-pcc-shell="wave-2-scaffold">
      <header className={styles.header}>
        <div>
          <p className={styles.headerTitle}>Project Control Center</p>
          <p className={styles.headerSubtitle}>Wave 2 scaffold · preview frame</p>
        </div>
      </header>
      <div className={styles.body}>
        <div className={styles.accentRail} aria-hidden="true" />
        <main className={styles.content}>
          <p className={styles.previewBanner}>
            <strong>Preview only.</strong> Fixture-driven shell. No live integrations,
            no tenant data, no Graph/PnP, no Procore runtime.
          </p>
          <div>
            <p className={styles.sectionTitle}>MVP Surfaces</p>
            <ul className={styles.surfaceList} data-pcc-surface-list="">
              {surfaces.map((surface) => (
                <li
                  key={surface.id}
                  className={styles.surfaceItem}
                  data-pcc-surface-id={surface.id}
                >
                  <span className={styles.surfaceName}>{surface.displayName}</span>
                  <span className={styles.surfaceDescription}>{surface.description}</span>
                </li>
              ))}
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PccApp;
