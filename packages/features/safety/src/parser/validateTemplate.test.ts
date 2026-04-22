import { describe, expect, it } from 'vitest';
import { createSyntheticWorkbookView } from './workbookView.js';
import { validateTemplate } from './validateTemplate.js';
import { buildCleanAllYesWorkbook } from '../test/fixtures.js';
import { TemplateInvalidError } from '../domain/types.js';

describe('validateTemplate', () => {
  it('accepts a clean v1 workbook', () => {
    const view = buildCleanAllYesWorkbook();
    const result = validateTemplate(view);
    expect(result.templateVersion).toBe('v1');
    expect(result.warnings).toHaveLength(0);
  });

  it('rejects when a required sheet is missing', () => {
    const view = createSyntheticWorkbookView({
      ScoreCard: { A1: 'Construction Site Safety Walk Checklist' },
    });
    expect(() => validateTemplate(view)).toThrow(TemplateInvalidError);
  });

  it('rejects when a response-matrix header drifts', () => {
    const view = buildCleanAllYesWorkbook({ missingResponseHeader: 'score' });
    expect(() => validateTemplate(view)).toThrow(TemplateInvalidError);
  });
});
