import { describe, expect, it } from 'vitest';
import { MY_PROJECTS_CUSTOM_LINKS_LIST_DESCRIPTOR } from '../my-projects-custom-links/list-descriptor.js';
import {
  buildMyProjectsCustomLinksSchemaReadinessReport,
  type CustomLinksListFieldSnapshot,
} from '../my-projects-custom-links/custom-links-schema-readiness.js';

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

function liveSnapshot(): CustomLinksListFieldSnapshot[] {
  return MY_PROJECTS_CUSTOM_LINKS_LIST_DESCRIPTOR.fields.map((field) => ({
    internalName: field.internalName,
    typeAsString: TYPE_TO_LIVE_TYPE_AS_STRING[field.type] ?? 'Text',
  }));
}

describe('buildMyProjectsCustomLinksSchemaReadinessReport', () => {
  it('returns ready=true when every descriptor field is present with the canonical type', () => {
    const report = buildMyProjectsCustomLinksSchemaReadinessReport({
      fields: liveSnapshot(),
      generatedAtUtc: NOW,
    });
    expect(report.ready).toBe(true);
    expect(report.generatedAtUtc).toBe(NOW);
    expect(report.listName).toBe('My Projects Custom Links');
    expect(report.entries).toHaveLength(MY_PROJECTS_CUSTOM_LINKS_LIST_DESCRIPTOR.fields.length);
    for (const entry of report.entries) {
      expect(entry.state).toBe('live-verified');
    }
  });

  it('classifies a missing column as state=missing and ready=false', () => {
    const fields = liveSnapshot().filter((f) => f.internalName !== 'Visibility');
    const report = buildMyProjectsCustomLinksSchemaReadinessReport({
      fields,
      generatedAtUtc: NOW,
    });
    expect(report.ready).toBe(false);
    const visibility = report.entries.find((entry) => entry.internalName === 'Visibility');
    expect(visibility?.state).toBe('missing');
    expect(visibility?.expectedTypeAsString).toBe('Choice');
    expect(visibility?.observedTypeAsString).toBeNull();
  });

  it('classifies a wrong-type column (Text where DateTime expected) as state=wrong-type', () => {
    const fields = liveSnapshot().map((f) =>
      f.internalName === 'CreatedAtUtc' ? { ...f, typeAsString: 'Text' } : f,
    );
    const report = buildMyProjectsCustomLinksSchemaReadinessReport({
      fields,
      generatedAtUtc: NOW,
    });
    expect(report.ready).toBe(false);
    const created = report.entries.find((entry) => entry.internalName === 'CreatedAtUtc');
    expect(created?.state).toBe('wrong-type');
    expect(created?.expectedTypeAsString).toBe('DateTime');
    expect(created?.observedTypeAsString).toBe('Text');
  });

  it('accepts the alternate compatible TypeAsString for Number columns (Currency)', () => {
    const fields = liveSnapshot().map((f) =>
      f.internalName === 'ProjectYear' ? { ...f, typeAsString: 'Currency' } : f,
    );
    const report = buildMyProjectsCustomLinksSchemaReadinessReport({
      fields,
      generatedAtUtc: NOW,
    });
    expect(report.ready).toBe(true);
    const year = report.entries.find((entry) => entry.internalName === 'ProjectYear');
    expect(year?.state).toBe('live-verified');
    expect(year?.observedTypeAsString).toBe('Currency');
  });

  it('ignores extra unknown columns on the list snapshot', () => {
    const fields: CustomLinksListFieldSnapshot[] = [
      ...liveSnapshot(),
      { internalName: 'SomeUnrelatedColumn', typeAsString: 'Text' },
    ];
    const report = buildMyProjectsCustomLinksSchemaReadinessReport({
      fields,
      generatedAtUtc: NOW,
    });
    expect(report.ready).toBe(true);
    expect(
      report.entries.find((entry) => entry.internalName === 'SomeUnrelatedColumn'),
    ).toBeUndefined();
  });
});
