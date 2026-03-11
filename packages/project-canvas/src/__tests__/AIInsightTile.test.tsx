/**
 * AIInsightTile test suite — D-SF13-T08, container contract
 *
 * Validates the AI insight tile placeholder component and its registry wiring.
 */
import React, { Suspense } from 'react';
import { render, screen } from '@testing-library/react';
import { AIInsightTile } from '../components/AIInsightTile.js';
import { aiInsightDef } from '../tiles/referenceTileDefinitions.js';

describe('AIInsightTile (D-SF13-T08, container contract)', () => {
  it('renders with data-testid="ai-insight-tile"', () => {
    render(<AIInsightTile />);
    expect(screen.getByTestId('ai-insight-tile')).toBeInTheDocument();
  });

  it('renders placeholder text content', () => {
    render(<AIInsightTile />);
    expect(screen.getByTestId('ai-insight-tile')).toHaveTextContent('AIInsightTile placeholder');
  });

  it('is a valid function component returning ReactElement', () => {
    expect(typeof AIInsightTile).toBe('function');
    const result = AIInsightTile();
    expect(result).toBeDefined();
    expect(result.props).toBeDefined();
  });

  it('ai-insight definition has aiComponent field set', () => {
    expect(aiInsightDef.aiComponent).toBeDefined();
  });

  it('aiComponent lazy-loads without error in Suspense boundary', async () => {
    const AiComponent = aiInsightDef.aiComponent!;
    render(
      <Suspense fallback={<div>loading</div>}>
        <AiComponent projectId="proj-1" tileKey="ai-insight" />
      </Suspense>,
    );
    const el = await screen.findByTestId('ai-insight-tile');
    expect(el).toBeInTheDocument();
  });

  it('all 3 component variants reference the same AIInsightTile wrapper', async () => {
    const Essential = aiInsightDef.component.essential;
    const Standard = aiInsightDef.component.standard;
    const Expert = aiInsightDef.component.expert;

    const { unmount: u1 } = render(
      <Suspense fallback={<div>loading</div>}>
        <Essential projectId="p" tileKey="ai-insight" />
      </Suspense>,
    );
    const el1 = await screen.findByTestId('ai-insight-tile');
    expect(el1).toBeInTheDocument();
    u1();

    const { unmount: u2 } = render(
      <Suspense fallback={<div>loading</div>}>
        <Standard projectId="p" tileKey="ai-insight" />
      </Suspense>,
    );
    const el2 = await screen.findByTestId('ai-insight-tile');
    expect(el2).toBeInTheDocument();
    u2();

    const { unmount: u3 } = render(
      <Suspense fallback={<div>loading</div>}>
        <Expert projectId="p" tileKey="ai-insight" />
      </Suspense>,
    );
    const el3 = await screen.findByTestId('ai-insight-tile');
    expect(el3).toBeInTheDocument();
    u3();
  });
});
