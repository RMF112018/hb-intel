import { describe, expect, it } from 'vitest';
import {
  parseScoreBenchmarkPanelContext,
  serializeScoreBenchmarkPanelContext,
} from './panelUrlState.js';

describe('panelUrlState', () => {
  it('parses valid and invalid panel ids deterministically', () => {
    expect(parseScoreBenchmarkPanelContext('?sbPanel=similar-pursuits&sbPursuitId=p-1')).toEqual({
      panel: 'similar-pursuits',
      pursuitId: 'p-1',
      criterionId: undefined,
    });

    expect(parseScoreBenchmarkPanelContext('?sbPanel=unknown')).toEqual({ panel: null });
    expect(parseScoreBenchmarkPanelContext('')).toEqual({ panel: null });
  });

  it('serializes panel context and clears params on close', () => {
    const opened = serializeScoreBenchmarkPanelContext('?a=1', {
      panel: 'explainability',
      criterionId: 'criterion-1',
    });

    expect(opened).toContain('a=1');
    expect(opened).toContain('sbPanel=explainability');
    expect(opened).toContain('sbCriterionId=criterion-1');

    const switched = serializeScoreBenchmarkPanelContext(opened, {
      panel: 'reviewer-consensus',
      pursuitId: 'p-9',
    });
    expect(switched).toContain('sbPanel=reviewer-consensus');
    expect(switched).toContain('sbPursuitId=p-9');
    expect(switched).not.toContain('sbCriterionId');

    const closed = serializeScoreBenchmarkPanelContext(switched, { panel: null });
    expect(closed).toBe('?a=1');
  });
});
