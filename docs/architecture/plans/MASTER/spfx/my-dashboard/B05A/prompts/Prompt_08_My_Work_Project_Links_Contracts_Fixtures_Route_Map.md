# Prompt 08 — My Work Project-Links Contracts, Fixtures, and Route Map

## Objective

Add the shared My Work read-model contract family for the My Projects module. This prompt must introduce:

- the `MyProjectLinksReadModel`;
- item DTOs;
- warning codes;
- source-readiness data specific to project-links;
- route map and response map additions;
- deterministic fixtures for all key UI/backend scenarios.

This is a **shared model and fixture** prompt. It must not implement live backend reads or React UI.

## Mandatory efficiency instruction

Do not re-read files that are still fully available in your current context or working memory unless drift is suspected, a prior step changed them, or the prompt explicitly requires a fresh verification pass.

---

## Required inputs

- Prompt 03 closeout
- Prompt 04 closeout
- Prompt 07 closeout
- `supporting/02_Plan_Reconciliation_Updated_Closed_Decisions.md`

---

## Repo-truth references to inspect

- `packages/models/src/myWork/MyWorkReadModels.ts`
- `packages/models/src/myWork/AdobeSignActionQueue.ts`
- `packages/models/src/myWork/fixtures/...`
- barrel/index exports under `packages/models/src/myWork/`

If prompt 03 placed shared role taxonomy or UPN helpers under a nearby model family, reuse those exactly.

---

## Implementation scope

### 1. Add route key and route path

Extend:

```ts
MY_WORK_READ_MODEL_ROUTE_PATHS
```

with:

```ts
'project-links': 'my-work/me/project-links'
```

Extend:

- `MyWorkReadModelRouteKey`;
- `MyWorkReadModelResponseMap`.

### 2. Add `MyProjectLinksReadModel`

Implement the target contract from the plan, adjusted only as needed to match existing My Work type style.

Minimum required structure:

```ts
interface MyProjectLinksReadModel {
  readonly moduleId: 'my-project-links';
  readonly actor: {
    readonly principalName: string;
    readonly displayName?: string;
  };
  readonly summary: {
    readonly assignedProjectCount: number;
    readonly dualLaunchReadyCount: number;
    readonly sharePointReadyCount: number;
    readonly procoreReadyCount: number;
    readonly noSharePointLaunchCount: number;
    readonly noProcoreLaunchCount: number;
    readonly projectsOnlyCount: number;
    readonly mergedCount: number;
    readonly legacyOnlyCount: number;
  };
  readonly items: readonly MyProjectLinkItem[];
  readonly sourceReadiness: {
    readonly projects: MyWorkReadModelSourceStatus;
    readonly legacyFallbackRegistry: MyWorkReadModelSourceStatus;
  };
}
```

### 3. Add item DTO

Minimum required structure:

```ts
interface MyProjectLinkItem {
  readonly recordKey: string;
  readonly source: 'projects-only' | 'merged' | 'legacy-only';
  readonly projectName: string;
  readonly projectNumber: string;
  readonly projectStage?: string;
  readonly assignmentRoles: readonly MyProjectAssignmentRoleId[];
  readonly sharePointAction: {
    readonly state: 'available' | 'unavailable';
    readonly kind: 'project-site' | 'legacy-folder' | 'none';
    readonly label:
      | 'Open SharePoint Site'
      | 'Open SharePoint Folder'
      | 'SharePoint unavailable';
    readonly href?: string;
  };
  readonly procoreAction: {
    readonly state: 'available' | 'unavailable';
    readonly label: 'Open Procore' | 'Procore unavailable';
    readonly procoreProject?: string;
    readonly href?: string;
  };
  readonly provenance: {
    readonly projectsListItemId?: number;
    readonly legacyRegistryItemId?: number;
    readonly legacyMatchedProjectListItemId?: number;
    readonly fallbackMatchMethod?: string;
    readonly fallbackMatchConfidence?: string;
  };
  readonly warnings: readonly MyProjectLinkWarning[];
}
```

### 4. Add warning codes

Required warning codes:

```ts
type MyProjectLinkWarningCode =
  | 'sharepoint-launch-unavailable'
  | 'procore-launch-unavailable'
  | 'procore-project-invalid'
  | 'assignment-source-bounded'
  | 'projects-source-partial'
  | 'legacy-registry-source-partial'
  | 'legacy-match-state-excluded'
  | 'legacy-role-data-preserved'
  | 'schema-transition-legacy-role-fallback-used';
```

Use repo-native naming/export style.

### 5. Respect the local readiness decision

Do **not** broaden `MyWorkHomeReadModel.sourceReadiness` from Adobe-only to multi-source in this prompt. The new project-links read model owns its own readiness fields.

### 6. Add deterministic fixture scenarios

Add fixture envelopes for at least:

1. available:
   - dual-launch ready;
   - mixed projects-only / merged / legacy-only items;
2. more-than-six-items:
   - to support inline expansion UI;
3. mixed-action-availability:
   - SharePoint available / Procore unavailable;
   - Procore available / SharePoint unavailable;
4. no assigned projects;
5. partial source readiness:
   - Projects available, Registry partial;
6. source unavailable;
7. principal unresolved;
8. backend unavailable;
9. bounded-source partial warning.

Ensure fixture actor identity is deterministic and avoids production-like sensitive data beyond existing fixture conventions.

### 7. Add model/fixture tests

Test:

- route-path map includes project-links;
- response map type/export correctness;
- fixtures use valid warning/status vocabulary;
- all fixture items satisfy DTO shape;
- sorting is not implemented here unless existing fixture tests depend on ordering, but fixture data should be arranged in the target expected rendered order.

---

## Required non-goals

- Do not implement backend provider logic.
- Do not register route handlers.
- Do not modify frontend clients.
- Do not build UI.
- Do not broaden home-level source readiness.
- Do not invent a new route naming pattern.

---

## Likely file families

- `packages/models/src/myWork/MyWorkReadModels.ts`
- new project-links model file under `packages/models/src/myWork/` if that matches Adobe queue precedent
- fixture files under:
  - `packages/models/src/myWork/fixtures/`
- barrel exports
- model/fixture tests.

---

## Validation requirements

Run:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
```

Search validation:

```bash
rg -n "project-links|MyProjectLinksReadModel|MyProjectLinkItem|MyProjectLinkWarningCode|my-work/me/project-links" \
  packages/models/src/myWork
```

---

## Evidence requirements

Closeout must include:

- exact contract files changed;
- new route key/path;
- fixture scenario list;
- validation results;
- confirmation that home-level Adobe-specific readiness was not broadened.

---

## Commit / closeout expectations

Recommended commit title:

```text
feat(my-projects): add project-links read-model contracts and fixtures
```

Closeout format:

1. Verdict: PASS / FAIL
2. Branch / HEAD
3. Files changed
4. Contract additions
5. Fixture scenarios added
6. Validation commands and outcomes
7. Deferred work intentionally left for backend/frontend prompts
8. Recommended next prompt:
   - Prompt 09

---

## Guardrails

- Protect unrelated active work.
- No lockfile/package changes.
- No speculative rewrite of existing My Work contracts.
- Preserve repo-native route naming and envelope conventions.
