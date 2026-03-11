import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HbcAiActionMenu, type HbcAiActionMenuProps } from './HbcAiActionMenu.js';
import { AiActionRegistry } from '../registry/AiActionRegistry.js';
import { AiGovernanceApi } from '../governance/AiGovernanceApi.js';
import { createMockAiAction } from '../../testing/createMockAiAction.js';

const baseProps: HbcAiActionMenuProps = {
  record: { id: 'sc-1' },
  host: 'project-canvas-toolbar',
  recordType: 'scorecard',
  recordId: 'sc-1',
  userId: 'user-1',
  currentRole: 'estimator',
  complexityTier: 'standard',
};

beforeEach(() => {
  AiActionRegistry._clearForTests();
  AiGovernanceApi._clearForTests();
});

describe('HbcAiActionMenu', () => {
  it('renders trigger button with data-testid', () => {
    render(<HbcAiActionMenu {...baseProps} />);
    expect(screen.getByTestId('ai-action-menu-trigger')).toBeDefined();
  });

  it('trigger button disabled when no actions available', () => {
    render(<HbcAiActionMenu {...baseProps} />);
    const trigger = screen.getByTestId('ai-action-menu-trigger');
    expect(trigger).toHaveProperty('disabled', true);
  });

  it('opens popover on trigger click, shows action items', () => {
    const action = createMockAiAction();
    AiActionRegistry.register('scorecard', action);

    render(<HbcAiActionMenu {...baseProps} />);
    fireEvent.click(screen.getByTestId('ai-action-menu-trigger'));

    expect(screen.getByTestId('ai-action-menu-popover')).toBeDefined();
    expect(screen.getByTestId(`ai-action-item-${action.actionKey}`)).toBeDefined();
  });

  it('actions listed in relevance-ranked order', () => {
    const low = createMockAiAction({ actionKey: 'low-priority', label: 'Low', basePriorityScore: 10 });
    const high = createMockAiAction({ actionKey: 'high-priority', label: 'High', basePriorityScore: 90 });
    AiActionRegistry.register('scorecard', low);
    AiActionRegistry.register('scorecard', high);

    render(<HbcAiActionMenu {...baseProps} />);
    fireEvent.click(screen.getByTestId('ai-action-menu-trigger'));

    const items = screen.getByTestId('ai-action-menu-popover').querySelectorAll('[role="menuitem"]');
    expect(items[0].getAttribute('data-testid')).toBe('ai-action-item-high-priority');
    expect(items[1].getAttribute('data-testid')).toBe('ai-action-item-low-priority');
  });

  it('filters actions by recordType and role', () => {
    const allowed = createMockAiAction({ actionKey: 'allowed', allowedRoles: ['estimator'] });
    const denied = createMockAiAction({ actionKey: 'denied', allowedRoles: ['admin'] });
    AiActionRegistry.register('scorecard', allowed);
    AiActionRegistry.register('scorecard', denied);

    render(<HbcAiActionMenu {...baseProps} />);
    fireEvent.click(screen.getByTestId('ai-action-menu-trigger'));

    expect(screen.getByTestId('ai-action-item-allowed')).toBeDefined();
    expect(screen.queryByTestId('ai-action-item-denied')).toBeNull();
  });

  it('filters actions by complexity tier', () => {
    const expertOnly = createMockAiAction({ actionKey: 'expert-only', minComplexity: 'expert' });
    AiActionRegistry.register('scorecard', expertOnly);

    render(<HbcAiActionMenu {...baseProps} complexityTier="essential" />);
    const trigger = screen.getByTestId('ai-action-menu-trigger');
    expect(trigger).toHaveProperty('disabled', true);
  });

  it('blocked action renders disabled with policy note', () => {
    // Register action without policy filtering at registry level
    // Use governance-only blocking via AiGovernanceApi.setPolicy
    // Note: disableActions filters at BOTH registry and governance level,
    // so we pass governance policy only to AiGovernanceApi (not as policyContext prop)
    const action = createMockAiAction({ actionKey: 'gov-blocked' });
    AiActionRegistry.register('scorecard', action);
    AiGovernanceApi.setPolicy({ disableActions: ['gov-blocked'] });

    render(<HbcAiActionMenu {...baseProps} />);
    fireEvent.click(screen.getByTestId('ai-action-menu-trigger'));

    const item = screen.getByTestId('ai-action-item-gov-blocked');
    expect(item).toHaveProperty('disabled', true);
    expect(screen.getByTestId('ai-action-blocked-note-gov-blocked')).toBeDefined();
  });

  it('approval-required action shows badge', () => {
    const action = createMockAiAction({ actionKey: 'needs-approval' });
    AiActionRegistry.register('scorecard', action);
    AiGovernanceApi.setPolicy({ requireApprovalActions: ['needs-approval'] });

    render(<HbcAiActionMenu {...baseProps} />);
    fireEvent.click(screen.getByTestId('ai-action-menu-trigger'));

    expect(screen.getByTestId('ai-action-approval-badge-needs-approval')).toBeDefined();
  });

  it('clicking action calls onActionSelect with actionKey', () => {
    const action = createMockAiAction({ actionKey: 'clickable' });
    AiActionRegistry.register('scorecard', action);
    const onActionSelect = vi.fn();

    render(<HbcAiActionMenu {...baseProps} onActionSelect={onActionSelect} />);
    fireEvent.click(screen.getByTestId('ai-action-menu-trigger'));
    fireEvent.click(screen.getByTestId('ai-action-item-clickable'));

    expect(onActionSelect).toHaveBeenCalledWith('clickable');
  });

  it('popover closes after action selection', () => {
    const action = createMockAiAction({ actionKey: 'closeable' });
    AiActionRegistry.register('scorecard', action);

    render(<HbcAiActionMenu {...baseProps} />);
    fireEvent.click(screen.getByTestId('ai-action-menu-trigger'));
    expect(screen.getByTestId('ai-action-menu-popover')).toBeDefined();

    fireEvent.click(screen.getByTestId('ai-action-item-closeable'));
    expect(screen.queryByTestId('ai-action-menu-popover')).toBeNull();
  });

  it('empty state shows disabled trigger, no popover content', () => {
    render(<HbcAiActionMenu {...baseProps} />);
    const trigger = screen.getByTestId('ai-action-menu-trigger');
    expect(trigger).toHaveProperty('disabled', true);

    fireEvent.click(trigger);
    expect(screen.queryByTestId('ai-action-menu-popover')).toBeNull();
  });

  it('policy context filters disabled actions from list', () => {
    const action = createMockAiAction({ actionKey: 'policy-disabled' });
    AiActionRegistry.register('scorecard', action);

    render(
      <HbcAiActionMenu
        {...baseProps}
        policyContext={{ disableActions: ['policy-disabled'] }}
      />,
    );

    const trigger = screen.getByTestId('ai-action-menu-trigger');
    expect(trigger).toHaveProperty('disabled', true);
  });

  it('handles governance-blocked actions deterministically', () => {
    const allowed = createMockAiAction({ actionKey: 'ok-action', basePriorityScore: 80 });
    const blocked = createMockAiAction({ actionKey: 'blocked-by-gov', basePriorityScore: 90 });
    AiActionRegistry.register('scorecard', allowed);
    AiActionRegistry.register('scorecard', blocked);
    AiGovernanceApi.setPolicy({ disableActions: ['blocked-by-gov'] });

    render(<HbcAiActionMenu {...baseProps} />);
    fireEvent.click(screen.getByTestId('ai-action-menu-trigger'));

    const popover = screen.getByTestId('ai-action-menu-popover');
    const items = popover.querySelectorAll('[role="menuitem"]');

    // blocked-by-gov has higher priority so appears first but is disabled
    expect(items[0].getAttribute('data-testid')).toBe('ai-action-item-blocked-by-gov');
    expect(items[0]).toHaveProperty('disabled', true);
    expect(items[1].getAttribute('data-testid')).toBe('ai-action-item-ok-action');
    expect(items[1]).toHaveProperty('disabled', false);
  });
});
