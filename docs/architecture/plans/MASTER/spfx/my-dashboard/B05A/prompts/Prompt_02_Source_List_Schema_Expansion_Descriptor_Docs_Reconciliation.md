# Prompt 02 — Source List Schema Expansion and Descriptor / Docs Reconciliation

## Objective

Implement the **schema-contract layer** required for the My Projects module without executing live tenant mutations. Expand repo-side contracts, descriptors, and schema-governance documentation so both assignment-capable source lists are prepared for:

- fourteen canonical multi-value project-team role fields; and
- Legacy Registry `procoreProject`.

This prompt must also explicitly reconcile or document the current `FolderWebUrl` descriptor/live-schema drift.

## Mandatory efficiency instruction

Do not re-read files that are still fully available in your current context or working memory unless drift is suspected, a prior step changed them, or the prompt explicitly requires a fresh verification pass.

---

## Required inputs

- Prompt 00 closeout
- Prompt 01 readiness artifact
- `supporting/02_Plan_Reconciliation_Updated_Closed_Decisions.md`
- `supporting/04_Risks_Prerequisites_Operator_Owned_Steps.md`

---

## Repo-truth references to inspect

### Projects list contract/schema
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/projects.md`
- `backend/functions/src/services/projects-list-contract.ts`

### Legacy Registry contract/schema
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/legacy-project-fallback-registry.md`
- `backend/functions/src/services/legacy-fallback/list-descriptors.ts`
- `backend/functions/src/services/legacy-fallback/provisioning-compatibility.ts`
- `scripts/provision-legacy-fallback-lists.ts`

### Relevant tests if present
- tests that assert Projects field maps/readiness
- tests that assert legacy-fallback descriptors/provisioning compatibility

---

## Implementation scope

### 1. Expand repo-side schema contracts for both source lists

Both source lists must support the following fourteen canonical fields:

```text
leadEstimatorUpns
estimatorUpns
idsManagerUpns
projectAccountantUpns
projectAdministratorUpns
projectCoordinatorUpns
superintendentUpns
leadSuperintendentUpns
projectManagerUpns
leadProjectManagerUpns
projectExecutiveUpns
safetyCoordinatorUpns
qcManagerUpns
warrantyManagerUpns
```

### 2. Storage contract

For every new role field:

- storage class:
  - SharePoint `MultiLineText` / Note;
- semantics:
  - JSON-serialized `string[]`;
- required:
  - false;
- indexed:
  - false unless a documented repo reason proves otherwise;
- default:
  - `'[]'` only when the governing descriptor/provisioning pattern supports that safely and consistently.

### 3. Legacy Registry `procoreProject`

Add the repo-side target contract for:

```text
procoreProject
```

- type:
  - Text;
- required:
  - false;
- meaning:
  - raw Procore project identifier/token used by read-model URL assembly.

### 4. Projects list contract posture

Update the Projects persistence contract so it can represent the target new fields. The exact file placement must follow current repo conventions.

Expected likely files:
- `backend/functions/src/services/projects-list-contract.ts`
- related tests
- Projects schema docs

Do not remove existing compatibility fields in this prompt:

- `projectExecutiveUpn`
- `projectManagerUpn`
- `leadEstimatorUpn`
- `supportingEstimatorUpns`

### 5. Legacy Registry descriptor posture

Update:
- `LEGACY_FALLBACK_REGISTRY_LIST_DESCRIPTOR`

to include:

- the fourteen canonical role fields;
- `procoreProject`.

Do **not** change live tenant data in this prompt.

### 6. `FolderWebUrl` drift handling

The current repo is known to have a drift:

- live schema reference says `FolderWebUrl` is Text;
- descriptor says URL;
- compatibility helper treats URL as compatible only with URL.

Closed implementation decision:
- do **not** widen this prompt into destructive type recreation;
- do **not** silently ignore the drift;
- document the drift explicitly in an audit note, migration note, or updated provisioning documentation;
- if the repo convention supports resolving the descriptor to the observed live contract without breaking runtime usage, propose that only if clearly justified and testable;
- otherwise leave it as a clearly documented operator/provisioning-readiness issue.

---

## Required non-goals

- Do not run live list provisioning.
- Do not run list backfills.
- Do not alter tenant SharePoint lists.
- Do not remove existing scalar role fields.
- Do not change `procoreProject` semantics across the wider domain model yet; that belongs to Prompt 04.
- Do not implement backend route logic or UI.
- Do not add a new assignment-index list.

---

## Detailed execution steps

1. Confirm Prompt 01 did not block schema work on unresolved permission assumptions.
2. Update Projects schema-reference documentation to describe the target new fields as planned/provisioning-required if they are not live yet.
3. Update Projects persistence contract/types/select fields/readiness warnings to include the fourteen new target fields in the correct optional-extension or equivalent repo-native location.
4. Update Legacy Registry descriptor with:
   - fourteen role fields;
   - `procoreProject`.
5. Update Legacy Registry schema-reference documentation to distinguish:
   - current live fields;
   - My Projects target provisioning additions;
   - operator-run provisioning requirement.
6. Add/update tests proving:
   - all 14 role fields exist in descriptor/contract lists;
   - Legacy Registry includes `procoreProject`;
   - field types are correct;
   - compatibility/readiness helpers do not silently suppress the `FolderWebUrl` drift.
7. Add a concise schema gap table documenting:
   - live current state;
   - target state;
   - prompt responsible for tenant mutation (later operator-gated prompts/scripts).

---

## Validation requirements

Run applicable commands:

```bash
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
```

If model exports or shared types are touched in a way that requires it:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
```

Use targeted searches:

```bash
rg -n "leadEstimatorUpns|estimatorUpns|idsManagerUpns|projectAccountantUpns|projectAdministratorUpns|projectCoordinatorUpns|superintendentUpns|leadSuperintendentUpns|projectManagerUpns|leadProjectManagerUpns|projectExecutiveUpns|safetyCoordinatorUpns|qcManagerUpns|warrantyManagerUpns|procoreProject" \
  backend/functions/src/services/projects-list-contract.ts \
  backend/functions/src/services/legacy-fallback/list-descriptors.ts \
  docs/reference/sharepoint/list-schemas/hbcentral/lists/projects.md \
  docs/reference/sharepoint/list-schemas/hbcentral/lists/legacy-project-fallback-registry.md
```

If `FolderWebUrl` documentation is touched, validate the relevant references are explicit:

```bash
rg -n "FolderWebUrl|type drift|Text|URL" \
  backend/functions/src/services/legacy-fallback/list-descriptors.ts \
  backend/functions/src/services/legacy-fallback/provisioning-compatibility.ts \
  docs/reference/sharepoint/list-schemas/hbcentral/lists/legacy-project-fallback-registry.md
```

---

## Evidence requirements

Closeout must include:

- changed file list;
- explicit schema additions;
- whether `FolderWebUrl` drift was:
  - documented only;
  - descriptor-reconciled;
  - or left operator-pending;
- exact validation commands and outcomes;
- statement that no live tenant mutations were executed.

---

## Commit / closeout expectations

Recommended commit title if implementation passes:

```text
feat(my-projects): define assignment-capable list schema contracts
```

Closeout format:

1. Verdict: PASS / FAIL
2. Branch / HEAD
3. Files changed
4. Projects contract additions
5. Legacy Registry descriptor additions
6. `FolderWebUrl` drift disposition
7. Validation commands and outcomes
8. Residual tenant/operator prerequisites
9. Recommended next prompt:
   - Prompt 03

---

## Guardrails

- Protect unrelated active work.
- No lockfile/package changes unless absolutely required and justified.
- No speculative schema redesign.
- No destructive tenant actions.
- Preserve repo conventions; if Projects schema provisioning lacks a direct descriptor pattern, document the repo-native extension path rather than inventing ad hoc mutation behavior.
