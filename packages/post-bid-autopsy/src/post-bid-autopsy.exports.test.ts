import { describe, expect, it } from 'vitest';

import type { PostBidLearningSignal } from '@hbc/post-bid-autopsy';
import {
  AUTOPSY_STATUS_ORDER,
  POST_BID_AUTOPSY_API_SURFACES,
  POST_BID_AUTOPSY_COMPONENT_CONTRACTS,
  POST_BID_AUTOPSY_TELEMETRY_EVENTS,
} from '@hbc/post-bid-autopsy';
import {
  createMockBenchmarkDatasetSignal,
  createMockPostBidAutopsyRecord,
} from '@hbc/post-bid-autopsy/testing';

describe('post-bid autopsy public exports', () => {
  it('resolves runtime and testing entrypoints through package exports', () => {
    const signal: PostBidLearningSignal = createMockBenchmarkDatasetSignal();
    const record = createMockPostBidAutopsyRecord();

    expect(signal.signalType).toBe('benchmark-dataset-enrichment');
    expect(record.autopsyId).toBe('autopsy-mock');
    expect(AUTOPSY_STATUS_ORDER).toContain('overdue');
    expect(POST_BID_AUTOPSY_API_SURFACES).toHaveLength(2);
    expect(POST_BID_AUTOPSY_COMPONENT_CONTRACTS).toHaveLength(3);
    expect(POST_BID_AUTOPSY_TELEMETRY_EVENTS).toContain('post-bid-autopsy.evidence-reviewed');
  });
});
