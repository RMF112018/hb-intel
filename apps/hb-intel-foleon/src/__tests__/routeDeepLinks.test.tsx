import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { FoleonApp, readNavFromLocation } from '../FoleonApp.js';
import { createFoleonOriginPolicy } from '../services/FoleonOriginPolicy.js';
import type { IFoleonRuntimeContract } from '../runtime/foleonRuntimeContract.js';
import { FOLEON_PACKAGE_VERSION, FOLEON_WEBPART_ID } from '../webparts/foleon/runtimeContract.js';

function baseContract(
  overrides: Partial<IFoleonRuntimeContract> = {},
): IFoleonRuntimeContract {
  return {
    hostMode: 'mock',
    route: 'highlights',
    docId: null,
    siteUrl: null,
    listIds: { contentRegistry: null, placements: null, events: null },
    originPolicy: createFoleonOriginPolicy(),
    governed: {
      expectedManifestId: FOLEON_WEBPART_ID,
      expectedPackageVersion: FOLEON_PACKAGE_VERSION,
      manifestIdMatchesExpected: true,
      packageVersionMatchesExpected: true,
    },
    readerRoutePath: null,
    telemetry: { correlationId: 'corr-test', sessionId: 'sess-test' },
    canInitialize: true,
    issues: [],
    blockingReasons: [],
    ...overrides,
  };
}

function withLocation(search: string, callback: () => void): void {
  const original = window.location.search;
  // jsdom supports this URL replacement pattern.
  window.history.replaceState({}, '', `/?${search.replace(/^\?/, '')}`);
  try {
    callback();
  } finally {
    window.history.replaceState({}, '', `/${original}`);
  }
}

afterEach(() => cleanup());

describe('readNavFromLocation', () => {
  it('reads foleonRoute=reader with a numeric docId', () => {
    withLocation('foleonRoute=reader&docId=1234', () => {
      const nav = readNavFromLocation(baseContract());
      expect(nav.route).toBe('reader');
      expect(nav.docId).toBe(1234);
    });
  });

  it('reads foleonRoute=hub and ignores docId for hub', () => {
    withLocation('foleonRoute=hub&docId=999', () => {
      const nav = readNavFromLocation(baseContract());
      expect(nav.route).toBe('hub');
      expect(nav.docId).toBe(null);
    });
  });

  it('reads foleonRoute=highlights', () => {
    withLocation('foleonRoute=highlights', () => {
      const nav = readNavFromLocation(baseContract());
      expect(nav.route).toBe('highlights');
      expect(nav.docId).toBe(null);
    });
  });

  it('falls back to contract.route when foleonRoute is unknown', () => {
    withLocation('foleonRoute=garbage', () => {
      const nav = readNavFromLocation(baseContract({ route: 'hub' }));
      expect(nav.route).toBe('hub');
    });
  });

  it('falls back to contract.docId when docId is non-numeric on reader route', () => {
    withLocation('foleonRoute=reader&docId=abc', () => {
      const nav = readNavFromLocation(baseContract({ docId: 77 }));
      expect(nav.route).toBe('reader');
      expect(nav.docId).toBe(77);
    });
  });

  it('defaults to contract values when no search params are present', () => {
    withLocation('', () => {
      const nav = readNavFromLocation(baseContract({ route: 'hub', docId: 5 }));
      expect(nav.route).toBe('hub');
      // hub never carries a docId in the nav state
      expect(nav.docId).toBe(null);
    });
  });
});

describe('FoleonApp — route-level no-iframe invariants (DOM proof)', () => {
  // Avoid unhandled fetches in JSDOM by forcing mock host mode (which
  // short-circuits content fetch in page effects, keeping pages in
  // loading/error states). The iframe invariant must hold regardless.
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockRejectedValue(new Error('fetch disabled in route invariant test'));
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('Highlights route renders zero iframes (mock host mode)', () => {
    withLocation('foleonRoute=highlights', () => {
      const { container } = render(<FoleonApp contract={baseContract()} />);
      expect(container.querySelectorAll('iframe')).toHaveLength(0);
      expect(container.querySelector('main[aria-label="Foleon"]')).not.toBeNull();
      expect(container.querySelector('[data-hbc-foleon-route]')?.getAttribute(
        'data-hbc-foleon-route',
      )).toBe('highlights');
    });
  });

  it('Content Hub route renders zero iframes (mock host mode)', () => {
    withLocation('foleonRoute=hub', () => {
      const { container } = render(<FoleonApp contract={baseContract({ route: 'hub' })} />);
      expect(container.querySelectorAll('iframe')).toHaveLength(0);
    });
  });

  it('config-error surface renders zero iframes and exposes a main landmark', () => {
    const { container } = render(
      <FoleonApp
        contract={baseContract({
          canInitialize: false,
          issues: [
            { code: 'missing-content-registry-list-id', scope: 'admin', adminLabel: 'x' },
          ],
        })}
      />,
    );
    expect(container.querySelectorAll('iframe')).toHaveLength(0);
    const main = container.querySelector('main[aria-label="Foleon"]');
    expect(main).not.toBeNull();
    expect(main?.getAttribute('data-hbc-foleon-route')).toBe('config-error');
  });
});

describe('FoleonApp — a11y scaffolding', () => {
  it('renders a skip-link, aria-live route announcer, and main landmark', () => {
    withLocation('foleonRoute=highlights', () => {
      const { container } = render(<FoleonApp contract={baseContract()} />);
      const skip = container.querySelector('a[href="#foleon-main"]');
      expect(skip?.textContent).toBe('Skip to main content');
      const announcer = container.querySelector('[role="status"][aria-live="polite"]');
      expect(announcer?.textContent).toContain('Showing Foleon highlights');
      const main = container.querySelector('main#foleon-main[aria-label="Foleon"]');
      expect(main).not.toBeNull();
      expect(main?.getAttribute('tabindex')).toBe('-1');
    });
  });
});
