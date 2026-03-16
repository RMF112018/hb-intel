import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@hbc/shell', () => ({
  useProjectStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ activeProject: null, availableProjects: [] }),
  useNavStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ activeItemId: null, activeWorkspace: null }),
}));
vi.mock('@hbc/auth', () => ({
  usePermission: () => true,
}));

import { HbcThemeProvider } from '../../HbcAppShell/HbcThemeContext.js';
import { CreateUpdateLayout } from '../CreateUpdateLayout.js';

function renderWithTheme(ui: React.ReactNode) {
  return render(<HbcThemeProvider>{ui}</HbcThemeProvider>);
}

describe('CreateUpdateLayout', () => {
  const defaultProps = {
    mode: 'create' as const,
    itemType: 'RFI',
    onCancel: vi.fn(),
    onSubmit: vi.fn(),
  };

  it('renders without crashing with minimal props', () => {
    renderWithTheme(
      <CreateUpdateLayout {...defaultProps}>
        <p>Form fields</p>
      </CreateUpdateLayout>,
    );
    expect(screen.getByText('Form fields')).toBeInTheDocument();
  });

  it('has the data-hbc-layout attribute', () => {
    const { container } = renderWithTheme(
      <CreateUpdateLayout {...defaultProps}>
        <div>Content</div>
      </CreateUpdateLayout>,
    );
    expect(container.querySelector('[data-hbc-layout="create-update"]')).toBeInTheDocument();
  });

  it('renders the create mode title', () => {
    renderWithTheme(
      <CreateUpdateLayout {...defaultProps}>
        <div>Fields</div>
      </CreateUpdateLayout>,
    );
    expect(screen.getByRole('heading', { name: 'Create New RFI' })).toBeInTheDocument();
  });

  it('renders the edit mode title with item name', () => {
    renderWithTheme(
      <CreateUpdateLayout {...defaultProps} mode="edit" itemTitle="RFI-005">
        <div>Fields</div>
      </CreateUpdateLayout>,
    );
    expect(screen.getByRole('heading', { name: 'Edit RFI-005' })).toBeInTheDocument();
  });

  it('renders Save and Cancel buttons in the footer', () => {
    renderWithTheme(
      <CreateUpdateLayout {...defaultProps}>
        <div>Content</div>
      </CreateUpdateLayout>,
    );
    const saveButtons = screen.getAllByRole('button', { name: 'Save' });
    const cancelButtons = screen.getAllByRole('button', { name: 'Cancel' });
    // Header + footer each have Save and Cancel
    expect(saveButtons.length).toBeGreaterThanOrEqual(1);
    expect(cancelButtons.length).toBeGreaterThanOrEqual(1);
  });
});
