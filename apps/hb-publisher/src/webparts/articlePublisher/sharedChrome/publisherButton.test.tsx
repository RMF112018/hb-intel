import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { PublisherButton } from './PublisherButton.js';

afterEach(cleanup);

describe('PublisherButton', () => {
  it('renders children and defaults to a secondary button', () => {
    render(<PublisherButton>Save</PublisherButton>);
    const btn = screen.getByRole('button', { name: 'Save' });
    expect(btn.className).toMatch(/base/);
    expect(btn.className).toMatch(/secondary/);
    expect(btn.getAttribute('type')).toBe('button');
  });

  it('applies the primary variant class', () => {
    render(<PublisherButton variant="primary">Publish</PublisherButton>);
    expect(screen.getByRole('button').className).toMatch(/primary/);
  });

  it('applies the danger variant class', () => {
    render(<PublisherButton variant="danger">Remove</PublisherButton>);
    expect(screen.getByRole('button').className).toMatch(/danger/);
  });

  it('supports an iconOnly round button', () => {
    render(
      <PublisherButton iconOnly aria-label="Feature">
        ★
      </PublisherButton>,
    );
    const btn = screen.getByRole('button', { name: 'Feature' });
    expect(btn.className).toMatch(/iconOnly/);
  });

  it('maps pressed to aria-pressed', () => {
    render(
      <PublisherButton pressed aria-label="Feature">
        ★
      </PublisherButton>,
    );
    expect(screen.getByRole('button').getAttribute('aria-pressed')).toBe('true');
  });

  it('fires onClick and can be disabled', () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <PublisherButton onClick={onClick}>Click</PublisherButton>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
    rerender(
      <PublisherButton onClick={onClick} disabled>
        Click
      </PublisherButton>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('forwards refs to the underlying button element', () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(<PublisherButton ref={ref}>Hello</PublisherButton>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('allows the caller to override type (e.g. submit)', () => {
    render(<PublisherButton type="submit">Send</PublisherButton>);
    expect(screen.getByRole('button').getAttribute('type')).toBe('submit');
  });
});
