import { render, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { AdobeSignCallbackBanner } from './AdobeSignCallbackBanner.js';

function setLocationSearch(search: string): void {
  // jsdom honors history.replaceState — set both search and a clean pathname.
  window.history.replaceState({}, '', `/${search}`);
}

beforeEach(() => {
  setLocationSearch('');
});

afterEach(() => {
  cleanup();
  setLocationSearch('');
});

describe('AdobeSignCallbackBanner', () => {
  it('renders nothing when no adobeSignAuthorization marker is present', () => {
    const { container } = render(<AdobeSignCallbackBanner />);
    expect(container.querySelector('[data-my-work-adobe-sign-callback]')).toBeNull();
  });

  it('renders nothing for an unrelated query parameter', () => {
    setLocationSearch('?foo=bar');
    const { container } = render(<AdobeSignCallbackBanner />);
    expect(container.querySelector('[data-my-work-adobe-sign-callback]')).toBeNull();
  });

  it('renders a role="status" banner with the success markers when adobeSignAuthorization=success', () => {
    setLocationSearch('?adobeSignAuthorization=success');
    const { container } = render(<AdobeSignCallbackBanner />);
    const banner = container.querySelector(
      '[data-my-work-adobe-sign-callback="success"]',
    ) as HTMLElement | null;
    expect(banner).not.toBeNull();
    expect(banner?.getAttribute('role')).toBe('status');
    expect(banner?.getAttribute('aria-live')).toBe('polite');
    expect(banner?.getAttribute('data-my-work-adobe-sign-callback-status')).toBe('success');
    expect(banner?.textContent).toContain('Adobe Sign is connected.');
  });

  it('renders role="alert" with the retryable headline for invalid-state', () => {
    setLocationSearch('?adobeSignAuthorization=invalid-state');
    const { container } = render(<AdobeSignCallbackBanner />);
    const banner = container.querySelector(
      '[data-my-work-adobe-sign-callback="retryable-failure"]',
    ) as HTMLElement | null;
    expect(banner).not.toBeNull();
    expect(banner?.getAttribute('role')).toBe('alert');
    expect(banner?.getAttribute('aria-live')).toBe('assertive');
    expect(banner?.getAttribute('data-my-work-adobe-sign-callback-status')).toBe('invalid-state');
  });

  it('renders role="alert" with the operator-action-required headline for configuration-required', () => {
    setLocationSearch('?adobeSignAuthorization=configuration-required');
    const { container } = render(<AdobeSignCallbackBanner />);
    const banner = container.querySelector(
      '[data-my-work-adobe-sign-callback="operator-action-required"]',
    ) as HTMLElement | null;
    expect(banner).not.toBeNull();
    expect(banner?.textContent).toContain('Adobe Sign is not fully configured.');
  });

  it('renders role="alert" with the transient-failure headline for source-unavailable', () => {
    setLocationSearch('?adobeSignAuthorization=source-unavailable');
    const { container } = render(<AdobeSignCallbackBanner />);
    const banner = container.querySelector(
      '[data-my-work-adobe-sign-callback="transient-failure"]',
    ) as HTMLElement | null;
    expect(banner).not.toBeNull();
    expect(banner?.textContent).toContain('Adobe Sign is unavailable.');
  });

  it('renders role="alert" with the unknown-kind copy for an unrecognized status', () => {
    setLocationSearch('?adobeSignAuthorization=mystery-status');
    const { container } = render(<AdobeSignCallbackBanner />);
    const banner = container.querySelector(
      '[data-my-work-adobe-sign-callback="unknown"]',
    ) as HTMLElement | null;
    expect(banner).not.toBeNull();
    expect(banner?.textContent).toMatch(/unexpected/i);
  });

  it('cleans the adobeSignAuthorization parameter from window.location after mount', () => {
    setLocationSearch('?adobeSignAuthorization=success&keep=me');
    render(<AdobeSignCallbackBanner />);
    expect(window.location.search).toBe('?keep=me');
  });

  it('never includes provider tokens or raw error words in banner copy', () => {
    const denylist = /(access[_-]?token|client[_-]?secret|refresh[_-]?token|provider|adobe\.com)/i;
    for (const status of [
      'success',
      'invalid-state',
      'expired-state',
      'consumed-state',
      'configuration-required',
      'source-unavailable',
      'invalid-grant',
      'mystery-status',
    ]) {
      setLocationSearch(`?adobeSignAuthorization=${status}`);
      const { container, unmount } = render(<AdobeSignCallbackBanner />);
      const banner = container.querySelector(
        '[data-my-work-adobe-sign-callback]',
      ) as HTMLElement | null;
      expect(banner?.textContent ?? '').not.toMatch(denylist);
      unmount();
      cleanup();
      setLocationSearch('');
    }
  });
});
