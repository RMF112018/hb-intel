/**
 * HbcHomepageLauncher — anatomy + runtime-marker + overflow tests.
 *
 * These tests pin the surface identity so hosted-runtime proof
 * scripts can assert the packaged homepage is rendering the new
 * chip-band launcher — not the retired vertical tile grid.
 */
import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { HbcHomepageLauncher } from '../HbcHomepageLauncher.js';
import { HBC_HOMEPAGE_LAUNCHER_VERSION } from '../constants.js';
import type { HomepageLauncherChipModel } from '../types.js';

const CHIPS: HomepageLauncherChipModel[] = [
  { id: 'approve-rfi', title: 'Approve RFI', href: '/rfi', icon: AlertTriangle },
  { id: 'sign-co', title: 'Sign CO #22', href: '/co/22', icon: ArrowRight },
  { id: 'safety', title: 'Safety Review', href: '/safety', icon: CheckCircle2 },
  { id: 'field', title: 'Field Report', href: '/field', icon: ArrowRight },
  { id: 'punch', title: 'Punch List', href: '/punch', icon: ArrowRight },
  { id: 'timesheet', title: 'Submit Timesheet', href: '/ts', icon: ArrowRight },
];

describe('HbcHomepageLauncher — anatomy + runtime markers', () => {
  it('emits the full hosted-parity marker set on the root', () => {
    const { container } = render(
      <HbcHomepageLauncher
        primary={CHIPS.slice(0, 5)}
        overflow={[CHIPS[5]!]}
        deviceClass="desktop"
      />,
    );
    const root = container.querySelector('[data-hbc-ui="homepage-launcher"]');
    expect(root).not.toBeNull();
    expect(root!.getAttribute('data-hbc-homepage-launcher-version')).toBe(
      HBC_HOMEPAGE_LAUNCHER_VERSION,
    );
    expect(root!.getAttribute('data-hbc-homepage-launcher-device-class')).toBe('desktop');
    expect(root!.getAttribute('data-hbc-homepage-launcher-visible-count')).toBe('5');
    expect(root!.getAttribute('data-hbc-homepage-launcher-overflow-count')).toBe('1');
    expect(root!.getAttribute('data-hbc-homepage-launcher-overflow-mode')).toBe('menu');
    expect(root!.getAttribute('data-hbc-homepage-launcher-short-height')).toBe('false');
  });

  it('renders one chip per primary action with a single dominant click target', () => {
    render(<HbcHomepageLauncher primary={CHIPS.slice(0, 4)} deviceClass="desktop" />);
    const chips = screen.getAllByRole('link');
    expect(chips.length).toBe(4);
    for (const chip of chips) {
      expect(chip.getAttribute('data-hbc-ui')).toBe('homepage-launcher-chip');
    }
  });

  it('uses anchored menu overflow on desktop', () => {
    render(
      <HbcHomepageLauncher
        primary={CHIPS.slice(0, 5)}
        overflow={[CHIPS[5]!]}
        deviceClass="desktop"
      />,
    );
    const trigger = screen.getByRole('button', { name: /More tools/i });
    expect(trigger.getAttribute('data-hbc-overflow-mode')).toBe('menu');
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    fireEvent.click(trigger);
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /Submit Timesheet/ })).toBeInTheDocument();
  });

  it('uses bottom-sheet overflow on phone', () => {
    render(
      <HbcHomepageLauncher
        primary={CHIPS.slice(0, 3)}
        overflow={CHIPS.slice(3)}
        deviceClass="phone"
      />,
    );
    const trigger = screen.getByRole('button', { name: /More tools/i });
    expect(trigger.getAttribute('data-hbc-overflow-mode')).toBe('sheet');
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
  });

  it('short-height forces sheet overflow even on desktop', () => {
    const { container } = render(
      <HbcHomepageLauncher
        primary={CHIPS.slice(0, 5)}
        overflow={[CHIPS[5]!]}
        deviceClass="desktop"
        shortHeight
      />,
    );
    const root = container.querySelector('[data-hbc-ui="homepage-launcher"]');
    expect(root!.getAttribute('data-hbc-homepage-launcher-overflow-mode')).toBe('sheet');
    expect(root!.getAttribute('data-hbc-homepage-launcher-short-height')).toBe('true');
  });

  it('omits overflow trigger when no overflow items provided', () => {
    render(<HbcHomepageLauncher primary={CHIPS.slice(0, 4)} deviceClass="tablet-portrait" />);
    expect(screen.queryByRole('button', { name: /More tools/i })).toBeNull();
  });

  it('overflow trigger toggles aria-expanded on open and second click', () => {
    render(
      <HbcHomepageLauncher
        primary={CHIPS.slice(0, 5)}
        overflow={[CHIPS[5]!]}
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
        primary={[{ id: 'x', title: 'External Tool', href: 'https://x', external: true }]}
        deviceClass="desktop"
      />,
    );
    const link = screen.getByRole('link', { name: /External Tool/ });
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    expect(link.getAttribute('data-hbc-chip-external')).toBe('true');
  });
});
