import type { FoleonPreviewRecord } from '../preview/FoleonPreviewTypes.js';
import { FoleonPreviewCard } from './FoleonPreviewCard.js';
import styles from './FoleonPreviewFallback.module.css';

interface FoleonPreviewFallbackProps {
  readonly route: 'highlights' | 'hub';
  readonly records: ReadonlyArray<FoleonPreviewRecord>;
}

export function FoleonPreviewFallback(props: FoleonPreviewFallbackProps): React.ReactNode {
  if (props.route === 'hub') {
    return <FoleonHubPreviewFallback records={props.records} />;
  }

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

function FoleonHubPreviewFallback(props: { readonly records: ReadonlyArray<FoleonPreviewRecord> }): React.ReactNode {
  const archiveRecords = props.records.slice(0, 6);

  return (
    <section className={styles.fallback} aria-labelledby="foleon-preview-hub-title" data-foleon-preview-route="hub">
      <header className={styles.banner}>
        <div>
          <p className={styles.eyebrow}>Preview archive layout</p>
          <h3 className={styles.title} id="foleon-preview-hub-title">
            Preview: All publications
          </h3>
          <p className={styles.description}>
            This sample content structure shows how the Foleon archive will organize searchable publications once the
            registry is populated with live content. Filters and search will apply to live publications when connected.
          </p>
        </div>
        <span className={styles.statusPill}>Content coming soon</span>
      </header>

      <div className={styles.archiveCues} aria-label="Preview archive search and filter cues">
        <span className={styles.cueLine}>Search archive</span>
        <span className={styles.cueChip}>All</span>
        <span className={styles.cueChip}>Project Highlight</span>
        <span className={styles.cueChip}>Newsletter</span>
        <span className={styles.cueChip}>Market Update</span>
      </div>

      <div className={styles.archiveGrid} aria-label="Archive preview publication placeholders">
        {archiveRecords.map((record) => (
          <FoleonPreviewCard key={record.id} record={record} variant="compact" />
        ))}
      </div>
    </section>
  );
}
