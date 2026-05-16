# 05 — Risk Register and Rollback Guide

## Objective

Capture the implementation risks for the remediation package and provide simple rollback guidance if a patch regresses behavior.

---

# Risk Register

| Risk | Description | Mitigation |
|---|---|---|
| Increased visible loading chrome | Rendering both cards immediately may show more loading posture at once | This is intentional; preserve compact loading states and layout discipline |
| My Projects request starts earlier | Backend receives `/project-links` sooner than before | Expected; should not change request count per page load |
| Test contract churn | Existing tests intentionally lock the current loading composition | Update tests explicitly and add coverage for the improved contract |
| Prop cleanup breaks call sites | Removing `getApiToken` from inner surfaces requires coordinated refactor | Use TypeScript failures as a guide; do not leave dead props |
| Client seam refactor changes test strategy | Factory mocks become invalid | Replace with provider-wrapped stubs |
| Performance marks create browser compatibility issues | `performance` may not exist in test/server contexts | Implement safe no-op wrappers |
| Telemetry additions accidentally expose sensitive data | New duration telemetry could be added carelessly | Use closed safe field lists only |
| Telemetry increases event volume | More backend custom events emitted | This is limited and stage-specific; avoid per-row events |
| Premature architecture expansion | Agent may attempt cache/server redesign during this package | Prompts prohibit this until evidence review |

---

# Rollback Strategy

## Frontend Wave 1 rollback
If rendering both cards in loading/error causes an unforeseen layout or state regression:

- revert only the `MyWorkHomeSurface` loading/error branch change,
- revert related tests,
- preserve any independent telemetry improvements if unaffected.

## Frontend Wave 2 rollback
If provider-based My Projects client ownership unexpectedly breaks runtime wiring:

- revert the client-seam refactor,
- keep Wave 1 loading composition fix if it remains correct,
- document the exact dependency that required local factory behavior.

## Frontend telemetry rollback
If User Timing helper causes no-op issues in unusual environments:
- keep the feature behind defensive guards,
- remove only problematic calls,
- do not revert UX remediation.

## Backend telemetry rollback
If telemetry event shape unexpectedly conflicts with existing queries:
- revert event payload additions,
- preserve code-path behavior,
- follow up with a schema-compatible telemetry patch.

---

# Non-Rollback Guidance

Do not revert the UX improvement merely because:
- backend still takes several seconds,
- Adobe or project source dependencies remain slow,
- the browser now visibly shows both modules resolving.

The whole purpose of the first remediation is to make the dashboard feel structurally responsive even before deeper backend optimization.

---

# Safe Commit Segmentation

Recommended segmented commits:

1. Surface loading choreography
2. My Projects shared-client refactor
3. Frontend timing marks
4. Backend stage durations
5. Documentation/evidence closeout

This makes rollback cheap and precise.
