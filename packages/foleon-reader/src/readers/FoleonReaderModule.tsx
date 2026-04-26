import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { IFoleonRuntimeContract } from '../runtime/embeddedRuntimeContract.js';
import type { FoleonContentRecord } from '../types/foleon-content.types.js';
import type { FoleonGateReason } from '../types/foleon-runtime.types.js';
import type { FoleonPageContext } from '../types/foleon-event.types.js';
import { FoleonIframeHost } from '../components/FoleonIframeHost.js';
import { FoleonError, FoleonLoadingState } from '../components/FoleonStates.js';
import {
  resolveFoleonReaderContent,
  type FoleonReaderResolution,
} from '../services/FoleonReaderContentService.js';
import type { FoleonReaderModuleConfig } from './readerConfigs.js';
import {
  createPreviewFoleonReaderViewModel,
  createReadyFoleonReaderViewModel,
  resolveFoleonReaderLayoutKey,
} from './FoleonReaderViewModel.js';
import { getFoleonReaderLayout } from './FoleonReaderLayoutRegistry.js';

// ---------------------------------------------------------------------------
// Foleon reader orchestrator
// ---------------------------------------------------------------------------
// Owns the loading / error / blocked / preview / ready state machine,
// iframe lifecycle, gate telemetry, and mobile lazy-mount. Visual
// composition is delegated to per-lane layout components via the registry
// in `FoleonReaderLayoutRegistry`. The orchestrator passes a normalized
// `FoleonReaderViewModel` plus a pre-rendered iframe surface to the
// resolved layout component.
// ---------------------------------------------------------------------------

/**
 * Tone is preserved on the public prop surface for backward compatibility.
 * Internally the orchestrator resolves the lane's layout key from
 * `config.readerKey` via the typed mapper in `FoleonReaderViewModel.ts`,
 * which is the authoritative seam used by the registry. Tone is no longer
 * the source of layout differentiation.
 */
export type FoleonReaderTone = 'spotlight' | 'pulse' | 'leadership';

export type FoleonEmbeddedReaderStatus =
  | { readonly kind: 'loading' }
  | { readonly kind: 'preview'; readonly resolution: Extract<FoleonReaderResolution, { readonly kind: 'preview' }> }
  | { readonly kind: 'ready'; readonly resolution: Extract<FoleonReaderResolution, { readonly kind: 'ready' }> }
  | { readonly kind: 'blocked'; readonly resolution: Extract<FoleonReaderResolution, { readonly kind: 'blocked' }> }
  | { readonly kind: 'error'; readonly resolution?: Extract<FoleonReaderResolution, { readonly kind: 'error' }>; readonly message?: string };

interface FoleonReaderModuleProps {
  readonly contract: IFoleonRuntimeContract;
  readonly config: FoleonReaderModuleConfig;
  readonly tone: FoleonReaderTone;
  readonly pageContext: FoleonPageContext;
  readonly onOpenArchive: () => void;
  readonly onReaderOpen: (record: FoleonContentRecord, gateResult: FoleonGateReason, pageContext: FoleonPageContext) => void;
  readonly onReaderClose: (record: FoleonContentRecord, gateResult: FoleonGateReason, pageContext: FoleonPageContext) => void;
  readonly onEmbedError: (record: FoleonContentRecord, gateResult: FoleonGateReason, pageContext: FoleonPageContext) => void;
  readonly onGateBlocked: (gateResult: FoleonGateReason, pageContext: FoleonPageContext) => void;
  readonly onStatusChange?: (status: FoleonEmbeddedReaderStatus) => void;
}

export function FoleonReaderModule(props: FoleonReaderModuleProps): React.ReactNode {
  const {
    contract,
    config,
    onEmbedError,
    onGateBlocked,
    onOpenArchive,
    onReaderClose,
    onReaderOpen,
    onStatusChange,
    pageContext,
  } = props;
  const [state, setState] = useState<ReaderModuleState>({ kind: 'loading' });
  const [readerOpen, setReaderOpen] = useState(false);
  const isMobile = useIsMobileReader();
  const openedRef = useRef<{ readonly record: FoleonContentRecord; readonly reason: FoleonGateReason } | null>(null);
  const blockedReasonRef = useRef<FoleonGateReason | null>(null);

  useEffect(() => {
    if (!contract.siteUrl || !contract.listIds.contentRegistry) {
      setState({ kind: 'error', message: 'Foleon reader configuration is incomplete.' });
      return;
    }
    const controller = new AbortController();
    setState({ kind: 'loading' });
    setReaderOpen(false);
    blockedReasonRef.current = null;
    void (async (): Promise<void> => {
      const resolution = await resolveFoleonReaderContent({
        siteUrl: contract.siteUrl!,
        contentRegistryListId: contract.listIds.contentRegistry!,
        placementsListId: contract.listIds.placements ?? undefined,
        config,
        originPolicy: contract.originPolicy,
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      setState({ kind: 'resolved', resolution });
    })();
    return (): void => controller.abort();
  }, [contract, config]);

  useEffect(() => {
    if (!onStatusChange) return;
    if (state.kind === 'loading') {
      onStatusChange({ kind: 'loading' });
      return;
    }
    if (state.kind === 'error') {
      onStatusChange({ kind: 'error', message: state.message });
      return;
    }
    if (state.resolution.kind === 'preview') {
      onStatusChange({ kind: 'preview', resolution: state.resolution });
      return;
    }
    if (state.resolution.kind === 'ready') {
      onStatusChange({ kind: 'ready', resolution: state.resolution });
      return;
    }
    if (state.resolution.kind === 'blocked') {
      onStatusChange({ kind: 'blocked', resolution: state.resolution });
      return;
    }
    onStatusChange({
      kind: 'error',
      resolution: state.resolution,
      message: state.resolution.reason,
    });
  }, [state, onStatusChange]);

  useEffect(() => {
    if (state.kind !== 'resolved' || state.resolution.kind !== 'blocked') return;
    const reason = gateReasonFromBlocked(state.resolution.reason);
    if (blockedReasonRef.current === reason) return;
    blockedReasonRef.current = reason;
    onGateBlocked(reason, pageContext);
  }, [state, onGateBlocked, pageContext]);

  useEffect(() => () => {
    const opened = openedRef.current;
    if (!opened) return;
    onReaderClose(opened.record, opened.reason, pageContext);
    openedRef.current = null;
  }, [onReaderClose, pageContext]);

  const handleIframeLoaded = useCallback((record: FoleonContentRecord): void => {
    if (openedRef.current?.record.id === record.id) return;
    const reason: FoleonGateReason = 'ok';
    openedRef.current = { record, reason };
    onReaderOpen(record, reason, pageContext);
  }, [onReaderOpen, pageContext]);

  const handleActivateMobileReader = useCallback((): void => {
    setReaderOpen(true);
  }, []);

  const layoutKey = useMemo(() => resolveFoleonReaderLayoutKey(config), [config]);

  if (state.kind === 'loading') {
    return <FoleonLoadingState label={`Loading ${config.title} reader...`} />;
  }
  if (state.kind === 'error') {
    return <FoleonError title="Unable to load reader" description={state.message} />;
  }

  const { resolution } = state;
  if (resolution.kind === 'error') {
    return <FoleonError title="Unable to load reader" description={resolution.reason} />;
  }
  if (resolution.kind === 'blocked') {
    return (
      <FoleonError
        title="This reader is not available yet."
        description={`The selected ${config.title} record is blocked by ${resolution.reason}.`}
      />
    );
  }
  if (!layoutKey) {
    return (
      <FoleonError
        title="Unable to load reader"
        description={`No layout is registered for reader key "${config.readerKey}".`}
      />
    );
  }

  const Layout = getFoleonReaderLayout(layoutKey);

  if (resolution.kind === 'preview') {
    const previewViewModel = createPreviewFoleonReaderViewModel(config);
    return <Layout viewModel={previewViewModel} iframeSurface={null} />;
  }

  const record = resolution.record;
  const shouldMountIframe = !isMobile || readerOpen;
  const mobileGateActive = isMobile && !readerOpen;

  const readyViewModel = createReadyFoleonReaderViewModel(config, {
    resolution,
    shouldMountIframe,
    mobileGateActive,
    onActivateMobileReader: handleActivateMobileReader,
    onOpenArchive,
  });

  const iframeSurface = shouldMountIframe ? (
    <FoleonIframeHost
      src={resolution.embedUrl}
      title={readyViewModel.iframe?.title ?? `${config.title}: ${record.title}`}
      policy={contract.originPolicy}
      onLoaded={(): void => handleIframeLoaded(record)}
      onError={(): void => onEmbedError(record, 'ok', pageContext)}
    />
  ) : null;

  return <Layout viewModel={readyViewModel} iframeSurface={iframeSurface} />;
}

type ReaderModuleState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'error'; readonly message: string }
  | { readonly kind: 'resolved'; readonly resolution: FoleonReaderResolution };

type BlockedResolutionReason = Extract<FoleonReaderResolution, { readonly kind: 'blocked' }>['reason'];

function useIsMobileReader(): boolean {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 720px)').matches : false,
  );
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const query = window.matchMedia('(max-width: 720px)');
    const update = (): void => setIsMobile(query.matches);
    update();
    query.addEventListener('change', update);
    return (): void => query.removeEventListener('change', update);
  }, []);
  return isMobile;
}

function gateReasonFromBlocked(reason: BlockedResolutionReason): FoleonGateReason {
  return reason === 'reader-key-mismatch' || reason === 'content-type-mismatch' ? 'missing-record' : reason;
}
