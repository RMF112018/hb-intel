import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Safety ingestion cutover guard', () => {
  it('routes SharePointService ingestion through Graph repository seam', () => {
    const source = readFileSync(
      resolve(import.meta.dirname, '../sharepoint-service.ts'),
      'utf8',
    );

    const start = source.indexOf('async ingestSafetyWorkbook(');
    const end = source.indexOf('async listExists(', start);
    const block = source.slice(start, end);

    expect(block).toContain('new SafetyIngestionGraphRepository');
    expect(block).not.toContain('SharePointSafetyInspectionRepository');
    expect(block).not.toContain('createSafetyAppOnlySpHttpClient');
  });

  it('Graph ingestion repository does not use REST _api/web/lists endpoints', () => {
    const source = readFileSync(
      resolve(import.meta.dirname, '../safety-ingestion-graph-repository.ts'),
      'utf8',
    );
    expect(source).not.toContain('/_api/web/lists');
  });
});
