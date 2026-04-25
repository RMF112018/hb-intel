import type { FoleonPreviewRecord } from '../preview/FoleonPreviewTypes.js';
import { FoleonPreviewCard } from './FoleonPreviewCard.js';
import styles from './FoleonPreviewFallback.module.css';

interface FoleonPreviewFallbackProps {
  readonly route: 'highlights';
  readonly records: ReadonlyArray<FoleonPreviewRecord>;
}

export function FoleonPreviewFallback(props: FoleonPreviewFallbackProps): React.ReactNode {
  const feature = props.records.find((record) => record.isFeature) ?? props.records[0];
  const compactRecords = props.records.filter((record) => record.id !== feature?.id).slice(0, 3);

  return (
    <section className={styles.fallback} aria-labelledby="foleon-preview-highlights-title" data-foleon-preview-route={props.route}>
      <header className={styles.banner}>
        <div>
          <p className={styles.eyebrow}>Preview layout</p>
          <h3 className={styles.title} id="foleon-preview-highlights-title">
            Preview: Marketing highlights
          </h3>
          <p className={styles.description}>
            This sample content structure shows how Foleon project spotlights, company news, and leadership
            updates will appear once published content, homepage placements, and connector sync data are available.
          </p>
        </div>
        <span className={styles.statusPill}>Content coming soon</span>
      </header>

      <div className={styles.layout}>
        {feature ? <FoleonPreviewCard record={feature} variant="feature" /> : null}
        {compactRecords.length > 0 ? (
          <div className={styles.supportingGrid} aria-label="Supporting preview publication placeholders">
            {compactRecords.map((record) => (
              <FoleonPreviewCard key={record.id} record={record} variant="compact" />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
