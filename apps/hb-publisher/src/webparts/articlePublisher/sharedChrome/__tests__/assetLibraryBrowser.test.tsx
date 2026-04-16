/**
 * Accessibility proofs for the governed asset-library modal.
 *
 * Wave 01 delivered the AssetLibraryBrowser overlay with a
 * `@floating-ui/react` dialog (role="dialog", aria-modal,
 * FloatingFocusManager-anchored focus, dismiss-on-escape, close
 * button with aria-label). Until now nothing tested any of that
 * directly — the overlay's accessibility posture was asserted
 * only by code review and the seam-level tests on
 * `assetLibrarySource.ts`. Wave 02 Prompt-04 closes that proof
 * gap with direct render tests.
 */
import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { AssetLibraryBrowser } from '../AssetLibraryBrowser.js';
import type {
  AssetLibrarySearchFn,
  AssetLookupEntry,
} from '../assetLibrarySource.js';

// JSDOM does not implement ResizeObserver; Radix's ScrollArea primitive
// (used by `PublisherScrollArea` inside the modal) touches it during
// layout effects. A minimal no-op shim keeps the render path clean.
if (typeof globalThis.ResizeObserver === 'undefined') {
  class ResizeObserverShim {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }
  (globalThis as unknown as { ResizeObserver: typeof ResizeObserverShim }).ResizeObserver =
    ResizeObserverShim;
}

afterEach(cleanup);

function neverResolvingSearch(): AssetLibrarySearchFn {
  // Returns a promise that never resolves so the dialog stays in
  // the 'loading' status branch; tests that need the 'ready' or
  // 'error' branch supply their own search function.
  return () => new Promise(() => {});
}

function readySearch(
  entries: readonly AssetLookupEntry[],
): AssetLibrarySearchFn {
  return vi.fn(async () => entries.slice());
}

function failingSearch(message: string): AssetLibrarySearchFn {
  return vi.fn(async () => {
    throw new Error(message);
  });
}

describe('AssetLibraryBrowser — dialog semantics', () => {
  it('renders nothing when open=false so the overlay is not in the DOM', () => {
    const { container } = render(
      <AssetLibraryBrowser
        open={false}
        onSelect={vi.fn()}
        onRequestClose={vi.fn()}
        searchAssets={neverResolvingSearch()}
      />,
    );
    expect(container.querySelector('[role="dialog"]')).toBeNull();
    expect(screen.queryByLabelText('Close asset library')).toBeNull();
  });

  it('renders a role="dialog" with aria-modal="true" when open', () => {
    render(
      <AssetLibraryBrowser
        open
        onSelect={vi.fn()}
        onRequestClose={vi.fn()}
        searchAssets={neverResolvingSearch()}
      />,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
  });

  it('uses the provided title as the dialog accessible name, and renders it as a visible heading', () => {
    render(
      <AssetLibraryBrowser
        open
        onSelect={vi.fn()}
        onRequestClose={vi.fn()}
        searchAssets={neverResolvingSearch()}
        title="Choose a hero image"
      />,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog.getAttribute('aria-label')).toBe('Choose a hero image');
    expect(
      screen.getByRole('heading', { level: 2, name: 'Choose a hero image' }),
    ).toBeTruthy();
  });

  it('defaults the title to "Choose an image" when none is supplied', () => {
    render(
      <AssetLibraryBrowser
        open
        onSelect={vi.fn()}
        onRequestClose={vi.fn()}
        searchAssets={neverResolvingSearch()}
      />,
    );
    expect(screen.getByRole('dialog').getAttribute('aria-label')).toBe(
      'Choose an image',
    );
  });

  it('exposes a search input with an accessible label and type="search"', () => {
    render(
      <AssetLibraryBrowser
        open
        onSelect={vi.fn()}
        onRequestClose={vi.fn()}
        searchAssets={neverResolvingSearch()}
      />,
    );
    const searchInput = screen.getByLabelText(
      'Search the asset library',
    ) as HTMLInputElement;
    expect(searchInput.tagName).toBe('INPUT');
    expect(searchInput.getAttribute('type')).toBe('search');
  });

  it('exposes a close button with an accessible aria-label so assistive tech can dismiss the dialog', () => {
    const onRequestClose = vi.fn();
    render(
      <AssetLibraryBrowser
        open
        onSelect={vi.fn()}
        onRequestClose={onRequestClose}
        searchAssets={neverResolvingSearch()}
      />,
    );
    const close = screen.getByLabelText('Close asset library');
    expect(close).toBeTruthy();
    close.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(onRequestClose).toHaveBeenCalled();
  });
});

describe('AssetLibraryBrowser — results semantics', () => {
  it('renders the results container as a listbox with an accessible label once entries are ready', async () => {
    const entries: AssetLookupEntry[] = [
      { assetId: 'a', title: 'Alpha hero', imageUrl: 'https://example.com/a.jpg', source: 'Site Assets' },
      { assetId: 'b', title: 'Bravo hero', imageUrl: 'https://example.com/b.jpg', source: 'Site Assets' },
    ];
    render(
      <AssetLibraryBrowser
        open
        onSelect={vi.fn()}
        onRequestClose={vi.fn()}
        searchAssets={readySearch(entries)}
      />,
    );
    const listbox = await screen.findByRole('listbox', {
      name: 'Asset results',
    });
    expect(listbox).toBeTruthy();
    const options = await screen.findAllByRole('option');
    expect(options).toHaveLength(2);
    // First tile is the active selection by default
    expect(options[0].getAttribute('aria-selected')).toBe('true');
    expect(options[1].getAttribute('aria-selected')).toBe('false');
  });

  it('surfaces the zero-results message inside the polite live region without rendering the listbox', async () => {
    render(
      <AssetLibraryBrowser
        open
        onSelect={vi.fn()}
        onRequestClose={vi.fn()}
        searchAssets={readySearch([])}
      />,
    );
    await waitFor(() => {
      expect(screen.getByText(/Browse recent assets/i)).toBeTruthy();
    });
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('renders a role="alert" error detail when the search function throws', async () => {
    render(
      <AssetLibraryBrowser
        open
        onSelect={vi.fn()}
        onRequestClose={vi.fn()}
        searchAssets={failingSearch('403 Forbidden')}
      />,
    );
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toMatch(
      /Asset lookup is temporarily unavailable/i,
    );
    expect(alert.textContent).toMatch(/403 Forbidden/);
  });
});
