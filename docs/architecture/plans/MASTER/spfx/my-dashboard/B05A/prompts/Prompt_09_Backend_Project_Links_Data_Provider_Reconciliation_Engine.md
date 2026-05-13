# Prompt 09 — Backend Project-Links Data Provider and Reconciliation Engine

## Objective

Implement the live backend service/provider logic for:

```http
GET /api/my-work/me/project-links
```

without yet registering the route handler. This prompt must create the backend read-model engine that:

- reads Projects and Legacy Registry sources;
- resolves assignments against the authenticated actor UPN supplied in context;
- merges/deduplicates source truth;
- assembles SharePoint and Procore launch actions;
- generates the `MyProjectLinksReadModel` envelope with truthful readiness/warnings.

## Mandatory efficiency instruction

Do not re-read files that are still fully available in your current context or working memory unless drift is suspected, a prior step changed them, or the prompt explicitly requires a fresh verification pass.

---

## Required inputs

- Prompt 08 closeout
- Prompt 07 closeout
- Prompt 05 and Prompt 06 closeouts for migration/source authority rules

---

## Repo-truth references to inspect

### Existing My Work provider interface
- `backend/functions/src/hosts/my-work-read-model/read-models/my-work-read-model-provider.ts`
- `backend/functions/src/hosts/my-work-read-model/read-models/my-work-mock-read-model-provider.ts`

### New shared project-links models
- files created by Prompt 08

### Source contracts
- `backend/functions/src/services/projects-list-contract.ts`
- `backend/functions/src/services/legacy-fallback/list-descriptors.ts`
- models under `packages/models/src/provisioning/`
- canonical role taxonomy and UPN helpers

### Semantics precedent
- `packages/spfx/src/webparts/projectSites/projectSitesResolver.ts`

Reuse semantic ideas, not UI code.

---

## Implementation scope

### 1. Extend provider interface

Extend:

```ts
IMyWorkReadModelProvider
```

with:

```ts
getMyProjectLinks(
  context: MyWorkReadContext,
): Promise<MyWorkReadModelEnvelope<MyProjectLinksReadModel>>;
```

Update the mock provider to return the relevant fixture envelope for this route.

### 2. Implement a live project-links provider/service

Use repo-native backend structure. The preferred outcome is:

- a project-links-specific service/repository layer under the existing `my-work-read-model` host or nearby service path;
- pure helper functions isolated for:
  - UPN matching;
  - source normalization;
  - link assembly;
  - record reconciliation;
  - deterministic sorting;
  - summary/warning generation.

### 3. Actor handling

This provider receives `context.actor.principalName` from the eventual route host. It must:

- normalize the actor UPN;
- return `principal-unresolved` envelope status if no usable actor UPN exists;
- never read actor identity from query/path/body.

### 4. Projects source behavior

Projects rows are eligible when:

- actor UPN matches at least one canonical role array;
- or, during transition, a supported legacy field fallback applies only where corresponding canonical arrays are empty.

Required fallback mappings:

- `leadEstimatorUpn` -> `leadEstimatorUpns`
- `supportingEstimatorUpns` -> `estimatorUpns`
- `projectManagerUpn` -> `projectManagerUpns`
- `projectExecutiveUpn` -> `projectExecutiveUpns`

### 5. Legacy Registry behavior

Registry rows are relevant when:

- active;
- truthfully matched or otherwise eligible under the plan’s rules;
- used either to enrich matched Projects rows or emit legacy-only assigned rows.

Preserve the plan’s authority matrix:

| Class | Display identity | Assignment authority | Procore authority | SharePoint authority |
|---|---|---|---|---|
| projects-only | Projects | Projects | Projects | Projects site |
| merged | Projects | Projects | Projects | Projects site first; Registry fallback second |
| legacy-only | Registry | Registry | Registry | Registry folder |

### 6. Dedupe and reconciliation

Implement deterministic merge rules:

1. strong registry linkage by matched Projects list item ID;
2. deterministic heuristic fallback using project number + legacy year if required by the existing precedent and safe under current source shape;
3. Projects-anchored records outrank synthetic legacy-only records;
4. one rendered record per reconciled project.

### 7. Launch action assembly

#### SharePoint action
- available when the resolved site/folder URL is valid and usable;
- label:
  - `Open SharePoint Site`
  - or `Open SharePoint Folder`
  - or `SharePoint unavailable`.

#### Procore action
- validate token:
  - non-empty;
  - no whitespace;
  - pattern:
    - `^[A-Za-z0-9_-]+$`
- construct:
  - `https://app.procore.com/${encodeURIComponent(procoreProject)}/project/home`
- if invalid:
  - no href;
  - unavailable label;
  - warning:
    - `procore-project-invalid`.

### 8. Source-read ceilings and partial statuses

Implement bounded source read logic:

- per-source hard ceiling:
  - 25,000 rows;
- if ceiling hit before exhaustion:
  - envelope/source status must become `partial`;
  - warning:
    - `assignment-source-bounded`;
- return partial resolved results, not a fake empty list.

### 9. Failure policy

Implement behavior for:

| Scenario | Expected result |
|---|---|
| both source reads succeed | `available` |
| Projects succeeds, Registry fails | `partial` |
| Projects fails, Registry succeeds | `partial` |
| both fail | `source-unavailable` |
| actor unresolved | `principal-unresolved` |

### 10. Sorting

Sort final items in the plan-defined order:

1. both SharePoint and Procore available;
2. SharePoint only;
3. Procore only;
4. neither;
5. project name;
6. project number;
7. record key.

### 11. Tests

Add unit/service tests for:

- actor normalization / principal unresolved;
- role matching across canonical arrays;
- legacy fallback compatibility;
- registry legacy-only eligibility;
- merged-row precedence;
- duplicate suppression;
- invalid Procore token;
- SharePoint action precedence;
- source failure partial statuses;
- bounded-source warning;
- sorting order;
- summary count accuracy.

---

## Required non-goals

- Do not register the Azure Function route yet; Prompt 10 handles host routing.
- Do not modify frontend clients.
- Do not build UI.
- Do not run live source reads against tenant data.
- Do not alter list schema.
- Do not add a new assignment-index list.

---

## Likely file families

- `backend/functions/src/hosts/my-work-read-model/read-models/my-work-read-model-provider.ts`
- `backend/functions/src/hosts/my-work-read-model/read-models/my-work-mock-read-model-provider.ts`
- new project-links provider/service/repository helpers
- tests under the matching backend host/service test folders.

---

## Validation requirements

Run:

```bash
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
```

Targeted searches:

```bash
rg -n "getMyProjectLinks|MyProjectLinksReadModel|assignment-source-bounded|procore-project-invalid|25000" \
  backend/functions/src \
  packages/models/src/myWork
```

---

## Evidence requirements

Closeout must include:

- provider/service files changed;
- exact read-model failure policy implemented;
- source ceiling behavior;
- test matrix summary;
- validation command outcomes;
- confirmation that route registration is intentionally deferred to Prompt 10.

---

## Commit / closeout expectations

Recommended commit title:

```text
feat(my-projects): implement project-links backend provider and reconciliation engine
```

Closeout format:

1. Verdict: PASS / FAIL
2. Branch / HEAD
3. Files changed
4. Provider/service architecture
5. Assignment/reconciliation/launch behavior
6. Source failure and bounded-source behavior
7. Validation commands and outcomes
8. Recommended next prompt:
   - Prompt 10

---

## Guardrails

- Protect unrelated active work.
- No lockfile/package changes.
- No live tenant execution.
- Preserve source authority rules exactly.
- Use Project Sites only as semantics precedent; do not import Project Sites UI or create frontend dependencies from backend code.
