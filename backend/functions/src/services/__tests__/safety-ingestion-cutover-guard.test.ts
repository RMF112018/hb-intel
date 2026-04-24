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

/**
 * Lock-in invariants: every declared hot-path file must be free of PnP imports
 * (in any form), SharePoint `/_api/` URLs, imports of isolated non-Graph seams,
 * and PnP-behavior registration symbols. The HTTP edge and the SharePoint
 * facade are guarded together so the routes cannot bypass the application
 * service by wiring directly into lower-level Graph seams.
 *
 * See audit report
 * `docs/architecture/plans/MASTER/backend/phase-03/audit-reports/15-Graph-Only-Cutover-Closure.md`.
 */
describe('Safety ingestion cutover guard — static import/seam invariants (lock-in)', () => {
  const SERVICES_DIR = '..';
  const HOT_PATH_FILES: ReadonlyArray<string> = [
    'safety-ingestion-application-service.ts',
    'safety-ingestion-graph-repository.ts',
    'safety-ingestion-graph-data-plane.ts',
    'graph-list-discovery-service.ts',
    'safety-ingestion-preview-evaluator.ts',
  ];
  const ROUTES_FILE = '../../functions/adminApi/safety-record-keeping-routes.ts';
  const FACADE_FILE = 'sharepoint-service.ts';

  const ISOLATED_SEAM_SPECIFIERS: ReadonlyArray<string> = [
    './sharepoint-provisioning-service',
    './legacy-fallback/review-repository',
    './project-requests-repository',
    './viewer-groups-repository',
    './acknowledgment-service',
    './sharepoint-common',
  ];

  const LOWER_LEVEL_GRAPH_SEAM_SPECIFIERS: ReadonlyArray<string> = [
    'safety-ingestion-graph-repository',
    'safety-ingestion-graph-data-plane',
    'graph-list-discovery-service',
  ];

  function escapeRegex(input: string): string {
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function readServiceFile(relative: string): string {
    return readFileSync(resolve(import.meta.dirname, SERVICES_DIR, relative), 'utf8');
  }

  function readRoutesFile(): string {
    return readFileSync(resolve(import.meta.dirname, ROUTES_FILE), 'utf8');
  }

  const PNP_IMPORT_PATTERNS: ReadonlyArray<RegExp> = [
    /from\s+['"]@pnp\//,
    /import\s*\(\s*['"]@pnp\//,
    /require\s*\(\s*['"]@pnp\//,
    /require\s*\.\s*resolve\s*\(\s*['"]@pnp\//,
  ];

  function buildSeamImportPatterns(specifier: string): ReadonlyArray<RegExp> {
    const s = escapeRegex(specifier);
    return [
      new RegExp(`from\\s+['"][^'"]*${s}(?:\\.js)?['"]`),
      new RegExp(`import\\s*\\(\\s*['"][^'"]*${s}(?:\\.js)?['"]`),
      new RegExp(`require\\s*\\(\\s*['"][^'"]*${s}(?:\\.js)?['"]`),
    ];
  }

  // A1 — no @pnp/* imports in any form across every hot-path file.
  it.each(HOT_PATH_FILES)(
    'A1: %s imports no @pnp/* module (ESM static, dynamic import(), require, require.resolve)',
    (file) => {
      const source = readServiceFile(file);
      for (const pattern of PNP_IMPORT_PATTERNS) {
        expect(source, `${file} must not match ${pattern}`).not.toMatch(pattern);
      }
    },
  );

  // A2 — no SharePoint REST /_api/ URLs anywhere in the hot path.
  it.each(HOT_PATH_FILES)('A2: %s contains no SharePoint REST /_api/ URL', (file) => {
    const source = readServiceFile(file);
    expect(source, `${file} must not contain any /_api/ URL`).not.toMatch(/\/_api\//);
  });

  // A3 — no hot-path file imports any isolated non-Graph seam specifier.
  it.each(HOT_PATH_FILES)(
    'A3: %s does not import any isolated non-Graph seam (static, dynamic, or require)',
    (file) => {
      const source = readServiceFile(file);
      for (const specifier of ISOLATED_SEAM_SPECIFIERS) {
        for (const pattern of buildSeamImportPatterns(specifier)) {
          expect(
            source,
            `${file} must not import isolated seam "${specifier}" (pattern: ${pattern})`,
          ).not.toMatch(pattern);
        }
      }
    },
  );

  // A4 — no PnP-behavior registration symbols anywhere in the hot path.
  it.each(HOT_PATH_FILES)(
    'A4: %s contains no PnP-behavior registration symbols',
    (file) => {
      const source = readServiceFile(file);
      expect(
        source,
        `${file} must not reference PnP-behavior registration symbols`,
      ).not.toMatch(/registerPnP|pnpBehavior|PnpBehavior|SPBehavior|GraphBehavior/);
    },
  );

  // A5 — application service retains Graph repository factory + preview gate +
  // Graph-scope token acquisition surface.
  it('A5: application service retains Graph repository factory, preview gate, and MI token surface', () => {
    const source = readServiceFile('safety-ingestion-application-service.ts');
    expect(source).toContain('this.repositoryFactory(');
    expect(source).toContain('evaluatePreviewAndLog');
    expect(source).toContain('SAFETY_INGESTION_COMMIT_NOT_READY');
    // Managed-identity token service is required for Graph-scope acquisition.
    expect(source).toContain('ManagedIdentityTokenService');
    expect(source).toContain('IManagedIdentityTokenService');
  });

  // A6.1 — routes wire ingest/preview/replay via the application service
  // (directly or via the SharePointService facade) and never bypass into
  // lower-level Graph seams, PnP, isolated seams, or /_api/ URLs.
  it('A6.1: safety-record-keeping-routes.ts routes only through SafetyIngestionApplicationService (directly or via SharePointService facade)', () => {
    const source = readRoutesFile();

    const routesThroughIngestionSurface =
      source.includes('SafetyIngestionApplicationService') ||
      source.includes('SharePointService');
    expect(
      routesThroughIngestionSurface,
      'routes must import SafetyIngestionApplicationService or SharePointService (facade)',
    ).toBe(true);

    for (const pattern of PNP_IMPORT_PATTERNS) {
      expect(source, `routes must not match ${pattern}`).not.toMatch(pattern);
    }

    for (const specifier of ISOLATED_SEAM_SPECIFIERS) {
      for (const pattern of buildSeamImportPatterns(specifier)) {
        expect(
          source,
          `routes must not import isolated seam "${specifier}" (pattern: ${pattern})`,
        ).not.toMatch(pattern);
      }
    }

    for (const seam of LOWER_LEVEL_GRAPH_SEAM_SPECIFIERS) {
      for (const pattern of buildSeamImportPatterns(`./${seam}`).concat(
        buildSeamImportPatterns(`/${seam}`),
      )) {
        expect(
          source,
          `routes must not bypass the application service by importing "${seam}" (pattern: ${pattern})`,
        ).not.toMatch(pattern);
      }
    }

    expect(source, 'routes must not contain any /_api/ URL').not.toMatch(/\/_api\//);
  });

  // A6.2 — the SharePointService facade's ingest/preview/replay methods must
  // delegate to SafetyIngestionApplicationService so the route → facade →
  // application-service chain cannot be quietly severed. Scoped to the real
  // `class SharePointService` body so `class MockSharePointService` (a test
  // stub in the same file) is not mistaken for the authoritative facade.
  it('A6.2: SharePointService facade delegates ingest/preview/replay to SafetyIngestionApplicationService', () => {
    const source = readServiceFile(FACADE_FILE);

    expect(source, 'facade must import SafetyIngestionApplicationService').toMatch(
      /SafetyIngestionApplicationService/,
    );

    const facadeStart = source.search(/^export class SharePointService\b/m);
    expect(facadeStart, 'facade must declare `export class SharePointService`').toBeGreaterThanOrEqual(0);
    const mockStart = source.search(/^export class MockSharePointService\b/m);
    const facadeEnd = mockStart > facadeStart ? mockStart : source.length;
    const facadeBody = source.slice(facadeStart, facadeEnd);

    for (const method of ['ingestSafetyWorkbook', 'replaySafetyWorkbook', 'previewSafetyWorkbook']) {
      const start = facadeBody.indexOf(`${method}(`);
      expect(start, `facade must implement ${method}(`).toBeGreaterThan(0);
      const afterStart = facadeBody.slice(start);
      const nextMethodIdx = afterStart.slice(`${method}(`.length).search(
        /\n  (?:public |private |protected )?(?:async |static )?\w+\s*\(/,
      );
      const block = nextMethodIdx > 0
        ? afterStart.slice(0, `${method}(`.length + nextMethodIdx)
        : afterStart;
      expect(
        block,
        `SharePointService.${method} must delegate to the application service (this.ingestion.*)`,
      ).toContain('this.ingestion.');
    }
  });
});

