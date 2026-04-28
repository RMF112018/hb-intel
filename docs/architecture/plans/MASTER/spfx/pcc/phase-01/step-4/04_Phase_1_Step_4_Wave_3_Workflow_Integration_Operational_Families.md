# Prompt 04 — Phase 1 Step 4 Wave 3 Workflow, Integration, and Operational Families

## Objective

Populate the final four family schemas from the Phase 1 Step 3 field maps:

```text
workflows
integrations
provisioning-validation
site-health
```

This is Wave 3 of Phase 1 Step 4.

---

## Required Prerequisite

Wave 1 and Wave 2 must be complete and validated.

---

## Required Input Field Maps

Use:

```text
packages/project-site-template/fields/common-fields.json
packages/project-site-template/fields/families/workflows.fields.json
packages/project-site-template/fields/families/integrations.fields.json
packages/project-site-template/fields/families/provisioning-validation.fields.json
packages/project-site-template/fields/families/site-health.fields.json
packages/project-site-template/fields/object-catalog-field-disposition.json
packages/project-site-template/fields/family-field-dependencies.json
packages/project-site-template/schemas/families/enums.schema.json
packages/project-site-template/schemas/families/validation-rules.schema.json
```

## Files You May Modify

```text
packages/project-site-template/schemas/families/workflows.schema.json
packages/project-site-template/schemas/families/integrations.schema.json
packages/project-site-template/schemas/families/provisioning-validation.schema.json
packages/project-site-template/schemas/families/site-health.schema.json
packages/project-site-template/template-contract.json
packages/project-site-template/README.md
packages/project-site-template/docs/Phase_1_Step_4_Per_Family_Schema_Population_Notes.md
docs/architecture/blueprint/sp-project-control-center/phase-1/Phase_1_Step_4_Per_Family_Schema_Population_Closeout.md
```

---

## Family-Specific Requirements

### workflows

Populate schema support for:

- seeded workflow templates;
- startup, permits, inspections, responsibility matrix, action generation, closeout, and warranty concepts;
- responsibility/due-date/evidence/status fields;
- ProjectStage / ProjectStatus behavior.

### integrations

Populate schema support for:

- integration records;
- Procore Project Mapping;
- Procore Subject Area Registry;
- Procore Sync Health;
- launch links;
- non-Procore placeholders;
- Procore Object Link Records and Procore Curated Summary Records as placeholder/future-reference only;
- `ProcoreCompanyId = 5280` as configuration, not secret;
- no direct SPFx-to-Procore calls;
- no full Procore mirror;
- Sage Intacct as accounting book of record.

### provisioning-validation

Populate schema support for:

- provisioning stages;
- post-provision validation;
- audit records;
- rollback/repair references;
- validation dependencies across families;
- no runtime provisioning implementation.

### site-health

Populate schema support for:

- site-health records;
- checks;
- severity;
- drift;
- repair tiers;
- audit posture;
- site-health dependency on all provisioned families.

---

## Procore Boundary Requirements

In `integrations.schema.json`:

- OC-17 and OC-18 must remain placeholder / future-reference only.
- Do not add full Procore canonical object models.
- Do not add Procore secrets.
- Do not imply SPFx direct Procore calls.
- Procore financial state must remain operational/project-management state.
- Sage Intacct remains accounting book of record.
- Procore write-back remains Deferred.

---

## Required Validation

After Wave 3:

1. The four schema files parse as valid JSON.
2. They use canonical Decision Closure `mvp_status` values.
3. They do not use scaffold shorthand as canonical enum values.
4. They include field definitions traceable to their `.fields.json` files.
5. OC-17 and OC-18 remain placeholder / future-reference only.
6. No full Procore canonical model was introduced.
7. No Procore secrets were introduced.
8. No direct Procore runtime code was created.
9. `enums.schema.json` and `validation-rules.schema.json` were not modified.
10. No backend, SPFx, provisioning, manifest, test, generated, CI, dependency, script, root-workspace, package, or deploy changes occurred.
11. `template-contract.json` marks all 14 families populated.
12. `fullExtractionComplete` remains false.
13. The closeout report states readiness for Phase 1 Step 5, or explains why not.

## Completion Summary

Output:

```markdown
## Wave 3 Completion Summary

### Files Modified
### Families Populated
### Procore Boundary Validation
### Validation Performed
### Guardrails Preserved
### Issues / Risks
### Ready for Closeout?
```
