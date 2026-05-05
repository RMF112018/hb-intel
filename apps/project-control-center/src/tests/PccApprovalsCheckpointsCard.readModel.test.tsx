import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { SAMPLE_APPROVAL_CHECKPOINTS, type ApprovalRequestState } from '@hbc/models/pcc';
import { PccBentoGrid } from '../layout/PccBentoGrid';
import {
  PccApprovalsCheckpointsCard,
  type IPccApprovalsCheckpointsCardViewModel,
} from '../surfaces/projectHome/PccApprovalsCheckpointsCard';

function renderInBento(node: ReactElement): ReturnType<typeof render> {
  return render(<PccBentoGrid forceMode="wideDesktop">{node}</PccBentoGrid>);
}

function viewModel(): IPccApprovalsCheckpointsCardViewModel {
  return {
    rows: [
      {
        approvalRequestId: 'req-A',
        title: 'Approval pending review',
        state: 'pending-review' as ApprovalRequestState,
        assignedRoleLabel: 'Project Executive',
        priorityLabel: 'High',
        createdAtDisplay: '2026-04-15',
      },
      {
        approvalRequestId: 'req-B',
        title: 'Revision requested',
        state: 'revision-requested' as ApprovalRequestState,
        assignedRoleLabel: 'Project Manager',
        priorityLabel: 'Normal',
        createdAtDisplay: '2026-04-15',
      },
    ],
    pendingActiveCount: 9,
    terminalCount: 13,
    totalRequests: 12,
  };
}

describe('PccApprovalsCheckpointsCard — fixture-fallback path', () => {
  it('renders the legacy SAMPLE_APPROVAL_CHECKPOINTS row count when no viewModel is supplied', () => {
    const { container } = renderInBento(<PccApprovalsCheckpointsCard />);
    const rows = container.querySelectorAll('[data-pcc-approval-checkpoint-id]');
    expect(rows).toHaveLength(SAMPLE_APPROVAL_CHECKPOINTS.length);
  });

  it('emits data-pcc-approvals-card-source="fixture" on the fixture path', () => {
    const { container } = renderInBento(<PccApprovalsCheckpointsCard />);
    const marker = container.querySelector('[data-pcc-approvals-card-source]');
    expect(marker).not.toBeNull();
    expect(marker!.getAttribute('data-pcc-approvals-card-source')).toBe('fixture');
  });
});

describe('PccApprovalsCheckpointsCard — view-model-driven path', () => {
  it('renders one row per viewModel.rows entry', () => {
    const vm = viewModel();
    const { container } = renderInBento(<PccApprovalsCheckpointsCard viewModel={vm} />);
    const rows = container.querySelectorAll('[data-pcc-approval-checkpoint-id]');
    expect(rows).toHaveLength(vm.rows.length);
  });

  it('emits data-pcc-approvals-card-source="read-model" on the view-model path', () => {
    const { container } = renderInBento(<PccApprovalsCheckpointsCard viewModel={viewModel()} />);
    const marker = container.querySelector('[data-pcc-approvals-card-source]');
    expect(marker).not.toBeNull();
    expect(marker!.getAttribute('data-pcc-approvals-card-source')).toBe('read-model');
  });

  it('renders a summary row with totals from the view-model', () => {
    const vm = viewModel();
    const { container } = renderInBento(<PccApprovalsCheckpointsCard viewModel={vm} />);
    const summary = container.querySelector('[data-pcc-approvals-card-summary]');
    expect(summary).not.toBeNull();
    const text = summary!.textContent ?? '';
    expect(text).toContain(`Total: ${vm.totalRequests}`);
    expect(text).toContain(`Pending or active: ${vm.pendingActiveCount}`);
    expect(text).toContain(`Terminal: ${vm.terminalCount}`);
  });
});

describe('PccApprovalsCheckpointsCard — structural no-mutation guards', () => {
  it('contains no anchors with http(s) hrefs in either render path', () => {
    for (const node of [
      renderInBento(<PccApprovalsCheckpointsCard />).container,
      renderInBento(<PccApprovalsCheckpointsCard viewModel={viewModel()} />).container,
    ]) {
      const anchors = node.querySelectorAll('a[href]');
      for (const a of Array.from(anchors)) {
        const href = a.getAttribute('href') ?? '';
        expect(/^https?:/.test(href)).toBe(false);
      }
    }
  });

  it('contains no enabled buttons in either render path', () => {
    for (const node of [
      renderInBento(<PccApprovalsCheckpointsCard />).container,
      renderInBento(<PccApprovalsCheckpointsCard viewModel={viewModel()} />).container,
    ]) {
      const buttons = node.querySelectorAll('button');
      for (const btn of Array.from(buttons)) {
        const isAriaDisabled = btn.getAttribute('aria-disabled') === 'true';
        expect(
          (btn as HTMLButtonElement).disabled || isAriaDisabled,
          `enabled button in approvals card: ${btn.outerHTML.slice(0, 80)}`,
        ).toBe(true);
      }
    }
  });

  it('contains no forms or file inputs in either render path', () => {
    for (const node of [
      renderInBento(<PccApprovalsCheckpointsCard />).container,
      renderInBento(<PccApprovalsCheckpointsCard viewModel={viewModel()} />).container,
    ]) {
      expect(node.querySelector('form')).toBeNull();
      expect(node.querySelector('input[type="file"]')).toBeNull();
    }
  });
});
