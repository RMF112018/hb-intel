import { beforeEach, describe, expect, it } from 'vitest';
import {
  computeActivityExposureScore,
  deriveActivityEvidence,
} from '../exposure.js';
import {
  makeInput,
  makeInspection,
  makeProjectWeek,
  resetCounters,
} from './fixtures.js';

describe('exposure', () => {
  beforeEach(() => {
    resetCounters();
  });

  it('returns caller-supplied evidence unchanged', () => {
    const input = makeInput({
      activityEvidence: {
        status: 'proven',
        source: 'manual',
        activeTradeCount: 8,
        estimatedManpower: 64,
      },
    });
    expect(deriveActivityEvidence(input)).toEqual(input.activityEvidence);
  });

  it('infers from active project stage', () => {
    const input = makeInput({
      projectWeek: makeProjectWeek({ projectStageSnapshot: 'Active Construction' }),
    });
    const evidence = deriveActivityEvidence(input);
    expect(evidence.status).toBe('inferred');
    expect(evidence.source).toBe('project-stage');
  });

  it('infers from inspection density when stage does not match', () => {
    const input = makeInput({
      projectWeek: makeProjectWeek({ projectStageSnapshot: 'Mobilization' }),
      priorInspections: [
        makeInspection({ status: 'accepted' }),
        makeInspection({ status: 'accepted' }),
        makeInspection({ status: 'accepted' }),
      ],
    });
    const evidence = deriveActivityEvidence(input);
    expect(evidence.status).toBe('inferred');
    expect(evidence.source).toBe('inspection-density');
  });

  it('reports missing when no stage match and low density', () => {
    const input = makeInput({
      projectWeek: makeProjectWeek({ projectStageSnapshot: 'Closeout' }),
      priorInspections: [makeInspection({ status: 'accepted' })],
    });
    const evidence = deriveActivityEvidence(input);
    expect(evidence.status).toBe('missing');
    expect(evidence.source).toBe('none');
  });

  it('scores proven evidence with multiple inspections highest', () => {
    const result = computeActivityExposureScore(
      makeInput(),
      { status: 'proven', source: 'manual' },
      3,
    );
    expect(result.score).toBe(90);
  });

  it('scores proven evidence with single inspection lower than multi', () => {
    const result = computeActivityExposureScore(
      makeInput(),
      { status: 'proven', source: 'manual' },
      1,
    );
    expect(result.score).toBe(75);
  });

  it('scores inferred evidence in the middle band', () => {
    const result = computeActivityExposureScore(
      makeInput(),
      { status: 'inferred', source: 'project-stage' },
      2,
    );
    expect(result.score).toBe(55);
  });

  it('scores missing evidence at the floor', () => {
    const result = computeActivityExposureScore(
      makeInput(),
      { status: 'missing', source: 'none' },
      1,
    );
    expect(result.score).toBe(20);
  });
});
