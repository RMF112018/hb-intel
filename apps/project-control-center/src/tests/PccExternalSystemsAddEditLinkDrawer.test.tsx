/**
 * Wave 15 / Prompt 06 — Add/Edit Project Link drawer behavior.
 *
 * Drawer is portal-mounted to `document.body`, so queries use
 * `screen` / `baseElement`. Asserts:
 *   - drawer is closed by default;
 *   - clicking the surface trigger opens the portal-mounted drawer;
 *   - drawer heading receives focus on open;
 *   - Escape dismisses the drawer and focus returns to the trigger;
 *   - Dismiss buttons (header + footer) close the drawer;
 *   - URL-policy preview reflects allowed / scheme-blocked /
 *     credential-like / custom-link-requires-approval branches as the
 *     user types;
 *   - command button is always disabled with `aria-disabled="true"` and
 *     a visible reason caption — even when policy is allowed and
 *     required fields are filled;
 *   - drawer renders no `<a href="http(s)://">` and no `<iframe>`.
 */

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { PccBentoGrid } from '../layout/PccBentoGrid';
import { PccExternalSystemsSurface } from '../surfaces/externalSystems/PccExternalSystemsSurface';

function renderSurface(): ReturnType<typeof render> {
  return render(
    <PccBentoGrid forceMode="wideDesktop">
      <PccExternalSystemsSurface />
    </PccBentoGrid>,
  );
}

afterEach(() => {
  cleanup();
});

function getTrigger(): HTMLButtonElement {
  const el = document.querySelector(
    '[data-pcc-launch-pad-add-link-trigger]',
  ) as HTMLButtonElement | null;
  if (el === null) throw new Error('add-link trigger not found');
  return el;
}

async function openDrawer(): Promise<HTMLElement> {
  const trigger = getTrigger();
  trigger.focus();
  fireEvent.click(trigger);
  let drawer: HTMLElement | null = null;
  await waitFor(() => {
    drawer = document.querySelector('[data-pcc-launch-pad-drawer="add-edit-link"]');
    expect(drawer).not.toBeNull();
  });
  return drawer!;
}

describe('PccExternalSystemsAddEditLinkDrawer — open/dismiss + focus behavior', () => {
  it('is closed by default; clicking the trigger renders the portal-mounted drawer with role=dialog and aria-modal=true', async () => {
    renderSurface();
    expect(document.querySelector('[data-pcc-launch-pad-drawer]')).toBeNull();
    const drawer = await openDrawer();
    expect(drawer.getAttribute('role')).toBe('dialog');
    expect(drawer.getAttribute('aria-modal')).toBe('true');
    const labelledById = drawer.getAttribute('aria-labelledby');
    expect(labelledById).toBeTruthy();
    const heading = document.getElementById(labelledById!);
    expect(heading).not.toBeNull();
    expect(heading!.tagName.toLowerCase()).toBe('h3');
  });

  it('moves focus to the drawer heading on open', async () => {
    renderSurface();
    await openDrawer();
    await waitFor(() => {
      const labelledById = document
        .querySelector('[data-pcc-launch-pad-drawer]')!
        .getAttribute('aria-labelledby');
      const heading = document.getElementById(labelledById!);
      expect(document.activeElement).toBe(heading);
    });
  });

  it('Escape dismisses the drawer and returns focus to the triggering button', async () => {
    renderSurface();
    const trigger = getTrigger();
    await openDrawer();
    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => {
      expect(document.querySelector('[data-pcc-launch-pad-drawer]')).toBeNull();
    });
    await waitFor(() => {
      expect(document.activeElement).toBe(trigger);
    });
  });

  it('header and footer Dismiss buttons each close the drawer', async () => {
    renderSurface();
    let drawer = await openDrawer();
    const headerDismiss = drawer.querySelector(
      '[data-pcc-launch-pad-drawer-dismiss="header"]',
    ) as HTMLButtonElement;
    expect(headerDismiss).not.toBeNull();
    fireEvent.click(headerDismiss);
    await waitFor(() => {
      expect(document.querySelector('[data-pcc-launch-pad-drawer]')).toBeNull();
    });

    drawer = await openDrawer();
    const footerDismiss = drawer.querySelector(
      '[data-pcc-launch-pad-drawer-dismiss="footer"]',
    ) as HTMLButtonElement;
    expect(footerDismiss).not.toBeNull();
    fireEvent.click(footerDismiss);
    await waitFor(() => {
      expect(document.querySelector('[data-pcc-launch-pad-drawer]')).toBeNull();
    });
  });
});

describe('PccExternalSystemsAddEditLinkDrawer — URL policy preview', () => {
  function getUrlField(drawer: HTMLElement): HTMLInputElement {
    return drawer.querySelector(
      '[data-pcc-launch-pad-drawer-field="launchUrl"]',
    ) as HTMLInputElement;
  }
  function getRequiresApprovalField(drawer: HTMLElement): HTMLInputElement {
    return drawer.querySelector(
      '[data-pcc-launch-pad-drawer-field="requiresApproval"]',
    ) as HTMLInputElement;
  }
  function getPolicyRow(drawer: HTMLElement): HTMLElement {
    return drawer.querySelector('[data-pcc-launch-pad-drawer-policy-reason]') as HTMLElement;
  }

  it('https://example.invalid/foo with no approval gate → allowed', async () => {
    renderSurface();
    const drawer = await openDrawer();
    fireEvent.change(getUrlField(drawer), {
      target: { value: 'https://example.invalid/foo' },
    });
    await waitFor(() => {
      const row = getPolicyRow(drawer);
      expect(row.getAttribute('data-pcc-launch-pad-drawer-policy-allowed')).toBe('true');
      expect(row.getAttribute('data-pcc-launch-pad-drawer-policy-reason')).toBe('allowed');
    });
  });

  it('http://example.invalid/foo → scheme-blocked', async () => {
    renderSurface();
    const drawer = await openDrawer();
    fireEvent.change(getUrlField(drawer), {
      target: { value: 'http://example.invalid/foo' },
    });
    await waitFor(() => {
      const row = getPolicyRow(drawer);
      expect(row.getAttribute('data-pcc-launch-pad-drawer-policy-allowed')).toBe('false');
      expect(row.getAttribute('data-pcc-launch-pad-drawer-policy-reason')).toBe('scheme-blocked');
    });
  });

  it('credential-like query param → query-contains-credential-like-parameter and lists detected param names', async () => {
    renderSurface();
    const drawer = await openDrawer();
    fireEvent.change(getUrlField(drawer), {
      target: { value: 'https://example.invalid/foo?token=abc' },
    });
    await waitFor(() => {
      const row = getPolicyRow(drawer);
      expect(row.getAttribute('data-pcc-launch-pad-drawer-policy-allowed')).toBe('false');
      expect(row.getAttribute('data-pcc-launch-pad-drawer-policy-reason')).toBe(
        'query-contains-credential-like-parameter',
      );
      const detected = drawer.querySelector(
        '[data-pcc-launch-pad-drawer-policy-credential-params]',
      );
      expect(detected).not.toBeNull();
      expect((detected!.textContent ?? '').toLowerCase()).toContain('token');
    });
  });

  it('custom-link with requiresApproval toggled on → custom-link-requires-approval', async () => {
    renderSurface();
    const drawer = await openDrawer();
    fireEvent.change(getUrlField(drawer), {
      target: { value: 'https://example.invalid/foo' },
    });
    // Toggle requiresApproval ON (default is unchecked).
    fireEvent.click(getRequiresApprovalField(drawer));
    // Switch linkType to 'custom' for the conventional pairing.
    const linkTypeSelect = drawer.querySelector(
      '[data-pcc-launch-pad-drawer-field="linkType"]',
    ) as HTMLSelectElement;
    fireEvent.change(linkTypeSelect, { target: { value: 'custom' } });
    await waitFor(() => {
      const row = getPolicyRow(drawer);
      expect(row.getAttribute('data-pcc-launch-pad-drawer-policy-allowed')).toBe('false');
      expect(row.getAttribute('data-pcc-launch-pad-drawer-policy-reason')).toBe(
        'custom-link-requires-approval',
      );
    });
  });
});

describe('PccExternalSystemsAddEditLinkDrawer — disabled command + no executable surface', () => {
  it('command button is always disabled with visible reason — including when URL policy is allowed and required fields are filled', async () => {
    renderSurface();
    const drawer = await openDrawer();
    const titleField = drawer.querySelector(
      '[data-pcc-launch-pad-drawer-field="title"]',
    ) as HTMLInputElement;
    const urlField = drawer.querySelector(
      '[data-pcc-launch-pad-drawer-field="launchUrl"]',
    ) as HTMLInputElement;
    fireEvent.change(titleField, { target: { value: 'Owner manual' } });
    fireEvent.change(urlField, { target: { value: 'https://example.invalid/foo' } });
    await waitFor(() => {
      const row = drawer.querySelector('[data-pcc-launch-pad-drawer-policy-reason="allowed"]');
      expect(row).not.toBeNull();
    });
    const command = drawer.querySelector(
      '[data-pcc-launch-pad-drawer-command="future-only"]',
    ) as HTMLButtonElement;
    expect(command.disabled).toBe(true);
    expect(command.getAttribute('aria-disabled')).toBe('true');
    const reason = drawer.querySelector('[data-pcc-launch-pad-drawer-command-reason]');
    expect(reason).not.toBeNull();
    expect((reason!.textContent ?? '').trim().length).toBeGreaterThan(0);
  });

  it('drawer renders no <a href="http(s)://"> anchors and no <iframe>', async () => {
    renderSurface();
    const drawer = await openDrawer();
    const anchors = drawer.querySelectorAll('a[href]');
    for (const a of anchors) {
      const href = a.getAttribute('href') ?? '';
      expect(href).not.toMatch(/^https?:\/\//);
    }
    expect(drawer.querySelectorAll('iframe').length).toBe(0);
  });
});
