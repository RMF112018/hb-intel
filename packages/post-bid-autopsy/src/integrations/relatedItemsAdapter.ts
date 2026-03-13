import type { IAutopsyRecordSnapshot } from '../types/index.js';
import { createAutopsyRedactionMode, redactAutopsyText } from './helpers.js';

export interface IAutopsyRelatedItemProjection {
  readonly itemId: string;
  readonly label: string;
  readonly href: string | null;
  readonly kind: 'finding' | 'similar-pursuit' | 'seeded-output';
  readonly redacted: boolean;
}

export const projectAutopsyToRelatedItems = (
  record: IAutopsyRecordSnapshot
): readonly IAutopsyRelatedItemProjection[] => {
  const mode = createAutopsyRedactionMode(record);

  const findings = record.autopsy.rootCauseTags.map((tag) => ({
    itemId: `related:finding:${record.autopsy.autopsyId}:${tag.tagId}`,
    label: mode === 'full' ? tag.label : redactAutopsyText(record, tag.label),
    href: mode === 'none' ? null : `/related/findings/${tag.normalizedCode}`,
    kind: 'finding' as const,
    redacted: mode !== 'full',
  }));

  const similarPursuit = {
    itemId: `related:similar-pursuit:${record.autopsy.autopsyId}`,
    label:
      mode === 'full'
        ? `Similar pursuit reference for ${record.autopsy.pursuitId}`
        : 'Similar pursuit reference (redacted)',
    href: mode === 'none' ? null : `/related/pursuits/${record.autopsy.pursuitId}`,
    kind: 'similar-pursuit' as const,
    redacted: mode !== 'full',
  };

  const seededOutput = {
    itemId: `related:seeded-output:${record.autopsy.autopsyId}`,
    label: mode === 'full' ? 'Seeded strategic intelligence draft' : 'Seeded output (redacted)',
    href: mode === 'none' ? null : `/related/seeded/${record.autopsy.autopsyId}`,
    kind: 'seeded-output' as const,
    redacted: mode !== 'full',
  };

  return Object.freeze([...findings, similarPursuit, seededOutput]);
};
