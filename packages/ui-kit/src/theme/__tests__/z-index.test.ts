import { describe, it, expect } from 'vitest';
import { Z_INDEX } from '../z-index.js';
import type { ZIndexLayer } from '../z-index.js';

describe('Z-index layers (z-index.ts)', () => {
  it('Z_INDEX has all 16 named layers', () => {
    const expectedLayers: ZIndexLayer[] = [
      'content', 'stickyFooter', 'sidebar', 'header', 'bottomNav',
      'popover', 'panelBackdrop', 'panel', 'modalBackdrop', 'modal',
      'tearsheet', 'commandPaletteBackdrop', 'commandPalette', 'toast',
      'spfx', 'connectivityBar',
    ];
    for (const layer of expectedLayers) {
      expect(Z_INDEX[layer]).toBeDefined();
    }
    expect(Object.keys(Z_INDEX)).toHaveLength(16);
  });

  it('layers are in ascending order for stacking correctness', () => {
    expect(Z_INDEX.content).toBeLessThan(Z_INDEX.sidebar);
    expect(Z_INDEX.sidebar).toBeLessThan(Z_INDEX.header);
    expect(Z_INDEX.header).toBeLessThan(Z_INDEX.popover);
    expect(Z_INDEX.popover).toBeLessThan(Z_INDEX.panel);
    expect(Z_INDEX.panel).toBeLessThan(Z_INDEX.modal);
    expect(Z_INDEX.modal).toBeLessThan(Z_INDEX.toast);
    expect(Z_INDEX.toast).toBeLessThan(Z_INDEX.connectivityBar);
  });

  it('modal and tearsheet share the same layer', () => {
    expect(Z_INDEX.modal).toBe(Z_INDEX.tearsheet);
  });
});
