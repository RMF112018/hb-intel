import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HbcThemeProvider } from '../HbcThemeContext.js';
import { HbcUserMenu } from '../HbcUserMenu.js';
import type { ShellUser } from '../types.js';

const testUser: ShellUser = {
  id: 'u1',
  displayName: 'Jane Doe',
  email: 'jane@example.com',
};

function renderMenu(overrides: Partial<Parameters<typeof HbcUserMenu>[0]> = {}) {
  const defaults = {
    user: testUser,
    isFieldMode: false,
    onToggleFieldMode: vi.fn(),
  };
  return render(
    <HbcThemeProvider>
      <HbcUserMenu {...defaults} {...overrides} />
    </HbcThemeProvider>,
  );
}

describe('HbcUserMenu', () => {
  it('renders the trigger button with user display name in label', () => {
    renderMenu();
    expect(
      screen.getByLabelText(/user menu for jane doe/i),
    ).toBeInTheDocument();
  });

  it('displays user initials when no avatar URL is provided', () => {
    renderMenu();
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('opens a menu on click', async () => {
    const user = userEvent.setup();
    renderMenu();
    await user.click(screen.getByLabelText(/user menu for jane doe/i));
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('shows Profile, Field Mode, and Sign Out menu items', async () => {
    const user = userEvent.setup();
    renderMenu();
    await user.click(screen.getByLabelText(/user menu for jane doe/i));
    const items = screen.getAllByRole('menuitem');
    expect(items).toHaveLength(3);
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Field Mode')).toBeInTheDocument();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  it('calls onSignOut when Sign Out is clicked', async () => {
    const user = userEvent.setup();
    const handleSignOut = vi.fn();
    renderMenu({ onSignOut: handleSignOut });
    await user.click(screen.getByLabelText(/user menu for jane doe/i));
    await user.click(screen.getByText('Sign Out'));
    expect(handleSignOut).toHaveBeenCalledOnce();
  });
});
