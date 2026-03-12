import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { createMockBidReadinessProfile } from '@hbc/features-estimating/testing';
import type { IBidReadinessChecklistDefinition, IBidReadinessChecklistItem } from '../../types/index.js';
import {
  ChecklistDefinitionEditor,
  ChecklistItem,
  ChecklistSection,
  ReadinessCriteriaEditor,
  ScoringWeightEditor,
} from './index.js';

describe('editorComponents', () => {
  it('emits completion and rationale updates for checklist items', () => {
    const onCompletionChange = vi.fn();
    const onRationaleChange = vi.fn();
    const item: IBidReadinessChecklistItem = {
      checklistItemId: 'item-1',
      criterionId: 'ce-sign-off',
      label: 'CE sign-off',
      categoryId: 'governance',
      weight: 10,
      isBlocker: true,
      isComplete: false,
      actionHref: '/estimating/signoff',
      rationale: '',
    };

    render(
      <ChecklistItem
        item={item}
        showWeights
        onCompletionChange={onCompletionChange}
        onRationaleChange={onRationaleChange}
      />,
    );

    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'waiting on approver' } });

    expect(onCompletionChange).toHaveBeenCalledWith('item-1', true);
    expect(onRationaleChange).toHaveBeenCalledWith('item-1', 'waiting on approver');
    expect(screen.getByText('Weight: 10')).toBeInTheDocument();
  });

  it('emits weight/blocker and threshold changes', () => {
    const profile = createMockBidReadinessProfile();
    const onWeightChange = vi.fn();
    const onBlockerChange = vi.fn();
    const onThresholdChange = vi.fn();

    render(
      <>
        <ReadinessCriteriaEditor
          profile={profile}
          onWeightChange={onWeightChange}
          onBlockerChange={onBlockerChange}
        />
        <ScoringWeightEditor profile={profile} onThresholdChange={onThresholdChange} />
      </>,
    );

    const numberInputs = screen.getAllByRole('spinbutton');
    fireEvent.change(numberInputs[0], { target: { value: '44' } });
    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    fireEvent.change(numberInputs[numberInputs.length - 1], { target: { value: '42' } });

    expect(onWeightChange).toHaveBeenCalled();
    expect(onBlockerChange).toHaveBeenCalled();
    expect(onThresholdChange).toHaveBeenCalledWith('attentionNeededMinScore', 42);
  });

  it('renders checklist definitions empty and populated states in sorted order', () => {
    const definitions: readonly IBidReadinessChecklistDefinition[] = [
      {
        checklistItemId: 'def-2',
        criterionId: 'subcontractor-coverage',
        blocking: false,
        order: 2,
      },
      {
        checklistItemId: 'def-1',
        criterionId: 'cost-sections-populated',
        blocking: true,
        order: 1,
      },
    ];

    const { rerender } = render(<ChecklistDefinitionEditor definitions={[]} />);
    expect(screen.getByText('No checklist definitions configured.')).toBeInTheDocument();

    rerender(<ChecklistDefinitionEditor definitions={definitions} />);
    const rows = screen.getAllByRole('listitem').map((item) => item.textContent ?? '');
    expect(rows[0]).toContain('cost-sections-populated');
    expect(rows[1]).toContain('subcontractor-coverage');
  });

  it('renders empty checklist section fallback', () => {
    render(<ChecklistSection title="Blocked" items={[]} />);
    expect(screen.getByText('No items in this section.')).toBeInTheDocument();
  });
});
