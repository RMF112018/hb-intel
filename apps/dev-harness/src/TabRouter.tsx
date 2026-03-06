/**
 * TabRouter — 13-tab navigation using Fluent TabList.
 * Foundation Plan Phase 3 — no router library, React state tabs.
 */
import { useState } from 'react';
import { TabList, Tab } from '@hbc/ui-kit';
import type { SelectTabData } from '@hbc/ui-kit';
import { PwaPreview } from './tabs/PwaPreview.js';
import { WebpartPreview } from './tabs/WebpartPreview.js';
import { SiteControlPreview } from './tabs/SiteControlPreview.js';

type TabId =
  | 'pwa'
  | 'project-hub'
  | 'accounting'
  | 'estimating'
  | 'business-development'
  | 'safety'
  | 'quality-control-warranty'
  | 'risk-management'
  | 'leadership'
  | 'operational-excellence'
  | 'human-resources'
  | 'admin'
  | 'site-control';

interface TabDef {
  id: TabId;
  label: string;
}

const TABS: TabDef[] = [
  { id: 'pwa', label: 'PWA (Full Shell)' },
  { id: 'project-hub', label: 'Project Hub' },
  { id: 'accounting', label: 'Accounting' },
  { id: 'estimating', label: 'Estimating' },
  { id: 'business-development', label: 'Business Development' },
  { id: 'safety', label: 'Safety' },
  { id: 'quality-control-warranty', label: 'Quality Control & Warranty' },
  { id: 'risk-management', label: 'Risk Management' },
  { id: 'leadership', label: 'Leadership' },
  { id: 'operational-excellence', label: 'Operational Excellence' },
  { id: 'human-resources', label: 'Human Resources' },
  { id: 'admin', label: 'Admin' },
  { id: 'site-control', label: 'HB Site Control' },
];

/** Map tab IDs to WorkspaceId for WebpartPreview (Phase 5 — corrected). */
const TAB_TO_WORKSPACE: Record<string, string> = {
  'project-hub': 'project-hub',
  accounting: 'accounting',
  estimating: 'estimating',
  'business-development': 'business-development',
  safety: 'safety',
  'quality-control-warranty': 'quality-control-warranty',
  'risk-management': 'risk-management',
  leadership: 'leadership',
  'operational-excellence': 'operational-excellence',
  'human-resources': 'human-resources',
  admin: 'admin',
};

const VALID_TAB_IDS = new Set<TabId>(TABS.map((tab) => tab.id));

/**
 * Allow deterministic harness deep links (`/?tab=<id>`) for dev QA and e2e.
 * This keeps tab-based verification stable even when shell chrome overlays
 * can intercept pointer events during automated clicks.
 */
function getInitialTabFromLocation(): TabId {
  if (typeof window === 'undefined') {
    return 'pwa';
  }

  const tabParam = new URLSearchParams(window.location.search).get('tab');
  if (tabParam && VALID_TAB_IDS.has(tabParam as TabId)) {
    return tabParam as TabId;
  }

  return 'pwa';
}

function syncTabToLocation(tabId: TabId): void {
  if (typeof window === 'undefined') {
    return;
  }

  const nextUrl = new URL(window.location.href);
  nextUrl.searchParams.set('tab', tabId);
  window.history.replaceState({}, '', nextUrl);
}

function renderTab(activeTab: TabId) {
  if (activeTab === 'pwa') return <PwaPreview />;
  if (activeTab === 'site-control') return <SiteControlPreview />;
  const workspaceId = TAB_TO_WORKSPACE[activeTab];
  if (workspaceId) return <WebpartPreview workspaceId={workspaceId} />;
  return null;
}

export function TabRouter() {
  const [activeTab, setActiveTab] = useState<TabId>(() => getInitialTabFromLocation());

  const onTabSelect = (_: unknown, data: SelectTabData) => {
    const nextTab = data.value as TabId;
    setActiveTab(nextTab);
    syncTabToLocation(nextTab);
  };

  return (
    <>
      <div className="harness-tabs">
        <TabList selectedValue={activeTab} onTabSelect={onTabSelect} size="small">
          {TABS.map((tab) => (
            <Tab key={tab.id} value={tab.id}>
              {tab.label}
            </Tab>
          ))}
        </TabList>
      </div>
      <div className="harness-content">
        {renderTab(activeTab)}
      </div>
    </>
  );
}
