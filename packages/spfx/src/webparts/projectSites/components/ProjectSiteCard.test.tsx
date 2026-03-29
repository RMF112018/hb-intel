import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { IProjectSiteEntry } from '../types.js';
import { ProjectSiteCard } from './ProjectSiteCard.js';

// ── Factory ───────────────────────────────────────────────────────────────

function createEntry(overrides?: Partial<IProjectSiteEntry>): IProjectSiteEntry {
  return {
    id: 1,
    projectName: 'Riverside Medical Center',
    projectNumber: '24-001-01',
    siteUrl: 'https://example.sharepoint.com/sites/RMC',
    year: 2024,
    department: 'commercial',
    projectLocation: 'Austin, TX',
    projectType: 'Healthcare',
    projectStage: 'Active',
    clientName: 'HCA Healthcare',
    hasSiteUrl: true,
    ...overrides,
  };
}

// ── Rendering ─────────────────────────────────────────────────────────────

describe('ProjectSiteCard', () => {
  it('renders the project name', () => {
    render(<ProjectSiteCard entry={createEntry()} />);
    expect(screen.getByText('Riverside Medical Center')).toBeInTheDocument();
  });

  it('renders the project number badge', () => {
    render(<ProjectSiteCard entry={createEntry()} />);
    expect(screen.getByText('24-001-01')).toBeInTheDocument();
  });

  it('renders as a link when hasSiteUrl is true', () => {
    render(<ProjectSiteCard entry={createEntry()} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://example.sharepoint.com/sites/RMC');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('has accessible label on linked card', () => {
    render(<ProjectSiteCard entry={createEntry()} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute(
      'aria-label',
      'Open Riverside Medical Center project site (24-001-01)',
    );
  });

  it('renders "Open Site" action text when hasSiteUrl', () => {
    render(<ProjectSiteCard entry={createEntry()} />);
    expect(screen.getByText('Open Site')).toBeInTheDocument();
  });

  it('renders as disabled div when hasSiteUrl is false', () => {
    render(
      <ProjectSiteCard entry={createEntry({ hasSiteUrl: false, siteUrl: '' })} />,
    );
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText(/provisioning/i)).toBeInTheDocument();
  });

  it('renders stage badge for Active', () => {
    render(<ProjectSiteCard entry={createEntry({ projectStage: 'Active' })} />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders stage badge for Pursuit', () => {
    render(<ProjectSiteCard entry={createEntry({ projectStage: 'Pursuit' })} />);
    expect(screen.getByText('Pursuit')).toBeInTheDocument();
  });

  it('does not render stage badge when empty', () => {
    render(<ProjectSiteCard entry={createEntry({ projectStage: '' })} />);
    expect(screen.queryByText('Active')).not.toBeInTheDocument();
    expect(screen.queryByText('Pursuit')).not.toBeInTheDocument();
  });

  it('renders metadata grid with client, location, type', () => {
    render(<ProjectSiteCard entry={createEntry()} />);
    expect(screen.getByText('Client')).toBeInTheDocument();
    expect(screen.getByText('HCA Healthcare')).toBeInTheDocument();
    expect(screen.getByText('Location')).toBeInTheDocument();
    expect(screen.getByText('Austin, TX')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Healthcare')).toBeInTheDocument();
  });

  it('omits metadata grid when all optional fields are empty', () => {
    render(
      <ProjectSiteCard
        entry={createEntry({
          clientName: '',
          projectLocation: '',
          projectType: '',
        })}
      />,
    );
    expect(screen.queryByText('Client')).not.toBeInTheDocument();
    expect(screen.queryByText('Location')).not.toBeInTheDocument();
    expect(screen.queryByText('Type')).not.toBeInTheDocument();
  });

  it('renders formatted department in footer', () => {
    render(<ProjectSiteCard entry={createEntry({ department: 'luxury-residential' })} />);
    expect(screen.getByText('Luxury Residential')).toBeInTheDocument();
  });

  it('does not render project number badge when empty', () => {
    render(<ProjectSiteCard entry={createEntry({ projectNumber: '' })} />);
    expect(screen.queryByText('24-001-01')).not.toBeInTheDocument();
  });

  it('handles accessible label without project number', () => {
    render(<ProjectSiteCard entry={createEntry({ projectNumber: '' })} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute(
      'aria-label',
      'Open Riverside Medical Center project site',
    );
  });
});
