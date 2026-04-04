import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HomepageEmptyState } from '../shared/HomepageEmptyState.js';
import { HomepageLoadingState } from '../shared/HomepageLoadingState.js';
import { HomepageSectionShell } from '../shared/HomepageSectionShell.js';

describe('homepage shared primitives', () => {
  it('renders section shell semantics', () => {
    render(
      <HomepageSectionShell title="Section title" subtitle="Section subtitle">
        <div>content</div>
      </HomepageSectionShell>,
    );

    expect(screen.getByRole('region', { name: 'Section title' })).not.toBeNull();
    expect(screen.getByText('Section subtitle')).not.toBeNull();
  });

  it('renders loading and empty states with accessible semantics', () => {
    render(
      <>
        <HomepageLoadingState label="Loading" />
        <HomepageEmptyState title="Nothing here" description="No items found" />
      </>,
    );

    expect(screen.getAllByRole('status').length).toBeGreaterThan(0);
    expect(screen.getByText('Nothing here')).not.toBeNull();
  });
});
