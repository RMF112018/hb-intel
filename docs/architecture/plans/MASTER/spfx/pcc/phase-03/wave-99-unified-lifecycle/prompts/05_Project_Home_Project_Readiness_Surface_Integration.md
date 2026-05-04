# 05 — Project Home and Project Readiness Surface Integration

## Objective

Implement or verify non-routed unified lifecycle integration into Project Home and Project Readiness. The unified lifecycle layer must appear as cards/sections inside approved surfaces, never as a standalone route or workspace.

## Required Instruction

```text
Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
```

## Working Directory

```text
/Users/bobbyfetting/hb-intel
```

## Likely Files To Inspect/Edit

```text
apps/project-control-center/src/surfaces/projectHome/
apps/project-control-center/src/surfaces/projectReadiness/
apps/project-control-center/src/surfaces/unifiedLifecycle/
apps/project-control-center/src/tests/
apps/project-control-center/src/surfaces/PccSurfaceRouter.tsx
```

## Required UX / Integration Deliverables

Verify or implement:

### Project Home

- Lifecycle Timeline card/section.
- Project Memory card/section.
- Project Lens card/section.
- Related Records card/section.
- Ask-HBI project-scoped preview card if Prompt 06 has/needs hook support.
- Fixture-only fallback remains unchanged unless intentionally updated with tests.
- Bento direct-child/card layout preserved.

### Project Readiness

- Lifecycle context cards that do not gate existing Project Readiness regions.
- Project Memory / Related Records context where relevant.
- Constraints Log / readiness inputs are preserved.
- No duplicate Project Readiness functionality.
- Non-gating loading/error/degraded behavior.

### Routing Guardrail

- No new `data-pcc-surface-id` or router case for unified lifecycle, Ask-HBI, search, lifecycle timeline, project memory, traceability graph, warranty trace, or closed-project references.

## Prohibited Scope

- No shell route creation.
- No live external calls.
- No Project Control Center mount/tenant/deployment changes unless unavoidable and separately authorized.
- No package/lockfile/manifest changes.

## Required Tests

- Card-count/card-title assertions by render path.
- Bento direct-child invariant.
- No nested cards.
- No live external URLs.
- No forbidden route IDs.
- Withheld/redacted records do not render raw content.
- Hook call-count/non-call locks where appropriate.
- Project Readiness existing modules remain non-gated.

## Validation

Likely:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
```

Always run git/lockfile/diff gates.

## Commit Summary

If committing:

```text
feat(spfx-pcc): integrate unified lifecycle into project surfaces
```

## Final Output Requirements

Report Project Home/Readiness behavior, route guard proof, tests, files changed, and lockfile MD5.
