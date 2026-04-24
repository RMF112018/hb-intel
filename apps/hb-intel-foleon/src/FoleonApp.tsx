import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { HbcThemeProvider } from '@hbc/ui-kit/homepage';
import type { FoleonContentRecord } from './types/foleon-content.types.js';
import type { FoleonTelemetryEmitInput } from './types/foleon-event.types.js';
import type { IFoleonRuntimeContract, FoleonRoute } from './runtime/foleonRuntimeContract.js';
import {
  createFoleonTelemetryEmitter,
  type FoleonTelemetryEmitter,
} from './services/FoleonTelemetryEmitter.js';
import {
  createNoopEventSink,
  createSharePointEventSink,
  type FoleonEventSink,
} from './services/FoleonEventSink.js';
import { FOLEON_PACKAGE_VERSION, FOLEON_WEBPART_ID } from './webparts/foleon/runtimeContract.js';
import { HighlightsPage } from './pages/HighlightsPage.js';
import { ReaderPage } from './pages/ReaderPage.js';
import { ContentHubPage } from './pages/ContentHubPage.js';
import { FoleonError } from './components/FoleonStates.js';

interface FoleonAppProps {
  readonly contract: IFoleonRuntimeContract;
  /**
   * Optional emitter override — primarily used by tests to inject a
   * captured sink. Production callers let the app build its own
   * emitter from the contract.
   */
  readonly emitter?: FoleonTelemetryEmitter;
}

interface AppNavState {
  readonly route: FoleonRoute;
  readonly docId: number | null;
}

export function FoleonApp(props: FoleonAppProps): React.ReactNode {
  const { contract } = props;
  const initialNav = useMemo<AppNavState>(
    () => readNavFromLocation(contract),
    [contract],
  );
  const [nav, setNav] = useState<AppNavState>(initialNav);
  const navRef = useRef(nav);
  useEffect(() => {
    navRef.current = nav;
  }, [nav]);

  const emitter = useMemo<FoleonTelemetryEmitter>(() => {
    if (props.emitter) return props.emitter;
    const sink = selectSink(contract);
    return createFoleonTelemetryEmitter({
      sink,
      correlationId: contract.telemetry.correlationId,
      sessionId: contract.telemetry.sessionId,
      packageVersion: FOLEON_PACKAGE_VERSION,
      manifestId: FOLEON_WEBPART_ID,
      getRoute: () => navRef.current.route,
    });
  }, [contract, props.emitter]);

  useEffect(() => {
    const handlePopState = (): void => setNav(readNavFromLocation(contract));
    window.addEventListener('popstate', handlePopState);
    return (): void => window.removeEventListener('popstate', handlePopState);
  }, [contract]);

  const goto = useCallback((next: AppNavState): void => {
    setNav(next);
    const url = new URL(window.location.href);
    url.searchParams.set('foleonRoute', next.route);
    if (next.route === 'reader' && next.docId !== null) {
      url.searchParams.set('docId', String(next.docId));
    } else {
      url.searchParams.delete('docId');
    }
    window.history.pushState({}, '', url.toString());
  }, []);

  const openReader = useCallback(
    (record: FoleonContentRecord): void => {
      emitter.emit('Card Click', {
        foleonDocId: record.foleonDocId,
        contentRegistryItemId: record.id,
      });
      if (contract.readerRoutePath) {
        const target = new URL(contract.readerRoutePath, window.location.origin);
        target.searchParams.set('docId', String(record.foleonDocId));
        window.location.assign(target.toString());
        return;
      }
      goto({ route: 'reader', docId: record.foleonDocId });
    },
    [contract.readerRoutePath, goto, emitter],
  );

  const openExternal = useCallback(
    (record: FoleonContentRecord): void => {
      emitter.emit('External Open', {
        foleonDocId: record.foleonDocId,
        contentRegistryItemId: record.id,
      });
      if (record.publishedUrl) {
        window.open(record.publishedUrl, '_blank', 'noopener,noreferrer');
      }
    },
    [emitter],
  );

  const onCardImpression = useCallback(
    (records: ReadonlyArray<FoleonContentRecord>): void => {
      for (const record of records) {
        emitter.emit('Card Impression', {
          foleonDocId: record.foleonDocId,
          contentRegistryItemId: record.id,
        });
      }
    },
    [emitter],
  );

  if (!contract.canInitialize) {
    const diagnosticsOn =
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('foleon-diagnostics') === '1';
    const adminDetail = diagnosticsOn
      ? contract.issues
          .filter((issue) => issue.scope === 'admin')
          .map((issue) => `${issue.code}: ${issue.adminLabel}`)
          .join(' ')
      : undefined;
    return (
      <HbcThemeProvider forceTheme="light">
        <FoleonError
          title="Foleon integration is not available right now."
          description={
            adminDetail ??
            'Foleon integration is not fully configured. Contact an HB Central admin.'
          }
        />
      </HbcThemeProvider>
    );
  }

  const page = renderPage({
    contract,
    nav,
    openReader,
    openExternal,
    onCardImpression,
    emit: (name, partial): void => emitter.emit(name, partial),
    goto,
  });

  return (
    <HbcThemeProvider forceTheme="light">
      <div data-hbc-foleon-route={nav.route}>{page}</div>
    </HbcThemeProvider>
  );
}

interface RenderPageArgs {
  readonly contract: IFoleonRuntimeContract;
  readonly nav: AppNavState;
  readonly openReader: (record: FoleonContentRecord) => void;
  readonly openExternal: (record: FoleonContentRecord) => void;
  readonly onCardImpression: (records: ReadonlyArray<FoleonContentRecord>) => void;
  readonly emit: (
    eventName: Parameters<FoleonTelemetryEmitter['emit']>[0],
    partial?: FoleonTelemetryEmitInput,
  ) => void;
  readonly goto: (next: AppNavState) => void;
}

function renderPage(args: RenderPageArgs): React.ReactNode {
  const { contract, nav, openReader, openExternal, onCardImpression, emit, goto } = args;
  if (nav.route === 'reader') {
    if (nav.docId === null) {
      return (
        <FoleonError
          title="Missing publication ID."
          description="The reader was opened without a valid docId."
          onRetry={(): void => goto({ route: 'highlights', docId: null })}
        />
      );
    }
    return (
      <ReaderPage
        contract={contract}
        docId={nav.docId}
        onBack={(): void => goto({ route: 'highlights', docId: null })}
        onReaderOpen={(record, gateResult): void =>
          emit('Reader Open', {
            foleonDocId: record.foleonDocId,
            contentRegistryItemId: record.id,
            pageContext: 'Reader',
            gateResult,
          })
        }
        onReaderClose={(record, gateResult): void =>
          emit('Reader Close', {
            foleonDocId: record.foleonDocId,
            contentRegistryItemId: record.id,
            pageContext: 'Reader',
            gateResult,
          })
        }
        onEmbedError={(record, gateResult): void =>
          emit('Embed Error', {
            foleonDocId: record.foleonDocId,
            contentRegistryItemId: record.id,
            pageContext: 'Reader',
            gateResult,
            errorCode: 'reader.embed_error',
          })
        }
        onGateBlocked={(gateResult): void =>
          emit('Embed Error', {
            pageContext: 'Reader',
            gateResult,
            errorCode: 'reader.gate_blocked',
          })
        }
        onExternalOpen={openExternal}
      />
    );
  }
  if (nav.route === 'hub') {
    return (
      <ContentHubPage
        contract={contract}
        onOpenReader={openReader}
        onOpenExternal={openExternal}
        onSearch={(query: string): void => {
          const trimmed = query.trim();
          if (trimmed.length > 0) {
            emit('Search', { searchQueryLength: trimmed.length, pageContext: 'Content Hub' });
          }
        }}
        onBack={(): void => goto({ route: 'highlights', docId: null })}
      />
    );
  }
  return (
    <HighlightsPage
      contract={contract}
      onOpenReader={openReader}
      onOpenExternal={openExternal}
      onCardImpression={onCardImpression}
    />
  );
}

function readNavFromLocation(contract: IFoleonRuntimeContract): AppNavState {
  if (typeof window === 'undefined') {
    return { route: contract.route, docId: contract.docId };
  }
  const search = new URLSearchParams(window.location.search);
  const routeParam = search.get('foleonRoute');
  const route: FoleonRoute =
    routeParam === 'reader' || routeParam === 'hub'
      ? routeParam
      : routeParam === 'highlights'
        ? 'highlights'
        : contract.route;
  const docIdParam = search.get('docId');
  const docId =
    route === 'reader'
      ? docIdParam && /^\d+$/.test(docIdParam)
        ? Number.parseInt(docIdParam, 10)
        : contract.docId
      : null;
  return { route, docId };
}

function selectSink(contract: IFoleonRuntimeContract): FoleonEventSink {
  if (
    contract.hostMode !== 'sharepoint' ||
    !contract.siteUrl ||
    !contract.listIds.events
  ) {
    return createNoopEventSink();
  }
  return createSharePointEventSink({
    siteUrl: contract.siteUrl,
    eventsListId: contract.listIds.events,
  });
}
