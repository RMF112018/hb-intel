import { describe, expect, it } from 'vitest';

import {
  BASELINE_LOCK_ACTORS,
  BASELINE_API_METHODS,
  BASELINE_READ_ROLES,
  STAGE8_ACTIVITY_EVENTS,
  BASELINE_LOCK_TRANSACTION_STEPS,
  CLOSEOUT_API_CONTRACT,
  BASELINE_CLOSEOUT_RELATIONSHIP_TYPE,
  STARTUP_BASELINE_REQUIRED_FIELDS,
  CLOSEOUT_DELTA_ANALYSIS_MAP,
  STAGE8_ACTIVITY_EVENT_DEFINITIONS,
  BASELINE_LOCK_ACTOR_LABELS,
} from '../../index.js';

describe('P3-E11-T10 Stage 8 Startup baseline lock contract stability', () => {
  // -- Enum arrays -----------------------------------------------------------

  describe('BaselineLockActor', () => {
    it('has exactly 2 actors (PE and SYSTEM)', () => {
      expect(BASELINE_LOCK_ACTORS).toHaveLength(2);
      expect(BASELINE_LOCK_ACTORS).toContain('PE');
      expect(BASELINE_LOCK_ACTORS).toContain('SYSTEM');
    });
  });

  describe('BaselineAPIMethod', () => {
    it('has exactly 4 methods', () => {
      expect(BASELINE_API_METHODS).toHaveLength(4);
    });
  });

  describe('BaselineReadRole', () => {
    it('has exactly 2 authorized roles', () => {
      expect(BASELINE_READ_ROLES).toHaveLength(2);
      expect(BASELINE_READ_ROLES).toContain('PX');
      expect(BASELINE_READ_ROLES).toContain('CloseoutService');
    });
  });

  describe('Stage8ActivityEvent', () => {
    it('has exactly 1 event (StartupBaselineLocked)', () => {
      expect(STAGE8_ACTIVITY_EVENTS).toHaveLength(1);
      expect(STAGE8_ACTIVITY_EVENTS).toContain('StartupBaselineLocked');
    });
  });

  // -- Lock transaction ------------------------------------------------------

  describe('Baseline lock transaction', () => {
    it('has exactly 5 steps per T01 §7.5', () => {
      expect(BASELINE_LOCK_TRANSACTION_STEPS).toHaveLength(5);
    });

    it('steps are numbered 1 through 5', () => {
      const numbers = BASELINE_LOCK_TRANSACTION_STEPS.map((s) => s.stepNumber);
      expect(numbers).toEqual([1, 2, 3, 4, 5]);
    });

    it('step 1 creates the snapshot', () => {
      expect(BASELINE_LOCK_TRANSACTION_STEPS[0].description).toContain('StartupBaseline snapshot');
    });

    it('step 3 advances state to BASELINE_LOCKED', () => {
      expect(BASELINE_LOCK_TRANSACTION_STEPS[2].description).toContain('BASELINE_LOCKED');
    });

    it('step 5 clears Work Queue items', () => {
      expect(BASELINE_LOCK_TRANSACTION_STEPS[4].description).toContain('Work Queue');
    });
  });

  // -- Closeout API contract -------------------------------------------------

  describe('Closeout API contract', () => {
    it('defines the baseline endpoint', () => {
      expect(CLOSEOUT_API_CONTRACT.endpoint).toContain('/api/startup/');
      expect(CLOSEOUT_API_CONTRACT.endpoint).toContain('/baseline');
    });

    it('authorizes PX and CloseoutService', () => {
      expect(CLOSEOUT_API_CONTRACT.authorizedRoles).toContain('PX');
      expect(CLOSEOUT_API_CONTRACT.authorizedRoles).toContain('CloseoutService');
    });

    it('has 6 response definitions (GET 200/403/404 + PATCH/PUT/DELETE 405)', () => {
      expect(CLOSEOUT_API_CONTRACT.responses).toHaveLength(6);
    });

    it('GET returns 200 for authorized caller', () => {
      const getOk = CLOSEOUT_API_CONTRACT.responses.find((r) => r.method === 'GET' && r.statusCode === 200);
      expect(getOk).toBeDefined();
    });

    it('PATCH returns 405', () => {
      const patch = CLOSEOUT_API_CONTRACT.responses.find((r) => r.method === 'PATCH');
      expect(patch?.statusCode).toBe(405);
    });

    it('PUT returns 405', () => {
      const put = CLOSEOUT_API_CONTRACT.responses.find((r) => r.method === 'PUT');
      expect(put?.statusCode).toBe(405);
    });

    it('DELETE returns 405', () => {
      const del = CLOSEOUT_API_CONTRACT.responses.find((r) => r.method === 'DELETE');
      expect(del?.statusCode).toBe(405);
    });
  });

  // -- Related Items ---------------------------------------------------------

  describe('Baseline-Closeout relationship', () => {
    it('defines startup-baseline-feeds-autopsy type', () => {
      expect(BASELINE_CLOSEOUT_RELATIONSHIP_TYPE).toBe('startup-baseline-feeds-autopsy');
    });
  });

  // -- Required fields -------------------------------------------------------

  describe('StartupBaseline required fields', () => {
    it('has exactly 22 required fields per T02 §7.2', () => {
      expect(STARTUP_BASELINE_REQUIRED_FIELDS).toHaveLength(22);
    });

    it('includes snapshotId', () => {
      expect(STARTUP_BASELINE_REQUIRED_FIELDS).toContain('snapshotId');
    });

    it('includes executionBaselineFieldsAtLock', () => {
      expect(STARTUP_BASELINE_REQUIRED_FIELDS).toContain('executionBaselineFieldsAtLock');
    });

    it('includes authorizingPEUserId', () => {
      expect(STARTUP_BASELINE_REQUIRED_FIELDS).toContain('authorizingPEUserId');
    });
  });

  // -- Delta analysis map ----------------------------------------------------

  describe('Closeout delta analysis map', () => {
    it('has exactly 9 analysis entries per T06 §9.2', () => {
      expect(CLOSEOUT_DELTA_ANALYSIS_MAP).toHaveLength(9);
    });

    it('each entry has analysis and sourceFields', () => {
      for (const entry of CLOSEOUT_DELTA_ANALYSIS_MAP) {
        expect(entry.analysis).toBeTruthy();
        expect(entry.sourceFields.length).toBeGreaterThan(0);
      }
    });
  });

  // -- Spine publication -----------------------------------------------------

  describe('Stage 8 spine publication', () => {
    it('has 1 activity event definition', () => {
      expect(STAGE8_ACTIVITY_EVENT_DEFINITIONS).toHaveLength(1);
    });
  });

  // -- Label maps ------------------------------------------------------------

  describe('Label maps', () => {
    it('labels both lock actors', () => {
      expect(Object.keys(BASELINE_LOCK_ACTOR_LABELS)).toHaveLength(2);
    });
  });
});
