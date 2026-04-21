import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NormalizedSafetyFieldExcellenceModel } from '../../../homepage/helpers/operationalAwarenessConfig.js';

vi.mock('../../../homepage/helpers/operationalAwarenessConfig.js', () => ({
  normalizeSafetyFieldExcellenceConfig: vi.fn(),
}));

import { normalizeSafetyFieldExcellenceConfig } from '../../../homepage/helpers/operationalAwarenessConfig.js';
import { SafetyFieldExcellence } from '../SafetyFieldExcellence.js';

const mockNormalize = vi.mocked(normalizeSafetyFieldExcellenceConfig);

const EMPTY_MODEL: NormalizedSafetyFieldExcellenceModel = {
  heading: 'Safety and Field Excellence',
  topLineSummary: undefined,
  featured: undefined,
  secondary: [],
  sectionCta: undefined,
};

const VALID_MODEL: NormalizedSafetyFieldExcellenceModel = {
  heading: 'Safety and Field Excellence',
  topLineSummary: {
    statusLabel: 'Safety posture: Attention',
    statusVariant: 'warning',
    summaryText: 'Two active corrective actions remain open.',
    lastUpdatedLabel: 'Updated 2h ago',
  },
  featured: {
    id: 'primary-1',
    title: 'Site 47 scaffold corrective plan in flight',
    summary: 'Scaffold correction sequence launched.',
    compactSummary: 'Scaffold sequence underway.',
    urgency: 'urgent',
    metadata: 'Owner: Field Safety Lead',
    indicator: { label: 'Action required today', variant: 'critical' },
    freshness: { source: 'live', updatedAt: '2026-04-21T10:00:00.000Z' },
    cta: { label: 'Open corrective action log', href: '/sites/hb-central/safety/corrective-actions' },
    isStale: false,
    freshnessLabel: 'Updated 2h ago',
  },
  secondary: [
    {
      id: 'secondary-1',
      title: 'Toolbox talk completion below target',
      summary: 'Five crews need signoff.',
      compactSummary: 'Five crews pending signoff.',
      urgency: 'attention',
      isStale: true,
      freshnessLabel: 'Stale signal',
      cta: { label: 'Review pending crews', href: '/sites/hb-central/safety/toolbox-talks' },
      indicator: { label: 'Due today', variant: 'warning' },
    },
  ],
  sectionCta: {
    label: 'View safety operations hub',
    href: '/sites/hb-central/safety',
  },
};

describe('SafetyFieldExcellence consumer state matrix', () => {
  beforeEach(() => {
    mockNormalize.mockReset();
  });

  it('loading state renders loading surface', () => {
    const { container } = render(<SafetyFieldExcellence isLoading />);
    expect(container.querySelector('[data-hbc-homepage="loading-state"]')).not.toBeNull();
  });

  it('runtime error state renders fetch-error messaging', () => {
    mockNormalize.mockImplementation(() => {
      throw new Error('normalize exploded');
    });

    render(
      <SafetyFieldExcellence
        config={{
          primarySpotlight: {
            id: 'x',
            title: 'x',
            summary: 'x',
          },
        }}
      />,
    );

    expect(screen.getByText('Safety and field excellence is temporarily unavailable')).toBeTruthy();
    expect(screen.getByText(/normalize exploded/)).toBeTruthy();
  });

  it('invalid state renders invalid authoring guidance', () => {
    mockNormalize.mockReturnValue(EMPTY_MODEL);

    render(
      <SafetyFieldExcellence
        config={{
          topLineSummary: {
            statusLabel: 'Safety posture',
            summaryText: 'Summary',
          },
        }}
      />,
    );

    expect(screen.getByText('Safety and field excellence configuration is invalid')).toBeTruthy();
  });

  it('empty state renders no-data guidance', () => {
    mockNormalize.mockReturnValue(EMPTY_MODEL);
    render(<SafetyFieldExcellence />);

    expect(screen.getByText('No safety and field excellence items configured')).toBeTruthy();
  });

  it('valid state maps stale notice and suppresses duplicate section CTA in standard mode', () => {
    mockNormalize.mockReturnValue(VALID_MODEL);

    render(<SafetyFieldExcellence />);

    expect(screen.getByText('Open corrective action log')).toBeTruthy();
    expect(screen.queryByText('View safety operations hub')).toBeNull();
    expect(screen.getByText('1 secondary safety signal may be stale; verify before action.')).toBeTruthy();
    expect(screen.getByText('Toolbox talk completion below target')).toBeTruthy();
  });
});
