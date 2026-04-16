import * as React from 'react';
import {
  HERO_THEME_VARIANT_VALUES,
  type HeroThemeVariant,
} from '../../../data/publisherAdapter/index.js';
import { heroThemeVariantLabel } from '../authorLabels.js';
import { defaultHeroCategoryLabel } from '../metadataDefaults.js';
import {
  ChooserGroup,
  DisclosureSection,
  Field,
  ImageAssetField,
  type AssetLibrarySearchFn,
} from '../sharedChrome/index.js';
import styles from '../article-publisher.module.css';
import { update, type PanelProps } from './draftHelpers.js';

/**
 * Does the draft carry any hero value the author has taken control
 * of? Used by the panel to decide whether the "Advanced hero options"
 * disclosure should start open so the author is not surprised by a
 * hidden non-default value.
 *
 * `HeroCategoryLabel` is treated as author-owned only when its value
 * differs from the system default (`defaultHeroCategoryLabel`) for
 * the bound project — the project-change helper in
 * `metadataDefaults.ts` fills this field automatically, so matching
 * the project name is a system-set value, not an override.
 */
export function hasAdvancedHeroOverrides(draft: PanelProps['draft']): boolean {
  const categoryIsAuthored = (() => {
    const value = draft.HeroCategoryLabel?.trim();
    if (!value) return false;
    const systemDefault = defaultHeroCategoryLabel(draft.ProjectName);
    return systemDefault === undefined || value !== systemDefault;
  })();
  return (
    Boolean(draft.HeroTitle && draft.HeroTitle.trim().length > 0) ||
    Boolean(draft.HeroEyebrow && draft.HeroEyebrow.trim().length > 0) ||
    categoryIsAuthored ||
    Boolean(draft.HeroThemeVariant && draft.HeroThemeVariant !== 'default') ||
    draft.HeroShowMetadata === true
  );
}

export interface HeroPanelProps extends PanelProps {
  readonly searchAssets?: AssetLibrarySearchFn;
}

export function HeroPanel({ draft, onChange, searchAssets }: HeroPanelProps) {
  // Compute once on mount — the section tracks its own open state
  // after that via the native <details> element, so re-evaluating on
  // every keystroke would fight the author by re-closing the section.
  const initialAdvancedOpen = React.useRef(hasAdvancedHeroOverrides(draft)).current;

  return (
    <div className={styles.editorialForm}>
      <ImageAssetField
        role="hero"
        label="Hero image"
        helper={
          searchAssets
            ? 'The lead visual readers see at the top of the article. Choose a tenant-approved asset from the library.'
            : 'The lead visual readers see at the top of the article. Paste an https:// URL from the tenant image library or an approved CDN.'
        }
        testId="hero-asset-field"
        searchAssets={searchAssets}
        value={{
          imageUrl: draft.HeroPrimaryImage,
          altText: draft.HeroPrimaryImageAltText,
        }}
        onChange={(next) =>
          onChange({
            ...draft,
            HeroPrimaryImage: next.imageUrl,
            HeroPrimaryImageAltText: next.altText,
          })
        }
      />
      <DisclosureSection
        label="Advanced hero options"
        summaryHint="Override hero headline, eyebrow, category, theme, or hero metadata."
        defaultOpen={initialAdvancedOpen}
        testId="hero-advanced-section"
      >
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
            placeholder={draft.ProjectName ?? 'Category displayed on the hero'}
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
      </DisclosureSection>
    </div>
  );
}
