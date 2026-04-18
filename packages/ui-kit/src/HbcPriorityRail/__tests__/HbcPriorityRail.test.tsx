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

  it('renders section featured slot only under homepage-flagship context and excludes it from supporting row list', () => {
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
    expect(featuredSlot?.getAttribute('data-hbc-featured-action')).toBe('a-1');

    const section = container.querySelector('[data-testid="section-approvals"]');
    expect(section?.getAttribute('data-hbc-section-has-featured')).toBe('true');

    const supportingItems = section?.querySelector('[role="list"]:not([data-hbc-featured-slot])');
    const supportingLinks = supportingItems?.querySelectorAll('a') ?? [];
    const supportingTitles = Array.from(supportingLinks).map((node) => node.textContent?.trim());
    expect(supportingTitles).not.toContain('Approve RFI');
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
