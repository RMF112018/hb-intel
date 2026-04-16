/**
 * AssetLibraryBrowser — governed tenant-safe image selection modal.
 *
 * The primary acquisition interaction for hero + secondary image
 * authoring. Presents a search-first thumbnail grid over whatever
 * `AssetLibrarySearchFn` the host wires in (SharePoint SiteAssets,
 * a curated HBCentral Images list, or any other bounded source).
 *
 * Phase-17 wave-02 prompt-02 rebuild: the hand-rolled backdrop /
 * focus-trap / escape-key handling has been replaced by the governed
 * `@floating-ui/react` modal stack (FloatingPortal + FloatingOverlay
 * + FloatingFocusManager) so dismiss semantics, focus return, and
 * stacking are consistent with the rest of the Publisher overlay
 * system. Open/close choreography is supplied by `motion/react` with
 * a restrained fade + lift so the modal reads as a deliberate product
 * surface without becoming theatrical.
 *
 * Keyboard: native <input type="search"> for the query; arrow keys
 * move focus across result tiles; Enter commits; Escape dismisses via
 * floating-ui's dismiss layer. The dialog is rendered with
 * `role="dialog"`, `aria-modal`, and the focus trap is anchored to the
 * search input on open.
 */

import * as React from 'react';
import {
  FloatingFocusManager,
  FloatingOverlay,
  FloatingPortal,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import { AnimatePresence, motion } from 'motion/react';
import type {
  AssetLibrarySearchFn,
  AssetLookupEntry,
} from './assetLibrarySource.js';
import { PublisherButton } from './PublisherButton.js';
import { PublisherScrollArea } from './PublisherScrollArea.js';
import styles from './assetLibraryBrowser.module.css';

export interface AssetLibraryBrowserProps {
  readonly open: boolean;
  readonly onSelect: (entry: AssetLookupEntry) => void;
  readonly onRequestClose: () => void;
  readonly searchAssets: AssetLibrarySearchFn;
  readonly title?: string;
}

const DEBOUNCE_MS = 250;

export function AssetLibraryBrowser({
  open,
  onSelect,
  onRequestClose,
  searchAssets,
  title = 'Choose an image',
}: AssetLibraryBrowserProps): JSX.Element | null {
  const [query, setQuery] = React.useState('');
  const [entries, setEntries] = React.useState<AssetLookupEntry[]>([]);
  const [status, setStatus] = React.useState<
    'idle' | 'loading' | 'ready' | 'error'
  >('idle');
  const [error, setError] = React.useState<string | undefined>();
  const [activeIndex, setActiveIndex] = React.useState(0);

  const searchRef = React.useRef<HTMLInputElement | null>(null);
  const tileRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

  const { refs, context } = useFloating({
    open,
    onOpenChange: (next) => {
      if (!next) onRequestClose();
    },
  });
  const dismiss = useDismiss(context, {
    outsidePressEvent: 'mousedown',
    escapeKey: true,
  });
  const role = useRole(context, { role: 'dialog' });
  const { getFloatingProps } = useInteractions([dismiss, role]);

  React.useEffect(() => {
    if (open) {
      setQuery('');
      setEntries([]);
      setStatus('idle');
      setActiveIndex(0);
    }
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setStatus('loading');
    setError(undefined);
    const handle = window.setTimeout(async () => {
      try {
        const next = await searchAssets(query.trim(), controller.signal);
        if (controller.signal.aborted) return;
        setEntries(next);
        setActiveIndex(0);
        setStatus('ready');
      } catch (err) {
        if (controller.signal.aborted) return;
        setEntries([]);
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Asset lookup failed');
      }
    }, DEBOUNCE_MS);
    return () => {
      controller.abort();
      window.clearTimeout(handle);
    };
  }, [query, searchAssets, open]);

  const commit = (entry: AssetLookupEntry) => {
    onSelect(entry);
    onRequestClose();
  };

  const moveFocus = (next: number) => {
    if (entries.length === 0) return;
    const clamped = (next + entries.length) % entries.length;
    setActiveIndex(clamped);
    window.setTimeout(() => tileRefs.current[clamped]?.focus(), 0);
  };

  const handleGridKey = (ev: React.KeyboardEvent<HTMLDivElement>) => {
    switch (ev.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        ev.preventDefault();
        moveFocus(activeIndex + 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        ev.preventDefault();
        moveFocus(activeIndex - 1);
        break;
      case 'Home':
        ev.preventDefault();
        moveFocus(0);
        break;
      case 'End':
        ev.preventDefault();
        moveFocus(entries.length - 1);
        break;
      default:
        break;
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <FloatingPortal>
          <FloatingOverlay
            lockScroll
            className={styles.overlay}
            data-testid="asset-library-overlay"
          >
            <motion.div
              className={styles.backdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.14, ease: 'easeOut' }}
            />
            <FloatingFocusManager
              context={context}
              initialFocus={searchRef}
              returnFocus
              modal
            >
              <motion.div
                ref={refs.setFloating}
                {...getFloatingProps({
                  className: styles.dialog,
                  'aria-label': title,
                })}
                role="dialog"
                aria-modal="true"
                initial={{ opacity: 0, scale: 0.97, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 6 }}
                transition={{ type: 'tween', duration: 0.16, ease: 'easeOut' }}
              >
                <header className={styles.header}>
                  <div>
                    <p className={styles.kicker}>Asset library</p>
                    <h2 className={styles.title}>{title}</h2>
                  </div>
                  <PublisherButton
                    size="sm"
                    onClick={onRequestClose}
                    aria-label="Close asset library"
                  >
                    Close
                  </PublisherButton>
                </header>

                <label className={styles.searchField}>
                  <span className={styles.searchLabel}>Search</span>
                  <input
                    ref={searchRef}
                    type="search"
                    className={styles.searchInput}
                    value={query}
                    placeholder="Search by title, subject, or project…"
                    onChange={(ev) => setQuery(ev.target.value)}
                    aria-label="Search the asset library"
                  />
                </label>

                <div className={styles.statusRow} aria-live="polite">
                  {status === 'loading' && (
                    <>
                      <span className={styles.spinner} aria-hidden="true" />
                      <span>Searching assets…</span>
                    </>
                  )}
                  {status === 'ready' && (
                    <span>
                      {entries.length === 0
                        ? query.trim()
                          ? `No assets match “${query.trim()}”. Try a different query.`
                          : 'Browse recent assets or narrow the results with a search.'
                        : entries.length === 1
                          ? '1 asset available.'
                          : `${entries.length} assets available.`}
                    </span>
                  )}
                  {status === 'error' && (
                    <span className={styles.error} role="alert">
                      Asset lookup is temporarily unavailable.
                      {error ? (
                        <span className={styles.errorDetail}> ({error})</span>
                      ) : null}
                    </span>
                  )}
                </div>

                {status === 'ready' && entries.length > 0 && (
                  <PublisherScrollArea
                    className={styles.gridScroll}
                    orientation="vertical"
                  >
                    <div
                      className={styles.grid}
                      role="listbox"
                      aria-label="Asset results"
                      onKeyDown={handleGridKey}
                    >
                      {entries.map((entry, index) => (
                        <button
                          key={entry.assetId}
                          ref={(el) => {
                            tileRefs.current[index] = el;
                          }}
                          type="button"
                          role="option"
                          aria-selected={index === activeIndex}
                          className={
                            index === activeIndex
                              ? `${styles.tile} ${styles.tileActive}`
                              : styles.tile
                          }
                          tabIndex={index === activeIndex ? 0 : -1}
                          onFocus={() => setActiveIndex(index)}
                          onClick={() => commit(entry)}
                        >
                          <span className={styles.thumb}>
                            <img
                              src={entry.imageUrl}
                              alt=""
                              className={styles.thumbImg}
                              loading="lazy"
                            />
                          </span>
                          <span className={styles.tileName}>{entry.title}</span>
                          {entry.source && (
                            <span className={styles.tileSource}>{entry.source}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </PublisherScrollArea>
                )}
              </motion.div>
            </FloatingFocusManager>
          </FloatingOverlay>
        </FloatingPortal>
      )}
    </AnimatePresence>
  );
}
