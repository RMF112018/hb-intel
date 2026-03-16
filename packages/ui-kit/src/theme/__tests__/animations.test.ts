import { describe, it, expect } from 'vitest';
import {
  keyframes,
  TRANSITION_FAST,
  TRANSITION_NORMAL,
  TRANSITION_SLOW,
  TIMING,
  transitions,
} from '../animations.js';

describe('Animation/transitions (animations.ts)', () => {
  it('all 9 keyframes defined', () => {
    const expected = [
      'fadeIn', 'slideInRight', 'slideInUp', 'scaleIn',
      'pulse', 'shimmer', 'badgePulse', 'crossfade', 'slideInFromBottom',
    ];
    for (const name of expected) {
      expect(keyframes[name as keyof typeof keyframes]).toBeDefined();
    }
  });

  it('3 transition duration constants have correct values', () => {
    expect(TRANSITION_FAST).toBe('150ms');
    expect(TRANSITION_NORMAL).toBe('250ms');
    expect(TRANSITION_SLOW).toBe('400ms');
  });

  it('TIMING has all 9 named timing constants', () => {
    const expected = [
      'sidebarCollapse', 'headerFade', 'backgroundDim', 'badgePulse',
      'crossfade', 'skeletonSweep', 'focusActivation', 'connectivityExpand', 'buttonLoading',
    ];
    for (const key of expected) {
      expect(TIMING[key as keyof typeof TIMING]).toBeDefined();
    }
  });

  it('transitions object has fast/normal/slow presets', () => {
    expect(transitions.fast).toContain(TRANSITION_FAST);
    expect(transitions.normal).toContain(TRANSITION_NORMAL);
    expect(transitions.slow).toContain(TRANSITION_SLOW);
  });
});
