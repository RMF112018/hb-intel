import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createComplexityWrapper } from '@hbc/complexity/testing';
import { HbcFormField } from '../index.js';

describe('HbcFormField', () => {
  it('renders with data-hbc-ui="HbcFormField" and data-field-name', () => {
    const { container } = render(
      <HbcFormField name="notes" label="Notes" />,
      { wrapper: createComplexityWrapper('essential') },
    );
    const el = container.querySelector('[data-hbc-ui="HbcFormField"]');
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute('data-field-name', 'notes');
  });

  it('renders label text', () => {
    render(
      <HbcFormField name="notes" label="Internal Notes" />,
      { wrapper: createComplexityWrapper('essential') },
    );
    expect(screen.getByText('Internal Notes')).toBeInTheDocument();
  });

  it('label has htmlFor matching hbc-field-{name}', () => {
    const { container } = render(
      <HbcFormField name="remarks" label="Remarks" />,
      { wrapper: createComplexityWrapper('essential') },
    );
    const label = container.querySelector('label');
    expect(label).toHaveAttribute('for', 'hbc-field-remarks');
  });

  it('always renders at essential tier when complexitySensitive=false (default)', () => {
    const { container } = render(
      <HbcFormField name="notes" label="Notes" />,
      { wrapper: createComplexityWrapper('essential') },
    );
    expect(
      container.querySelector('[data-hbc-ui="HbcFormField"]'),
    ).toBeInTheDocument();
  });

  it('returns null at essential tier when complexitySensitive=true (standard-gated)', () => {
    const { container } = render(
      <HbcFormField name="notes" label="Notes" complexitySensitive />,
      { wrapper: createComplexityWrapper('essential') },
    );
    expect(
      container.querySelector('[data-hbc-ui="HbcFormField"]'),
    ).not.toBeInTheDocument();
  });

  it('renders at standard tier when complexitySensitive=true', () => {
    const { container } = render(
      <HbcFormField name="notes" label="Notes" complexitySensitive />,
      { wrapper: createComplexityWrapper('standard') },
    );
    expect(
      container.querySelector('[data-hbc-ui="HbcFormField"]'),
    ).toBeInTheDocument();
  });
});
