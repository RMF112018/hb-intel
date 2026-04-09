import { describe, expect, it } from 'vitest';
import { PNP_V1_ACTIONS } from './pnpOpsActionCatalog.js';
import { parseCsvFilters, validatePnpOpsForm } from './pnpOpsValidation.js';

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
    });
    expect(result.isValid).toBe(true);
  });

  it('requires list filter input for list schema action', () => {
    const listAction = PNP_V1_ACTIONS.find((action) => action.key === 'sharepoint-control:extraction:list-schema');
    const result = validatePnpOpsForm(listAction, {
      targetSiteUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral',
      listFilterInput: '',
      pageFilterInput: '',
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.join(' ')).toContain('list filters');
  });

  it('rejects non-SharePoint URLs', () => {
    const siteTemplateAction = PNP_V1_ACTIONS.find((action) => action.key === 'sharepoint-control:extraction:site-template');
    const result = validatePnpOpsForm(siteTemplateAction, {
      targetSiteUrl: 'https://example.com/not-sharepoint',
      listFilterInput: '',
      pageFilterInput: '',
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.join(' ')).toContain('sharepoint.com/sites');
  });
});
