import { describe, it, expect } from 'vitest';
import {
  ENTRY_STACK_BUDGETS,
  ENTRY_STACK_SEQUENCE,
  resolveEntryStackBudget,
  getEntryStackBudget,
  type EntryStackDeviceClass,
} from '../entryStack/entryStackContract.js';

describe('entryStackContract', () => {
  describe('ENTRY_STACK_BUDGETS', () => {
    it('defines a budget for every device class', () => {
      const classes: EntryStackDeviceClass[] = [
        'ultrawide-desktop',
        'standard-laptop',
        'tablet-landscape',
        'tablet-portrait',
        'phone-portrait-large',
        'phone-portrait-standard',
        'phone-landscape',
      ];
      for (const dc of classes) {
        const budget = ENTRY_STACK_BUDGETS.find((b) => b.deviceClass === dc);
        expect(budget, `missing budget for ${dc}`).toBeDefined();
      }
    });

    it('enforces firstLaneMustBeginOnFirstView for every budget', () => {
      for (const budget of ENTRY_STACK_BUDGETS) {
        expect(budget.firstLaneMustBeginOnFirstView).toBe(true);
      }
    });

    it('has valid hero height ranges (min < max)', () => {
      for (const budget of ENTRY_STACK_BUDGETS) {
        expect(budget.heroHeight.min).toBeLessThan(budget.heroHeight.max);
      }
    });

    it('has positive spacing gaps', () => {
      for (const budget of ENTRY_STACK_BUDGETS) {
        expect(budget.heroToActionsGap).toBeGreaterThan(0);
        expect(budget.actionsToFirstLaneGap).toBeGreaterThan(0);
      }
    });

    it('has reasonable action visibility caps', () => {
      for (const budget of ENTRY_STACK_BUDGETS) {
        expect(budget.maxVisibleActions).toBeGreaterThanOrEqual(3);
        expect(budget.maxVisibleActions).toBeLessThanOrEqual(6);
      }
    });

    it('only allows 2-column first lane on desktop states', () => {
      for (const budget of ENTRY_STACK_BUDGETS) {
        if (
          budget.deviceClass === 'ultrawide-desktop' ||
          budget.deviceClass === 'standard-laptop'
        ) {
          expect(budget.firstLaneColumns).toBe(2);
        } else {
          expect(budget.firstLaneColumns).toBe(1);
        }
      }
    });
  });

  describe('ENTRY_STACK_SEQUENCE', () => {
    it('defines the canonical hero → actions → first-lane order', () => {
      expect(ENTRY_STACK_SEQUENCE).toEqual(['hero', 'actions', 'first-lane']);
    });
  });

  describe('resolveEntryStackBudget', () => {
    it('returns ultrawide-desktop for width >= 1600', () => {
      expect(resolveEntryStackBudget({ width: 1600 }).deviceClass).toBe('ultrawide-desktop');
      expect(resolveEntryStackBudget({ width: 2200 }).deviceClass).toBe('ultrawide-desktop');
    });

    it('returns standard-laptop for 1180–1599', () => {
      expect(resolveEntryStackBudget({ width: 1180 }).deviceClass).toBe('standard-laptop');
      expect(resolveEntryStackBudget({ width: 1400 }).deviceClass).toBe('standard-laptop');
    });

    it('returns tablet-landscape for 980–1179', () => {
      expect(resolveEntryStackBudget({ width: 980 }).deviceClass).toBe('tablet-landscape');
      expect(resolveEntryStackBudget({ width: 1100 }).deviceClass).toBe('tablet-landscape');
    });

    it('returns tablet-portrait for 720–979', () => {
      expect(resolveEntryStackBudget({ width: 720 }).deviceClass).toBe('tablet-portrait');
      expect(resolveEntryStackBudget({ width: 900 }).deviceClass).toBe('tablet-portrait');
    });

    it('returns phone-portrait-large for 430–719', () => {
      expect(resolveEntryStackBudget({ width: 430 }).deviceClass).toBe('phone-portrait-large');
      expect(resolveEntryStackBudget({ width: 600 }).deviceClass).toBe('phone-portrait-large');
    });

    it('returns phone-portrait-standard for 375–429', () => {
      expect(resolveEntryStackBudget({ width: 375 }).deviceClass).toBe('phone-portrait-standard');
      expect(resolveEntryStackBudget({ width: 420 }).deviceClass).toBe('phone-portrait-standard');
    });

    it('falls back to phone-portrait-standard for very narrow widths', () => {
      expect(resolveEntryStackBudget({ width: 300 }).deviceClass).toBe('phone-portrait-standard');
      expect(resolveEntryStackBudget({ width: 200 }).deviceClass).toBe('phone-portrait-standard');
    });

    it('returns phone-landscape when height-constrained and wide enough', () => {
      expect(resolveEntryStackBudget({ width: 800, height: 400 }).deviceClass).toBe(
        'phone-landscape',
      );
      expect(resolveEntryStackBudget({ width: 960, height: 450 }).deviceClass).toBe(
        'phone-landscape',
      );
    });

    it('does not return phone-landscape when height is sufficient', () => {
      expect(resolveEntryStackBudget({ width: 800, height: 600 }).deviceClass).not.toBe(
        'phone-landscape',
      );
    });

    it('does not return phone-landscape when width is below 480', () => {
      expect(resolveEntryStackBudget({ width: 400, height: 400 }).deviceClass).not.toBe(
        'phone-landscape',
      );
    });

    it('ignores height when undefined (no height constraint)', () => {
      expect(resolveEntryStackBudget({ width: 800 }).deviceClass).toBe('tablet-portrait');
    });
  });

  describe('getEntryStackBudget', () => {
    it('returns the budget for a known device class', () => {
      const budget = getEntryStackBudget('standard-laptop');
      expect(budget).toBeDefined();
      expect(budget!.heroHeight.min).toBe(300);
      expect(budget!.heroHeight.max).toBe(340);
    });

    it('returns undefined for an unknown device class', () => {
      expect(getEntryStackBudget('unknown' as EntryStackDeviceClass)).toBeUndefined();
    });
  });

  describe('breakpoint spec alignment', () => {
    it('ultrawide hero height matches spec (420–460)', () => {
      const b = getEntryStackBudget('ultrawide-desktop')!;
      expect(b.heroHeight).toEqual({ min: 420, max: 460 });
    });

    it('standard-laptop hero height matches re-budgeted spec (300–340)', () => {
      const b = getEntryStackBudget('standard-laptop')!;
      expect(b.heroHeight).toEqual({ min: 300, max: 340 });
    });

    it('tablet-landscape hero height matches spec (280–320)', () => {
      const b = getEntryStackBudget('tablet-landscape')!;
      expect(b.heroHeight).toEqual({ min: 280, max: 320 });
    });

    it('tablet-portrait hero height matches spec (240–280)', () => {
      const b = getEntryStackBudget('tablet-portrait')!;
      expect(b.heroHeight).toEqual({ min: 240, max: 280 });
    });

    it('phone-portrait-large hero height matches spec (200–220)', () => {
      const b = getEntryStackBudget('phone-portrait-large')!;
      expect(b.heroHeight).toEqual({ min: 200, max: 220 });
    });

    it('phone-portrait-standard hero height matches spec (190–210)', () => {
      const b = getEntryStackBudget('phone-portrait-standard')!;
      expect(b.heroHeight).toEqual({ min: 190, max: 210 });
    });

    it('phone-landscape hero height matches spec (120–160)', () => {
      const b = getEntryStackBudget('phone-landscape')!;
      expect(b.heroHeight).toEqual({ min: 120, max: 160 });
    });

    it('ultrawide spacing matches spec (hero→actions 24, actions→lane 28)', () => {
      const b = getEntryStackBudget('ultrawide-desktop')!;
      expect(b.heroToActionsGap).toBe(24);
      expect(b.actionsToFirstLaneGap).toBe(28);
    });

    it('action visibility caps match spec per device class', () => {
      expect(getEntryStackBudget('ultrawide-desktop')!.maxVisibleActions).toBe(6);
      expect(getEntryStackBudget('standard-laptop')!.maxVisibleActions).toBe(5);
      expect(getEntryStackBudget('tablet-landscape')!.maxVisibleActions).toBe(5);
      expect(getEntryStackBudget('tablet-portrait')!.maxVisibleActions).toBe(4);
      expect(getEntryStackBudget('phone-portrait-large')!.maxVisibleActions).toBe(4);
      expect(getEntryStackBudget('phone-portrait-standard')!.maxVisibleActions).toBe(4);
      expect(getEntryStackBudget('phone-landscape')!.maxVisibleActions).toBe(4);
    });

    it('first-lane column rules align with shell entry states', () => {
      expect(getEntryStackBudget('ultrawide-desktop')!.firstLaneColumns).toBe(2);
      expect(getEntryStackBudget('standard-laptop')!.firstLaneColumns).toBe(2);
      expect(getEntryStackBudget('tablet-landscape')!.firstLaneColumns).toBe(1);
      expect(getEntryStackBudget('tablet-portrait')!.firstLaneColumns).toBe(1);
      expect(getEntryStackBudget('phone-portrait-large')!.firstLaneColumns).toBe(1);
      expect(getEntryStackBudget('phone-portrait-standard')!.firstLaneColumns).toBe(1);
      expect(getEntryStackBudget('phone-landscape')!.firstLaneColumns).toBe(1);
    });
  });
});
