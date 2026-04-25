import { HbcButton } from '@hbc/ui-kit/homepage';
import type { FoleonReaderModuleConfig } from './readerConfigs.js';
import styles from './FoleonReaderModule.module.css';

interface FoleonReaderPreviewProps {
  readonly config: FoleonReaderModuleConfig;
  readonly tone: 'spotlight' | 'pulse';
  readonly onOpenArchive: () => void;
}

export function FoleonReaderPreview(props: FoleonReaderPreviewProps): React.ReactNode {
  const isSpotlight = props.tone === 'spotlight';
  return (
    <section
      className={`${styles.shell} ${isSpotlight ? styles.spotlight : styles.pulse}`}
      aria-labelledby={`${props.config.readerKey}-preview-title`}
      data-foleon-preview-route={props.config.readerKey}
    >
      <div className={styles.chrome}>
        <header className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>Preview reader layout</p>
            <h2 className={styles.title} id={`${props.config.readerKey}-preview-title`}>
              {isSpotlight ? 'Project Spotlight reader' : 'Company Pulse reader'}
            </h2>
            <p className={styles.summary}>
              {isSpotlight
                ? 'A monthly, immersive project profile will appear here after a governed active edition is published.'
                : 'A compact operational reader will appear here after the active Company Pulse edition is published.'}
            </p>
            <div className={styles.actions}>
              <HbcButton variant="secondary" onClick={props.onOpenArchive}>
                Open full archive
              </HbcButton>
              <span className={styles.archiveNote}>Lane archive filtering comes in a later workflow.</span>
            </div>
          </div>
          <aside className={styles.rail} aria-label="Preview reader metadata">
            <div>
              <p className={styles.railLabel}>Lane</p>
              <p className={styles.railValue}>{props.config.title}</p>
            </div>
            <div>
              <p className={styles.railLabel}>{isSpotlight ? 'Cadence' : 'Update rhythm'}</p>
              <p className={styles.railValue}>{isSpotlight ? 'Monthly' : 'Latest update'}</p>
            </div>
            <div>
              <p className={styles.railLabel}>Reader status</p>
              <p className={styles.railValue}>Awaiting active edition</p>
            </div>
          </aside>
        </header>
        <div className={styles.mobileCard} aria-label="Preview collapsed reader card">
          <p className={styles.railLabel}>Mobile preview</p>
          <p className={styles.railValue}>Reader opens only after a real publication is selected.</p>
        </div>
      </div>
    </section>
  );
}
