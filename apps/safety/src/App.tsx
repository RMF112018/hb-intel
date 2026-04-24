import { useEffect, useMemo, useRef } from 'react';
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
  emitSafetyFrontendEvent,
} from '@hbc/features-safety';
import { createWebpartRouter } from './router/index.js';
import { useSafetyLayoutMode } from './responsive/safetyBreakpoints.js';
import { findMissingHostedSafetyGuidBindings } from './runtime/hostedSafetyGuidBinding.js';
import { adaptSpfxHttpClient, type SpfxLikeContext } from './spfxHttpAdapter.js';
import {
  runHealthReadyNonAdminProof,
  shouldRunHealthReadyNonAdminProof,
} from './runtime/healthReadyProof.js';
import {
  resolveSafetyRuntimeContract,
  type ISafetyRuntimeContract,
} from './runtime/safetyRuntimeContract.js';
import { SafetyStatusPanel } from './components/SafetyStatusPanel.js';

const queryClient = new QueryClient({ defaultOptions: { queries: defaultQueryOptions } });
const router = createWebpartRouter();

interface AppProps {
  spfxContext?: unknown;
  runtimeContract?: ISafetyRuntimeContract;
}

export function App({ spfxContext, runtimeContract }: AppProps): React.ReactNode {
  const typed = spfxContext as SpfxLikeContext | undefined;
  // Phase-04 audit G-02 foundation: derive a mode-aware layout contract from
  // the actual Safety app content container width, not raw viewport. The ref
  // below is attached to the real content wrapper that bounds the routed
  // page body under SPFx/SharePoint hosting.
  const contentRef = useRef<HTMLDivElement | null>(null);
  const layoutMode = useSafetyLayoutMode(contentRef);
  const proofRanRef = useRef(false);
  const resolvedRuntimeContract = useMemo(
    () =>
      runtimeContract ??
      resolveSafetyRuntimeContract({
        hasSpfxContext: !!typed,
      }),
    [runtimeContract, typed],
  );
  const sharePointClient = useMemo(() => adaptSpfxHttpClient(typed), [typed]);
  const sharePointBlockingReason =
    resolvedRuntimeContract.hostMode === 'sharepoint' && !sharePointClient
      ? 'SPFx HTTP client is unavailable in this host context.'
      : null;
  const effectiveBlockingReasons = useMemo(
    () => [
      ...resolvedRuntimeContract.blockingReasons,
      ...(sharePointBlockingReason ? [sharePointBlockingReason] : []),
    ],
    [resolvedRuntimeContract.blockingReasons, sharePointBlockingReason],
  );
  const repository = useMemo(() => {
    if (import.meta.env?.DEV) {
      // Surface hosted-binding gaps in local/dev without polluting production.
      logSafetyOverlayDiagnostic();
    }
    if (resolvedRuntimeContract.hostMode === 'sharepoint') {
      if (!resolvedRuntimeContract.canInitializeCommands || !sharePointClient) {
        return null;
      }
      return createSafetyInspectionRepository({
        mode: 'sharepoint',
        sharepoint: {
          client: sharePointClient,
          backendIngestion: {
            baseUrl: resolvedRuntimeContract.backend.baseUrl ?? undefined,
            getApiToken: async (): Promise<string> => {
              // Auth contract decision for Safety backend commands:
              // keep explicit SPFx AADTokenProvider token acquisition in this seam.
              // We intentionally do not switch this command transport to AadHttpClient
              // in the same change that hardens typed request/response envelopes.
              const apiAudience = resolvedRuntimeContract.backend.apiAudience;
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
  }, [typed, resolvedRuntimeContract, sharePointClient]);

  const blockedInSharePointMode =
    resolvedRuntimeContract.hostMode === 'sharepoint' &&
    (!resolvedRuntimeContract.canInitializeCommands || !!sharePointBlockingReason);

  // Emit a single governed event per runtime-contract resolution so support
  // can observe whether the binding gate passed or blocked the surface, and
  // for what reasons. The event mirrors the backend's event-shape conventions
  // so requestId-style joins remain possible at the surface boundary even
  // though there is no command requestId at this lifecycle stage.
  const runtimeBindingEmittedRef = useRef<string | null>(null);
  useEffect(() => {
    const fingerprint = `${resolvedRuntimeContract.hostMode}|${
      resolvedRuntimeContract.canInitializeCommands ? 'ok' : 'blocked'
    }|${effectiveBlockingReasons.join(',')}`;
    if (runtimeBindingEmittedRef.current === fingerprint) return;
    runtimeBindingEmittedRef.current = fingerprint;
    if (resolvedRuntimeContract.canInitializeCommands && effectiveBlockingReasons.length === 0) {
      emitSafetyFrontendEvent({
        name: 'safety.frontend.runtime-binding.validated',
        operation: 'runtime-binding',
        lifecycle: 'gate-validated',
        properties: {
          hostMode: resolvedRuntimeContract.hostMode,
          hostedGuidOverlayKnown: resolvedRuntimeContract.hostedGuidOverlay.known,
        },
      });
    } else {
      emitSafetyFrontendEvent({
        name: 'safety.frontend.runtime-binding.blocked',
        operation: 'runtime-binding',
        lifecycle: 'gate-blocked',
        properties: {
          hostMode: resolvedRuntimeContract.hostMode,
          hostedGuidOverlayKnown: resolvedRuntimeContract.hostedGuidOverlay.known,
          blockingReasons: effectiveBlockingReasons,
        },
      });
    }
  }, [resolvedRuntimeContract, effectiveBlockingReasons]);

  useEffect(() => {
    const apiAudience = resolvedRuntimeContract.backend.apiAudience ?? '';
    const functionAppUrl = resolvedRuntimeContract.backend.baseUrl ?? '';
    if (proofRanRef.current) return;
    if (!typed || blockedInSharePointMode) return;
    if (!shouldRunHealthReadyNonAdminProof(typed, apiAudience, functionAppUrl, window.location.search)) {
      return;
    }
    proofRanRef.current = true;

    void runHealthReadyNonAdminProof(typed, apiAudience, functionAppUrl).then((result) => {
      (
        window as unknown as {
          __hbIntel_safetyProof?: unknown;
        }
      ).__hbIntel_safetyProof = result;

      // eslint-disable-next-line no-console -- explicit proof-mode diagnostics gated by query param
      console.info('[safety-proof] healthReadyNonAdmin', result);
    });
  }, [typed, blockedInSharePointMode, resolvedRuntimeContract]);

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
            {blockedInSharePointMode || !repository ? (
              <div className="safety-app-root">
                <SafetyStatusPanel
                  intent="blocked"
                  title="Safety configuration is incomplete."
                  description="SharePoint host mode is active, but required backend binding is missing or invalid."
                  detail={`Host mode: ${resolvedRuntimeContract.hostMode}. Overlay known: ${
                    resolvedRuntimeContract.hostedGuidOverlay.known ? 'yes' : 'no'
                  }.`}
                >
                  <ul>
                    {effectiveBlockingReasons.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                </SafetyStatusPanel>
              </div>
            ) : (
              <SafetyRepositoryProvider repository={repository}>
                <div
                  ref={contentRef}
                  data-safety-mode={layoutMode}
                  className="safety-app-root"
                >
                  <RouterProvider router={router} />
                </div>
              </SafetyRepositoryProvider>
            )}
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
