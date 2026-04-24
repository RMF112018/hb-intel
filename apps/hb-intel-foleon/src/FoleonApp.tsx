import { useCallback, useEffect, useMemo, useState } from 'react';
import { HbcThemeProvider } from '@hbc/ui-kit/homepage';
import type { FoleonContentRecord } from './types/foleon-content.types.js';
import type {
  FoleonEventType,
  FoleonInteractionEvent,
  FoleonPageContext,
} from './types/foleon-event.types.js';
import type { IFoleonRuntimeContract, FoleonRoute } from './runtime/foleonRuntimeContract.js';
import { createFoleonEventId, logFoleonEvent } from './services/FoleonTelemetryService.js';
import { HighlightsPage } from './pages/HighlightsPage.js';
import { ReaderPage } from './pages/ReaderPage.js';
import { ContentHubPage } from './pages/ContentHubPage.js';
import { FoleonError } from './components/FoleonStates.js';

interface FoleonAppProps {
  readonly contract: IFoleonRuntimeContract;
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

  useEffect(() => {
    const handlePopState = (): void => setNav(readNavFromLocation(contract));
    window.addEventListener('popstate', handlePopState);
    return (): void => window.removeEventListener('popstate', handlePopState);
  }, [contract]);

  const logEvent = useCallback(
    (
      eventType: FoleonEventType,
      partial?: Partial<FoleonInteractionEvent>,
    ): void => {
      if (contract.hostMode !== 'sharepoint' || !contract.siteUrl || !contract.listIds.events) {
        return;
      }
      const event: FoleonInteractionEvent = {
        eventId: createFoleonEventId(),
        eventType,
        eventTimestamp: new Date().toISOString(),
        pageContext: partial?.pageContext ?? pageContextFromRoute(nav.route),
        ...partial,
      };
      void logFoleonEvent(
        {
          siteUrl: contract.siteUrl!,
          eventsListId: contract.listIds.events!,
        },
        event,
      ).catch(() => {
        // Telemetry is best-effort; never surface to the user.
      });
    },
    [contract, nav.route],
  );

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
      logEvent('Card Click', { foleonDocId: record.foleonDocId, contentRegistryItemId: record.id });
      if (contract.readerRoutePath) {
        const target = new URL(contract.readerRoutePath, window.location.origin);
        target.searchParams.set('docId', String(record.foleonDocId));
        window.location.assign(target.toString());
        return;
      }
      goto({ route: 'reader', docId: record.foleonDocId });
    },
    [contract.readerRoutePath, goto, logEvent],
  );

  const openExternal = useCallback(
    (record: FoleonContentRecord): void => {
      logEvent('External Open', {
        foleonDocId: record.foleonDocId,
        contentRegistryItemId: record.id,
      });
      if (record.publishedUrl) {
        window.open(record.publishedUrl, '_blank', 'noopener,noreferrer');
      }
    },
    [logEvent],
  );

  const onCardImpression = useCallback(
    (records: ReadonlyArray<FoleonContentRecord>): void => {
      for (const record of records) {
        logEvent('Card Impression', {
          foleonDocId: record.foleonDocId,
          contentRegistryItemId: record.id,
        });
      }
    },
    [logEvent],
  );

  if (!contract.canInitialize) {
    return (
      <HbcThemeProvider forceTheme="light">
        <FoleonError
          title="Foleon integration is not fully configured."
          description={contract.blockingReasons.join(' ')}
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
    logEvent,
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
  readonly logEvent: (eventType: FoleonEventType, partial?: Partial<FoleonInteractionEvent>) => void;
  readonly goto: (next: AppNavState) => void;
}

function renderPage(args: RenderPageArgs): React.ReactNode {
  const { contract, nav, openReader, openExternal, onCardImpression, logEvent, goto } = args;
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
        onReaderOpen={(record): void =>
          logEvent('Reader Open', {
            foleonDocId: record.foleonDocId,
            contentRegistryItemId: record.id,
            pageContext: 'Reader',
          })
        }
        onReaderClose={(record): void =>
          logEvent('Reader Close', {
            foleonDocId: record.foleonDocId,
            contentRegistryItemId: record.id,
            pageContext: 'Reader',
          })
        }
        onEmbedError={(record): void =>
          logEvent('Embed Error', {
            foleonDocId: record.foleonDocId,
            contentRegistryItemId: record.id,
            pageContext: 'Reader',
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
          if (query.trim()) logEvent('Search', { searchQuery: query, pageContext: 'Content Hub' });
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

function pageContextFromRoute(route: FoleonRoute): FoleonPageContext {
  if (route === 'reader') return 'Reader';
  if (route === 'hub') return 'Content Hub';
  return 'Homepage';
}
