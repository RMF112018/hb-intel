import { describe, expect, it } from 'vitest';
import {
  fingerprintString,
  fingerprintStringSet,
} from '../foleonFingerprint.js';

describe('foleonFingerprint', () => {
  it('returns the empty-set sentinel for an empty input', () => {
    expect(fingerprintString('')).toBe('00000000');
    expect(fingerprintStringSet([])).toBe('00000000');
  });

  it('produces 8-char lowercase hex', () => {
    const fp = fingerprintString('11111111-1111-1111-1111-111111111111');
    expect(fp).toMatch(/^[0-9a-f]{8}$/);
  });

  it('is deterministic for the same input', () => {
    const a = fingerprintString('https://viewer.us.foleon.com');
    const b = fingerprintString('https://viewer.us.foleon.com');
    expect(a).toBe(b);
  });

  it('differs for different inputs', () => {
    const a = fingerprintString('11111111-1111-1111-1111-111111111111');
    const b = fingerprintString('22222222-2222-2222-2222-222222222222');
    expect(a).not.toBe(b);
  });

  it('stringSet is insensitive to ordering and duplicates', () => {
    const a = fingerprintStringSet(['https://a.example', 'https://b.example']);
    const b = fingerprintStringSet([
      'https://b.example',
      'https://a.example',
      'https://a.example',
    ]);
    expect(a).toBe(b);
  });

  it('stringSet differs when a new allowlist entry is added', () => {
    const a = fingerprintStringSet(['https://a.example']);
    const b = fingerprintStringSet(['https://a.example', 'https://b.example']);
    expect(a).not.toBe(b);
  });
});
