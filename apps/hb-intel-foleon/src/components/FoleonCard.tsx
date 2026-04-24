import { HbcCard, HbcButton, HbcStatusBadge } from '@hbc/ui-kit/homepage';
import type { FoleonContentRecord } from '../types/foleon-content.types.js';

interface FoleonCardProps {
  readonly record: FoleonContentRecord;
  readonly variant: 'feature' | 'compact';
  readonly onOpen: (record: FoleonContentRecord) => void;
  readonly onExternal?: (record: FoleonContentRecord) => void;
}

export function FoleonCard(props: FoleonCardProps): React.ReactNode {
  const { record, variant, onOpen, onExternal } = props;
  const imageUrl = variant === 'feature' ? record.heroImageUrl ?? record.thumbnailUrl : record.thumbnailUrl ?? record.heroImageUrl;
  const issueLabel = formatIssueDate(record.issueDate ?? record.publishedOn);
  const externalUrl = record.publishedUrl && !record.publishedUrl.includes('/preview/') ? record.publishedUrl : null;

  return (
    <HbcCard
      weight={variant === 'feature' ? 'primary' : 'standard'}
      header={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <HbcStatusBadge variant="info" label={record.contentTypeKey} />
          {issueLabel ? (
            <span style={{ fontSize: 12, color: 'var(--hbc-text-secondary, #555)' }}>{issueLabel}</span>
          ) : null}
          {record.isFeatured ? <HbcStatusBadge variant="success" label="Featured" /> : null}
        </div>
      }
      footer={
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          {externalUrl && onExternal ? (
            <HbcButton
              variant="secondary"
              onClick={(): void => onExternal(record)}
            >
              Open externally
            </HbcButton>
          ) : null}
          <HbcButton onClick={(): void => onOpen(record)}>Read</HbcButton>
        </div>
      }
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          style={{
            width: '100%',
            height: variant === 'feature' ? 260 : 160,
            objectFit: 'cover',
            borderRadius: 4,
            marginBottom: 12,
          }}
        />
      ) : null}
      <h3 style={{ margin: '0 0 8px', fontSize: variant === 'feature' ? 22 : 16 }}>{record.title}</h3>
      {record.summary ? (
        <p style={{ margin: 0, fontSize: 14, color: 'var(--hbc-text-secondary, #555)' }}>
          {record.summary}
        </p>
      ) : null}
      {record.relatedProjectName ? (
        <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--hbc-text-tertiary, #777)' }}>
          {record.relatedProjectName}
          {record.relatedProjectNumber ? ` · ${record.relatedProjectNumber}` : ''}
        </p>
      ) : null}
    </HbcCard>
  );
}

function formatIssueDate(raw: string | undefined): string | null {
  if (!raw) return null;
  const parsed = Date.parse(raw);
  if (Number.isNaN(parsed)) return null;
  try {
    return new Date(parsed).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return null;
  }
}
