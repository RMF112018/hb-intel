import { useMemo, useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { HbcThemeProvider, HbcErrorBoundary } from '@hbc/ui-kit';
import { ComplexityProvider } from '@hbc/complexity';
import { ForceOfficeMode } from './ForceOfficeMode.js';
import { defaultQueryOptions } from '@hbc/query-hooks';
import {
  SafetyRepositoryProvider,
  createSafetyInspectionRepository,
  currentSafetyGuidOverlay,
} from '@hbc/features-safety';
import { createWebpartRouter } from './router/index.js';
import { useSafetyLayoutMode } from './responsive/safetyBreakpoints.js';
import { findMissingHostedSafetyGuidBindings } from './runtime/hostedSafetyGuidBinding.js';
import { adaptSpfxHttpClient, type SpfxLikeContext } from './spfxHttpAdapter.js';

const queryClient = new QueryClient({ defaultOptions: { queries: defaultQueryOptions } });
const router = createWebpartRouter();

interface AppProps {
  spfxContext?: unknown;
  functionAppUrl?: string;
  apiAudience?: string;
}

export function App({ spfxContext, functionAppUrl, apiAudience }: AppProps): React.ReactNode {
  const typed = spfxContext as SpfxLikeContext | undefined;
  // Phase-04 audit G-02 foundation: derive a mode-aware layout contract from
  // the actual Safety app content container width, not raw viewport. The ref
  // below is attached to the real content wrapper that bounds the routed
  // page body under SPFx/SharePoint hosting.
  const contentRef = useRef<HTMLDivElement | null>(null);
  const layoutMode = useSafetyLayoutMode(contentRef);
  const repository = useMemo(() => {
    if (import.meta.env?.DEV) {
      // Surface hosted-binding gaps in local/dev without polluting production.
      logSafetyOverlayDiagnostic();
    }
    const client = adaptSpfxHttpClient(typed);
    if (client) {
      return createSafetyInspectionRepository({
        mode: 'sharepoint',
        sharepoint: {
          client,
          backendIngestion: {
            baseUrl: functionAppUrl,
            getApiToken: async (): Promise<string> => {
              if (!typed || !apiAudience) {
                throw new Error(
                  'Safety backend ingestion requires apiAudience and SPFx context token provider configuration.',
                );
              }
              const provider = await typed.aadTokenProviderFactory?.getTokenProvider();
              if (!provider) {
                throw new Error('SPFx AadTokenProviderFactory is unavailable for Safety backend ingestion.');
              }
              return provider.getToken(apiAudience);
            },
          },
        },
      });
    }
    return createSafetyInspectionRepository({ mode: 'mock' });
  }, [typed, functionAppUrl, apiAudience]);

  // Safety is office-only (Phase-2 G-01): lock the theme to light AND
  // force isFieldMode=false on the ambient theme context so ui-kit
  // consumers (WorkspacePageShell, HbcDataTable, HbcCommandPalette, …)
  // never engage field-mode UI variants on this SPFx-over-SharePoint
  // surface — even on touch devices or when a dev persisted a field
  // override in localStorage. See plan §3.
  return (
    <HbcThemeProvider forceTheme="light">
      <ForceOfficeMode>
        <QueryClientProvider client={queryClient}>
        <HbcErrorBoundary>
          <ComplexityProvider
            spfxContext={
              typed?.pageContext?.user?.loginName
                ? { pageContext: { user: { loginName: typed.pageContext.user.loginName } } }
                : undefined
            }
          >
            <SafetyRepositoryProvider repository={repository}>
              <div
                ref={contentRef}
                data-safety-mode={layoutMode}
                className="safety-app-root"
              >
                <RouterProvider router={router} />
              </div>
            </SafetyRepositoryProvider>
          </ComplexityProvider>
        </HbcErrorBoundary>
      </QueryClientProvider>
      </ForceOfficeMode>
    </HbcThemeProvider>
  );
}

function logSafetyOverlayDiagnostic(): void {
  const overlay = currentSafetyGuidOverlay();
  const missing = findMissingHostedSafetyGuidBindings(overlay);
  const present = Object.keys(overlay);
  if (missing.length > 0) {
    // eslint-disable-next-line no-console -- dev-only diagnostic guarded by import.meta.env.DEV
    console.warn(
      `[safety] overlay loaded but missing ${missing.length} key(s). Calls to those ` +
        `lists will throw SafetyConfigurationError. Missing: ${missing.join(', ')}. ` +
        'Upload/replay flows may additionally require SafetyChecklistUploads GUID binding.',
    );
  } else {
    // eslint-disable-next-line no-console -- dev-only diagnostic guarded by import.meta.env.DEV
    console.info(`[safety] overlay fully populated (${present.length} keys).`);
  }
}
