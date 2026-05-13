import { useCallback, useMemo, useRef, type CSSProperties, type ReactNode } from 'react';
import {
  normalizeMyWorkModuleId,
  type MyWorkModuleId,
  type MyWorkPrimarySurfaceId,
} from '@hbc/models/myWork';
import { createMyWorkReadModelClient } from '../api/myWorkReadModelClientFactory.js';
import { useMyWorkShellState } from '../state/useMyWorkShellState.js';
import {
  selectMyWorkFocusedAdobeHeroViewModel,
  selectMyWorkHomeHeroViewModel,
} from '../state/myWorkHeroViewModel.js';
import { MyWorkBentoGrid } from '../layout/MyWorkBentoGrid.js';
import { AdobeSignCallbackBanner } from './AdobeSignCallbackBanner.js';
import {
  MyWorkActiveEnvelopeProvider,
  useMyWorkActiveEnvelopeDataPath,
  useMyWorkFocusedAdobeEnvelopeContext,
  useMyWorkHomeEnvelopeContext,
} from './MyWorkActiveEnvelopeContext.js';
import { MyWorkPrimaryNavigation } from './MyWorkPrimaryNavigation.js';
import { MyWorkHeroBand } from './MyWorkHeroBand.js';
import { MyWorkSurfaceRouter } from './MyWorkSurfaceRouter.js';
import {
  useMyWorkContainerBreakpoint,
  type MyWorkResponsiveMode,
} from '../layout/useMyWorkContainerBreakpoint.js';
import styles from './MyWorkShell.module.css';

export const MY_WORK_ACTIVE_PANEL_ID = 'my-work-active-surface-panel';

export interface MyWorkShellProps {
  readonly spfxContext?: { pageContext: { user: { loginName: string } } };
  readonly getApiToken?: () => Promise<string>;
  /** Test-only override for the responsive mode (no ResizeObserver in jsdom). */
  readonly forceMode?: MyWorkResponsiveMode;
  /** Active-panel children — populated by later B03 prompts (bento grid, focused module). */
  readonly children?: ReactNode;
}

const MY_WORK_THEME_VARS: CSSProperties = Object.freeze({
  '--my-work-color-canvas': '#f6f7f9',
  '--my-work-color-card': '#ffffff',
  '--my-work-color-rail': '#eef1f5',
  '--my-work-color-rail-hover': 'rgba(15, 99, 198, 0.08)',
  '--my-work-color-rail-pressed': 'rgba(15, 99, 198, 0.14)',
  '--my-work-color-rail-accent': '#0f63c6',
  '--my-work-color-rail-text': '#1f2937',
  '--my-work-color-rail-muted': '#5b6573',
  '--my-work-color-text-primary': '#0f172a',
  '--my-work-color-text-muted': '#5b6573',
  '--my-work-color-border': '#dfe3e8',
  '--my-work-status-neutral': '#dfe3e8',
  '--my-work-status-info': '#dbeafe',
  '--my-work-on-status': '#0f172a',
  '--my-work-radius-sm': '4px',
  '--my-work-radius-md': '6px',
  '--my-work-radius-lg': '10px',
  '--my-work-radius-full': '999px',
  '--my-work-space-xs': '4px',
  '--my-work-space-sm': '8px',
  '--my-work-space-md': '12px',
  '--my-work-space-lg': '20px',
  '--my-work-space-xl': '32px',
  '--my-work-elevation-card': '0 1px 2px rgba(15, 23, 42, 0.06), 0 4px 12px rgba(15, 23, 42, 0.08)',
} as CSSProperties);

export function MyWorkShell({
  spfxContext: _spfxContext,
  getApiToken,
  forceMode,
  children,
}: MyWorkShellProps) {
  const shellRef = useRef<HTMLDivElement | null>(null);
  const mode = useMyWorkContainerBreakpoint(shellRef, forceMode);

  const { activePrimarySurfaceId, activeModuleId, selectPrimarySurface, selectModule } =
    useMyWorkShellState();

  const viewState: 'home' | 'focused-module' = activeModuleId ? 'focused-module' : 'home';
  const tabId = `my-work-tab-${activePrimarySurfaceId satisfies MyWorkPrimarySurfaceId}`;

  const themeStyle = useMemo(() => MY_WORK_THEME_VARS, []);

  // Adobe Sign consent-start callback. Only wired in backend mode
  // (a real bearer-token provider is present); fixture/test renders
  // omit `getApiToken`, so the connection card stays button-less.
  const onConnectAdobeSign = useCallback(async (): Promise<void> => {
    if (typeof getApiToken !== 'function') {
      throw new Error('adobe-sign-oauth-start-not-available-in-fixture-mode');
    }
    const client = createMyWorkReadModelClient({
      readModelMode: 'backend',
      getApiToken,
    });
    const returnPath =
      typeof window !== 'undefined' && window.location ? window.location.pathname : '/';
    const result = await client.startAdobeSignOAuth({ returnPath });
    if (typeof window !== 'undefined' && window.location) {
      window.location.assign(result.authorizationUrl);
    }
  }, [getApiToken]);

  const handleConnectAdobeSign = typeof getApiToken === 'function' ? onConnectAdobeSign : undefined;

  return (
    <div
      ref={shellRef}
      className={styles.shell}
      style={themeStyle}
      data-my-work-shell="thin"
      data-my-work-shell-mode={mode}
      data-my-work-view-state={viewState}
    >
      <MyWorkActiveEnvelopeProvider activeModuleId={activeModuleId}>
        <section className={styles.commandSurface} data-my-work-command-surface="">
          <MyWorkPrimaryNavigation
            mode={mode}
            activePrimarySurfaceId={activePrimarySurfaceId}
            activeModuleId={activeModuleId}
            onSelectPrimarySurface={selectPrimarySurface}
            onSelectModule={selectModule}
            panelId={MY_WORK_ACTIVE_PANEL_ID}
          />
          <MyWorkHeroBandAdapter mode={mode} activeModuleId={activeModuleId} />
        </section>
        <div className={styles.canvas} data-my-work-canvas="">
          <MyWorkActiveSurfacePanel tabId={tabId} activePrimarySurfaceId={activePrimarySurfaceId}>
            <AdobeSignCallbackBanner />
            <MyWorkBentoGrid mode={mode}>
              <MyWorkSurfaceRouter
                activePrimarySurfaceId={activePrimarySurfaceId}
                activeModuleId={activeModuleId}
                onSelectModule={selectModule}
                getApiToken={getApiToken}
                onConnectAdobeSign={handleConnectAdobeSign}
              />
              {children}
            </MyWorkBentoGrid>
          </MyWorkActiveSurfacePanel>
        </div>
      </MyWorkActiveEnvelopeProvider>
    </div>
  );
}

/**
 * Selects the hero view-model from whichever envelope context is mounted by
 * the active provider. Branches on `activeModuleId` so only the active
 * route's consumer hook is invoked — matching the provider mounted above.
 */
function MyWorkHeroBandAdapter({
  mode,
  activeModuleId,
}: {
  readonly mode: MyWorkResponsiveMode;
  readonly activeModuleId?: MyWorkModuleId;
}) {
  const normalized = normalizeMyWorkModuleId(activeModuleId);
  if (normalized === 'adobe-sign-action-queue') {
    return <FocusedAdobeHeroBand mode={mode} />;
  }
  return <HomeHeroBand mode={mode} />;
}

function HomeHeroBand({ mode }: { readonly mode: MyWorkResponsiveMode }) {
  const state = useMyWorkHomeEnvelopeContext();
  const viewModel = useMemo(() => selectMyWorkHomeHeroViewModel(state), [state]);
  return <MyWorkHeroBand mode={mode} viewModel={viewModel} />;
}

function FocusedAdobeHeroBand({ mode }: { readonly mode: MyWorkResponsiveMode }) {
  const state = useMyWorkFocusedAdobeEnvelopeContext();
  const viewModel = useMemo(() => selectMyWorkFocusedAdobeHeroViewModel(state), [state]);
  return <MyWorkHeroBand mode={mode} viewModel={viewModel} />;
}

/**
 * The `<main role="tabpanel">` for the active surface. Stamps the
 * envelope's data-path classification (`backend-live`,
 * `backend-unavailable-fallback`, `fixture-ui-review`, or `unknown`)
 * alongside the existing surface-panel marker so hosted screenshots
 * unambiguously prove the data path.
 */
function MyWorkActiveSurfacePanel({
  tabId,
  activePrimarySurfaceId,
  children,
}: {
  readonly tabId: string;
  readonly activePrimarySurfaceId: MyWorkPrimarySurfaceId;
  readonly children: ReactNode;
}) {
  const dataPath = useMyWorkActiveEnvelopeDataPath();
  return (
    <main
      id={MY_WORK_ACTIVE_PANEL_ID}
      role="tabpanel"
      aria-labelledby={tabId}
      className={styles.activePanel}
      data-my-work-active-surface-panel={activePrimarySurfaceId}
      data-my-work-data-path={dataPath}
    >
      {children}
    </main>
  );
}

export default MyWorkShell;
