/**
 * HbcKudosComposerPreview — Live preview card mirroring the spotlight
 * visual register. Typed recipients take precedence when populated;
 * falls back to the legacy comma-delimited text field.
 */
import * as React from 'react';
import { clsx } from 'clsx';
import { CheckCircle2 } from 'lucide-react';
import styles from './styles/preview.module.css';
import { HbcAvatarStack } from '../HbcAvatarStack/index.js';
import { kudosComposerCSSVars } from './tokens.js';
import type {
  HbcKudosComposerPreviewProps,
  KudosComposerRecipientBucketsDraft,
} from './types.js';

function parseRecipients(raw: string): string[] {
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

interface PreviewRecipient {
  name: string;
  photoUrl?: string;
}

function flattenTypedRecipients(
  buckets: KudosComposerRecipientBucketsDraft | undefined,
  displayMap?: Record<string, string>,
  photoMap?: Record<string, string>,
): PreviewRecipient[] {
  if (!buckets) return [];
  const individuals: PreviewRecipient[] = buckets.individualEmails.map((upn) => ({
    name: displayMap?.[upn] || upn,
    photoUrl: photoMap?.[upn],
  }));
  const labels: PreviewRecipient[] = [
    ...buckets.teamLabels,
    ...buckets.departmentLabels,
    ...buckets.projectGroupLabels,
  ]
    .filter(Boolean)
    .map((label) => ({ name: label }));
  return [...individuals, ...labels];
}

export function HbcKudosComposerPreview({
  draft,
  submitterName,
}: HbcKudosComposerPreviewProps): React.JSX.Element {
  const typedFlat = flattenTypedRecipients(
    draft.recipients,
    draft.recipientDisplayMap,
    draft.recipientPhotoMap,
  );
  const recipients: PreviewRecipient[] =
    typedFlat.length > 0
      ? typedFlat
      : parseRecipients(draft.recipientNames).map((name) => ({ name }));
  const headline = draft.headline.trim() || 'Your headline here';
  const excerpt = draft.excerpt.trim() || 'Your recognition message will appear here…';
  const isEmpty =
    !draft.headline.trim() && !draft.excerpt.trim() && recipients.length === 0;

  let recipientLine = '';
  if (recipients.length === 1) recipientLine = recipients[0]!.name;
  else if (recipients.length === 2)
    recipientLine = `${recipients[0]!.name} and ${recipients[1]!.name}`;
  else if (recipients.length > 2)
    recipientLine = `${recipients[0]!.name}, ${recipients[1]!.name}, and ${recipients.length - 2} more`;

  return (
    <div className={styles.previewWrap} style={kudosComposerCSSVars()}>
      <div className={styles.previewLabel}>
        <span className={styles.previewLabelDot} aria-hidden="true" />
        Preview
      </div>
      <article className={clsx(styles.previewCard, isEmpty && styles.previewCardEmpty)}>
        {recipients.length > 0 ? (
          <div className={styles.previewAvatars}>
            <HbcAvatarStack
              people={recipients
                .slice(0, 4)
                .map((r, i) => ({ id: `prev-${i}`, name: r.name, src: r.photoUrl }))}
              size="md"
              max={4}
              overflow={recipients.length > 4 ? 'inline-text' : 'none'}
            />
            {recipients.length > 4 ? (
              <span className={styles.previewOverflow}>+{recipients.length - 4} more</span>
            ) : null}
          </div>
        ) : null}

        <h3 className={styles.previewHeadline}>{headline}</h3>

        {recipientLine ? (
          <span className={styles.previewRecipients}>{recipientLine}</span>
        ) : null}

        <p className={styles.previewExcerpt}>{excerpt}</p>

        <div className={styles.previewSubmitter}>
          <CheckCircle2
            size={11}
            aria-hidden="true"
            className={styles.previewSubmitterIcon}
          />
          {submitterName || 'You'}
        </div>
      </article>
    </div>
  );
}
