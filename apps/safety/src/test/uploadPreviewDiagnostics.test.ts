import { describe, expect, it } from 'vitest';
import { formatAuthoritySource, formatMarkerState } from '../pages/previewDiagnostics.js';

describe('preview diagnostics formatter contracts', () => {
  it('formats marker state values for display without rewriting semantics', () => {
    expect(formatMarkerState('markered-valid')).toBe('markered-valid');
    expect(formatMarkerState('markered-invalid')).toBe('markered-invalid');
    expect(formatMarkerState('markerless')).toBe('markerless');
  });

  it('formats parser authority sources with explicit legacy fallback wording', () => {
    expect(formatAuthoritySource('parser-meta')).toBe('parser-meta');
    expect(formatAuthoritySource('named-range')).toBe('named-range');
    expect(formatAuthoritySource('legacy')).toBe('legacy fallback');
    expect(formatAuthoritySource('none')).toBe('none');
  });
});
