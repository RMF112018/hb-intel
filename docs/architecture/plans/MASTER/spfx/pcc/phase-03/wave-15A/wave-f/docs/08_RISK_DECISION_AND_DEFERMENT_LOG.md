# 08 — Risk, Decision, and Deferment Log

## Objective

Track known risks, required decisions, and deferments for Wave D.

## Decisions Closed by This Package

| Decision | Ruling |
| --- | --- |
| Does Wave D implement backend/API work? | No. UI layout/card/surface composition only. |
| Should surfaces be remediated one-off? | No. Use shared primitives unless a documented exception is needed. |
| Is Prompt 04 closeout enough to close Wave D? | No. It is a strong primitive baseline but does not prove all current surfaces use a Tier 1/2/3 product hierarchy. |
| Can this wave claim 56/56? | No. Final validation remains later-wave scope. |
| Should Team & Access be validated specifically? | Yes. It carries known severe narrow-column collapse risk. |

## Open Local Decisions

| Decision | Owner | Required by | Notes |
| --- | --- | --- | --- |
| Whether to add `tier`/`region` props directly to `PccDashboardCard` or use a thin layout section primitive | Local code agent with repo-truth evidence | Prompt 02 | Preferred: extend existing primitive without breaking API. |
| Heading-level API shape | Local code agent | Prompt 02 | Must avoid invalid heading hierarchy. |
| Whether existing Prompt 04 primitive changes need additional hardening | Local code agent | Prompt 03 | If no changes required, document proof and add missing tests/evidence. |
| Exact screenshot harness route mechanism for non-home narrow captures | Local code agent/operator | Prompt 05 | Prompt 03/04 closeouts noted non-home narrow captures were limited by harness/nav state. |

## Risks

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Local dev screenshots pass but SharePoint chrome fails | High | Simulated constrained mode plus tenant-hosted evidence before final closeout. |
| Tier props create broad churn | Medium | Add compatibility layer; keep existing hierarchy/footprint props. |
| Direct-child bento invariant breaks if wrappers are introduced | High | Tests must assert direct-child behavior after surface changes. |
| All cards made wider/full to avoid narrow columns, causing dead canvas | High | Use tier/pattern contract, not brute-force spans. |
| Heading-level changes break snapshots/tests | Medium | Add explicit tests and migrate expectations deliberately. |
| Product copy/state remediation is accidentally regressed | Medium | Preserve Prompt 05 state/copy helper usage. |
| Lockfile drift | Medium | No installs; MD5 before/after. |

## Deferments

- Final tenant-hosted proof remains Wave H/final validation unless specifically executed during Wave D.
- Full accessibility certification remains later-wave/final validation, though heading and disabled-affordance regressions must be tested here.
- Surface-specific business-flow improvements beyond layout hierarchy remain later surface waves.
