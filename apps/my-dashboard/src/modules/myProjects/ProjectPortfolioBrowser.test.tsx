import { useRef, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { MY_PROJECT_LINKS_MORE_THAN_SIX_ITEMS } from '@hbc/models/myWork/fixtures';
import { MyWorkBentoGrid } from '../../layout/MyWorkBentoGrid.js';
import type { MyWorkResponsiveMode } from '../../layout/useMyWorkContainerBreakpoint.js';
import { ProjectPortfolioBrowser } from './ProjectPortfolioBrowser.js';

afterEach(() => {
  cleanup();
});

function BrowserHarness({
  mode = 'desktop',
  initialOpen = false,
  onOpen,
}: {
  readonly mode?: MyWorkResponsiveMode;
  readonly initialOpen?: boolean;
  readonly onOpen?: (open: boolean) => void;
}) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  return (
    <MyWorkBentoGrid mode={mode}>
      <button
        ref={triggerRef}
        type="button"
        data-test-trigger=""
        onClick={() => setIsOpen(true)}
      >
        View all projects
      </button>
      <ProjectPortfolioBrowser
        items={MY_PROJECT_LINKS_MORE_THAN_SIX_ITEMS.data.items}
        mode={mode}
        isOpen={isOpen}
        onOpenChange={(next) => {
          setIsOpen(next);
          onOpen?.(next);
        }}
      />
    </MyWorkBentoGrid>
  );
}

function getBrowser(): HTMLElement | null {
  return document.body.querySelector('[data-my-projects-portfolio-browser]');
}

function getSearchInput(): HTMLInputElement {
  return document.body.querySelector(
    '[data-my-projects-portfolio-search]',
  ) as HTMLInputElement;
}

describe('ProjectPortfolioBrowser — mount lifecycle', () => {
  it('does not render the dialog when closed', () => {
    render(<BrowserHarness />);
    expect(getBrowser()).toBeNull();
  });

  it('renders the dialog when open with title, search, and close control', () => {
    render(<BrowserHarness initialOpen />);
    const browser = getBrowser()!;
    expect(browser).not.toBeNull();
    expect(browser.getAttribute('role')).toBe('dialog');
    expect(browser.getAttribute('aria-modal')).toBe('true');

    const titleId = browser.getAttribute('aria-labelledby');
    const title = browser.querySelector(`[id="${titleId}"]`);
    expect(title?.textContent).toBe('All My Projects');

    const search = getSearchInput();
    expect(search).not.toBeNull();
    expect(search.getAttribute('placeholder')).toBe('Search by project name or number');

    const close = browser.querySelector('[data-my-projects-browser-close]') as HTMLButtonElement;
    expect(close.getAttribute('aria-label')).toBe('Close All My Projects');
  });

  it('surfaces the search input as the first focusable element inside the dialog', () => {
    render(<BrowserHarness initialOpen />);
    const browser = getBrowser();
    expect(browser).not.toBeNull();
    // Tab-order contract: the search input is the first focusable element
    // inside the dialog (header DOM order: title, search input, close button,
    // tile launch triggers below). jsdom + Floating UI applies modal initial
    // focus via RAF, which is not deterministically flushed by fireEvent in
    // jsdom — assert tabbability rather than activeElement equality here.
    // The Escape / close-button tests verify focus *return* to the trigger.
    const firstFocusable = browser!.querySelector(
      'input, button, a, [tabindex]:not([tabindex="-1"])',
    );
    expect(firstFocusable).toBe(getSearchInput());
  });
});

describe('ProjectPortfolioBrowser — list and search', () => {
  it('renders all 7 fixture items sorted by display order with empty query', () => {
    render(<BrowserHarness initialOpen />);
    const tiles = document.body.querySelectorAll(
      '[data-my-projects-portfolio-browser] [data-my-projects-tile]',
    );
    expect(tiles).toHaveLength(MY_PROJECT_LINKS_MORE_THAN_SIX_ITEMS.data.items.length);
    const names = Array.from(tiles).map(
      (tile) => tile.querySelector('[data-my-projects-project-name]')?.textContent,
    );
    expect(names).toEqual([
      'Civic Center Expansion',
      'Harbor Office Renovation',
      'Legacy Warehouse Program',
      'Medical Office Fitout',
      'North Campus Demo',
      'Regional Office Buildout',
      'South Tower TI',
    ]);
  });

  it('filters by project name (case-insensitive)', () => {
    render(<BrowserHarness initialOpen />);
    fireEvent.change(getSearchInput(), { target: { value: 'Harbor' } });
    const tiles = document.body.querySelectorAll(
      '[data-my-projects-portfolio-browser] [data-my-projects-tile]',
    );
    expect(tiles).toHaveLength(1);
    expect(
      tiles[0]!.querySelector('[data-my-projects-project-name]')?.textContent,
    ).toBe('Harbor Office Renovation');
  });

  it('filters by exact project number', () => {
    render(<BrowserHarness initialOpen />);
    fireEvent.change(getSearchInput(), { target: { value: '24-100-03' } });
    const tiles = document.body.querySelectorAll(
      '[data-my-projects-portfolio-browser] [data-my-projects-tile]',
    );
    expect(tiles).toHaveLength(1);
    expect(
      tiles[0]!.querySelector('[data-my-projects-project-number]')?.textContent,
    ).toBe('24-100-03');
  });

  it('filters by partial project-number prefix', () => {
    render(<BrowserHarness initialOpen />);
    fireEvent.change(getSearchInput(), { target: { value: '24-100' } });
    const tiles = document.body.querySelectorAll(
      '[data-my-projects-portfolio-browser] [data-my-projects-tile]',
    );
    // All ITEM_MORE_* and ITEM_PROJECTS_ONLY_READY / ITEM_MERGED_SP_ONLY share
    // the 24-100 prefix (6 items); ITEM_LEGACY_ONLY_PROCORE uses 23-777-14.
    expect(tiles.length).toBe(6);
  });

  it('renders the locked no-results copy when no item matches', () => {
    render(<BrowserHarness initialOpen />);
    fireEvent.change(getSearchInput(), { target: { value: 'nonexistent' } });
    expect(
      document.body.querySelectorAll(
        '[data-my-projects-portfolio-browser] [data-my-projects-tile]',
      ),
    ).toHaveLength(0);
    const empty = document.body.querySelector(
      '[data-my-projects-search-empty]',
    ) as HTMLElement;
    expect(empty).not.toBeNull();
    expect(empty.textContent).toBe('No projects match your search.');
  });
});

describe('ProjectPortfolioBrowser — close and focus', () => {
  it('closes on Escape and returns focus to the originating trigger', () => {
    const { container } = render(<BrowserHarness />);
    const trigger = container.querySelector('[data-test-trigger]') as HTMLButtonElement;
    trigger.focus();
    fireEvent.click(trigger);
    expect(getBrowser()).not.toBeNull();

    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' });
    expect(getBrowser()).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('invokes onOpenChange(false) when the close button is clicked', () => {
    const onOpen = vi.fn();
    render(<BrowserHarness initialOpen onOpen={onOpen} />);
    const close = document.body.querySelector(
      '[data-my-projects-browser-close]',
    ) as HTMLButtonElement;
    fireEvent.click(close);
    expect(onOpen).toHaveBeenLastCalledWith(false);
    expect(getBrowser()).toBeNull();
  });

  it('clears the search query when reopened', () => {
    const { container } = render(<BrowserHarness />);
    const trigger = container.querySelector('[data-test-trigger]') as HTMLButtonElement;

    fireEvent.click(trigger);
    fireEvent.change(getSearchInput(), { target: { value: 'harbor' } });
    expect(getSearchInput().value).toBe('harbor');

    const close = document.body.querySelector(
      '[data-my-projects-browser-close]',
    ) as HTMLButtonElement;
    fireEvent.click(close);
    expect(getBrowser()).toBeNull();

    fireEvent.click(trigger);
    expect(getSearchInput().value).toBe('');
  });
});

describe('ProjectPortfolioBrowser — posture by mode', () => {
  it.each<MyWorkResponsiveMode>(['phone', 'tabletPortrait'])(
    'renders sheet posture on %s',
    (mode) => {
      render(<BrowserHarness mode={mode} initialOpen />);
      expect(getBrowser()!.getAttribute('data-my-projects-browser-posture')).toBe('sheet');
    },
  );

  it.each<MyWorkResponsiveMode>([
    'tabletLandscape',
    'smallLaptop',
    'standardLaptop',
    'largeLaptop',
    'desktop',
    'ultrawide',
  ])('renders drawer posture on %s', (mode) => {
    render(<BrowserHarness mode={mode} initialOpen />);
    expect(getBrowser()!.getAttribute('data-my-projects-browser-posture')).toBe('drawer');
  });
});

describe('ProjectPortfolioBrowser — in-browser launch drawer concurrency (phone)', () => {
  it('opens only one tile launch drawer at a time within the browser context', () => {
    // Inline mode (tablet+desktop) renders all four destinations directly on
    // each tile — no trigger, no concurrency surface. The launch drawer
    // appears only in phone mode, so the concurrency contract is enforced
    // there.
    render(<BrowserHarness mode="phone" initialOpen />);
    const triggers = Array.from(
      document.body.querySelectorAll<HTMLButtonElement>(
        '[data-my-projects-portfolio-browser] [data-my-projects-launch-trigger]',
      ),
    );
    expect(triggers.length).toBeGreaterThanOrEqual(2);

    fireEvent.click(triggers[0]!);
    expect(document.body.querySelectorAll('[data-my-projects-launch-drawer]').length).toBe(1);

    fireEvent.click(triggers[1]!);
    expect(document.body.querySelectorAll('[data-my-projects-launch-drawer]').length).toBe(1);
  });
});
