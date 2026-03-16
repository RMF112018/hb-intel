import { describe, it, expect } from 'vitest';
import {
  hbcTypeScale,
  display,
  heading1,
  heading2,
  heading3,
  heading4,
  body,
  bodySmall,
  label,
  code,
} from '../typography.js';

describe('Typography scale (typography.ts)', () => {
  it('hbcTypeScale has all 9 intent keys', () => {
    const intentKeys = ['display', 'heading1', 'heading2', 'heading3', 'heading4', 'body', 'bodySmall', 'label', 'code'];
    for (const key of intentKeys) {
      expect(hbcTypeScale[key as keyof typeof hbcTypeScale]).toBeDefined();
    }
  });

  it('each intent level has required properties', () => {
    const levels = [display, heading1, heading2, heading3, heading4, body, bodySmall, label, code];
    for (const level of levels) {
      expect(level).toHaveProperty('fontFamily');
      expect(level).toHaveProperty('fontSize');
      expect(level).toHaveProperty('fontWeight');
      expect(level).toHaveProperty('lineHeight');
    }
  });

  it('deprecated aliases map to correct intent levels', () => {
    expect(hbcTypeScale.displayHero).toBe(display);
    expect(hbcTypeScale.displayLarge).toBe(heading1);
    expect(hbcTypeScale.displayMedium).toBe(heading2);
    expect(hbcTypeScale.titleLarge).toBe(heading3);
    expect(hbcTypeScale.titleMedium).toBe(heading4);
    expect(hbcTypeScale.bodyLarge).toBe(body);
    expect(hbcTypeScale.bodyMedium).toBe(bodySmall);
    expect(hbcTypeScale.caption).toBe(label);
    expect(hbcTypeScale.monospace).toBe(code);
  });

  it('font sizes are in descending order from display to bodySmall', () => {
    const sizes = [display, heading1, heading2, heading3, heading4, body, bodySmall].map(
      (l) => parseFloat(l.fontSize),
    );
    for (let i = 0; i < sizes.length - 1; i++) {
      expect(sizes[i]).toBeGreaterThanOrEqual(sizes[i + 1]);
    }
  });
});
