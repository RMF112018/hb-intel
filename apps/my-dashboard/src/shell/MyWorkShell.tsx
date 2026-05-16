import { useCallback, useMemo, useRef, type CSSProperties, type ReactNode } from 'react';
import type { MyWorkPrimarySurfaceId } from '@hbc/models/myWork';
import { createMyWorkReadModelClient } from '../api/myWorkReadModelClientFactory.js';
import { getApiAudience, getProductionConfigMissingKeys } from '../config/runtimeConfig.js';
import { useMyWorkShellState } from '../state/useMyWorkShellState.js';
import { MyWorkBentoGrid } from '../layout/MyWorkBentoGrid.js';
import { AdobeSignCallbackBanner } from './AdobeSignCallbackBanner.js';
import {
  MyWorkActiveEnvelopeProvider,
  useMyWorkActiveEnvelopeDataPath,
} from './MyWorkActiveEnvelopeContext.js';
import { MyWorkHeroBand } from './MyWorkHeroBand.js';
import { MyWorkSurfaceRouter } from './MyWorkSurfaceRouter.js';
import {
  useMyWorkContainerBreakpoint,
  type MyWorkResponsiveMode,
} from '../layout/useMyWorkContainerBreakpoint.js';
import styles from './MyWorkShell.module.css';

export const MY_WORK_ACTIVE_PANEL_ID = 'my-work-active-surface-panel';

export interface MyWorkShellProps {
  readonly spfxContext?: {
    pageContext: {
      user: {
        loginName: string;
        displayName?: string;
        email?: string;
      };
    };
  };
  readonly getApiToken?: () => Promise<string>;
  /** Test-only override for the responsive mode (no ResizeObserver in jsdom). */
  readonly forceMode?: MyWorkResponsiveMode;
  /** Test-only override for the page-header greeting clock. Defaults to `new Date()`. */
  readonly now?: Date;
  /** Active-panel children — populated by later B05.3 prompts. */
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
  '--my-work-elevation-card-hover':
    '0 1px 2px rgba(15, 23, 42, 0.06), 0 6px 16px rgba(15, 23, 42, 0.10), 0 22px 48px rgba(10, 8, 6, 0.05)',
  '--my-work-executive-ink': '#24364d',
  '--my-work-executive-ink-soft': 'rgba(36, 54, 77, 0.62)',
  '--my-work-executive-rail-tint': 'rgba(36, 54, 77, 0.14)',
  '--my-work-brand-hb-blue': '#225391',
  '--my-work-brand-hb-orange': '#E57E46',
} as CSSProperties);

export function MyWorkShell({
  spfxContext,
  getApiToken,
  forceMode,
  now,
  children,
}: MyWorkShellProps) {
  const shellRef = useRef<HTMLDivElement | null>(null);
  const mode = useMyWorkContainerBreakpoint(shellRef, forceMode);

  const { activePrimarySurfaceId } = useMyWorkShellState();

  const themeStyle = useMemo(() => MY_WORK_THEME_VARS, []);

  const pageHeaderIdentity = useMemo(
    () => ({
      displayName: spfxContext?.pageContext.user.displayName,
      email: spfxContext?.pageContext.user.email,
    }),
    [spfxContext],
  );

  // Adobe Sign OAuth start. Only wired in backend posture (a real bearer-token
  // provider is present); fixture/test renders omit `getApiToken`, so the
  // Connect CTA on the consolidated Adobe card stays suppressed.
  const onConnectAdobeSign = useCallback(async (): Promise<void> => {
    if (typeof getApiToken !== 'function') {
      throw new Error('adobe-sign-oauth-start-not-available-in-fixture-mode');
    }
    const client = createMyWorkReadModelClient({ readModelMode: 'backend', getApiToken });
    const returnPath =
      typeof window !== 'undefined' && window.location ? window.location.pathname : '/';
    const result = await client.startAdobeSignOAuth({ returnPath });
    if (typeof window !== 'undefined' && window.location) {
      window.location.assign(result.authorizationUrl);
    }
  }, [getApiToken]);
  const handleConnectAdobeSign = typeof getApiToken === 'function' ? onConnectAdobeSign : undefined;

  // Production-mode runtime-config posture for hosted operator triage. When
  // the deployed bundle was built without one or more of FUNCTION_APP_URL,
  // API_AUDIENCE, or with a token-provider that failed to construct, the
  // factory degrades silently to `backend-unavailable-fallback`. This list
  // names the specific precondition(s) absent so operator DevTools inspection
  // shows the cause directly. Empty list = healthy or `ui-review` posture.
  const productionConfigMissing = useMemo(
    () =>
      getProductionConfigMissingKeys(Boolean(getApiAudience()), typeof getApiToken === 'function'),
    [getApiToken],
  );

  return (
    <div
      ref={shellRef}
      className={styles.shell}
      style={themeStyle}
      data-my-work-shell="thin"
      data-my-work-shell-mode={mode}
    >
      <MyWorkActiveEnvelopeProvider>
        <section className={styles.commandSurface} data-my-work-command-surface="">
          <MyWorkHeroBand mode={mode} identity={pageHeaderIdentity} now={now} />
        </section>
        <div className={styles.canvas} data-my-work-canvas="">
          <MyWorkActiveSurfacePanel
            activePrimarySurfaceId={activePrimarySurfaceId}
            productionConfigMissing={productionConfigMissing}
          >
            <AdobeSignCallbackBanner />
            <MyWorkBentoGrid mode={mode}>
              <MyWorkSurfaceRouter
                activePrimarySurfaceId={activePrimarySurfaceId}
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
 * The `<main>` for the active surface. Stamps the envelope's data-path
 * classification (`backend-live`, `backend-unavailable-fallback`,
 * `fixture-ui-review`, or `unknown`) alongside the active-surface marker
 * so hosted screenshots unambiguously prove the data path.
 *
 * Also stamps `data-my-work-runtime-config-missing` (comma-list) when
 * production-mode posture is active but one or more runtime-config
 * preconditions are absent. The attribute is omitted when the list is
 * empty (healthy production posture or `ui-review` mode), so its presence
 * alone is the operator signal.
 */
function MyWorkActiveSurfacePanel({
  activePrimarySurfaceId,
  productionConfigMissing,
  children,
}: {
  readonly activePrimarySurfaceId: MyWorkPrimarySurfaceId;
  readonly productionConfigMissing: readonly string[];
  readonly children: ReactNode;
}) {
  const dataPath = useMyWorkActiveEnvelopeDataPath();
  const missingAttr =
    productionConfigMissing.length > 0
      ? { 'data-my-work-runtime-config-missing': productionConfigMissing.join(',') }
      : undefined;
  return (
    <main
      id={MY_WORK_ACTIVE_PANEL_ID}
      aria-label="My Work"
      className={styles.activePanel}
      data-my-work-active-surface-panel={activePrimarySurfaceId}
      data-my-work-data-path={dataPath}
      {...missingAttr}
    >
      {children}
    </main>
  );
}

export default MyWorkShell;
