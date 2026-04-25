import type { FoleonReaderModuleConfig } from './readerConfigs.js';
import type { FoleonReaderTone } from './FoleonReaderModule.js';
import styles from './FoleonReaderModule.module.css';

interface FoleonReaderPreviewProps {
  readonly config: FoleonReaderModuleConfig;
  readonly tone: FoleonReaderTone;
}

export function FoleonReaderPreview(props: FoleonReaderPreviewProps): React.ReactNode {
  const preview = previewCopyForTone(props.tone);

  return (
    <section
      className={`${styles.readerPreviewFallback} ${preview.className}`}
      aria-labelledby={`${props.config.readerKey}-preview-title`}
      data-foleon-preview-route={props.config.readerKey}
      data-preview-tone={preview.toneName}
    >
      <header className={styles.previewBanner}>
        <div>
          <p className={styles.previewEyebrow}>Preview layout</p>
          <h2 className={styles.previewTitle} id={`${props.config.readerKey}-preview-title`}>
            {preview.title}
          </h2>
          <p className={styles.previewDescription}>
            {preview.description}
          </p>
        </div>
        <div className={styles.previewStatusRail} aria-label="Preview status">
          <span className={styles.previewStatusPill}>Content coming soon</span>
          <span className={styles.previewStatusPill}>{preview.statusLabel}</span>
        </div>
      </header>

      <div className={styles.previewLayout}>
        <article className={styles.previewFeature} aria-label={`${props.config.title} feature placeholder`}>
          <div className={styles.previewMediaPlaceholder} aria-hidden="true" />
          <div className={styles.previewContentZone}>
            <div className={styles.previewMetaRow} aria-label="Preview metadata">
              <span className={styles.previewMetaPill}>{props.config.title}</span>
              <span className={styles.previewMetaPill}>{preview.cadenceLabel}</span>
              <span className={styles.previewMetaPill}>Active edition pending</span>
            </div>
            <h3 className={styles.previewFeatureTitle}>
              {preview.featureTitle}
            </h3>
            <p className={styles.previewFeatureCopy}>
              {preview.featureCopy}
            </p>
            <div className={styles.previewMetadataGrid} aria-label="Preview metadata zones">
              <span>Reader appears when an active edition is published</span>
              <span>{preview.governanceNote}</span>
              <span>Preview contains no live reader controls</span>
            </div>
          </div>
        </article>

        <aside className={styles.previewSupport} aria-label={`${props.config.title} supporting preview placeholders`}>
          {preview.supportCards.map(([title, copy]) => (
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

function previewCopyForTone(tone: FoleonReaderTone): {
  readonly className: string;
  readonly toneName: string;
  readonly title: string;
  readonly description: string;
  readonly statusLabel: string;
  readonly cadenceLabel: string;
  readonly featureTitle: string;
  readonly featureCopy: string;
  readonly governanceNote: string;
  readonly supportCards: ReadonlyArray<readonly [string, string]>;
} {
  if (tone === 'spotlight') {
    return {
      className: styles.readerPreviewSpotlight,
      toneName: 'blue',
      title: 'Project Spotlight reader',
      description: 'This sample structure previews the monthly active project profile lane before a governed Project Spotlight edition is published.',
      statusLabel: 'Monthly project profile',
      cadenceLabel: 'Monthly',
      featureTitle: 'Featured project profile placeholder',
      featureCopy: 'A polished project story area will introduce the active edition, project context, and editorial framing once live Foleon content is connected.',
      governanceNote: 'Archive group required for governance',
      supportCards: [
        ['Project context', 'Sample project metadata, team framing, and market context will appear here.'],
        ['Edition status', 'Monthly active-edition governance keeps one spotlight current at a time.'],
        ['Archive posture', 'Archive filtering will appear when live lane archive behavior is connected.'],
      ],
    };
  }
  if (tone === 'pulse') {
    return {
      className: styles.readerPreviewPulse,
      toneName: 'orange',
      title: 'Company Pulse reader',
      description: 'This sample structure previews the frequent company update lane for news, events, recognition, and operations before an active Company Pulse edition is published.',
      statusLabel: 'Latest company update',
      cadenceLabel: 'Frequent',
      featureTitle: 'Company update edition placeholder',
      featureCopy: 'A compact publication area will summarize the active edition, latest update cadence, and operational context once live Foleon content is connected.',
      governanceNote: 'Last editorial update required for freshness',
      supportCards: [
        ['Company updates', 'News, events, recognition, and operational updates will collect here.'],
        ['Latest edition', 'The newest active Company Pulse edition will carry the latest update label.'],
        ['Archive posture', 'Archive filtering will appear when live lane archive behavior is connected.'],
      ],
    };
  }
  return {
    className: styles.readerPreviewLeadership,
    toneName: 'navy',
    title: 'Leadership Message reader',
    description: 'This sample structure previews the executive communications lane before a governed Leadership Message edition is published.',
    statusLabel: 'Executive message',
    cadenceLabel: 'Leadership',
    featureTitle: 'Executive message edition placeholder',
    featureCopy: 'A refined leadership communication area will introduce the active executive message, key context, and publication framing once live Foleon content is connected.',
    governanceNote: 'Leadership content type required for alignment',
    supportCards: [
      ['Executive context', 'Leadership framing, message intent, and companywide relevance will appear here.'],
      ['Message status', 'Active-edition governance keeps the current leadership message clear and intentional.'],
      ['Archive posture', 'Archive filtering will appear when live lane archive behavior is connected.'],
    ],
  };
}
