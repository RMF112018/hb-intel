// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BackToProjectHub } from './index.js';
import { useProjectStore } from '../stores/projectStore.js';

describe('BackToProjectHub', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  beforeEach(() => {
    useProjectStore.getState().clear();
    useProjectStore.getState().setActiveProject({
      id: 'proj-a',
      name: 'Alpha Project',
      number: 'PRJ-001',
      status: 'Active',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
    });
  });

  it('renders a canonical portfolio href when no external url is provided', () => {
    render(<BackToProjectHub />);

    expect(screen.getByRole('link', { name: /back to portfolio/i }).getAttribute('href')).toBe(
      '/project-hub',
    );
  });

  it('uses the callback for in-app navigation when provided', () => {
    const onNavigate = vi.fn();

    render(<BackToProjectHub onNavigate={onNavigate} />);

    fireEvent.click(screen.getByRole('link', { name: /back to portfolio/i }));
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });
});
