import { describe, expect, it } from 'vitest';
import { LEGACY_FALLBACK_LIST_DESCRIPTORS } from '../legacy-fallback/list-descriptors.js';
import {
  buildListFieldPlans,
  getCompatibleSharePointFieldTypes,
  isSharePointFieldTypeCompatible,
} from '../sharepoint-schema-provisioning/index.js';

describe('sharepoint schema provisioning compatibility', () => {
  it('covers canonical compatibility mappings', () => {
    expect(isSharePointFieldTypeCompatible('Text', 'Text')).toBe(true);
    expect(isSharePointFieldTypeCompatible('Number', 'Currency')).toBe(true);
    expect(isSharePointFieldTypeCompatible('DateTime', 'DateTime')).toBe(true);
    expect(isSharePointFieldTypeCompatible('Boolean', 'Boolean')).toBe(true);
    expect(isSharePointFieldTypeCompatible('Choice', 'MultiChoice')).toBe(true);
    expect(isSharePointFieldTypeCompatible('User', 'User')).toBe(true);
    expect(isSharePointFieldTypeCompatible('URL', 'URL')).toBe(true);
    expect(isSharePointFieldTypeCompatible('Lookup', 'LookupMulti')).toBe(true);
    expect(isSharePointFieldTypeCompatible('MultiLineText', 'Note')).toBe(true);
    expect(isSharePointFieldTypeCompatible('MultiLineText', 'Text')).toBe(false);
  });

  it('exposes diagnostic compatible type families', () => {
    expect(getCompatibleSharePointFieldTypes('Choice')).toEqual(['Choice', 'MultiChoice']);
    expect(getCompatibleSharePointFieldTypes('Lookup')).toEqual(['Lookup', 'LookupMulti']);
  });
});

describe('sharepoint schema provisioning planner', () => {
  it('plans creates for missing fields', () => {
    const fields = [{ internalName: 'Title2', displayName: 'Title2', type: 'Text' as const }];
    const { plans, unresolvedMutations } = buildListFieldPlans('Projects', fields, []);
    expect(plans).toHaveLength(1);
    expect(plans[0]?.kind).toBe('create');
    expect(unresolvedMutations).toEqual([]);
  });

  it('produces no-op when a compatible field is already aligned', () => {
    const fields = [{ internalName: 'CostCode', displayName: 'Cost Code', type: 'Text' as const, required: false }];
    const live = [{ InternalName: 'CostCode', Title: 'Cost Code', TypeAsString: 'Text', Required: false }];
    const { plans, unresolvedMutations } = buildListFieldPlans('Projects', fields, live);
    expect(plans[0]?.kind).toBe('no-op');
    expect(unresolvedMutations).toEqual([]);
  });

  it('produces blocker for wrong-type field', () => {
    const fields = [{ internalName: 'Score', displayName: 'Score', type: 'Number' as const }];
    const live = [{ InternalName: 'Score', Title: 'Score', TypeAsString: 'Text' }];
    const { plans, unresolvedMutations } = buildListFieldPlans('Projects', fields, live);
    expect(plans[0]?.kind).toBe('blocker-wrong-type');
    expect(unresolvedMutations).toHaveLength(1);
    expect(unresolvedMutations[0]?.liveType).toBe('Text');
  });

  it('produces update-settings for compatible setting changes', () => {
    const fields = [{
      internalName: 'RoleArrayJson',
      displayName: 'Role Array Json',
      type: 'Choice' as const,
      required: true,
      choices: ['A', 'B'],
      indexed: true,
      defaultValue: 'A',
    }];
    const live = [{
      InternalName: 'RoleArrayJson',
      Title: 'Role Array Json',
      TypeAsString: 'Choice',
      Required: false,
      Indexed: false,
      DefaultValue: '',
      Choices: ['A'],
    }];
    const { plans, unresolvedMutations } = buildListFieldPlans('Projects', fields, live);
    expect(plans[0]?.kind).toBe('update-settings');
    if (plans[0]?.kind === 'update-settings') {
      expect(plans[0].updates).toEqual({
        required: true,
        choices: ['A', 'B'],
        indexed: true,
        defaultValue: 'A',
      });
    }
    expect(unresolvedMutations).toEqual([]);
  });
});

describe('legacy fallback descriptor planning regression', () => {
  it('keeps legacy descriptor planning stable for fully matching live snapshots', () => {
    for (const descriptor of LEGACY_FALLBACK_LIST_DESCRIPTORS) {
      const liveFields = descriptor.fields.map((field) => ({
        InternalName: field.internalName,
        Title: field.displayName,
        TypeAsString: field.type === 'MultiLineText' ? 'Note' : field.type,
        Required: field.required ?? false,
        Indexed: field.indexed ?? false,
        DefaultValue: field.defaultValue ?? '',
        Choices: field.choices ?? [],
      }));

      const { plans, unresolvedMutations } = buildListFieldPlans(descriptor.title, descriptor.fields, liveFields);
      expect(unresolvedMutations).toEqual([]);
      expect(plans.every((plan) => plan.kind === 'no-op')).toBe(true);
    }
  });
});
