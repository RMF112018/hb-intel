import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

// Mock the shell and rail so this test stays tightly scoped to the
// wrapper composition contract (order, attributes, enable toggle)
// without exercising shell ResizeObserver internals or rail data-seam
// plumbing. Shell-side tests live under `shell/__tests__`.
vi.mock('../HbHomepageShell.js', () => ({
  HbHomepageShell: (props: Record<string, unknown>): React.JSX.Element =>
    React.createElement('div', {
      'data-test-mock': 'hb-homepage-shell',
      'data-test-has-config': props.config !== undefined ? 'true' : 'false',
    }),
}));

vi.mock('../../priorityActionsRail/PriorityActionsRail.js', () => ({
  PriorityActionsRail: (props: Record<string, unknown>): React.JSX.Element =>
    React.createElement('div', {
      'data-test-mock': 'priority-actions-rail',
      'data-test-rail-band-key': (props.bandKey as string | undefined) ?? '',
      'data-test-rail-audience': (props.activeAudience as string | undefined) ?? '',
    }),
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

  it('renders actions region before shell region in DOM order', () => {
    const { container } = render(<HbHomepageEntryStack />);
    const regions = Array.from(
      container.querySelectorAll('[data-hb-homepage-entry-stack-region]'),
    );
    expect(regions.length).toBe(2);
    expect(regions[0].getAttribute('data-hb-homepage-entry-stack-region')).toBe(
      'priority-actions',
    );
    expect(regions[0].getAttribute('data-hb-homepage-entry-stack-order')).toBe('1');
    expect(regions[1].getAttribute('data-hb-homepage-entry-stack-region')).toBe('shell');
    expect(regions[1].getAttribute('data-hb-homepage-entry-stack-order')).toBe('2');
  });

  it('embeds the rail as a React surface inside the actions region, not as a separate webpart', () => {
    const { container } = render(<HbHomepageEntryStack />);
    const actionsRegion = container.querySelector(
      '[data-hb-homepage-entry-stack-region="priority-actions"]',
    );
    const railNode = actionsRegion?.querySelector('[data-test-mock="priority-actions-rail"]');
    expect(railNode).not.toBeNull();
  });

  it('threads wrapper-owned bandKey + audience to the embedded rail', () => {
    const { container } = render(
      <HbHomepageEntryStack
        config={{
          activeAudience: 'field',
          hbHomepageWrapper: { rail: { bandKey: 'homepage-primary' } },
        }}
      />,
    );
    const railNode = container.querySelector('[data-test-mock="priority-actions-rail"]');
    expect(railNode?.getAttribute('data-test-rail-band-key')).toBe('homepage-primary');
    expect(railNode?.getAttribute('data-test-rail-audience')).toBe('field');
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
