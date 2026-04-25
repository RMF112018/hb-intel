import type { FoleonPreviewRecord } from '../preview/FoleonPreviewTypes.js';
import styles from './FoleonPreviewFallback.module.css';

interface FoleonPreviewCardProps {
  readonly record: FoleonPreviewRecord;
  readonly variant: 'feature' | 'compact';
}

export function FoleonPreviewCard(props: FoleonPreviewCardProps): React.ReactNode {
  const { record, variant } = props;
  const metadata = [record.issueDateLabel, record.region, record.sector].filter(Boolean);
  const projectText = record.relatedProjectName
    ? `Sample project metadata: ${record.relatedProjectName}`
    : 'Sample metadata zone';

  return (
    <article
      className={`${styles.card} ${variant === 'feature' ? styles.featureCard : styles.compactCard}`}
      aria-label={`${record.title} preview placeholder`}
      data-testid={`foleon-preview-${variant}-card`}
      data-placeholder-variant={record.placeholderVariant}
    >
      <div className={styles.media} aria-label="Preview media placeholder" data-testid="foleon-preview-media" />
      <div className={styles.body}>
        <div className={styles.metaRow} aria-label="Preview metadata">
          <span className={styles.statusPill}>{record.previewBadgeLabel}</span>
          <span className={styles.metadataPill}>{record.contentTypeKey}</span>
          {metadata.map((item) => (
            <span className={styles.metadataPill} key={item}>
              {item}
            </span>
          ))}
        </div>
        <h3 className={styles.recordTitle}>{record.title}</h3>
        <p className={styles.summary}>{record.summary}</p>
        <div className={styles.projectRow} aria-label="Preview project and market metadata">
          <span className={styles.projectText}>{projectText}</span>
        </div>
        <div className={styles.futureAction} aria-label="Future reader action location">
          <span className={styles.actionPill}>{record.previewActionLabel}</span>
          <span>Reader links will appear when published Foleon content is connected.</span>
        </div>
      </div>
    </article>
  );
}
