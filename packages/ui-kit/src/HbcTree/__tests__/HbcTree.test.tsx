import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HbcTree } from '../index.js';
import type { HbcTreeNode } from '../types.js';

const nodes: HbcTreeNode[] = [
  {
    id: 'root',
    label: 'Root',
    defaultExpanded: true,
    children: [
      { id: 'child-1', label: 'Child 1' },
      { id: 'child-2', label: 'Child 2' },
    ],
  },
  { id: 'sibling', label: 'Sibling' },
];

describe('HbcTree', () => {
  it('renders with data-hbc-ui="tree"', () => {
    const { container } = render(<HbcTree nodes={nodes} />);
    expect(container.querySelector('[data-hbc-ui="tree"]')).toBeInTheDocument();
  });

  it('role="tree"', () => {
    render(<HbcTree nodes={nodes} />);
    expect(screen.getByRole('tree')).toBeInTheDocument();
  });

  it('renders tree nodes as role="treeitem"', () => {
    render(<HbcTree nodes={nodes} />);
    const items = screen.getAllByRole('treeitem');
    expect(items.length).toBeGreaterThanOrEqual(3);
  });

  it('selected node highlighted', () => {
    render(<HbcTree nodes={nodes} selectedNodeId="child-1" />);
    const selectedItem = screen.getAllByRole('treeitem').find(
      (el) => el.getAttribute('aria-selected') === 'true',
    );
    expect(selectedItem).toBeInTheDocument();
    expect(selectedItem).toHaveTextContent('Child 1');
  });

  it('onNodeSelect fires', async () => {
    const user = userEvent.setup();
    const onNodeSelect = vi.fn();
    render(<HbcTree nodes={nodes} onNodeSelect={onNodeSelect} />);
    await user.click(screen.getByText('Sibling'));
    expect(onNodeSelect).toHaveBeenCalledWith('sibling');
  });
});
