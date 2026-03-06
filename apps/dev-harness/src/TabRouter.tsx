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

function renderTab(activeTab: TabId) {
  if (activeTab === 'pwa') return <PwaPreview />;
  if (activeTab === 'site-control') return <SiteControlPreview />;
  const workspaceId = TAB_TO_WORKSPACE[activeTab];
  if (workspaceId) return <WebpartPreview workspaceId={workspaceId} />;
  return null;
}

export function TabRouter() {
  const [activeTab, setActiveTab] = useState<TabId>('pwa');

  const onTabSelect = (_: unknown, data: SelectTabData) => {
    setActiveTab(data.value as TabId);
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
