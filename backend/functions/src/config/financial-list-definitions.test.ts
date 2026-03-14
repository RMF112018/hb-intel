import { describe, it, expect } from 'vitest';
import { FINANCIAL_LIST_DEFINITIONS } from './financial-list-definitions.js';

/**
 * W0-G2-T06: Schema compliance tests for the 5 financial-family list definitions.
 */
describe('FINANCIAL_LIST_DEFINITIONS — financial-family schema compliance', () => {
  it('contains exactly 5 lists', () => {
    expect(FINANCIAL_LIST_DEFINITIONS).toHaveLength(5);
  });

  it('contains all expected list titles', () => {
    const titles = FINANCIAL_LIST_DEFINITIONS.map((l) => l.title);
    expect(titles).toContain('Buyout Log');
    expect(titles).toContain('Buyout Bid Lines');
    expect(titles).toContain('Draw Schedule');
    expect(titles).toContain('Financial Forecast Status');
    expect(titles).toContain('Subcontract Compliance Log');
  });

  it('every list has a pid field with required, indexed, and defaultValue', () => {
    for (const list of FINANCIAL_LIST_DEFINITIONS) {
      const pid = list.fields.find((f) => f.internalName === 'pid');
      expect(pid, `${list.title} missing pid field`).toBeDefined();
      expect(pid!.type).toBe('Text');
      expect(pid!.required).toBe(true);
      expect(pid!.indexed).toBe(true);
      expect(pid!.defaultValue).toBe('{{projectNumber}}');
    }
  });

  it('every list has a Title field that is required', () => {
    for (const list of FINANCIAL_LIST_DEFINITIONS) {
      const title = list.fields.find((f) => f.internalName === 'Title');
      expect(title, `${list.title} missing Title field`).toBeDefined();
      expect(title!.required).toBe(true);
    }
  });

  it('all listFamily values are "financial"', () => {
    for (const list of FINANCIAL_LIST_DEFINITIONS) {
      expect(list.listFamily).toBe('financial');
    }
  });

  it('Buyout Bid Lines is child of Buyout Log (parentListTitle, ParentRecord Lookup)', () => {
    const bidLines = FINANCIAL_LIST_DEFINITIONS.find((l) => l.title === 'Buyout Bid Lines');
    expect(bidLines).toBeDefined();
    expect(bidLines!.parentListTitle).toBe('Buyout Log');
    const parentRecord = bidLines!.fields.find((f) => f.internalName === 'ParentRecord');
    expect(parentRecord).toBeDefined();
    expect(parentRecord!.type).toBe('Lookup');
    expect(parentRecord!.required).toBe(true);
    expect(parentRecord!.lookupListTitle).toBe('Buyout Log');
    expect(parentRecord!.lookupFieldName).toBe('ID');
  });

  it('parent provisioningOrder (10) < child provisioningOrder (20)', () => {
    const parent = FINANCIAL_LIST_DEFINITIONS.find((l) => l.title === 'Buyout Log');
    const child = FINANCIAL_LIST_DEFINITIONS.find((l) => l.title === 'Buyout Bid Lines');
    expect(parent).toBeDefined();
    expect(child).toBeDefined();
    expect(parent!.provisioningOrder).toBeLessThan(child!.provisioningOrder);
  });

  it('Draw Schedule, Financial Forecast Status, Subcontract Compliance Log are flat (no parentListTitle)', () => {
    const flatLists = ['Draw Schedule', 'Financial Forecast Status', 'Subcontract Compliance Log'];
    for (const title of flatLists) {
      const list = FINANCIAL_LIST_DEFINITIONS.find((l) => l.title === title);
      expect(list, `${title} not found`).toBeDefined();
      expect(list!.parentListTitle, `${title} should not have parentListTitle`).toBeUndefined();
    }
  });

  it('Choice fields have non-empty choices arrays', () => {
    for (const list of FINANCIAL_LIST_DEFINITIONS) {
      for (const field of list.fields) {
        if (field.type === 'Choice') {
          expect(field.choices, `${list.title}.${field.internalName} missing choices`).toBeDefined();
          expect(field.choices!.length, `${list.title}.${field.internalName} has empty choices`).toBeGreaterThan(0);
        }
      }
    }
  });

  it('Buyout Log: Status has 6 choices, Division has 17 choices', () => {
    const buyout = FINANCIAL_LIST_DEFINITIONS.find((l) => l.title === 'Buyout Log');
    expect(buyout).toBeDefined();
    const status = buyout!.fields.find((f) => f.internalName === 'Status');
    expect(status).toBeDefined();
    expect(status!.choices).toHaveLength(6);
    const division = buyout!.fields.find((f) => f.internalName === 'Division');
    expect(division).toBeDefined();
    expect(division!.choices).toHaveLength(17);
  });

  it('Buyout Log: BudgetAmount and AwardAmount are Number', () => {
    const buyout = FINANCIAL_LIST_DEFINITIONS.find((l) => l.title === 'Buyout Log');
    expect(buyout).toBeDefined();
    const budget = buyout!.fields.find((f) => f.internalName === 'BudgetAmount');
    expect(budget).toBeDefined();
    expect(budget!.type).toBe('Number');
    const award = buyout!.fields.find((f) => f.internalName === 'AwardAmount');
    expect(award).toBeDefined();
    expect(award!.type).toBe('Number');
  });

  it('Buyout Log: ProcoreSubcontractId is Text (not Lookup)', () => {
    const buyout = FINANCIAL_LIST_DEFINITIONS.find((l) => l.title === 'Buyout Log');
    expect(buyout).toBeDefined();
    const procore = buyout!.fields.find((f) => f.internalName === 'ProcoreSubcontractId');
    expect(procore).toBeDefined();
    expect(procore!.type).toBe('Text');
  });

  it('Buyout Bid Lines: BidStatus has 7 choices, SubcontractorName is required', () => {
    const bidLines = FINANCIAL_LIST_DEFINITIONS.find((l) => l.title === 'Buyout Bid Lines');
    expect(bidLines).toBeDefined();
    const bidStatus = bidLines!.fields.find((f) => f.internalName === 'BidStatus');
    expect(bidStatus).toBeDefined();
    expect(bidStatus!.choices).toHaveLength(7);
    const subName = bidLines!.fields.find((f) => f.internalName === 'SubcontractorName');
    expect(subName).toBeDefined();
    expect(subName!.required).toBe(true);
  });

  it('Draw Schedule: Status has 4 choices, ≥5 Number-type fields exist', () => {
    const draw = FINANCIAL_LIST_DEFINITIONS.find((l) => l.title === 'Draw Schedule');
    expect(draw).toBeDefined();
    const status = draw!.fields.find((f) => f.internalName === 'Status');
    expect(status).toBeDefined();
    expect(status!.choices).toHaveLength(4);
    const numberFields = draw!.fields.filter((f) => f.type === 'Number');
    expect(numberFields.length).toBeGreaterThanOrEqual(5);
  });

  it('Financial Forecast Status: ForecastMonth is required DateTime', () => {
    const forecast = FINANCIAL_LIST_DEFINITIONS.find((l) => l.title === 'Financial Forecast Status');
    expect(forecast).toBeDefined();
    const fm = forecast!.fields.find((f) => f.internalName === 'ForecastMonth');
    expect(fm).toBeDefined();
    expect(fm!.type).toBe('DateTime');
    expect(fm!.required).toBe(true);
  });

  it('Financial Forecast Status: 4 Boolean checklist fields exist', () => {
    const forecast = FINANCIAL_LIST_DEFINITIONS.find((l) => l.title === 'Financial Forecast Status');
    expect(forecast).toBeDefined();
    const boolFieldNames = ['ProcoreBudgetUpdated', 'ForecastSummaryComplete', 'VendorQuotesReceived', 'GCGRUpdated'];
    for (const name of boolFieldNames) {
      const field = forecast!.fields.find((f) => f.internalName === name);
      expect(field, `${name} not found`).toBeDefined();
      expect(field!.type).toBe('Boolean');
    }
  });

  it('Financial Forecast Status: ContractType has 4 choices, ProjectType has 3 choices', () => {
    const forecast = FINANCIAL_LIST_DEFINITIONS.find((l) => l.title === 'Financial Forecast Status');
    expect(forecast).toBeDefined();
    const ct = forecast!.fields.find((f) => f.internalName === 'ContractType');
    expect(ct).toBeDefined();
    expect(ct!.choices).toHaveLength(4);
    const pt = forecast!.fields.find((f) => f.internalName === 'ProjectType');
    expect(pt).toBeDefined();
    expect(pt!.choices).toHaveLength(3);
  });

  it('Subcontract Compliance Log: RequirementType has 11 choices, Status has 5 choices', () => {
    const compliance = FINANCIAL_LIST_DEFINITIONS.find((l) => l.title === 'Subcontract Compliance Log');
    expect(compliance).toBeDefined();
    const reqType = compliance!.fields.find((f) => f.internalName === 'RequirementType');
    expect(reqType).toBeDefined();
    expect(reqType!.choices).toHaveLength(11);
    const status = compliance!.fields.find((f) => f.internalName === 'Status');
    expect(status).toBeDefined();
    expect(status!.choices).toHaveLength(5);
  });

  it('Subcontract Compliance Log: DocumentLink is URL, SubcontractorName is required', () => {
    const compliance = FINANCIAL_LIST_DEFINITIONS.find((l) => l.title === 'Subcontract Compliance Log');
    expect(compliance).toBeDefined();
    const docLink = compliance!.fields.find((f) => f.internalName === 'DocumentLink');
    expect(docLink).toBeDefined();
    expect(docLink!.type).toBe('URL');
    const subName = compliance!.fields.find((f) => f.internalName === 'SubcontractorName');
    expect(subName).toBeDefined();
    expect(subName!.required).toBe(true);
  });

  it('only Buyout Bid Lines has Lookup fields; no other list has Lookup type', () => {
    for (const list of FINANCIAL_LIST_DEFINITIONS) {
      const lookupFields = list.fields.filter((f) => f.type === 'Lookup');
      if (list.title === 'Buyout Bid Lines') {
        expect(lookupFields).toHaveLength(1);
      } else {
        expect(lookupFields, `${list.title} should have no Lookup fields`).toHaveLength(0);
      }
    }
  });
});
