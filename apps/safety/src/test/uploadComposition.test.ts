/**
 * Phase-04 audit G-03 — structural guard (supporting, not primary).
 *
 * Asserts the UploadPage composes the five intake zones and the outcome
 * zone. Primary behavioral proof lives in the per-primitive tests
 * (safetyIngestionOutcome, safetyIntakeReadiness, safetyFileInput).
 */
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(
  path.resolve(__dirname, '../pages/UploadPage.tsx'),
  'utf-8',
);

describe('UploadPage — intake-runway structural composition', () => {
  it('renders an intake runway container', () => {
    expect(source).toMatch(/className="safety-intake-runway"/);
  });

  it('composes five numbered intake steps (stepNumber 1 through 5)', () => {
    for (const n of [1, 2, 3, 4, 5]) {
      expect(source).toMatch(new RegExp(`stepNumber=\\{${n}\\}`));
    }
  });

  it('adopts the authored readiness primitive (SafetyIntakeReadiness)', () => {
    expect(source).toContain('SafetyIntakeReadiness');
  });

  it('outcome zone uses SafetyIngestionOutcome rather than a single generic HbcBanner', () => {
    expect(source).toContain('SafetyIngestionOutcome');
    // The legacy IngestionResultBanner helper must be gone.
    expect(source).not.toContain('IngestionResultBanner');
  });

  it('mutation-level transport error still routes through SafetyStatusPanel intent="partial-failure"', () => {
    expect(source).toMatch(/<SafetyStatusPanel[\s\S]*?intent="partial-failure"/);
  });

  it('periods-blocked posture still uses SafetyStatusPanel intent="blocked" inside the step', () => {
    expect(source).toMatch(/<SafetyStatusPanel[\s\S]*?intent="blocked"/);
  });

  it('WorkspacePageShell is retained as the outer page shell', () => {
    expect(source).toContain('<WorkspacePageShell');
  });
});
