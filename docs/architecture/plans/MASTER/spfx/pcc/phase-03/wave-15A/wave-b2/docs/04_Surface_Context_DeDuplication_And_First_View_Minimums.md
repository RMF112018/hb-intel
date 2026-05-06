---
package: PCC Host Shell Add-On Remediation Package
phase: Phase 3 / Wave 15A
scope: Host shell remediation beyond hero and tab rail
generated: 2026-05-06
status: Planning and local-code-agent handoff package
---

# 04 — Surface Context De-Duplication and First-View Minimums

## Purpose

Prevent downstream surfaces from reintroducing shell duplication and prevent blank/broken first views.

## Surface Context Header Plan

The existing surface context header pattern should be removed from happy-path first views or compressed into a local status treatment.

### Deprecation Rules

| Current Pattern | Target Pattern |
|---|---|
| Large repeated context header | Remove in happy path |
| Project label repeated in every surface | Shell owns project context |
| Surface title repeated under tabs | Shell owns active surface title |
| Source confidence repeated as dominant metadata | Collapse into local details only if needed |
| Last updated repeated above fold | Remove unless surface-specific and decision-critical |

## Minimum First-View Contract

Every surface must render one of the following above the fold:

1. Operational content.
2. Intentional unavailable state.
3. Intentional loading state.
4. Intentional permission-limited state.
5. Intentional degraded-source state.
6. Intentional empty state.

No surface may render a blank or mostly blank canvas above the fold.

## State Card Anatomy

For unavailable or empty surfaces, use:

```text
[State title]
[Plain-English reason]
[What is available / unavailable]
[Optional next action or "No action required in preview"]
```

## Surface-by-Surface Minimums

| Surface | Minimum First View |
|---|---|
| Project Home | priority summary or project intelligence summary |
| Team | team/access state summary or intentional preview unavailable state |
| Documents | lane summary or document access state |
| Project Readiness | readiness posture/blocker summary |
| Approvals | approvals/checkpoints state summary or unavailable state |
| External Platforms | mapped/unmapped platform summary |
| Settings | settings scope summary |
| Site Health | health/drift/repair summary |

## Acceptance Criteria

- Team & Access cannot appear blank above the fold.
- Every active surface has an intentional first-view state.
- Happy-path surfaces do not repeat the shell’s full context header.
- Source/reference metadata is subordinate.
- Tests or visual evidence cover at least one unavailable and one happy-path surface.
