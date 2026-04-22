/**
 * HbcHomepageLauncher — anatomy + runtime-marker + overflow tests.
 *
 * These tests pin the surface identity so hosted-runtime proof
 * scripts can assert the packaged homepage is rendering the new
 * tile-family launcher — not the retired vertical tile grid.
 */
import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { HbcHomepageLauncher } from '../HbcHomepageLauncher.js';
import {
  HBC_HOMEPAGE_LAUNCHER_VERSION,
  HBC_HOMEPAGE_LAUNCHER_VISIBLE_COUNT,
} from '../constants.js';
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
    expect(root!.getAttribute('data-hbc-homepage-launcher-overflow-mode')).toBe('more-tools');
    expect(root!.getAttribute('data-hbc-homepage-launcher-drawer-source')).toBe('all-tools');
    expect(root!.getAttribute('data-hbc-homepage-launcher-cap-governance')).toBe(
      'binding-visible-cap',
    );
    expect(root!.getAttribute('data-hbc-homepage-launcher-drawer-category')).toBe(
      'company-tools',
    );
    expect(root!.getAttribute('data-hbc-homepage-launcher-surface-grammar')).toBe(
      'flagship-utility-v1',
    );
    expect(root!.getAttribute('data-hbc-homepage-launcher-short-height')).toBe('false');
    expect(container.querySelector('[data-hbc-homepage-launcher-header]')).toBeNull();
    expect(container.querySelector('[data-hbc-homepage-launcher-tool-count]')).toBeNull();
    expect(screen.queryByText('Homepage tools')).toBeNull();
    expect(screen.queryByRole('heading', { name: /Priority Actions/i })).toBeNull();
  });

  it('renders one tile per primary action with one dominant click target', () => {
    render(<HbcHomepageLauncher primary={TILES.slice(0, 4)} deviceClass="desktop" />);
    const tiles = screen.getAllByRole('link');
    expect(tiles.length).toBe(4);
    for (const tile of tiles) {
      expect(tile.getAttribute('data-hbc-ui')).toBe('homepage-launcher-tile');
      expect(tile.getAttribute('data-hbc-launcher-tile-variant')).toBe('primary');
      expect(tile.getAttribute('data-hbc-launcher-tile-geometry')).toBe('icon-forward-square');
    }
  });

  it('renders governed asset icons with shared source markers in row and drawer tiles', () => {
    render(
      <HbcHomepageLauncher
        primary={[
          {
            id: 'my-adp',
            serviceKey: 'my-adp',
            title: 'My ADP',
            href: '/my-adp',
            iconAssetSrc: '/assets/adp_logo.svg',
            iconPresentation: 'compliant',
            iconKey: 'my-adp',
          },
        ]}
        overflow={[
          {
            id: 'procore',
            serviceKey: 'procore',
            title: 'Procore',
            href: '/procore',
            iconAssetSrc: '/assets/procore.svg',
            iconPresentation: 'compliant',
            iconKey: 'procore',
          },
        ]}
        deviceClass="desktop"
      />,
    );
    const rowTile = screen.getByRole('link', { name: /My ADP/i });
    expect(rowTile.getAttribute('data-hbc-launcher-tile-icon-source')).toBe('asset');
    const rowIcon = rowTile.querySelector('span[aria-hidden="true"]');
    expect(rowIcon?.className.includes('tileIconCompliant')).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: /More tools/i }));
    const drawerTile = screen.getByRole('link', { name: /Procore/i });
    expect(drawerTile.getAttribute('data-hbc-launcher-tile-icon-source')).toBe('asset');
    const drawerIcon = drawerTile.querySelector('span[aria-hidden="true"]');
    expect(drawerIcon?.className.includes('tileIconCompliant')).toBe(true);
  });

  it('uses bottom drawer overflow on desktop with single Company Tools category', () => {
    const { container } = render(
      <HbcHomepageLauncher primary={TILES.slice(0, 5)} overflow={[TILES[5]!]} deviceClass="desktop" />,
    );
    const trigger = screen.getByRole('button', { name: /More tools/i });
    const row = container.querySelector('[data-hbc-launcher-band-mode="standard"]');
    expect(row?.contains(trigger)).toBe(true);
    expect(row?.getAttribute('data-hbc-launcher-band-surface')).toBe('flat');
    expect(trigger.getAttribute('data-hbc-overflow-mode')).toBe('more-tools');
    expect(trigger.getAttribute('data-hbc-homepage-launcher-overflow-variant')).toBe(
      'secondary-overflow-entry',
    );
    expect(
      trigger.querySelector('[data-hbc-homepage-launcher-overflow-count-badge="handheld"]'),
    ).toBeNull();
    expect(trigger.getAttribute('data-hbc-launcher-tile-variant')).toBe('secondary-overflow-entry');
    expect(trigger.getAttribute('data-hbc-launcher-tile-geometry')).toBe('icon-forward-square');
    expect(trigger.getAttribute('data-hbc-launcher-tile-size-contract')).toBe('row');
    expect(trigger.getAttribute('data-hbc-homepage-launcher-overflow-shape')).toBe('tile');
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    fireEvent.click(trigger);
    const dialog = screen.getByRole('dialog', { name: /Company Tools/i });
    expect(dialog).toBeInTheDocument();
    expect(dialog.getAttribute('data-hbc-launcher-drawer-category')).toBe('company-tools');
    expect(dialog.getAttribute('data-hbc-launcher-drawer-display-class')).toBe(
      'desktop-company-tools',
    );
    expect(screen.getByRole('link', { name: /Submit Timesheet/ })).toBeInTheDocument();
    expect(
      dialog.querySelector('[data-hbc-ui="homepage-launcher-drawer-rail"]'),
    ).not.toBeNull();
  });

  it('keeps tile descriptions out of the visible tile surface', () => {
    render(
      <HbcHomepageLauncher
        primary={[
          {
            id: 'desc-hidden',
            serviceKey: 'desc-hidden',
            title: 'Daily Field Snapshot',
            description: 'Legacy subtitle should not render in tile face',
            href: '/daily-field-snapshot',
          },
        ]}
        deviceClass="desktop"
      />,
    );
    expect(screen.getByRole('link', { name: /Daily Field Snapshot/ })).toBeInTheDocument();
    expect(screen.queryByText('Legacy subtitle should not render in tile face')).toBeNull();
  });

  it('uses single-entry all-tools sheet mode on phone', () => {
    render(
      <HbcHomepageLauncher
        primary={TILES.slice(0, 3)}
        overflow={TILES.slice(3)}
        deviceClass="phone"
      />,
    );
    const trigger = screen.getByRole('button', { name: /HB Toolbox/i });
    expect(screen.queryByRole('link', { name: /Approve RFI/i })).toBeNull();
    expect(trigger.getAttribute('data-hbc-overflow-mode')).toBe('sheet');
    expect(trigger.getAttribute('data-hbc-homepage-launcher-overflow-variant')).toBe(
      'secondary-overflow-entry',
    );
    expect(
      trigger.querySelector('[data-hbc-homepage-launcher-overflow-count-badge="handheld"]'),
    ).not.toBeNull();
    expect(trigger.getAttribute('data-hbc-launcher-tile-variant')).toBe('secondary-overflow-entry');
    expect(trigger.getAttribute('data-hbc-homepage-launcher-sheet-content')).toBe('all-tools');
    expect(trigger.getAttribute('data-hbc-homepage-launcher-overflow-shape')).toBe('linear-handheld');
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
    const trigger = screen.getByRole('button', { name: /HB Toolbox/i });
    expect(trigger.getAttribute('data-hbc-homepage-launcher-overflow-shape')).toBe(
      'linear-handheld',
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
    expect(screen.queryByRole('dialog', { name: /Company Tools/i })).not.toBeNull();
  });

  it('supports close button, escape key, and focus return to overflow trigger', async () => {
    render(
      <HbcHomepageLauncher
        primary={TILES.slice(0, 3)}
        overflow={TILES.slice(3)}
        deviceClass="desktop"
      />,
    );
    const trigger = screen.getByRole('button', { name: /More tools/i });
    trigger.focus();
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog', { name: /Company Tools/i })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /Company Tools/i })).toBeNull();
    });
    expect(trigger).toHaveFocus();

    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('button', { name: /Close More tools/i }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /Company Tools/i })).toBeNull();
    });
    expect(trigger).toHaveFocus();
  });

  it('dismisses when the backdrop is clicked', async () => {
    const { container } = render(
      <HbcHomepageLauncher
        primary={TILES.slice(0, 3)}
        overflow={TILES.slice(3)}
        deviceClass="desktop"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /More tools/i }));
    expect(screen.getByRole('dialog', { name: /Company Tools/i })).toBeInTheDocument();
    const backdrop = container.ownerDocument.querySelector(
      '[data-hbc-homepage-launcher-sheet-backdrop="true"]',
    );
    expect(backdrop).not.toBeNull();
    fireEvent.click(backdrop!);
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /Company Tools/i })).toBeNull();
    });
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

  it('renders a single-row tray rail inside the company-tools drawer', () => {
    render(
      <HbcHomepageLauncher
        primary={TILES.slice(0, 2)}
        overflow={TILES.slice(2)}
        deviceClass="desktop"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /More tools/i }));
    const dialog = screen.getByRole('dialog', { name: /Company Tools/i });
    expect(dialog.querySelector('[data-hbc-launcher-drawer-layout="single-row-tray"]')).not.toBeNull();
    expect(dialog.querySelector('[data-hbc-launcher-overflow-grouping="none"]')).not.toBeNull();
  });

  it('renders all overflow tools in incoming launcher order under Company Tools', () => {
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
    const dialog = screen.getByRole('dialog', { name: /Company Tools/i });
    const tileOrder = Array.from(dialog.querySelectorAll('a[data-hbc-ui="homepage-launcher-tile"]'))
      .map((node) => node.getAttribute('data-hbc-launcher-tile-id'));
    expect(tileOrder).toEqual(['approve-rfi', 'z-qa', 'a-approve', 'b-approve']);
  });

  it('renders one ungrouped overflow tray rail with list semantics', () => {
    render(
      <HbcHomepageLauncher
        primary={TILES.slice(0, 2)}
        overflow={TILES.slice(2)}
        deviceClass="desktop"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /More tools/i }));
    const dialog = screen.getByRole('dialog', { name: /Company Tools/i });
    const rail = dialog.querySelector('[data-hbc-ui="homepage-launcher-drawer-rail"]');
    expect(rail).not.toBeNull();
    expect(rail?.getAttribute('role')).toBe('list');
    expect(rail?.getAttribute('data-hbc-launcher-drawer-layout')).toBe('single-row-tray');
    expect(rail?.getAttribute('data-hbc-launcher-overflow-grouping')).toBe('none');
    expect(rail?.querySelectorAll('a[data-hbc-ui="homepage-launcher-tile"]').length).toBeGreaterThan(0);
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
    const item = screen.getByRole('link', {
      name: /Review prefabrication delivery and crane sequencing checklist/i,
    });
    expect(item.getAttribute('title')).toBe(
      'Review prefabrication delivery and crane sequencing checklist',
    );
  });

  it('renders one horizontal tray on phone while preserving the company-tools drawer', async () => {
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
    fireEvent.click(screen.getByRole('button', { name: /HB Toolbox/i }));
    expect(await screen.findByRole('dialog', { name: /Company Tools/i })).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: /Company Tools/i })
      .querySelector('[data-hbc-launcher-drawer-layout="single-row-tray"]')).not.toBeNull();
    expect((await screen.findAllByRole('link')).length).toBeGreaterThanOrEqual(2);
  });

  it('handheld overflow trigger toggles expanded state and supports escape close', async () => {
    render(
      <HbcHomepageLauncher
        primary={TILES.slice(0, 2)}
        overflow={TILES.slice(2)}
        deviceClass="phone"
      />,
    );
    const trigger = screen.getByRole('button', { name: /HB Toolbox/i });
    expect(trigger.getAttribute('data-hbc-homepage-launcher-overflow-shape')).toBe('linear-handheld');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(await screen.findByRole('dialog', { name: /Company Tools/i })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /Company Tools/i })).toBeNull();
    });
    expect(trigger).toHaveFocus();
  });

  it('renders drawer tools as tile-family links with drawer icon posture', () => {
    render(
      <HbcHomepageLauncher
        primary={TILES.slice(0, 1)}
        overflow={TILES.slice(1, 4)}
        deviceClass="desktop"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /More tools/i }));
    const drawerLink = screen.getByRole('link', { name: /Sign CO #22/i });
    expect(drawerLink.getAttribute('data-hbc-ui')).toBe('homepage-launcher-tile');
    expect(drawerLink.getAttribute('data-hbc-launcher-tile-family')).toBe('drawer');
    expect(drawerLink.getAttribute('data-hbc-launcher-tile-caption-policy')).toBe(
      'drawer-wrap-no-clip',
    );
    expect(
      screen.queryByRole('link', { name: /Sign CO #22/i })?.getAttribute('data-hbc-ui'),
    ).not.toBe('homepage-launcher-drawer-tile');
  });

  it('reserves a desktop visible-cap large enough for 7 primary tiles plus More Tools', () => {
    expect(HBC_HOMEPAGE_LAUNCHER_VISIBLE_COUNT.desktop).toBeGreaterThanOrEqual(7);
    expect(HBC_HOMEPAGE_LAUNCHER_VISIBLE_COUNT.ultrawide).toBeGreaterThanOrEqual(
      HBC_HOMEPAGE_LAUNCHER_VISIBLE_COUNT.desktop,
    );
    expect(HBC_HOMEPAGE_LAUNCHER_VISIBLE_COUNT['tablet-landscape']).toBeGreaterThanOrEqual(5);
  });

  it('opens drawer with opaque-surface and elevation markers for hosted-parity', () => {
    render(
      <HbcHomepageLauncher
        primary={TILES.slice(0, 5)}
        overflow={[TILES[5]!]}
        deviceClass="desktop"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /More tools/i }));
    const dialog = screen.getByRole('dialog', { name: /Company Tools/i });
    expect(dialog.getAttribute('data-hbc-launcher-drawer-opaque')).toBe('true');
    expect(dialog.getAttribute('data-hbc-launcher-drawer-elevation')).toBe('3');
    expect(dialog.getAttribute('data-hbc-launcher-drawer-category')).toBe('company-tools');
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
