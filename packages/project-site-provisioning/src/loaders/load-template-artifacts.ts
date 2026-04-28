import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  CONTRACT_FAMILY_NAMES,
  type CommonFields,
  type ContractFamilyName,
  type FamilyFieldDependencies,
  type FamilyFieldMap,
  type FamilyFixture,
  type ObjectCatalog,
  type TemplateArtifacts,
  type TemplateContractData,
} from '../contracts/template-artifacts.js';

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

const FIELD_MAP_FAMILIES: readonly ContractFamilyName[] = [
  'template-manifest',
  'settings',
  'permissions',
  'site',
  'pages',
  'libraries',
  'lists',
  'modules',
  'workflows',
  'integrations',
  'site-health',
  'provisioning-validation',
];

/**
 * Synchronously load the canonical Standard Project Site Template
 * artifacts from a `@hbc/project-site-template` package root.
 *
 * Read-only. No network. No mutation. Callers pass the resolved root
 * path (`{repoRoot}/packages/project-site-template`); the loader does
 * not perform package resolution itself.
 */
export function loadTemplateArtifactsFromPackage(packageRoot: string): TemplateArtifacts {
  const templateContract = readJson<TemplateContractData>(
    join(packageRoot, 'template-contract.json'),
  );

  const familyFixtures: Partial<Record<ContractFamilyName, FamilyFixture>> = {};
  for (const family of CONTRACT_FAMILY_NAMES) {
    try {
      familyFixtures[family] = readJson<FamilyFixture>(
        join(packageRoot, 'validation', 'fixtures', 'valid', `${family}.valid.json`),
      );
    } catch {
      // family fixture absent — leave undefined; mapper handles missing entries.
    }
  }

  const familyFieldMaps: Partial<Record<ContractFamilyName, FamilyFieldMap>> = {};
  for (const family of FIELD_MAP_FAMILIES) {
    try {
      familyFieldMaps[family] = readJson<FamilyFieldMap>(
        join(packageRoot, 'fields', 'families', `${family}.fields.json`),
      );
    } catch {
      // field map absent — leave undefined.
    }
  }

  const objectCatalog = readJson<ObjectCatalog>(
    join(packageRoot, 'fields', 'object-catalog-field-disposition.json'),
  );
  const fieldDependencies = readJson<FamilyFieldDependencies>(
    join(packageRoot, 'fields', 'family-field-dependencies.json'),
  );
  const commonFields = readJson<CommonFields>(
    join(packageRoot, 'fields', 'common-fields.json'),
  );

  return Object.freeze({
    templateContract: Object.freeze(templateContract),
    familyFixtures: Object.freeze(familyFixtures),
    familyFieldMaps: Object.freeze(familyFieldMaps),
    objectCatalog: Object.freeze(objectCatalog),
    fieldDependencies: Object.freeze(fieldDependencies),
    commonFields: Object.freeze(commonFields),
  });
}
