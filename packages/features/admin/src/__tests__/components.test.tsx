import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdminAlertBadge } from '../components/AdminAlertBadge.js';
import { AdminAlertDashboard } from '../components/AdminAlertDashboard.js';
import { ImplementationTruthDashboard } from '../components/ImplementationTruthDashboard.js';
import { ApprovalAuthorityTable } from '../components/ApprovalAuthorityTable.js';
import { ApprovalRuleEditor } from '../components/ApprovalRuleEditor.js';
import type { IAdminAlertBadge } from '../types/IAdminAlertBadge.js';
import type { UseAdminAlertsResult } from '../types/UseAdminAlertsResult.js';
import type { UseInfrastructureProbesResult } from '../types/UseInfrastructureProbesResult.js';
import type { UseApprovalAuthorityResult } from '../types/UseApprovalAuthorityResult.js';
import {
  createMockAdminAlert,
  createMockProbeResult,
  createMockProbeSnapshot,
  createMockApprovalAuthorityRule,
} from '@hbc/features-admin/testing';

// Mock the hooks
const mockUseAdminAlerts = vi.fn<() => UseAdminAlertsResult>();
vi.mock('../hooks/useAdminAlerts.js', () => ({
  useAdminAlerts: () => mockUseAdminAlerts(),
}));

const mockUseInfrastructureProbes = vi.fn<() => UseInfrastructureProbesResult>();
vi.mock('../hooks/useInfrastructureProbes.js', () => ({
  useInfrastructureProbes: () => mockUseInfrastructureProbes(),
}));

const mockUseApprovalAuthority = vi.fn<() => UseApprovalAuthorityResult>();
vi.mock('../hooks/useApprovalAuthority.js', () => ({
  useApprovalAuthority: () => mockUseApprovalAuthority(),
}));

// Mock ui-kit components
vi.mock('@hbc/ui-kit', () => ({
  HbcStatusBadge: ({ variant, label }: { variant: string; label: string }) =>
    React.createElement('span', { 'data-testid': 'status-badge', 'data-variant': variant }, label),
  HbcTooltip: ({ content, children }: { content: string; children: React.ReactElement }) =>
    React.createElement('div', { 'data-testid': 'tooltip', 'data-content': content }, children),
  HbcSpinner: ({ label }: { label?: string }) =>
    React.createElement('div', { 'data-testid': 'spinner' }, label),
  HbcBanner: ({ variant, children, ...rest }: { variant: string; children: React.ReactNode; [key: string]: unknown }) =>
    React.createElement('div', { 'data-testid': 'banner', 'data-variant': variant, ...rest }, children),
  HbcButton: ({ children, onClick, ...rest }: { children: React.ReactNode; onClick?: () => void; [key: string]: unknown }) =>
    React.createElement('button', { 'data-testid': 'button', onClick, ...rest }, children),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

function createMockBadge(overrides?: Partial<IAdminAlertBadge>): IAdminAlertBadge {
  return {
    criticalCount: 0,
    highCount: 0,
    mediumCount: 0,
    lowCount: 0,
    totalCount: 0,
    ...overrides,
  };
}

function defaultHookResult(overrides?: Partial<UseAdminAlertsResult>): UseAdminAlertsResult {
  return {
    alerts: [],
    filteredAlerts: vi.fn(() => []),
    badge: createMockBadge(),
    acknowledge: vi.fn(async () => {}),
    refresh: vi.fn(async () => {}),
    isLoading: false,
    error: null,
    ...overrides,
  };
}

function defaultProbesResult(overrides?: Partial<UseInfrastructureProbesResult>): UseInfrastructureProbesResult {
  return {
    latestSnapshot: null,
    probeStatusMap: new Map(),
    refresh: vi.fn(async () => {}),
    lastRunAt: null,
    isLoading: false,
    error: null,
    ...overrides,
  };
}

function defaultApprovalResult(overrides?: Partial<UseApprovalAuthorityResult>): UseApprovalAuthorityResult {
  return {
    rules: [],
    ruleByContext: vi.fn(() => undefined),
    upsertRule: vi.fn(async () => {}),
    deleteRule: vi.fn(async () => {}),
    testEligibility: vi.fn(async () => ({ eligible: false, matchedRuleId: null, reason: 'no rule' })),
    isLoading: false,
    error: null,
    ...overrides,
  };
}

// ── AdminAlertBadge ─────────────────────────────────────────────

describe('AdminAlertBadge', () => {
  it('renders nothing when totalCount is 0', () => {
    const { container } = render(
      React.createElement(AdminAlertBadge, {
        badge: createMockBadge(),
        onOpenDashboard: vi.fn(),
      }),
    );
    expect(container.innerHTML).toBe('');
  });

  it('shows count when totalCount > 0', () => {
    render(
      React.createElement(AdminAlertBadge, {
        badge: createMockBadge({ totalCount: 5, mediumCount: 5 }),
        onOpenDashboard: vi.fn(),
      }),
    );
    const badge = screen.getByTestId('status-badge');
    expect(badge).toHaveTextContent('5');
  });

  it('uses error variant when criticalCount > 0', () => {
    render(
      React.createElement(AdminAlertBadge, {
        badge: createMockBadge({ totalCount: 3, criticalCount: 1, mediumCount: 2 }),
        onOpenDashboard: vi.fn(),
      }),
    );
    const badge = screen.getByTestId('status-badge');
    expect(badge).toHaveAttribute('data-variant', 'error');
  });

  it('uses error variant when highCount > 0', () => {
    render(
      React.createElement(AdminAlertBadge, {
        badge: createMockBadge({ totalCount: 2, highCount: 2 }),
        onOpenDashboard: vi.fn(),
      }),
    );
    const badge = screen.getByTestId('status-badge');
    expect(badge).toHaveAttribute('data-variant', 'error');
  });

  it('uses warning variant when only medium/low alerts', () => {
    render(
      React.createElement(AdminAlertBadge, {
        badge: createMockBadge({ totalCount: 3, mediumCount: 2, lowCount: 1 }),
        onOpenDashboard: vi.fn(),
      }),
    );
    const badge = screen.getByTestId('status-badge');
    expect(badge).toHaveAttribute('data-variant', 'warning');
  });

  it('calls onOpenDashboard on click', () => {
    const handler = vi.fn();
    render(
      React.createElement(AdminAlertBadge, {
        badge: createMockBadge({ totalCount: 1, lowCount: 1 }),
        onOpenDashboard: handler,
      }),
    );
    fireEvent.click(screen.getByRole('status'));
    expect(handler).toHaveBeenCalledOnce();
  });

  it('calls onOpenDashboard on Enter keydown', () => {
    const handler = vi.fn();
    render(
      React.createElement(AdminAlertBadge, {
        badge: createMockBadge({ totalCount: 1, lowCount: 1 }),
        onOpenDashboard: handler,
      }),
    );
    fireEvent.keyDown(screen.getByRole('status'), { key: 'Enter' });
    expect(handler).toHaveBeenCalledOnce();
  });

  it('has correct aria attributes', () => {
    render(
      React.createElement(AdminAlertBadge, {
        badge: createMockBadge({ totalCount: 7, mediumCount: 7 }),
        onOpenDashboard: vi.fn(),
      }),
    );
    const el = screen.getByRole('status');
    expect(el).toHaveAttribute('aria-label', '7 admin alerts');
    expect(el).toHaveAttribute('aria-live', 'polite');
  });

  it('uses singular aria-label for 1 alert', () => {
    render(
      React.createElement(AdminAlertBadge, {
        badge: createMockBadge({ totalCount: 1, lowCount: 1 }),
        onOpenDashboard: vi.fn(),
      }),
    );
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', '1 admin alert');
  });
});

// ── AdminAlertDashboard ─────────────────────────────────────────

describe('AdminAlertDashboard', () => {
  const Wrapper = createWrapper();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading spinner when loading', () => {
    mockUseAdminAlerts.mockReturnValue(defaultHookResult({ isLoading: true }));
    render(React.createElement(Wrapper, null,
      React.createElement(AdminAlertDashboard),
    ));
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('shows error banner on error', () => {
    mockUseAdminAlerts.mockReturnValue(
      defaultHookResult({ error: new Error('Network failure') }),
    );
    render(React.createElement(Wrapper, null,
      React.createElement(AdminAlertDashboard),
    ));
    const banner = screen.getByTestId('banner');
    expect(banner).toHaveAttribute('data-variant', 'error');
    expect(banner).toHaveTextContent('Network failure');
  });

  it('shows empty state when no alerts', () => {
    mockUseAdminAlerts.mockReturnValue(defaultHookResult());
    render(React.createElement(Wrapper, null,
      React.createElement(AdminAlertDashboard),
    ));
    expect(screen.getByText('No alerts')).toBeInTheDocument();
  });

  it('renders alerts grouped by severity', () => {
    const alerts = [
      createMockAdminAlert({ alertId: 'a1', severity: 'critical', title: 'Critical Alert' }),
      createMockAdminAlert({ alertId: 'a2', severity: 'low', title: 'Low Alert' }),
      createMockAdminAlert({ alertId: 'a3', severity: 'critical', title: 'Critical Alert 2' }),
    ];
    mockUseAdminAlerts.mockReturnValue(defaultHookResult({ alerts }));
    render(React.createElement(Wrapper, null,
      React.createElement(AdminAlertDashboard),
    ));
    // Critical group appears first
    const groups = screen.getAllByRole('listitem');
    expect(groups).toHaveLength(2); // critical and low
    expect(screen.getByText('Critical Alert')).toBeInTheDocument();
    expect(screen.getByText('Low Alert')).toBeInTheDocument();
  });

  it('acknowledge button calls hook acknowledge', () => {
    const acknowledgeFn = vi.fn(async () => {});
    const alerts = [
      createMockAdminAlert({ alertId: 'a1', severity: 'high', title: 'Test Alert' }),
    ];
    mockUseAdminAlerts.mockReturnValue(
      defaultHookResult({ alerts, acknowledge: acknowledgeFn }),
    );
    render(React.createElement(Wrapper, null,
      React.createElement(AdminAlertDashboard),
    ));
    const ackButton = screen.getByText('Acknowledge');
    fireEvent.click(ackButton);
    expect(acknowledgeFn).toHaveBeenCalledWith('a1');
  });

  it('does not render acknowledge button for already acknowledged alerts', () => {
    const alerts = [
      createMockAdminAlert({
        alertId: 'a1',
        severity: 'medium',
        title: 'Acked Alert',
        acknowledgedAt: '2026-01-01T00:00:00.000Z',
        acknowledgedBy: 'user-1',
      }),
    ];
    mockUseAdminAlerts.mockReturnValue(defaultHookResult({ alerts }));
    render(React.createElement(Wrapper, null,
      React.createElement(AdminAlertDashboard),
    ));
    expect(screen.queryByText('Acknowledge')).not.toBeInTheDocument();
  });

  it('severity filter narrows results', () => {
    const alerts = [
      createMockAdminAlert({ alertId: 'a1', severity: 'critical', title: 'Crit' }),
      createMockAdminAlert({ alertId: 'a2', severity: 'low', title: 'Lo' }),
    ];
    mockUseAdminAlerts.mockReturnValue(defaultHookResult({ alerts }));
    render(React.createElement(Wrapper, null,
      React.createElement(AdminAlertDashboard),
    ));
    const severitySelect = screen.getByLabelText('Filter by severity');
    fireEvent.change(severitySelect, { target: { value: 'low' } });
    expect(screen.queryByText('Crit')).not.toBeInTheDocument();
    expect(screen.getByText('Lo')).toBeInTheDocument();
  });

  it('rows are keyboard focusable', () => {
    const alerts = [
      createMockAdminAlert({ alertId: 'a1', severity: 'high', title: 'Focus Test' }),
    ];
    mockUseAdminAlerts.mockReturnValue(defaultHookResult({ alerts }));
    render(React.createElement(Wrapper, null,
      React.createElement(AdminAlertDashboard),
    ));
    const row = screen.getByLabelText('Alert: Focus Test');
    expect(row).toHaveAttribute('tabindex', '0');
  });

  it('has filter toolbar with proper aria', () => {
    mockUseAdminAlerts.mockReturnValue(defaultHookResult());
    render(React.createElement(Wrapper, null,
      React.createElement(AdminAlertDashboard),
    ));
    expect(screen.getByRole('toolbar')).toHaveAttribute('aria-label', 'Alert filters');
  });
});

// ── ImplementationTruthDashboard ────────────────────────────────

describe('ImplementationTruthDashboard', () => {
  const Wrapper = createWrapper();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading spinner when loading', () => {
    mockUseInfrastructureProbes.mockReturnValue(defaultProbesResult({ isLoading: true }));
    render(React.createElement(Wrapper, null,
      React.createElement(ImplementationTruthDashboard),
    ));
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('shows error banner on error', () => {
    mockUseInfrastructureProbes.mockReturnValue(
      defaultProbesResult({ error: new Error('Probe failure') }),
    );
    render(React.createElement(Wrapper, null,
      React.createElement(ImplementationTruthDashboard),
    ));
    const banner = screen.getByTestId('banner');
    expect(banner).toHaveAttribute('data-variant', 'error');
    expect(banner).toHaveTextContent('Probe failure');
  });

  it('shows empty state when no snapshot', () => {
    mockUseInfrastructureProbes.mockReturnValue(defaultProbesResult());
    render(React.createElement(Wrapper, null,
      React.createElement(ImplementationTruthDashboard),
    ));
    expect(screen.getAllByText('No probe data')).toHaveLength(5);
  });

  it('renders 5 probe sections', () => {
    const snapshot = createMockProbeSnapshot({
      results: [
        createMockProbeResult({ probeKey: 'sharepoint-infrastructure', status: 'healthy', summary: 'SP OK' }),
        createMockProbeResult({ probeKey: 'azure-functions', status: 'degraded', summary: 'AF Warn' }),
        createMockProbeResult({ probeKey: 'azure-search', status: 'error', summary: 'AS Err' }),
        createMockProbeResult({ probeKey: 'notification-system', status: 'unknown', summary: 'NS Unk' }),
        createMockProbeResult({ probeKey: 'module-record-health', status: 'healthy', summary: 'MR OK' }),
      ],
    });
    mockUseInfrastructureProbes.mockReturnValue(
      defaultProbesResult({ latestSnapshot: snapshot, lastRunAt: new Date().toISOString() }),
    );
    render(React.createElement(Wrapper, null,
      React.createElement(ImplementationTruthDashboard),
    ));
    const sections = screen.getAllByRole('region');
    expect(sections).toHaveLength(5);
    expect(screen.getByText('SP OK')).toBeInTheDocument();
    expect(screen.getByText('AF Warn')).toBeInTheDocument();
    expect(screen.getByText('AS Err')).toBeInTheDocument();
  });

  it('shows staleness warning when lastRunAt > 30min ago', () => {
    const staleTime = new Date(Date.now() - 31 * 60 * 1000).toISOString();
    mockUseInfrastructureProbes.mockReturnValue(
      defaultProbesResult({ lastRunAt: staleTime }),
    );
    render(React.createElement(Wrapper, null,
      React.createElement(ImplementationTruthDashboard),
    ));
    expect(screen.getByText(/stale/i)).toBeInTheDocument();
  });

  it('run-probes button calls refresh', () => {
    const refreshFn = vi.fn(async () => {});
    mockUseInfrastructureProbes.mockReturnValue(
      defaultProbesResult({ refresh: refreshFn }),
    );
    render(React.createElement(Wrapper, null,
      React.createElement(ImplementationTruthDashboard),
    ));
    fireEvent.click(screen.getByLabelText('Run probes now'));
    expect(refreshFn).toHaveBeenCalledOnce();
  });
});

// ── ApprovalAuthorityTable ──────────────────────────────────────

describe('ApprovalAuthorityTable', () => {
  const Wrapper = createWrapper();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading spinner when loading', () => {
    mockUseApprovalAuthority.mockReturnValue(defaultApprovalResult({ isLoading: true }));
    render(React.createElement(Wrapper, null,
      React.createElement(ApprovalAuthorityTable, { onEditRule: vi.fn() }),
    ));
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('shows error banner on error', () => {
    mockUseApprovalAuthority.mockReturnValue(
      defaultApprovalResult({ error: new Error('Load failed') }),
    );
    render(React.createElement(Wrapper, null,
      React.createElement(ApprovalAuthorityTable, { onEditRule: vi.fn() }),
    ));
    const banner = screen.getByTestId('banner');
    expect(banner).toHaveAttribute('data-variant', 'error');
    expect(banner).toHaveTextContent('Load failed');
  });

  it('shows empty state when no rules', () => {
    mockUseApprovalAuthority.mockReturnValue(defaultApprovalResult());
    render(React.createElement(Wrapper, null,
      React.createElement(ApprovalAuthorityTable, { onEditRule: vi.fn() }),
    ));
    expect(screen.getByText('No approval rules configured')).toBeInTheDocument();
  });

  it('renders rules in table', () => {
    const rules = [
      createMockApprovalAuthorityRule({ ruleId: 'r1', approvalContext: 'provisioning-task-completion' }),
      createMockApprovalAuthorityRule({ ruleId: 'r2', approvalContext: 'bd-scorecard-director-review' }),
    ];
    mockUseApprovalAuthority.mockReturnValue(defaultApprovalResult({ rules }));
    render(React.createElement(Wrapper, null,
      React.createElement(ApprovalAuthorityTable, { onEditRule: vi.fn() }),
    ));
    expect(screen.getByText('provisioning-task-completion')).toBeInTheDocument();
    expect(screen.getByText('bd-scorecard-director-review')).toBeInTheDocument();
  });

  it('edit button fires onEditRule callback', () => {
    const editHandler = vi.fn();
    const rule = createMockApprovalAuthorityRule({ ruleId: 'r1' });
    mockUseApprovalAuthority.mockReturnValue(defaultApprovalResult({ rules: [rule] }));
    render(React.createElement(Wrapper, null,
      React.createElement(ApprovalAuthorityTable, { onEditRule: editHandler }),
    ));
    fireEvent.click(screen.getByLabelText('Edit rule: provisioning-task-completion'));
    expect(editHandler).toHaveBeenCalledWith(rule);
  });
});

// ── ApprovalRuleEditor ──────────────────────────────────────────

describe('ApprovalRuleEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form with labels', () => {
    render(
      React.createElement(ApprovalRuleEditor, {
        onSave: vi.fn(async () => {}),
        onCancel: vi.fn(),
      }),
    );
    expect(screen.getByLabelText(/Approver User IDs/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Approver Group IDs/)).toBeInTheDocument();
    expect(screen.getByLabelText('Approval Mode')).toBeInTheDocument();
  });

  it('validates empty approvers on save', () => {
    render(
      React.createElement(ApprovalRuleEditor, {
        onSave: vi.fn(async () => {}),
        onCancel: vi.fn(),
      }),
    );
    fireEvent.click(screen.getByText('Save'));
    expect(screen.getByRole('alert')).toHaveTextContent('At least one approver user or group is required.');
  });

  it('calls onSave with constructed rule', async () => {
    const saveFn = vi.fn(async () => {});
    render(
      React.createElement(ApprovalRuleEditor, {
        rule: createMockApprovalAuthorityRule(),
        onSave: saveFn,
        onCancel: vi.fn(),
      }),
    );
    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      fireEvent.click(screen.getByText('Save'));
    });
    expect(saveFn).toHaveBeenCalledOnce();
    const savedRule = saveFn.mock.calls[0]![0];
    expect(savedRule.approverUserIds).toEqual(['user-001']);
    expect(savedRule.approverGroupIds).toEqual(['group-001']);
  });

  it('calls onCancel when cancel clicked', () => {
    const cancelFn = vi.fn();
    render(
      React.createElement(ApprovalRuleEditor, {
        onSave: vi.fn(async () => {}),
        onCancel: cancelFn,
      }),
    );
    fireEvent.click(screen.getByText('Cancel'));
    expect(cancelFn).toHaveBeenCalledOnce();
  });
});
