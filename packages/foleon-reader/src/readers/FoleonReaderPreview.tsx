import type { FoleonReaderModuleConfig } from './readerConfigs.js';
import styles from './FoleonReaderModule.module.css';

interface FoleonReaderPreviewProps {
  readonly config: FoleonReaderModuleConfig;
  readonly tone: 'spotlight' | 'pulse';
}

export function FoleonReaderPreview(props: FoleonReaderPreviewProps): React.ReactNode {
  const isSpotlight = props.tone === 'spotlight';
  const supportCards = isSpotlight
    ? [
        ['Project context', 'Sample project metadata, team framing, and market context will appear here.'],
        ['Edition status', 'Monthly active-edition governance keeps one spotlight current at a time.'],
        ['Archive posture', 'Archive filtering will appear when live lane archive behavior is connected.'],
      ]
    : [
        ['Company updates', 'News, events, recognition, and operational updates will collect here.'],
        ['Latest edition', 'The newest active Company Pulse edition will carry the latest update label.'],
        ['Archive posture', 'Archive filtering will appear when live lane archive behavior is connected.'],
      ];

  return (
    <section
      className={`${styles.readerPreviewFallback} ${isSpotlight ? styles.readerPreviewSpotlight : styles.readerPreviewPulse}`}
      aria-labelledby={`${props.config.readerKey}-preview-title`}
      data-foleon-preview-route={props.config.readerKey}
      data-preview-tone={isSpotlight ? 'blue' : 'orange'}
    >
      <header className={styles.previewBanner}>
        <div>
          <p className={styles.previewEyebrow}>Preview layout</p>
          <h2 className={styles.previewTitle} id={`${props.config.readerKey}-preview-title`}>
            {isSpotlight ? 'Project Spotlight reader' : 'Company Pulse reader'}
          </h2>
          <p className={styles.previewDescription}>
            {isSpotlight
              ? 'This sample structure previews the monthly active project profile lane before a governed Project Spotlight edition is published.'
              : 'This sample structure previews the frequent company update lane for news, events, recognition, and operations before an active Company Pulse edition is published.'}
          </p>
        </div>
        <div className={styles.previewStatusRail} aria-label="Preview status">
          <span className={styles.previewStatusPill}>Content coming soon</span>
          <span className={styles.previewStatusPill}>
            {isSpotlight ? 'Monthly project profile' : 'Latest company update'}
          </span>
        </div>
      </header>

      <div className={styles.previewLayout}>
        <article className={styles.previewFeature} aria-label={`${props.config.title} feature placeholder`}>
          <div className={styles.previewMediaPlaceholder} aria-hidden="true" />
          <div className={styles.previewContentZone}>
            <div className={styles.previewMetaRow} aria-label="Preview metadata">
              <span className={styles.previewMetaPill}>{props.config.title}</span>
              <span className={styles.previewMetaPill}>{isSpotlight ? 'Monthly' : 'Frequent'}</span>
              <span className={styles.previewMetaPill}>Active edition pending</span>
            </div>
            <h3 className={styles.previewFeatureTitle}>
              {isSpotlight ? 'Featured project profile placeholder' : 'Company update edition placeholder'}
            </h3>
            <p className={styles.previewFeatureCopy}>
              {isSpotlight
                ? 'A polished project story area will introduce the active edition, project context, and editorial framing once live Foleon content is connected.'
                : 'A compact publication area will summarize the active edition, latest update cadence, and operational context once live Foleon content is connected.'}
            </p>
            <div className={styles.previewMetadataGrid} aria-label="Preview metadata zones">
              <span>Reader appears when an active edition is published</span>
              <span>{isSpotlight ? 'Archive group required for governance' : 'Last editorial update required for freshness'}</span>
              <span>Preview contains no live reader controls</span>
            </div>
          </div>
        </article>

        <aside className={styles.previewSupport} aria-label={`${props.config.title} supporting preview placeholders`}>
          {supportCards.map(([title, copy]) => (
            <div className={styles.previewSupportCard} key={title}>
              <div className={styles.previewSupportStripe} aria-hidden="true" />
              <h3>{title}</h3>
              <p>{copy}</p>
            </div>
          ))}
        </aside>
      </div>

      <footer className={styles.previewFooterNote}>
        <span>Archive filtering will appear when live content is connected.</span>
        <span>No Foleon iframe or production content telemetry is emitted for this preview.</span>
      </footer>
    </section>
  );
}
