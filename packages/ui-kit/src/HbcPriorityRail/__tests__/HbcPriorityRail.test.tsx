import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AlertTriangle } from 'lucide-react';
import { HbcPriorityRailPreviewSurface } from '../HbcPriorityRailPreviewSurface.js';
import { HbcPriorityRailSurface } from '../HbcPriorityRailSurface.js';
import type { PriorityRailActionModel } from '../types.js';

const ACTIONS: PriorityRailActionModel[] = [
  { id: 'a-1', title: 'Approve RFI', href: '/rfi/1', icon: AlertTriangle },
  { id: 'a-2', title: 'Sign CO #22', href: '/co/22' },
  { id: 'a-3', title: 'Review Safety Note', href: '/safety/1' },
];

describe('HbcPriorityRail shared family', () => {
  it('default context renders grouped sections in deterministic order', () => {
    render(
      <HbcPriorityRailSurface
        title="Priority Actions"
        items={[]}
        sections={[
          { key: 'approvals', title: 'Approvals', actions: [ACTIONS[0]!, ACTIONS[1]!] },
          { key: 'safety', title: 'Safety', actions: [ACTIONS[2]!] },
        ]}
      />,
    );

    const sectionTitles = screen.getAllByText(/^(Approvals|Safety)$/).map((n) => n.textContent);
    expect(sectionTitles).toEqual(['Approvals', 'Safety']);

    const sections = screen.getAllByTestId(/section-/);
    expect(within(sections[0]!).getAllByRole('link').map((n) => n.textContent)).toEqual([
      'Approve RFI',
      'Sign CO #22',
    ]);
    expect(within(sections[1]!).getByRole('link', { name: /Review Safety Note/ })).toBeInTheDocument();
  });

  it('inline-disclosure overflow exposes aria-expanded/controls and dismisses on Escape', () => {
    render(
      <HbcPriorityRailSurface
        title="Priority Actions"
        items={[ACTIONS[0]!]}
        overflowItems={[ACTIONS[1]!, ACTIONS[2]!]}
        overflowLabel="More Actions"
        overflowStrategy="inline-disclosure"
      />,
    );

    const trigger = screen.getByRole('button', { name: /More Actions/ });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    const controlsId = trigger.getAttribute('aria-controls');
    expect(controlsId).not.toBeNull();

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const panel = document.getElementById(controlsId!);
    expect(panel?.getAttribute('role')).toBe('region');

    fireEvent.keyDown(panel!, { key: 'Escape' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(document.activeElement).toBe(trigger);
  });

  it('menu-strategy overflow opens a menu with the deferred actions', () => {
    render(
      <HbcPriorityRailSurface
        title="Priority Actions"
        items={[ACTIONS[0]!]}
        overflowItems={[ACTIONS[1]!, ACTIONS[2]!]}
        overflowLabel="More Actions"
        overflowStrategy="menu"
      />,
    );

    const trigger = screen.getByRole('button', { name: /More Actions/ });
    fireEvent.click(trigger);
    expect(screen.getByRole('menu', { name: /More Actions overflow actions/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Sign CO #22/ })).toBeInTheDocument();
  });

  it('flagship context renders a flat launcher tile grid with one link per action', () => {
    const { container } = render(
      <HbcPriorityRailSurface
        title="Priority Actions"
        context="homepage-flagship"
        items={[ACTIONS[0]!, ACTIONS[1]!, ACTIONS[2]!]}
      />,
    );

    const surface = container.querySelector('[data-hbc-ui="priority-rail"]');
    expect(surface?.getAttribute('data-hbc-priority-rail-context')).toBe('homepage-flagship');
    expect(surface?.getAttribute('data-hbc-flagship-layout')).toBe('launcher-grid');
    expect(surface?.className).toMatch(/contextHomepageFlagship/);

    const grid = container.querySelector('[data-hbc-flagship-grid="true"]');
    expect(grid).not.toBeNull();
    expect(grid?.getAttribute('data-hbc-flagship-tile-count')).toBe('3');

    const tiles = container.querySelectorAll('[data-hbc-flagship-tile="true"]');
    expect(tiles.length).toBe(3);

    // Each tile is a single click target — one anchor per tile, no extra
    // launch chip or badge chrome in the tile body.
    for (const tile of tiles) {
      const anchors = tile.querySelectorAll('a[data-hbc-ui="priority-rail-action"]');
      expect(anchors.length).toBe(1);
    }

    // Legacy command-band chrome is gone: no masthead, no sequence chips,
    // no eyebrow labels, no featured masthead slot, no stacked section
    // headers.
    expect(container.querySelector('[data-hbc-featured-slot]')).toBeNull();
    expect(container.querySelector('[data-hbc-flagship-compacted]')).toBeNull();
    expect(
      Array.from(tiles).some((t) => t.getAttribute('data-hbc-tile-eyebrow')),
    ).toBe(false);
  });

  it('flagship flattens sections into ordered launcher tiles when items prop is empty', () => {
    const { container } = render(
      <HbcPriorityRailSurface
        title="Priority Actions"
        context="homepage-flagship"
        items={[]}
        sections={[
          { key: 'approvals', title: 'Approvals', actions: [ACTIONS[0]!, ACTIONS[1]!] },
          { key: 'safety', title: 'Safety', actions: [ACTIONS[2]!] },
        ]}
      />,
    );

    const tiles = container.querySelectorAll('[data-hbc-flagship-tile="true"]');
    expect(tiles.length).toBe(3);
    const titles = Array.from(tiles).map((t) => t.querySelector('a')?.textContent?.trim() ?? '');
    expect(titles[0]).toContain('Approve RFI');
    expect(titles[1]).toContain('Sign CO #22');
    expect(titles[2]).toContain('Review Safety Note');
  });

  it('flagship overflow defaults to menu strategy (no inline disclosure footer)', () => {
    render(
      <HbcPriorityRailSurface
        title="Priority Actions"
        context="homepage-flagship"
        items={[ACTIONS[0]!]}
        overflowItems={[ACTIONS[1]!, ACTIONS[2]!]}
        overflowLabel="More tools"
      />,
    );

    const trigger = screen.getByRole('button', { name: /More tools/ });
    fireEvent.click(trigger);
    expect(screen.getByRole('menu', { name: /More tools overflow actions/i })).toBeInTheDocument();
  });

  it('external links carry the external-link corner cue and screen-reader text', () => {
    const { container } = render(
      <HbcPriorityRailSurface
        title="Priority Actions"
        context="homepage-flagship"
        items={[
          { id: 'ext-1', title: 'Open policy', href: 'https://policy.example', external: true },
          { id: 'int-1', title: 'Approve RFI', href: '/rfi/1' },
        ]}
      />,
    );

    const externalLink = container.querySelector(
      'a[data-hbc-action-external="true"]',
    ) as HTMLElement | null;
    expect(externalLink).not.toBeNull();
    expect(externalLink?.getAttribute('target')).toBe('_blank');
    expect(externalLink?.getAttribute('rel')).toContain('noopener');
    expect(externalLink?.textContent).toContain('(opens in new tab)');

    const internalLink = container.querySelector(
      'a[href="/rfi/1"]',
    ) as HTMLElement | null;
    expect(internalLink?.getAttribute('data-hbc-action-external')).toBeNull();
    expect(internalLink?.textContent).not.toContain('(opens in new tab)');
  });

  it('default-context surface tags the root and omits the flagship class', () => {
    const { container } = render(
      <HbcPriorityRailSurface title="Priority Actions" items={[ACTIONS[0]!]} />,
    );
    const root = container.querySelector('[data-hbc-ui="priority-rail"]') as HTMLElement | null;
    expect(root?.getAttribute('data-hbc-priority-rail-context')).toBe('default');
    expect(root?.className).not.toContain('contextHomepageFlagship');
  });

  it('preview surface defaults to the default context (no flagship styling)', () => {
    const { container } = render(
      <HbcPriorityRailPreviewSurface
        previewLabel="Admin Preview"
        title="Priority Actions"
        items={[ACTIONS[0]!]}
      />,
    );
    const root = container.querySelector('[data-hbc-ui="priority-rail"]') as HTMLElement | null;
    expect(root?.getAttribute('data-hbc-priority-rail-context')).toBe('default');
    expect(root?.className).not.toContain('contextHomepageFlagship');
  });

  it('preview surface renders grouped content through the shared default path', () => {
    render(
      <HbcPriorityRailPreviewSurface
        previewLabel="Admin Preview"
        title="Priority Actions"
        items={[]}
        sections={[{ key: 'approvals', title: 'Approvals', actions: [ACTIONS[0]!] }]}
        overflowItems={[ACTIONS[2]!]}
        overflowStrategy="sheet"
      />,
    );

    expect(screen.getByText('Admin Preview')).toBeInTheDocument();
    expect(screen.getByText('Approvals')).toBeInTheDocument();
    const trigger = screen.getByRole('button', { name: /More tools/ });
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog', { name: /More tools overflow actions/i })).toBeInTheDocument();
  });
});
