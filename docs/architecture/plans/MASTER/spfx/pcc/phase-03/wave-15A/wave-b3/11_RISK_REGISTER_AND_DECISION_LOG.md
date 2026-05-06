# 11 — Risk Register and Decision Log

## Closed Decision Log

| ID | Decision | Status |
| --- | --- | --- |
| D-01 | Add `tier` to `PccDashboardCard`. | Closed — yes. |
| D-02 | Add `region` to `PccDashboardCard`. | Closed — yes. |
| D-03 | Keep `hierarchy`. | Closed — yes, backward compatibility. |
| D-04 | Explicit `tier` wins over `hierarchy`. | Closed — yes. |
| D-05 | Add headingLevel. | Closed — yes. |
| D-06 | Use `aria-labelledby` for titled cards. | Closed — yes. |
| D-07 | Add `rail` and `detail`. | Closed — yes. |
| D-08 | Remove dashed styling from `full`. | Closed — yes. |
| D-09 | Every route has exactly one ready-state Tier 1 command card. | Closed — yes. |
| D-10 | State route cards may temporarily own active panel. | Closed — yes, only loading/error/unavailable route replacement. |
| D-11 | No backend/model business contract changes. | Closed — yes. |
| D-12 | No lockfile changes. | Closed — yes. |

## Risk Register

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Tier and hierarchy conflict visually | High | Explicit `tier` wins; legacy marker preserved only as compatibility. |
| Full-width operational cards still look unavailable | High | Remove footprint-based dashed border; use state/deferred region styling. |
| Project Readiness edit scope is too broad | High | Use matrix and targeted edits; migrate card declarations only. |
| Read-model loading/error branches lose active panel | Medium | Route state cards may keep active panel when ready command card absent. |
| Cards lose accessible labels | High | Add primitive-level heading IDs and tests. |
| `rail` footprint creates cramped tablet layouts | Medium | Map rail to 1 column on tablet portrait/phone; validate. |
| Snapshot/evidence unavailable locally | Medium | Create evidence plan and record as hosted gate if tenant validation is not available. |
| Agent over-edits surface internals | High | Prompts prohibit business logic, backend, and live integration changes. |
| Existing tests depend on old hierarchy-only markers | Medium | Preserve old markers and add new markers. |
| Lockfile churn | High | Hard stop if `pnpm-lock.yaml` changes. |

## Residual Risk After Implementation

The only acceptable residual risk is hosted visual validation if the local agent cannot access the SharePoint tenant. In that case, closeout must mark hosted screenshots as a separate manual gate, not claim final 56/56.
