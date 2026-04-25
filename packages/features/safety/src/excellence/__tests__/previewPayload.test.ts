import { describe, expect, it } from 'vitest';
import { buildPreviewPayload } from '../previewPayload.js';

describe('previewPayload', () => {
  it('marks isPreview true', () => {
    const payload = buildPreviewPayload();
    expect(payload.isPreview).toBe(true);
  });

  it('uses an explicit awaiting-data top-line summary', () => {
    const payload = buildPreviewPayload();
    expect(payload.topLineSummary.statusLabel).toMatch(/awaiting published weekly data/i);
    expect(payload.topLineSummary.summaryText).toMatch(/Safety records are published/);
  });

  it('does not name a real project as a winner', () => {
    const payload = buildPreviewPayload();
    expect(payload.primarySpotlight).toBeUndefined();
    const serialized = JSON.stringify(payload);
    expect(serialized).not.toMatch(/Project \d{3,}/); // no project numbers
  });

  it('includes representative evidence labels', () => {
    const payload = buildPreviewPayload();
    const titles = payload.secondarySignals.map((signal) => signal.title);
    expect(titles).toEqual(
      expect.arrayContaining([
        'Inspection consistency',
        'Corrective-action response',
        'Active field exposure',
        'Finding severity trend',
      ]),
    );
  });

  it('omits CTA when caller supplies no href', () => {
    const payload = buildPreviewPayload();
    expect(payload.sectionCta).toBeUndefined();
  });

  it('attaches honest CTA when caller supplies an href', () => {
    const payload = buildPreviewPayload({
      ctaHref: 'https://example.invalid/safety',
      ctaLabel: 'View Safety records',
    });
    expect(payload.sectionCta).toEqual({
      label: 'View Safety records',
      href: 'https://example.invalid/safety',
    });
  });

  it('reports data confidence as low', () => {
    const payload = buildPreviewPayload();
    expect(payload.dataConfidence).toBe('low');
  });
});
