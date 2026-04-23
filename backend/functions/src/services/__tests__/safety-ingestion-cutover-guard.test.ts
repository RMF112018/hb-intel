import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Cutover guard invariants for the Graph-only Safety ingestion path.
 *
 * After the backend service decomposition, the Safety ingestion hot-paths
 * (ingest / preview / replay) live on `SafetyIngestionApplicationService`
 * and the SharePointService is a thin facade. These checks still assert the
 * same cutover invariants, but against the authoritative file.
 */
describe('Safety ingestion cutover guard', () => {
  it('routes Safety ingestion through Graph repository seam', () => {
    const source = readFileSync(
      resolve(import.meta.dirname, '../safety-ingestion-application-service.ts'),
      'utf8',
    );

    const start = source.indexOf('async ingestSafetyWorkbook(');
    const end = source.indexOf('async replaySafetyWorkbook(', start);
    const block = source.slice(start, end);

    expect(block).toContain('this.repositoryFactory(');
    expect(block).toContain('evaluatePreviewAndLog');
    expect(block).toContain('SAFETY_INGESTION_COMMIT_NOT_READY');
    expect(block).not.toContain('SharePointSafetyInspectionRepository');
    expect(block).not.toContain('createSafetyAppOnlySpHttpClient');
  });

  it('evaluates preview gate before Graph commit invocation', () => {
    const source = readFileSync(
      resolve(import.meta.dirname, '../safety-ingestion-application-service.ts'),
      'utf8',
    );
    const start = source.indexOf('async ingestSafetyWorkbook(');
    const end = source.indexOf('async replaySafetyWorkbook(', start);
    const block = source.slice(start, end);

    const previewIndex = block.indexOf('evaluatePreviewAndLog');
    const ingestIndex = block.indexOf('repo.ingestWorkbook');
    expect(previewIndex).toBeGreaterThan(0);
    expect(ingestIndex).toBeGreaterThan(previewIndex);
    expect(block).toContain('if (!preview.commitReadiness)');
  });

  it('routes Safety replay through Graph repository seam', () => {
    const source = readFileSync(
      resolve(import.meta.dirname, '../safety-ingestion-application-service.ts'),
      'utf8',
    );
    const start = source.indexOf('async replaySafetyWorkbook(');
    const end = source.indexOf('async previewSafetyWorkbook(', start);
    const block = source.slice(start, end);

    expect(block).toContain('this.repositoryFactory(');
    expect(block).toContain('repo.replayIngestion');
    expect(block).toContain('emitSafetyIngestionEvent');
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

  it('Graph ingestion repository passes telemetry observer into runIngestionPipeline', () => {
    const source = readFileSync(
      resolve(import.meta.dirname, '../safety-ingestion-graph-repository.ts'),
      'utf8',
    );
    expect(source).toContain('telemetryObserver: observer');
    expect(source).toContain('safety.ingestion.pipeline.stage');
  });

  it('Safety preview path routes through the Graph repository seam (no REST/PnP)', () => {
    const source = readFileSync(
      resolve(import.meta.dirname, '../safety-ingestion-application-service.ts'),
      'utf8',
    );
    const start = source.indexOf('async previewSafetyWorkbook(');
    const evaluateIdx = source.indexOf('private async evaluatePreviewAndLog(', start);
    expect(start).toBeGreaterThan(0);
    expect(evaluateIdx).toBeGreaterThan(start);
    const block = source.slice(start, evaluateIdx);

    expect(block).toContain('this.repositoryFactory(');
    expect(block).toContain('evaluatePreviewAndLog');
    expect(block).not.toContain('SharePointSafetyInspectionRepository');
    expect(block).not.toContain('createSafetyAppOnlySpHttpClient');
    expect(block).not.toContain('/_api/web/lists');
  });

  it('Safety ingest/preview/replay emit a graph-only entry event stamped with the backend version', () => {
    const source = readFileSync(
      resolve(import.meta.dirname, '../safety-ingestion-application-service.ts'),
      'utf8',
    );

    const entryMatches = source.match(/safety\.ingestion\.entry/g) ?? [];
    expect(entryMatches.length).toBeGreaterThanOrEqual(3);
    expect(source).toContain('SAFETY_INGESTION_BACKEND_VERSION');
    expect(source).toContain("codePath: 'graph-only'");
  });

  it('Safety overlay resolution emits a classified failure event before rethrowing', () => {
    const source = readFileSync(
      resolve(import.meta.dirname, '../safety-ingestion-application-service.ts'),
      'utf8',
    );
    const start = source.indexOf('private async resolveSafetyGuidOverlay(');
    expect(start).toBeGreaterThan(0);
    const block = source.slice(start);

    expect(block).toContain('safety.ingestion.graph.overlay.failed');
    expect(block).toContain('classifyGraphThrown');
    expect(block).toContain('throw err');
  });
});
