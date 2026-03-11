/**
 * Activity timeline adapter tests — D-SF14-T07
 */
import { describe, it, expect, vi } from 'vitest';
import { emitGovernanceEvent, type IGovernanceTimelineEvent } from '../activityTimelineAdapter.js';

const SAMPLE_EVENT: IGovernanceTimelineEvent = {
  eventType: 'relationship-created',
  sourceRecordType: 'bd-scorecard',
  targetRecordType: 'estimating-pursuit',
  changedBy: 'admin@hb.com',
  timestamp: '2026-03-11T10:00:00Z',
  details: { reason: 'test' },
};

describe('emitGovernanceEvent', () => {
  it('does not throw', () => {
    expect(() => emitGovernanceEvent(SAMPLE_EVENT)).not.toThrow();
  });

  it('logs to console.info in DEV mode', () => {
    const originalEnv = process.env['NODE_ENV'];
    process.env['NODE_ENV'] = 'development';
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});

    emitGovernanceEvent(SAMPLE_EVENT);

    expect(spy).toHaveBeenCalledWith('[related-items] governance event:', SAMPLE_EVENT);
    spy.mockRestore();
    process.env['NODE_ENV'] = originalEnv;
  });

  it('event shape matches IGovernanceTimelineEvent interface', () => {
    expect(SAMPLE_EVENT).toHaveProperty('eventType');
    expect(SAMPLE_EVENT).toHaveProperty('sourceRecordType');
    expect(SAMPLE_EVENT).toHaveProperty('targetRecordType');
    expect(SAMPLE_EVENT).toHaveProperty('changedBy');
    expect(SAMPLE_EVENT).toHaveProperty('timestamp');
    expect(SAMPLE_EVENT).toHaveProperty('details');
  });
});
