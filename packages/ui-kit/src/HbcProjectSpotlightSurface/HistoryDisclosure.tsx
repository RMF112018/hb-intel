/**
 * HistoryDisclosure — authored "past spotlights" section.
 *
 * The preview rail is always rendered so portfolio depth is visible at
 * first paint in every mode (doctrine: empty state and weak history
 * were prior hard-stop failures). The disclosure toggle reveals the
 * overflow rail (remaining items beyond `previewCount`) only when
 * overflow exists.
 *
 * Never hover-gated; the disclosure control is keyboard- and touch-safe
 * and honors the layout-mode visibility matrix via `previewCount` and
 * `openByDefault`.
 */
import * as React from 'react';
import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';
import type { ProjectSpotlightRailItem } from './types.js';
import type { SpotlightLayoutMode } from './layout-mode.js';
import { SupportingRail } from './SupportingRail.js';
import styles from './project-spotlight-surface.module.css';

export interface HistoryDisclosureProps {
  items: ProjectSpotlightRailItem[];
  label: string;
  allProjectsLabel?: string;
  allProjectsUrl?: string;
  reducedMotion: boolean;
  /**
   * Initial posture for the overflow disclosure (not the preview — the
   * preview is always rendered). Wide/medium keep the initial posture
   * closed so the featured project retains primary status; users can
   * still expand the overflow for the full history.
   */
  openByDefault: boolean;
  mode: SpotlightLayoutMode;
  /**
   * Number of tiles rendered in the always-visible preview rail. Items
   * beyond this count move into the disclosure-gated overflow rail.
   * Sourced from `SpotlightLayoutVisibility.railPreviewCount`.
   */
  previewCount: number;
  showFooterCta?: boolean;
}

export function HistoryDisclosure({
  items,
  label,
  allProjectsLabel,
  allProjectsUrl,
  reducedMotion,
  openByDefault,
  mode,
  previewCount,
  showFooterCta = true,
}: HistoryDisclosureProps): React.JSX.Element {
  const panelId = React.useId();
  const [open, setOpen] = React.useState(openByDefault);
  React.useEffect(() => {
    setOpen(openByDefault);
  }, [openByDefault, mode]);

  const safePreview = Math.max(0, Math.min(previewCount, items.length));
  const previewItems = items.slice(0, safePreview);
  const overflowItems = items.slice(safePreview);
  const hasOverflow = overflowItems.length > 0;

  const showSectionHeader = mode !== 'minimal';
  const closedLabel = `Show ${overflowItems.length} more`;
  const openLabel = 'Hide full history';

  // Footer CTA renders on the preview when no overflow exists (so the
  // "View all projects" action is reachable without expansion) and on
  // the overflow rail when overflow exists and is open. Preserves the
  // modeFurniture invariant: exactly one rail-footer CTA per mode.
  const previewShowsFooterCta = showFooterCta && !hasOverflow;
  const overflowShowsFooterCta = showFooterCta && hasOverflow;

  return (
    <div
      className={styles.history}
      data-history-open={open ? 'true' : 'false'}
      data-history-mode={mode}
      data-history-has-overflow={hasOverflow ? 'true' : 'false'}
    >
      {showSectionHeader ? (
        <div className={styles.historyHeader}>
          <span className={styles.historyEyebrow}>Previously spotlighted</span>
          <span className={styles.historyCount} aria-hidden="true">
            {items.length}
          </span>
        </div>
      ) : null}

      {previewItems.length > 0 ? (
        <SupportingRail
          items={previewItems}
          label={label}
          allProjectsLabel={allProjectsLabel}
          allProjectsUrl={allProjectsUrl}
          reducedMotion={reducedMotion}
          showFooterCta={previewShowsFooterCta}
          showRailHeader={false}
          variant="preview"
        />
      ) : null}

      {hasOverflow ? (
        <>
          <button
            type="button"
            className={styles.historyDisclosure}
            onClick={() => setOpen((prev) => !prev)}
            aria-expanded={open}
            aria-controls={panelId}
          >
            <span className={styles.historyDisclosureLabel}>
              {open ? openLabel : closedLabel}
            </span>
            <span
              className={clsx(
                styles.historyDisclosureChevron,
                open && styles.historyDisclosureChevronOpen,
              )}
              aria-hidden="true"
            >
              <ChevronDown size={14} strokeWidth={2.25} />
            </span>
          </button>
          <div
            id={panelId}
            className={styles.historyPanel}
            hidden={!open}
            role="region"
            aria-label={label}
          >
            {open ? (
              <SupportingRail
                items={overflowItems}
                label={label}
                allProjectsLabel={allProjectsLabel}
                allProjectsUrl={allProjectsUrl}
                reducedMotion={reducedMotion}
                showFooterCta={overflowShowsFooterCta}
                showRailHeader={false}
                variant="overflow"
              />
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
