/**
 * HbHeroBannerAdmin — site-admin authoring surface for the Hero Banner.
 *
 * Hosted at `.../SitePages/Homepage-Admin.aspx`. Reads and writes the
 * canonical `Hero Banner Config` list at HBCentral and drives the
 * public Hero Banner on the HBCentral homepage.
 *
 * Architecture:
 *   - Load path uses the same descriptor + mapper as the public read
 *     seam (`heroBannerListSource`) so load and render stay lockstep.
 *   - Edit path keeps a typed `HeroBannerDraft` view model distinct
 *     from the render-shape `HbHeroBannerConfig`.
 *   - Save path goes through `saveHeroBannerConfig`, which MERGEs the
 *     existing enabled row or POSTs a new one, then invalidates the
 *     public cache so the public webpart picks up the new values.
 *   - Preview renders through the same `HbcSignatureHeroSurface` the
 *     public Hero Banner uses.
 *
 * Authoring posture: operational and admin-safe. No Kudos-composer
 * layout. No browser `prompt/confirm`. Dirty-state is tracked and
 * discard is gated through an in-component confirmation banner.
 */
import * as React from 'react';
import {
  HbcSignatureHeroSurface,
  HbcPremiumCta,
} from '@hbc/ui-kit/homepage';
import {
  fetchHeroBannerListConfig,
} from '../../homepage/data/heroBannerListSource.js';
import {
  saveHeroBannerConfig,
  type HeroBannerDraft,
} from '../../homepage/data/heroBannerListWriter.js';
import { normalizeHeroBannerConfig } from '../../homepage/helpers/topBandConfig.js';
import styles from './hb-hero-banner-admin.module.css';

export interface HbHeroBannerAdminProps {
  siteUrl?: string;
}

const EMPTY_DRAFT: HeroBannerDraft = {
  headline: '',
  message: '',
  eyebrow: '',
  metadata: '',
  backgroundImageUrl: '',
  primaryCtaLabel: '',
  primaryCtaUrl: '',
  primaryCtaOpenInNewTab: false,
  secondaryCtaLabel: '',
  secondaryCtaUrl: '',
  secondaryCtaOpenInNewTab: false,
  enabled: true,
};

function configToDraft(config: {
  headline?: string;
  message?: string;
  eyebrow?: string;
  metadata?: string;
  background?: { src?: string };
  cta?: { label?: string; href?: string; openInNewTab?: boolean };
  secondaryCta?: { label?: string; href?: string; openInNewTab?: boolean };
  enabled?: boolean;
}): HeroBannerDraft {
  return {
    headline: config.headline ?? '',
    message: config.message ?? '',
    eyebrow: config.eyebrow ?? '',
    metadata: config.metadata ?? '',
    backgroundImageUrl: config.background?.src ?? '',
    primaryCtaLabel: config.cta?.label ?? '',
    primaryCtaUrl: config.cta?.href ?? '',
    primaryCtaOpenInNewTab: Boolean(config.cta?.openInNewTab),
    secondaryCtaLabel: config.secondaryCta?.label ?? '',
    secondaryCtaUrl: config.secondaryCta?.href ?? '',
    secondaryCtaOpenInNewTab: Boolean(config.secondaryCta?.openInNewTab),
    enabled: config.enabled ?? true,
  };
}

type LoadState = 'idle' | 'loading' | 'loaded' | 'load-error';
type SaveState = 'idle' | 'saving' | 'saved' | 'save-error';

export function HbHeroBannerAdmin({
  siteUrl,
}: HbHeroBannerAdminProps): React.JSX.Element {
  const [loadState, setLoadState] = React.useState<LoadState>(
    siteUrl ? 'loading' : 'idle',
  );
  const [loadError, setLoadError] = React.useState<string | undefined>();
  const [baseline, setBaseline] = React.useState<HeroBannerDraft>(EMPTY_DRAFT);
  const [draft, setDraft] = React.useState<HeroBannerDraft>(EMPTY_DRAFT);
  const [saveState, setSaveState] = React.useState<SaveState>('idle');
  const [saveError, setSaveError] = React.useState<string | undefined>();
  const [showDiscardGuard, setShowDiscardGuard] = React.useState(false);

  const load = React.useCallback(async (): Promise<void> => {
    if (!siteUrl) return;
    setLoadState('loading');
    setLoadError(undefined);
    try {
      const fetched = await fetchHeroBannerListConfig(siteUrl);
      const nextDraft = fetched ? configToDraft(fetched) : EMPTY_DRAFT;
      setBaseline(nextDraft);
      setDraft(nextDraft);
      setLoadState('loaded');
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load.');
      setLoadState('load-error');
    }
  }, [siteUrl]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const isDirty = React.useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(baseline),
    [draft, baseline],
  );

  const canSave = isDirty && Boolean(draft.headline.trim()) && saveState !== 'saving';

  const onSave = async (): Promise<void> => {
    if (!siteUrl) {
      setSaveState('save-error');
      setSaveError('No SharePoint site URL available.');
      return;
    }
    setSaveState('saving');
    setSaveError(undefined);
    const result = await saveHeroBannerConfig(siteUrl, draft);
    if (!result.ok) {
      setSaveState('save-error');
      setSaveError(result.error);
      return;
    }
    // Read-after-write: re-fetch so baseline and draft show the
    // authoritative post-save state.
    await load();
    setSaveState('saved');
  };

  const onCancelRequested = (): void => {
    if (!isDirty) {
      // No edits pending — nothing to discard.
      return;
    }
    setShowDiscardGuard(true);
  };

  const confirmDiscard = (): void => {
    setDraft(baseline);
    setSaveState('idle');
    setSaveError(undefined);
    setShowDiscardGuard(false);
  };

  const updateField = <K extends keyof HeroBannerDraft>(
    key: K,
    value: HeroBannerDraft[K],
  ): void => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    if (saveState === 'saved') setSaveState('idle');
  };

  const previewConfig = normalizeHeroBannerConfig({
    headline: draft.headline || 'Preview headline',
    message: draft.message || undefined,
    eyebrow: draft.eyebrow || undefined,
    metadata: draft.metadata || undefined,
    background: draft.backgroundImageUrl
      ? { src: draft.backgroundImageUrl, alt: draft.headline || 'Hero background' }
      : undefined,
    cta: draft.primaryCtaLabel && draft.primaryCtaUrl
      ? {
          label: draft.primaryCtaLabel,
          href: draft.primaryCtaUrl,
          openInNewTab: draft.primaryCtaOpenInNewTab,
        }
      : undefined,
    secondaryCta: draft.secondaryCtaLabel && draft.secondaryCtaUrl
      ? {
          label: draft.secondaryCtaLabel,
          href: draft.secondaryCtaUrl,
          openInNewTab: draft.secondaryCtaOpenInNewTab,
        }
      : undefined,
  });

  return (
    <section
      className={styles.workspace}
      data-hbc-admin="hero-banner"
      aria-label="Hero Banner Admin"
    >
      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          if (canSave) void onSave();
        }}
      >
        <h2 style={{ margin: 0, fontSize: '1.125rem' }}>Hero Banner configuration</h2>
        <p className={styles.help} style={{ margin: 0 }}>
          Controls the Hero Banner rendered on the HB Central homepage.
        </p>

        {loadState === 'loading' ? (
          <div className={`${styles.statusBanner} ${styles.statusInfo}`} role="status">
            Loading current configuration…
          </div>
        ) : null}

        {loadState === 'load-error' ? (
          <div className={`${styles.statusBanner} ${styles.statusError}`} role="alert">
            Could not load current configuration: {loadError}
          </div>
        ) : null}

        {saveState === 'saved' ? (
          <div className={`${styles.statusBanner} ${styles.statusSuccess}`} role="status">
            Saved. The public Hero Banner will refresh on the next homepage load.
          </div>
        ) : null}

        {saveState === 'save-error' ? (
          <div className={`${styles.statusBanner} ${styles.statusError}`} role="alert">
            Save failed: {saveError}
          </div>
        ) : null}

        {showDiscardGuard ? (
          <div className={styles.discardDialog} role="alertdialog" aria-label="Discard unsaved changes?">
            <span>You have unsaved changes. Discard them?</span>
            <div className={styles.dialogActions}>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={confirmDiscard}
              >
                Discard changes
              </button>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => setShowDiscardGuard(false)}
              >
                Keep editing
              </button>
            </div>
          </div>
        ) : null}

        <fieldset className={styles.fieldGroup}>
          <legend className={styles.fieldGroupHeading}>Headline</legend>
          <label className={styles.fieldRow}>
            <span className={styles.label}>Title *</span>
            <input
              className={styles.input}
              type="text"
              value={draft.headline}
              onChange={(e) => updateField('headline', e.target.value)}
              required
              aria-required="true"
            />
          </label>
          <label className={styles.fieldRow}>
            <span className={styles.label}>Eyebrow</span>
            <input
              className={styles.input}
              type="text"
              value={draft.eyebrow ?? ''}
              onChange={(e) => updateField('eyebrow', e.target.value)}
            />
          </label>
          <label className={styles.fieldRow}>
            <span className={styles.label}>Message</span>
            <textarea
              className={styles.textarea}
              value={draft.message ?? ''}
              onChange={(e) => updateField('message', e.target.value)}
            />
          </label>
          <label className={styles.fieldRow}>
            <span className={styles.label}>Metadata line</span>
            <input
              className={styles.input}
              type="text"
              value={draft.metadata ?? ''}
              onChange={(e) => updateField('metadata', e.target.value)}
            />
          </label>
        </fieldset>

        <fieldset className={styles.fieldGroup}>
          <legend className={styles.fieldGroupHeading}>Media</legend>
          <label className={styles.fieldRow}>
            <span className={styles.label}>Background image URL</span>
            <input
              className={styles.input}
              type="url"
              placeholder="https://…/image.jpg"
              value={draft.backgroundImageUrl ?? ''}
              onChange={(e) => updateField('backgroundImageUrl', e.target.value)}
            />
          </label>
        </fieldset>

        <fieldset className={styles.fieldGroup}>
          <legend className={styles.fieldGroupHeading}>Primary CTA</legend>
          <label className={styles.fieldRow}>
            <span className={styles.label}>Label</span>
            <input
              className={styles.input}
              type="text"
              value={draft.primaryCtaLabel ?? ''}
              onChange={(e) => updateField('primaryCtaLabel', e.target.value)}
            />
          </label>
          <label className={styles.fieldRow}>
            <span className={styles.label}>URL</span>
            <input
              className={styles.input}
              type="url"
              value={draft.primaryCtaUrl ?? ''}
              onChange={(e) => updateField('primaryCtaUrl', e.target.value)}
            />
          </label>
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={Boolean(draft.primaryCtaOpenInNewTab)}
              onChange={(e) => updateField('primaryCtaOpenInNewTab', e.target.checked)}
            />
            Open in new tab
          </label>
        </fieldset>

        <fieldset className={styles.fieldGroup}>
          <legend className={styles.fieldGroupHeading}>Secondary CTA</legend>
          <label className={styles.fieldRow}>
            <span className={styles.label}>Label</span>
            <input
              className={styles.input}
              type="text"
              value={draft.secondaryCtaLabel ?? ''}
              onChange={(e) => updateField('secondaryCtaLabel', e.target.value)}
            />
          </label>
          <label className={styles.fieldRow}>
            <span className={styles.label}>URL</span>
            <input
              className={styles.input}
              type="url"
              value={draft.secondaryCtaUrl ?? ''}
              onChange={(e) => updateField('secondaryCtaUrl', e.target.value)}
            />
          </label>
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={Boolean(draft.secondaryCtaOpenInNewTab)}
              onChange={(e) => updateField('secondaryCtaOpenInNewTab', e.target.checked)}
            />
            Open in new tab
          </label>
        </fieldset>

        <fieldset className={styles.fieldGroup}>
          <legend className={styles.fieldGroupHeading}>Activation</legend>
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={draft.enabled}
              onChange={(e) => updateField('enabled', e.target.checked)}
            />
            Enabled (visible on the HB Central homepage)
          </label>
        </fieldset>

        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.primaryButton}
            disabled={!canSave}
          >
            {saveState === 'saving' ? 'Saving…' : 'Save configuration'}
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={onCancelRequested}
            disabled={!isDirty || saveState === 'saving'}
          >
            Cancel
          </button>
          {isDirty ? (
            <span className={styles.help} aria-live="polite">
              You have unsaved changes.
            </span>
          ) : null}
        </div>
      </form>

      <aside className={styles.previewPane} aria-label="Live preview">
        <h3 className={styles.previewHeading}>Preview</h3>
        <p className={styles.help} style={{ margin: 0 }}>
          Renders with the same presentation surface used by the public homepage banner.
        </p>
        <div className={styles.previewFrame} data-hbc-admin-preview="hero-banner">
          <HbcSignatureHeroSurface
            background="brand"
            backgroundImage={previewConfig.background?.src}
            aria-label="Hero banner preview"
            eyebrow={previewConfig.eyebrow}
            editorial={
              <>
                <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 700, lineHeight: 1.12 }}>
                  {previewConfig.headline}
                </h2>
                {previewConfig.message ? (
                  <p style={{ margin: 0, fontSize: '0.9375rem', opacity: 0.9 }}>
                    {previewConfig.message}
                  </p>
                ) : null}
              </>
            }
            ctas={
              <>
                {previewConfig.cta ? (
                  <HbcPremiumCta
                    label={previewConfig.cta.label}
                    href={previewConfig.cta.href}
                    variant="onDark"
                    size="lg"
                    arrow
                    external={previewConfig.cta.openInNewTab}
                  />
                ) : null}
                {previewConfig.secondaryCta ? (
                  <HbcPremiumCta
                    label={previewConfig.secondaryCta.label}
                    href={previewConfig.secondaryCta.href}
                    variant="ghost"
                    size="md"
                    arrow
                    external={previewConfig.secondaryCta.openInNewTab}
                  />
                ) : null}
              </>
            }
            metadata={previewConfig.metadata ? (
              <span style={{ fontSize: '0.8125rem', opacity: 0.75 }}>{previewConfig.metadata}</span>
            ) : undefined}
          />
        </div>
      </aside>
    </section>
  );
}
