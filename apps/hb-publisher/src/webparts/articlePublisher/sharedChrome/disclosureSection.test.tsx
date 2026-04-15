import * as React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { DisclosureSection } from './DisclosureSection.js';

afterEach(cleanup);

describe('DisclosureSection', () => {
  it('renders a native <details> / <summary> element with the label', () => {
    render(
      <DisclosureSection label="Advanced things">
        <p>hidden content</p>
      </DisclosureSection>,
    );
    const details = screen.getByRole('group') as HTMLDetailsElement;
    expect(details.tagName).toBe('DETAILS');
    expect(details.open).toBe(false);
    expect(screen.getByText('Advanced things').tagName).toBe('SPAN');
  });

  it('starts open when defaultOpen is true so seeded values stay visible', () => {
    render(
      <DisclosureSection label="Advanced" defaultOpen>
        <p>seeded</p>
      </DisclosureSection>,
    );
    const details = screen.getByRole('group') as HTMLDetailsElement;
    expect(details.open).toBe(true);
    expect(screen.getByText('seeded')).toBeTruthy();
  });

  it('toggles open/closed when the summary is clicked', () => {
    render(
      <DisclosureSection label="Advanced">
        <p>hidden</p>
      </DisclosureSection>,
    );
    const details = screen.getByRole('group') as HTMLDetailsElement;
    const summary = details.querySelector('summary')!;
    expect(details.open).toBe(false);
    fireEvent.click(summary);
    expect(details.open).toBe(true);
    fireEvent.click(summary);
    expect(details.open).toBe(false);
  });

  it('renders the optional summary hint when provided', () => {
    render(
      <DisclosureSection label="Advanced" summaryHint="Rarely needed overrides.">
        <p />
      </DisclosureSection>,
    );
    expect(screen.getByText('Rarely needed overrides.')).toBeTruthy();
  });
});
