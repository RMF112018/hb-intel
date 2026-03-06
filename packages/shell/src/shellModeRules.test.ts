import { describe, expect, it } from 'vitest';
import { resolveShellModeRules } from './shellModeRules.js';

describe('resolveShellModeRules', () => {
  it('returns full mode capabilities for pwa', () => {
    const rules = resolveShellModeRules('pwa');
    expect(rules.mode).toBe('full');
    expect(rules.supportsProjectPicker).toBe(true);
    expect(rules.supportsAppLauncher).toBe(true);
    expect(rules.supportsRedirectRestore).toBe(true);
  });

  it('returns simplified restricted capabilities for spfx', () => {
    const rules = resolveShellModeRules('spfx');
    expect(rules.mode).toBe('simplified');
    expect(rules.supportsProjectPicker).toBe(false);
    expect(rules.supportsAppLauncher).toBe(false);
    expect(rules.supportsRedirectRestore).toBe(false);
  });
});
