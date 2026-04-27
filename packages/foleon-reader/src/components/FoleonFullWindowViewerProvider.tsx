import * as React from 'react';
import { createPortal } from 'react-dom';
import type { FoleonOriginPolicy } from '../services/FoleonOriginPolicy.js';
import type {
  FoleonViewerOpenResult,
  FoleonViewerTarget,
} from '../readers/FoleonViewerTypes.js';
import { FoleonFullWindowViewer } from './FoleonFullWindowViewer.js';

// ---------------------------------------------------------------------------
// FoleonFullWindowViewerProvider — Phase-04 Wave-01 Prompt-04A
// ---------------------------------------------------------------------------
// Lane-scoped Context provider. `FoleonReaderModule` wraps its render with
// this provider so the lane-owned layout components (Project Spotlight,
// Company Pulse, Leadership Message) can call `useFoleonFullWindowViewer()`
// and invoke `openViewer(target, launchElement?)` from any article card.
//
// Scope is lane-scoped because each `FoleonReaderModule` instance creates
// its own provider. Three lanes on the homepage = three independent
// providers, three independent viewer states. Documented in
// 04A_FULL_WINDOW_VIEWER_CONTRACT_REPORT.md.
//
// Telemetry events emitted by this provider are DISTINCT from inline
// iframe lifecycle events:
//   - `onViewerOpen(target)`         — viewer opened
//   - `onViewerIframeLoaded(target)` — iframe inside the viewer loaded
//   - `onViewerIframeError(target)`  — iframe inside the viewer errored
//   - `onViewerClose(target)`        — viewer closed
// They do not duplicate the inline `onReaderOpen` / `onReaderClose` /
// `onEmbedError` lifecycle.
// ---------------------------------------------------------------------------

export interface FoleonFullWindowViewerContextValue {
  readonly currentTarget: FoleonViewerTarget | null;
  readonly openViewer: (
    target: FoleonViewerTarget,
    launchElement?: HTMLElement | null,
  ) => FoleonViewerOpenResult;
  readonly closeViewer: () => void;
}

const NOOP_CONTEXT: FoleonFullWindowViewerContextValue = {
  currentTarget: null,
  openViewer: (target) => {
    // Default (no provider) — refusal is structured, not silent.
    return { opened: false, reason: target.disabledReason ?? 'unknown' };
  },
  closeViewer: () => undefined,
};

const FoleonFullWindowViewerContext =
  React.createContext<FoleonFullWindowViewerContextValue>(NOOP_CONTEXT);

/**
 * Public hook for lane layouts. Returns `{ currentTarget, openViewer, closeViewer }`.
 * `openViewer` returns a `FoleonViewerOpenResult` — disabled targets are
 * NEVER a silent no-op; the caller receives the disabled reason.
 */
export function useFoleonFullWindowViewer(): FoleonFullWindowViewerContextValue {
  return React.useContext(FoleonFullWindowViewerContext);
}

export interface FoleonFullWindowViewerProviderProps {
  readonly originPolicy: FoleonOriginPolicy;
  readonly onViewerOpen?: (target: FoleonViewerTarget) => void;
  readonly onViewerClose?: (target: FoleonViewerTarget) => void;
  readonly onViewerIframeLoaded?: (target: FoleonViewerTarget) => void;
  readonly onViewerIframeError?: (target: FoleonViewerTarget) => void;
  readonly children: React.ReactNode;
}

export function FoleonFullWindowViewerProvider(
  props: FoleonFullWindowViewerProviderProps,
): React.JSX.Element {
  const { originPolicy, onViewerOpen, onViewerClose, onViewerIframeLoaded, onViewerIframeError, children } = props;
  const [currentTarget, setCurrentTarget] = React.useState<FoleonViewerTarget | null>(null);
  const launchElementRef = React.useRef<HTMLElement | null>(null);
  const titleId = React.useId();

  const openViewer = React.useCallback<FoleonFullWindowViewerContextValue['openViewer']>(
    (target, launchElement) => {
      if (!target.canOpen) {
        return { opened: false, reason: target.disabledReason ?? 'unknown' };
      }
      launchElementRef.current = launchElement ?? null;
      setCurrentTarget(target);
      onViewerOpen?.(target);
      return { opened: true, target };
    },
    [onViewerOpen],
  );

  const closeViewer = React.useCallback((): void => {
    setCurrentTarget((prev) => {
      if (prev) onViewerClose?.(prev);
      return null;
    });
    // Restore focus to the launch element on close.
    const launch = launchElementRef.current;
    if (launch && typeof launch.focus === 'function') {
      // Defer to give React a chance to remove the dialog first.
      queueMicrotask(() => launch.focus());
    }
    launchElementRef.current = null;
  }, [onViewerClose]);

  const value = React.useMemo<FoleonFullWindowViewerContextValue>(
    () => ({ currentTarget, openViewer, closeViewer }),
    [currentTarget, openViewer, closeViewer],
  );
  const activeViewer = currentTarget ? (
    <FoleonFullWindowViewer
      target={currentTarget}
      originPolicy={originPolicy}
      onClose={closeViewer}
      onIframeLoaded={onViewerIframeLoaded}
      onIframeError={onViewerIframeError}
      titleId={titleId}
    />
  ) : null;
  const portalTarget = typeof document !== 'undefined' && document.body
    ? document.body
    : null;

  return (
    <FoleonFullWindowViewerContext.Provider value={value}>
      {children}
      {activeViewer && portalTarget ? createPortal(activeViewer, portalTarget) : activeViewer}
    </FoleonFullWindowViewerContext.Provider>
  );
}
