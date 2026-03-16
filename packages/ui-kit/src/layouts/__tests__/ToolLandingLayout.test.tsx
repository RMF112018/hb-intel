import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ToolLandingLayout } from '../ToolLandingLayout.js';

describe('ToolLandingLayout', () => {
  it('renders without crashing with minimal props', () => {
    render(<ToolLandingLayout toolName="RFIs">Table here</ToolLandingLayout>);
    expect(screen.getByText('Table here')).toBeInTheDocument();
  });

  it('has the data-hbc-layout attribute', () => {
    const { container } = render(
      <ToolLandingLayout toolName="Submittals">Content</ToolLandingLayout>,
    );
    expect(container.querySelector('[data-hbc-layout="tool-landing"]')).toBeInTheDocument();
  });

  it('renders the tool name as a heading', () => {
    render(<ToolLandingLayout toolName="Daily Reports">Content</ToolLandingLayout>);
    expect(screen.getByRole('heading', { name: 'Daily Reports' })).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <ToolLandingLayout toolName="RFIs">
        <div data-testid="table">Data table</div>
      </ToolLandingLayout>,
    );
    expect(screen.getByTestId('table')).toHaveTextContent('Data table');
  });

  it('renders action buttons when provided', () => {
    const onClick = vi.fn();
    render(
      <ToolLandingLayout
        toolName="RFIs"
        primaryAction={{ key: 'create', label: 'New RFI', onClick }}
        secondaryActions={[{ key: 'export', label: 'Export', onClick }]}
      >
        Content
      </ToolLandingLayout>,
    );
    expect(screen.getByRole('button', { name: 'New RFI' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
  });
});
