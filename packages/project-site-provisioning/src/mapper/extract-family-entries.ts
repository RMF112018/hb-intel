import {
  OBJECT_PLAN_KEY_TO_FAMILY,
  type ObjectPlanKey,
  type PlannedObjectEntry,
} from '../contracts/provisioning-manifest.js';
import type {
  ContractFamilyName,
  TemplateArtifacts,
} from '../contracts/template-artifacts.js';

const GLOBAL_DEPENDED_ON_FAMILIES: readonly ContractFamilyName[] = ['enums', 'validation-rules'];

/**
 * Build the planned object entry for a single family. Returns 0 entries
 * when no fixture is available; otherwise returns exactly one
 * family-level entry capturing identity, source traceability, mvp
 * status, validation refs, field counts (when a field map exists), and
 * dependency edges.
 *
 * Per-instance enumeration (e.g., 17 individual pages) is intentionally
 * deferred; the machine-readable contract does not enumerate instances.
 * See README.md "Known limitations".
 */
export function extractFamilyEntries(
  family: ObjectPlanKey,
  artifacts: TemplateArtifacts,
): readonly PlannedObjectEntry[] {
  const familyName = OBJECT_PLAN_KEY_TO_FAMILY[family];
  const fixture = artifacts.familyFixtures[familyName];
  if (!fixture) return [];

  const fieldMap = artifacts.familyFieldMaps[familyName];
  const catalogRow = artifacts.objectCatalog.rows.find((r) => r.schemaFamily === familyName);
  const dependencyEdge = artifacts.fieldDependencies.dependencies.find((d) => d.family === familyName);

  const familyFields = fieldMap?.familyFields ?? [];
  const fieldCount = familyFields.length > 0 ? familyFields.length : undefined;
  const requiredFieldCount =
    fieldCount === undefined ? undefined : familyFields.filter((f) => f.required === true).length;
  const optionalFieldCount =
    fieldCount === undefined || requiredFieldCount === undefined
      ? undefined
      : fieldCount - requiredFieldCount;

  const blocksGenerationIfMissing = (() => {
    if (catalogRow?.mvpTreatment === 'Frozen for MVP') return true;
    if (GLOBAL_DEPENDED_ON_FAMILIES.includes(familyName)) return true;
    return false;
  })();

  const dependencies = dependencyEdge?.dependsOn ?? undefined;

  const mvpStatus = typeof fixture.mvp_status === 'string' && fixture.mvp_status.length > 0
    ? fixture.mvp_status
    : 'unknown';

  const entry: PlannedObjectEntry = {
    id: fixture.id,
    family,
    kind: fixture.kind,
    ...(fixture.sourceContractSection ? { sourceContractSection: fixture.sourceContractSection } : {}),
    ...(fixture.sourceCatalogId ? { sourceCatalogId: fixture.sourceCatalogId } : {}),
    ...(fixture.sourceBlueprintSection ? { sourceBlueprintSection: fixture.sourceBlueprintSection } : {}),
    ...(fixture.sourceDecisionRef ? { sourceDecisionRef: fixture.sourceDecisionRef } : {}),
    mvpStatus,
    ...(fixture.ownerCategory ? { ownerCategory: fixture.ownerCategory } : {}),
    validationRuleRefs: Object.freeze([...(fixture.validationRuleRefs ?? [])]),
    blocksGenerationIfMissing,
    ...(fieldCount !== undefined ? { fieldCount } : {}),
    ...(requiredFieldCount !== undefined ? { requiredFieldCount } : {}),
    ...(optionalFieldCount !== undefined ? { optionalFieldCount } : {}),
    ...(dependencies && dependencies.length > 0
      ? { dependencies: Object.freeze([...dependencies]) }
      : {}),
    plannedOnly: true,
    mutationAllowed: false,
  };

  return Object.freeze([Object.freeze(entry)]);
}
