import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HbcFormRow } from '../HbcFormRow.js';

describe('HbcFormRow', () => {
  it('renders with data-hbc-ui="form-row"', () => {
    render(
      <HbcFormRow>
        <span>field</span>
      </HbcFormRow>,
    );
    expect(screen.getByText('field').closest('[data-hbc-ui="form-row"]')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(
      <HbcFormRow>
        <span>first</span>
        <span>second</span>
      </HbcFormRow>,
    );
    expect(screen.getByText('first')).toBeInTheDocument();
    expect(screen.getByText('second')).toBeInTheDocument();
  });

  it('applies gap as inline style', () => {
    const { container } = render(
      <HbcFormRow gap="24px">
        <span>field</span>
      </HbcFormRow>,
    );
    const row = container.querySelector('[data-hbc-ui="form-row"]') as HTMLElement;
    expect(row.style.gap).toBe('24px');
  });

  it('wraps valid elements in flex containers', () => {
    const { container } = render(
      <HbcFormRow>
        <input data-testid="input-a" />
        <input data-testid="input-b" />
      </HbcFormRow>,
    );
    const row = container.querySelector('[data-hbc-ui="form-row"]')!;
    // Each valid element child should be wrapped in a div
    const wrappers = row.querySelectorAll(':scope > div');
    expect(wrappers.length).toBe(2);
    expect(wrappers[0].querySelector('[data-testid="input-a"]')).toBeInTheDocument();
    expect(wrappers[1].querySelector('[data-testid="input-b"]')).toBeInTheDocument();
  });

  it('merges className', () => {
    const { container } = render(
      <HbcFormRow className="custom-row">
        <span>field</span>
      </HbcFormRow>,
    );
    const row = container.querySelector('[data-hbc-ui="form-row"]') as HTMLElement;
    expect(row.className).toContain('custom-row');
  });
});
