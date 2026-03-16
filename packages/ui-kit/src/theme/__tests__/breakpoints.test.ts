import { describe, it, expect } from 'vitest';
import {
  HBC_BREAKPOINT_MOBILE,
  HBC_BREAKPOINT_TABLET,
  HBC_BREAKPOINT_SIDEBAR,
  HBC_BREAKPOINT_CONTENT_MEDIUM,
  HBC_BREAKPOINT_COMPACT_DENSITY,
} from '../breakpoints.js';

describe('Breakpoints (breakpoints.ts)', () => {
  it('all 5 named breakpoints exported', () => {
    expect(HBC_BREAKPOINT_MOBILE).toBeDefined();
    expect(HBC_BREAKPOINT_TABLET).toBeDefined();
    expect(HBC_BREAKPOINT_SIDEBAR).toBeDefined();
    expect(HBC_BREAKPOINT_CONTENT_MEDIUM).toBeDefined();
    expect(HBC_BREAKPOINT_COMPACT_DENSITY).toBeDefined();
  });

  it('breakpoints are in ascending order', () => {
    expect(HBC_BREAKPOINT_MOBILE).toBeLessThan(HBC_BREAKPOINT_TABLET);
    expect(HBC_BREAKPOINT_TABLET).toBeLessThanOrEqual(HBC_BREAKPOINT_SIDEBAR);
    expect(HBC_BREAKPOINT_SIDEBAR).toBeLessThan(HBC_BREAKPOINT_CONTENT_MEDIUM);
    expect(HBC_BREAKPOINT_CONTENT_MEDIUM).toBeLessThan(HBC_BREAKPOINT_COMPACT_DENSITY);
  });

  it('values match PH4C.12 canonical constants', () => {
    expect(HBC_BREAKPOINT_MOBILE).toBe(767);
    expect(HBC_BREAKPOINT_TABLET).toBe(1023);
    expect(HBC_BREAKPOINT_SIDEBAR).toBe(1024);
    expect(HBC_BREAKPOINT_CONTENT_MEDIUM).toBe(1199);
    expect(HBC_BREAKPOINT_COMPACT_DENSITY).toBe(1440);
  });
});
