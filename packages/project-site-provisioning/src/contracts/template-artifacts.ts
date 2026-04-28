/**
 * Shape of the template artifacts the planner consumes. The mapper takes
 * an instance of this interface; a separate filesystem loader builds it
 * from `@hbc/project-site-template` JSON files.
 *
 * All fields are read-only views of source-of-truth data owned by the
 * template package. The planner must never mutate them.
 */

export type ContractFamilyName =
  | 'template-manifest'
  | 'enums'
  | 'settings'
  | 'permissions'
  | 'site'
  | 'pages'
  | 'libraries'
  | 'lists'
  | 'modules'
  | 'workflows'
  | 'integrations'
  | 'site-health'
  | 'provisioning-validation'
  | 'validation-rules';

export const CONTRACT_FAMILY_NAMES = [
  'template-manifest',
  'enums',
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
  'validation-rules',
] as const satisfies readonly ContractFamilyName[];

export interface TemplateContractData {
  readonly templateName: string;
  readonly templateVersion: string;
  readonly templateFamily?: string;
  readonly phase?: string;
  readonly source?: { readonly contractRef?: string };
  readonly families?: Record<string, { readonly schema?: string; readonly status?: string; readonly notes?: string }>;
}

export interface FamilyFixture {
  readonly id: string;
  readonly kind: string;
  readonly mvp_status?: string;
  readonly sourceContractSection?: string;
  readonly sourceCatalogId?: string;
  readonly sourceBlueprintSection?: string;
  readonly sourceDecisionRef?: string;
  readonly validationRuleRefs?: readonly string[];
  readonly ownerCategory?: string;
  readonly notes?: string;
  readonly [extra: string]: unknown;
}

export interface FamilyFieldDefinition {
  readonly fieldName: string;
  readonly fieldType?: string;
  readonly required?: boolean;
  readonly mvpStatus?: string;
  readonly sourceContractSection?: string;
  readonly sourceCatalogId?: string;
  readonly sourceDecisionRef?: string;
  readonly validationRuleRefs?: readonly string[];
  readonly description?: string;
  readonly notes?: string;
}

export interface FamilyFieldMap {
  readonly family: string;
  readonly commonFields?: readonly string[];
  readonly familyFields?: readonly FamilyFieldDefinition[];
  readonly deferredFields?: readonly FamilyFieldDefinition[];
  readonly proofGatedFields?: readonly FamilyFieldDefinition[];
  readonly runtimeConfigurationFields?: readonly FamilyFieldDefinition[];
  readonly validationRuleRefs?: readonly string[];
  readonly dependencies?: readonly string[];
  readonly notes?: string;
}

export interface ObjectCatalogRow {
  readonly catalogId: string;
  readonly objectKind: string;
  readonly contractSection?: string;
  readonly schemaFamily: string;
  readonly fieldMapFile?: string;
  readonly extractionTreatment?: string;
  readonly mvpTreatment?: string;
  readonly requiredFieldConsolidationState?: string;
  readonly validationRuleRefs?: readonly string[];
  readonly step4Readiness?: boolean;
  readonly notes?: string;
}

export interface ObjectCatalog {
  readonly phase?: string;
  readonly extractionTreatmentValues?: readonly string[];
  readonly rows: readonly ObjectCatalogRow[];
}

export interface FamilyDependencyEdge {
  readonly family: string;
  readonly dependsOn: readonly string[];
  readonly rationale?: string;
}

export interface FamilyFieldDependencies {
  readonly globalReferences?: {
    readonly description?: string;
    readonly referencedBy?: readonly string[];
  };
  readonly alreadyPopulated?: readonly { readonly family: string; readonly schema?: string; readonly phase?: string }[];
  readonly dependencies: readonly FamilyDependencyEdge[];
  readonly stepFourPopulationOrderRecommendation?: readonly string[];
  readonly notes?: string;
}

export interface CommonFieldDefinition {
  readonly fieldName: string;
  readonly fieldType?: string;
  readonly requiredByDefault?: boolean;
  readonly canonicalStatus?: string;
  readonly source?: string;
  readonly validationRuleRefs?: readonly string[];
  readonly description?: string;
  readonly notes?: string;
}

export interface CommonFields {
  readonly canonicalDecisionClosureValues?: readonly string[];
  readonly commonFields: readonly CommonFieldDefinition[];
}

export interface TemplateArtifacts {
  readonly templateContract: TemplateContractData;
  readonly familyFixtures: Readonly<Partial<Record<ContractFamilyName, FamilyFixture>>>;
  readonly familyFieldMaps: Readonly<Partial<Record<ContractFamilyName, FamilyFieldMap>>>;
  readonly objectCatalog: ObjectCatalog;
  readonly fieldDependencies: FamilyFieldDependencies;
  readonly commonFields: CommonFields;
}
