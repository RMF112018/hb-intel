import type { FC } from 'react';
import styles from './PccCommandSearch.module.css';

/**
 * PccCommandSearch — Phase 08 Prompt 05 preview capsule.
 *
 * Premium, non-interactive preview of the future command-search capability.
 * Renders no `<input>`, `<button>`, `<a>`, no `role`/`tabindex` that implies
 * activation. The visible title + helper + cue + preview examples carry the
 * accessible name; no `aria-label` override is added. The inline SVG glyph
 * is decorative (`aria-hidden="true"`, `focusable="false"`).
 *
 * `variant` continues to drive the `data-pcc-command-search` marker relied
 * on by `PccProjectHeroBand` tests. The icon variant intentionally hides
 * the helper / cue / examples so the capsule stays compact in narrow hero
 * modes; the title plus `data-pcc-command-search-state="preview"` still
 * communicate the preview-only state.
 */

const PREVIEW_TITLE = 'Command Search — Preview';
const PREVIEW_HELPER = 'Search, HBI prompts, and project commands are preview-only in this phase.';
const PREVIEW_CUE = 'Advisory only · no decisions · no writeback';
const PREVIEW_EXAMPLES = [
  { id: 'ask-hbi', text: 'Ask HBI for project context' },
  { id: 'find-records', text: 'Find project records' },
  { id: 'review-blockers', text: 'Review blocking signals' },
] as const;

export interface PccCommandSearchProps {
  variant?: 'expanded' | 'icon';
}

export const PccCommandSearch: FC<PccCommandSearchProps> = ({ variant = 'expanded' }) => (
  <div
    className={styles.previewCapsule}
    data-pcc-command-search={variant}
    data-pcc-command-search-state="preview"
  >
    <span className={styles.previewGlyph} data-pcc-command-search-glyph="" aria-hidden="true">
      <svg width="14" height="14" viewBox="0 0 16 16" focusable="false" aria-hidden="true">
        <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10.5 10.5 L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </span>
    <span className={styles.previewContent}>
      <span className={styles.previewTitle} data-pcc-command-search-title="">
        {PREVIEW_TITLE}
      </span>
      {variant === 'expanded' && (
        <>
          <span className={styles.previewHelper} data-pcc-command-search-helper="">
            {PREVIEW_HELPER}
          </span>
          <span className={styles.previewCue} data-pcc-command-search-cue="">
            {PREVIEW_CUE}
          </span>
          <span className={styles.previewExamples} data-pcc-command-search-examples="">
            {PREVIEW_EXAMPLES.map(({ id, text }) => (
              <span key={id} className={styles.previewExample} data-pcc-command-search-example={id}>
                {text}
              </span>
            ))}
          </span>
        </>
      )}
    </span>
  </div>
);

export default PccCommandSearch;
