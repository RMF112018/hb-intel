import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { StatusBanner } from './StatusBanner.js';

afterEach(cleanup);

describe('StatusBanner', () => {
  it('defaults to info tone with role=status and polite aria-live', () => {
    render(<StatusBanner>Saving the draft…</StatusBanner>);
    const el = screen.getByRole('status');
    expect(el.getAttribute('aria-live')).toBe('polite');
    expect(el.className).toMatch(/info/);
  });

  it('success tone keeps role=status polite but applies success styling', () => {
    render(<StatusBanner tone="success">Published.</StatusBanner>);
    const el = screen.getByRole('status');
    expect(el.getAttribute('aria-live')).toBe('polite');
    expect(el.className).toMatch(/success/);
  });

  it('error tone promotes to role=alert with assertive aria-live', () => {
    render(<StatusBanner tone="error">Save didn't complete.</StatusBanner>);
    const el = screen.getByRole('alert');
    expect(el.getAttribute('aria-live')).toBe('assertive');
    expect(el.className).toMatch(/error/);
  });

  it('busy flag flips aria-busy', () => {
    render(<StatusBanner busy>Working…</StatusBanner>);
    expect(screen.getByRole('status').getAttribute('aria-busy')).toBe('true');
  });

  it('forwards refs and additional props to the wrapper', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <StatusBanner ref={ref} data-testid="banner">
        Hi
      </StatusBanner>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(screen.getByTestId('banner')).toBeTruthy();
  });
});
