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
  it('renders grouped sections in deterministic order', () => {
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

    const sectionTitles = screen.getAllByText(/^(Approvals|Safety)$/).map((node) => node.textContent);
    expect(sectionTitles).toEqual(['Approvals', 'Safety']);

    const sections = screen.getAllByTestId(/section-/);
    const approvals = sections[0]!;
    const safety = sections[1]!;

    expect(within(approvals).getAllByRole('link').map((n) => n.textContent)).toEqual([
      'Approve RFI',
      'Sign CO #22',
    ]);
    expect(within(safety).getByRole('link', { name: /Review Safety Note/ })).toBeInTheDocument();
  });

  it('inline-disclosure overflow exposes aria-expanded/controls, dismisses on Escape, and returns focus to trigger', () => {
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
    expect(panel).not.toBeNull();
    expect(panel?.getAttribute('role')).toBe('region');

    fireEvent.keyDown(panel!, { key: 'Escape' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(document.activeElement).toBe(trigger);
  });

  it('renders the overflow trigger with leading icon, label, and count chip', () => {
    const { container } = render(
      <HbcPriorityRailSurface
        title="Priority Actions"
        items={[ACTIONS[0]!]}
        overflowItems={[ACTIONS[1]!, ACTIONS[2]!]}
        overflowLabel="More Actions"
        overflowStrategy="inline-disclosure"
      />,
    );
    const trigger = screen.getByRole('button', { name: /More Actions/ });
    const svgs = trigger.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(2);
    const countNodes = Array.from(trigger.querySelectorAll('span')).filter(
      (node) => node.textContent?.trim() === '2',
    );
    expect(countNodes.length).toBe(1);
    expect(container).toBeTruthy();
  });

  it('supports strategy-based overflow toggles with accessible expanded state', () => {
    render(
      <HbcPriorityRailSurface
        title="Priority Actions"
        items={[ACTIONS[0]! ]}
        overflowItems={[ACTIONS[1]!, ACTIONS[2]! ]}
        overflowLabel="More Actions"
        overflowStrategy="menu"
      />,
    );

    const trigger = screen.getByRole('button', { name: /More Actions/ });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menu', { name: /More Actions overflow actions/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Sign CO #22/ })).toBeInTheDocument();
  });

  it('keeps flat items backward-compatible when no sections are provided', () => {
    render(
      <HbcPriorityRailSurface
        title="Priority Actions"
        items={[ACTIONS[0]!, ACTIONS[1]! ]}
        overflowItems={[ACTIONS[2]! ]}
      />,
    );

    expect(screen.getByRole('link', { name: /Approve RFI/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Sign CO #22/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /More tools/ })).toBeInTheDocument();
  });

  it('flagship context promotes featured actions into a dedicated band and keeps them out of the supporting command strip', () => {
    const { container, rerender } = render(
      <HbcPriorityRailSurface
        title="Priority Actions"
        context="homepage-flagship"
        items={[]}
        sections={[
          {
            key: 'approvals',
            title: 'Approvals',
            actions: [ACTIONS[0]!, ACTIONS[1]!],
            featured: ACTIONS[0]!,
          },
        ]}
      />,
    );

    const featuredSlot = container.querySelector('[data-hbc-featured-slot="true"]');
    expect(featuredSlot).not.toBeNull();
    const featuredTileEl = featuredSlot?.querySelector('[data-hbc-featured-action="a-1"]');
    expect(featuredTileEl).not.toBeNull();

    const sectionMarker = container.querySelector('[data-testid="section-approvals"]');
    expect(sectionMarker?.getAttribute('data-hbc-section-has-featured')).toBe('true');

    const commandStrip = container.querySelector('[data-hbc-flagship-grid="true"]');
    expect(commandStrip).not.toBeNull();
    const supportingLinks = commandStrip?.querySelectorAll('a') ?? [];
    const supportingTitles = Array.from(supportingLinks).map((node) => node.textContent?.trim());
    expect(supportingTitles.some((t) => t?.includes('Approve RFI'))).toBe(false);
    expect(supportingTitles.some((t) => t?.includes('Sign CO #22'))).toBe(true);

    rerender(
      <HbcPriorityRailSurface
        title="Priority Actions"
        context="default"
        items={[]}
        sections={[
          {
            key: 'approvals',
            title: 'Approvals',
            actions: [ACTIONS[0]!, ACTIONS[1]!],
            featured: ACTIONS[0]!,
          },
        ]}
      />,
    );

    expect(container.querySelector('[data-hbc-featured-slot]')).toBeNull();
    expect(
      container
        .querySelector('[data-testid="section-approvals"]')
        ?.getAttribute('data-hbc-section-has-featured'),
    ).toBeNull();
  });

  it('renders a launch chip and surfaces the external-link cue via screen-reader text', () => {
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

    const links = container.querySelectorAll('a[data-hbc-ui="priority-rail-action"]');
    expect(links.length).toBe(2);

    // Every action renders a launch chip (persistent activation anchor).
    for (const link of links) {
      const chip = link.querySelector(':scope > span');
      // First span may be the icon, so we look for any child span that
      // hosts either the arrow or external-link svg.
      const hasArrow = !!link.querySelector('svg.lucide-arrow-right, svg[class*="arrow"]');
      const hasExternal = !!link.querySelector('svg.lucide-external-link, svg[class*="external"]');
      expect(hasArrow || hasExternal).toBe(true);
      expect(chip).not.toBeNull();
    }

    // External link is tagged structurally and carries a visible-to-SR
    // "(opens in new tab)" affordance.
    const externalLink = container.querySelector(
      'a[data-hbc-action-external="true"]',
    ) as HTMLElement | null;
    expect(externalLink).not.toBeNull();
    expect(externalLink?.getAttribute('target')).toBe('_blank');
    expect(externalLink?.getAttribute('rel')).toContain('noopener');
    expect(externalLink?.textContent).toContain('(opens in new tab)');

    // Internal link does not carry the external marker.
    const internalLink = container.querySelector(
      'a[href="/rfi/1"]',
    ) as HTMLElement | null;
    expect(internalLink?.getAttribute('data-hbc-action-external')).toBeNull();
    expect(internalLink?.textContent).not.toContain('(opens in new tab)');
  });

  it('default-context surface tags the rail root with context="default" and omits the flagship class', () => {
    const { container } = render(
      <HbcPriorityRailSurface
        title="Priority Actions"
        items={[ACTIONS[0]!]}
      />,
    );
    const root = container.querySelector('[data-hbc-ui="priority-rail"]') as HTMLElement | null;
    expect(root).not.toBeNull();
    expect(root?.getAttribute('data-hbc-priority-rail-context')).toBe('default');
    expect(root?.className).not.toContain('contextHomepageFlagship');
  });

  it('admin preview surface defaults to the default context (no flagship styling) when consumer does not opt in', () => {
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

  it('flagship-context surface tags the rail root with context="homepage-flagship" and applies the flagship class', () => {
    const { container } = render(
      <HbcPriorityRailSurface
        title="Priority Actions"
        context="homepage-flagship"
        items={[ACTIONS[0]!]}
      />,
    );
    const root = container.querySelector('[data-hbc-ui="priority-rail"]') as HTMLElement | null;
    expect(root?.getAttribute('data-hbc-priority-rail-context')).toBe('homepage-flagship');
    expect(root?.className).toMatch(/contextHomepageFlagship/);
  });

  it('flagship context renders a horizontal command strip with flattened tiles and default context does not', () => {
    const { container, rerender } = render(
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

    const surface = container.querySelector('[data-hbc-ui="priority-rail"]');
    expect(surface?.getAttribute('data-hbc-flagship-layout')).toBe('command-strip');

    const strip = container.querySelector('[data-hbc-flagship-grid="true"]');
    expect(strip).not.toBeNull();
    // All three actions render in the single flattened strip, not in
    // per-section sub-grids.
    const flagshipTiles = container.querySelectorAll('[data-hbc-flagship-tile="true"]');
    expect(flagshipTiles.length).toBe(3);
    // Every tile carries its group eyebrow so the flattened strip preserves
    // group identity without stacked section headers.
    const eyebrows = Array.from(flagshipTiles)
      .map((node) => node.getAttribute('data-hbc-tile-eyebrow'))
      .filter(Boolean);
    expect(eyebrows).toContain('Approvals');
    expect(eyebrows).toContain('Safety');

    rerender(
      <HbcPriorityRailSurface
        title="Priority Actions"
        context="default"
        items={[ACTIONS[0]!, ACTIONS[1]!, ACTIONS[2]!]}
      />,
    );

    expect(container.querySelector('[data-hbc-flagship-grid="true"]')).toBeNull();
    expect(container.querySelectorAll('[data-hbc-flagship-tile="true"]').length).toBe(0);
    expect(container.querySelector('[data-hbc-flagship-layout]')).toBeNull();
  });

  it('flagship compacts the featured band when every tile is featured (no hierarchy to convey)', () => {
    const { container } = render(
      <HbcPriorityRailSurface
        title="Priority Actions"
        context="homepage-flagship"
        items={[]}
        sections={[
          { key: 'approvals', title: 'Approvals', actions: [ACTIONS[0]!], featured: ACTIONS[0]! },
          { key: 'safety', title: 'Safety', actions: [ACTIONS[2]!], featured: ACTIONS[2]! },
        ]}
      />,
    );

    // Featured band is collapsed because promoting every action to the
    // featured slot adds no scanning benefit — a single command strip
    // carries the whole primary set.
    expect(container.querySelector('[data-hbc-featured-slot="true"]')).toBeNull();
    const surface = container.querySelector('[data-hbc-ui="priority-rail"]');
    expect(surface?.getAttribute('data-hbc-flagship-compacted')).toBe('true');
    const tiles = container.querySelectorAll('[data-hbc-flagship-tile="true"]');
    expect(tiles.length).toBe(2);
  });

  it('flagship compacts a single-action primary into one strip tile without a featured band', () => {
    const { container } = render(
      <HbcPriorityRailSurface
        title="Priority Actions"
        context="homepage-flagship"
        items={[]}
        sections={[
          { key: 'approvals', title: 'Approvals', actions: [ACTIONS[0]!], featured: ACTIONS[0]! },
        ]}
      />,
    );
    expect(container.querySelector('[data-hbc-featured-slot="true"]')).toBeNull();
    const tiles = container.querySelectorAll('[data-hbc-flagship-tile="true"]');
    expect(tiles.length).toBe(1);
  });

  it('flagship suppresses per-tile eyebrows when only one section contributes to the band', () => {
    const { container } = render(
      <HbcPriorityRailSurface
        title="Priority Actions"
        context="homepage-flagship"
        items={[]}
        sections={[
          { key: 'approvals', title: 'Approvals', actions: [ACTIONS[0]!, ACTIONS[1]!] },
        ]}
      />,
    );
    const surface = container.querySelector('[data-hbc-ui="priority-rail"]');
    expect(surface?.getAttribute('data-hbc-flagship-single-section')).toBe('true');
    const tiles = container.querySelectorAll('[data-hbc-flagship-tile="true"]');
    expect(tiles.length).toBe(2);
    for (const tile of tiles) {
      expect(tile.getAttribute('data-hbc-tile-eyebrow')).toBeNull();
      expect(tile.querySelector('[aria-hidden="true"]')?.textContent).not.toBe('Approvals');
    }
  });

  it('flagship suppresses adjacent duplicate eyebrows within the supporting strip', () => {
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
    const tiles = Array.from(
      container.querySelectorAll('[data-hbc-flagship-tile="true"]'),
    );
    const eyebrows = tiles.map((t) => t.getAttribute('data-hbc-tile-eyebrow'));
    // First Approvals tile keeps its eyebrow; second Approvals tile
    // suppresses the redundant "Approvals" repeat; Safety tile shows its
    // eyebrow because the prior eyebrow was different.
    expect(eyebrows).toEqual(['Approvals', null, 'Safety']);
  });

  it('default-context surface still renders per-section headings (flagship compaction does not leak)', () => {
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
    expect(screen.getByText('Approvals')).toBeInTheDocument();
    expect(screen.getByText('Safety')).toBeInTheDocument();
  });

  it('preview surface reuses shared rendering path with grouped content', () => {
    render(
      <HbcPriorityRailPreviewSurface
        previewLabel="Admin Preview"
        title="Priority Actions"
        items={[]}
        sections={[
          { key: 'approvals', title: 'Approvals', actions: [ACTIONS[0]!] },
        ]}
        overflowItems={[ACTIONS[2]! ]}
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
