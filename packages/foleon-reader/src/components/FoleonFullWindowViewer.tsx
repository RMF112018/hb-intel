import * as React from 'react';
import type { FoleonOriginPolicy } from '../services/FoleonOriginPolicy.js';
import type { FoleonViewerTarget } from '../readers/FoleonViewerTypes.js';
import { FoleonIframeHost } from './FoleonIframeHost.js';
import styles from './FoleonFullWindowViewer.module.css';

// ---------------------------------------------------------------------------
// FoleonFullWindowViewer — Phase-04 Wave-01 Prompt-04A
// ---------------------------------------------------------------------------
// Internal overlay component. Rendered by `FoleonFullWindowViewerProvider`
// when an active viewer target exists. Reuses `FoleonIframeHost` to keep
// origin policy, telemetry signals, and gate semantics consistent with the
// inline iframe path. NOT exported from the package's public surface in
// Prompt 04A — only the provider + hook are public.
// ---------------------------------------------------------------------------

export interface FoleonFullWindowViewerProps {
  readonly target: FoleonViewerTarget;
  readonly originPolicy: FoleonOriginPolicy;
  readonly onClose: () => void;
  readonly onIframeLoaded?: (target: FoleonViewerTarget) => void;
  readonly onIframeError?: (target: FoleonViewerTarget) => void;
  readonly initialFocusRef?: React.MutableRefObject<HTMLElement | null>;
  readonly titleId: string;
}

export function FoleonFullWindowViewer(props: FoleonFullWindowViewerProps): React.JSX.Element {
  const {
    target,
    originPolicy,
    onClose,
    onIframeLoaded,
    onIframeError,
    initialFocusRef,
    titleId,
  } = props;
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);

  // Move focus into the dialog on mount.
  React.useEffect(() => {
    const target = initialFocusRef?.current ?? closeButtonRef.current;
    if (target && typeof target.focus === 'function') {
      target.focus();
    }
  }, [initialFocusRef]);

  // Escape closes; Tab cycles focus within the dialog (scoped trap, not permanent).
  React.useEffect(() => {
    const handler = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const overlay = overlayRef.current;
      if (!overlay) return;
      const focusable = overlay.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return (): void => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const showIframe = target.canOpen && target.viewerUrl !== undefined && target.viewerUrl.length > 0;
  const iframeTitle = target.viewerUrl
    ? `${target.title} — Foleon viewer`
    : `${target.title} — Foleon viewer (unavailable)`;

  const handleLoaded = React.useCallback((): void => {
    onIframeLoaded?.(target);
  }, [onIframeLoaded, target]);

  const handleError = React.useCallback((): void => {
    onIframeError?.(target);
  }, [onIframeError, target]);

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      data-foleon-full-window-viewer="active"
      data-foleon-viewer-lane={target.lane}
      data-foleon-viewer-source={target.source}
    >
      <header className={styles.header}>
        <div className={styles.headerInner}>
          {target.categoryLabel ? (
            <p className={styles.eyebrow}>{target.categoryLabel}</p>
          ) : null}
          <h2 id={titleId} className={styles.title}>
            {target.title}
          </h2>
          {target.publishedLabel ? (
            <p className={styles.metadata}>{target.publishedLabel}</p>
          ) : null}
        </div>
        <button
          ref={closeButtonRef}
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close Foleon viewer"
        >
          Close
        </button>
      </header>
      <div className={styles.body}>
        {showIframe ? (
          <div className={styles.iframeFrame}>
            <FoleonIframeHost
              src={target.viewerUrl!}
              title={iframeTitle}
              policy={originPolicy}
              onLoaded={handleLoaded}
              onError={handleError}
            />
          </div>
        ) : (
          <div className={styles.statePanel} role="status" aria-live="polite">
            <p className={styles.stateHeading}>
              {target.disabledReason ? formatDisabledHeading(target.disabledReason) : 'Viewer unavailable'}
            </p>
            <p className={styles.stateBody}>
              {target.disabledReason
                ? formatDisabledBody(target.disabledReason)
                : 'This Foleon document is not available in the in-line viewer.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function formatDisabledHeading(reason: string): string {
  switch (reason) {
    case 'preview-only':
      return 'Preview only';
    case 'no-embed-url':
      return 'Document not configured';
    case 'embed-not-allowed':
      return 'Embed disallowed';
    case 'requires-external-open':
      return 'Open externally';
    default:
      return 'Viewer unavailable';
  }
}

function formatDisabledBody(reason: string): string {
  switch (reason) {
    case 'preview-only':
      return 'No live Foleon document is configured for this preview. The viewer will load real content once an active edition is published.';
    case 'no-embed-url':
      return 'This record does not carry an embeddable Foleon URL. Use the published link if available.';
    case 'embed-not-allowed':
      return 'This record disallows in-line embedding by governance policy.';
    case 'requires-external-open':
      return 'This record must be opened in a new tab. Use the published link to view it.';
    default:
      return 'This Foleon document is not available in the in-line viewer.';
  }
}
