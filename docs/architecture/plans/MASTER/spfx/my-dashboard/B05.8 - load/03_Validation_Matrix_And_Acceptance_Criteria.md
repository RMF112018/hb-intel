# 03 — Validation Matrix and Acceptance Criteria

## Purpose

This file defines the acceptance conditions for the remediation package. It should be used by both the code agent and the reviewer to prevent the work from drifting into superficial UI tweaks or unproven backend refactors.

---

# A. Functional Acceptance Matrix

| Area | Acceptance Criterion | Evidence |
|---|---|---|
| Shell render | Shell and hero render immediately as before | Existing shell tests remain green |
| Loading composition | Loading variant renders both `my-projects-home` and `adobe-sign-action-queue` | Updated surface and router tests |
| Error composition | Error variant renders both `my-projects-home` and `adobe-sign-action-queue` | Updated surface tests |
| My Projects local state | My Projects shows its own loading compact state during page home loading | DOM assertion |
| Adobe local state | Adobe card remains `loading` when home envelope is pending | DOM assertion |
| Request concurrency | `getMyProjectLinks()` is invoked while `getMyWorkHome()` remains unresolved | Router/integration test |
| Readiness correctness | No false ready/available source marker appears while home is unresolved | Router test |
| Client ownership | My Projects uses shared read-model client context | Source review + tests |
| Prop cleanup | No obsolete `getApiToken` prop remains in My Projects surface/router path | Typecheck + source review |
| Completed view | Recent completions remain interaction-deferred | Existing Adobe card tests remain green |
| Performance marks | Marks and measures are added safely and are no-ops if `performance` unavailable | Unit tests or source review |
| Backend telemetry | Stage duration fields/events are emitted without sensitive payloads | Unit tests + source review |
| No copy regression | Production-grade copy remains intact; no TODO/mock/placeholder copy introduced | Existing surface tests + review |

---

# B. Required Test Contract Changes

## 1. `MyWorkHomeSurface.test.tsx`

### Existing behavior to replace
Current test expectation during loading:
```text
['adobe-sign-action-queue']
```

### New expected behavior
```text
['my-projects-home', 'adobe-sign-action-queue']
```

### Add assertions
- My Projects card exists.
- Adobe card remains loading.
- Readiness marker remains loading.
- My Projects loading compact block exists when the projects request is unresolved.

---

## 2. `MyWorkSurfaceRouter.test.tsx`

### New test to add
When `getMyWorkHome()` never resolves:

- Surface renders home loading marker.
- My Projects card mounts.
- `getMyProjectLinks()` is called.
- Adobe loading card exists.
- No ready source-status marker is shown.

### Suggested scenario
Use:
```ts
getMyWorkHome: () => new Promise(() => {})
```

and a resolvable or pending `getMyProjectLinks` stub depending on assertion focus.

---

## 3. `MyProjectsHomeCard.test.tsx`

### Required update
Stop mocking:
```text
../../api/myWorkReadModelClientFactory.js
```

Instead:
- Wrap the card in `MyWorkReadModelClientProvider`.
- Inject a stub client.
- Maintain all existing behavioral assertions.

### Why
The test must validate the public runtime seam after Prompt 02, not a deleted local factory path.

---

# C. Suggested New Unit Coverage

## Performance helper tests

Create focused tests for the frontend performance helper:

- does not throw when `performance` is undefined,
- calls `performance.mark` where available,
- calls `performance.measure` where available,
- does not encode prohibited detail fields by construction.

---

# D. Backend Telemetry Acceptance

## Adobe

Events should include duration fields without weakening existing telemetry safety.

Minimum expectations:
- principal resolution result event contains `durationMs`,
- token acquisition result event contains `durationMs`,
- refresh result event contains `durationMs` where refresh executes,
- search result event contains `durationMs`,
- action-queue result event contains overall adapter `durationMs`.

## Project Links

Minimum expectations:
- source loading summary event records both loader durations and safe counts,
- reconciliation summary event records duration and matched count.

No event may include raw source rows or actor identity.

---

# E. Validation Commands

## Frontend
```bash
pnpm --filter @hbc/spfx-my-dashboard test
pnpm --filter @hbc/spfx-my-dashboard check-types
```

## Backend
```bash
pnpm --filter @hbc/functions test
pnpm --filter @hbc/functions check-types
```

---

# F. Manual Browser Validation

After deployment or local hosted preview:

1. Open My Dashboard with DevTools Network panel.
2. Disable cache for capture clarity.
3. Reload.
4. Confirm both module cards render immediately.
5. Confirm `/home` and `/project-links` begin without visible serial blocking.
6. Confirm Adobe Completed still does not call its backend route until clicked.
7. Capture HAR if performing the Prompt 05 evidence pass.

---

# G. Definition of Done

The remediation package is complete only when:

- code changes are implemented,
- tests updated and passing,
- type checks passing,
- frontend mark names documented,
- backend telemetry names documented,
- evidence closeout prepared,
- follow-on architecture decisions are explicitly deferred pending evidence.
