import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('@hbc/shell', () => ({
  useProjectStore: () => ({
    activeProject: { id: 'p1', name: 'Alpha Project', number: 'P-001' },
    availableProjects: [
      { id: 'p1', name: 'Alpha Project', number: 'P-001' },
      { id: 'p2', name: 'Beta Project', number: 'P-002' },
    ],
  }),
}));

import { HbcThemeProvider } from '../HbcThemeContext.js';
import { HbcProjectSelector } from '../HbcProjectSelector.js';

function renderSelector(props: Parameters<typeof HbcProjectSelector>[0] = {}) {
  return render(
    <HbcThemeProvider>
      <HbcProjectSelector {...props} />
    </HbcThemeProvider>,
  );
}

describe('HbcProjectSelector', () => {
  it('renders the trigger button with "Select project" label', () => {
    renderSelector();
    expect(screen.getByLabelText('Select project')).toBeInTheDocument();
  });

  it('displays the active project name', () => {
    renderSelector();
    expect(screen.getByText('Alpha Project')).toBeInTheDocument();
  });

  it('opens a listbox on click', async () => {
    const user = userEvent.setup();
    renderSelector();
    await user.click(screen.getByLabelText('Select project'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('shows project options inside the listbox', async () => {
    const user = userEvent.setup();
    renderSelector();
    await user.click(screen.getByLabelText('Select project'));
    expect(screen.getAllByRole('option')).toHaveLength(2);
  });

  it('calls onProjectSelect when a project is clicked', async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();
    renderSelector({ onProjectSelect: handleSelect });
    await user.click(screen.getByLabelText('Select project'));
    const options = screen.getAllByRole('option');
    await user.click(options[1]);
    expect(handleSelect).toHaveBeenCalledWith('p2');
  });
});
