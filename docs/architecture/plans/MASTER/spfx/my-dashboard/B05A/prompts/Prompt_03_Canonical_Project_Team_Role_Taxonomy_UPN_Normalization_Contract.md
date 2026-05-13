# Prompt 03 — Canonical Project-Team Role Taxonomy and UPN Normalization Contract

## Objective

Create the shared, repo-native **canonical project-team role taxonomy** and **UPN parsing/normalization contract** that every later My Projects layer will consume.

This prompt is the foundation for:

- Projects backfill;
- Legacy Registry backfill;
- backend assignment matching;
- UI role-pill rendering;
- warning codes and compatibility behavior.

## Mandatory efficiency instruction

Do not re-read files that are still fully available in your current context or working memory unless drift is suspected, a prior step changed them, or the prompt explicitly requires a fresh verification pass.

---

## Required inputs

- Prompt 02 closeout
- `supporting/02_Plan_Reconciliation_Updated_Closed_Decisions.md`

---

## Repo-truth references to inspect

### Existing role/team model areas
- `packages/models/src/provisioning/IProvisioning.ts`
- `backend/functions/src/services/projects-list-contract.ts`
- `packages/features/estimating/src/project-setup/config/projectTeamFields.ts` if present
- any existing reusable UPN normalization helpers in the repo

### Existing JSON-array parsing precedents
- role/group array parsers in provisioning, project setup, or legacy-fallback services
- any helper used for:
  - `viewerUPNs`
  - `groupMembers`
  - `groupLeaders`
  - `supportingEstimatorUpns`
  - `sageAccessUpns`

---

## Implementation scope

### 1. Define the fourteen-role canonical taxonomy

Create a shared model/contract location consistent with repo conventions. The package should expose:

```ts
type MyProjectAssignmentRoleId =
  | 'lead-estimator'
  | 'estimator'
  | 'ids-manager'
  | 'project-accountant'
  | 'project-administrator'
  | 'project-coordinator'
  | 'superintendent'
  | 'lead-superintendent'
  | 'project-manager'
  | 'lead-project-manager'
  | 'project-executive'
  | 'safety-coordinator'
  | 'qc-manager'
  | 'warranty-manager';
```

Create a stable role definition table mapping:

- role ID;
- internal column name;
- display label;
- sort/order priority.

Required column mapping:

| Role ID | Internal field | Display label |
|---|---|---|
| `lead-estimator` | `leadEstimatorUpns` | Lead Estimator |
| `estimator` | `estimatorUpns` | Estimator |
| `ids-manager` | `idsManagerUpns` | IDS Manager |
| `project-accountant` | `projectAccountantUpns` | Project Accountant |
| `project-administrator` | `projectAdministratorUpns` | Project Administrator |
| `project-coordinator` | `projectCoordinatorUpns` | Project Coordinator |
| `superintendent` | `superintendentUpns` | Superintendent |
| `lead-superintendent` | `leadSuperintendentUpns` | Lead Superintendent |
| `project-manager` | `projectManagerUpns` | Project Manager |
| `lead-project-manager` | `leadProjectManagerUpns` | Lead Project Manager |
| `project-executive` | `projectExecutiveUpns` | Project Executive |
| `safety-coordinator` | `safetyCoordinatorUpns` | Safety Coordinator |
| `qc-manager` | `qcManagerUpns` | QC Manager |
| `warranty-manager` | `warrantyManagerUpns` | Warranty Manager |

### 2. Implement normalization helpers

Create reusable helpers consistent with repo style for:

- `normalizeUpn(value: unknown): string | null`
- `normalizeUpnArray(values: unknown): string[]`
- `parseUpnArrayStorage(value: unknown): string[]`

The behavior must follow the plan:

1. trim;
2. lowercase;
3. discard empty values;
4. discard implausible non-email tokens;
5. dedupe;
6. sort ascending;
7. return a canonical string array.

### 3. Implement permissive read parsing

`parseUpnArrayStorage` must support:

- proper JSON-array strings;
- malformed but salvageable JSON-array strings when practical;
- comma-delimited migration text;
- semicolon-delimited migration text;
- materialized arrays from adapters;
- null/undefined as empty arrays.

The canonical writer always serializes JSON arrays. Permissive parsing is read/migration safety only.

### 4. Define serialization helper if repo conventions support it

Where appropriate, add:

```ts
serializeUpnArrayStorage(values: unknown): string
```

returning deterministic JSON-array text.

### 5. Add tests

Create tests proving:

- casing normalization;
- whitespace trimming;
- duplicate removal;
- invalid token rejection;
- JSON array parse;
- comma/semicolon migration parse;
- null/undefined handling;
- deterministic sorting;
- role-definition table includes exactly fourteen roles and no duplicate field names.

---

## Required non-goals

- Do not backfill live data.
- Do not change tenant lists.
- Do not implement backend source reads.
- Do not implement UI.
- Do not alter Procore semantics in this prompt.
- Do not remove legacy scalar role fields.

---

## Likely file families

Use repo-native placement, but likely change:

- `packages/models/src/myWork/...` or another shared model family if that is the cleanest target;
- `packages/models/src/index.ts` or barrel exports if required;
- test files under the matching package;
- potentially shared utility files consumed later by backend/scripts.

Do not create duplicate utilities if an existing suitable shared helper already exists; extend or reuse it.

---

## Validation requirements

Run:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
```

If helper placement touches functions or app packages, run the narrowest additional necessary checks and state why.

Use targeted search:

```bash
rg -n "lead-estimator|warranty-manager|leadEstimatorUpns|warrantyManagerUpns|normalizeUpn|parseUpnArrayStorage|serializeUpnArrayStorage" \
  packages/models/src
```

---

## Evidence requirements

Closeout must include:

- canonical role taxonomy location;
- helper function location;
- test coverage summary;
- confirmation of exact fourteen-role count;
- confirmation that helpers are reusable by future backfill/backend prompts.

---

## Commit / closeout expectations

Recommended commit title:

```text
feat(my-projects): add canonical role taxonomy and UPN normalization contract
```

Closeout format:

1. Verdict: PASS / FAIL
2. Branch / HEAD
3. Files changed
4. Role taxonomy summary
5. Helper behavior summary
6. Validation commands and outcomes
7. Known follow-on work intentionally deferred
8. Recommended next prompt:
   - Prompt 04

---

## Guardrails

- Protect unrelated active work.
- No lockfile/package changes unless required by the repo-native implementation path.
- No speculative broad identity normalization refactor across the monorepo.
- Preserve existing field semantics until Prompt 04 and Prompt 05 target those changes explicitly.
