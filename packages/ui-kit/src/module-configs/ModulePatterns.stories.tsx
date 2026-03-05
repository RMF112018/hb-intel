/**
 * Module Pattern Stories — PH4.13 §13.8
 * Blueprint §1d — Demonstrates module configs wired into ui-kit layouts
 *
 * PH4B.2 — Configs now imported from @hbc/shell (F-014)
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HbcDataTable } from '../HbcDataTable/index.js';
import { HbcKpiCard } from '../HbcKpiCard/index.js';
import { HbcCalendarGrid } from '../HbcCalendarGrid/index.js';
import { HbcScoreBar } from '../HbcScoreBar/index.js';
import {
  scorecardsLanding,
  rfisLanding,
  punchListLanding,
  budgetLanding,
  turnoverLanding,
  documentsLanding,
} from '@hbc/shell';

// Helper: generate sample rows
function generateRows(count: number): Record<string, unknown>[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `item-${i + 1}`,
    vendorName: `Vendor ${i + 1}`,
    overallScore: Math.round(Math.random() * 100),
    category: ['Structural', 'MEP', 'Civil'][i % 3],
    status: ['Active', 'Pending', 'Expired'][i % 3],
    ballInCourt: i % 3 === 0 ? 'current-user' : `user-${i}`,
    lastUpdated: '2026-03-01',
    expirationDate: '2026-06-01',
    rfiNumber: `RFI-${String(i + 1).padStart(3, '0')}`,
    subject: `Request for Information ${i + 1}`,
    priority: ['High', 'Medium', 'Low'][i % 3],
    dueDate: '2026-03-15',
    daysOpen: Math.round(Math.random() * 30),
    costImpact: `$${(Math.random() * 50000).toFixed(0)}`,
    itemNumber: `PI-${String(i + 1).padStart(3, '0')}`,
    description: `Punch item ${i + 1} description`,
    assigneeId: i % 3 === 0 ? 'current-user' : `user-${i}`,
    location: `Floor ${(i % 5) + 1}`,
    trade: ['Electrical', 'Plumbing', 'HVAC', 'Drywall'][i % 4],
    costCode: `${String((i % 16) + 1).padStart(2, '0')}-${String(i * 100).padStart(4, '0')}`,
    originalBudget: (Math.random() * 100000).toFixed(0),
    approvedChanges: (Math.random() * 10000).toFixed(0),
    revisedBudget: (Math.random() * 110000).toFixed(0),
    committedCosts: (Math.random() * 80000).toFixed(0),
    pendingChanges: (Math.random() * 5000).toFixed(0),
    projectedCost: (Math.random() * 100000).toFixed(0),
    variance: (Math.random() * 10000 - 5000).toFixed(0),
    packageNumber: `TO-${String(i + 1).padStart(3, '0')}`,
    packageName: `Turnover Package ${i + 1}`,
    area: `Zone ${String.fromCharCode(65 + (i % 4))}`,
    pendingSignatoryId: i % 3 === 0 ? 'current-user' : `user-${i}`,
    completionPercent: `${Math.round(Math.random() * 100)}%`,
    targetDate: '2026-04-15',
    name: `Document ${i + 1}.pdf`,
    type: ['PDF', 'DWG', 'XLSX', 'DOCX'][i % 4],
    size: `${(Math.random() * 10).toFixed(1)} MB`,
    modifiedBy: `User ${(i % 5) + 1}`,
    modifiedAt: '2026-03-01',
    version: `v${(i % 3) + 1}`,
  }));
}

const sampleData = generateRows(25);

const meta: Meta = {
  title: 'Module Patterns/Landing Pages',
  parameters: { layout: 'padded' },
};

export default meta;

export const ScorecardLanding: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 style={{ margin: 0 }}>{scorecardsLanding.toolName}</h2>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {scorecardsLanding.kpiCards.map((kpi) => (
          <HbcKpiCard key={kpi.id} label={kpi.label} value={kpi.value} />
        ))}
      </div>
      <HbcDataTable
        data={sampleData}
        columns={scorecardsLanding.table.columns}
        enableSorting
        responsibilityField={scorecardsLanding.table.responsibilityField}
        currentUserId="current-user"
        height="400px"
      />
      <div style={{ maxWidth: 300 }}>
        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Score Bar (detail view)</p>
        <HbcScoreBar score={72} showLabel />
      </div>
    </div>
  ),
};

export const RfiLanding: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 style={{ margin: 0 }}>{rfisLanding.toolName}</h2>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {rfisLanding.kpiCards.map((kpi) => (
          <HbcKpiCard key={kpi.id} label={kpi.label} value={kpi.value} />
        ))}
      </div>
      <div style={{ maxWidth: 700 }}>
        <HbcDataTable
          data={sampleData}
          columns={rfisLanding.table.columns}
          enableSorting
          frozenColumns={rfisLanding.table.frozenColumns}
          responsibilityField={rfisLanding.table.responsibilityField}
          currentUserId="current-user"
          height="400px"
        />
      </div>
    </div>
  ),
};

export const PunchListDashboard: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 style={{ margin: 0 }}>{punchListLanding.toolName}</h2>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {punchListLanding.kpiCards.map((kpi) => (
          <HbcKpiCard key={kpi.id} label={kpi.label} value={kpi.value} />
        ))}
      </div>
      <HbcDataTable
        data={sampleData}
        columns={punchListLanding.table.columns}
        enableSorting
        responsibilityField={punchListLanding.table.responsibilityField}
        currentUserId="current-user"
        height="400px"
      />
    </div>
  ),
};

export const BudgetLanding: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 style={{ margin: 0 }}>{budgetLanding.toolName}</h2>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {budgetLanding.kpiCards.map((kpi) => (
          <HbcKpiCard key={kpi.id} label={kpi.label} value={kpi.value} />
        ))}
      </div>
      <div style={{ maxWidth: 800 }}>
        <HbcDataTable
          data={sampleData}
          columns={budgetLanding.table.columns}
          enableSorting
          frozenColumns={budgetLanding.table.frozenColumns}
          densityTier={budgetLanding.table.defaultDensity}
          height="400px"
        />
      </div>
    </div>
  ),
};

export const DailyLogCalendar: StoryObj = {
  render: () => {
    const [year, setYear] = React.useState(2026);
    const [month, setMonth] = React.useState(2);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 600 }}>
        <h2 style={{ margin: 0 }}>Daily Log</h2>
        <HbcCalendarGrid
          year={year}
          month={month}
          days={[
            { date: '2026-03-02', status: 'approved', crewCount: 24 },
            { date: '2026-03-03', status: 'approved', crewCount: 22 },
            { date: '2026-03-04', status: 'submitted', crewCount: 18 },
            { date: '2026-03-05', status: 'draft' },
          ]}
          onDayClick={(date) => console.log('Open daily log:', date)}
          onMonthChange={(dir) => {
            let m = month + dir;
            let y = year;
            if (m < 0) { m = 11; y -= 1; }
            if (m > 11) { m = 0; y += 1; }
            setMonth(m);
            setYear(y);
          }}
        />
      </div>
    );
  },
};

export const TurnoverLanding: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 style={{ margin: 0 }}>{turnoverLanding.toolName}</h2>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {turnoverLanding.kpiCards.map((kpi) => (
          <HbcKpiCard key={kpi.id} label={kpi.label} value={kpi.value} />
        ))}
      </div>
      <HbcDataTable
        data={sampleData}
        columns={turnoverLanding.table.columns}
        enableSorting
        responsibilityField={turnoverLanding.table.responsibilityField}
        currentUserId="current-user"
        height="400px"
      />
    </div>
  ),
};

export const DocumentsExplorer: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 style={{ margin: 0 }}>{documentsLanding.toolName}</h2>
      <div style={{ display: 'flex', gap: 8 }}>
        {/* Simplified tree + table + panel layout */}
        <div style={{ width: '25%', borderRight: '1px solid #D1D5DB', paddingRight: 8 }}>
          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Folder Tree</p>
          <ul style={{ fontSize: 13, listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ padding: '4px 0' }}>Project Documents</li>
            <li style={{ padding: '4px 0', paddingLeft: 16 }}>Specifications</li>
            <li style={{ padding: '4px 0', paddingLeft: 16 }}>Submittals</li>
            <li style={{ padding: '4px 0', paddingLeft: 16 }}>Contracts</li>
          </ul>
        </div>
        <div style={{ flex: 1 }}>
          <HbcDataTable
            data={sampleData.slice(0, 10)}
            columns={documentsLanding.table.columns}
            enableSorting
            height="350px"
          />
        </div>
      </div>
    </div>
  ),
};
