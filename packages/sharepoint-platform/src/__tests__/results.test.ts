import { describe, it, expect } from 'vitest';
import { asError } from '../results.js';

describe('asError', () => {
  it('produces a not-ok envelope carrying the message', () => {
    const r = asError('bad');
    expect(r).toEqual({ ok: false, error: 'bad' });
  });
});
