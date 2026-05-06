# 08 — Risk, Decision, and Deferment Log

## Decisions

| ID | Decision | Status | Rationale |
|---|---|---|---|
| D-WE-001 | Use current repo truth as authority; do not duplicate Prompt 05 implementation if already present. | Accepted | Prompt 05 closeout indicates state/product-language remediation already landed. |
| D-WE-002 | Keep UI copy in PCC app/surface-local modules, not `@hbc/models`. | Accepted | UI copy is presentation-specific; model package should not carry product language. |
| D-WE-003 | `PccDisabledAffordance` is the preferred inert-control primitive. | Accepted | It requires visible reason and accessible relation. |
| D-WE-004 | Do not rename internal state keys unless leakage or taxonomy conflict is confirmed. | Accepted with watch item | Renames can break tests/selectors; aliasing may be safer. |
| D-WE-005 | Tenant-hosted validation is deferred outside Wave E unless explicitly performed. | Accepted | Prompt 05/06 closeouts show tenant evidence remains operator-pending. |

## Risks

| ID | Risk | Exposure | Mitigation |
|---|---|---|---|
| R-WE-001 | Local branch may lag audited main branch. | Agent could re-audit older state model and duplicate prior work. | Prompt 01 requires mode decision and file map before changes. |
| R-WE-002 | Internal key `unavailable-fixture` can appear in DOM markers. | Screenshot/evidence reviewers may see developer vocabulary in DOM or tests, not visible UI. | Decide whether to alias to `unavailable` or document as non-user-visible. |
| R-WE-003 | "Reference view" may not be the final preferred business phrase. | Product-owner may prefer "Sample data mode" or "Read-only project summary." | Keep copy centralized for low-touch edits; log product copy review. |
| R-WE-004 | Exact-string tests can make future copy iteration expensive. | Product language changes may require broad test churn. | Use exact-string tests for stable global specs; use semantic tests for surface copy. |
| R-WE-005 | Disabled action reasons may crowd compact cards. | Constrained widths may degrade scan path. | Screenshot matrix and compact-state CSS checks. |
| R-WE-006 | State model can become visually dominant. | Command-center hierarchy can regress. | Surface screenshot review and card hierarchy checks. |
| R-WE-007 | Generic unavailable fallback may remain reachable. | User sees low-confidence product experience. | Verify router fallback reachability and upgrade copy if needed. |

## Deferments

| ID | Deferment | Allowed? | Notes |
|---|---|---:|---|
| DEF-WE-001 | Tenant-hosted screenshots | Yes | Must be explicitly operator-pending or deferred to final validation wave. |
| DEF-WE-002 | Live Graph/PnP/Procore state verification | Yes | Wave E should not introduce live integration scope. |
| DEF-WE-003 | Final 56/56 claim | Yes, deferred | Not permitted in Wave E closeout without all later-wave evidence. |
| DEF-WE-004 | Product-owner copy refinement | Yes | Allowed if current copy removes developer vocabulary and is centralized. |
| DEF-WE-005 | Internal comments/JSDoc developer terms | Yes | Allowed unless surfaced in UI, screenshots, or aria text. |

## Open Follow-Up Checks

- Confirm local branch includes Prompt 05 changes.
- Confirm no user-visible forbidden tokens remain after current worktree changes.
- Confirm every current routed surface has at least loading, empty, error, unavailable/setup, and permission/read-only handling where relevant.
- Confirm screenshot evidence index is populated before final Wave 15A closeout.
- Confirm scorecard category movement without overclaiming final readiness.
