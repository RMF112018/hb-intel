# Prompt 03 — Add Frontend Load Performance Marks and Useful-State Measures

## Role

Act as a senior frontend performance engineer and instrumentation designer working in `RMF112018/hb-intel`.

## Objective

Add a privacy-safe User Timing instrumentation layer so future validation can quantify:
- shell mount timing,
- backend request timing by route,
- module time-to-useful.

This is an instrumentation prompt, not a UX redesign prompt.

## Governing Package Files

Read:
- `04_Observability_And_Telemetry_Plan.md`
- `03_Validation_Matrix_And_Acceptance_Criteria.md`

Do **not** re-read files that remain within current context or memory unless needed.

## Primary Files to Edit

Likely:
- `apps/my-dashboard/src/runtime/myWorkPerformanceMarks.ts` — create
- `apps/my-dashboard/src/shell/MyWorkShell.tsx`
- `apps/my-dashboard/src/api/myWorkBackendReadModelClient.ts`
- `apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.tsx`
- `apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.tsx`

Add tests where appropriate.

## Required Utility

Create a safe helper that:
- no-ops when `performance` is unavailable,
- wraps `performance.mark` and `performance.measure`,
- never throws,
- accepts only safe primitive detail fields,
- does not encode PII or payload data.

Recommended exported functions:
```ts
markMyWork(...)
measureMyWork(...)
```

## Required Marks

### Shell
Emit:
```text
my-dashboard:shell:mounted
```

### Requests
Around backend-client route calls, emit:

```text
my-dashboard:request:home:start
my-dashboard:request:home:end
my-dashboard:request:home:duration

my-dashboard:request:project-links:start
my-dashboard:request:project-links:end
my-dashboard:request:project-links:duration

my-dashboard:request:adobe-sign-recent-completions:start
my-dashboard:request:adobe-sign-recent-completions:end
my-dashboard:request:adobe-sign-recent-completions:duration
```

### Module useful states
Emit exactly once per mount when each module exits pure loading:

```text
my-dashboard:module:my-projects:useful
my-dashboard:module:adobe-sign-action-queue:useful
```

The useful mark is not “successful only.” It means the card has reached an intentional end-user state other than pure loading.

## Required Tests

Add or update tests to cover:
- helper no-op behavior when `performance` is missing,
- route request start/end measures call safely if practical,
- module marks do not cause render errors.

Do not overfit tests to browser API implementation details.

## Prohibited

Do not:
- add a frontend telemetry transport,
- add console spam,
- log user/project/agreement data,
- alter module semantics,
- add cache behavior.

## Validation

Run:

```bash
pnpm --filter @hbc/spfx-my-dashboard test
pnpm --filter @hbc/spfx-my-dashboard check-types
```

## Required Closeout Format

### Summary
### Instrumentation Added
### Files Modified
### Tests / Validation
### How to Inspect Marks in DevTools
### Commit Recommendation
