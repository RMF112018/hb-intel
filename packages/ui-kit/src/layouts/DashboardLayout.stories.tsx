import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FluentProvider } from '@fluentui/react-components';
import { HbcAppShell } from '../HbcAppShell/HbcAppShell.js';
import { DashboardLayout } from './DashboardLayout.js';
import { hbcFieldTheme } from '../theme/theme.js';
import { BudgetLine, DrawingSheet, RFI } from '../icons/index.js';
import type { SidebarNavGroup, ShellUser } from '../HbcAppShell/types.js';
import type { KpiCardData } from './types.js';

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
    ],
  },
];

const mockKpiCards: KpiCardData[] = [
  { id: 'revenue', label: 'Revenue (MTD)', value: '$2.4M', trend: 'up', trendValue: '+12% vs last month' },
  { id: 'active-projects', label: 'Active Projects', value: 18, trend: 'up', trendValue: '+2 this quarter' },
  { id: 'overdue-rfis', label: 'Overdue RFIs', value: 7, trend: 'down', trendValue: '-3 this week' },
  { id: 'safety-rating', label: 'Safety Rating', value: '98.2%', trend: 'flat', trendValue: 'No change' },
];

const MockChartContent: React.FC = () => (
  <div
    style={{
      height: '240px',
      backgroundColor: '#F3F4F6',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#6B7280',
      fontSize: '0.875rem',
      border: '1px dashed #D1D5DB',
    }}
  >
    Chart placeholder (Revenue trend, project timeline, etc.)
  </div>
);

const MockDataContent: React.FC = () => (
  <div style={{ color: '#6B7280', fontSize: '0.875rem' }}>
    <p>Data zone — recent activity feed, project list, or summary table goes here.</p>
  </div>
);

const meta: Meta<typeof DashboardLayout> = {
  title: 'Layouts/DashboardLayout',
  component: DashboardLayout,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof DashboardLayout>;

export const Default: Story = {
  render: () => (
    <HbcAppShell user={mockUser} sidebarGroups={mockGroups}>
      <DashboardLayout kpiCards={mockKpiCards} chartContent={<MockChartContent />}>
        <MockDataContent />
      </DashboardLayout>
    </HbcAppShell>
  ),
};

export const WithoutKpis: Story = {
  render: () => (
    <HbcAppShell user={mockUser} sidebarGroups={mockGroups}>
      <DashboardLayout chartContent={<MockChartContent />}>
        <MockDataContent />
      </DashboardLayout>
    </HbcAppShell>
  ),
};

export const WithoutChart: Story = {
  render: () => (
    <HbcAppShell user={mockUser} sidebarGroups={mockGroups}>
      <DashboardLayout kpiCards={mockKpiCards}>
        <MockDataContent />
      </DashboardLayout>
    </HbcAppShell>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '4px' }}>Full dashboard (KPIs + chart + data)</p>
        <div style={{ height: '500px', overflow: 'hidden' }}>
          <HbcAppShell user={mockUser} sidebarGroups={mockGroups}>
            <DashboardLayout kpiCards={mockKpiCards} chartContent={<MockChartContent />}>
              <MockDataContent />
            </DashboardLayout>
          </HbcAppShell>
        </div>
      </div>
      <div>
        <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '4px' }}>Without KPIs</p>
        <div style={{ height: '350px', overflow: 'hidden' }}>
          <HbcAppShell user={mockUser} sidebarGroups={mockGroups}>
            <DashboardLayout chartContent={<MockChartContent />}>
              <MockDataContent />
            </DashboardLayout>
          </HbcAppShell>
        </div>
      </div>
      <div>
        <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '4px' }}>Without chart</p>
        <div style={{ height: '250px', overflow: 'hidden' }}>
          <HbcAppShell user={mockUser} sidebarGroups={mockGroups}>
            <DashboardLayout kpiCards={mockKpiCards}>
              <MockDataContent />
            </DashboardLayout>
          </HbcAppShell>
        </div>
      </div>
    </div>
  ),
};

export const FieldMode: Story = {
  render: () => (
    <FluentProvider theme={hbcFieldTheme}>
      <div style={{ backgroundColor: '#0F1419', minHeight: '100vh' }}>
        <HbcAppShell user={mockUser} sidebarGroups={mockGroups}>
          <DashboardLayout kpiCards={mockKpiCards} chartContent={<MockChartContent />}>
            <MockDataContent />
          </DashboardLayout>
        </HbcAppShell>
      </div>
    </FluentProvider>
  ),
};

export const A11yTest: Story = {
  name: 'A11y Test (KPI Grid)',
  render: () => (
    <div>
      <p style={{ marginBottom: '16px', fontSize: '0.875rem', color: '#605E5C' }}>
        KPI cards should have descriptive labels. The grid is responsive: 4-col on desktop, 2-col on tablet,
        1-col on mobile. Chart and data zones are semantically grouped with
        <code> data-hbc-layout=&quot;dashboard&quot;</code>.
      </p>
      <HbcAppShell user={mockUser} sidebarGroups={mockGroups}>
        <DashboardLayout kpiCards={mockKpiCards} chartContent={<MockChartContent />}>
          <MockDataContent />
        </DashboardLayout>
      </HbcAppShell>
    </div>
  ),
};
