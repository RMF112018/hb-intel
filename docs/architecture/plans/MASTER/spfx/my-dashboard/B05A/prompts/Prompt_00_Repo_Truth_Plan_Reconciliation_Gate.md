# Prompt 00 — My Projects Repo-Truth / Plan Reconciliation Gate

## Objective

Act as a repo-truth auditor and implementation gatekeeper for the My Dashboard **My Projects** dual-launch initiative. Before changing code, reconcile the attached implementation package against the live repo at the current branch/HEAD, confirm there is no material drift that invalidates the package, and produce a concise execution-readiness note for Prompt 01 onward.

This prompt is **audit-first** and **docs-only** unless a clearly scoped audit-note file is required by the package folder conventions.

## Mandatory efficiency instruction

Do not re-read files that are still fully available in your current context or working memory unless drift is suspected, a prior step changed them, or the prompt explicitly requires a fresh verification pass.

---

## Governing inputs to read

Read the package files first:

- `README.md`
- `supporting/00_Repo_Truth_Audit_Findings.md`
- `supporting/01_External_Research_Validation_Summary.md`
- `supporting/02_Plan_Reconciliation_Updated_Closed_Decisions.md`
- `supporting/03_Prompt_Package_Architecture.md`
- `supporting/04_Risks_Prerequisites_Operator_Owned_Steps.md`
- `supporting/05_Source_Register_And_Audit_Evidence_Map.md`

Then verify the live repo seams that could have drifted since package authoring.

### Repo-truth references to inspect

#### My Dashboard / home-surface architecture
- `apps/my-dashboard/src/shell/MyWorkSurfaceRouter.tsx`
- `apps/my-dashboard/src/surfaces/home/MyWorkHomeSurface.tsx`
- `apps/my-dashboard/src/layout/MyWorkCard.tsx`
- `apps/my-dashboard/src/layout/myWorkFootprints.ts`
- `apps/my-dashboard/src/layout/useMyWorkContainerBreakpoint.ts`

#### My Work read-model architecture
- `packages/models/src/myWork/MyWorkReadModels.ts`
- `apps/my-dashboard/src/api/myWorkReadModelClient.ts`
- `apps/my-dashboard/src/api/myWorkBackendReadModelClient.ts`
- `apps/my-dashboard/src/api/myWorkFixtureReadModelClient.ts`
- `backend/functions/src/hosts/my-work-read-model/my-work-read-model-routes.ts`
- `backend/functions/src/hosts/my-work-read-model/read-models/my-work-read-model-provider.ts`
- `backend/functions/src/hosts/my-work-read-model/read-models/my-work-mock-read-model-provider.ts`

#### Source-list contracts
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/projects.md`
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/legacy-project-fallback-registry.md`
- `backend/functions/src/services/projects-list-contract.ts`
- `packages/models/src/provisioning/IProvisioning.ts`
- `backend/functions/src/services/legacy-fallback/list-descriptors.ts`
- `backend/functions/src/services/legacy-fallback/discovery-repository.ts`

#### Provisioning/auth posture
- `docs/how-to/administrator/create-legacy-fallback-lists.md`
- `backend/functions/src/services/legacy-fallback/hosting-config.ts`
- `apps/my-dashboard/config/package-solution.json`

#### UI doctrine / closure
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Full-Page-App-Widget-Overlay.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md`

---

## Audit questions to answer

1. Does the repo still support the package’s placement decision:
   - My Projects on the My Work home surface?
2. Do the current route/client/provider seams still match the package’s expectation that project-links should extend, not replace, the existing My Work architecture?
3. Does `procoreProject` still show the expected semantic conflict:
   - provisioning model Yes/No;
   - SharePoint persistence field as text?
4. Does the legacy discovery writer still contain the forced match-state override that Prompt 07 will remediate?
5. Do the Projects and Legacy Registry schema snapshots still lack the target My Projects columns?
6. Does the provisioning posture still identify:
   - `HB SharePoint Creator`;
   - app ID `08c399eb-a394-4087-b859-659d493f8dc7`;
   - `pilot-interim`;
   - target `least-privilege-sites-selected`?
7. Does the package’s 17-prompt sequence remain appropriate?
8. Has any work landed in parallel that changes the recommended sequence or target files?

---

## Implementation scope

### Required output

Create or update a concise audit note under the implementation package directory using the repo’s package conventions. Recommended filename:

```text
00_My_Projects_Prompt_Package_Execution_Readiness_Audit.md
```

If the package is being executed outside a repo docs directory, place the note in the working implementation folder selected by the operator and cite its path in the closeout.

The note must include:

- branch / HEAD;
- package audited;
- repo-truth drift status:
  - `NO MATERIAL DRIFT`
  - or `MATERIAL DRIFT IDENTIFIED`;
- findings for each audit question above;
- any prompt sequence changes required;
- whether Prompt 01 can proceed as written;
- residual operator-owned prerequisites.

---

## Required non-goals

- Do not implement application code.
- Do not change list schemas.
- Do not modify provisioning scripts.
- Do not change package versions.
- Do not run tenant-mutating commands.
- Do not rewrite the prompt package unless a material drift finding makes one or more prompts unsafe.

---

## Validation requirements

Run:

```bash
git status --short
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD
```

Use targeted `rg` checks where helpful. At minimum:

```bash
rg -n "my-work/me/home|my-work/me/adobe-sign/action-queue" \
  backend/functions/src/hosts/my-work-read-model/my-work-read-model-routes.ts

rg -n "procoreProject\\?: 'Yes' \\| 'No'|procoreProject" \
  packages/models/src/provisioning/IProvisioning.ts \
  backend/functions/src/services/projects-list-contract.ts

rg -n "MatchStatus: 'matched'|MatchConfidence: 'high'|MatchMethod: 'no-match'" \
  backend/functions/src/services/legacy-fallback/discovery-repository.ts

rg -n "HB SharePoint Creator|08c399eb-a394-4087-b859-659d493f8dc7|pilot-interim|least-privilege-sites-selected" \
  docs/how-to/administrator/create-legacy-fallback-lists.md \
  backend/functions/src/services/legacy-fallback/hosting-config.ts \
  apps/my-dashboard/config/package-solution.json
```

---

## Evidence requirements

Capture:

- the exact branch/HEAD;
- summary of any material repo drift;
- evidence that live tenant actions were **not** executed;
- evidence that no runtime code or lockfiles were changed unless a package-convention audit note path requires a docs-only file.

---

## Commit / closeout expectations

Do **not** commit code changes.  
If a docs-only audit note is added, recommend a docs-only commit title.

Closeout format:

1. Verdict: PASS / FAIL
2. Branch / HEAD
3. Material drift: yes/no
4. Prompt sequence remains valid: yes/no
5. Files changed
6. Validation commands and outcomes
7. Operator prerequisites carried forward
8. Recommended next prompt:
   - `Prompt 01 — Provisioning Auth Readiness and HB SharePoint Creator Permission Proof`

---

## Guardrails

- Protect unrelated active work in the repo.
- Do not reformat or tidy unrelated files.
- Do not make speculative refactors.
- Do not touch lockfiles, manifests, package versions, or tenant data.
- If repo drift materially changes package assumptions, stop after documenting the drift and recommend the smallest prompt-package correction needed before implementation proceeds.
