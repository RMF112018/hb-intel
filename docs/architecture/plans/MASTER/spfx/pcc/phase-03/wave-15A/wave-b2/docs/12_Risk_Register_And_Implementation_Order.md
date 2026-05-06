---
package: PCC Host Shell Add-On Remediation Package
phase: Phase 3 / Wave 15A
scope: Host shell remediation beyond hero and tab rail
generated: 2026-05-06
status: Planning and local-code-agent handoff package
---

# 12 — Risk Register and Implementation Order

## Recommended Add-On Implementation Order

1. Scope lock and repo-truth confirmation.
2. Project identity source alignment.
3. Shell ownership and canvas boundary.
4. Surface context de-duplication.
5. Disabled command preview.
6. Active panel accessibility.
7. External Platforms naming/launch posture.
8. Shell state model and unavailable first-view states.
9. Responsive/host-fit evidence.
10. Documentation and closeout.

## Risk Register

| Risk | Severity | Mitigation |
|---|---|---|
| Developer redoes broad repo audit and wastes context | Medium | Prompts explicitly forbid re-reading unchanged context |
| Hero package and add-on package conflict | High | Locked hero/tab package wins on visual/title/nav decisions |
| Search remains input-shaped | High | Replace with non-interactive preview capsule |
| Surface context duplication persists | Medium-High | Remove happy-path context headers |
| Team & Access remains blank above fold | High | Require intentional state card or content summary |
| External Platforms label drifts | Medium | Centralize label map and tests |
| Accessibility remains partial | High | Wire tabpanel and focus behavior |
| Responsive proof remains incomplete | Medium-High | Require evidence matrix |
| Source/reference copy dominates UI | Medium | Compress to subordinate status/details |
| Scope creep into all surfaces | High | Only touch surface first-view/state where shell contract requires it |
| Live integration accidentally introduced | High | Guardrails prohibit backend/API/Graph/PnP/Procore runtime changes |
| Sticky shell breaks SharePoint | Medium | Explicitly prohibit sticky/fixed in this phase |

## Files Likely to Change

Likely:

```text
apps/project-control-center/src/PccApp.tsx
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccShell.module.css
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.module.css
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.module.css
apps/project-control-center/src/shell/PccCommandSearch.tsx
apps/project-control-center/src/shell/PccCommandSearch.module.css
apps/project-control-center/src/surfaces/shared/PccSurfaceContextHeader.tsx
apps/project-control-center/src/surfaces/shared/PccSurfaceContextHeader.module.css
packages/models/src/pcc/PccMvpSurfaces.ts
apps/project-control-center/src/tests/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/
```

Conditional:

```text
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
apps/project-control-center/src/state/usePccShellState.ts
apps/project-control-center/src/preview/projectPlaceholder.ts
```

Likely Not:

```text
backend/
packages/models unrelated PCC contracts
pnpm-lock.yaml
SPFx package/manifest files unless explicitly approved
live integration clients
```
