import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useNavStore, type RouterHistoryLike } from '@hbc/shell';
import { HbcAppShell } from './HbcAppShell.js';
import { Home, BudgetLine, DrawingSheet, RFI, Submittal, Settings } from '../icons/index.js';
import type { SidebarNavGroup, ShellUser } from './types.js';

const mockUser: ShellUser = {
  id: '1',
  displayName: 'John Smith',
  email: 'john.smith@hbconstruction.com',
  initials: 'JS',
};

const mockGroups: SidebarNavGroup[] = [
  {
    id: 'preconstruction',
    label: 'Preconstruction',
    items: [
      { id: 'estimating', label: 'Estimating', icon: <BudgetLine size="md" />, href: '/estimating' },
      { id: 'drawings', label: 'Drawings', icon: <DrawingSheet size="md" />, href: '/drawings' },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    items: [
      { id: 'rfis', label: 'RFIs', icon: <RFI size="md" />, href: '/rfis' },
      { id: 'submittals', label: 'Submittals', icon: <Submittal size="md" />, href: '/submittals' },
    ],
  },
  {
    id: 'admin',
    label: 'Administration',
    requiredPermission: 'admin:*',
    items: [
      { id: 'settings', label: 'Settings', icon: <Settings size="md" />, href: '/settings' },
    ],
  },
];

const routeSyncGroups: SidebarNavGroup[] = [
  {
    id: 'project-hub',
    label: 'Project Hub',
    items: [
      { id: 'portfolio', label: 'Portfolio', icon: <Home size="md" />, href: '/project-hub' },
      { id: 'recent', label: 'Recent', icon: <DrawingSheet size="md" />, href: '/project-hub/recent' },
    ],
  },
  {
    id: 'accounting',
    label: 'Accounting',
    items: [
      { id: 'overview', label: 'Overview', icon: <BudgetLine size="md" />, href: '/accounting/overview' },
      { id: 'budgets', label: 'Budgets', icon: <BudgetLine size="md" />, href: '/accounting/budgets' },
      { id: 'invoices', label: 'Invoices', icon: <BudgetLine size="md" />, href: '/accounting/invoices' },
    ],
  },
];

class StoryNavHistory implements RouterHistoryLike {
  location: { pathname: string };

  private listeners = new Set<() => void>();

  constructor(initialPathname: string) {
    this.location = { pathname: initialPathname };
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  push(pathname: string): void {
    this.location = { pathname };
    for (const listener of this.listeners) listener();
  }
}

const navDemoHistory = new StoryNavHistory('/project-hub');
const navDemoStack = ['/project-hub', '/accounting/overview', '/accounting/invoices'];

function RouteSyncDemo(): React.ReactNode {
  const [index, setIndex] = React.useState(0);
  const activeWorkspace = useNavStore((s) => s.activeWorkspace);
  const activeItemId = useNavStore((s) => s.activeItemId);
  const startNavSync = useNavStore((s) => s.startNavSync);
  const stopNavSync = useNavStore((s) => s.stopNavSync);

  React.useEffect(() => {
    navDemoHistory.push(navDemoStack[0]);
    startNavSync(navDemoHistory);
    return () => stopNavSync();
  }, [startNavSync, stopNavSync]);

  const goToIndex = (nextIndex: number) => {
    const boundedIndex = Math.max(0, Math.min(nextIndex, navDemoStack.length - 1));
    setIndex(boundedIndex);
    navDemoHistory.push(navDemoStack[boundedIndex]);
  };

  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button type="button" onClick={() => goToIndex(index - 1)}>Back</button>
        <button type="button" onClick={() => goToIndex(index + 1)}>Forward</button>
        <button type="button" onClick={() => goToIndex(0)}>Reset</button>
      </div>
      <p style={{ margin: 0 }}>
        Path: <code>{navDemoHistory.location.pathname}</code> | workspace: <code>{activeWorkspace ?? 'null'}</code> |
        item: <code>{activeItemId ?? 'undefined'}</code>
      </p>
      <div style={{ height: '320px', overflow: 'hidden' }}>
        <HbcAppShell
          mode="pwa"
          user={mockUser}
          sidebarGroups={routeSyncGroups}
          onNavigate={(href) => navDemoHistory.push(href)}
        >
          <div style={{ padding: '16px' }}>
            <h2>Route Sync Demo</h2>
            <p>Use Back/Forward buttons to simulate browser history updates and verify active navigation sync.</p>
          </div>
        </HbcAppShell>
      </div>
    </div>
  );
}

const meta: Meta<typeof HbcAppShell> = {
  title: 'Shell/HbcAppShell',
  component: HbcAppShell,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof HbcAppShell>;

interface ThemeHarnessProps {
  readonly forceFieldMode?: boolean;
  readonly hbSiteControlContext?: boolean;
  readonly forceOsDark?: boolean;
  readonly children: React.ReactNode;
}

interface ViewportWidthHarnessProps {
  readonly width: number;
  readonly children: React.ReactNode;
}

/**
 * Storybook-only theme harness for deterministic overlay verification.
 * Enforces D-12/D-13 validation scenarios without changing runtime app behavior.
 */
const ThemeHarness: React.FC<ThemeHarnessProps> = ({
  forceFieldMode = false,
  hbSiteControlContext = false,
  forceOsDark,
  children,
}) => {
  React.useEffect(() => {
    const originalHtmlApp = document.documentElement.getAttribute('data-hbc-app');
    const originalStoredMode = localStorage.getItem('hbc-field-mode');
    const originalMatchMedia = window.matchMedia;

    if (hbSiteControlContext) {
      document.documentElement.setAttribute('data-hbc-app', 'hb-site-control');
    } else if (originalHtmlApp === 'hb-site-control') {
      document.documentElement.removeAttribute('data-hbc-app');
    }

    localStorage.setItem('hbc-field-mode', forceFieldMode ? 'true' : 'false');

    // D-13: deterministic OS-theme simulation for Storybook light/dark variants.
    if (forceOsDark !== undefined) {
      window.matchMedia = ((query: string) =>
        ({
          matches: query === '(prefers-color-scheme: dark)' ? forceOsDark : false,
          media: query,
          onchange: null,
          addEventListener: () => {},
          removeEventListener: () => {},
          addListener: () => {},
          removeListener: () => {},
          dispatchEvent: () => false,
        }) as MediaQueryList) as typeof window.matchMedia;
    }

    return () => {
      if (originalHtmlApp) {
        document.documentElement.setAttribute('data-hbc-app', originalHtmlApp);
      } else {
        document.documentElement.removeAttribute('data-hbc-app');
      }

      if (originalStoredMode === null) {
        localStorage.removeItem('hbc-field-mode');
      } else {
        localStorage.setItem('hbc-field-mode', originalStoredMode);
      }

      window.matchMedia = originalMatchMedia;
    };
  }, [forceFieldMode, hbSiteControlContext, forceOsDark]);

  return <>{children}</>;
};

// PH4C.12: force deterministic width so useIsTablet/useSidebarState receive tablet resize signals in CI.
const ViewportWidthHarness: React.FC<ViewportWidthHarnessProps> = ({ width, children }) => {
  React.useEffect(() => {
    const originalWidth = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: width });
    window.dispatchEvent(new Event('resize'));

    return () => {
      Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: originalWidth });
      window.dispatchEvent(new Event('resize'));
    };
  }, [width]);

  return <>{children}</>;
};

export const FullLight: Story = {
  args: {
    user: mockUser,
    sidebarGroups: mockGroups,
    mode: 'pwa',
  },
  render: (args) => (
    <HbcAppShell {...args}>
      <div style={{ padding: '24px' }}>
        <h1>Dashboard</h1>
        <p>Main content area. Resize the browser to test sidebar responsiveness.</p>
      </div>
    </HbcAppShell>
  ),
};

export const Default: Story = {
  args: {
    user: mockUser,
    sidebarGroups: mockGroups,
    mode: 'pwa',
  },
  render: (args) => (
    <HbcAppShell {...args}>
      <div style={{ padding: '24px' }}>
        <h1>Dashboard</h1>
        <p>Main content area. Resize the browser to test sidebar responsiveness.</p>
      </div>
    </HbcAppShell>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '4px' }}>PWA mode</p>
        <div style={{ height: '300px', overflow: 'hidden' }}>
          <HbcAppShell user={mockUser} sidebarGroups={mockGroups} mode="pwa">
            <div style={{ padding: '24px' }}>
              <h2>PWA Mode</h2>
              <p>Full app shell with sidebar, header, connectivity bar.</p>
            </div>
          </HbcAppShell>
        </div>
      </div>
      <div>
        <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '4px' }}>SPFx mode</p>
        <div style={{ height: '300px', overflow: 'hidden' }}>
          <HbcAppShell user={mockUser} sidebarGroups={mockGroups} mode="spfx">
            <div style={{ padding: '24px' }}>
              <h2>SPFx Mode</h2>
              <p>Embedded in SharePoint — no sidebar, streamlined header.</p>
            </div>
          </HbcAppShell>
        </div>
      </div>
    </div>
  ),
};

export const FieldMode: Story = {
  args: {
    user: mockUser,
    sidebarGroups: mockGroups,
    mode: 'pwa',
  },
  render: (args) => (
    <HbcAppShell {...args}>
      <div style={{ padding: '24px' }}>
        <h1>Field Mode Dashboard</h1>
        <p>Toggle Field Mode via the user menu avatar to see the theme switch.</p>
      </div>
    </HbcAppShell>
  ),
};

/** @deprecated Use FieldMode instead */
export const FullFieldMode: Story = FieldMode;

export const DarkThemeOverlayVerification: Story = {
  name: 'Dark Theme Overlay Verification',
  render: () => (
    <ThemeHarness forceFieldMode={false} forceOsDark={true}>
      <HbcAppShell user={mockUser} sidebarGroups={mockGroups} mode="pwa">
        <div style={{ padding: '24px' }}>
          <h1>Dark Theme Overlay Verification</h1>
          <p>Open project picker, toolbox, and user menu to validate OS dark-mode theme inheritance.</p>
        </div>
      </HbcAppShell>
    </ThemeHarness>
  ),
};

export const LightThemeOverlayVerification: Story = {
  name: 'Light Theme Overlay Verification',
  render: () => (
    <ThemeHarness forceFieldMode={false} forceOsDark={false}>
      <HbcAppShell user={mockUser} sidebarGroups={mockGroups} mode="pwa">
        <div style={{ padding: '24px' }}>
          <h1>Light Theme Overlay Verification</h1>
          <p>Office mode with OS light preference should resolve to hbcLightTheme.</p>
        </div>
      </HbcAppShell>
    </ThemeHarness>
  ),
};

export const FieldModeOverlayVerification: Story = {
  name: 'Field Mode Overlay Verification',
  render: () => (
    <ThemeHarness hbSiteControlContext={true} forceOsDark={false}>
      <HbcAppShell user={mockUser} sidebarGroups={mockGroups} mode="pwa">
        <div style={{ padding: '24px' }}>
          <h1>Field Mode Overlay Verification</h1>
          <p>HB Site Control context auto-enables Field Mode for menu/popover contrast checks.</p>
        </div>
      </HbcAppShell>
    </ThemeHarness>
  ),
};

export const A11yTest: Story = {
  name: 'A11y Test (Landmarks + Keyboard)',
  render: () => (
    <div>
      <p style={{ marginBottom: '16px', fontSize: '0.875rem', color: '#605E5C' }}>
        Verify landmark roles: <code>banner</code> (header), <code>navigation</code> (sidebar),
        <code> main</code> (content area). Tab through shell to verify focus order:
        header → sidebar → main content. Skip-to-content link should appear on first Tab.
      </p>
      <HbcAppShell user={mockUser} sidebarGroups={mockGroups} mode="pwa">
        <div style={{ padding: '24px' }}>
          <h1>A11y Test Content</h1>
          <p>Focus should reach this content area after navigating through shell controls.</p>
        </div>
      </HbcAppShell>
    </div>
  ),
};

export const RouterBackForwardSync: Story = {
  name: 'Router Back/Forward Sync',
  render: () => <RouteSyncDemo />,
};

export const NavigationDeadZoneRegression: Story = {
  name: 'Navigation Dead Zone Regression (900px)',
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
  render: () => (
    <ViewportWidthHarness width={900}>
      <div style={{ width: '900px', maxWidth: '100%', margin: '0 auto', overflow: 'hidden' }}>
        <HbcAppShell user={mockUser} sidebarGroups={mockGroups} mode="pwa">
          <div style={{ padding: '24px' }}>
            <h1>Navigation Dead Zone Regression</h1>
            <p>Traceability: D-PH4C-24 / D-PH4C-25.</p>
          </div>
        </HbcAppShell>
      </div>
    </ViewportWidthHarness>
  ),
  // PH4C.12: verify tablet-width renders bottom nav and suppresses sidebar.
  play: async ({ canvasElement }) => {
    const sidebar = canvasElement.querySelector('[data-hbc-ui="sidebar"]');
    const bottomNav = canvasElement.querySelector('[data-hbc-ui="bottom-nav"]');
    if (sidebar) throw new Error('Expected sidebar to be absent at tablet width.');
    if (!bottomNav) throw new Error('Expected bottom nav to be visible at tablet width.');
  },
};
