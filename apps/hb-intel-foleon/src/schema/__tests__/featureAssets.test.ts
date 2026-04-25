import { describe, expect, it } from 'vitest';
import {
  EXPECTED_ELEMENT_MANIFESTS,
  EXPECTED_SCHEMA_FILES,
  EXPECTED_LISTS,
  LAUNCH_INDEXES,
  UNIQUE_FIELDS,
  MAX_CUSTOM_INDEXED_FIELDS,
  buildFoleonFeatureAssetModel,
  validateFoleonFeatureAssets,
} from '../../../scripts/validate-foleon-feature-assets.js';
import { FOLEON_LIST_SCHEMAS } from '../foleonListSchemas.js';

const model = buildFoleonFeatureAssetModel();
const checks = validateFoleonFeatureAssets(model);

function checkPassed(name: string): void {
  const check = checks.find((entry) => entry.name === name);
  expect(check, `Missing validation check: ${name}`).toBeDefined();
  expect(check?.pass, check?.details).toBe(true);
}

describe('Feature Framework parser-backed validation', () => {
  it('passes the full shared CLI validation suite', () => {
    const failed = checks.filter((entry) => !entry.pass);
    expect(failed, failed.map((entry) => `${entry.name}: ${entry.details ?? ''}`).join('\n')).toEqual([]);
  });

  it('parses elements.xml and every expected schema XML file', () => {
    checkPassed('elements.xml exists and parses');
    checkPassed('all expected schema files exist and parse');
    expect(model.schemas.map((schema) => schema.fileName)).toEqual([...EXPECTED_SCHEMA_FILES]);
  });

  it('declares exactly the intended package-solution feature assets', () => {
    checkPassed('package-solution declares exactly the expected element manifests');
    checkPassed('package-solution declares exactly the expected schema element files');
    const feature = model.packageSolution.solution.features[0]!;
    expect(feature.assets?.elementManifests).toEqual([...EXPECTED_ELEMENT_MANIFESTS]);
    expect(feature.assets?.elementFiles).toEqual([...EXPECTED_SCHEMA_FILES]);
  });

  it('resolves every CustomSchema and rejects stale schema files', () => {
    checkPassed('every CustomSchema reference resolves to an expected schema file');
    checkPassed('every expected schema file is referenced by one ListInstance');
    checkPassed('no stale schema XML files exist under sharepoint/assets');
  });

  it('declares ListInstances in dependency-safe provisioning order', () => {
    expect(model.listInstances.map((instance) => instance.url)).toEqual(
      EXPECTED_LISTS.map((entry) => entry.url),
    );
    checkPassed('HB_FoleonHomepagePlacements.ContentLookup lookup target is declared before lookup list');
  });

  it('has no duplicate field IDs or field names', () => {
    for (const list of EXPECTED_LISTS) {
      checkPassed(`${list.internalName} has no duplicate field internal names`);
    }
    const duplicateFieldIdChecks = checks.filter((entry) => entry.name.startsWith('custom field ID '));
    expect(duplicateFieldIdChecks.length).toBeGreaterThan(0);
    expect(duplicateFieldIdChecks.every((entry) => entry.pass)).toBe(true);
  });

  it('keeps index counts within the configured budget', () => {
    for (const schema of model.schemas) {
      expect(schema.indexedFieldCount).toBeLessThanOrEqual(MAX_CUSTOM_INDEXED_FIELDS);
      checkPassed(`${schema.internalName} indexed custom field count is within threshold`);
    }
  });

  it('requires launch indexes and rejects non-launch indexes', () => {
    for (const list of EXPECTED_LISTS) {
      const schema = model.schemas.find((entry) => entry.internalName === list.internalName)!;
      const indexed = schema.fields
        .filter((field) => field.indexed)
        .map((field) => field.internalName);
      expect(indexed).toEqual([...LAUNCH_INDEXES[list.internalName]]);
      checkPassed(`${list.internalName} required launch indexes are present`);
      checkPassed(`${list.internalName} has no unexpected launch indexes`);
    }
  });

  it('validates view field references against known fields and built-ins', () => {
    for (const schema of model.schemas) {
      for (const view of schema.views) {
        checkPassed(`${schema.internalName} view ${view.displayName} references known fields`);
      }
    }
  });

  it('validates lookup target URL and ShowField posture', () => {
    checkPassed('HB_FoleonHomepagePlacements.ContentLookup lookup target matches a ListInstance URL');
    checkPassed('HB_FoleonHomepagePlacements.ContentLookup lookup target is declared before lookup list');
    checkPassed('HB_FoleonHomepagePlacements.ContentLookup lookup ShowField is Title');
  });

  it('validates uniqueness posture for unique-intent fields', () => {
    for (const list of EXPECTED_LISTS) {
      for (const fieldName of UNIQUE_FIELDS[list.internalName]) {
        checkPassed(`${list.internalName}.${fieldName} is indexed for uniqueness`);
        checkPassed(`${list.internalName}.${fieldName} uses EnforceUniqueValues`);
      }
    }
  });

  it('validates versioning and attachment posture', () => {
    for (const list of EXPECTED_LISTS) {
      checkPassed(`${list.internalName} versioning posture is correct`);
      checkPassed(`${list.internalName} attachments are disabled`);
    }
  });

  it('keeps XML and code-level schema metadata aligned', () => {
    for (const schema of model.schemas) {
      const codeSchema = FOLEON_LIST_SCHEMAS.find((entry) => entry.internalName === schema.internalName)!;
      for (const field of schema.fields) {
        expect(codeSchema.fields.some((entry) => entry.internalName === field.internalName)).toBe(true);
        checkPassed(`${schema.internalName}.${field.internalName} required metadata matches XML`);
        checkPassed(`${schema.internalName}.${field.internalName} launch-index metadata matches XML`);
        checkPassed(`${schema.internalName}.${field.internalName} uniqueness metadata matches XML`);
      }
    }
  });
});
