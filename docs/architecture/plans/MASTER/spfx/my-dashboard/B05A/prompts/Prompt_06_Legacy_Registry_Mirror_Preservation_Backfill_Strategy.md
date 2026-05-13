# Prompt 06 — Legacy Registry Mirror / Preservation Backfill Strategy

## Objective

Implement the repo-side migration/backfill strategy for the **Legacy Project Fallback Registry** so it supports the My Projects dual-launch module with correct source authority:

- **matched Registry rows** mirror Projects-authoritative canonical role arrays and `procoreProject`;
- **legacy-only Registry rows** preserve operator-maintained role arrays and `procoreProject`;
- no sync/backfill path blanks valid operator-maintained values merely because Projects authority is absent.

This prompt must produce code/tests/docs suitable for operator-gated live execution, but it must **not** run live writes autonomously.

## Mandatory efficiency instruction

Do not re-read files that are still fully available in your current context or working memory unless drift is suspected, a prior step changed them, or the prompt explicitly requires a fresh verification pass.

---

## Required inputs

- Prompt 02 closeout
- Prompt 03 closeout
- Prompt 04 closeout
- Prompt 05 closeout
- Prompt 01 readiness artifact

---

## Repo-truth references to inspect

### Registry schema/descriptors
- `backend/functions/src/services/legacy-fallback/list-descriptors.ts`
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/legacy-project-fallback-registry.md`

### Registry discovery/write behavior
- `backend/functions/src/services/legacy-fallback/discovery-repository.ts`
- matching engine/service files used to resolve Projects matches
- Registry model types under `packages/models/src/provisioning/`

### Projects authority sources
- `backend/functions/src/services/projects-list-contract.ts`
- Projects read/mapping services as needed

### Utilities from previous prompts
- canonical role taxonomy
- UPN normalization / serialization helpers
- `procoreProject` string-token contract

---

## Implementation scope

### 1. Matched-row mirror behavior

For Registry rows with Projects authority, mirror:

- fourteen canonical role arrays;
- `procoreProject`.

Authority rules:

- Projects wins;
- matched Registry rows do not preserve stale manual role arrays against authoritative Projects data;
- mirror writes must be deterministic and idempotent.

### 2. Legacy-only preservation behavior

For Registry rows without Projects authority:

- preserve operator-maintained role arrays;
- preserve operator-maintained `procoreProject`;
- do not overwrite these with blanks or absent Projects values;
- allow manual values to remain valid source-of-truth for legacy-only My Projects eligibility.

### 3. Operator-safe backfill workflow

Use repo-native style. Preferred posture:

- default dry-run;
- explicit `--apply`;
- structured summary output;
- counts for:
  - rows scanned;
  - matched rows mirrored;
  - legacy-only rows preserved;
  - rows unchanged;
  - rows skipped due to insufficient linkage;
  - warnings.

### 4. Strong vs heuristic match handling

Respect the plan and existing Project Sites semantic precedent:

- strong linkage:
  - `MatchedProjectListItemId`;
- deterministic fallback linkage when required:
  - project number + legacy year.

If the backfill uses only strong linkage for safety, document that deliberate choice and explain what still happens at runtime for read-model merging. The default implementation should support the closed plan unless repo truth proves a safer limited scope is necessary.

### 5. Documentation

Add/update docs explaining:

- matched-row mirror contract;
- legacy-only preservation contract;
- when operators edit Registry fields manually;
- what live backfill steps are operator-owned.

---

## Required non-goals

- Do not run live tenant `--apply`.
- Do not correct the discovery writer’s hard-coded match-state override in this prompt; Prompt 07 handles that.
- Do not implement My Work read models or UI.
- Do not add a new persistent assignment-index list.
- Do not change source authority rules from the closed plan.

---

## Likely file families

Depending on repo conventions:

- new script under `scripts/`, e.g.:
  - `scripts/backfill-my-project-legacy-registry-fields.ts`;
- helper/service files in:
  - `backend/functions/src/services/legacy-fallback/...`;
- model files in:
  - `packages/models/src/provisioning/...`;
- tests under backend/functions service test locations;
- docs/how-to or implementation docs.

---

## Detailed execution steps

1. Inspect repo-native legacy Registry read/write patterns.
2. Implement a pure transformation layer for:
   - matched mirror;
   - legacy-only preservation.
3. Implement or extend a dry-run/apply backfill orchestration path.
4. For matched rows:
   - resolve authoritative Projects source;
   - derive role arrays and `procoreProject`;
   - compute changes only when serialized values differ.
5. For legacy-only rows:
   - normalize/preserve current values;
   - avoid blank-overwrites.
6. Add summary reporting and warnings.
7. Add tests for:
   - matched Registry row mirrors Projects role arrays;
   - matched Registry row mirrors Projects `procoreProject`;
   - legacy-only row preserves manual role arrays;
   - legacy-only row preserves manual Procore token;
   - blank Projects values do not erase legacy-only values;
   - rerun idempotency;
   - unresolved match/link produces warning, not destructive write.
8. Update docs.

---

## Validation requirements

Run:

```bash
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
```

Targeted search:

```bash
rg -n "legacy-only|matched|procoreProject|projectExecutiveUpns|warrantyManagerUpns|--apply|dry-run|mirror|preserve" \
  scripts \
  backend/functions/src/services/legacy-fallback \
  packages/models/src/provisioning \
  docs
```

---

## Evidence requirements

Closeout must include:

- matched-row mirror behavior summary;
- legacy-only preservation behavior summary;
- dry-run/apply command posture;
- test coverage summary;
- validation command results;
- clear statement that live tenant mutation was not executed.

---

## Commit / closeout expectations

Recommended commit title:

```text
feat(my-projects): add legacy registry mirror and preservation backfill
```

Closeout format:

1. Verdict: PASS / FAIL
2. Branch / HEAD
3. Files changed
4. Matched-row mirror behavior
5. Legacy-only preservation behavior
6. Operator-run command posture
7. Validation commands and outcomes
8. Residual gaps, if any
9. Recommended next prompt:
   - Prompt 07

---

## Guardrails

- Protect unrelated active work.
- No lockfile/package changes unless strictly required.
- No destructive tenant operations.
- Preserve closed source-authority rules.
- Do not blur the distinction between matched Registry rows and legacy-only Registry rows.
