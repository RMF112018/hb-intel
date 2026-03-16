import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Stub hooks that depend on browser APIs not fully available in jsdom
vi.mock('../../hooks/useFocusTrap.js', () => ({
  useFocusTrap: () => {},
}));

vi.mock('../../hooks/useIsMobile.js', () => ({
  useIsMobile: () => false,
}));

vi.mock('../../HbcAppShell/hooks/useOnlineStatus.js', () => ({
  useOnlineStatus: () => 'online',
}));

vi.mock('../../HbcAppShell/hooks/useKeyboardShortcut.js', () => ({
  useKeyboardShortcut: () => {},
}));

vi.mock('../../HbcCommandBar/fieldModeActionsStore.js', () => ({
  useFieldModeActions: () => [],
}));

vi.mock('../../theme/useHbcTheme.js', () => ({
  useHbcTheme: () => ({ isFieldMode: false }),
}));

// Mock useCommandPalette to control open state
const mockClose = vi.fn();
vi.mock('../hooks/useCommandPalette.js', () => ({
  useCommandPalette: () => ({
    isOpen: true,
    open: vi.fn(),
    close: mockClose,
    toggle: vi.fn(),
  }),
}));

import { HbcCommandPalette } from '../index.js';

const navItems = [
  { id: 'nav-1', label: 'Dashboard', category: 'navigation' as const, onSelect: vi.fn() },
  { id: 'nav-2', label: 'Settings', category: 'navigation' as const, onSelect: vi.fn() },
];

describe('HbcCommandPalette', () => {
  it('renders without crashing with minimal props', () => {
    render(<HbcCommandPalette />);
    expect(document.querySelector('[data-hbc-ui="command-palette"]')).toBeInTheDocument();
  });

  it('renders with dialog role when open', () => {
    render(<HbcCommandPalette navigationItems={navItems} />);
    const dialog = document.querySelector('[data-hbc-ui="command-palette"]');
    expect(dialog).toHaveAttribute('role', 'dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('renders navigation items when open', () => {
    render(<HbcCommandPalette navigationItems={navItems} />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('closes on Escape', () => {
    render(<HbcCommandPalette navigationItems={navItems} />);
    const dialog = document.querySelector('[data-hbc-ui="command-palette"]')!;
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(mockClose).toHaveBeenCalled();
  });
});
