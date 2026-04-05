import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReferenceHomepageComposition } from '../ReferenceHomepageComposition.js';

/**
 * Composition preview acceptance tests.
 *
 * Verifies that the governed composition reference renders the 5-zone
 * homepage structure without errors and produces the expected zone
 * landmarks and composition data attribute.
 */

describe('ReferenceHomepageComposition', () => {
  it('renders without errors', () => {
    const { container } = render(<ReferenceHomepageComposition />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders with composition-reference data attribute', () => {
    const { container } = render(<ReferenceHomepageComposition />);
    const root = container.querySelector('[data-hbc-homepage="composition-reference"]');
    expect(root).not.toBeNull();
  });

  it('renders all 5 zone section shells', () => {
    render(<ReferenceHomepageComposition />);
    // The 5 zones map to section shells with these titles (some may appear multiple times)
    expect(screen.getAllByText('Homepage Top Band').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Quick-use / Work Zone').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Communications').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Operational Awareness').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Discovery').length).toBeGreaterThan(0);
  });

  it('renders webparts from each zone', () => {
    render(<ReferenceHomepageComposition />);
    // Top Band: greeting should appear
    expect(screen.getAllByText(/Good/).length).toBeGreaterThan(0);
    // Utility: priority actions heading
    expect(screen.getAllByText('Priority Actions').length).toBeGreaterThan(0);
    // Communications: company pulse heading
    expect(screen.getAllByText('Company Pulse').length).toBeGreaterThan(0);
    // Operational: project spotlight heading
    expect(screen.getAllByText('Project and Portfolio Spotlight').length).toBeGreaterThan(0);
    // Discovery: smart search heading
    expect(screen.getAllByText('Smart Search and Wayfinding').length).toBeGreaterThan(0);
  });

  it('does not import scaffold-era normalizeHomepageConfig', async () => {
    const { readFileSync } = await import('fs');
    const { resolve } = await import('path');
    const source = readFileSync(
      resolve(__dirname, '../ReferenceHomepageComposition.tsx'),
      'utf8',
    );
    expect(source).not.toContain('normalizeHomepageConfig');
  });
});
