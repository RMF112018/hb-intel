/**
 * Defects 1 + 2 closure — SharePoint ingestion-run query filter shapes.
 *
 * Proves against a fake `SpHttpClient` that:
 * - `listIngestionRuns({ terminalStatus })` emits a terminal-only `$filter`.
 * - `listIngestionRuns({ reportingPeriodId })` emits a period-only `$filter`
 *   with a numeric Lookup comparison.
 * - `listIngestionRuns({ reportingPeriodId, terminalStatus })` joins both
 *   clauses with `and` and preserves `$orderby=RunStartedAt desc`.
 * - `listReviewQueue()` queries every state in
 *   `REVIEW_QUEUE_TERMINAL_STATUSES` (Defect 1).
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SharePointSafetyInspectionRepository } from './SharePointSafetyInspectionRepository.js';
import type { SpHttpClient } from './spHttp.js';
import {
  configureSafetyListGuids,
  resetSafetyListGuidOverlay,
} from '../../lists/guidConfig.js';
import { REVIEW_QUEUE_TERMINAL_STATUSES } from '../../ports/ISafetyInspectionRepository.js';

const RUN_GUID = '77777777-7777-7777-7777-777777777777';

function makeClient(): { client: SpHttpClient; urls: string[] } {
  const urls: string[] = [];
  const client: SpHttpClient = {
    get: async (url) => {
      urls.push(url);
      return {
        ok: true,
        status: 200,
        json: async () => ({ value: [] }),
        text: async () => '',
      } as unknown as Response;
    },
    post: async () => {
      throw new Error('no POST expected');
    },
  };
  return { client, urls };
}

describe('SharePoint listIngestionRuns filter shapes (W-P1/P2)', () => {
  beforeEach(() => {
    configureSafetyListGuids({ SafetyIngestionRuns: RUN_GUID });
  });
  afterEach(() => resetSafetyListGuidOverlay());

  it('emits terminal-only $filter when only terminalStatus is requested', async () => {
    const { client, urls } = makeClient();
    const repo = new SharePointSafetyInspectionRepository({ client });
    await repo.listIngestionRuns({ terminalStatus: ['committed', 'commit-failed'] });
    const url = urls[0]!;
    expect(url).toContain('$filter=');
    expect(url).toContain("TerminalStatus eq 'committed'");
    expect(url).toContain("TerminalStatus eq 'commit-failed'");
    expect(url).not.toContain('ReportingPeriodId eq');
  });

  it('emits reportingPeriod-only $filter with numeric Lookup comparison', async () => {
    const { client, urls } = makeClient();
    const repo = new SharePointSafetyInspectionRepository({ client });
    await repo.listIngestionRuns({ reportingPeriodId: 'period-1001' });
    const url = urls[0]!;
    expect(url).toContain('$filter=ReportingPeriodId eq 1001');
    expect(url).not.toContain('TerminalStatus eq');
  });

  it('joins reportingPeriod + terminal filters with `and` and preserves order', async () => {
    const { client, urls } = makeClient();
    const repo = new SharePointSafetyInspectionRepository({ client });
    await repo.listIngestionRuns({
      reportingPeriodId: 'period-42',
      terminalStatus: ['committed'],
    });
    const url = urls[0]!;
    expect(url).toContain('ReportingPeriodId eq 42');
    expect(url).toContain("TerminalStatus eq 'committed'");
    expect(url).toContain(' and ');
    expect(url).toContain('$orderby=RunStartedAt desc');
  });

  it('listReviewQueue queries every terminal in REVIEW_QUEUE_TERMINAL_STATUSES', async () => {
    const { client, urls } = makeClient();
    const repo = new SharePointSafetyInspectionRepository({ client });
    await repo.listReviewQueue();
    const url = urls[0]!;
    for (const status of REVIEW_QUEUE_TERMINAL_STATUSES) {
      expect(url).toContain(`TerminalStatus eq '${status}'`);
    }
  });
});
