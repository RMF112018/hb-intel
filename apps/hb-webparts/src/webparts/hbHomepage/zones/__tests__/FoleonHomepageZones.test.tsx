import * as React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { HbHomepageZoneProps } from '../../hbHomepageContract.js';
import { ProjectPortfolioSpotlightZone } from '../ProjectPortfolioSpotlightZone.js';
import { CompanyPulseZone } from '../CompanyPulseZone.js';

const hostSpy = vi.hoisted(() => vi.fn());

vi.mock('../FoleonHomepageLaneHost.js', () => ({
  FoleonHomepageLaneHost: (props: Record<string, unknown>): React.ReactElement => {
    hostSpy(props);
    return React.createElement('div', {
      'data-test-foleon-host': props.lane as string,
      'data-test-occupant-id': props.occupantId as string,
    });
  },
}));

function makeZoneProps(): HbHomepageZoneProps {
  return {
    moduleConfig: {
      projectPortfolioSpotlight: { legacyTitle: 'Legacy Project Portfolio Spotlight' },
      companyPulse: { legacyTitle: 'Legacy Company Pulse' },
    },
    siteUrl: 'https://contoso.sharepoint.com/sites/HBCentral',
  };
}

describe('Foleon homepage zone cutover wrappers', () => {
  beforeEach(() => {
    hostSpy.mockClear();
  });

  it('wires ProjectPortfolioSpotlightZone to the Project Spotlight Foleon lane', () => {
    render(<ProjectPortfolioSpotlightZone {...makeZoneProps()} />);

    expect(screen.getByLabelText('Project Spotlight')).toBeTruthy();
    expect(hostSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        lane: 'projectSpotlight',
        occupantId: 'project-portfolio-spotlight',
      }),
    );
    expect(document.querySelector('[data-test-foleon-host="projectSpotlight"]')).not.toBeNull();
    expect(document.body.textContent).not.toContain('Legacy Project Portfolio Spotlight');
  });

  it('wires CompanyPulseZone to the Company Pulse Foleon lane', () => {
    render(<CompanyPulseZone {...makeZoneProps()} />);

    expect(screen.getByLabelText('Company Pulse')).toBeTruthy();
    expect(hostSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        lane: 'companyPulse',
        occupantId: 'company-pulse',
      }),
    );
    expect(document.querySelector('[data-test-foleon-host="companyPulse"]')).not.toBeNull();
    expect(document.body.textContent).not.toContain('Legacy Company Pulse');
  });
});
