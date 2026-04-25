import { useCallback, useEffect, useRef, useState } from 'react';
import { HbcButton } from '@hbc/ui-kit/homepage';
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
import { FoleonReaderPreview } from './FoleonReaderPreview.js';
import styles from './FoleonReaderModule.module.css';

interface FoleonReaderModuleProps {
  readonly contract: IFoleonRuntimeContract;
  readonly config: FoleonReaderModuleConfig;
  readonly tone: 'spotlight' | 'pulse';
  readonly pageContext: FoleonPageContext;
  readonly onOpenArchive: () => void;
  readonly onReaderOpen: (record: FoleonContentRecord, gateResult: FoleonGateReason, pageContext: FoleonPageContext) => void;
  readonly onReaderClose: (record: FoleonContentRecord, gateResult: FoleonGateReason, pageContext: FoleonPageContext) => void;
  readonly onEmbedError: (record: FoleonContentRecord, gateResult: FoleonGateReason, pageContext: FoleonPageContext) => void;
  readonly onGateBlocked: (gateResult: FoleonGateReason, pageContext: FoleonPageContext) => void;
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
    pageContext,
    tone,
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
  if (resolution.kind === 'preview') {
    return (
      <FoleonReaderPreview
        config={config}
        tone={tone}
      />
    );
  }
  if (resolution.kind === 'blocked') {
    return (
      <FoleonError
        title="This reader is not available yet."
        description={`The selected ${config.title} record is blocked by ${resolution.reason}.`}
      />
    );
  }

  const record = resolution.record;
  const shouldMountIframe = !isMobile || readerOpen;
  const monthlyLabel = tone === 'spotlight'
    ? formatDate(record.issueDate ?? record.publishedOn) ?? 'Monthly edition'
    : formatDate(record.lastEditorialUpdate ?? record.publishedOn) ?? 'Latest update';
  const shellClass = `${styles.shell} ${tone === 'spotlight' ? styles.spotlight : styles.pulse}`;

  return (
    <section className={shellClass} aria-labelledby={`${config.readerKey}-reader-title`}>
      <div className={styles.chrome}>
        <header className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>
              {tone === 'spotlight' ? 'Project Spotlight Reader' : 'Company Pulse Reader'}
            </p>
            <h2 className={styles.title} id={`${config.readerKey}-reader-title`}>{record.title}</h2>
            {record.summary ? <p className={styles.summary}>{record.summary}</p> : null}
            <div className={styles.actions}>
              {isMobile && !readerOpen ? (
                <HbcButton onClick={(): void => setReaderOpen(true)}>Open reader</HbcButton>
              ) : null}
              <HbcButton variant="secondary" onClick={onOpenArchive}>
                Open full archive
              </HbcButton>
              <span className={styles.archiveNote}>Lane archive filtering comes in a later workflow.</span>
            </div>
          </div>
          <aside className={styles.rail} aria-label={`${config.title} metadata`}>
            <div>
              <p className={styles.railLabel}>{tone === 'spotlight' ? 'Monthly status' : 'Latest update'}</p>
              <p className={styles.railValue}>{monthlyLabel}</p>
            </div>
            <div>
              <p className={styles.railLabel}>Audience</p>
              <p className={styles.railValue}>{record.primaryAudience ?? 'Companywide'}</p>
            </div>
            <div>
              <p className={styles.railLabel}>Archive group</p>
              <p className={styles.railValue}>{record.archiveGroup ?? 'Archive coming soon'}</p>
            </div>
          </aside>
        </header>
        {resolution.warnings.length > 0 ? (
          <p className={styles.warning}>Reader resolved with admin warnings for the Manager workflow.</p>
        ) : null}
        {isMobile && !readerOpen ? (
          <div className={styles.mobileCard} aria-label={`${config.title} collapsed mobile reader`}>
            <p className={styles.railLabel}>Reader ready</p>
            <p className={styles.railValue}>Open the publication when you are ready to load the Foleon iframe.</p>
          </div>
        ) : null}
        <div className={styles.readerStage} data-open={shouldMountIframe ? 'true' : 'false'}>
          {shouldMountIframe ? (
            <div className={styles.frameWrap}>
              <FoleonIframeHost
                src={resolution.embedUrl}
                title={`${config.title}: ${record.title}`}
                policy={contract.originPolicy}
                onLoaded={(): void => handleIframeLoaded(record)}
                onError={(): void => onEmbedError(record, 'ok', pageContext)}
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
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

function formatDate(raw: string | undefined): string | null {
  if (!raw) return null;
  const parsed = Date.parse(raw);
  if (Number.isNaN(parsed)) return null;
  return new Date(parsed).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function gateReasonFromBlocked(reason: BlockedResolutionReason): FoleonGateReason {
  return reason === 'reader-key-mismatch' || reason === 'content-type-mismatch' ? 'missing-record' : reason;
}
