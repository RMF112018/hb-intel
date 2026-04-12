/**
 * Typed-mode recipient orchestration. Individuals bucket always
 * expanded; secondary buckets (teams / departments / projects)
 * expand on click or when populated.
 */
import * as React from 'react';
import formStyles from '../styles/form.module.css';
import type {
  KudosComposerDraft,
  KudosComposerRecipientBucketKind,
  KudosComposerRecipientBucketsDraft,
} from '../types.js';
import type { PeopleSearchFn, PersonPhotoFn } from '../../HbcPeoplePicker/types.js';
import { BUCKET_CONFIG } from './bucketConfig.js';
import { RecipientBucket } from './RecipientBucket.js';
import { SharedPickerBridge } from './SharedPickerBridge.js';

export interface TypedRecipientsProps {
  buckets: KudosComposerRecipientBucketsDraft;
  onChange: (patch: Partial<KudosComposerRecipientBucketsDraft>) => void;
  onDraftChange?: (patch: Partial<KudosComposerDraft>) => void;
  disabled: boolean;
  errorMessage?: string;
  searchPeople?: PeopleSearchFn;
  fetchPersonPhoto?: PersonPhotoFn;
}

export function TypedRecipients({
  buckets,
  onChange,
  onDraftChange,
  disabled,
  errorMessage,
  searchPeople,
  fetchPersonPhoto,
}: TypedRecipientsProps): React.JSX.Element {
  const [expanded, setExpanded] = React.useState<Set<KudosComposerRecipientBucketKind>>(
    () => new Set<KudosComposerRecipientBucketKind>(['individualEmails']),
  );

  const toggleExpand = React.useCallback((kind: KudosComposerRecipientBucketKind) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(kind)) next.delete(kind);
      else next.add(kind);
      return next;
    });
  }, []);

  const allKinds = Object.keys(BUCKET_CONFIG) as KudosComposerRecipientBucketKind[];
  const primaryKind: KudosComposerRecipientBucketKind = 'individualEmails';
  const secondaryKinds = allKinds.filter((k) => k !== primaryKind);

  return (
    <>
      {searchPeople ? (
        <SharedPickerBridge
          values={buckets[primaryKind]}
          onChange={(next) =>
            onChange({ [primaryKind]: next } as Partial<KudosComposerRecipientBucketsDraft>)
          }
          onDisplayMapChange={
            onDraftChange ? (map) => onDraftChange({ recipientDisplayMap: map }) : undefined
          }
          onPhotoMapChange={
            onDraftChange ? (map) => onDraftChange({ recipientPhotoMap: map }) : undefined
          }
          disabled={disabled}
          searchPeople={searchPeople}
          fetchPersonPhoto={fetchPersonPhoto}
          errorMessage={errorMessage}
        />
      ) : (
        <div className={formStyles.field}>
          <label className={formStyles.label}>
            Recipients <span className={formStyles.requiredMark}>*</span>
          </label>
          <RecipientBucket
            kind={primaryKind}
            values={buckets[primaryKind]}
            onChange={(next) =>
              onChange({ [primaryKind]: next } as Partial<KudosComposerRecipientBucketsDraft>)
            }
            disabled={disabled}
          />
        </div>
      )}

      <div className={formStyles.bucketSecondaryRow}>
        {secondaryKinds.map((kind) => {
          const hasValues = buckets[kind].length > 0;
          const isExpanded = expanded.has(kind) || hasValues;
          const BucketIcon = BUCKET_CONFIG[kind].icon;

          if (isExpanded) {
            return (
              <RecipientBucket
                key={kind}
                kind={kind}
                values={buckets[kind]}
                onChange={(next) =>
                  onChange({ [kind]: next } as Partial<KudosComposerRecipientBucketsDraft>)
                }
                disabled={disabled}
              />
            );
          }

          return (
            <button
              key={kind}
              type="button"
              onClick={() => toggleExpand(kind)}
              disabled={disabled}
              aria-expanded="false"
              className={formStyles.bucketAddButton}
            >
              <BucketIcon size={13} strokeWidth={2.2} aria-hidden="true" />
              {BUCKET_CONFIG[kind].label}
            </button>
          );
        })}
      </div>

      {!searchPeople && errorMessage ? (
        <div className={formStyles.error}>{errorMessage}</div>
      ) : null}
      {!searchPeople ? (
        <div className={formStyles.hint}>Press Enter to add each entry.</div>
      ) : null}
    </>
  );
}
