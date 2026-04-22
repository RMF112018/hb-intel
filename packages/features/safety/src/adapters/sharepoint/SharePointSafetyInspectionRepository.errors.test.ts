/**
 * Phase-3 root-cause remediation — adapter error taxonomy.
 *
 * Proves that non-OK SharePoint responses and overlay gaps produce typed
 * errors (SafetyAdapterFetchError, SafetyConfigurationError) carrying the
 * real list name, endpoint, and HTTP status. This is what lets the
 * ReportingPeriodDashboardPage tell the truth about which list actually
 * failed instead of blaming reporting periods for every adapter failure.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SharePointSafetyInspectionRepository } from './SharePointSafetyInspectionRepository.js';
import type { SpHttpClient } from './spHttp.js';
import {
  SafetyAdapterFetchError,
  SafetyConfigurationError,
  isSafetyAdapterFetchError,
  isSafetyConfigurationError,
} from './errors.js';
import {
  configureSafetyListGuids,
  resetSafetyListGuidOverlay,
} from '../../lists/guidConfig.js';

const PW_GUID = '11111111-1111-1111-1111-111111111111';

function failingClient(status: number, body = '<error/>'): SpHttpClient {
  return {
    get: async () =>
      ({
        ok: false,
        status,
        json: async () => ({}),
        text: async () => body,
      }) as unknown as Response,
    post: async () =>
      ({
        ok: false,
        status,
        json: async () => ({}),
        text: async () => body,
      }) as unknown as Response,
  };
}

describe('SharePointSafetyInspectionRepository — typed error taxonomy', () => {
  afterEach(() => resetSafetyListGuidOverlay());

  describe('SafetyAdapterFetchError on HTTP failures', () => {
    beforeEach(() => {
      configureSafetyListGuids({ SafetyProjectWeekRecords: PW_GUID });
    });

    it('listProjectWeeks throws SafetyAdapterFetchError with list + status when REST fails', async () => {
      const repo = new SharePointSafetyInspectionRepository({ client: failingClient(403) });
      let caught: unknown;
      try {
        await repo.listProjectWeeks({ reportingPeriodId: 'period-1' });
      } catch (err) {
        caught = err;
      }
      expect(isSafetyAdapterFetchError(caught)).toBe(true);
      const err = caught as SafetyAdapterFetchError;
      expect(err).toBeInstanceOf(SafetyAdapterFetchError);
      expect(err.listName).toBe('Safety Project Week Records');
      expect(err.httpStatus).toBe(403);
      expect(err.endpoint).toContain(`lists(guid'${PW_GUID}')`);
      expect(err.endpoint).toContain('ReportingPeriodId eq 1');
      // Message preserves the list name so UI consumers can surface it.
      expect(err.message).toMatch(/Safety Project Week Records/);
      expect(err.message).toMatch(/403/);
    });

    it('includes body snippet in error message when REST response has a body', async () => {
      const repo = new SharePointSafetyInspectionRepository({
        client: failingClient(500, '{"error":"oops"}'),
      });
      let caught: unknown;
      try {
        await repo.listProjectWeeks({ reportingPeriodId: 'period-9' });
      } catch (err) {
        caught = err;
      }
      const err = caught as SafetyAdapterFetchError;
      expect(err.bodySnippet).toContain('oops');
      expect(err.message).toContain('oops');
    });
  });

  describe('SafetyConfigurationError on zero-GUID fail-closed', () => {
    it('listProjectWeeks throws SafetyConfigurationError when overlay is missing for that list', async () => {
      // No overlay configured → descriptor resolves to zero-GUID → fail-closed.
      const repo = new SharePointSafetyInspectionRepository({ client: failingClient(200) });
      let caught: unknown;
      try {
        await repo.listProjectWeeks({ reportingPeriodId: 'period-1' });
      } catch (err) {
        caught = err;
      }
      expect(isSafetyConfigurationError(caught)).toBe(true);
      const err = caught as SafetyConfigurationError;
      expect(err).toBeInstanceOf(SafetyConfigurationError);
      // The error must name the specific list that is unconfigured — this is
      // the single most actionable diagnostic for a hosted overlay gap.
      expect(err.listName).toBe('Safety Project Week Records');
      expect(err.descriptorKey).toBe('SafetyProjectWeekRecords');
      expect(err.message).toMatch(/Safety Project Week Records/);
      expect(err.message).toMatch(/zero GUID/);
    });

    it('does not throw SafetyConfigurationError for a list whose overlay IS populated', async () => {
      configureSafetyListGuids({ SafetyProjectWeekRecords: PW_GUID });
      // Client still returns 403 → adapter fetch error, not configuration error.
      const repo = new SharePointSafetyInspectionRepository({ client: failingClient(403) });
      let caught: unknown;
      try {
        await repo.listProjectWeeks({ reportingPeriodId: 'period-1' });
      } catch (err) {
        caught = err;
      }
      expect(isSafetyConfigurationError(caught)).toBe(false);
      expect(isSafetyAdapterFetchError(caught)).toBe(true);
    });
  });
});
