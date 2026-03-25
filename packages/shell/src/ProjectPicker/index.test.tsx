// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectPicker } from './index.js';
import { useProjectStore } from '../stores/projectStore.js';

describe('ProjectPicker', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  beforeEach(() => {
    useProjectStore.getState().clear();
    useProjectStore.getState().setAvailableProjects([
      { id: 'proj-a', name: 'Alpha Project', number: 'PRJ-001', status: 'Active', startDate: '2026-01-01', endDate: '2026-12-31' },
      { id: 'proj-b', name: 'Beta Project', number: 'PRJ-002', status: 'Planning', startDate: '2026-02-01', endDate: '2027-01-31' },
    ]);
    useProjectStore.getState().setActiveProject({
      id: 'proj-a',
      name: 'Alpha Project',
      number: 'PRJ-001',
      status: 'Active',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
    });
  });

  it('calls the selection callback without mutating the active project store directly', () => {
    const onProjectSelect = vi.fn();

    render(<ProjectPicker onProjectSelect={onProjectSelect} />);

    fireEvent.click(screen.getByRole('button', { name: /alpha project/i }));
    fireEvent.click(screen.getAllByRole('option')[1]);

    expect(onProjectSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'proj-b', name: 'Beta Project' }),
    );
    expect(useProjectStore.getState().activeProject?.id).toBe('proj-a');
  });
});
