# Phase 1 Step 4 — Per-Family Schema Population Notes

This document tracks Phase 1 Step 4 progress across waves. Wave 2 and Wave 3 sections will be appended as those waves complete.

## Wave 1 — Core Families

### Summary

Wave 1 populated the four core family schemas: `template-manifest`, `site`, `settings`, `permissions`. Each schema is a JSON Schema Draft 2020-12 document validating instance records of its family. Field sets trace verbatim to the matching `fields/families/<family>.fields.json` files produced in Phase 1 Step 3. The canonical Decision Closure four-value `mvp_status` enum (`Frozen for MVP`, `Runtime Configuration`, `Deferred`, `Proof-Gated`) replaces the temporary scaffold shorthand in these four schemas. Anti-regression guardrails (forbidden ProjectType / ProjectStage tokens, no Procore secrets, three-form ProcoreCompanyId, no-native-SharePoint-admin posture, external-user deferral, Procore mapping owner = PM/PX never PA, Procore directory comparison read-only) are encoded directly in the schemas.

### Files Modified

```text
packages/project-site-template/schemas/families/template-manifest.schema.json
packages/project-site-template/schemas/families/site.schema.json
packages/project-site-template/schemas/families/settings.schema.json
packages/project-site-template/schemas/families/permissions.schema.json
packages/project-site-template/template-contract.json
```

### Files Created

```text
packages/project-site-template/docs/Phase_1_Step_4_Per_Family_Schema_Population_Notes.md
```

### Families Populated (Wave 1)

| Family | Required Properties | Total Properties | Local `$defs` | Source Anchors | Validation Rule Refs |
|---|---|---|---|---|---|
| template-manifest | 23 | 23 | decisionClosureStatus, projectStage, projectType, projectStatus | §4 | VR-01, VR-02, VR-03, VR-13, VR-24 |
| site | 33 | 49 | decisionClosureStatus, projectStage, projectType, projectStatus | §3.2, §5, §5.6, §6.1, §6.2 | VR-01–VR-06, VR-08, VR-09, VR-11, VR-14, VR-23, VR-27, VR-29 |
| settings | 14 | 25 | decisionClosureStatus, procoreSubjectArea | §10, §10.6, §11.6, §15.2, §18.1.5 | VR-10, VR-11, VR-13, VR-17, VR-21, VR-28 |
| permissions | 19 | 21 | decisionClosureStatus, templateKey | §8, §11.2A, §11.3, §11.5–§11.7, §12 | VR-11, VR-15, VR-17, VR-18, VR-24, VR-27, VR-30 |

### Validation Performed

- JSON well-formedness (`JSON.parse`) on all four schema files and `template-contract.json`.
- Each Wave 1 schema's `mvp_status` `$defs` matches the canonical Decision Closure four-value enum verbatim.
- No `"mvp"`, `"deferred"`, or `"placeholder"` shorthand survives in the four Wave 1 schemas.
- `template-contract.json` marks the four Wave 1 families plus `enums` and `validation-rules` as `populated`. The remaining 8 family entries (`pages`, `libraries`, `lists`, `modules`, `workflows`, `integrations`, `site-health`, `provisioning-validation`) remain `status: "skeleton"`. `status.fullExtractionComplete` remains `false`.
- `git diff --name-only` confirms only the 4 Wave 1 schema files changed under `schemas/families/`. `enums.schema.json`, `validation-rules.schema.json`, and the 8 Wave 2/3 skeletons were not modified.
- No backend, SPFx, provisioning, manifest, test, generated, CI, dependency, script, root-workspace, package, or deploy changes occurred.
- `ProcoreCompanyId` is represented as configuration in three forms (canonical, surface, business), each defaulted to `"5280"`; never marked secret.
- `externalUserTemplatesDeferred` is `const: true`. `procoreDirectoryComparisonReadOnly` is `const: true`. `procoreMappingOwnerRule.primary` is `const: "Project Manager"`, `.fallback` is `const: "Project Executive"`; the rule's `forbiddenOwners` array surfaces "Project Accountant" as forbidden per VR-11.

### Guardrails Preserved

- Canonical Decision Closure four-value enum used as the only `mvp_status` taxonomy in the four Wave 1 schemas.
- `projectType.enum` lists the 5 allowed values; deprecated tokens (`preconstruction_only`, `warranty_closeout`, `active_construction`-as-Type) absent from the enum and called out in description as forbidden per VR-05 / VR-06.
- `projectStage.enum` lists the 6 allowed values; `Archived`-as-Stage absent and called out as forbidden per VR-04.
- `projectStatus.enum` lists the 4 allowed values.
- No Procore secrets: `ProcoreSecretStorageLocation` is `const: "backend"` (VR-13).
- DMSA auth posture frozen for MVP (VR-13, §18.1.5).
- M365/Teams posture frozen: `TeamsGuestAccessAllowed`, `GlobalReadOnlyAddedToTeams`, `ITAutoAddedToTeams` all `const: false` (VR-28).
- Permission templates: 10 MVP + 3 Deferred (external) per VR-18.
- Procore mapping owner = PM (primary) / PX (fallback). PA is in `forbiddenOwners` (VR-11).
- Procore directory comparison is read-only and does not auto-grant SharePoint access (VR-15).
- No new architecture decisions introduced.

### Issues / Risks

- The 8 Wave 2/3 family schema skeletons still carry temporary `["mvp", "deferred", "placeholder"]` shorthand. This is documented temporary state to be retired wave by wave.
- Custom string forms (e.g., `defaultExpiration` carrying expressions like "30 days after stage advance") are encoded as `string` rather than a structured duration shape — the contract describes these as natural-language expressions, so the schema follows suit. Future tightening can introduce a structured representation if a downstream consumer requires it; not required for Step 4 schema validation.
- Wave 2 population (pages, libraries, lists, modules) is the natural next step.

### Continue to Wave 2?

Yes — Wave 1 deliverables are complete and bounded; the canonical taxonomy is now anchored across the four core families and ready to anchor Wave 2 / Wave 3 populations against the same field maps.

### Recommended Next Prompt

```text
Phase 1 Step 4 Wave 2 — Pages / Libraries / Lists / Modules
```

## Wave 2 — Content and Experience Families

### Summary

Wave 2 populated the four content-and-experience family schemas: `libraries`, `lists`, `modules`, `pages`. Each schema is a JSON Schema Draft 2020-12 document validating instance records of its family. Field sets trace verbatim to the matching `fields/families/<family>.fields.json` files produced in Phase 1 Step 3. The canonical Decision Closure four-value `mvp_status` enum replaces the temporary scaffold shorthand in these four schemas. The ProjectStage-vs-ProjectType boundary is encoded structurally: module visibility keys strictly on ProjectStage; vertical seeding keys strictly on ProjectType. The `Archived` token is preserved as ProjectStatus only and absent from any `projectStage` enum across the four Wave 2 schemas. Pages represent only PCC-facing pages and routes — never native SharePoint admin/edit/settings surfaces. Libraries preserve the no-full-Procore-mirror posture (no Procore binary mirror, no document-sync, no canonical Procore document object).

### Files Modified

```text
packages/project-site-template/schemas/families/libraries.schema.json
packages/project-site-template/schemas/families/lists.schema.json
packages/project-site-template/schemas/families/modules.schema.json
packages/project-site-template/schemas/families/pages.schema.json
packages/project-site-template/template-contract.json
packages/project-site-template/docs/Phase_1_Step_4_Per_Family_Schema_Population_Notes.md
```

### Families Populated (Wave 2)

| Family | Required Properties | Total Properties | Local `$defs` | Source Anchors | Validation Rule Refs |
|---|---|---|---|---|---|
| libraries | 14 | 16 | decisionClosureStatus, syncPolicy, requiredOptional | §3.2, §5.6, §14.1, §14.2, §14.5, §14.5A | VR-08, VR-09, VR-16, VR-17, VR-29 |
| lists | 22 | 41 | decisionClosureStatus, statusEnum (§16.2), priorityEnum (§16.3) | §3.2, §15.1A, §15.1D, §15.2, §15.3, §15.4, §15.5, §15.11, §16.1–§16.5 | VR-08, VR-17, VR-24, VR-25, VR-26, VR-29 |
| modules | 13 | 15 | decisionClosureStatus, projectStage, projectType | §4B.2, §8.1, §8.2, §8.3, §13 | VR-07, VR-08, VR-19, VR-24, VR-26, VR-30 |
| pages | 11 | 11 | decisionClosureStatus, pageVisibility | §13 | VR-07, VR-17, VR-24, VR-26 |

### Validation Performed

- JSON well-formedness on all four Wave 2 schema files and `template-contract.json`.
- Each Wave 2 schema's `mvp_status` `$defs` matches the canonical Decision Closure four-value enum verbatim.
- No `"mvp"`, `"deferred"`, or `"placeholder"` shorthand survives in the four Wave 2 schemas.
- `template-contract.json` now marks the four Wave 2 families plus the four Wave 1 families plus `enums` and `validation-rules` as `populated`. The four Wave 3 family entries (`workflows`, `integrations`, `site-health`, `provisioning-validation`) remain `status: "skeleton"`. `status.fullExtractionComplete` remains `false`.
- `git diff --name-only schemas/families/` confirms only the four Wave 2 schema files changed. Wave 1 schemas, `enums.schema.json`, `validation-rules.schema.json`, and the four Wave 3 skeletons were not modified.
- No backend, SPFx, provisioning, manifest, test, generated, CI, dependency, script, root-workspace, package, or deploy changes occurred.

### Guardrails Preserved

- **Module visibility keyed strictly on ProjectStage.** `modules.schema.json` `visibilityByStage` uses `additionalProperties: false` with the six ProjectStage tokens as the only allowed keys; ProjectType never appears as a visibility key. `Archived` is absent from the local `projectStage` `$defs`.
- **Vertical seeding keyed strictly on ProjectType.** `seedRule` (libraries, lists) and `verticalSeeding` (modules) carry `keyedOn: "projectType"` as `const`; `perType` accepts only the five canonical ProjectType keys; ProjectStage never appears as a seeding key.
- **`Archived` is ProjectStatus only.** `Archived` does not appear in any `projectStage` `$defs.enum` across the Wave 2 schemas. The `readOnlyOnStatus` boolean on libraries and lists explicitly references ProjectStatus (Closed / Archived) per §3.2.
- **No-native-admin-user posture.** `pages.schema.json` `pageUrl` pattern restricts to `/SitePages/...aspx`; description states page records are PCC-facing only and must not represent native SharePoint admin/edit/settings surfaces. VR-17 referenced.
- **No-full-Procore-mirror posture.** `libraries.schema.json` description references VR-16 / Contract P-10; the schema does not introduce Procore binary mirror, Procore document-sync, or canonical Procore document object behavior.
- **HBI Assistant deferral.** `modules.schema.json` `MvpStatus` accepts `Deferred` from the canonical enum; the HBI Assistant module instance carries that value per VR-19.
- **mvp_status canonical taxonomy** in all four Wave 2 schemas; no scaffold shorthand.
- No new architecture decisions introduced.

### Issues / Risks

- The four Wave 3 family schema skeletons (`workflows`, `integrations`, `site-health`, `provisioning-validation`) still carry temporary `["mvp", "deferred", "placeholder"]` shorthand. This is documented temporary state to be retired in Wave 3.
- Per-list field expansion is intentionally bounded to the field map's `requiredFields` / `optionalFields` name lists. Full per-list schemas (e.g., a dedicated schema for "Project Profile" or "Project Permits") are not in Wave 2 scope and can be produced downstream as consumers require them.
- `lists.schema.json` `dataOwnership` enum captures the six §15 ownership phrases verbatim from the field map; if the contract introduces new ownership phrases, Wave 3 / future revisions will extend the enum (additive).
- Pages with future-named modules (e.g., HBI Assistant for `/SitePages/HBI-Assistant.aspx`) carry `mvpStatus: "Deferred"`; downstream consumers should not surface these pages outside Deferred contexts in MVP.

### Continue to Wave 3?

Yes — Wave 2 deliverables are complete and bounded. The ProjectStage-vs-ProjectType boundary is structurally enforced. Wave 3 (`workflows`, `integrations`, `site-health`, `provisioning-validation`) is ready to populate against the same field maps with the canonical taxonomy already anchored in eight family schemas + enums + validation-rules.

### Recommended Next Prompt

```text
Phase 1 Step 4 Wave 3 — Workflows / Integrations / Site-Health / Provisioning-Validation
```
