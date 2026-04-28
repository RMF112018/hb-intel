# Prompt 03 — Phase 1 Step 4 Wave 2 Content and Experience Families

## Objective

Populate the second four family schemas from the Phase 1 Step 3 field maps:

```text
libraries
lists
modules
pages
```

This is Wave 2 of Phase 1 Step 4.

Do not populate Wave 3 family schemas in this prompt.

---

## Required Prerequisite

Wave 1 must be complete and validated.

---

## Required Input Field Maps

Use:

```text
packages/project-site-template/fields/common-fields.json
packages/project-site-template/fields/families/libraries.fields.json
packages/project-site-template/fields/families/lists.fields.json
packages/project-site-template/fields/families/modules.fields.json
packages/project-site-template/fields/families/pages.fields.json
packages/project-site-template/fields/family-field-dependencies.json
packages/project-site-template/schemas/families/enums.schema.json
packages/project-site-template/schemas/families/validation-rules.schema.json
```

## Files You May Modify

```text
packages/project-site-template/schemas/families/libraries.schema.json
packages/project-site-template/schemas/families/lists.schema.json
packages/project-site-template/schemas/families/modules.schema.json
packages/project-site-template/schemas/families/pages.schema.json
packages/project-site-template/template-contract.json
packages/project-site-template/docs/Phase_1_Step_4_Per_Family_Schema_Population_Notes.md
```

Do not modify Wave 1 schemas unless a narrow reference correction is required and documented.

---

## Family-Specific Requirements

### libraries

Populate schema support for:

- document library definitions;
- library metadata;
- views;
- archive/read-only behavior;
- evidence-link support;
- no Procore binary mirror posture.

### lists

Populate schema support for:

- SharePoint list definitions;
- baseline list fields;
- per-list required/optional fields;
- views and indexes where field maps support them;
- lookup dependencies;
- governance metadata;
- list-level validation-rule bindings.

### modules

Populate schema support for:

- module registry;
- module visibility keyed on ProjectStage;
- vertical seeding keyed on ProjectType;
- rollup contribution;
- MVP/future/deferred treatment;
- HBI Assistant deferral.

### pages

Populate schema support for:

- site pages;
- shell pages;
- module pages;
- settings pages;
- page routes/metadata;
- non-native-admin-user posture.

---

## Required Validation

After Wave 2:

1. The four schema files parse as valid JSON.
2. They use canonical Decision Closure `mvp_status` values.
3. They do not use scaffold shorthand as canonical enum values.
4. They include field definitions traceable to their `.fields.json` files.
5. Module visibility is keyed on ProjectStage, not ProjectType.
6. Vertical seeding is keyed on ProjectType, not ProjectStage.
7. Archived is ProjectStatus only.
8. No Wave 3 family schema was modified.
9. `enums.schema.json` and `validation-rules.schema.json` were not modified.
10. No backend, SPFx, provisioning, manifest, test, generated, CI, dependency, script, root-workspace, package, or deploy changes occurred.

## Completion Summary

Output:

```markdown
## Wave 2 Completion Summary

### Files Modified
### Families Populated
### Validation Performed
### Guardrails Preserved
### Issues / Risks
### Continue to Wave 3?
```
