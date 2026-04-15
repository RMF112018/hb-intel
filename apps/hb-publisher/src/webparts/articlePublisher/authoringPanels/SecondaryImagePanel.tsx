import * as React from 'react';
import { ImageAssetField } from '../sharedChrome/index.js';
import styles from '../article-publisher.module.css';
import { update, type PanelProps } from './draftHelpers.js';

export function SecondaryImagePanel({ draft, onChange }: PanelProps) {
  const hasSecondaryAsset = !!draft.SecondaryImage?.trim();

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
      {(draft.ShowSecondaryImage === true || hasSecondaryAsset) && (
        <ImageAssetField
          role="secondary"
          label="Secondary image"
          helper="A single supporting visual rendered alongside the article body when the template exposes it."
          withCaption
          testId="secondary-asset-field"
          value={{
            imageUrl: draft.SecondaryImage ?? '',
            altText: draft.SecondaryImageAltText ?? '',
            caption: draft.SecondaryImageCaption ?? undefined,
          }}
          onChange={(next) =>
            onChange({
              ...draft,
              SecondaryImage: next.imageUrl || undefined,
              SecondaryImageAltText: next.altText || undefined,
              SecondaryImageCaption: next.caption || undefined,
            })
          }
        />
      )}
    </div>
  );
}
