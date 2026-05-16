# Prompt 02 — My Projects Multi-Platform Launch Expansion | Schema, Provisioning, and Readiness Expansion

## Objective

Implement the SharePoint source-list schema expansion required for My Projects multi-platform launch support.

This prompt owns:

1. source-list descriptor additions,
2. provisioning-plan behavior,
3. readiness-helper expansion,
4. verifier framing updates,
5. schema/provisioning tests,
6. directly related operator/schema documentation.

Do not change the backend provider or frontend UI in this prompt.

---

## Mandatory working rules

1. Do not re-read files that remain available in your current context or working memory unless exact lines are needed or source changed.
2. Work from the current local repo truth established in Prompt 01.
3. Do not leave decisions open; apply the locked field contract exactly.
4. Preserve the REST-based, fail-closed provisioning behavior.
5. Do not add a new Projects `projectStage` column.
6. Do not run live SharePoint `--apply`.
7. If you run a dry-run against live tenant schema, label it operator-context-dependent and redacted.
8. Do not touch unrelated My Dashboard UI/provider logic.

---

## Locked field contract

### Projects
Add:
- `buildingConnectedUrl`
  - display: `Autodesk BuildingConnected Link`
  - type: `Text`
- `documentCrunchUrl`
  - display: `Document Crunch Link`
  - type: `Text`

Do **not** provision Projects `projectStage`; it already exists through `field_6`.

### Legacy Project Fallback Registry
Add:
- `buildingConnectedUrl`
  - display: `Autodesk BuildingConnected Link`
  - type: `Text`
- `documentCrunchUrl`
  - display: `Document Crunch Link`
  - type: `Text`
- `projectStage`
  - display: `Project Stage`
  - type: `Text`

---

## Required code changes

### 1. Descriptor
File:
- `backend/functions/src/services/my-projects/my-projects-source-list-schema.ts`

Add:
- shared external launch field constant
- Registry stage field constant
- Projects target composition includes external fields
- Registry target composition includes Registry extras + external fields + stage

### 2. Readiness helper
File:
- `backend/functions/src/services/projects-role-schema-readiness.ts`

Expand required fields:

Projects:
- canonical role arrays
- `buildingConnectedUrl`
- `documentCrunchUrl`

Registry:
- canonical role arrays
- `procoreProject`
- `buildingConnectedUrl`
- `documentCrunchUrl`
- `projectStage`

Expand expected-type logic so the three new fields use `Text`.

### 3. Verifier framing
File:
- `scripts/verify-my-project-role-fields.ts`

Update comments/operator messaging so the script no longer presents itself as role-array-only. Preserve:
- read-only behavior,
- command shape,
- report semantics,
- exit-code semantics.

### 4. Provisioner
File:
- `scripts/provision-my-projects-source-list-schema.ts`

Descriptor-driven logic should naturally pick up the new fields. Change code only if tests or report framing require it. Do not destabilize the REST path.

### 5. Field-create REST contract
Files:
- `scripts/sharepoint-field-rest-contract.ts`
- `scripts/sharepoint-field-rest-contract.test.ts`

Inspect only. Do not alter unless current Text field support cannot already provision the new `Text` columns. Existing `Text` support should normally be sufficient.

---

## Required tests

Update or add coverage for:

- descriptor targets,
- provisioner planned creates/live verified behavior,
- readiness report for new fields,
- wrong-type detection for the new fields,
- verifier JSON/text interpretation if tested.

At minimum inspect and run relevant tests in:
- `scripts/provision-my-projects-source-list-schema.test.ts`
- `scripts/verify-my-project-role-fields.test.ts`
- any readiness-helper tests.

---

## Required docs updates

Update only docs directly tied to provisioning/readiness:

- `docs/reference/sharepoint/list-schemas/hbcentral/lists/projects.md`
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/legacy-project-fallback-registry.md`
- `docs/reference/spfx-surfaces/my-dashboard/my-projects-schema-readiness.md`
- `docs/how-to/administrator/provision-my-projects-source-list-schema.md`

Document:
- target additions,
- Projects stage reuse vs Registry stage addition,
- new readiness expectations,
- operator dry-run/apply sequence.

---

## Required validation

Run the narrowest relevant commands available in the repo, including at minimum:

```bash
pnpm exec vitest run --config scripts/vitest.config.ts \
  scripts/provision-my-projects-source-list-schema.test.ts \
  scripts/verify-my-project-role-fields.test.ts
```

Run any directly affected helper/unit tests.

Run Prettier on touched files.

---

## Required closeout

Return exactly:

# Prompt 02 Closeout — Schema, Provisioning, and Readiness Expansion

## 1. Executive Verdict
State what was implemented and whether provisioning/readiness code is now complete.

## 2. Files Changed
For each file:
- path
- change summary
- why needed

## 3. Locked Field Contract Implemented
List fields per list exactly.

## 4. Test Results
Exact commands and outcomes.

## 5. Docs Updated
List and summarize.

## 6. Live Operator Commands Ready
Provide:
- dry-run command
- apply command
- verifier command

Do not execute live apply.

## 7. Remaining Work for Prompt 03
State the exact next backend/model work.
