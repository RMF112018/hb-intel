import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HbcAiTrustMeter, type HbcAiTrustMeterProps } from './HbcAiTrustMeter.js';
import type { IAiConfidenceDetails } from '../types/index.js';

const fullDetails: IAiConfidenceDetails = {
  confidenceScore: 0.92,
  confidenceBadge: 'high',
  rationaleShort: 'Strong match on historical data',
  rationaleLong: 'The model found 14 similar records with consistent patterns across the dataset.',
  citedSources: [
    { key: 'src-1', label: 'Historical DB' },
    { key: 'src-2', label: 'Project Archive' },
  ],
  modelDeploymentName: 'gpt-4o',
  modelDeploymentVersion: '2024-08-06',
  tokenUsage: { prompt: 200, completion: 80, total: 280 },
};

const baseProps: HbcAiTrustMeterProps = {
  trustLevel: 'essential',
  confidence: 0.85,
};

describe('HbcAiTrustMeter', () => {
  it('renders with data-testid="ai-trust-meter"', () => {
    render(<HbcAiTrustMeter {...baseProps} />);
    expect(screen.getByTestId('ai-trust-meter')).toBeDefined();
  });

  it('essential: shows badge + disclaimer, no rationale', () => {
    render(<HbcAiTrustMeter {...baseProps} confidenceDetails={fullDetails} />);
    expect(screen.getByTestId('ai-trust-meter-badge')).toBeDefined();
    expect(screen.getByTestId('ai-trust-meter-disclaimer')).toBeDefined();
    expect(screen.queryByTestId('ai-trust-meter-rationale-short')).toBeNull();
    expect(screen.queryByTestId('ai-trust-meter-expert')).toBeNull();
  });

  it('standard: shows badge + rationaleShort', () => {
    render(
      <HbcAiTrustMeter
        trustLevel="standard"
        confidence={0.92}
        confidenceDetails={fullDetails}
      />,
    );
    expect(screen.getByTestId('ai-trust-meter-badge')).toBeDefined();
    expect(screen.getByTestId('ai-trust-meter-rationale-short').textContent).toBe(
      'Strong match on historical data',
    );
    expect(screen.queryByTestId('ai-trust-meter-disclaimer')).toBeNull();
    expect(screen.queryByTestId('ai-trust-meter-expert')).toBeNull();
  });

  it('expert: shows full score, rationale, sources, model info, token usage', () => {
    render(
      <HbcAiTrustMeter
        trustLevel="expert"
        confidence={0.92}
        confidenceDetails={fullDetails}
      />,
    );
    expect(screen.getByTestId('ai-trust-meter-expert')).toBeDefined();
    expect(screen.getByTestId('ai-trust-meter-score').textContent).toContain('0.92');
    expect(screen.getByTestId('ai-trust-meter-rationale-short')).toBeDefined();
    expect(screen.getByTestId('ai-trust-meter-rationale-long')).toBeDefined();
    expect(screen.getByTestId('ai-trust-meter-sources')).toBeDefined();
    expect(screen.getByTestId('ai-trust-meter-model').textContent).toContain('gpt-4o');
    expect(screen.getByTestId('ai-trust-meter-token-usage').textContent).toContain('280');
  });

  it('badge color green for high confidence', () => {
    render(
      <HbcAiTrustMeter
        {...baseProps}
        confidenceDetails={{ ...fullDetails, confidenceBadge: 'high' }}
      />,
    );
    const badge = screen.getByTestId('ai-trust-meter-badge');
    expect(badge.style.background).toBe('rgb(0, 200, 150)');
  });

  it('badge color amber for medium confidence', () => {
    render(
      <HbcAiTrustMeter
        {...baseProps}
        confidenceDetails={{ ...fullDetails, confidenceBadge: 'medium' }}
      />,
    );
    const badge = screen.getByTestId('ai-trust-meter-badge');
    expect(badge.style.background).toBe('rgb(255, 176, 32)');
  });

  it('badge color red for low confidence', () => {
    render(
      <HbcAiTrustMeter
        {...baseProps}
        confidenceDetails={{ ...fullDetails, confidenceBadge: 'low' }}
      />,
    );
    const badge = screen.getByTestId('ai-trust-meter-badge');
    expect(badge.style.background).toBe('rgb(255, 77, 77)');
  });

  it('expert: expandable rationale uses <details>', () => {
    render(
      <HbcAiTrustMeter
        trustLevel="expert"
        confidence={0.92}
        confidenceDetails={fullDetails}
      />,
    );
    const details = screen.getByTestId('ai-trust-meter-rationale-long');
    expect(details.tagName.toLowerCase()).toBe('details');
  });

  it('expert: renders cited sources as list items', () => {
    render(
      <HbcAiTrustMeter
        trustLevel="expert"
        confidence={0.92}
        confidenceDetails={fullDetails}
      />,
    );
    const sourcesList = screen.getByTestId('ai-trust-meter-sources');
    const items = sourcesList.querySelectorAll('li');
    expect(items).toHaveLength(2);
    expect(items[0].textContent).toBe('Historical DB');
    expect(items[1].textContent).toBe('Project Archive');
  });

  it('missing confidenceDetails: renders badge-only from confidence prop', () => {
    render(<HbcAiTrustMeter trustLevel="essential" confidence={0.85} />);
    const badge = screen.getByTestId('ai-trust-meter-badge');
    expect(badge.textContent).toBe('High');
    expect(badge.style.background).toBe('rgb(0, 200, 150)');
  });
});
