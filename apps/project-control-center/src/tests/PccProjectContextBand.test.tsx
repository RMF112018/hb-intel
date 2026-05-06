import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PccApp } from '../PccApp';
import { PccProjectContextBand } from '../shell/PccProjectContextBand';
import { PCC_RESPONSIVE_MODES } from '../layout/footprints';

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

  it('renders inside PccShell across every responsive mode and remains outside the bento grid', () => {
    for (const mode of PCC_RESPONSIVE_MODES) {
      const { container } = render(<PccApp forceMode={mode} />);
      const bands = container.querySelectorAll('[data-pcc-context-band]');
      expect(bands, `band should render exactly once in '${mode}'`).toHaveLength(1);
      const band = bands[0];

      // identity + source confidence + active surface persist in every mode
      expect(band.querySelector('[data-pcc-context-project]')?.textContent).toBe(
        'Project Control Center',
      );
      expect(band.getAttribute('data-pcc-source-confidence')).toBe('preview');
      expect(band.querySelector('[data-pcc-active-surface-context]')?.textContent).toContain(
        'Project Home',
      );

      // band must sit outside the bento grid
      const grid = container.querySelector('[data-pcc-bento-grid]');
      expect(grid?.contains(band), `band must not be nested inside bento in '${mode}'`).toBe(false);

      // band sits between header and main canvas inside the work area
      const header = container.querySelector('[data-pcc-header]');
      const canvas = container.querySelector('[data-pcc-canvas]');
      expect(header).not.toBeNull();
      expect(canvas).not.toBeNull();
      expect(header!.compareDocumentPosition(band) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(band.compareDocumentPosition(canvas!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
  });

  it('renders the band once for every active surface (persistent across surface routes)', () => {
    const { container, rerender } = render(<PccApp forceMode="desktop" />);
    // every rail click triggers a fresh active surface; band must remain
    const railButtons = container.querySelectorAll('[data-pcc-rail] [data-pcc-surface-id]');
    expect(railButtons.length).toBeGreaterThan(0);

    for (const button of Array.from(railButtons) as HTMLButtonElement[]) {
      button.click();
      const bands = container.querySelectorAll('[data-pcc-context-band]');
      expect(bands).toHaveLength(1);
      // active-surface-context updates with the active surface id
      const context = bands[0].querySelector('[data-pcc-active-surface-context]');
      expect(context?.textContent).not.toBe('');
    }

    // re-render with no forceMode to confirm default-mount still mounts the band
    rerender(<PccApp />);
    expect(container.querySelectorAll('[data-pcc-context-band]')).toHaveLength(1);
  });
});
