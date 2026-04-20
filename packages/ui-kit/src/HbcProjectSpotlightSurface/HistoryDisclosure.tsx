/**
 * HistoryDisclosure — governed "past spotlights" reveal.
 *
 * Wraps `SupportingRail` in an explicit disclosure so compact and
 * minimal modes can keep history collapsed by default. Never
 * hover-gated; the control is keyboard- and touch-safe and honors the
 * layout-mode visibility matrix via `openByDefault`.
 */
import * as React from 'react';
import { clsx } from 'clsx';
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
  openByDefault: boolean;
  mode: SpotlightLayoutMode;
}

export function HistoryDisclosure({
  items,
  label,
  allProjectsLabel,
  allProjectsUrl,
  reducedMotion,
  openByDefault,
  mode,
}: HistoryDisclosureProps): React.JSX.Element {
  const panelId = React.useId();
  const [open, setOpen] = React.useState(openByDefault);
  React.useEffect(() => {
    setOpen(openByDefault);
  }, [openByDefault, mode]);

  const closedLabel = `Show past spotlights (${items.length})`;
  const openLabel = 'Hide past spotlights';

  return (
    <div className={styles.history} data-history-open={open ? 'true' : 'false'}>
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
          ▾
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
            items={items}
            label={label}
            allProjectsLabel={allProjectsLabel}
            allProjectsUrl={allProjectsUrl}
            reducedMotion={reducedMotion}
          />
        ) : null}
      </div>
    </div>
  );
}
