# 04 — Prompt: Permission / Action Rendering and Guardrails

## Role

You are a local code agent working in:

```text
/Users/bobbyfetting/hb-intel
```

You are implementing the next slice of **Project Control Center Phase 3 / Wave 7 — HB Document Control Center** after the three-lane UI shell.

## Objective

Render role/action availability and hard-no guardrails in the HB Document Control Center UI using the Wave 7 document-control read model.

This is UI/read-model rendering only. It is not runtime authorization enforcement.

## Preconditions

Complete before starting this prompt:

1. `03A_Prompt_SPFX_Document_Control_Read_Model_Parity.md`
2. `03B_Prompt_SPFX_Three_Lane_UI.md`

If either is incomplete, stop and complete it first.

## Mandatory Preflight

```bash
cd /Users/bobbyfetting/hb-intel
git status --short
git branch --show-current
git log --oneline -10
md5 pnpm-lock.yaml
```

If unrelated changes exist, protect them and document them in closeout.

Do not re-read files that are still within current context or memory.

## Files to Inspect

```text
apps/project-control-center/src/surfaces/documents/**
apps/project-control-center/src/tests/PccDocumentsSurface.test.tsx
packages/models/src/pcc/DocumentControl.ts
packages/models/src/pcc/PccReadModels.ts
apps/project-control-center/src/api/pccFixtureReadModelClient.ts
backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts
```

## Files You May Modify

```text
apps/project-control-center/src/surfaces/documents/**
apps/project-control-center/src/tests/PccDocumentsSurface.test.tsx
apps/project-control-center/src/api/pccFixtureReadModelClient.test.ts
```

Only modify model files if a missing export blocks compilation and the change is narrow, additive, and tested.

## Required Implementation

Render a permission/action summary from read-model fields:

```ts
roleActionAvailability
actionCatalog
hardNoRules
```

### Required Role Coverage

The UI/tests must account for R01–R23 where provided by model/read-model data.

At minimum, test and visibly represent:

- R01 — PCC Admin
- R03 — Executive Oversight
- R04 — Project Executive
- R05 — Project Manager
- R14 — Project Coordinator
- external/deferred roles where present

Do not introduce Project Engineer.

### Required Action Families

Represent action families:

- `PR` — Project Record
- `MP` — My Project Files
- `SB` — Source Binding / Repair
- `EX` — External Systems
- `WF` — Workflow / Admin

Render action code, label, and availability.

### Required Availability Legend

Render or otherwise make understandable:

| Code | Meaning |
|---|---|
| `Y` | Allowed by default if project/source access exists |
| `A` | Assigned only |
| `O` | Own/current-user only |
| `R` | Request only |
| `C` | Configurable |
| `S` | Support/admin repair only |
| `D` | Deferred |
| `N` | Not allowed |
| `HARD-NO` | Forbidden by architecture |

### Required Guardrail Rendering

Hard-no rules must render as explicit guardrails, including:

- no My Project Files root browsing in project-site UI;
- no other-project folder browsing in project-site UI;
- no external writeback or sync in Wave 7;
- no direct broad SPFx Graph execution in Wave 7, if present in read model.

### EX04

`EX04` — External writeback/sync/mirror — must render as unavailable, forbidden, or not allowed.

Do not render `EX04` as executable.

## Required Tests

Update/add tests proving:

1. action catalog renders grouped by family or equivalent.
2. availability values render with safe labels.
3. hard-no rules render.
4. `EX04` is unavailable/forbidden/not allowed.
5. Project Coordinator appears where represented.
6. Project Engineer does not appear.
7. no executable buttons/handlers are introduced for actions.
8. no live `href` launch links are introduced.
9. UI does not infer authorization from persona locally.
10. backend-unavailable/source-unavailable state remains safe.

## Forbidden Changes

Do not:

- enforce runtime authorization in SPFx;
- call live APIs;
- add Graph/PnP/SharePoint REST/Procore/Adobe/Document Crunch imports;
- create upload/download/copy-link handlers;
- mutate tenant/external systems;
- introduce dependencies;
- change `pnpm-lock.yaml`;
- package/deploy SPFx;
- edit `docs/architecture/plans/**`.

## Validation Commands

```bash
pnpm --filter @hbc/spfx-project-control-center test -- PccDocumentsSurface
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center build
git diff --check
md5 pnpm-lock.yaml
```

## Closeout Requirements

Include:

- files changed;
- tests run and results;
- lockfile checksum before/after;
- summary of role/action rendering;
- confirmation `EX04` is unavailable/forbidden;
- confirmation Project Coordinator present and Project Engineer absent;
- confirmation no runtime authorization enforcement was introduced;
- confirmation no live integrations or file operations were introduced;
- recommended next prompt: `05_Prompt_Source_Degraded_States.md`.

## Suggested Commit Summary

```text
feat(pcc): render document control action guardrails
```

## Suggested Commit Description

```text
Adds HB Document Control Center role/action availability and hard-no guardrail rendering from the document-control read model, including PR/MP/SB/EX/WF action families and EX04 unavailable posture.

This is UI/read-model rendering only. No runtime authorization enforcement, live Graph/PnP/SharePoint REST, external system runtime, file operation execution, package changes, lockfile changes, SPFx packaging, or deployment behavior is introduced.
```
