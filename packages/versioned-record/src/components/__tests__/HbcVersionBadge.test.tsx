import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HbcVersionBadge } from '../HbcVersionBadge';

describe('HbcVersionBadge', () => {
  it('renders version number', () => {
    render(<HbcVersionBadge currentVersion={3} />);
    expect(screen.getByText('v3')).toBeInTheDocument();
  });

  it('renders tag label when provided', () => {
    render(<HbcVersionBadge currentVersion={3} currentTag="approved" />);
    expect(screen.getByText('Approved')).toBeInTheDocument();
  });

  it('renders as a button when onClick is provided', () => {
    render(<HbcVersionBadge currentVersion={3} onClick={vi.fn()} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders as a span when onClick is not provided', () => {
    render(<HbcVersionBadge currentVersion={3} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handler = vi.fn();
    render(<HbcVersionBadge currentVersion={3} onClick={handler} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handler).toHaveBeenCalledOnce();
  });

  it('renders correct aria-label without tag', () => {
    render(<HbcVersionBadge currentVersion={3} onClick={vi.fn()} />);
    expect(screen.getByLabelText('Version 3. Click to view history.')).toBeInTheDocument();
  });

  it('renders correct aria-label with tag', () => {
    render(<HbcVersionBadge currentVersion={3} currentTag="approved" onClick={vi.fn()} />);
    expect(screen.getByLabelText('Version 3, Approved. Click to view history.')).toBeInTheDocument();
  });

  it('renders all tag states without error', () => {
    const tags = ['draft', 'submitted', 'approved', 'rejected', 'archived', 'handoff', 'superseded'] as const;
    for (const tag of tags) {
      const { unmount } = render(<HbcVersionBadge currentVersion={1} currentTag={tag} />);
      unmount();
    }
  });
});
