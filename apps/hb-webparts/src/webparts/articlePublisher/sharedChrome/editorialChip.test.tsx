import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { EditorialChip } from './EditorialChip.js';

afterEach(cleanup);

describe('EditorialChip', () => {
  it('renders children with the default neutral variant', () => {
    render(<EditorialChip>12 drafts</EditorialChip>);
    const chip = screen.getByText('12 drafts');
    expect(chip.className).toMatch(/base/);
    expect(chip.className).toMatch(/neutral/);
  });

  it.each(['success', 'warn', 'danger', 'info', 'featured'] as const)(
    'applies the %s variant class',
    (variant) => {
      render(<EditorialChip variant={variant}>x</EditorialChip>);
      expect(screen.getByText('x').className).toMatch(new RegExp(variant));
    },
  );

  it('renders sm sizing when requested', () => {
    render(
      <EditorialChip size="sm" variant="success">
        Ready
      </EditorialChip>,
    );
    expect(screen.getByText('Ready').className).toMatch(/sizeSm/);
  });

  it('forwards aria-label + title to the span', () => {
    render(
      <EditorialChip aria-label="3 things to do" title="Title, Subhead, Slug">
        3 TODO
      </EditorialChip>,
    );
    const chip = screen.getByLabelText('3 things to do');
    expect(chip.getAttribute('title')).toBe('Title, Subhead, Slug');
  });

  it('forwards refs to the underlying span', () => {
    const ref = { current: null as HTMLSpanElement | null };
    render(<EditorialChip ref={ref}>hi</EditorialChip>);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });
});
