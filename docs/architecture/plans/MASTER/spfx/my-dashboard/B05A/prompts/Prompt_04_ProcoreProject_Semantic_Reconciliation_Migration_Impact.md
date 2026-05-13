# Prompt 04 — `procoreProject` Semantic Reconciliation and Migration Impact

## Objective

Resolve the repo-wide semantic conflict around `procoreProject` for the My Projects initiative.

The target is binding:

```ts
procoreProject?: string;
```

`procoreProject` must mean the **raw Procore project identifier/token** used to assemble:

```text
https://app.procore.com/{procoreProject}/project/home
```

It must no longer behave as a `'Yes' | 'No'` existence flag.

## Mandatory efficiency instruction

Do not re-read files that are still fully available in your current context or working memory unless drift is suspected, a prior step changed them, or the prompt explicitly requires a fresh verification pass.

---

## Required inputs

- Prompt 03 closeout
- `supporting/00_Repo_Truth_Audit_Findings.md`
- `supporting/02_Plan_Reconciliation_Updated_Closed_Decisions.md`

---

## Repo-truth references to inspect

### Known conflict anchors
- `packages/models/src/provisioning/IProvisioning.ts`
- `backend/functions/src/services/projects-list-contract.ts`

### Likely additional usage areas
Search the repo for:

```bash
rg -n "procoreProject|Procore project|already exists in Procore|\\'Yes\\' \\| \\'No\\'" .
```

Pay particular attention to:

- project setup UI/config;
- mapper/tests;
- docs;
- fixtures;
- validation schemas;
- any form control whose labels assume Yes/No semantics.

---

## Implementation scope

### 1. Change domain semantics

Replace the Yes/No type contract:

```ts
procoreProject?: 'Yes' | 'No';
```

with:

```ts
procoreProject?: string;
```

### 2. Update comments, docs, and field descriptions

Any comments/docs that define:

- “whether the project already exists in Procore”;
- “Procore project flag”;
- or equivalent Yes/No wording

must be updated to the new target meaning:

- raw Procore project identifier/token;
- optional;
- used later to assemble launch URL.

### 3. Update UI/form posture where necessary

If the current project setup UI exposes `procoreProject` as:

- a Yes/No toggle;
- a select;
- or any boolean-style input,

refactor it to a repo-appropriate text input or explicitly document why the UI migration must be separated into a follow-on if it is outside the live implementation seam. The preferred outcome is to complete the semantic update in this prompt if it is locally bounded and required for type correctness.

### 4. Define migration interpretation for existing stored values

The prompt package must not accidentally treat historical values such as:

```text
Yes
No
```

as valid Procore tokens.

Add a migration/readiness note or helper-level rule stating:

- legacy `Yes` / `No` values are **not** valid launch tokens;
- they must produce unavailable Procore action states downstream;
- any data remediation required in tenant must be operator-owned and reported.

### 5. Align tests

Update tests for:

- model typing;
- mapper behavior;
- UI/form validation where applicable;
- invalid/legacy token handling if already modeled here.

Do not construct final launch URLs in this prompt unless a shared token validation helper is cleanly appropriate. Final URL assembly belongs to backend read-model work.

---

## Required non-goals

- Do not mutate live Projects list data.
- Do not implement the My Projects backend route.
- Do not update Legacy Registry `procoreProject` mirror/backfill yet; Prompt 06 handles Registry migration strategy.
- Do not add a new boolean replacement field unless the package explicitly justifies it and proves it is necessary. The default target is to derive boolean “has Procore” semantics from token presence where needed.

---

## Likely file families

- `packages/models/src/provisioning/IProvisioning.ts`
- project setup UI/config/model files under:
  - `packages/features/estimating/src/project-setup/...`
  - or related package locations found by search;
- `backend/functions/src/services/projects-list-contract.ts`
- mapper/tests/docs touching `procoreProject`
- schema reference docs if descriptions are present there.

---

## Validation requirements

Run the packages actually touched. Likely:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
```

If estimating feature/project setup files change:

```bash
pnpm --filter @hbc/features-estimating check-types
pnpm --filter @hbc/features-estimating test
pnpm --filter @hbc/spfx-project-setup build
pnpm --filter @hbc/spfx-project-setup test
```

Search-based validation:

```bash
rg -n "procoreProject\\?: 'Yes' \\| 'No'|Procore project flag|already exists in Procore" .
```

Any remaining hits must be:
- removed;
- or explicitly documented as intentional out-of-scope legacy wording with justification.

---

## Evidence requirements

Closeout must include:

- all files changed;
- all `procoreProject` semantic locations updated;
- any remaining Yes/No references and why they remain, if any;
- validation command outcomes;
- explicit statement that live tenant data was not mutated.

---

## Commit / closeout expectations

Recommended commit title:

```text
refactor(my-projects): reconcile procoreProject as raw launch token
```

Closeout format:

1. Verdict: PASS / FAIL
2. Branch / HEAD
3. Files changed
4. Semantic conflict resolved
5. UI/form migration notes
6. Legacy Yes/No data handling note
7. Validation commands and outcomes
8. Recommended next prompt:
   - Prompt 05

---

## Guardrails

- Protect unrelated active work.
- No speculative broad project setup redesign.
- No lockfile/package changes unless strictly required.
- Preserve the user’s closed target meaning: raw Procore token, not a URL, not Yes/No, not a launch-state enum.
