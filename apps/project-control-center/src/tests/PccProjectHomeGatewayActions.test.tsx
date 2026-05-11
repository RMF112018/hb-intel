import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { PccApp } from '../PccApp';

/**
 * Phase 06 Prompt 02 — Project Home gateway actions.
 *
 * Locks the eight enabled gateway mappings (label → moduleId → resulting
 * `data-pcc-active-surface-panel` and `data-pcc-selected-module-id`) plus
 * the disabled Recent Activity preview-only state.
 *
 * Every enabled mapping is asserted individually rather than via
 * representative cases — the mapping table is small and full coverage
 * prevents bad module IDs from slipping through. For routed surfaces that
 * render `PccPrimaryDashboardSurface` (core-tools, startup-closeout,
 * systems-administration), the selected-module title text in
 * `[data-pcc-selected-module-card]` is the second lock that catches a
 * module-ID typo (a typo would still set activeModuleId but
 * `getModule(id).label` would render the wrong title).
 *
 * Click-driven re-renders flow synchronously through `usePccShellState`
 * (React `useState`), so no `waitFor` is needed for the panel transition.
 *
 * One render per click test (`afterEach(cleanup)`); separate renders
 * isolate the in-memory shell state across cases.
 */

afterEach(() => {
  cleanup();
});

function getActivePanelId(container: HTMLElement): string | null {
  const main = container.querySelector('main[role="tabpanel"]');
  return main?.getAttribute('data-pcc-active-surface-panel') ?? null;
}

function getSelectedModuleCard(container: HTMLElement): HTMLElement | null {
  return container.querySelector<HTMLElement>('[data-pcc-selected-module-card]');
}

function getSelectedModuleId(container: HTMLElement): string {
  return getSelectedModuleCard(container)?.getAttribute('data-pcc-selected-module-id') ?? '';
}

function getSelectedModuleTitle(container: HTMLElement): string {
  // PccPrimaryDashboardSurface renders the selected module title as a
  // PccDashboardCard heading on the third card of the surface.
  const card = getSelectedModuleCard(container)?.closest('[data-pcc-card]');
  return card?.querySelector('h2,h3,h4')?.textContent?.trim() ?? '';
}

function getButtonByLabel(container: HTMLElement, label: string): HTMLButtonElement {
  const button = container.querySelector<HTMLButtonElement>(
    `button[data-pcc-project-home-gateway-label="${label}"]`,
  );
  if (!button) {
    throw new Error(`Gateway button labeled "${label}" not found`);
  }
  return button;
}

describe('Project Home gateway actions — static rendering', () => {
  it('renders the nine gateway labels (eight enabled + one disabled)', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const labels = [
      'Open Action Center',
      'Open Site Health',
      'Open Document Control',
      'Open Startup Center',
      'Open Approvals',
      'Open Settings',
      'Open External Platforms',
      'Open Team & Access',
      'View Activity Context',
    ];
    for (const label of labels) {
      expect(getButtonByLabel(container, label)).toBeTruthy();
    }
  });

  it('renders eight enabled gateway buttons and one disabled', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const enabled = container.querySelectorAll(
      'button[data-pcc-project-home-gateway-state="enabled"]',
    );
    const disabled = container.querySelectorAll(
      'button[data-pcc-project-home-gateway-state="disabled"]',
    );
    expect(enabled).toHaveLength(8);
    expect(disabled).toHaveLength(1);
  });

  it('Recent Activity gateway is disabled with the visible preview-only reason', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const button = getButtonByLabel(container, 'View Activity Context');
    expect(button.disabled).toBe(true);
    expect(button.getAttribute('data-pcc-project-home-gateway-state')).toBe('disabled');
    expect(button.getAttribute('data-pcc-project-home-gateway-action')).toBe('preview');

    const reasonId = button.getAttribute('aria-describedby');
    expect(reasonId).not.toBeNull();
    // `useId()` includes colons in the generated id, which are invalid in
    // CSS selectors — resolve via `getElementById` (per stored convention
    // for aria-describedby resolution).
    const reasonNode = reasonId ? document.getElementById(reasonId) : null;
    expect(reasonNode?.textContent?.trim()).toBe(
      'Activity context is preview-only in this release.',
    );
  });

  it('Recent Activity click is a no-op (active panel stays project-home, no module selected)', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const button = getButtonByLabel(container, 'View Activity Context');
    fireEvent.click(button);
    expect(getActivePanelId(container)).toBe('project-home');
    // No PccPrimaryDashboardSurface rendered, so the selected-module card
    // does not exist on Project Home.
    expect(getSelectedModuleCard(container)).toBeNull();
  });
});

describe('Project Home gateway actions — per-mapping click coverage', () => {
  it('Open Action Center: stays on project-home (action-center.parentTabId === project-home)', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    fireEvent.click(getButtonByLabel(container, 'Open Action Center'));
    expect(getActivePanelId(container)).toBe('project-home');
    // Active module changed but the routed surface is still Project Home,
    // which doesn't render PccPrimaryDashboardSurface — selected-module
    // card is absent (this is the lock that activeModuleId did NOT
    // promote a different surface).
    expect(getSelectedModuleCard(container)).toBeNull();
  });

  it('Open Site Health: routes to systems-administration with site-health selected', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    fireEvent.click(getButtonByLabel(container, 'Open Site Health'));
    expect(getActivePanelId(container)).toBe('systems-administration');
    expect(getSelectedModuleId(container)).toBe('site-health');
    expect(getSelectedModuleTitle(container)).toBe('Site Health');
  });

  it('Open Document Control: routes to documents with document-control-center selected', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    fireEvent.click(getButtonByLabel(container, 'Open Document Control'));
    expect(getActivePanelId(container)).toBe('documents');
    // PccDocumentsSurface does not render PccPrimaryDashboardSurface and
    // therefore exposes no [data-pcc-selected-module-card] — the active
    // panel transition is the sole lock here.
  });

  it('Open Startup Center (Project Readiness MVP gateway): routes to startup-closeout with startup-center selected', () => {
    // Locks the intentional MVP compromise documented in
    // projectHomeChoreography.ts: Project Readiness opens Startup Center
    // because no `project-readiness` module id currently exists.
    const { container } = render(<PccApp forceMode="desktop" />);
    fireEvent.click(getButtonByLabel(container, 'Open Startup Center'));
    expect(getActivePanelId(container)).toBe('startup-closeout');
    expect(getSelectedModuleId(container)).toBe('startup-center');
    expect(getSelectedModuleTitle(container)).toBe('Startup Center');
  });

  it('Open Approvals: routes to core-tools with approvals-checkpoints selected', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    fireEvent.click(getButtonByLabel(container, 'Open Approvals'));
    expect(getActivePanelId(container)).toBe('core-tools');
    expect(getSelectedModuleId(container)).toBe('approvals-checkpoints');
    expect(getSelectedModuleTitle(container)).toBe('Approvals & Checkpoints');
  });

  it('Open Settings: routes to systems-administration with control-center-settings selected', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    fireEvent.click(getButtonByLabel(container, 'Open Settings'));
    expect(getActivePanelId(container)).toBe('systems-administration');
    expect(getSelectedModuleId(container)).toBe('control-center-settings');
    expect(getSelectedModuleTitle(container)).toBe('Control Center Settings');
  });

  it('Open External Platforms: routes to core-tools with external-platforms selected', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    fireEvent.click(getButtonByLabel(container, 'Open External Platforms'));
    expect(getActivePanelId(container)).toBe('core-tools');
    expect(getSelectedModuleId(container)).toBe('external-platforms');
    expect(getSelectedModuleTitle(container)).toBe('External Platforms');
  });

  it('Open Team & Access: routes to core-tools with team-access selected', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    fireEvent.click(getButtonByLabel(container, 'Open Team & Access'));
    expect(getActivePanelId(container)).toBe('core-tools');
    expect(getSelectedModuleId(container)).toBe('team-access');
    expect(getSelectedModuleTitle(container)).toBe('Team & Access');
  });
});

// Phase 08 Prompt 08 — additive evidence markers split by concern:
// - module-target marker on the <button> (actionable target).
// - disabled-reason-visibility marker on the wrapper <span> (group state).
// Markers do NOT duplicate across button + wrapper.

interface GatewayModuleExpectation {
  readonly label: string;
  readonly module: string;
}

const GATEWAY_MODULE_EXPECTATIONS: readonly GatewayModuleExpectation[] = [
  { label: 'Open Action Center', module: 'action-center' },
  { label: 'Open Site Health', module: 'site-health' },
  { label: 'Open Document Control', module: 'document-control-center' },
  { label: 'Open Startup Center', module: 'startup-center' },
  { label: 'Open Approvals', module: 'approvals-checkpoints' },
  { label: 'Open Settings', module: 'control-center-settings' },
  { label: 'Open External Platforms', module: 'external-platforms' },
  { label: 'Open Team & Access', module: 'team-access' },
  // Disabled preview-only gateway: no moduleId in the registry.
  { label: 'View Activity Context', module: '' },
];

function getWrapperForLabel(container: HTMLElement, label: string): HTMLElement {
  const button = getButtonByLabel(container, label);
  const wrapper = button.closest<HTMLElement>('[data-pcc-project-home-gateway]');
  if (!wrapper) {
    throw new Error(`Gateway wrapper for "${label}" not found`);
  }
  return wrapper;
}

describe('Project Home gateway actions — Phase 08 Prompt 08 evidence markers', () => {
  it.each(GATEWAY_MODULE_EXPECTATIONS)(
    'button for "$label" carries data-pcc-project-home-gateway-module="$module"',
    ({ label, module }) => {
      const { container } = render(<PccApp forceMode="desktop" />);
      const button = getButtonByLabel(container, label);
      expect(button.getAttribute('data-pcc-project-home-gateway-module')).toBe(module);
    },
  );

  it('wrapper for an enabled gateway carries data-pcc-project-home-gateway-disabled-reason="none"', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const wrapper = getWrapperForLabel(container, 'Open Action Center');
    expect(wrapper.getAttribute('data-pcc-project-home-gateway-disabled-reason')).toBe('none');
    // Sentinel: no reason copy renders on enabled gateways.
    expect(wrapper.querySelector('[data-pcc-project-home-gateway-reason]')).toBeNull();
  });

  it('wrapper for the disabled Recent Activity gateway carries data-pcc-project-home-gateway-disabled-reason="visible" and renders the reason copy', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const wrapper = getWrapperForLabel(container, 'View Activity Context');
    expect(wrapper.getAttribute('data-pcc-project-home-gateway-disabled-reason')).toBe('visible');
    const reason = wrapper.querySelector('[data-pcc-project-home-gateway-reason]');
    expect(reason).not.toBeNull();
    expect(reason?.textContent).toBe('Activity context is preview-only in this release.');
  });

  it('no gateway action wrapper duplicates the disabled-reason marker on its button', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    // Placement contract sentinel: markers are split by concern. The
    // disabled-reason-visibility marker lives on the wrapper only; tests
    // should never find it on a button.
    const buttonsWithReasonMarker = container.querySelectorAll(
      'button[data-pcc-project-home-gateway-disabled-reason]',
    );
    expect(buttonsWithReasonMarker).toHaveLength(0);
    // The complementary sentinel: buttons should never carry the wrapper's
    // marker, and wrappers should never carry the button's module marker.
    const wrappersWithModuleMarker = container.querySelectorAll(
      'span[data-pcc-project-home-gateway][data-pcc-project-home-gateway-module]',
    );
    expect(wrappersWithModuleMarker).toHaveLength(0);
  });
});
