import { describe, expect, it } from 'vitest';
import {
  FOLEON_CONTENT_REGISTRY_SCHEMA,
  FOLEON_HOMEPAGE_PLACEMENTS_SCHEMA,
  FOLEON_INTERACTION_EVENTS_SCHEMA,
  FOLEON_LIST_SCHEMAS,
  FOLEON_SYNC_RUNS_SCHEMA,
  assertFiltersAreIndexed,
  assertSelectFieldsInSchema,
  isFieldIndexed,
  selectFieldsFor,
} from '../foleonListSchemas.js';

describe('Foleon list schemas', () => {
  it('FOLEON_LIST_SCHEMAS exposes the four governed lists', () => {
    expect(FOLEON_LIST_SCHEMAS.map((s) => s.internalName)).toEqual([
      'HB_FoleonContentRegistry',
      'HB_FoleonHomepagePlacements',
      'HB_FoleonInteractionEvents',
      'HB_FoleonSyncRuns',
    ]);
  });

  describe.each(FOLEON_LIST_SCHEMAS)('$internalName', (schema) => {
    it('has a non-empty field set', () => {
      expect(schema.fields.length).toBeGreaterThan(0);
    });

    it('has unique field internal names', () => {
      const names = schema.fields.map((f) => f.internalName);
      expect(new Set(names).size).toBe(names.length);
    });

    it('lists every requiredIndexedFields entry as an actual indexed field', () => {
      for (const name of schema.requiredIndexedFields) {
        const field = schema.fields.find((f) => f.internalName === name);
        expect(field, `${schema.internalName} missing required indexed field ${name}`).toBeDefined();
        expect(field?.indexed, `${schema.internalName}.${name} must be indexed`).toBe(true);
      }
    });

    it('has a Title field as SharePoint requires', () => {
      expect(schema.fields.some((f) => f.internalName === 'Title')).toBe(true);
    });
  });

  it('Placements schema carries a Lookup into the Content Registry', () => {
    const lookup = FOLEON_HOMEPAGE_PLACEMENTS_SCHEMA.fields.find(
      (f) => f.internalName === 'ContentLookup',
    );
    expect(lookup?.type).toBe('Lookup');
    expect(lookup?.lookupTarget).toBe('HB_FoleonContentRegistry');
  });

  it('Content Registry enforces IsVisible / PublishStatus / AllowEmbed as indexed required gates', () => {
    const gates = ['IsVisible', 'PublishStatus', 'AllowEmbed'];
    for (const name of gates) {
      const field = FOLEON_CONTENT_REGISTRY_SCHEMA.fields.find((f) => f.internalName === name);
      expect(field?.required).toBe(true);
      expect(field?.indexed).toBe(true);
    }
  });

  it('Interaction Events preserves EventId unique constraint', () => {
    const eventId = FOLEON_INTERACTION_EVENTS_SCHEMA.fields.find(
      (f) => f.internalName === 'EventId',
    );
    expect(eventId?.unique).toBe(true);
    expect(eventId?.indexed).toBe(true);
  });

  it('Sync Runs enforces RunId unique + indexed and covers the run lifecycle choices', () => {
    const runId = FOLEON_SYNC_RUNS_SCHEMA.fields.find((f) => f.internalName === 'RunId');
    expect(runId?.unique).toBe(true);
    expect(runId?.indexed).toBe(true);
    const status = FOLEON_SYNC_RUNS_SCHEMA.fields.find((f) => f.internalName === 'Status');
    expect(status?.choices).toEqual(['Running', 'Succeeded', 'Failed', 'Cancelled']);
    const kind = FOLEON_SYNC_RUNS_SCHEMA.fields.find((f) => f.internalName === 'RunKind');
    expect(kind?.choices).toEqual(['Docs', 'Projects', 'Analytics']);
    const trigger = FOLEON_SYNC_RUNS_SCHEMA.fields.find((f) => f.internalName === 'TriggerSource');
    expect(trigger?.choices).toEqual(['Timer', 'Manual', 'AdminApi']);
  });

  it('Sync Runs exposes Recent Runs and Failed Runs views', () => {
    const names = FOLEON_SYNC_RUNS_SCHEMA.views.map((v) => v.name);
    expect(names).toContain('Recent Runs');
    expect(names).toContain('Failed Runs');
  });
});

describe('selectFieldsFor', () => {
  it('returns a comma-separated list of field internal names', () => {
    const selected = selectFieldsFor(FOLEON_CONTENT_REGISTRY_SCHEMA).split(',');
    expect(selected.length).toBe(FOLEON_CONTENT_REGISTRY_SCHEMA.fields.length);
    expect(selected).toContain('FoleonDocId');
    expect(selected).toContain('AllowEmbed');
  });
});

describe('assertFiltersAreIndexed', () => {
  it('passes when every filter field is indexed', () => {
    expect(() =>
      assertFiltersAreIndexed(FOLEON_CONTENT_REGISTRY_SCHEMA, [
        'FoleonDocId',
        'IsVisible',
        'PublishStatus',
      ]),
    ).not.toThrow();
  });

  it('throws for a non-indexed filter field', () => {
    expect(() =>
      assertFiltersAreIndexed(FOLEON_CONTENT_REGISTRY_SCHEMA, ['Summary']),
    ).toThrow(/Summary/);
  });
});

describe('assertSelectFieldsInSchema', () => {
  it('accepts Id (always returned by SP) and regular schema fields', () => {
    expect(() =>
      assertSelectFieldsInSchema(FOLEON_CONTENT_REGISTRY_SCHEMA, ['Id', 'Title', 'FoleonDocId']),
    ).not.toThrow();
  });

  it('accepts the <Lookup>Id projection convention for Lookup fields', () => {
    expect(() =>
      assertSelectFieldsInSchema(FOLEON_HOMEPAGE_PLACEMENTS_SCHEMA, [
        'Id',
        'ContentLookupId',
      ]),
    ).not.toThrow();
  });

  it('rejects a select field that is not in the schema', () => {
    expect(() =>
      assertSelectFieldsInSchema(FOLEON_CONTENT_REGISTRY_SCHEMA, ['NotARealField']),
    ).toThrow(/NotARealField/);
  });
});

describe('isFieldIndexed', () => {
  it('returns true for indexed fields and false otherwise', () => {
    expect(isFieldIndexed(FOLEON_CONTENT_REGISTRY_SCHEMA, 'PublishStatus')).toBe(true);
    expect(isFieldIndexed(FOLEON_CONTENT_REGISTRY_SCHEMA, 'Summary')).toBe(false);
    expect(isFieldIndexed(FOLEON_CONTENT_REGISTRY_SCHEMA, 'DoesNotExist')).toBe(false);
  });
});
