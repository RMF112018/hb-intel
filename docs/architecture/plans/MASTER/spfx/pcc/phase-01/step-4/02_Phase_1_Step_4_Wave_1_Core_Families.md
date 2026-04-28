# Prompt 02 — Phase 1 Step 4 Wave 1 Core Families

## Objective

Populate the first four core family schemas from the Phase 1 Step 3 field maps:

```text
template-manifest
site
settings
permissions
```

This is Wave 1 of Phase 1 Step 4.

Do not populate any Wave 2 or Wave 3 family schemas in this prompt.

---

## Required Input Field Maps

Use:

```text
packages/project-site-template/fields/common-fields.json
packages/project-site-template/fields/families/template-manifest.fields.json
packages/project-site-template/fields/families/site.fields.json
packages/project-site-template/fields/families/settings.fields.json
packages/project-site-template/fields/families/permissions.fields.json
packages/project-site-template/schemas/families/enums.schema.json
packages/project-site-template/schemas/families/validation-rules.schema.json
```

## Files You May Modify

```text
packages/project-site-template/schemas/families/template-manifest.schema.json
packages/project-site-template/schemas/families/site.schema.json
packages/project-site-template/schemas/families/settings.schema.json
packages/project-site-template/schemas/families/permissions.schema.json
packages/project-site-template/template-contract.json
packages/project-site-template/docs/Phase_1_Step_4_Per_Family_Schema_Population_Notes.md
```

Do not modify other family schemas.

---

## Family-Specific Requirements

### template-manifest

Populate schema support for:

- template identity;
- version;
- owner;
- source traceability;
- ProjectType / ProjectStage / ProjectStatus bindings where applicable;
- Decision Closure status / `mvp_status`;
- validation-rule references;
- manifest-level no-secret guardrails.

### site

Populate schema support for:

- project identity;
- site URL and naming conventions;
- project metadata;
- phase association;
- archive/read-only behavior;
- ProjectType / ProjectStage / ProjectStatus;
- runtime source relationships;
- site-level validation-rule bindings.

### settings

Populate schema support for:

- Control Center Settings;
- module settings;
- integration settings;
- runtime configuration references;
- `ProcoreCompanyId = 5280` as configuration, not secret;
- no-secret posture;
- no-native-SharePoint-admin posture.

### permissions

Populate schema support for:

- SharePoint groups;
- permission templates;
- access manager rules;
- expiration defaults;
- access audit concepts;
- external-user deferral;
- Procore directory comparison not granting access.

---

## Required Validation

After Wave 1:

1. The four schema files parse as valid JSON.
2. They use canonical Decision Closure `mvp_status` values.
3. They do not use scaffold shorthand as canonical enum values.
4. They include field definitions traceable to their `.fields.json` files.
5. `ProcoreCompanyId = 5280` is not represented as a secret.
6. External users remain Deferred.
7. No Wave 2 or Wave 3 family schema was modified.
8. `enums.schema.json` and `validation-rules.schema.json` were not modified.
9. No backend, SPFx, provisioning, manifest, test, generated, CI, dependency, script, root-workspace, package, or deploy changes occurred.

## Completion Summary

Output:

```markdown
## Wave 1 Completion Summary

### Files Modified
### Families Populated
### Validation Performed
### Guardrails Preserved
### Issues / Risks
### Continue to Wave 2?
```
