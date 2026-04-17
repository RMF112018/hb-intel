import { describe, expect, it } from 'vitest';
import {
  resolveProjectSitesContainerState,
  resolveProjectSitesLayoutMode,
} from './projectSitesLayoutMode.js';

describe('projectSitesLayoutMode', () => {
  it('resolves wide mode at 1180+ width when height is not short', () => {
    expect(resolveProjectSitesLayoutMode({ width: 1180, height: 700 })).toBe('wide');
    expect(resolveProjectSitesLayoutMode({ width: 1600, height: 900 })).toBe('wide');
  });

  it('resolves medium mode between 820 and 1179 width when height is not short', () => {
    expect(resolveProjectSitesLayoutMode({ width: 820, height: 700 })).toBe('medium');
    expect(resolveProjectSitesLayoutMode({ width: 1000, height: 800 })).toBe('medium');
    expect(resolveProjectSitesLayoutMode({ width: 1179, height: 700 })).toBe('medium');
  });

  it('resolves compact mode below 820 width', () => {
    expect(resolveProjectSitesLayoutMode({ width: 819, height: 700 })).toBe('compact');
    expect(resolveProjectSitesLayoutMode({ width: 375, height: 760 })).toBe('compact');
  });

  it('forces compact mode for short-height states even when width is wide', () => {
    expect(resolveProjectSitesLayoutMode({ width: 1600, height: 559 })).toBe('compact');

    const state = resolveProjectSitesContainerState({ width: 1600, height: 559 });
    expect(state.mode).toBe('compact');
    expect(state.isShortHeight).toBe(true);
  });
});
