import * as React from 'react';
import {
  HERO_THEME_VARIANT_VALUES,
  type HeroThemeVariant,
} from '../../../homepage/data/publisherAdapter/index.js';
import { heroThemeVariantLabel } from '../authorLabels.js';
import { ChooserGroup, Field } from '../sharedChrome/index.js';
import styles from '../article-publisher.module.css';
import { update, type PanelProps } from './draftHelpers.js';

export function HeroPanel({ draft, onChange }: PanelProps) {
  return (
    <div className={styles.editorialForm}>
      <Field label="Hero image URL">
        <input
          className={styles.input}
          value={draft.HeroPrimaryImage}
          placeholder="https://…"
          onChange={(e) => onChange(update(draft, 'HeroPrimaryImage', e.target.value))}
        />
      </Field>
      <Field
        label="Alt text (for screen readers)"
        helper="Describe what is visible and why it matters — not that it is an image. Skip if the hero is purely decorative."
        counter={{ value: draft.HeroPrimaryImageAltText.length, soft: 125 }}
      >
        <textarea
          className={styles.textarea}
          value={draft.HeroPrimaryImageAltText}
          placeholder="e.g. Crew raising the final steel beam at the West Palm Beach jobsite."
          onChange={(e) => onChange(update(draft, 'HeroPrimaryImageAltText', e.target.value))}
        />
      </Field>
      <Field label="Hero headline (optional override)">
        <input
          className={styles.input}
          value={draft.HeroTitle ?? ''}
          placeholder="Falls back to the article headline when blank"
          onChange={(e) =>
            onChange(update(draft, 'HeroTitle', e.target.value || undefined))
          }
        />
      </Field>
      <Field label="Eyebrow">
        <input
          className={styles.input}
          value={draft.HeroEyebrow ?? ''}
          placeholder="Short label above the headline"
          onChange={(e) => onChange(update(draft, 'HeroEyebrow', e.target.value || undefined))}
        />
      </Field>
      <Field label="Category label">
        <input
          className={styles.input}
          value={draft.HeroCategoryLabel ?? ''}
          placeholder="Category displayed on the hero"
          onChange={(e) =>
            onChange(update(draft, 'HeroCategoryLabel', e.target.value || undefined))
          }
        />
      </Field>
      <ChooserGroup
        label="Hero theme"
        value={draft.HeroThemeVariant}
        options={HERO_THEME_VARIANT_VALUES}
        getLabel={heroThemeVariantLabel}
        onChange={(next) =>
          onChange(update(draft, 'HeroThemeVariant', next as HeroThemeVariant | undefined))
        }
        allowClear
        clearLabel="Default"
      />
      <label className={styles.toggleRow}>
        <input
          type="checkbox"
          checked={!!draft.HeroShowMetadata}
          onChange={(e) => onChange(update(draft, 'HeroShowMetadata', e.target.checked))}
        />
        <span>Show article metadata on the hero</span>
      </label>
    </div>
  );
}
