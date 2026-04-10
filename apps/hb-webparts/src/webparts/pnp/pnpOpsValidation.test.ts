import { describe, expect, it } from 'vitest';
import { PNP_V1_ACTIONS } from './pnpOpsActionCatalog.js';
import { parseCsvFilters, validatePnpOpsForm } from './pnpOpsValidation.js';

const LOCAL_RUNTIME = {
  executionMode: 'local-runner' as const,
  runnerBaseUrl: 'http://127.0.0.1:5010',
  runnerApiKey: '',
  legacyAdminApiBaseUrl: '',
};

describe('pnpOpsValidation', () => {
  it('parses comma-separated filters safely', () => {
    expect(parseCsvFilters(' List A, List B , ,List C ')).toEqual(['List A', 'List B', 'List C']);
  });

  it('accepts a valid SharePoint site URL for site inventory', () => {
    const inventoryAction = PNP_V1_ACTIONS.find((action) => action.key === 'sharepoint-control:extraction:site-inventory');
    const result = validatePnpOpsForm(inventoryAction, {
      targetSiteUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral',
      listFilterInput: '',
      pageFilterInput: '',
    }, LOCAL_RUNTIME);
    expect(result.isValid).toBe(true);
  });

  it('requires list filter input for list schema action', () => {
    const listAction = PNP_V1_ACTIONS.find((action) => action.key === 'sharepoint-control:extraction:list-schema');
    const result = validatePnpOpsForm(listAction, {
      targetSiteUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral',
      listFilterInput: '',
      pageFilterInput: '',
    }, LOCAL_RUNTIME);
    expect(result.isValid).toBe(false);
    expect(result.errors.join(' ')).toContain('list filters');
  });

  it('requires list filter input for library folder tree action', () => {
    const action = PNP_V1_ACTIONS.find((entry) => entry.key === 'sharepoint-control:extraction:library-folder-tree');
    const result = validatePnpOpsForm(action, {
      targetSiteUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral',
      listFilterInput: '',
      pageFilterInput: '',
    }, LOCAL_RUNTIME);
    expect(result.isValid).toBe(false);
    expect(result.errors.join(' ')).toContain('list filters');
  });

  it('requires page filter input for page webpart inventory action', () => {
    const action = PNP_V1_ACTIONS.find((entry) => entry.key === 'sharepoint-control:extraction:page-webpart-inventory');
    const result = validatePnpOpsForm(action, {
      targetSiteUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral',
      listFilterInput: '',
      pageFilterInput: '',
    }, LOCAL_RUNTIME);
    expect(result.isValid).toBe(false);
    expect(result.errors.join(' ')).toContain('page filters');
  });

  it('accepts site-only input for site groups summary action', () => {
    const action = PNP_V1_ACTIONS.find((entry) => entry.key === 'sharepoint-control:extraction:site-groups-summary');
    const result = validatePnpOpsForm(action, {
      targetSiteUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral',
      listFilterInput: '',
      pageFilterInput: '',
    }, LOCAL_RUNTIME);
    expect(result.isValid).toBe(true);
  });

  it('rejects non-SharePoint URLs', () => {
    const siteTemplateAction = PNP_V1_ACTIONS.find((action) => action.key === 'sharepoint-control:extraction:site-template');
    const result = validatePnpOpsForm(siteTemplateAction, {
      targetSiteUrl: 'https://example.com/not-sharepoint',
      listFilterInput: '',
      pageFilterInput: '',
    }, LOCAL_RUNTIME);
    expect(result.isValid).toBe(false);
    expect(result.errors.join(' ')).toContain('sharepoint.com/sites');
  });

  it('requires runner URL for local-runner mode', () => {
    const action = PNP_V1_ACTIONS.find((entry) => entry.key === 'sharepoint-control:extraction:site-template');
    const result = validatePnpOpsForm(action, {
      targetSiteUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral',
      listFilterInput: '',
      pageFilterInput: '',
    }, {
      executionMode: 'local-runner',
      runnerBaseUrl: '',
      runnerApiKey: '',
      legacyAdminApiBaseUrl: '',
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.join(' ')).toContain('local-runner mode requires a runner base URL');
  });

  it('requires a legacy endpoint in legacy-admin-api mode', () => {
    const action = PNP_V1_ACTIONS.find((entry) => entry.key === 'sharepoint-control:extraction:site-template');
    const result = validatePnpOpsForm(action, {
      targetSiteUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral',
      listFilterInput: '',
      pageFilterInput: '',
    }, {
      executionMode: 'legacy-admin-api',
      runnerBaseUrl: '',
      runnerApiKey: '',
      legacyAdminApiBaseUrl: '',
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.join(' ')).toContain('legacy-admin-api mode requires');
  });

  it('allows missing runner URL in mock mode', () => {
    const action = PNP_V1_ACTIONS.find((entry) => entry.key === 'sharepoint-control:extraction:site-template');
    const result = validatePnpOpsForm(action, {
      targetSiteUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral',
      listFilterInput: '',
      pageFilterInput: '',
    }, {
      executionMode: 'mock',
      runnerBaseUrl: '',
      runnerApiKey: '',
      legacyAdminApiBaseUrl: '',
    });
    expect(result.isValid).toBe(true);
  });

  it('requires HTTPS and runnerApiKey for remote-runner mode', () => {
    const action = PNP_V1_ACTIONS.find((entry) => entry.key === 'sharepoint-control:extraction:site-template');
    const result = validatePnpOpsForm(action, {
      targetSiteUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral',
      listFilterInput: '',
      pageFilterInput: '',
    }, {
      executionMode: 'remote-runner',
      runnerBaseUrl: 'http://runner.internal',
      runnerApiKey: '',
      legacyAdminApiBaseUrl: '',
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.join(' ')).toContain('requires `runnerApiKey`');
    expect(result.errors.join(' ')).toContain('requires an HTTPS runner base URL');
  });
});
