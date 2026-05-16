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
      <FloatingOverlay
        className={styles.overlay}
        lockScroll
        data-my-projects-browser-overlay=""
      >
        <FloatingFocusManager context={context} modal initialFocus={0}>
          <div
            ref={refs.setFloating}
            className={styles.panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            data-my-projects-portfolio-browser=""
            data-my-projects-browser-posture={posture}
            {...getFloatingProps()}
          >
            <header className={styles.header}>
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
                      onOpenChange={(open) =>
                        setOpenTileKey(open ? row.recordKey : null)
                      }
                    />
                  ))}
                </div>
              ) : (
                <p
                  className={styles.empty}
                  data-my-projects-search-empty=""
                  role="status"
                >
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
