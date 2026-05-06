import type { FC } from 'react';
import styles from './PccCommandSearch.module.css';

/**
 * PccCommandSearch — Wave 15A wave-b2 / Prompt 04 posture.
 *
 * A purely informational, non-focusable preview capsule. Renders no
 * `<input>`, `<button>`, `<a>`, no `role`/`tabindex` that implies
 * activation. The visible title + helper copy carry the accessible name;
 * no `aria-label` override is added (it would silently override the
 * visible text for screen readers).
 *
 * The `variant` prop is preserved for layout-only signalling (wide vs
 * compact) and continues to drive the `data-pcc-command-search` marker
 * relied on by `PccProjectHeroBand` tests.
 */

const PREVIEW_TITLE = 'Command Search — Preview';
const PREVIEW_HELPER = 'Search and project commands are unavailable in this preview.';

export interface PccCommandSearchProps {
  variant?: 'expanded' | 'icon';
}

export const PccCommandSearch: FC<PccCommandSearchProps> = ({ variant = 'expanded' }) => (
  <div
    className={styles.previewCapsule}
    data-pcc-command-search={variant}
    data-pcc-command-search-state="preview"
  >
    <span className={styles.previewTitle}>{PREVIEW_TITLE}</span>
    <span className={styles.previewHelper}>{PREVIEW_HELPER}</span>
  </div>
);

export default PccCommandSearch;
