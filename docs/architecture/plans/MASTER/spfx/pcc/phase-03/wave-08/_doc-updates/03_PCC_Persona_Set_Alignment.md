# Prompt 03 — PCC Persona Set Alignment for Wave 8 Readiness Authority

## Role

You are a senior TypeScript model and documentation alignment agent working in:

```text
/Users/bobbyfetting/hb-intel
```

## Critical instruction

Do not re-read files that are still within your current context or memory. Use prior audit context first, then inspect only the files needed to safely update the persona vocabulary and documentation references.

## Objective

Update the PCC persona set so it aligns with the Wave 8 Project Readiness objective and supports readiness role/action modeling without mutating the separate `ProjectRole` model.

This is a narrow shared-model update plus documentation alignment. It is not a runtime authorization implementation.

## Primary files

Inspect/edit:

```text
packages/models/src/pcc/PccUserRoles.ts
packages/models/src/pcc/index.ts
packages/models/src/pcc/PccUserRoles.test.ts
packages/models/src/pcc/PccReadModels.test.ts
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-8/Wave_8_Project_Readiness_Framework_Scope_Lock.md
```

Only edit `index.ts` or tests if necessary based on current repo truth.

Inspect but do not mutate unless needed:

```text
packages/models/src/auth/ProjectRoles.ts
packages/models/src/pcc/DocumentControl.ts
packages/models/src/pcc/PccReadModels.ts
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx
apps/project-control-center/src/surfaces/teamAccess/
```

## Persona alignment requirement

The Wave 8 objective requires the readiness role/action model to include at minimum:

- PCC Admin
- IT / Tenant Admin
- Executive Oversight
- Project Executive
- Project Manager
- Superintendent
- Project Accounting / Project Accountant
- Project Team Member
- Project Viewer
- Safety / QAQC
- Manager of Operational Excellence
- Estimating Coordinator
- Estimator
- Lead Estimator
- Chief Estimator
- Director of Preconstruction
- Project Coordinator
- external/deferred roles where relevant

Current repo truth already includes some, but not all, of these personas.

## Required approach

Preserve compatibility:
- Do not remove existing personas.
- Do not rename existing persona IDs unless every reference is updated and tests prove compatibility.
- Prefer additive persona IDs for missing personas.
- Keep `ProjectRole` unchanged unless current repo truth reveals a required, separately authorized change.
- Maintain `PCC_PERSONA_LABELS`, `PCC_PERSONA_TIER`, `PCC_PERSONA_CATEGORY`, and `PCC_PERSONA_TO_PROJECT_ROLE` completeness for every persona.

## Additive persona IDs to introduce

Add the following missing PCC personas, unless repo truth shows they already exist under equivalent stable IDs:

```ts
'estimator'
'chief-estimator'
'director-of-preconstruction'
'project-coordinator'
'external-design-team'
'owner-client-viewer'
'subcontractor-limited'
```

If `viewer` already exists, keep it. Update its label to align with objective if safe:

```ts
viewer: 'Project Viewer'
```

Do not add a duplicate `project-viewer` persona unless repo truth shows the existing `viewer` cannot serve the Project Viewer role.

If `project-accounting` already exists, keep it. Update its label only if safe:

```ts
'project-accounting': 'Project Accounting / Project Accountant'
```

Do not add duplicate `project-accountant` unless repo truth requires it.

## Tier classifications

Use these tier mappings unless repo truth suggests a better existing convention:

```ts
'estimator': 'estimating'
'chief-estimator': 'estimating'
'director-of-preconstruction': 'estimating'
'project-coordinator': 'operations'
'external-design-team': 'external'
'owner-client-viewer': 'external'
'subcontractor-limited': 'external'
```

## Persona categories

Use these categories unless repo truth suggests a better existing convention:

```ts
'estimator': 'primary-mvp'
'chief-estimator': 'primary-mvp'
'director-of-preconstruction': 'primary-mvp'
'project-coordinator': 'primary-mvp'
'external-design-team': 'secondary'
'owner-client-viewer': 'secondary'
'subcontractor-limited': 'secondary'
```

Rationale:
- Estimating/preconstruction personas are needed for readiness gates before project turnover.
- Project Coordinator is needed for documentation/readiness follow-through and practical coordination.
- External personas should not receive default readiness authority; they are display/source-context personas unless later authorized.

## Mapping to ProjectRole

Preserve `ProjectRole` as-is. Map new personas as follows unless repo truth suggests a safer mapping:

```ts
'estimator': null
'chief-estimator': null
'director-of-preconstruction': null
'project-coordinator': 'project-team-member'
'external-design-team': 'external-contributor'
'owner-client-viewer': 'project-viewer'
'subcontractor-limited': 'external-contributor'
```

If `ProjectRole` does not allow the mapped value, use `null` and document the reason.

## Optional helper metadata

If it fits existing style, add comments or metadata clarifying that external/deferred personas do not receive default authority for readiness update/approve/override/configure actions.

Do not create a full authorization engine in this prompt.

## Documentation alignment

Update Wave 8 docs created/edited in Prompt 02 so the role/action model explicitly distinguishes:

### Can view readiness posture
- PCC Admin
- IT / Tenant Admin
- Executive Oversight
- Project Executive
- Project Manager
- Superintendent
- Project Accounting / Project Accountant
- Project Team Member
- Project Viewer
- Safety / QAQC
- Manager of Operational Excellence
- Estimating Coordinator
- Estimator
- Lead Estimator
- Chief Estimator
- Director of Preconstruction
- Project Coordinator
- external/deferred personas only where project access is explicitly granted

### Can update readiness item status
- Project Manager
- Project Executive
- Superintendent
- Project Coordinator
- assigned owner personas
- domain-specific internal roles where assigned
- PCC Admin for administrative correction

### Can assign owners
- Project Manager
- Project Executive
- PCC Admin
- Manager of Operational Excellence where governance requires
- Director of Preconstruction / Chief Estimator for preconstruction gates where assigned

### Can attach evidence / add comments
- assigned owner
- Project Manager
- Project Executive
- Superintendent
- Project Coordinator
- Safety / QAQC for safety evidence
- Estimating / Preconstruction personas for estimating/preconstruction evidence
- external/deferred personas only when granted a scoped evidence role in a later workflow

### Can resolve blockers
- assigned owner
- Project Manager
- Project Executive
- responsible domain lead
- PCC Admin for administrative correction

### Can approve readiness gate
- Project Executive
- Project Manager for assigned business gates
- Director of Preconstruction / Chief Estimator for preconstruction/estimating gates
- Safety / QAQC for safety readiness gates where defined
- Manager of Operational Excellence for governance checkpoints where defined
- Executive Oversight for escalation review only, not routine updates

### Can override readiness status
- PCC Admin
- Project Executive
- Executive Oversight only by explicit escalation
- Manager of Operational Excellence only where governance authorizes

### Can configure readiness templates
- PCC Admin
- IT / Tenant Admin for technical/configuration posture
- Manager of Operational Excellence for business-governance templates
- Project Executive / Project Manager only for project-level allowed configuration, not global templates

### Can export readiness evidence
- Project Executive
- Project Manager
- Executive Oversight
- PCC Admin
- Project Accounting where financial/accounting readiness applies
- limited viewer/export rules for project viewers as governed by document-control policy

### Can view audit
- PCC Admin
- IT / Tenant Admin
- Executive Oversight
- Project Executive
- Project Manager
- Manager of Operational Excellence
- limited domain audit for assigned owners/reviewers

## Tests

If a `PccUserRoles.test.ts` exists, update it.

If it does not exist, create a focused test file if current package test patterns support it:

```text
packages/models/src/pcc/PccUserRoles.test.ts
```

Test only deterministic vocabulary integrity:
- every `PCC_PERSONAS` entry has a label;
- every entry has a tier;
- every entry has a category;
- every entry has a `PCC_PERSONA_TO_PROJECT_ROLE` mapping key;
- new required personas are included;
- existing personas remain included.

Do not create broad runtime tests in this prompt.

## Validation commands

Run:

```bash
pnpm --filter @hbc/models test -- PccUserRoles
pnpm --filter @hbc/models check-types
git diff --check
md5 pnpm-lock.yaml
```

If the targeted test command pattern differs in repo truth, use the repo-correct targeted equivalent and record the exact command used.

## Forbidden changes

- Do not mutate `packages/models/src/auth/ProjectRoles.ts` unless explicitly required by compilation and separately justified.
- Do not remove existing personas.
- Do not introduce runtime auth or permission enforcement.
- Do not update SPFx behavior in this prompt.
- Do not change `pnpm-lock.yaml`.
- Do not introduce dependencies.
- Do not edit `docs/architecture/plans/**`.

## Commit format

Do not commit until Prompt 04 validation is complete. Suggested final commit will be provided in Prompt 04.
