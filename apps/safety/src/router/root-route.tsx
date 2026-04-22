import { createRootRoute, Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import { ShellLayout, resolveProjectHubUrl } from '@hbc/shell';
import type { SimplifiedShellConfig } from '@hbc/shell';
import { HbcTabs } from '@hbc/ui-kit';
import type { LayoutTab } from '@hbc/models';

/**
 * Safety Record Keeping — simplified shell config.
 *
 * Wave 1 (Phase-2 audit remediation, G-02 + G-11):
 * - `toolPickerItems` on `SimplifiedShellConfig` is retained only to satisfy
 *   the shell contract; it is no longer rendered as a raw button strip.
 * - `toolPickerSlot` renders governed `HbcTabs` with route-aware active state.
 * - `Incidents` is removed from the tab set. `/incidents` is redirected to
 *   `/periods` by the route layer (see routes.ts).
 */
interface SafetyTabDef {
  readonly id: string;
  readonly label: string;
  readonly path: string;
}

const SAFETY_TABS: ReadonlyArray<SafetyTabDef> = [
  { id: 'upload', label: 'Upload', path: '/upload' },
  { id: 'periods', label: 'Periods', path: '/periods' },
  { id: 'review', label: 'Review', path: '/review' },
  { id: 'inspections', label: 'Inspections', path: '/inspections' },
];

const SAFETY_SHELL_CONFIG: SimplifiedShellConfig = {
  workspaceName: 'Safety',
  showBackToProjectHub: true,
  projectHubUrl: resolveProjectHubUrl(),
  toolPickerItems: SAFETY_TABS.map((t) => ({ label: t.label, path: t.path })),
};

const SAFETY_LAYOUT_TABS: ReadonlyArray<LayoutTab> = SAFETY_TABS.map((t) => ({
  id: t.id,
  label: t.label,
}));

/**
 * Deterministic longest-prefix active-tab resolver.
 *
 * - `/` and `/upload` both resolve to `upload` (upload is the index route).
 * - `/projects/...` resolves to `periods` (project-week drill-in is owned by
 *   the periods tab).
 * - `/inspections/...` resolves to `inspections` (detail drill-in).
 * - Anything unknown falls back to `upload`.
 *
 * Exported for unit-test coverage (§6 test #1).
 */
export function matchActiveTabId(pathname: string): string {
  if (pathname === '/' || pathname.startsWith('/upload')) return 'upload';
  if (pathname.startsWith('/periods') || pathname.startsWith('/projects/')) return 'periods';
  if (pathname.startsWith('/review')) return 'review';
  if (pathname.startsWith('/inspections')) return 'inspections';
  return 'upload';
}

/** Tab definitions exported for test assertions (§6 test #2). */
export const SAFETY_NAV_TABS = SAFETY_LAYOUT_TABS;

function RootComponent(): React.ReactNode {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTabId = matchActiveTabId(location.pathname);
  const handleTabChange = (tabId: string): void => {
    const tab = SAFETY_TABS.find((t) => t.id === tabId);
    if (tab) void navigate({ to: tab.path });
  };

  return (
    <ShellLayout
      mode="simplified"
      simplifiedConfig={SAFETY_SHELL_CONFIG}
      toolPickerSlot={
        <nav data-hbc-shell="tool-picker-nav" aria-label="Safety workspace">
          <HbcTabs
            tabs={[...SAFETY_LAYOUT_TABS]}
            activeTabId={activeTabId}
            onTabChange={handleTabChange}
          />
        </nav>
      }
    >
      <Outlet />
    </ShellLayout>
  );
}

export const rootRoute = createRootRoute({ component: RootComponent });
