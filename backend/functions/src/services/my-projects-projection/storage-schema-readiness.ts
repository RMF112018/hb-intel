import {
  getCompatibleSharePointFieldTypes,
  type ILiveSharePointFieldSnapshot,
} from '../sharepoint-schema-provisioning/index.js';
import {
  MY_PROJECTS_PROJECTION_STORAGE_DESCRIPTOR,
  type IStorageSchemaDocument,
  type IStorageSchemaList,
  loadMyProjectsProjectionStorageSchema,
} from './storage-list-descriptor.js';

export const MY_PROJECTS_STORAGE_READINESS_STATES = [
  'live-verified',
  'missing',
  'wrong-type',
  'wrong-choice',
  'wrong-index',
  'wrong-unique',
] as const;

export type MyProjectsStorageReadinessState =
  (typeof MY_PROJECTS_STORAGE_READINESS_STATES)[number];

export interface IStorageReadinessEntry {
  readonly listTitle: string;
  readonly internalName: string;
  readonly expectedTypeAsString: string;
  readonly observedTypeAsString: string | null;
  readonly expectedIndexed?: boolean;
  readonly observedIndexed?: boolean;
  readonly expectedUnique?: boolean;
  readonly observedUnique?: boolean;
  readonly expectedChoices?: readonly string[];
  readonly observedChoices?: readonly string[];
  readonly state: MyProjectsStorageReadinessState;
}

export interface IStorageReadinessListReport {
  readonly listTitle: string;
  readonly ready: boolean;
  readonly entries: readonly IStorageReadinessEntry[];
}

export interface IStorageSchemaReadinessReport {
  readonly ready: boolean;
  readonly generatedAtUtc: string;
  readonly listReports: readonly IStorageReadinessListReport[];
}

export interface IStorageLiveListSnapshot {
  readonly listTitle: string;
  readonly fields: readonly ILiveSharePointFieldSnapshot[];
  readonly enforceUniqueValues?: Readonly<Record<string, boolean>>;
}

function normalizeChoices(values: readonly string[] | undefined): readonly string[] {
  return (values ?? []).map((value) => value.trim());
}

function choicesEqual(
  expected: readonly string[] | undefined,
  observed: readonly string[] | undefined,
): boolean {
  const left = normalizeChoices(expected);
  const right = normalizeChoices(observed);
  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
}

function expectedType(fieldType: string): string {
  const compat = getCompatibleSharePointFieldTypes(
    fieldType as
      | 'Text'
      | 'Number'
      | 'DateTime'
      | 'Boolean'
      | 'Choice'
      | 'User'
      | 'URL'
      | 'Lookup'
      | 'MultiLineText',
  );
  return compat[0] ?? 'Text';
}

function classifyField(
  listTitle: string,
  field: { internalName: string; type: string; indexed?: boolean; unique?: boolean; choices?: readonly string[] },
  snapshot: IStorageLiveListSnapshot,
): IStorageReadinessEntry {
  const live = snapshot.fields.find((item) => item.InternalName === field.internalName);
  const expectedTypeAsString = expectedType(field.type);
  if (!live) {
    return {
      listTitle,
      internalName: field.internalName,
      expectedTypeAsString,
      observedTypeAsString: null,
      expectedIndexed: field.indexed,
      expectedUnique: field.unique,
      expectedChoices: field.choices,
      state: 'missing',
    };
  }

  const compatibleTypes = getCompatibleSharePointFieldTypes(
    field.type as
      | 'Text'
      | 'Number'
      | 'DateTime'
      | 'Boolean'
      | 'Choice'
      | 'User'
      | 'URL'
      | 'Lookup'
      | 'MultiLineText',
  );
  if (!compatibleTypes.includes(live.TypeAsString)) {
    return {
      listTitle,
      internalName: field.internalName,
      expectedTypeAsString,
      observedTypeAsString: live.TypeAsString,
      expectedIndexed: field.indexed,
      observedIndexed: live.Indexed,
      expectedUnique: field.unique,
      observedUnique: snapshot.enforceUniqueValues?.[field.internalName],
      expectedChoices: field.choices,
      observedChoices: live.Choices,
      state: 'wrong-type',
    };
  }

  if (field.choices && field.choices.length > 0 && !choicesEqual(field.choices, live.Choices)) {
    return {
      listTitle,
      internalName: field.internalName,
      expectedTypeAsString,
      observedTypeAsString: live.TypeAsString,
      expectedIndexed: field.indexed,
      observedIndexed: live.Indexed,
      expectedUnique: field.unique,
      observedUnique: snapshot.enforceUniqueValues?.[field.internalName],
      expectedChoices: field.choices,
      observedChoices: live.Choices,
      state: 'wrong-choice',
    };
  }

  if (field.indexed === true && live.Indexed !== true) {
    return {
      listTitle,
      internalName: field.internalName,
      expectedTypeAsString,
      observedTypeAsString: live.TypeAsString,
      expectedIndexed: field.indexed,
      observedIndexed: live.Indexed,
      expectedUnique: field.unique,
      observedUnique: snapshot.enforceUniqueValues?.[field.internalName],
      expectedChoices: field.choices,
      observedChoices: live.Choices,
      state: 'wrong-index',
    };
  }

  if (field.unique === true && snapshot.enforceUniqueValues?.[field.internalName] !== true) {
    return {
      listTitle,
      internalName: field.internalName,
      expectedTypeAsString,
      observedTypeAsString: live.TypeAsString,
      expectedIndexed: field.indexed,
      observedIndexed: live.Indexed,
      expectedUnique: field.unique,
      observedUnique: snapshot.enforceUniqueValues?.[field.internalName],
      expectedChoices: field.choices,
      observedChoices: live.Choices,
      state: 'wrong-unique',
    };
  }

  return {
    listTitle,
    internalName: field.internalName,
    expectedTypeAsString,
    observedTypeAsString: live.TypeAsString,
    expectedIndexed: field.indexed,
    observedIndexed: live.Indexed,
    expectedUnique: field.unique,
    observedUnique: snapshot.enforceUniqueValues?.[field.internalName],
    expectedChoices: field.choices,
    observedChoices: live.Choices,
    state: 'live-verified',
  };
}

export function buildMyProjectsProjectionStorageReadinessReport(input: {
  readonly generatedAtUtc: string;
  readonly liveLists: readonly IStorageLiveListSnapshot[];
  readonly schema?: IStorageSchemaDocument;
}): IStorageSchemaReadinessReport {
  const schema = input.schema ?? loadMyProjectsProjectionStorageSchema();
  const listReports = schema.lists.map((list: IStorageSchemaList) => {
    const descriptor = MY_PROJECTS_PROJECTION_STORAGE_DESCRIPTOR.find((d) => d.title === list.title);
    const live = input.liveLists.find((entry) => entry.listTitle === list.title) ?? {
      listTitle: list.title,
      fields: [],
      enforceUniqueValues: {},
    };
    const entries = (descriptor?.fields ?? []).map((field) =>
      classifyField(list.title, field, live),
    );
    return {
      listTitle: list.title,
      ready: entries.every((entry) => entry.state === 'live-verified'),
      entries,
    };
  });

  return {
    ready: listReports.every((list) => list.ready),
    generatedAtUtc: input.generatedAtUtc,
    listReports,
  };
}
