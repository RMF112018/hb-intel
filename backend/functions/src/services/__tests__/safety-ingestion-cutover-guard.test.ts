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
    expect(block).toContain('evaluatePreviewAndLog');
    expect(block).toContain('SAFETY_INGESTION_COMMIT_NOT_READY');
    expect(block).not.toContain('SharePointSafetyInspectionRepository');
    expect(block).not.toContain('createSafetyAppOnlySpHttpClient');
  });

  it('evaluates preview gate before Graph commit invocation', () => {
    const source = readFileSync(
      resolve(import.meta.dirname, '../sharepoint-service.ts'),
      'utf8',
    );
    const start = source.indexOf('async ingestSafetyWorkbook(');
    const end = source.indexOf('async previewSafetyWorkbook(', start);
    const block = source.slice(start, end);

    const previewIndex = block.indexOf('evaluatePreviewAndLog');
    const ingestIndex = block.indexOf('repo.ingestWorkbook');
    expect(previewIndex).toBeGreaterThan(0);
    expect(ingestIndex).toBeGreaterThan(previewIndex);
    expect(block).toContain('if (!preview.commitReadiness)');
  });

  it('Graph ingestion repository does not use REST _api/web/lists endpoints', () => {
    const source = readFileSync(
      resolve(import.meta.dirname, '../safety-ingestion-graph-repository.ts'),
      'utf8',
    );
    expect(source).not.toContain('/_api/web/lists');
  });
});
