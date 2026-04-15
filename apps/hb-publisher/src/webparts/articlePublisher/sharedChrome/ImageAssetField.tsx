/**
 * ImageAssetField — preview-first editorial asset picker used by
 * single-image surfaces on the Article Publisher (hero primary,
 * secondary).
 *
 * Phase-15 Wave-02 Prompt-01: the acquisition model is now governed
 * asset-library browse as the primary path. The author clicks
 * "Browse library" and selects from a tenant-safe source wired in
 * through `searchAssets`. Raw URL editing is demoted behind an
 * explicit "Advanced: paste a custom URL" disclosure; it is no
 * longer the front-door interaction.
 *
 * When `searchAssets` is not provided, the field falls back to the
 * URL-first acquisition affordance so unwired callsites (tests,
 * storybook) still function. Production SPFx mounts always supply
 * a real search function.
 *
 * Persistence is unchanged: the component remains a controlled
 * facade over the same `imageUrl`, `altText`, `caption` string
 * fields the existing article row already persists.
 */

import * as React from 'react';
import { AssetLibraryBrowser } from './AssetLibraryBrowser.js';
import type {
  AssetLibrarySearchFn,
  AssetLookupEntry,
} from './assetLibrarySource.js';
import { PublisherButton } from './PublisherButton.js';
import styles from './imageAssetField.module.css';

export type ImageAssetRole = 'hero' | 'secondary';

export interface ImageAssetValue {
  readonly imageUrl: string;
  readonly altText: string;
  readonly caption?: string;
}

export interface ImageAssetFieldProps {
  readonly role: ImageAssetRole;
  readonly value: ImageAssetValue;
  readonly onChange: (next: ImageAssetValue) => void;
  readonly label: string;
  readonly helper?: string;
  /** Rendered when caption authoring is not part of this field (hero). */
  readonly withCaption?: boolean;
  /** Optional id hook for automation/tests. */
  readonly testId?: string;
  /**
   * Governed asset-library search function. When provided, the
   * empty state leads with "Browse library" and opens the asset
   * browser; raw URL entry is demoted behind an Advanced disclosure.
   * When omitted, the field falls back to URL-first entry (tests,
   * storybook, environments without a tenant library wired yet).
   */
  readonly searchAssets?: AssetLibrarySearchFn;
}

type PreviewState = 'idle' | 'loading' | 'ready' | 'broken';

function isLikelyHttpsUrl(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return false;
  return /^https:\/\/\S+/i.test(trimmed);
}

export function ImageAssetField({
  role,
  value,
  onChange,
  label,
  helper,
  withCaption = false,
  testId,
  searchAssets,
}: ImageAssetFieldProps): JSX.Element {
  const [browserOpen, setBrowserOpen] = React.useState(false);
  const trimmedUrl = value.imageUrl.trim();
  const hasImage = trimmedUrl.length > 0;
  const urlLooksValid = isLikelyHttpsUrl(trimmedUrl);

  const [preview, setPreview] = React.useState<PreviewState>(
    hasImage && urlLooksValid ? 'loading' : 'idle',
  );

  React.useEffect(() => {
    if (!hasImage || !urlLooksValid) {
      setPreview('idle');
      return;
    }
    setPreview('loading');
  }, [trimmedUrl, hasImage, urlLooksValid]);

  const handleUrl = (next: string) => {
    onChange({ ...value, imageUrl: next });
  };
  const handleAlt = (next: string) => {
    onChange({ ...value, altText: next });
  };
  const handleCaption = (next: string) => {
    onChange({ ...value, caption: next || undefined });
  };
  const handleRemove = () => {
    onChange({
      imageUrl: '',
      altText: '',
      caption: undefined,
    });
  };

  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const handleReplace = () => {
    // Keep alt and caption — authors rarely want to retype them when
    // they're swapping a jpg for a better crop of the same shot.
    if (searchAssets) {
      setBrowserOpen(true);
      return;
    }
    onChange({ ...value, imageUrl: '' });
    window.setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleLibrarySelect = (entry: AssetLookupEntry) => {
    onChange({
      ...value,
      imageUrl: entry.imageUrl,
      altText: value.altText || entry.suggestedAltText || '',
    });
  };

  return (
    <div
      className={`${styles.field} ${hasImage ? styles.fieldPopulated : styles.fieldEmpty}`}
      data-testid={testId}
      data-role={role}
    >
      <div className={styles.fieldHeader}>
        <span className={styles.fieldLabel}>{label}</span>
        {helper && <span className={styles.fieldHelper}>{helper}</span>}
      </div>

      {hasImage ? (
        <div className={styles.card} aria-label={`${label} — selected asset`}>
          <div className={styles.preview}>
            {urlLooksValid ? (
              <img
                src={trimmedUrl}
                alt={value.altText || `${label} preview`}
                className={styles.previewImage}
                onLoad={() => setPreview('ready')}
                onError={() => setPreview('broken')}
              />
            ) : (
              <p className={styles.previewInvalid} role="alert">
                This is not an https:// URL. Readers will not see an image.
              </p>
            )}
            {preview === 'loading' && urlLooksValid && (
              <span className={styles.previewStatus}>Loading preview…</span>
            )}
            {preview === 'broken' && (
              <p className={styles.previewBroken} role="alert">
                Preview did not load. The asset may be unreachable from the
                browser. Readers will see a broken image if this URL does not
                resolve — replace or remove before publishing.
              </p>
            )}
            <div className={styles.previewActions}>
              <button
                type="button"
                className={styles.actionButton}
                onClick={handleReplace}
              >
                Replace
              </button>
              <button
                type="button"
                className={styles.actionButtonDanger}
                onClick={handleRemove}
              >
                Remove
              </button>
            </div>
          </div>

          <div className={styles.meta}>
            <label className={styles.metaField}>
              <span className={styles.metaLabelRow}>
                <span className={styles.metaLabel}>Alt text</span>
                <span className={styles.metaRequired}>required</span>
              </span>
              <span className={styles.metaHelper}>
                Describe what is visible and why it matters — not that it is an
                image. Skip if the asset is purely decorative.
              </span>
              <textarea
                className={styles.metaTextarea}
                value={value.altText}
                placeholder="e.g. Crew raising the final steel beam at the West Palm Beach jobsite."
                onChange={(e) => handleAlt(e.target.value)}
              />
            </label>

            {withCaption && (
              <label className={styles.metaField}>
                <span className={styles.metaLabelRow}>
                  <span className={styles.metaLabel}>Caption</span>
                  <span className={styles.metaOptional}>optional</span>
                </span>
                <span className={styles.metaHelper}>
                  A short editorial line rendered under the image.
                </span>
                <input
                  className={styles.metaInput}
                  value={value.caption ?? ''}
                  placeholder="e.g. Final beam — April 2026."
                  onChange={(e) => handleCaption(e.target.value)}
                />
              </label>
            )}

            <details className={styles.urlDisclosure}>
              <summary className={styles.urlDisclosureSummary}>
                Asset URL
              </summary>
              <input
                className={styles.urlInput}
                value={value.imageUrl}
                onChange={(e) => handleUrl(e.target.value)}
                aria-label="Asset URL"
              />
            </details>
          </div>
        </div>
      ) : (
        <div className={styles.picker} aria-label={`${label} — choose an asset`}>
          <div className={styles.plate}>
            <svg
              className={styles.plateGlyph}
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <rect
                x="6"
                y="10"
                width="36"
                height="28"
                rx="3"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <circle cx="16" cy="20" r="3" fill="currentColor" />
              <path
                d="M10 34 L20 24 L28 30 L36 22 L42 28 L42 36 L6 36 Z"
                fill="currentColor"
                opacity="0.35"
              />
            </svg>
            <p className={styles.plateTitle}>Choose an image</p>
            <p className={styles.plateSub}>
              {searchAssets
                ? 'Browse the governed asset library and pick a tenant-approved image. Alt text can be drafted before or after you pick.'
                : 'Paste an https:// URL from the tenant image library or an approved CDN.'}
            </p>
            {searchAssets ? (
              <PublisherButton
                variant="primary"
                onClick={() => setBrowserOpen(true)}
              >
                Browse library
              </PublisherButton>
            ) : (
              <input
                ref={inputRef}
                className={styles.urlInputPrimary}
                value={value.imageUrl}
                placeholder="https://…"
                inputMode="url"
                onChange={(e) => handleUrl(e.target.value)}
                aria-label={`${label} source URL`}
              />
            )}
          </div>

          <label className={styles.metaField}>
            <span className={styles.metaLabelRow}>
              <span className={styles.metaLabel}>Alt text</span>
              <span className={styles.metaRequired}>required on publish</span>
            </span>
            <span className={styles.metaHelper}>
              Describe what is visible and why it matters. Alt text can be
              drafted before the image is chosen.
            </span>
            <textarea
              className={styles.metaTextarea}
              value={value.altText}
              placeholder="e.g. Crew raising the final steel beam at the West Palm Beach jobsite."
              onChange={(e) => handleAlt(e.target.value)}
            />
          </label>

          {searchAssets && (
            <details className={styles.advancedUrlDisclosure}>
              <summary className={styles.advancedUrlSummary}>
                Advanced: paste a custom URL
              </summary>
              <p className={styles.advancedUrlHint}>
                For non-library assets. Must be an https:// URL on a tenant-
                approved host.
              </p>
              <input
                ref={inputRef}
                className={styles.urlInput}
                value={value.imageUrl}
                placeholder="https://…"
                inputMode="url"
                onChange={(e) => handleUrl(e.target.value)}
                aria-label={`${label} source URL`}
              />
            </details>
          )}
        </div>
      )}

      {searchAssets && (
        <AssetLibraryBrowser
          open={browserOpen}
          searchAssets={searchAssets}
          onSelect={handleLibrarySelect}
          onRequestClose={() => setBrowserOpen(false)}
          title={`Choose a ${role === 'hero' ? 'hero' : 'secondary'} image`}
        />
      )}
    </div>
  );
}
