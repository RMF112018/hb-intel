import { describe, expect, it } from 'vitest';
import {
  GraphBoundedQueryTruncatedError,
  GraphConcurrencyError,
  GraphRequestError,
} from '../safety-ingestion-graph-data-plane.js';
import { SharePointTokenAcquisitionError } from '../managed-identity-token-service.js';
import {
  classifyIngestionFailure,
  derivePreviewDiagnosticSummary,
} from '../safety-ingestion-failure-classifier.js';
import { ReportingPeriodContractError } from '../safety-reporting-period-contract.js';

function makeGraphError(
  operation: string,
  path: string,
  status: number,
  body: string,
): GraphRequestError {
  const response = new Response(body, { status });
  return new GraphRequestError(operation, path, response, body);
}

describe('classifyIngestionFailure', () => {
  it('maps 401 Graph errors to permission-denied-401 with permission authLane', () => {
    const err = makeGraphError('list-items', '/sites/abc/lists/xyz/items', 401, 'unauthorized');
    const result = classifyIngestionFailure(err, 'SAFETY_INGESTION_FAILED');
    expect(result.failureClass).toBe('permission-denied-401');
    expect(result.errorCode).toBe('SAFETY_INGESTION_GRAPH_AUTH_FAILED');
    expect(result.graphContext?.authLane).toBe('permission');
    expect(result.graphContext?.statusCode).toBe(401);
    expect(result.graphContext?.operation).toBe('list-items');
    expect(result.graphContext?.statusFamily).toBe('4xx');
  });

  it('maps 403 to permission-denied-403 with discriminating code', () => {
    const err = makeGraphError('create-item', '/sites/abc/lists/xyz/items', 403, 'forbidden');
    const result = classifyIngestionFailure(err, 'SAFETY_INGESTION_FAILED');
    expect(result.failureClass).toBe('permission-denied-403');
    expect(result.errorCode).toBe('SAFETY_INGESTION_GRAPH_PERMISSION_DENIED');
    expect(result.graphContext?.authLane).toBe('permission');
  });

  it('discriminates 404 site/list/item binding errors by path lane', () => {
    const siteErr = makeGraphError('resolve-site-id', '/sites/contoso.sharepoint.com:/sites/Missing', 404, '');
    const siteRes = classifyIngestionFailure(siteErr, 'SAFETY_INGESTION_FAILED');
    expect(siteRes.failureClass).toBe('site-binding-error');
    expect(siteRes.errorCode).toBe('SAFETY_INGESTION_GRAPH_SITE_NOT_FOUND');
    expect(siteRes.graphContext?.authLane).toBe('binding');

    const listErr = makeGraphError('list-items', '/sites/site-1/lists/bad-list', 404, '');
    const listRes = classifyIngestionFailure(listErr, 'SAFETY_INGESTION_FAILED');
    expect(listRes.failureClass).toBe('list-binding-error');
    expect(listRes.errorCode).toBe('SAFETY_INGESTION_GRAPH_LIST_NOT_FOUND');

    const itemErr = makeGraphError(
      'get-item',
      '/sites/site-1/lists/list-1/items/99',
      404,
      JSON.stringify({ error: { code: 'itemNotFound' } }),
    );
    const itemRes = classifyIngestionFailure(itemErr, 'SAFETY_INGESTION_FAILED');
    expect(itemRes.failureClass).toBe('item-binding-error');
    expect(itemRes.errorCode).toBe('SAFETY_INGESTION_GRAPH_ITEM_NOT_FOUND');
    expect(itemRes.graphContext?.graphErrorCode).toBe('itemNotFound');
  });

  it('maps 429 rate-limited to throttle authLane', () => {
    const err = makeGraphError('list-items', '/sites/abc/lists/xyz/items', 429, 'throttled');
    const result = classifyIngestionFailure(err, 'SAFETY_INGESTION_FAILED');
    expect(result.failureClass).toBe('rate-limited');
    expect(result.graphContext?.authLane).toBe('throttle');
  });

  it('maps 5xx to transport-error', () => {
    const err = makeGraphError('list-items', '/sites/abc/lists/xyz/items', 503, 'unavailable');
    const result = classifyIngestionFailure(err, 'SAFETY_INGESTION_FAILED');
    expect(result.failureClass).toBe('transport-error');
    expect(result.errorCode).toBe('SAFETY_INGESTION_GRAPH_TRANSPORT_ERROR');
    expect(result.graphContext?.statusFamily).toBe('5xx');
    expect(result.graphContext?.authLane).toBe('transport');
  });

  it('maps GraphConcurrencyError to concurrency-conflict regardless of status', () => {
    const response = new Response('conflict', { status: 409 });
    const err = new GraphConcurrencyError('update-item-with-concurrency', '/sites/abc/lists/xyz/items/1', response, 'conflict');
    const result = classifyIngestionFailure(err, 'SAFETY_INGESTION_FAILED');
    expect(result.failureClass).toBe('concurrency-conflict');
    expect(result.errorCode).toBe('SAFETY_INGESTION_GRAPH_CONCURRENCY_CONFLICT');
  });

  it('maps GraphBoundedQueryTruncatedError to bounded-query-truncated', () => {
    const err = new GraphBoundedQueryTruncatedError('duplicate-detection', 'list-1', 50, 50);
    const result = classifyIngestionFailure(err, 'SAFETY_INGESTION_FAILED');
    expect(result.failureClass).toBe('bounded-query-truncated');
    expect(result.errorCode).toBe('SAFETY_INGESTION_GRAPH_BOUNDED_QUERY_TRUNCATED');
  });

  it('maps identity-not-acquired errors via classifyGraphThrown', () => {
    const err = new Error('Failed to acquire managed identity token');
    const result = classifyIngestionFailure(err, 'SAFETY_INGESTION_FAILED');
    expect(result.failureClass).toBe('identity-not-acquired');
    expect(result.errorCode).toBe('SAFETY_INGESTION_GRAPH_IDENTITY_NOT_ACQUIRED');
    expect(result.graphContext?.authLane).toBe('identity');
  });

  it('maps SharePointTokenAcquisitionError to token-acquisition-error', () => {
    const err = new SharePointTokenAcquisitionError({
      siteUrl: 'https://contoso.sharepoint.com/sites/Safety',
      scope: 'https://contoso.sharepoint.com/.default',
      message: 'Token acquisition failed',
      remediation: 'Grant app-only access.',
    });
    const result = classifyIngestionFailure(err, 'SAFETY_INGESTION_FAILED');
    expect(result.failureClass).toBe('token-acquisition-error');
    expect(result.errorCode).toBe('SHAREPOINT_TOKEN_ACQUISITION_FAILED');
    expect(result.graphContext?.authLane).toBe('identity');
  });

  it('maps ReportingPeriodContractError to item-binding-error with explicit code', () => {
    const err = new ReportingPeriodContractError(
      'SAFETY_REPORTING_PERIOD_ID_MISMATCH',
      'Mismatch.',
      { requestedId: 'period-8', reportingPeriodSpItemId: 9 },
    );
    const result = classifyIngestionFailure(err, 'SAFETY_INGESTION_FAILED');
    expect(result.failureClass).toBe('item-binding-error');
    expect(result.errorCode).toBe('SAFETY_REPORTING_PERIOD_ID_MISMATCH');
    expect(result.graphContext?.authLane).toBe('binding');
  });

  it('maps unknown errors to unknown with fallback code', () => {
    const err = new Error('mystery');
    const result = classifyIngestionFailure(err, 'SAFETY_INGESTION_FAILED');
    expect(result.failureClass).toBe('unknown');
    expect(result.errorCode).toBe('SAFETY_INGESTION_FAILED');
  });

  it('strips OData query strings from pathSummary (no user-data leak)', () => {
    const err = makeGraphError(
      'list-items',
      "/sites/abc/lists/xyz/items?$filter=fields/Title eq 'user-sensitive'&$top=1",
      403,
      '',
    );
    const result = classifyIngestionFailure(err, 'SAFETY_INGESTION_FAILED');
    expect(result.graphContext?.pathSummary).toBe('/sites/abc/lists/xyz/items');
    expect(result.graphContext?.pathSummary).not.toContain('user-sensitive');
  });
});

describe('derivePreviewDiagnosticSummary', () => {
  const baseTemplate = {
    valid: true,
    templateVersion: 'SafetyChecklist_v1',
    parserContractVersion: 'parse-first-2026-04',
  };

  it('reports commit-ready when blockingErrors empty', () => {
    const summary = derivePreviewDiagnosticSummary({
      commitReadiness: true,
      blockingErrors: [],
      warnings: [],
      template: baseTemplate,
      metadata: {},
      reportingPeriod: { resolved: true, dateInRange: true },
      projectResolution: { resolved: true },
      duplicateRisk: { confidence: 'none' },
    });
    expect(summary.commitReady).toBe(true);
    expect(summary.failureClass).toBe('none');
    expect(summary.checks.parserContractMarkerState).toBe('markered-valid');
  });

  it('uses template-incompatible precedence over period/project issues', () => {
    const summary = derivePreviewDiagnosticSummary({
      commitReadiness: false,
      blockingErrors: [
        { code: 'TEMPLATE_INCOMPATIBLE' },
        { code: 'REPORTING_PERIOD_MISMATCH' },
        { code: 'PROJECT_UNRESOLVED' },
      ],
      warnings: [],
      template: { ...baseTemplate, valid: false },
      projectResolution: { resolved: false },
    });
    expect(summary.failureClass).toBe('template-incompatible');
  });

  it('classifies parse-failure when PARSE_FAILED present and template ok', () => {
    const summary = derivePreviewDiagnosticSummary({
      commitReadiness: false,
      blockingErrors: [{ code: 'PARSE_FAILED' }],
      warnings: [],
      template: baseTemplate,
      projectResolution: { resolved: false },
    });
    expect(summary.failureClass).toBe('parse-failure');
    expect(summary.checks.parseSucceeded).toBe(false);
  });

  it('classifies duplicate-supersession-risk as its own class', () => {
    const summary = derivePreviewDiagnosticSummary({
      commitReadiness: false,
      blockingErrors: [{ code: 'DUPLICATE_SUPERSESSION_RISK' }],
      warnings: [],
      template: baseTemplate,
      metadata: {},
      reportingPeriod: { resolved: true, dateInRange: true },
      projectResolution: { resolved: true },
      duplicateRisk: { confidence: 'high-confidence-duplicate' },
    });
    expect(summary.failureClass).toBe('duplicate-supersession-risk');
    expect(summary.checks.duplicateConfidence).toBe('high-confidence-duplicate');
  });

  it('records markerless marker state when both versions are null', () => {
    const summary = derivePreviewDiagnosticSummary({
      commitReadiness: true,
      blockingErrors: [],
      warnings: [],
      template: { valid: true, templateVersion: null, parserContractVersion: null },
      metadata: {},
      reportingPeriod: { resolved: true, dateInRange: true },
      projectResolution: { resolved: true },
    });
    expect(summary.checks.parserContractMarkerState).toBe('markerless');
  });

  it('preserves blockingCodes and warningCodes ordering', () => {
    const summary = derivePreviewDiagnosticSummary({
      commitReadiness: false,
      blockingErrors: [{ code: 'A' }, { code: 'B' }],
      warnings: [{ code: 'W1' }, { code: 'W2' }],
      template: baseTemplate,
      projectResolution: { resolved: false },
    });
    expect(summary.blockingCodes).toEqual(['A', 'B']);
    expect(summary.warningCodes).toEqual(['W1', 'W2']);
  });
});
