/**
 * HbcHomepageLauncher — anatomy + runtime-marker + overflow tests.
 *
 * These tests pin the surface identity so hosted-runtime proof
 * scripts can assert the packaged homepage is rendering the new
 * tile-family launcher — not the retired vertical tile grid.
 */
import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { HbcHomepageLauncher } from '../HbcHomepageLauncher.js';
import { HBC_HOMEPAGE_LAUNCHER_VERSION } from '../constants.js';
import type { HomepageLauncherTileModel } from '../types.js';

const TILES: HomepageLauncherTileModel[] = [
  { id: 'approve-rfi', serviceKey: 'approve-rfi', title: 'Approve RFI', href: '/rfi', icon: AlertTriangle, groupKey: 'approvals', groupTitle: 'Approvals' },
  { id: 'sign-co', serviceKey: 'sign-co', title: 'Sign CO #22', href: '/co/22', icon: ArrowRight, groupKey: 'approvals', groupTitle: 'Approvals' },
  { id: 'safety', serviceKey: 'safety', title: 'Safety Review', href: '/safety', icon: CheckCircle2, groupKey: 'field', groupTitle: 'Field Ops' },
  { id: 'field', serviceKey: 'field', title: 'Field Report', href: '/field', icon: ArrowRight, groupKey: 'field', groupTitle: 'Field Ops' },
  { id: 'punch', serviceKey: 'punch', title: 'Punch List', href: '/punch', icon: ArrowRight },
  { id: 'timesheet', serviceKey: 'timesheet', title: 'Submit Timesheet', href: '/ts', icon: ArrowRight, openInNewTab: true },
];

describe('HbcHomepageLauncher — anatomy + runtime markers', () => {
  it('emits the full hosted-parity marker set on the root', () => {
    const { container } = render(
      <HbcHomepageLauncher primary={TILES.slice(0, 5)} overflow={[TILES[5]!]} deviceClass="desktop" />,
    );
    const root = container.querySelector('[data-hbc-ui="homepage-launcher"]');
    expect(root).not.toBeNull();
    expect(root!.getAttribute('data-hbc-homepage-launcher-version')).toBe(
      HBC_HOMEPAGE_LAUNCHER_VERSION,
    );
    expect(root!.getAttribute('data-hbc-homepage-launcher-device-class')).toBe('desktop');
    expect(root!.getAttribute('data-hbc-homepage-launcher-row-primitive')).toBe('tile-family');
    expect(root!.getAttribute('data-hbc-homepage-launcher-visible-count')).toBe('5');
    expect(root!.getAttribute('data-hbc-homepage-launcher-overflow-count')).toBe('1');
    expect(root!.getAttribute('data-hbc-homepage-launcher-overflow-mode')).toBe('menu');
    expect(root!.getAttribute('data-hbc-homepage-launcher-drawer-source')).toBe('overflow-only');
    expect(root!.getAttribute('data-hbc-homepage-launcher-cap-governance')).toBe(
      'binding-visible-cap',
    );
    expect(root!.getAttribute('data-hbc-homepage-launcher-short-height')).toBe('false');
  });

  it('renders one tile per primary action with one dominant click target', () => {
    render(<HbcHomepageLauncher primary={TILES.slice(0, 4)} deviceClass="desktop" />);
    const tiles = screen.getAllByRole('link');
    expect(tiles.length).toBe(4);
    for (const tile of tiles) {
      expect(tile.getAttribute('data-hbc-ui')).toBe('homepage-launcher-tile');
      expect(tile.getAttribute('data-hbc-launcher-tile-variant')).toBe('primary');
    }
  });

  it('uses anchored menu overflow on desktop', () => {
    render(
      <HbcHomepageLauncher primary={TILES.slice(0, 5)} overflow={[TILES[5]!]} deviceClass="desktop" />,
    );
    const trigger = screen.getByRole('button', { name: /More tools/i });
    expect(trigger.getAttribute('data-hbc-overflow-mode')).toBe('menu');
    expect(trigger.getAttribute('data-hbc-homepage-launcher-overflow-variant')).toBe(
      'secondary-overflow-entry',
    );
    expect(trigger.getAttribute('data-hbc-launcher-tile-variant')).toBe('secondary-overflow-entry');
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    fireEvent.click(trigger);
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /Submit Timesheet/ })).toBeInTheDocument();
  });

  it('uses single-entry all-tools sheet mode on phone', () => {
    render(
      <HbcHomepageLauncher
        primary={TILES.slice(0, 3)}
        overflow={TILES.slice(3)}
        deviceClass="phone"
      />,
    );
    const trigger = screen.getByRole('button', { name: /More tools/i });
    expect(screen.queryByRole('link', { name: /Approve RFI/i })).toBeNull();
    expect(trigger.getAttribute('data-hbc-overflow-mode')).toBe('sheet');
    expect(trigger.getAttribute('data-hbc-homepage-launcher-overflow-variant')).toBe('mobile-entry');
    expect(trigger.getAttribute('data-hbc-launcher-tile-variant')).toBe('mobile-entry');
    expect(trigger.getAttribute('data-hbc-homepage-launcher-sheet-content')).toBe('all-tools');
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
  });

  it('short-height forces sheet overflow even on desktop', () => {
    const { container } = render(
      <HbcHomepageLauncher
        primary={TILES.slice(0, 5)}
        overflow={[TILES[5]!]}
        deviceClass="desktop"
        shortHeight
      />,
    );
    const root = container.querySelector('[data-hbc-ui="homepage-launcher"]');
    expect(root!.getAttribute('data-hbc-homepage-launcher-overflow-mode')).toBe('sheet');
    expect(root!.getAttribute('data-hbc-homepage-launcher-short-height')).toBe('true');
    expect(root!.getAttribute('data-hbc-homepage-launcher-handheld-mode')).toBe(
      'single-entry-all-tools',
    );
  });

  it('omits overflow trigger when no overflow items provided', () => {
    render(<HbcHomepageLauncher primary={TILES.slice(0, 4)} deviceClass="tablet-portrait" />);
    expect(screen.queryByRole('button', { name: /More tools/i })).toBeNull();
  });

  it('overflow trigger toggles aria-expanded on open and second click', () => {
    render(
      <HbcHomepageLauncher
        primary={TILES.slice(0, 5)}
        overflow={[TILES[5]!]}
        deviceClass="desktop"
      />,
    );
    const trigger = screen.getByRole('button', { name: /More tools/i });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(screen.queryByRole('menu')).not.toBeNull();
  });

  it('external chips render with target=_blank and a visually-hidden affordance note', () => {
    render(
      <HbcHomepageLauncher
        primary={[{ id: 'x', serviceKey: 'x', title: 'External Tool', href: 'https://x', external: true }]}
        deviceClass="desktop"
      />,
    );
    const link = screen.getByRole('link', { name: /External Tool/ });
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    expect(link.getAttribute('data-hbc-launcher-tile-external')).toBe('true');
  });

  it('honors explicit openInNewTab even for internal links', () => {
    render(
      <HbcHomepageLauncher
        primary={[{ id: 'internal', serviceKey: 'internal', title: 'Internal New Tab', href: '/internal', openInNewTab: true }]}
        deviceClass="desktop"
      />,
    );
    const link = screen.getByRole('link', { name: /Internal New Tab/ });
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('data-hbc-launcher-tile-new-tab')).toBe('true');
  });

  it('uses the visible chip title as truncation-rescue tooltip text', () => {
    render(
      <HbcHomepageLauncher
        primary={[
          {
            id: 'long-chip',
            serviceKey: 'long-chip',
            title: 'Approve subcontractor compliance package for mobilization',
            href: '/compliance',
            description: 'Legacy description should not override title rescue.',
          },
        ]}
        deviceClass="desktop"
      />,
    );
    const link = screen.getByRole('link', {
      name: /Approve subcontractor compliance package for mobilization/i,
    });
    expect(link.getAttribute('title')).toBe(
      'Approve subcontractor compliance package for mobilization',
    );
  });

  it('renders overflow grouping headings when group metadata is provided', () => {
    render(
      <HbcHomepageLauncher
        primary={TILES.slice(0, 2)}
        overflow={TILES.slice(2)}
        deviceClass="desktop"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /More tools/i }));
    expect(screen.getByText('Field Ops')).toBeInTheDocument();
  });

  it('renders grouped overflow deterministically in menu mode', () => {
    render(
      <HbcHomepageLauncher
        primary={TILES.slice(0, 1)}
        overflow={[
          { id: 'z-qa', serviceKey: 'z-qa', title: 'QA Checklist', href: '/qa', groupKey: 'quality', groupTitle: 'Quality' },
          { id: 'a-approve', serviceKey: 'a-approve', title: 'Approve Budget', href: '/budget', groupKey: 'approvals', groupTitle: 'Approvals' },
          { id: 'b-approve', serviceKey: 'b-approve', title: 'Sign Change Order', href: '/co', groupKey: 'approvals', groupTitle: 'Approvals' },
        ]}
        deviceClass="desktop"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /More tools/i }));
    const groupHeadings = screen.getAllByText(/Approvals|Quality/).map((node) => node.textContent);
    expect(groupHeadings).toEqual(['Approvals', 'Quality']);
    const menuItems = screen.getAllByRole('menuitem').map((node) => node.textContent);
    expect(menuItems).toEqual(['Approve Budget', 'Sign Change Order', 'QA Checklist']);
  });

  it('uses visible overflow title as truncation-rescue tooltip text', () => {
    render(
      <HbcHomepageLauncher
        primary={TILES.slice(0, 1)}
        overflow={[
          {
            id: 'long-overflow',
            serviceKey: 'long-overflow',
            title: 'Review prefabrication delivery and crane sequencing checklist',
            href: '/prefab-checklist',
            description: 'Description should not replace title rescue.',
          },
        ]}
        deviceClass="desktop"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /More tools/i }));
    const item = screen.getByRole('menuitem', {
      name: /Review prefabrication delivery and crane sequencing checklist/i,
    });
    expect(item.getAttribute('title')).toBe(
      'Review prefabrication delivery and crane sequencing checklist',
    );
  });

  it('keeps grouped overflow intentional in sheet mode', async () => {
    render(
      <HbcHomepageLauncher
        primary={TILES.slice(0, 2)}
        overflow={[
          { id: 'field-log', serviceKey: 'field-log', title: 'Field Log', href: '/field-log', groupKey: 'field', groupTitle: 'Field Ops' },
          { id: 'incident', serviceKey: 'incident', title: 'Incident Report', href: '/incident', groupKey: 'field', groupTitle: 'Field Ops' },
        ]}
        deviceClass="phone"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /More tools/i }));
    expect(await screen.findByText('Field Ops')).toBeInTheDocument();
    expect((await screen.findAllByRole('menuitem')).length).toBe(2);
  });

  it('handheld mode emits all-tools runtime markers', () => {
    const { container } = render(
      <HbcHomepageLauncher primary={TILES.slice(0, 1)} overflow={TILES.slice(0, 4)} deviceClass="phone" />,
    );
    const root = container.querySelector('[data-hbc-ui="homepage-launcher"]');
    expect(root?.getAttribute('data-hbc-homepage-launcher-handheld-mode')).toBe(
      'single-entry-all-tools',
    );
    expect(root?.getAttribute('data-hbc-homepage-launcher-visible-count')).toBe('1');
    expect(root?.getAttribute('data-hbc-homepage-launcher-all-tools-count')).toBe('4');
    expect(root?.getAttribute('data-hbc-homepage-launcher-drawer-source')).toBe('all-tools');
    expect(root?.getAttribute('data-hbc-homepage-launcher-cap-governance')).toBe(
      'all-tools-drawer',
    );
  });
});
