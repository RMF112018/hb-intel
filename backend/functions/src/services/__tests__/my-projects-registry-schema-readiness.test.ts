import { describe, expect, it } from 'vitest';
import { MY_PROJECTS_REGISTRY_LIST_DESCRIPTOR } from '../my-projects-projection/registry-list-descriptor.js';
import {
  buildMyProjectsRegistrySchemaReadinessReport,
  type RegistryListFieldSnapshot,
} from '../my-projects-projection/registry-schema-readiness.js';

const NOW = '2026-05-17T00:00:00.000Z';

const TYPE_TO_LIVE_TYPE_AS_STRING: Record<string, string> = {
  Text: 'Text',
  Number: 'Number',
  Boolean: 'Boolean',
  DateTime: 'DateTime',
  Choice: 'Choice',
  MultiLineText: 'Note',
  URL: 'URL',
  User: 'User',
  Lookup: 'Lookup',
};

function liveSnapshot(): RegistryListFieldSnapshot[] {
  return MY_PROJECTS_REGISTRY_LIST_DESCRIPTOR.fields.map((field) => ({
    internalName: field.internalName,
    typeAsString: TYPE_TO_LIVE_TYPE_AS_STRING[field.type] ?? 'Text',
    enforceUniqueValues: field.unique === true,
  }));
}

describe('buildMyProjectsRegistrySchemaReadinessReport', () => {
  it('returns ready=true when every descriptor field is present with the canonical type and uniqueness', () => {
    const report = buildMyProjectsRegistrySchemaReadinessReport({
      fields: liveSnapshot(),
      generatedAtUtc: NOW,
    });
    expect(report.ready).toBe(true);
    expect(report.generatedAtUtc).toBe(NOW);
    expect(report.listName).toBe('My Projects Registry');
    expect(report.entries).toHaveLength(MY_PROJECTS_REGISTRY_LIST_DESCRIPTOR.fields.length);
    for (const entry of report.entries) {
      expect(entry.state).toBe('live-verified');
    }
  });

  it('classifies a missing column as state=missing and ready=false', () => {
    const fields = liveSnapshot().filter((f) => f.internalName !== 'AssignmentRolesJson');
    const report = buildMyProjectsRegistrySchemaReadinessReport({
      fields,
      generatedAtUtc: NOW,
    });
    expect(report.ready).toBe(false);
    const entry = report.entries.find((e) => e.internalName === 'AssignmentRolesJson');
    expect(entry?.state).toBe('missing');
    expect(entry?.expectedTypeAsString).toBe('Note');
    expect(entry?.observedTypeAsString).toBeNull();
  });

  it('classifies a wrong-type column (Text where DateTime expected) as state=wrong-type', () => {
    const fields = liveSnapshot().map((f) =>
      f.internalName === 'LastProjectedAtUtc' ? { ...f, typeAsString: 'Text' } : f,
    );
    const report = buildMyProjectsRegistrySchemaReadinessReport({
      fields,
      generatedAtUtc: NOW,
    });
    expect(report.ready).toBe(false);
    const entry = report.entries.find((e) => e.internalName === 'LastProjectedAtUtc');
    expect(entry?.state).toBe('wrong-type');
    expect(entry?.expectedTypeAsString).toBe('DateTime');
    expect(entry?.observedTypeAsString).toBe('Text');
  });

  it('classifies ProjectionKey without EnforceUniqueValues as state=wrong-unique', () => {
    const fields = liveSnapshot().map((f) =>
      f.internalName === 'ProjectionKey' ? { ...f, enforceUniqueValues: false } : f,
    );
    const report = buildMyProjectsRegistrySchemaReadinessReport({
      fields,
      generatedAtUtc: NOW,
    });
    expect(report.ready).toBe(false);
    const entry = report.entries.find((e) => e.internalName === 'ProjectionKey');
    expect(entry?.state).toBe('wrong-unique');
    expect(entry?.expectedUnique).toBe(true);
    expect(entry?.observedUnique).toBe(false);
  });

  it('classifies ProjectionKey as wrong-unique when uniqueness flag is undefined on the snapshot', () => {
    const fields = liveSnapshot().map((f) =>
      f.internalName === 'ProjectionKey' ? { ...f, enforceUniqueValues: undefined } : f,
    );
    const report = buildMyProjectsRegistrySchemaReadinessReport({
      fields,
      generatedAtUtc: NOW,
    });
    const entry = report.entries.find((e) => e.internalName === 'ProjectionKey');
    expect(entry?.state).toBe('wrong-unique');
    expect(entry?.observedUnique).toBeUndefined();
  });

  it('accepts the alternate compatible TypeAsString for Number columns (Currency)', () => {
    const fields = liveSnapshot().map((f) =>
      f.internalName === 'ProjectsListItemId' ? { ...f, typeAsString: 'Currency' } : f,
    );
    const report = buildMyProjectsRegistrySchemaReadinessReport({
      fields,
      generatedAtUtc: NOW,
    });
    expect(report.ready).toBe(true);
    const entry = report.entries.find((e) => e.internalName === 'ProjectsListItemId');
    expect(entry?.state).toBe('live-verified');
    expect(entry?.observedTypeAsString).toBe('Currency');
  });

  it('ignores extra unknown columns on the list snapshot', () => {
    const fields: RegistryListFieldSnapshot[] = [
      ...liveSnapshot(),
      { internalName: 'SomeUnrelatedColumn', typeAsString: 'Text' },
    ];
    const report = buildMyProjectsRegistrySchemaReadinessReport({
      fields,
      generatedAtUtc: NOW,
    });
    expect(report.ready).toBe(true);
    expect(
      report.entries.find((entry) => entry.internalName === 'SomeUnrelatedColumn'),
    ).toBeUndefined();
  });

  it('does not classify non-unique fields as wrong-unique when their snapshot uniqueness is false', () => {
    const fields = liveSnapshot().map((f) =>
      f.internalName === 'UserUpn' ? { ...f, enforceUniqueValues: false } : f,
    );
    const report = buildMyProjectsRegistrySchemaReadinessReport({
      fields,
      generatedAtUtc: NOW,
    });
    expect(report.ready).toBe(true);
    const entry = report.entries.find((e) => e.internalName === 'UserUpn');
    expect(entry?.state).toBe('live-verified');
    expect(entry?.expectedUnique).toBeUndefined();
  });
});
