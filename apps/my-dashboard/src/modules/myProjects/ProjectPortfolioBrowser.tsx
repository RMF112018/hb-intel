import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  FloatingFocusManager,
  FloatingOverlay,
  FloatingPortal,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import type { MyProjectLinkItem } from '@hbc/models/myWork';
import type { MyWorkResponsiveMode } from '../../layout/useMyWorkContainerBreakpoint.js';
import { MY_WORK_THEME_VARS } from '../../shell/myWorkTheme.js';
import { ProjectPortfolioTile } from './ProjectPortfolioTile.js';
import {
  filterMyProjectsByQuery,
  sortMyProjectsForDisplay,
} from './myProjectPortfolioPresentation.js';
import styles from './ProjectPortfolioBrowser.module.css';

export interface ProjectPortfolioBrowserProps {
  readonly items: readonly MyProjectLinkItem[];
  readonly mode: MyWorkResponsiveMode;
  readonly isOpen: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

type BrowserPosture = 'drawer' | 'sheet';

function resolveBrowserPosture(mode: MyWorkResponsiveMode): BrowserPosture {
  return mode === 'phone' || mode === 'tabletPortrait' ? 'sheet' : 'drawer';
}

export function ProjectPortfolioBrowser({
  items,
  mode,
  isOpen,
  onOpenChange,
}: ProjectPortfolioBrowserProps) {
  const titleId = useId();
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [rawQuery, setRawQuery] = useState('');
  const [openTileKey, setOpenTileKey] = useState<string | null>(null);

  const { refs, context } = useFloating({
    open: isOpen,
    onOpenChange,
  });

  const dismiss = useDismiss(context, { escapeKey: true, outsidePress: true });
  const role = useRole(context, { role: 'dialog' });
  const { getFloatingProps } = useInteractions([dismiss, role]);

  useEffect(() => {
    if (isOpen) {
      setRawQuery('');
      setOpenTileKey(null);
    }
  }, [isOpen]);

  const previousFocusRef = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      searchInputRef.current?.focus();
      return () => {
        const restore = previousFocusRef.current;
        previousFocusRef.current = null;
        if (restore && typeof restore.focus === 'function') {
          restore.focus();
        }
      };
    }
    return undefined;
  }, [isOpen]);

  const sortedItems = useMemo(() => sortMyProjectsForDisplay(items), [items]);
  const results = useMemo(
    () => filterMyProjectsByQuery(sortedItems, rawQuery),
    [sortedItems, rawQuery],
  );

  if (!isOpen) return null;

  const posture = resolveBrowserPosture(mode);

  return (
    <FloatingPortal>
      <FloatingOverlay className={styles.overlay} lockScroll data-my-projects-browser-overlay="">
        <FloatingFocusManager context={context} modal initialFocus={0}>
          <div
            ref={refs.setFloating}
            className={styles.panel}
            style={MY_WORK_THEME_VARS}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            data-my-projects-portfolio-browser=""
            data-my-projects-browser-posture={posture}
            data-my-work-themed-portal="portfolio-browser"
            {...getFloatingProps()}
          >
            <header className={styles.header}>
              <div className={styles.headerEyebrowRow}>
                <span className={styles.headerEyebrow}>Portfolio Browser</span>
                <span className={styles.headerRule} aria-hidden="true" />
                <span className={styles.headerCadence}>
                  {results.length} {results.length === 1 ? 'result' : 'results'}
                </span>
              </div>
              <h2 id={titleId} className={styles.title}>
                All My Projects
              </h2>
              <input
                ref={searchInputRef}
                type="search"
                className={styles.search}
                placeholder="Search by project name or number"
                value={rawQuery}
                onChange={(event) => setRawQuery(event.target.value)}
                aria-label="Search by project name or number"
                data-my-projects-portfolio-search=""
              />
              {/* Close button rendered LAST in header DOM order so the search input
                  remains the first focusable element inside the dialog (test
                  contract: ProjectPortfolioBrowser.test.tsx surfaces-the-search
                  -input-as-the-first-focusable-element). Positioned visually at
                  the top-right of the header via absolute positioning in CSS. */}
              <button
                type="button"
                className={styles.close}
                onClick={() => onOpenChange(false)}
                aria-label="Close All My Projects"
                data-my-projects-browser-close=""
              >
                Close
              </button>
            </header>
            <div className={styles.body}>
              {results.length > 0 ? (
                <div className={styles.grid} data-my-projects-browser-grid="">
                  {results.map((row) => (
                    <ProjectPortfolioTile
                      key={row.recordKey}
                      row={row}
                      isOpen={openTileKey === row.recordKey}
                      onOpenChange={(open) => setOpenTileKey(open ? row.recordKey : null)}
                    />
                  ))}
                </div>
              ) : (
                <p className={styles.empty} data-my-projects-search-empty="" role="status">
                  No projects match your search.
                </p>
              )}
            </div>
          </div>
        </FloatingFocusManager>
      </FloatingOverlay>
    </FloatingPortal>
  );
}

export default ProjectPortfolioBrowser;
