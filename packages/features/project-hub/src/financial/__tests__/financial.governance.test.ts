import { describe, expect, it } from 'vitest';

import {
  resolveFinancialVersionAccess,
  isFinancialActionAllowed,
} from '../../index.js';
import { mockFinancialAccessScenarios } from '../../../testing/index.js';

describe('P3-E4-T01 financial version access rules', () => {
  describe('PM access', () => {
    it('grants read and write on Working version', () => {
      const result = resolveFinancialVersionAccess(mockFinancialAccessScenarios.pmWorking);
      expect(result.hidden).toBe(false);
      expect(result.allowed).toContain('read');
      expect(result.allowed).toContain('write');
      expect(result.denied).toContain('annotate');
    });

    it('grants read, derive, and designate-report-candidate on ConfirmedInternal', () => {
      const result = resolveFinancialVersionAccess(mockFinancialAccessScenarios.pmConfirmed);
      expect(result.hidden).toBe(false);
      expect(result.allowed).toContain('read');
      expect(result.allowed).toContain('derive');
      expect(result.allowed).toContain('designate-report-candidate');
      expect(result.denied).toContain('write');
      expect(result.denied).toContain('annotate');
    });

    it('grants read-only on PublishedMonthly', () => {
      const result = resolveFinancialVersionAccess(mockFinancialAccessScenarios.pmPublished);
      expect(result.hidden).toBe(false);
      expect(result.allowed).toEqual(['read']);
      expect(result.denied).toContain('write');
    });

    it('grants read-only on Superseded', () => {
      const result = resolveFinancialVersionAccess(mockFinancialAccessScenarios.pmSuperseded);
      expect(result.hidden).toBe(false);
      expect(result.allowed).toEqual(['read']);
    });
  });

  describe('PER access', () => {
    it('hides Working version entirely — key T01 §1.4 principle', () => {
      const result = resolveFinancialVersionAccess(mockFinancialAccessScenarios.perWorking);
      expect(result.hidden).toBe(true);
      expect(result.allowed).toEqual([]);
      expect(result.denied).toContain('read');
      expect(result.denied).toContain('write');
      expect(result.denied).toContain('annotate');
      expect(result.denied).toContain('derive');
      expect(result.denied).toContain('designate-report-candidate');
    });

    it('grants read and annotate on ConfirmedInternal', () => {
      const result = resolveFinancialVersionAccess(mockFinancialAccessScenarios.perConfirmed);
      expect(result.hidden).toBe(false);
      expect(result.allowed).toContain('read');
      expect(result.allowed).toContain('annotate');
      expect(result.denied).toContain('write');
    });

    it('grants read and annotate on PublishedMonthly', () => {
      const result = resolveFinancialVersionAccess(mockFinancialAccessScenarios.perPublished);
      expect(result.hidden).toBe(false);
      expect(result.allowed).toContain('read');
      expect(result.allowed).toContain('annotate');
    });

    it('grants read-only on Superseded', () => {
      const result = resolveFinancialVersionAccess(mockFinancialAccessScenarios.perSuperseded);
      expect(result.hidden).toBe(false);
      expect(result.allowed).toEqual(['read']);
      expect(result.denied).toContain('annotate');
    });
  });

  describe('Leadership access', () => {
    it('grants read-only on Working', () => {
      const result = resolveFinancialVersionAccess(mockFinancialAccessScenarios.leadershipWorking);
      expect(result.hidden).toBe(false);
      expect(result.allowed).toEqual(['read']);
    });

    it('grants read-only on ConfirmedInternal', () => {
      const result = resolveFinancialVersionAccess(mockFinancialAccessScenarios.leadershipConfirmed);
      expect(result.hidden).toBe(false);
      expect(result.allowed).toEqual(['read']);
    });

    it('grants read-only on PublishedMonthly', () => {
      const result = resolveFinancialVersionAccess(mockFinancialAccessScenarios.leadershipPublished);
      expect(result.hidden).toBe(false);
      expect(result.allowed).toEqual(['read']);
    });

    it('grants read-only on Superseded', () => {
      const result = resolveFinancialVersionAccess(mockFinancialAccessScenarios.leadershipSuperseded);
      expect(result.hidden).toBe(false);
      expect(result.allowed).toEqual(['read']);
    });
  });

  describe('cross-cutting invariants', () => {
    it('no confirmed version allows write', () => {
      const confirmedScenarios = [
        mockFinancialAccessScenarios.pmConfirmed,
        mockFinancialAccessScenarios.perConfirmed,
        mockFinancialAccessScenarios.leadershipConfirmed,
      ];
      for (const query of confirmedScenarios) {
        const result = resolveFinancialVersionAccess(query);
        expect(result.allowed).not.toContain('write');
        expect(result.denied).toContain('write');
      }
    });

    it('Leadership never has annotate permission', () => {
      const leadershipScenarios = [
        mockFinancialAccessScenarios.leadershipWorking,
        mockFinancialAccessScenarios.leadershipConfirmed,
        mockFinancialAccessScenarios.leadershipPublished,
        mockFinancialAccessScenarios.leadershipSuperseded,
      ];
      for (const query of leadershipScenarios) {
        const result = resolveFinancialVersionAccess(query);
        expect(result.allowed).not.toContain('annotate');
      }
    });

    it('only PER has annotate permission on any version', () => {
      const allScenarios = Object.values(mockFinancialAccessScenarios);
      const scenariosWithAnnotate = allScenarios.filter((query) => {
        const result = resolveFinancialVersionAccess(query);
        return result.allowed.includes('annotate');
      });
      for (const query of scenariosWithAnnotate) {
        expect(query.role).toBe('PER');
      }
    });
  });

  describe('isFinancialActionAllowed convenience', () => {
    it('returns true for allowed action', () => {
      expect(isFinancialActionAllowed(mockFinancialAccessScenarios.pmWorking, 'write')).toBe(true);
    });

    it('returns false for denied action', () => {
      expect(isFinancialActionAllowed(mockFinancialAccessScenarios.pmWorking, 'annotate')).toBe(false);
    });

    it('returns false for hidden version', () => {
      expect(isFinancialActionAllowed(mockFinancialAccessScenarios.perWorking, 'read')).toBe(false);
    });
  });
});
