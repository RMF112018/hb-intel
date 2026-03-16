import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DetailLayout } from '../DetailLayout.js';

describe('DetailLayout', () => {
  it('renders without crashing with minimal props', () => {
    render(
      <DetailLayout itemTitle="RFI-001" mainContent={<p>Main</p>} />,
    );
    expect(screen.getByText('Main')).toBeInTheDocument();
  });

  it('has the data-hbc-layout attribute', () => {
    const { container } = render(
      <DetailLayout itemTitle="Item" mainContent={<div>Content</div>} />,
    );
    expect(container.querySelector('[data-hbc-layout="detail"]')).toBeInTheDocument();
  });

  it('renders the item title as a heading', () => {
    render(
      <DetailLayout itemTitle="RFI-042" mainContent={<div>Body</div>} />,
    );
    expect(screen.getByRole('heading', { name: 'RFI-042' })).toBeInTheDocument();
  });

  it('renders main content', () => {
    render(
      <DetailLayout
        itemTitle="Test"
        mainContent={<span data-testid="main">Main area</span>}
      />,
    );
    expect(screen.getByTestId('main')).toHaveTextContent('Main area');
  });

  it('renders sidebar content when provided', () => {
    render(
      <DetailLayout
        itemTitle="Test"
        mainContent={<div>Main</div>}
        sidebarContent={<aside data-testid="sidebar">Side panel</aside>}
      />,
    );
    expect(screen.getByTestId('sidebar')).toHaveTextContent('Side panel');
  });
});
