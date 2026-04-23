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

  it('routes SharePointService replay through Graph repository seam', () => {
    const source = readFileSync(
      resolve(import.meta.dirname, '../sharepoint-service.ts'),
      'utf8',
    );
    const start = source.indexOf('async replaySafetyWorkbook(');
    const end = source.indexOf('async previewSafetyWorkbook(', start);
    const block = source.slice(start, end);

    expect(block).toContain('new SafetyIngestionGraphRepository');
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

  it('SharePointService preview path routes through the Graph repository seam (no REST/PnP)', () => {
    const source = readFileSync(
      resolve(import.meta.dirname, '../sharepoint-service.ts'),
      'utf8',
    );
    const start = source.indexOf('async previewSafetyWorkbook(');
    // Preview is the last Safety hot-path method in this class — scan to
    // the closing brace of the method rather than another method marker.
    const evaluateIdx = source.indexOf('private async evaluatePreviewAndLog(', start);
    expect(start).toBeGreaterThan(0);
    expect(evaluateIdx).toBeGreaterThan(start);
    const block = source.slice(start, evaluateIdx);

    // Preview must instantiate the Graph repository and must not fall back
    // to the retired SharePoint REST/PnP Safety ingestion seam.
    expect(block).toContain('new SafetyIngestionGraphRepository');
    expect(block).toContain('evaluatePreviewAndLog');
    expect(block).not.toContain('SharePointSafetyInspectionRepository');
    expect(block).not.toContain('createSafetyAppOnlySpHttpClient');
    expect(block).not.toContain('/_api/web/lists');
  });

  it('Safety ingest/preview/replay emit a graph-only entry event stamped with the backend version', () => {
    const source = readFileSync(
      resolve(import.meta.dirname, '../sharepoint-service.ts'),
      'utf8',
    );

    // One entry event per hot-path method, all marked codePath:'graph-only'.
    const entryMatches = source.match(/safety\.ingestion\.entry/g) ?? [];
    expect(entryMatches.length).toBeGreaterThanOrEqual(3);
    // Stamp comes from SAFETY_INGESTION_BACKEND_VERSION, not a literal.
    expect(source).toContain('SAFETY_INGESTION_BACKEND_VERSION');
    expect(source).toContain("codePath: 'graph-only'");
  });

  it('Safety overlay resolution emits a classified failure event before rethrowing', () => {
    const source = readFileSync(
      resolve(import.meta.dirname, '../sharepoint-service.ts'),
      'utf8',
    );
    const start = source.indexOf('private async resolveSafetyGuidOverlay(');
    const end = source.indexOf('private async validateSafetyIngestionContracts(', start);
    expect(start).toBeGreaterThan(0);
    expect(end).toBeGreaterThan(start);
    const block = source.slice(start, end);

    // The overlay resolution must emit the classified failure telemetry
    // on catch — separating GUID-discovery 401s from later read 401s in
    // live logs.
    expect(block).toContain('safety.ingestion.graph.overlay.failed');
    expect(block).toContain('classifyGraphThrown');
    expect(block).toContain('throw err');
  });
});
