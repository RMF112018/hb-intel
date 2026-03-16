import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HbcGlobalSearch } from '../HbcGlobalSearch.js';

describe('HbcGlobalSearch', () => {
  it('renders a trigger button', () => {
    render(<HbcGlobalSearch />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('has an aria-label referencing the keyboard shortcut', () => {
    render(<HbcGlobalSearch />);
    expect(
      screen.getByLabelText(/search.*command\+k|search.*control\+k/i),
    ).toBeInTheDocument();
  });

  it('displays the keyboard shortcut indicator', () => {
    render(<HbcGlobalSearch />);
    // The component renders a <kbd> with the shortcut text
    const kbd = screen.getByText(/⌘K/);
    expect(kbd).toBeInTheDocument();
    expect(kbd.tagName).toBe('KBD');
  });

  it('displays "Search..." placeholder text', () => {
    render(<HbcGlobalSearch />);
    expect(screen.getByText('Search...')).toBeInTheDocument();
  });

  it('renders as type="button"', () => {
    render(<HbcGlobalSearch />);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });
});
