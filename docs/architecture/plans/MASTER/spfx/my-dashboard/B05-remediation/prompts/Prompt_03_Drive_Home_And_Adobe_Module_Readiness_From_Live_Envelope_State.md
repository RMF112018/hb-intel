# Prompt 03 — Drive Home and Adobe Module Readiness from Live Envelope State

## Objective

Replace the current hardcoded `non-ready` surface default behavior with readiness decisions derived from actual My Work read-model envelope state.

## Why this exists now

The audit found:

- `MyWorkHomeSurface` defaults to `'non-ready'`.
- `AdobeSignActionQueueModuleSurface` defaults to `'non-ready'`.
- `MyWorkSurfaceRouter` instantiates both without passing a readiness variant.
- Therefore, an authenticated user remains in non-ready presentation even if backend/runtime conditions are satisfied.

Prompt 02 established the data/runtime seam. Prompt 03 must now use it to control which surface variant renders.

## Required future state

Surface readiness must be derived from backend envelope states, not from an unconditional component default.

### Required status semantics

Use a closed mapping based on `MyWorkReadModelSourceStatus`:

| Source status | Surface readiness |
|---|---|
| `available` | ready |
| `partial` | ready with warnings/partial-state signaling as appropriate |
| `configuration-required` | non-ready |
| `authorization-required` | non-ready |
| `principal-unresolved` | non-ready |
| `source-unavailable` | non-ready |
| `backend-unavailable` | non-ready |

If the existing architecture suggests a more precise mapping for `partial`, document and implement it consistently, but do not make it silently identical to full availability.

## Required scope

Update the surface layer so that:

1. Home readiness is derived from the home read-model envelope / source-readiness records.
2. Adobe focused-module readiness is derived from the Adobe queue envelope.
3. `MyWorkSurfaceRouter` receives data/readiness state and passes it explicitly into:
   - `MyWorkHomeSurface`
   - `AdobeSignActionQueueModuleSurface`
4. The surfaces no longer rely on production-default implicit `non-ready` behavior when live data exists.

## Exact seams to inspect and likely touch

```text
apps/my-dashboard/src/shell/MyWorkSurfaceRouter.tsx
apps/my-dashboard/src/surfaces/home/MyWorkHomeSurface.tsx
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueModuleSurface.tsx
apps/my-dashboard/src/state/...
apps/my-dashboard/src/api/... or new view-model/readiness helper seams created in Prompt 02
packages/models/src/myWork/MyWorkReadModels.ts
```

A small dedicated readiness selector/helper is preferred if it prevents status mapping duplication.

## Required handling of loading / first render

Do not flash a false “ready” state before data resolves.

Choose and document one of these:
- explicit loading skeleton/state,
- or stable initial non-ready/loading envelope posture distinct from final source statuses.

Do not repurpose `configuration-required` as a generic loading state.

## Required tests

Add/update tests covering:

1. Home surface renders ready variant for `available`.
2. Home surface renders non-ready variant for `authorization-required`.
3. Focused Adobe surface renders ready variant for `available`.
4. Focused Adobe surface renders non-ready variant for `configuration-required`, `backend-unavailable`, and `principal-unresolved`.
5. `partial` behavior is explicitly tested.
6. Router actually passes readiness/data into child surfaces rather than letting defaults decide.

## Validation commands

```bash
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard test
```

## Non-scope

- Do not fully rework card content in this prompt; Prompt 04 owns data-driven card rendering.
- Do not alter backend provider resolver.
- Do not collapse typed statuses into one generic boolean without preserving the underlying reason.

## Completion standard

Prompt 03 is complete only when production surface readiness is driven by live envelope state and the old unconditional non-ready default no longer determines authenticated production rendering.

## Agent Efficiency Directive

**Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**
