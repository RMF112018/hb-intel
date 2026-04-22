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

  it('composes seven numbered intake steps (stepNumber 1 through 7) — G-03 Wave 2 revision adds Project + Inspection Details', () => {
    for (const n of [1, 2, 3, 4, 5, 6, 7]) {
      expect(source).toMatch(new RegExp(`stepNumber=\\{${n}\\}`));
    }
  });

  it('G-03 Wave 2 revision: runway includes the SafetyProjectPicker and inspection-details inputs via HbcTextField', () => {
    expect(source).toContain('SafetyProjectPicker');
    // Inspection details are governed HbcTextField inputs (D-07).
    expect(source).toMatch(/HbcTextField[\s\S]*?label="Inspection number"/);
    expect(source).toMatch(/HbcTextField[\s\S]*?label="Inspection date"/);
    expect(source).toMatch(/type="date"/);
    expect(source).toMatch(/data-safety-ui="inspection-details"/);
  });

  it('G-03 Wave 2 revision: submit passes operator-entered authoritative metadata verbatim', () => {
    expect(source).toMatch(/projectNumber:\s*selectedProject\.projectNumber/);
    expect(source).toMatch(/projectNameSnapshot:\s*selectedProject\.projectName/);
    expect(source).toMatch(/inspectionNumber,/);
    expect(source).toMatch(/inspectionDate,/);
    // Calendar-date discipline — no `new Date(inspectionDate)` anywhere.
    expect(source).not.toMatch(/new Date\(inspectionDate\)/);
  });

  it('G-03 Wave 2 revision: mismatch advisory banner renders from ingestion metadata', () => {
    expect(source).toContain('safety-mismatch-advisory');
    expect(source).toContain('metadata-mismatch-advisory');
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
