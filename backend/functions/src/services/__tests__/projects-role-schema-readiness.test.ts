import { describe, expect, it } from 'vitest';

import { MY_PROJECT_ASSIGNMENT_INTERNAL_FIELDS } from '@hbc/models/myWork';

import {
  buildProjectsRoleSchemaReadinessReport,
  MY_PROJECT_LINKS_EXTERNAL_LAUNCH_FIELDS,
  MY_PROJECT_LINKS_REQUIRED_FIELDS_LEGACY_REGISTRY,
  MY_PROJECT_LINKS_REQUIRED_FIELDS_PROJECTS,
  type ListFieldSnapshot,
} from '../projects-role-schema-readiness.js';

const NOW = '2026-05-13T00:00:00.000Z';

function projectsLiveSnapshot(): ListFieldSnapshot[] {
  return [
    ...MY_PROJECT_ASSIGNMENT_INTERNAL_FIELDS.map((internalName) => ({
      internalName,
      typeAsString: 'Note',
    })),
    ...MY_PROJECT_LINKS_EXTERNAL_LAUNCH_FIELDS.map((internalName) => ({
      internalName,
      typeAsString: 'Text',
    })),
  ];
}

function registryLiveSnapshot(): ListFieldSnapshot[] {
  return [
    ...MY_PROJECT_ASSIGNMENT_INTERNAL_FIELDS.map((internalName) => ({
      internalName,
      typeAsString: 'Note',
    })),
    { internalName: 'procoreProject', typeAsString: 'Text' },
    ...MY_PROJECT_LINKS_EXTERNAL_LAUNCH_FIELDS.map((internalName) => ({
      internalName,
      typeAsString: 'Text',
    })),
    { internalName: 'projectStage', typeAsString: 'Text' },
  ];
}

describe('field list constants', () => {
  it('Projects required fields are the canonical 14 plus the two external-launch link columns', () => {
    expect(MY_PROJECT_LINKS_REQUIRED_FIELDS_PROJECTS).toHaveLength(16);
    for (const field of MY_PROJECT_ASSIGNMENT_INTERNAL_FIELDS) {
      expect(MY_PROJECT_LINKS_REQUIRED_FIELDS_PROJECTS).toContain(field);
    }
    expect(MY_PROJECT_LINKS_REQUIRED_FIELDS_PROJECTS).toContain('buildingConnectedUrl');
    expect(MY_PROJECT_LINKS_REQUIRED_FIELDS_PROJECTS).toContain('documentCrunchUrl');
  });

  it('Legacy Registry required fields are the canonical 14 plus procoreProject, the two external-launch columns, and projectStage', () => {
    expect(MY_PROJECT_LINKS_REQUIRED_FIELDS_LEGACY_REGISTRY).toHaveLength(18);
    expect(MY_PROJECT_LINKS_REQUIRED_FIELDS_LEGACY_REGISTRY).toContain('procoreProject');
    expect(MY_PROJECT_LINKS_REQUIRED_FIELDS_LEGACY_REGISTRY).toContain('buildingConnectedUrl');
    expect(MY_PROJECT_LINKS_REQUIRED_FIELDS_LEGACY_REGISTRY).toContain('documentCrunchUrl');
    expect(MY_PROJECT_LINKS_REQUIRED_FIELDS_LEGACY_REGISTRY).toContain('projectStage');
    for (const field of MY_PROJECT_ASSIGNMENT_INTERNAL_FIELDS) {
      expect(MY_PROJECT_LINKS_REQUIRED_FIELDS_LEGACY_REGISTRY).toContain(field);
    }
  });

  it('external-launch fields are the two B05.10 link columns', () => {
    expect(MY_PROJECT_LINKS_EXTERNAL_LAUNCH_FIELDS).toEqual([
      'buildingConnectedUrl',
      'documentCrunchUrl',
    ]);
  });
});

describe('buildProjectsRoleSchemaReadinessReport — fully live tenant', () => {
  it('reports ready:true with every entry live-verified when both lists carry every required field', () => {
    const report = buildProjectsRoleSchemaReadinessReport({
      projectsFields: projectsLiveSnapshot(),
      legacyRegistryFields: registryLiveSnapshot(),
      generatedAtUtc: NOW,
    });
    expect(report.ready).toBe(true);
    expect(report.generatedAtUtc).toBe(NOW);
    expect(report.projects.ready).toBe(true);
    expect(report.legacyRegistry.ready).toBe(true);
    for (const entry of report.projects.entries) {
      expect(entry.state).toBe('live-verified');
      const expected =
        entry.internalName === 'buildingConnectedUrl' || entry.internalName === 'documentCrunchUrl'
          ? 'Text'
          : 'Note';
      expect(entry.expectedTypeAsString).toBe(expected);
    }
    for (const entry of report.legacyRegistry.entries) {
      expect(entry.state).toBe('live-verified');
    }
  });
});

describe('buildProjectsRoleSchemaReadinessReport — missing fields', () => {
  it('flags ready:false when a single canonical field is missing on Projects', () => {
    const snapshot = projectsLiveSnapshot().filter(
      (field) => field.internalName !== 'projectManagerUpns',
    );
    const report = buildProjectsRoleSchemaReadinessReport({
      projectsFields: snapshot,
      legacyRegistryFields: registryLiveSnapshot(),
      generatedAtUtc: NOW,
    });
    expect(report.ready).toBe(false);
    expect(report.projects.ready).toBe(false);
    expect(report.legacyRegistry.ready).toBe(true);
    const missing = report.projects.entries.find((e) => e.internalName === 'projectManagerUpns');
    expect(missing?.state).toBe('missing');
    expect(missing?.observedTypeAsString).toBeNull();
  });

  it('flags ready:false when procoreProject is missing on Legacy Registry', () => {
    const snapshot = registryLiveSnapshot().filter(
      (field) => field.internalName !== 'procoreProject',
    );
    const report = buildProjectsRoleSchemaReadinessReport({
      projectsFields: projectsLiveSnapshot(),
      legacyRegistryFields: snapshot,
      generatedAtUtc: NOW,
    });
    expect(report.ready).toBe(false);
    expect(report.legacyRegistry.ready).toBe(false);
    const missing = report.legacyRegistry.entries.find((e) => e.internalName === 'procoreProject');
    expect(missing?.state).toBe('missing');
    expect(missing?.expectedTypeAsString).toBe('Text');
  });

  it('reports every required field as missing on an empty Registry snapshot', () => {
    const report = buildProjectsRoleSchemaReadinessReport({
      projectsFields: projectsLiveSnapshot(),
      legacyRegistryFields: [],
      generatedAtUtc: NOW,
    });
    expect(report.ready).toBe(false);
    expect(report.legacyRegistry.entries).toHaveLength(18);
    for (const entry of report.legacyRegistry.entries) {
      expect(entry.state).toBe('missing');
    }
  });

  it('flags ready:false when buildingConnectedUrl is missing on Projects', () => {
    const snapshot = projectsLiveSnapshot().filter(
      (field) => field.internalName !== 'buildingConnectedUrl',
    );
    const report = buildProjectsRoleSchemaReadinessReport({
      projectsFields: snapshot,
      legacyRegistryFields: registryLiveSnapshot(),
      generatedAtUtc: NOW,
    });
    expect(report.ready).toBe(false);
    expect(report.projects.ready).toBe(false);
    const missing = report.projects.entries.find((e) => e.internalName === 'buildingConnectedUrl');
    expect(missing?.state).toBe('missing');
    expect(missing?.expectedTypeAsString).toBe('Text');
  });

  it('flags ready:false when projectStage is missing on the Legacy Registry', () => {
    const snapshot = registryLiveSnapshot().filter(
      (field) => field.internalName !== 'projectStage',
    );
    const report = buildProjectsRoleSchemaReadinessReport({
      projectsFields: projectsLiveSnapshot(),
      legacyRegistryFields: snapshot,
      generatedAtUtc: NOW,
    });
    expect(report.ready).toBe(false);
    expect(report.legacyRegistry.ready).toBe(false);
    const missing = report.legacyRegistry.entries.find((e) => e.internalName === 'projectStage');
    expect(missing?.state).toBe('missing');
    expect(missing?.expectedTypeAsString).toBe('Text');
  });
});

describe('buildProjectsRoleSchemaReadinessReport — wrong-type fields', () => {
  it('flags wrong-type when a role-array field is stored as Text instead of Note', () => {
    const snapshot = projectsLiveSnapshot().map((field) =>
      field.internalName === 'estimatorUpns' ? { ...field, typeAsString: 'Text' } : field,
    );
    const report = buildProjectsRoleSchemaReadinessReport({
      projectsFields: snapshot,
      legacyRegistryFields: registryLiveSnapshot(),
      generatedAtUtc: NOW,
    });
    expect(report.ready).toBe(false);
    expect(report.projects.ready).toBe(false);
    const entry = report.projects.entries.find((e) => e.internalName === 'estimatorUpns');
    expect(entry?.state).toBe('wrong-type');
    expect(entry?.observedTypeAsString).toBe('Text');
    expect(entry?.expectedTypeAsString).toBe('Note');
  });

  it('flags wrong-type when procoreProject is stored as Note instead of Text on the Registry', () => {
    const snapshot = registryLiveSnapshot().map((field) =>
      field.internalName === 'procoreProject' ? { ...field, typeAsString: 'Note' } : field,
    );
    const report = buildProjectsRoleSchemaReadinessReport({
      projectsFields: projectsLiveSnapshot(),
      legacyRegistryFields: snapshot,
      generatedAtUtc: NOW,
    });
    expect(report.ready).toBe(false);
    const entry = report.legacyRegistry.entries.find((e) => e.internalName === 'procoreProject');
    expect(entry?.state).toBe('wrong-type');
    expect(entry?.observedTypeAsString).toBe('Note');
    expect(entry?.expectedTypeAsString).toBe('Text');
  });

  it('flags wrong-type when buildingConnectedUrl is stored as Note instead of Text on Projects', () => {
    const snapshot = projectsLiveSnapshot().map((field) =>
      field.internalName === 'buildingConnectedUrl' ? { ...field, typeAsString: 'Note' } : field,
    );
    const report = buildProjectsRoleSchemaReadinessReport({
      projectsFields: snapshot,
      legacyRegistryFields: registryLiveSnapshot(),
      generatedAtUtc: NOW,
    });
    expect(report.ready).toBe(false);
    const entry = report.projects.entries.find((e) => e.internalName === 'buildingConnectedUrl');
    expect(entry?.state).toBe('wrong-type');
    expect(entry?.observedTypeAsString).toBe('Note');
    expect(entry?.expectedTypeAsString).toBe('Text');
  });

  it('flags wrong-type when projectStage is stored as Note instead of Text on the Registry', () => {
    const snapshot = registryLiveSnapshot().map((field) =>
      field.internalName === 'projectStage' ? { ...field, typeAsString: 'Note' } : field,
    );
    const report = buildProjectsRoleSchemaReadinessReport({
      projectsFields: projectsLiveSnapshot(),
      legacyRegistryFields: snapshot,
      generatedAtUtc: NOW,
    });
    expect(report.ready).toBe(false);
    const entry = report.legacyRegistry.entries.find((e) => e.internalName === 'projectStage');
    expect(entry?.state).toBe('wrong-type');
    expect(entry?.observedTypeAsString).toBe('Note');
    expect(entry?.expectedTypeAsString).toBe('Text');
  });
});

describe('buildProjectsRoleSchemaReadinessReport — list metadata', () => {
  it('stamps listName on each per-list block', () => {
    const report = buildProjectsRoleSchemaReadinessReport({
      projectsFields: projectsLiveSnapshot(),
      legacyRegistryFields: registryLiveSnapshot(),
      generatedAtUtc: NOW,
    });
    expect(report.projects.listName).toBe('Projects');
    expect(report.legacyRegistry.listName).toBe('Legacy Project Fallback Registry');
  });

  it('contains exactly 16 entries for Projects and 18 for Legacy Registry regardless of input snapshot size', () => {
    const padded = [
      ...projectsLiveSnapshot(),
      { internalName: 'extraneous_field', typeAsString: 'Text' },
    ];
    const report = buildProjectsRoleSchemaReadinessReport({
      projectsFields: padded,
      legacyRegistryFields: registryLiveSnapshot(),
      generatedAtUtc: NOW,
    });
    expect(report.projects.entries).toHaveLength(16);
    expect(report.legacyRegistry.entries).toHaveLength(18);
  });
});
