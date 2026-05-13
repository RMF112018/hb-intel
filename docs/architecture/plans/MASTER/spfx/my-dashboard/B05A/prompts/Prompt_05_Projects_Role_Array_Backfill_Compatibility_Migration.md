# Prompt 05 — Projects Role-Array Backfill and Compatibility Migration

## Objective

Implement the repo-side migration/backfill strategy that populates the new canonical Projects role arrays from the existing narrower Projects role fields while preserving idempotency and data safety.

This prompt must produce code and documentation suitable for an operator-gated migration workflow, but it must **not** execute live tenant writes autonomously.

## Mandatory efficiency instruction

Do not re-read files that are still fully available in your current context or working memory unless drift is suspected, a prior step changed them, or the prompt explicitly requires a fresh verification pass.

---

## Required inputs

- Prompt 02 closeout
- Prompt 03 closeout
- Prompt 04 closeout
- Prompt 01 readiness artifact

---

## Repo-truth references to inspect

### Projects contract and relevant models
- `backend/functions/src/services/projects-list-contract.ts`
- `packages/models/src/provisioning/IProvisioning.ts`
- any Projects mapper/service files used to read/write HBCentral Projects rows

### Provisioning/backfill patterns
- existing scripts under `scripts/`
- any current repo migration/backfill script conventions
- `scripts/provision-legacy-fallback-lists.ts` for reporting and operator-gated style, but do not conflate schema provisioning with row backfill.

### Canonical role utilities from Prompt 03
- role taxonomy file
- UPN parsing/serialization helpers

---

## Implementation scope

### 1. Implement Projects role backfill logic

Required mappings:

| Legacy/current field | Canonical target field |
|---|---|
| `leadEstimatorUpn` | `leadEstimatorUpns` |
| `supportingEstimatorUpns` | `estimatorUpns` |
| `projectManagerUpn` | `projectManagerUpns` |
| `projectExecutiveUpn` | `projectExecutiveUpns` |

### 2. Backfill behavior

The migration must:

- parse current values defensively;
- normalize all UPNs using Prompt 03 helpers;
- merge into existing canonical arrays rather than blindly replacing them;
- dedupe;
- sort deterministically;
- avoid writing when the canonical serialized value would not change;
- be idempotent across repeated runs.

### 3. Script or service posture

Use the repo-native migration style. The recommended posture is an operator-run script with:

- default dry-run;
- explicit `--apply` for writes;
- JSON or structured summary output;
- counts for:
  - rows scanned;
  - rows with migratable legacy values;
  - rows changed;
  - rows unchanged;
  - rows skipped because canonical values already matched;
  - parse/validation warnings.

If a repo-native backfill framework already exists, use it instead and preserve the same behavioral guarantees.

### 4. Authentication posture

Live writes, when eventually run by an operator, must use the existing `HB SharePoint Creator` app path or the repo-approved credential seam established by Prompt 01.

Do not introduce a new credential strategy.

### 5. Compatibility rule for runtime reads

Document the transition rule that downstream read-model logic may:

- prefer canonical arrays;
- fall back to legacy fields when corresponding canonical arrays are empty.

Do not implement the full backend read model in this prompt, but do create any helper/documentation required to keep later prompts aligned.

---

## Required non-goals

- Do not run `--apply`.
- Do not mutate tenant data.
- Do not add Legacy Registry mirror logic; that belongs to Prompt 06.
- Do not implement My Work route/provider code.
- Do not remove legacy scalar fields.
- Do not change role taxonomy decisions from Prompt 03.

---

## Likely file families

Depending on repo conventions:

- new script under `scripts/`, e.g.:
  - `scripts/backfill-my-project-role-arrays.ts`;
- helper/service files under backend functions if existing patterns favor that;
- tests under:
  - `backend/functions/src/services/__tests__/...`
  - or script-unit test locations used in the repo;
- docs under the chosen My Projects implementation plan or admin/how-to area.

---

## Detailed execution steps

1. Inspect current repo migration/script patterns.
2. Choose the repo-native implementation location.
3. Implement a pure transformation function for a single Projects record so tests do not require live SharePoint.
4. Implement the dry-run/apply command shell or equivalent orchestration.
5. Ensure the transformation:
   - merges legacy values into canonical arrays;
   - preserves existing canonical values;
   - writes only changed serialized fields.
6. Add structured summary reporting.
7. Add tests for:
   - all four mapping paths;
   - empty legacy values;
   - canonical values already present;
   - overlapping duplicates;
   - malformed but salvageable multi-value legacy text;
   - idempotent rerun.
8. Document operator execution steps and `--apply` gate, but do not execute them.

---

## Validation requirements

Run applicable checks:

```bash
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
```

If a standalone script type-check path exists, use it. Otherwise ensure the script is covered by package-level TS configuration or explicitly document the constraint.

Use targeted search:

```bash
rg -n "leadEstimatorUpns|estimatorUpns|projectManagerUpns|projectExecutiveUpns|backfill|--apply|dry-run" \
  scripts \
  backend/functions/src \
  docs
```

---

## Evidence requirements

Closeout must include:

- chosen backfill implementation path;
- dry-run vs apply contract;
- transformation rules;
- test cases added;
- validation command outcomes;
- operator-owned live run commands, clearly marked as **not executed**.

---

## Commit / closeout expectations

Recommended commit title:

```text
feat(my-projects): add Projects role-array backfill workflow
```

Closeout format:

1. Verdict: PASS / FAIL
2. Branch / HEAD
3. Files changed
4. Mapping behavior implemented
5. Dry-run/apply posture
6. Test coverage summary
7. Validation commands and outcomes
8. Live tenant commands explicitly not executed
9. Recommended next prompt:
   - Prompt 06

---

## Guardrails

- Protect unrelated active work.
- No lockfile/package changes unless absolutely required.
- No destructive live tenant execution.
- No speculative conversion of all historical Projects fields beyond the four mappings required by the plan.
