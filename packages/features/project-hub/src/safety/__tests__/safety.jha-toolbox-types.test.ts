import { describe, expect, it } from 'vitest';

import {
  PROMPT_CLOSURE_TYPES,
  PROMPT_CLOSURE_TYPE_LABELS,
  TOOLBOX_WORK_QUEUE_TRIGGERS,
  SCHEDULE_LOOKAHEAD_DAYS,
  HIGH_RISK_PROMPT_CLOSURE_DAYS,
  GOVERNED_TALK_DRAFT_ESCALATION_DAYS,
} from '../../index.js';

describe('P3-E8-T06 JHA/toolbox contract stability', () => {
  describe('Enum arrays', () => {
    it('PROMPT_CLOSURE_TYPES has 3 values', () => {
      expect(PROMPT_CLOSURE_TYPES).toHaveLength(3);
    });
  });

  describe('Work queue triggers', () => {
    it('defines 3 triggers per §5.5', () => {
      expect(TOOLBOX_WORK_QUEUE_TRIGGERS).toHaveLength(3);
    });
  });

  describe('Schedule integration', () => {
    it('lookahead is 14 days per §6', () => {
      expect(SCHEDULE_LOOKAHEAD_DAYS).toBe(14);
    });
  });

  describe('Closure thresholds', () => {
    it('high-risk prompt closure is 7 days', () => {
      expect(HIGH_RISK_PROMPT_CLOSURE_DAYS).toBe(7);
    });

    it('governed talk draft escalation is 3 days', () => {
      expect(GOVERNED_TALK_DRAFT_ESCALATION_DAYS).toBe(3);
    });
  });

  describe('Label maps', () => {
    it('closure type labels cover all types', () => {
      for (const t of PROMPT_CLOSURE_TYPES) {
        expect(PROMPT_CLOSURE_TYPE_LABELS[t]).toBeTruthy();
      }
    });
  });
});
