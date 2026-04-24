import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROUTE_FILE = resolve(import.meta.dirname, 'foleon-routes.ts');
const INDEX_FILE = resolve(import.meta.dirname, '../../index.ts');
const AUTHZ_FILE = resolve(import.meta.dirname, '../../middleware/authorization.ts');

describe('Foleon connector backend route wiring', () => {
  const source = readFileSync(ROUTE_FILE, 'utf-8');
  const indexSource = readFileSync(INDEX_FILE, 'utf-8');
  const authzSource = readFileSync(AUTHZ_FILE, 'utf-8');

  it('registers the governed content management route map', () => {
    expect(source).toContain("route: 'foleon/content'");
    expect(source).toContain("route: 'foleon/content/{id}'");
    expect(source).toContain("route: 'foleon/content/{id}/validate'");
    expect(source).toContain("route: 'foleon/content/{id}/publish'");
    expect(source).toContain("route: 'foleon/content/{id}/suppress'");
    expect(source).toContain("methods: ['PATCH']");
  });

  it('registers placement, sync, and SharePoint proof routes', () => {
    expect(source).toContain("route: 'foleon/placements'");
    expect(source).toContain("route: 'foleon/placements/{id}'");
    expect(source).toContain("methods: ['DELETE']");
    expect(source).toContain("route: 'foleon/sync/docs'");
    expect(source).toContain("route: 'foleon/sync/projects'");
    expect(source).toContain("route: 'foleon/sync/status'");
    expect(source).toContain("route: 'foleon/sync/runs'");
    expect(source).toContain("route: 'foleon/provision-sharepoint'");
    expect(source).toContain("route: 'foleon/validate-sharepoint'");
    expect(source).toContain("route: 'foleon/config'");
  });

  it('uses Foleon-specific app-role authorization and telemetry', () => {
    expect(source).toContain('withAuth(');
    expect(source).toContain('authorizeFoleonRoute');
    expect(source).toContain('authorizeFoleonCommandRoute');
    expect(source).toContain('emitAuthorizationTelemetry');
    expect(source).toContain('foleon-route-');
    expect(authzSource).toContain('HBIntelFoleonViewer');
    expect(authzSource).toContain('HBIntelFoleonEditor');
    expect(authzSource).toContain('HBIntelFoleonPublisher');
    expect(authzSource).toContain('HBIntelFoleonOperator');
    expect(authzSource).toContain('HBIntelFoleonAdmin');
  });

  it('routes writes and sync through backend service implementations', () => {
    expect(source).toContain('createFoleonService');
    expect(source).toContain('createContent');
    expect(source).toContain('updateContent');
    expect(source).toContain('createPlacement');
    expect(source).toContain('syncDocs');
    expect(source).toContain('syncProjects');
    expect(source).toContain('FoleonServiceError');
  });

  it('is imported by the Azure Functions entry point', () => {
    expect(indexSource).toContain("import './functions/adminApi/foleon-routes.js'");
  });
});
