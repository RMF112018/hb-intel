import { describe, expect, it } from 'vitest';
import { extractFindings } from './findingExtraction.js';
import { parseChecklist } from '../parser/parseChecklist.js';
import { buildCleanAllYesWorkbook } from '../test/fixtures.js';

describe('extractFindings', () => {
  it('produces no findings when all responses are yes and no notes', () => {
    const parsed = parseChecklist(buildCleanAllYesWorkbook());
    const findings = extractFindings(parsed);
    expect(findings).toHaveLength(0);
  });

  it('flags No responses and assigns high severity to high-weight sections', () => {
    const parsed = parseChecklist(
      buildCleanAllYesWorkbook({
        noRows: [44, 12], // section 4 (0.18) and section 1 (0.03)
      }),
    );
    const findings = extractFindings(parsed);
    expect(findings).toHaveLength(2);
    const highSection = findings.find((f) => f.checklistRowNumber === 44);
    const lowSection = findings.find((f) => f.checklistRowNumber === 12);
    expect(highSection?.severity).toBe('high');
    expect(lowSection?.severity).toBe('medium');
  });

  it('creates a note-only finding when response is yes but notes are present', () => {
    const parsed = parseChecklist(
      buildCleanAllYesWorkbook({ notes: { 23: 'Observed minor housekeeping issue' } }),
    );
    const findings = extractFindings(parsed);
    expect(findings).toHaveLength(1);
    expect(findings[0].findingType).toBe('note-only');
    expect(findings[0].severity).toBe('info');
  });
});
