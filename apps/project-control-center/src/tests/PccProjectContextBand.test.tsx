import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PccProjectContextBand } from '../shell/PccProjectContextBand';

describe('PccProjectContextBand', () => {
  it('renders identity, source confidence, active surface, pills, and date scope on wide desktop', () => {
    const { container } = render(
      <PccProjectContextBand
        projectName="Project Control Center"
        pills={[
          { label: 'Reference', tone: 'info' },
          { label: 'PCC', tone: 'neutral' },
        ]}
        dateScope="Last 12 Months"
        activeSurfaceLabel="Project Home"
        activeSurfaceWorkflowLabel="Daily entry point with priority actions, project hero, and rollups."
        sourceConfidence="preview"
        mode="desktop"
      />,
    );

    const band = container.querySelector('[data-pcc-context-band]');
    expect(band, 'band should render').not.toBeNull();
    expect(band?.getAttribute('data-pcc-mode')).toBe('desktop');
    expect(band?.getAttribute('data-pcc-source-confidence')).toBe('preview');
    expect(band?.getAttribute('aria-label')).toBe('Project context');

    expect(band?.querySelector('[data-pcc-context-project]')?.textContent).toBe(
      'Project Control Center',
    );
    expect(band?.querySelector('[data-pcc-source-confidence-label]')?.textContent).toBe(
      'Reference data',
    );
    const surfaceContext = band?.querySelector('[data-pcc-active-surface-context]');
    expect(surfaceContext?.textContent).toContain('Project Home');
    expect(surfaceContext?.textContent).toContain('Daily entry point');

    const pillRow = band?.querySelector('[data-pcc-pill-row]');
    expect(pillRow?.textContent).toContain('Reference');
    expect(pillRow?.textContent).toContain('PCC');

    expect(band?.querySelector('[data-pcc-date-scope]')?.textContent).toBe('Last 12 Months');
  });

  it('renders the live source-confidence label when sourceConfidence is "live"', () => {
    const { container } = render(
      <PccProjectContextBand
        projectName="Project Control Center"
        pills={[]}
        dateScope="Last 12 Months"
        activeSurfaceLabel="Project Home"
        activeSurfaceWorkflowLabel="Daily entry point."
        sourceConfidence="live"
        mode="desktop"
      />,
    );

    const band = container.querySelector('[data-pcc-context-band]');
    expect(band?.getAttribute('data-pcc-source-confidence')).toBe('live');
    expect(band?.querySelector('[data-pcc-source-confidence-label]')?.textContent).toBe(
      'Live data',
    );
  });

  it('hides the meta area on phone mode but preserves identity, source confidence, and active surface', () => {
    const { container } = render(
      <PccProjectContextBand
        projectName="Project Control Center"
        pills={[
          { label: 'Reference', tone: 'info' },
          { label: 'PCC', tone: 'neutral' },
        ]}
        dateScope="Last 12 Months"
        activeSurfaceLabel="Documents"
        activeSurfaceWorkflowLabel="Document Controls"
        sourceConfidence="preview"
        mode="phone"
      />,
    );

    const band = container.querySelector('[data-pcc-context-band]');
    expect(band?.getAttribute('data-pcc-mode')).toBe('phone');
    expect(band?.querySelector('[data-pcc-context-project]')?.textContent).toBe(
      'Project Control Center',
    );
    expect(band?.querySelector('[data-pcc-source-confidence-label]')?.textContent).toBe(
      'Reference data',
    );
    expect(band?.querySelector('[data-pcc-active-surface-context]')?.textContent).toContain(
      'Documents',
    );
    expect(band?.querySelector('[data-pcc-pill-row]'), 'pills hide on phone').toBeNull();
    expect(band?.querySelector('[data-pcc-date-scope]'), 'date scope hides on phone').toBeNull();
  });

  // The shell no longer mounts PccProjectContextBand; the component remains
  // on disk as orphaned dead code. Shell-integration cases that asserted
  // band-in-PccApp have been removed from this suite. The three
  // direct-render unit cases above continue to validate the component's
  // standalone contract.
});
