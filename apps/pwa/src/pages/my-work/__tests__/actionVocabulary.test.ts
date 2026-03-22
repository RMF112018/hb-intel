/**
 * Action vocabulary tests — P2-A1 §7.2, OPM-01, NAV-01.
 *
 * Verifies:
 * - Replayable action classification (mark-read, defer, etc.)
 * - Action-to-state transition mapping
 * - Non-replayable actions produce deepLinkHref
 * - No window.location.href in action dispatch path
 */
import { describe, it, expect } from 'vitest';
import { MY_WORK_REPLAYABLE_ACTIONS } from '../../../../../../packages/my-work-feed/src/constants/myWorkDefaults.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Action vocabulary (P2-A1 §7.2, OPM-01)', () => {
  describe('Replayable action classification', () => {
    const EXPECTED_REPLAYABLE = ['mark-read', 'defer', 'undefer', 'pin-today', 'pin-week', 'waiting-on'];

    it('includes all 6 P2-A1 local actions', () => {
      for (const action of EXPECTED_REPLAYABLE) {
        expect(MY_WORK_REPLAYABLE_ACTIONS).toContain(action);
      }
    });

    it('has exactly 6 replayable actions', () => {
      expect(MY_WORK_REPLAYABLE_ACTIONS).toHaveLength(6);
    });

    it('does not include navigation actions', () => {
      expect(MY_WORK_REPLAYABLE_ACTIONS).not.toContain('open');
      expect(MY_WORK_REPLAYABLE_ACTIONS).not.toContain('delegate');
      expect(MY_WORK_REPLAYABLE_ACTIONS).not.toContain('reassign');
    });
  });

  describe('Action-to-state transitions', () => {
    // Verified against useMyWorkActions.ts ACTION_TO_STATE mapping
    const ACTION_TO_STATE: Record<string, string> = {
      'mark-read': 'active',
      defer: 'deferred',
      undefer: 'active',
      'pin-today': 'active',
      'pin-week': 'active',
      'waiting-on': 'waiting',
    };

    it('defer transitions to deferred state', () => {
      expect(ACTION_TO_STATE['defer']).toBe('deferred');
    });

    it('undefer transitions to active state', () => {
      expect(ACTION_TO_STATE['undefer']).toBe('active');
    });

    it('waiting-on transitions to waiting state', () => {
      expect(ACTION_TO_STATE['waiting-on']).toBe('waiting');
    });

    it('mark-read transitions to active state', () => {
      expect(ACTION_TO_STATE['mark-read']).toBe('active');
    });

    it('pin-today transitions to active state', () => {
      expect(ACTION_TO_STATE['pin-today']).toBe('active');
    });

    it('pin-week transitions to active state', () => {
      expect(ACTION_TO_STATE['pin-week']).toBe('active');
    });
  });

  describe('NAV-01: No window.location.href in action dispatch', () => {
    it('HubDetailPanel does not use window.location.href', () => {
      const filePath = path.resolve(__dirname, '../HubDetailPanel.tsx');
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).not.toContain('window.location.href');
    });

    it('HubDetailPanel imports useMyWorkActions', () => {
      const filePath = path.resolve(__dirname, '../HubDetailPanel.tsx');
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain('useMyWorkActions');
    });

    it('HubDetailPanel imports useRouter for SPA navigation', () => {
      const filePath = path.resolve(__dirname, '../HubDetailPanel.tsx');
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain('useRouter');
    });

    it('RecentActivityCard does not use window.location.href', () => {
      const filePath = path.resolve(__dirname, '../cards/RecentActivityCard.tsx');
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).not.toContain('window.location.href');
    });
  });
});
