import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import {
  HB_HOMEPAGE_OUTER_ENVELOPE_CONTRACT_ID,
  HB_HOMEPAGE_OUTER_ENVELOPE_MAX_WIDTH_PX,
} from '../hbHomepageContract.js';

// Mock the shell and launcher band so this test stays tightly scoped
// to the wrapper composition contract (order, attributes, enable
// toggle) without exercising shell ResizeObserver internals or
// launcher data-seam plumbing. Shell-side and launcher-side tests
// live adjacent to those units.
vi.mock('../HbHomepageShell.js', () => ({
  HbHomepageShell: (props: Record<string, unknown>): React.JSX.Element =>
    React.createElement('div', {
      'data-test-mock': 'hb-homepage-shell',
      'data-test-has-config': props.config !== undefined ? 'true' : 'false',
    }),
}));

vi.mock('../HbHomepageLauncherBand.js', () => ({
  HbHomepageLauncherBand: (props: Record<string, unknown>): React.JSX.Element => {
    const hasFeaturedKeys = 'featuredActionKeys' in props;
    const hasEntryContainer = 'entryContainer' in props;
    return React.createElement('div', {
      'data-test-mock': 'hb-homepage-launcher-band',
      'data-test-launcher-band-key': (props.bandKey as string | undefined) ?? '',
      'data-test-launcher-audience': (props.activeAudience as string | undefined) ?? '',
      'data-test-launcher-alignment-mode':
        (props.alignmentMode as string | undefined) ?? '',
      'data-test-launcher-has-featured-keys-prop': hasFeaturedKeys ? 'true' : 'false',
      'data-test-launcher-has-entry-container-prop': hasEntryContainer ? 'true' : 'false',
    });
  },
}));

vi.mock('../../hbSignatureHero/HbSignatureHero.js', () => ({
  HbSignatureHero: (props: Record<string, unknown>): React.JSX.Element => {
    const entryStackState = props.entryStackState as
      | { entryState?: { id?: string } }
      | undefined;
    return React.createElement('div', {
      'data-test-mock': 'hb-signature-hero',
      'data-test-hero-has-identity': props.identity !== undefined ? 'true' : 'false',
      'data-test-hero-site-url': (props.siteUrl as string | undefined) ?? '',
      'data-test-hero-background-image': (props.backgroundImage as string | undefined) ?? '',
      'data-test-hero-has-entry-stack-state': props.entryStackState ? 'true' : 'false',
      'data-test-hero-entry-state-id': entryStackState?.entryState?.id ?? '',
    });
  },
}));

import { HbHomepageEntryStack } from '../HbHomepageEntryStack.js';
import { OCCUPANT_REGISTRY } from '../shell/occupantRegistry.js';

describe('HbHomepageEntryStack — wrapper composition contract', () => {
  it('renders wrapper root with entry-stack ownership attribute', () => {
    const { container } = render(<HbHomepageEntryStack />);
    const root = container.querySelector('[data-hb-homepage-entry-stack="root"]');
    expect(root).not.toBeNull();
    expect(root?.getAttribute('data-hb-homepage-entry-stack-owner')).toBe(
      'hb-homepage-wrapper',
    );
  });

  it('exposes wrapper-owned outer envelope authority explicitly', () => {
    const { container } = render(<HbHomepageEntryStack />);
    const root = container.querySelector('[data-hb-homepage-entry-stack="root"]');
    expect(root?.getAttribute('data-hb-homepage-outer-envelope-owner')).toBe(
      'hb-homepage-wrapper',
    );
    expect(root?.getAttribute('data-hb-homepage-outer-envelope-max-width')).toBe(
      String(HB_HOMEPAGE_OUTER_ENVELOPE_MAX_WIDTH_PX),
    );
    expect(root?.getAttribute('data-hb-homepage-outer-envelope-contract')).toBe(
      HB_HOMEPAGE_OUTER_ENVELOPE_CONTRACT_ID,
    );
    expect(root?.getAttribute('style')).toContain(
      `--hb-homepage-outer-envelope-max-width: ${HB_HOMEPAGE_OUTER_ENVELOPE_MAX_WIDTH_PX}px`,
    );
  });

  it('distinguishes hero/actions/shell inset policies by region', () => {
    const { container } = render(<HbHomepageEntryStack />);
    const heroRegion = container.querySelector('[data-hb-homepage-entry-stack-region="hero"]');
    const actionsRegion = container.querySelector(
      '[data-hb-homepage-entry-stack-region="priority-actions"]',
    );
    const shellRegion = container.querySelector(
      '[data-hb-homepage-entry-stack-region="shell"]',
    );

    expect(heroRegion?.getAttribute('data-hb-homepage-region-inset-policy')).toBe(
      'hero-surface-owned',
    );
    expect(heroRegion?.getAttribute('data-hb-homepage-region-contained-by')).toBe(
      HB_HOMEPAGE_OUTER_ENVELOPE_CONTRACT_ID,
    );
    expect(actionsRegion?.getAttribute('data-hb-homepage-region-inset-policy')).toBe(
      'actions-strip-inner-inset',
    );
    expect(actionsRegion?.getAttribute('data-hb-homepage-region-contained-by')).toBe(
      HB_HOMEPAGE_OUTER_ENVELOPE_CONTRACT_ID,
    );
    expect(shellRegion?.getAttribute('data-hb-homepage-region-inset-policy')).toBe(
      'shell-body-inner-inset',
    );
    expect(shellRegion?.getAttribute('data-hb-homepage-region-contained-by')).toBe(
      HB_HOMEPAGE_OUTER_ENVELOPE_CONTRACT_ID,
    );
  });

  it('renders hero, actions, then shell regions in DOM order', () => {
    const { container } = render(<HbHomepageEntryStack />);
    const regions = Array.from(
      container.querySelectorAll('[data-hb-homepage-entry-stack-region]'),
    );
    expect(regions.length).toBe(3);
    expect(regions[0].getAttribute('data-hb-homepage-entry-stack-region')).toBe(
      'hero',
    );
    expect(regions[0].getAttribute('data-hb-homepage-entry-stack-order')).toBe('1');
    expect(regions[1].getAttribute('data-hb-homepage-entry-stack-region')).toBe(
      'priority-actions',
    );
    expect(regions[1].getAttribute('data-hb-homepage-entry-stack-order')).toBe('2');
    expect(regions[2].getAttribute('data-hb-homepage-entry-stack-region')).toBe('shell');
    expect(regions[2].getAttribute('data-hb-homepage-entry-stack-order')).toBe('3');
  });

  it('renders HbSignatureHero inside the wrapper-owned hero region', () => {
    const { container } = render(<HbHomepageEntryStack siteUrl="https://example" />);
    const heroRegion = container.querySelector('[data-hb-homepage-entry-stack-region="hero"]');
    const heroNode = heroRegion?.querySelector('[data-test-mock="hb-signature-hero"]');
    expect(heroNode).not.toBeNull();
    expect(heroNode?.getAttribute('data-test-hero-has-identity')).toBe('true');
    expect(heroNode?.getAttribute('data-test-hero-site-url')).toBe('https://example');
    expect(heroNode?.getAttribute('data-test-hero-has-entry-stack-state')).toBe('true');
    expect(heroNode?.getAttribute('data-test-hero-entry-state-id')).toBe('standard-laptop');
  });

  it('marks hero region shared-entry-state diagnostics on wrapper runtime', () => {
    const { container } = render(<HbHomepageEntryStack />);
    const heroRegion = container.querySelector('[data-hb-homepage-entry-stack-region="hero"]');
    expect(heroRegion?.getAttribute('data-hb-homepage-entry-stack-hero-authority')).toBe(
      'shared-entry-state',
    );
    expect(heroRegion?.getAttribute('data-hb-homepage-entry-stack-hero-state')).toBe(
      'standard-laptop',
    );
    expect(heroRegion?.getAttribute('data-hb-homepage-entry-stack-hero-state-reason')).toBe(
      'width-match',
    );
  });

  it('threads wrapper-owned hero background image from hbHomepageWrapper.hero', () => {
    const { container } = render(
      <HbHomepageEntryStack
        config={{
          hbHomepageWrapper: {
            hero: { backgroundImageUrl: 'https://example.com/wrapper-hero.jpg' },
          },
        }}
      />,
    );
    const heroNode = container.querySelector('[data-test-mock="hb-signature-hero"]');
    expect(heroNode?.getAttribute('data-test-hero-background-image')).toBe(
      'https://example.com/wrapper-hero.jpg',
    );
  });

  it('supports legacy homepage backgroundImageUrl migration through wrapper extraction', () => {
    const { container } = render(
      <HbHomepageEntryStack
        config={{
          backgroundImageUrl: 'https://example.com/legacy-hero.jpg',
        }}
      />,
    );
    const heroNode = container.querySelector('[data-test-mock="hb-signature-hero"]');
    expect(heroNode?.getAttribute('data-test-hero-background-image')).toBe(
      'https://example.com/legacy-hero.jpg',
    );
  });

  it('embeds the launcher band as a React surface inside the actions region', () => {
    const { container } = render(<HbHomepageEntryStack />);
    const actionsRegion = container.querySelector(
      '[data-hb-homepage-entry-stack-region="priority-actions"]',
    );
    const launcherNode = actionsRegion?.querySelector(
      '[data-test-mock="hb-homepage-launcher-band"]',
    );
    expect(launcherNode).not.toBeNull();
    expect(launcherNode?.getAttribute('data-test-launcher-has-entry-container-prop')).toBe(
      'true',
    );
  });

  it('threads wrapper-owned bandKey + audience to the embedded launcher band', () => {
    const { container } = render(
      <HbHomepageEntryStack
        config={{
          activeAudience: 'field',
          hbHomepageWrapper: { rail: { bandKey: 'homepage-primary' } },
        }}
      />,
    );
    const launcherNode = container.querySelector(
      '[data-test-mock="hb-homepage-launcher-band"]',
    );
    expect(launcherNode?.getAttribute('data-test-launcher-band-key')).toBe('homepage-primary');
    expect(launcherNode?.getAttribute('data-test-launcher-audience')).toBe('field');
    expect(launcherNode?.getAttribute('data-test-launcher-alignment-mode')).toBe(
      'shared-entry-governed',
    );
  });

  it('declares the new homepage-launcher surface on the actions region', () => {
    const { container } = render(<HbHomepageEntryStack />);
    const actionsRegion = container.querySelector(
      '[data-hb-homepage-entry-stack-region="priority-actions"]',
    );
    expect(actionsRegion?.getAttribute('data-hb-homepage-entry-stack-rail-surface')).toBe(
      'homepage-launcher',
    );
  });

  it('omits the actions region when wrapper config disables the rail', () => {
    const { container } = render(
      <HbHomepageEntryStack
        config={{ hbHomepageWrapper: { rail: { enabled: false } } }}
      />,
    );
    expect(
      container.querySelector('[data-hb-homepage-entry-stack-region="priority-actions"]'),
    ).toBeNull();
    expect(
      container.querySelector('[data-hb-homepage-entry-stack-region="shell"]'),
    ).not.toBeNull();
  });

  it('promotes the shell region to order="2" when the rail is disabled', () => {
    const { container } = render(
      <HbHomepageEntryStack
        config={{ hbHomepageWrapper: { rail: { enabled: false } } }}
      />,
    );
    const shellRegion = container.querySelector(
      '[data-hb-homepage-entry-stack-region="shell"]',
    );
    expect(shellRegion?.getAttribute('data-hb-homepage-entry-stack-order')).toBe('2');
  });

  it('reports rail-enabled composition state on the entry-stack root', () => {
    const enabled = render(<HbHomepageEntryStack />).container.querySelector(
      '[data-hb-homepage-entry-stack="root"]',
    );
    expect(enabled?.getAttribute('data-hb-homepage-entry-stack-rail-enabled')).toBe('true');

    const disabled = render(
      <HbHomepageEntryStack
        config={{ hbHomepageWrapper: { rail: { enabled: false } } }}
      />,
    ).container.querySelector('[data-hb-homepage-entry-stack="root"]');
    expect(disabled?.getAttribute('data-hb-homepage-entry-stack-rail-enabled')).toBeNull();
  });

  it('omits the hero region when wrapper config disables hero', () => {
    const { container } = render(
      <HbHomepageEntryStack
        config={{ hbHomepageWrapper: { hero: { enabled: false } } }}
      />,
    );
    expect(container.querySelector('[data-hb-homepage-entry-stack-region="hero"]')).toBeNull();
    const root = container.querySelector('[data-hb-homepage-entry-stack="root"]');
    expect(root?.getAttribute('data-hb-homepage-entry-stack-hero-enabled')).toBeNull();
  });

  it('promotes actions and shell order when hero is disabled', () => {
    const { container } = render(
      <HbHomepageEntryStack
        config={{ hbHomepageWrapper: { hero: { enabled: false } } }}
      />,
    );
    const actionsRegion = container.querySelector(
      '[data-hb-homepage-entry-stack-region="priority-actions"]',
    );
    const shellRegion = container.querySelector(
      '[data-hb-homepage-entry-stack-region="shell"]',
    );
    expect(actionsRegion?.getAttribute('data-hb-homepage-entry-stack-order')).toBe('1');
    expect(shellRegion?.getAttribute('data-hb-homepage-entry-stack-order')).toBe('2');
  });

  it('does not thread any featuredActionKeys prop to the launcher band (no featured slot)', () => {
    const { container } = render(
      <HbHomepageEntryStack
        config={{
          hbHomepageWrapper: {
            rail: {
              // legacy config shape — must be ignored by the launcher band.
              featuredActionKeys: ['submit-timesheet', 'approve-po'],
            } as unknown as Record<string, unknown>,
          },
        }}
      />,
    );
    const launcherNode = container.querySelector(
      '[data-test-mock="hb-homepage-launcher-band"]',
    );
    expect(launcherNode?.getAttribute('data-test-launcher-has-featured-keys-prop')).toBe('false');
  });

  it('renders hero, actions, and shell with no interleaved siblings', () => {
    const { container } = render(<HbHomepageEntryStack />);
    const root = container.querySelector('[data-hb-homepage-entry-stack="root"]');
    const children = Array.from(root?.children ?? []);
    expect(children.length).toBe(3);
    expect(children[0].getAttribute('data-hb-homepage-entry-stack-region')).toBe(
      'hero',
    );
    expect(children[1].getAttribute('data-hb-homepage-entry-stack-region')).toBe(
      'priority-actions',
    );
    expect(children[2].getAttribute('data-hb-homepage-entry-stack-region')).toBe('shell');
  });

  it('forwards HbHomepageProps to the shell untouched', () => {
    const { container } = render(<HbHomepageEntryStack siteUrl="https://example" />);
    const shellNode = container.querySelector('[data-test-mock="hb-homepage-shell"]');
    expect(shellNode).not.toBeNull();
  });
});

describe('shell boundary integrity — no occupant migration', () => {
  it('does not register a priority-actions-rail occupant in the shell', () => {
    const ids = Array.from(OCCUPANT_REGISTRY.keys());
    expect(ids).not.toContain('priority-actions-rail');
    expect(ids).not.toContain('priorityActionsRail');
    for (const id of ids) {
      expect(id.toLowerCase()).not.toContain('priority-actions');
    }
  });
});
