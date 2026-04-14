import * as React from 'react';
import { Field } from '../sharedChrome/index.js';
import styles from '../article-publisher.module.css';
import { update, type PanelProps } from './draftHelpers.js';

export function SecondaryImagePanel({ draft, onChange }: PanelProps) {
  return (
    <div className={styles.editorialForm}>
      <label className={styles.toggleRow}>
        <input
          type="checkbox"
          checked={draft.ShowSecondaryImage === true}
          onChange={(e) => onChange(update(draft, 'ShowSecondaryImage', e.target.checked))}
        />
        <span>Show a secondary image alongside the body</span>
      </label>
      <Field label="Secondary image URL">
        <input
          className={styles.input}
          value={draft.SecondaryImage ?? ''}
          placeholder="https://…"
          onChange={(e) => onChange(update(draft, 'SecondaryImage', e.target.value || undefined))}
        />
      </Field>
      <Field label="Alt text">
        <textarea
          className={styles.textarea}
          value={draft.SecondaryImageAltText ?? ''}
          placeholder="Describe the image"
          onChange={(e) =>
            onChange(update(draft, 'SecondaryImageAltText', e.target.value || undefined))
          }
        />
      </Field>
      <Field label="Caption">
        <textarea
          className={styles.textarea}
          value={draft.SecondaryImageCaption ?? ''}
          placeholder="Optional caption shown under the image"
          onChange={(e) =>
            onChange(update(draft, 'SecondaryImageCaption', e.target.value || undefined))
          }
        />
      </Field>
    </div>
  );
}
