import { describe, expect, it } from 'vitest';
import {
  FOLEON_CONTENT_REGISTRY_SCHEMA,
  FOLEON_HOMEPAGE_PLACEMENTS_SCHEMA,
  FOLEON_INTERACTION_EVENTS_SCHEMA,
  FOLEON_LIST_SCHEMAS,
  FOLEON_SYNC_RUNS_SCHEMA,
  assertFiltersAreIndexed,
  assertSelectFieldsInSchema,
  isFieldFilterSafe,
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

    it('lists every requiredIndexedFields entry as an actual launch-provisioned indexed field', () => {
      for (const name of schema.requiredIndexedFields) {
        const field = schema.fields.find((f) => f.internalName === name);
        expect(field, `${schema.internalName} missing required indexed field ${name}`).toBeDefined();
        expect(field?.indexedAtProvisioning, `${schema.internalName}.${name} must be indexed at provisioning`).toBe(true);
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
    expect(lookup?.required).toBe(false);
  });

  it('Content Registry enforces IsVisible / PublishStatus / AllowEmbed as indexed required gates', () => {
    const gates = ['IsVisible', 'PublishStatus', 'AllowEmbed'];
    for (const name of gates) {
      const field = FOLEON_CONTENT_REGISTRY_SCHEMA.fields.find((f) => f.internalName === name);
      expect(field?.required).toBe(true);
      expect(field?.indexedAtProvisioning).toBe(true);
    }
  });

  it('Content Registry tracks future indexes separately from live launch indexes', () => {
    const recommendedOnly = ['FoleonProjectId', 'ContentTypeKey', 'IsFeatured'];
    for (const name of recommendedOnly) {
      const field = FOLEON_CONTENT_REGISTRY_SCHEMA.fields.find((f) => f.internalName === name);
      expect(field?.indexedAtProvisioning).toBe(false);
      expect(field?.recommendedIndex).toBe(true);
      expect(field?.filterSafe).not.toBe(true);
    }
  });

  it('Interaction Events preserves EventId unique constraint', () => {
    const eventId = FOLEON_INTERACTION_EVENTS_SCHEMA.fields.find(
      (f) => f.internalName === 'EventId',
    );
    expect(eventId?.unique).toBe(true);
    expect(eventId?.indexedAtProvisioning).toBe(true);
  });

  it('Sync Runs enforces RunId unique + indexed and covers the run lifecycle choices', () => {
    const runId = FOLEON_SYNC_RUNS_SCHEMA.fields.find((f) => f.internalName === 'RunId');
    expect(runId?.unique).toBe(true);
    expect(runId?.indexedAtProvisioning).toBe(true);
    const status = FOLEON_SYNC_RUNS_SCHEMA.fields.find((f) => f.internalName === 'Status');
    expect(status?.choices).toEqual(['Running', 'Succeeded', 'Failed', 'Cancelled']);
    const kind = FOLEON_SYNC_RUNS_SCHEMA.fields.find((f) => f.internalName === 'RunKind');
    expect(kind?.choices).toEqual(['Docs', 'Projects', 'Analytics']);
    const trigger = FOLEON_SYNC_RUNS_SCHEMA.fields.find((f) => f.internalName === 'TriggerSource');
    expect(trigger?.choices).toEqual(['Timer', 'Manual', 'AdminApi']);
  });

  it('Sync Runs provisions only the minimal default view', () => {
    const names = FOLEON_SYNC_RUNS_SCHEMA.views.map((v) => v.name);
    expect(names).toEqual(['All Items']);
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
  it('passes when every filter field is marked filter-safe against a live index', () => {
    expect(() =>
      assertFiltersAreIndexed(FOLEON_CONTENT_REGISTRY_SCHEMA, [
        'FoleonDocId',
        'IsVisible',
        'PublishStatus',
      ]),
    ).not.toThrow();
  });

  it('throws for a non-filter-safe field even when it is recommended for a future index', () => {
    expect(() =>
      assertFiltersAreIndexed(FOLEON_CONTENT_REGISTRY_SCHEMA, ['ContentTypeKey']),
    ).toThrow(/ContentTypeKey/);
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
  it('returns true for launch-provisioned indexed fields and false otherwise', () => {
    expect(isFieldIndexed(FOLEON_CONTENT_REGISTRY_SCHEMA, 'PublishStatus')).toBe(true);
    expect(isFieldIndexed(FOLEON_CONTENT_REGISTRY_SCHEMA, 'ContentTypeKey')).toBe(false);
    expect(isFieldIndexed(FOLEON_CONTENT_REGISTRY_SCHEMA, 'Summary')).toBe(false);
    expect(isFieldIndexed(FOLEON_CONTENT_REGISTRY_SCHEMA, 'DoesNotExist')).toBe(false);
  });
});

describe('isFieldFilterSafe', () => {
  it('returns true only when a field has a live index and explicit filter approval', () => {
    expect(isFieldFilterSafe(FOLEON_CONTENT_REGISTRY_SCHEMA, 'PublishStatus')).toBe(true);
    expect(isFieldFilterSafe(FOLEON_CONTENT_REGISTRY_SCHEMA, 'PublishedOn')).toBe(false);
    expect(isFieldFilterSafe(FOLEON_CONTENT_REGISTRY_SCHEMA, 'ContentTypeKey')).toBe(false);
  });
});
