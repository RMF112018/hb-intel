/**
 * HbcKudosComposerForm — Labeled form grid with validation and warm
 * focus treatment. Text-mode recipient field or typed-mode bucket
 * composition, gated by `recipientsMode`.
 *
 * Doctrine §5.2 premium-stack adoptions:
 *   - @radix-ui/react-separator  — decorative divider between
 *     recipients and the headline/message group.
 *   - class-variance-authority   — inputVariants governs invalid
 *     styling without ternary className sprinkles.
 */
import * as React from 'react';
import * as Separator from '@radix-ui/react-separator';
import styles from './styles/form.module.css';
import { TypedRecipients } from './internal/TypedRecipients.js';
import { inputVariants } from './variants.js';
import { EMPTY_KUDOS_COMPOSER_RECIPIENT_BUCKETS } from './types.js';
import type {
  HbcKudosComposerFormProps,
  KudosComposerRecipientBucketsDraft,
} from './types.js';

export function HbcKudosComposerForm({
  draft,
  onDraftChange,
  errors = {},
  disabled = false,
  recipientsMode = 'text',
  searchPeople,
  fetchPersonPhoto,
}: HbcKudosComposerFormProps): React.JSX.Element {
  const typedBuckets = draft.recipients ?? EMPTY_KUDOS_COMPOSER_RECIPIENT_BUCKETS;
  const handleTypedChange = React.useCallback(
    (patch: Partial<KudosComposerRecipientBucketsDraft>) => {
      onDraftChange({ recipients: { ...typedBuckets, ...patch } });
    },
    [onDraftChange, typedBuckets],
  );

  const [showDetails, setShowDetails] = React.useState(Boolean(draft.details));

  return (
    <div className={styles.form}>
      <div className={styles.formNotice}>
        Your kudos will be reviewed before appearing on the homepage.
      </div>

      {/* Recipients */}
      {recipientsMode === 'typed' ? (
        <TypedRecipients
          buckets={typedBuckets}
          onChange={handleTypedChange}
          onDraftChange={onDraftChange}
          disabled={disabled}
          errorMessage={errors.recipients}
          searchPeople={searchPeople}
          fetchPersonPhoto={fetchPersonPhoto}
        />
      ) : (
        <div className={styles.field}>
          <label className={styles.label} htmlFor="hbc-kudos-recipients">
            Recipients <span className={styles.requiredMark}>*</span>
          </label>
          <input
            id="hbc-kudos-recipients"
            type="text"
            placeholder="e.g. Riley Brooks, Morgan Chen"
            value={draft.recipientNames}
            onChange={(e) => onDraftChange({ recipientNames: e.target.value })}
            disabled={disabled}
            className={inputVariants({ invalid: Boolean(errors.recipientNames) })}
          />
          {errors.recipientNames ? (
            <div className={styles.error}>{errors.recipientNames}</div>
          ) : null}
          <div className={styles.hint}>Separate multiple names with commas</div>
        </div>
      )}

      <Separator.Root
        decorative
        orientation="horizontal"
        className={styles.formDivider}
      />

      {/* Headline */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="hbc-kudos-headline">
          Headline <span className={styles.requiredMark}>*</span>
        </label>
        <input
          id="hbc-kudos-headline"
          type="text"
          placeholder="e.g. Outstanding Safety Leadership"
          value={draft.headline}
          onChange={(e) => onDraftChange({ headline: e.target.value })}
          disabled={disabled}
          maxLength={120}
          className={inputVariants({ invalid: Boolean(errors.headline) })}
        />
        {errors.headline ? <div className={styles.error}>{errors.headline}</div> : null}
        {draft.headline.length > 80 ? (
          <div className={styles.hint}>{draft.headline.length}/120</div>
        ) : null}
      </div>

      {/* Message */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="hbc-kudos-message">
          Message <span className={styles.requiredMark}>*</span>
        </label>
        <textarea
          id="hbc-kudos-message"
          placeholder="What did they do that deserves recognition?"
          value={draft.excerpt}
          onChange={(e) => onDraftChange({ excerpt: e.target.value })}
          disabled={disabled}
          rows={3}
          className={`${inputVariants({ invalid: Boolean(errors.excerpt) })} ${styles.textarea}`}
        />
        {errors.excerpt ? <div className={styles.error}>{errors.excerpt}</div> : null}
      </div>

      {/* Details — progressive disclosure */}
      {showDetails ? (
        <div className={styles.field}>
          <label className={styles.label} htmlFor="hbc-kudos-details">
            Additional details <span className={styles.optionalMark}>(optional)</span>
          </label>
          <textarea
            id="hbc-kudos-details"
            placeholder="Any extra context or background"
            value={draft.details}
            onChange={(e) => onDraftChange({ details: e.target.value })}
            disabled={disabled}
            rows={2}
            className={`${inputVariants({ invalid: false })} ${styles.textarea} ${styles.textareaShort}`}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowDetails(true)}
          disabled={disabled}
          className={styles.detailsToggle}
        >
          + Add details
        </button>
      )}
    </div>
  );
}
