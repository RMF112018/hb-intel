import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { IProjectSiteEntry } from '../types.js';
import { ProjectSiteCard } from './ProjectSiteCard.js';

// ── Factory ───────────────────────────────────────────────────────────────

function createEntry(overrides?: Partial<IProjectSiteEntry>): IProjectSiteEntry {
  const id = overrides?.id ?? 1;
  return {
    recordKey: `project:${id}`,
    id,
    sourceClassification: 'project-only',
    sourceRefs: {
      projectsListId: id,
      legacyRegistryKey: null,
      legacyRegistrySourceYear: null,
    },
    projectName: 'Riverside Medical Center',
    projectNumber: '24-001-01',
    siteUrl: 'https://example.sharepoint.com/sites/RMC',
    year: 2024,
    department: 'commercial',
    officeDivision: 'south-florida',
    projectLocation: 'Austin, TX',
    projectType: 'Healthcare',
    projectStage: 'Active',
    clientName: 'HCA Healthcare',
    projectStreetAddress: '',
    projectCity: '',
    projectCounty: '',
    projectState: '',
    projectZip: '',
    projectExecutiveUpn: '',
    projectManagerUpn: '',
    leadEstimatorUpn: '',
    supportingEstimatorUpns: [],
    procoreProject: '',
    primarySiteUrl: 'https://example.sharepoint.com/sites/RMC',
    legacyFallbackFolderUrl: '',
    legacyFallbackSourceYear: null,
    legacyFallbackMatchStatus: '',
    launchTargetKind: 'primary-site',
    hasSiteUrl: true,
    dataQuality: {
      classification: 'complete',
      issues: [],
      hasAnyIssue: false,
      hasLaunchCriticalIssue: false,
    },
    launchStatus: {
      state: 'live',
      reasonCode: 'live-site-ready',
      isLaunchable: true,
      userMessage: 'Live site is available and launch-ready.',
    },
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
      'Open Site: Riverside Medical Center (24-001-01)',
    );
  });

  it('keeps launchable cards clickable via the card-wrapper anchor (no separate action chip)', () => {
    render(<ProjectSiteCard entry={createEntry()} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://example.sharepoint.com/sites/RMC');
    // Action chip / footer copy is no longer rendered.
    expect(screen.queryByText('Open Site')).not.toBeInTheDocument();
  });

  it('wraps legacy-fallback cards in a clickable anchor and carries a truthful aria-label (no footer chip)', () => {
    render(
      <ProjectSiteCard
        entry={createEntry({
          siteUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/2024Projects/Shared%20Documents',
          primarySiteUrl: '',
          legacyFallbackFolderUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/2024Projects/Shared%20Documents',
          legacyFallbackSourceYear: 2024,
          legacyFallbackMatchStatus: 'matched',
          launchTargetKind: 'legacy-fallback',
          launchStatus: {
            state: 'live',
            reasonCode: 'legacy-fallback-ready',
            isLaunchable: true,
            userMessage: 'Legacy project files are available from the fallback registry.',
          },
        })}
      />,
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute(
      'aria-label',
      'Open Legacy Project Files: Riverside Medical Center (24-001-01)',
    );
    // Footer action chip + launch-confidence copy are gone; the whole
    // card is the launch affordance.
    expect(screen.queryByText('Open Legacy Project Files')).not.toBeInTheDocument();
    expect(screen.queryByText(/launch confidence/i)).not.toBeInTheDocument();
  });

  it('renders as disabled div when hasSiteUrl is false and surfaces the status message in the body', () => {
    const { container } = render(
      <ProjectSiteCard entry={createEntry({
        hasSiteUrl: false,
        siteUrl: '',
        launchStatus: {
          state: 'provisioning',
          reasonCode: 'site-not-provisioned',
          isLaunchable: false,
          userMessage: 'Site has not been provisioned yet.',
        },
      })}
      />,
    );
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    // Status lives in the body as userMessage; no footer "Provisioning" label.
    expect(screen.getByText(/site has not been provisioned yet/i)).toBeInTheDocument();
    expect(screen.queryByText(/^Provisioning$/)).not.toBeInTheDocument();
    expect(container.querySelector('[aria-disabled="true"]')).toBeInTheDocument();
  });

  it('renders attention-needed state with explicit guidance in the body', () => {
    render(
      <ProjectSiteCard
        entry={createEntry({
          launchStatus: {
            state: 'attention-needed',
            reasonCode: 'critical-data-issue',
            isLaunchable: false,
            userMessage: 'Record needs data correction before launch confidence can be established.',
          },
        })}
      />,
    );
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText(/data correction/i)).toBeInTheDocument();
    // No footer "Attention Needed" label.
    expect(screen.queryByText(/^Attention Needed$/)).not.toBeInTheDocument();
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

  it('renders a Legacy provenance indicator only for legacy-only records', () => {
    const { container: projectOnlyContainer } = render(
      <ProjectSiteCard entry={createEntry({ sourceClassification: 'project-only' })} />,
    );
    expect(
      projectOnlyContainer.querySelector('[data-project-sites-provenance="legacy-only"]'),
    ).toBeNull();

    const { container: mergedContainer } = render(
      <ProjectSiteCard entry={createEntry({ sourceClassification: 'merged' })} />,
    );
    expect(
      mergedContainer.querySelector('[data-project-sites-provenance="legacy-only"]'),
    ).toBeNull();

    const { container: legacyContainer } = render(
      <ProjectSiteCard entry={createEntry({ sourceClassification: 'legacy-only' })} />,
    );
    const badge = legacyContainer.querySelector('[data-project-sites-provenance="legacy-only"]');
    expect(badge).not.toBeNull();
    expect(badge?.textContent).toContain('Legacy');
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

  it('prefers structured city/state for location metadata when available', () => {
    render(
      <ProjectSiteCard
        entry={createEntry({
          projectCity: 'Orlando',
          projectState: 'FL',
          projectLocation: 'Legacy Location Text',
        })}
      />,
    );

    expect(screen.getByText('Orlando, FL')).toBeInTheDocument();
    expect(screen.queryByText('Legacy Location Text')).not.toBeInTheDocument();
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
    expect(screen.getAllByText('Luxury Residential').length).toBeGreaterThan(0);
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
      'Open Site: Riverside Medical Center',
    );
  });

  it('preserves clickable card-wrapper in compact layout', () => {
    render(<ProjectSiteCard entry={createEntry()} layoutMode="compact" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('data-project-sites-card-layout', 'compact');
    expect(link).toHaveAttribute('href', 'https://example.sharepoint.com/sites/RMC');
    // No footer action chip.
    expect(screen.queryByText('Open Site')).not.toBeInTheDocument();
  });

  it('shows identity chips for live records without any launch-confidence copy', () => {
    render(<ProjectSiteCard entry={createEntry()} />);
    expect(screen.getByText('2024')).toBeInTheDocument();
    expect(screen.getByText('South Florida')).toBeInTheDocument();
    expect(screen.queryByText(/launch confidence/i)).not.toBeInTheDocument();
  });

  it('surfaces the truthful status message for blocked/provisioning records in the body (no launch-confidence narration)', () => {
    render(
      <ProjectSiteCard
        entry={createEntry({
          hasSiteUrl: false,
          siteUrl: '',
          launchStatus: {
            state: 'provisioning',
            reasonCode: 'site-not-provisioned',
            isLaunchable: false,
            userMessage: 'Site has not been provisioned yet.',
          },
        })}
      />,
    );

    expect(screen.getByText('Site has not been provisioned yet.')).toBeInTheDocument();
    expect(screen.queryByText(/launch confidence/i)).not.toBeInTheDocument();
  });

  it('uses authoritative people labels in card metadata when provided', () => {
    render(
      <ProjectSiteCard
        entry={createEntry({
          projectManagerUpn: 'manager@contoso.com',
          leadEstimatorUpn: 'lead@contoso.com',
          projectExecutiveUpn: 'exec@contoso.com',
        })}
        peopleDisplayLabels={{
          'manager@contoso.com': 'Manager Name',
          'lead@contoso.com': 'Lead Name',
          'exec@contoso.com': 'Exec Name',
        }}
      />,
    );

    expect(screen.getByText('Project Manager')).toBeInTheDocument();
    expect(screen.getByText('Manager Name')).toBeInTheDocument();
    expect(screen.getByText('Lead Name')).toBeInTheDocument();
    expect(screen.getByText('Exec Name')).toBeInTheDocument();
  });

  it('falls back to humanized people labels in card metadata', () => {
    render(
      <ProjectSiteCard
        entry={createEntry({
          projectManagerUpn: 'jane.doe@contoso.com',
        })}
      />,
    );

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  // ── Density variants ─────────────────────────────────────────────

  it('renders comfortable density (wide layout) with full identity chips and all metadata fields', () => {
    render(
      <ProjectSiteCard
        entry={createEntry({
          projectManagerUpn: 'pm@contoso.com',
          leadEstimatorUpn: 'est@contoso.com',
          projectExecutiveUpn: 'exec@contoso.com',
        })}
        layoutMode="wide"
      />,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('data-project-sites-card-density', 'comfortable');
    // All three identity chips present; department appears exactly once
    // now that the footer department echo is gone.
    expect(screen.getByText('2024')).toBeInTheDocument();
    expect(screen.getByText('South Florida')).toBeInTheDocument();
    expect(screen.getAllByText('Commercial').length).toBe(1);
    expect(screen.queryByText(/launch confidence/i)).not.toBeInTheDocument();
    // Full metadata set
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Project Manager')).toBeInTheDocument();
    expect(screen.getByText('Lead Estimator')).toBeInTheDocument();
    expect(screen.getByText('Project Executive')).toBeInTheDocument();
  });

  it('renders regular density (medium layout) with trimmed identity chips and a metadata policy that drops Type and Lead Estimator', () => {
    render(
      <ProjectSiteCard
        entry={createEntry({
          projectManagerUpn: 'pm@contoso.com',
          leadEstimatorUpn: 'est@contoso.com',
          projectExecutiveUpn: 'exec@contoso.com',
        })}
        layoutMode="medium"
      />,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('data-project-sites-card-density', 'regular');
    // Year + office division chips present; department chip dropped at regular density.
    expect(screen.getByText('2024')).toBeInTheDocument();
    expect(screen.getByText('South Florida')).toBeInTheDocument();
    expect(screen.queryByText('Commercial')).not.toBeInTheDocument();
    expect(screen.queryByText(/launch confidence/i)).not.toBeInTheDocument();
    // Metadata trimmed: Type and Lead Estimator dropped, PM + Exec kept
    expect(screen.queryByText('Type')).not.toBeInTheDocument();
    expect(screen.queryByText('Lead Estimator')).not.toBeInTheDocument();
    expect(screen.getByText('Project Manager')).toBeInTheDocument();
    expect(screen.getByText('Project Executive')).toBeInTheDocument();
  });

  it('renders condensed density (compact layout) with a single year chip and minimal metadata; card remains clickable via wrapper', () => {
    render(
      <ProjectSiteCard
        entry={createEntry({
          projectManagerUpn: 'pm@contoso.com',
          leadEstimatorUpn: 'est@contoso.com',
          projectExecutiveUpn: 'exec@contoso.com',
        })}
        layoutMode="compact"
      />,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('data-project-sites-card-density', 'condensed');
    expect(link).toHaveAttribute('data-project-sites-card-layout', 'compact');
    // Only the year identity chip is present
    expect(screen.getByText('2024')).toBeInTheDocument();
    expect(screen.queryByText('South Florida')).not.toBeInTheDocument();
    expect(screen.queryByText('Commercial')).not.toBeInTheDocument();
    expect(screen.queryByText(/launch confidence/i)).not.toBeInTheDocument();
    // All people metadata dropped; Client + Location kept (if present)
    expect(screen.queryByText('Project Manager')).not.toBeInTheDocument();
    expect(screen.queryByText('Lead Estimator')).not.toBeInTheDocument();
    expect(screen.queryByText('Project Executive')).not.toBeInTheDocument();
    expect(screen.queryByText('Type')).not.toBeInTheDocument();
    expect(screen.getByText('Client')).toBeInTheDocument();
    expect(screen.getByText('HCA Healthcare')).toBeInTheDocument();
    // Launch affordance lives in the wrapper anchor, not a footer chip.
    expect(screen.queryByText('Open Site')).not.toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.sharepoint.com/sites/RMC');
  });

  it('preserves blocked launch-state messaging in condensed density (provisioning)', () => {
    render(
      <ProjectSiteCard
        entry={createEntry({
          hasSiteUrl: false,
          siteUrl: '',
          launchStatus: {
            state: 'provisioning',
            reasonCode: 'site-not-provisioned',
            isLaunchable: false,
            userMessage: 'Site has not been provisioned yet.',
          },
        })}
        layoutMode="compact"
      />,
    );
    // Truthful blocked messaging still surfaces in the body.
    expect(screen.getByText('Site has not been provisioned yet.')).toBeInTheDocument();
    // No launch-confidence narration; no footer "Provisioning" label.
    expect(screen.queryByText(/launch confidence/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Provisioning$/)).not.toBeInTheDocument();
  });

  it('accepts an explicit density override that wins over layoutMode-derived density', () => {
    render(
      <ProjectSiteCard
        entry={createEntry()}
        layoutMode="compact"
        density="comfortable"
      />,
    );
    // Layout stays compact; density diagnostic reflects the override.
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('data-project-sites-card-layout', 'compact');
    expect(link).toHaveAttribute('data-project-sites-card-density', 'comfortable');
  });
});
