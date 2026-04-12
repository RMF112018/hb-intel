/**
 * Generic text-entry chip bucket (teams / departments / projects and
 * fallback). Type-specific chip tint comes from `bucketChipVariants` /
 * `bucketChipIconVariants` in variants.ts — doctrine §5.2 deliberate
 * use of class-variance-authority.
 */
import * as React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { X as XIcon } from 'lucide-react';
import formStyles from '../styles/form.module.css';
import { BUCKET_CONFIG } from './bucketConfig.js';
import type { KudosComposerRecipientBucketKind } from '../types.js';
import { bucketChipIconVariants, bucketChipVariants } from '../variants.js';

export interface RecipientBucketProps {
  kind: KudosComposerRecipientBucketKind;
  values: string[];
  onChange: (next: string[]) => void;
  disabled: boolean;
}

export function RecipientBucket({
  kind,
  values,
  onChange,
  disabled,
}: RecipientBucketProps): React.JSX.Element {
  const [draft, setDraft] = React.useState('');
  const config = BUCKET_CONFIG[kind];
  const inputId = `hbc-kudos-bucket-${kind}`;

  function commit(): void {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (values.includes(trimmed)) {
      setDraft('');
      return;
    }
    onChange([...values, trimmed]);
    setDraft('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit();
    } else if (e.key === 'Backspace' && draft === '' && values.length > 0) {
      e.preventDefault();
      onChange(values.slice(0, -1));
    }
  }

  function removeAt(index: number): void {
    onChange(values.filter((_, i) => i !== index));
  }

  const BucketIcon = config.icon;

  return (
    <div className={formStyles.bucket}>
      <div className={formStyles.bucketLabel}>
        <BucketIcon
          size={12}
          strokeWidth={2.2}
          aria-hidden="true"
          className={formStyles.bucketLabelIcon}
        />
        {config.label}
      </div>
      <div className={formStyles.bucketChips}>
        {values.map((value, index) => (
          <span key={`${value}-${index}`} className={bucketChipVariants({ kind })}>
            <BucketIcon
              size={10}
              strokeWidth={2.5}
              aria-hidden="true"
              className={bucketChipIconVariants({ kind })}
            />
            <span className={formStyles.bucketChipLabel}>{value}</span>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  disabled={disabled}
                  aria-label={`Remove ${value}`}
                  className={formStyles.bucketChipRemove}
                >
                  <XIcon size={10} strokeWidth={3} aria-hidden="true" />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content sideOffset={4} className={formStyles.chipRemoveTooltip}>
                  Remove {value}
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </span>
        ))}
        <input
          id={inputId}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commit}
          disabled={disabled}
          placeholder={values.length === 0 ? config.placeholder : ''}
          autoComplete="off"
          className={formStyles.bucketInput}
        />
      </div>
    </div>
  );
}
