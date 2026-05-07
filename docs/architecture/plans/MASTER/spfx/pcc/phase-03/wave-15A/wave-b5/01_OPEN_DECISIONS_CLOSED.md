# Open Decisions Closed

## OD-01 — Detail selection UI pattern

**Decision:** Use local segmented/module-index view controls.

Do not use nested card accordions. Do not use route changes. Do not use anchors. Use local `button type="button"` controls with explicit markers:

```tsx
data-pcc-readiness-drilldown-control="<section-id>"
data-pcc-readiness-drilldown-state={selected ? "selected" : "available"}
```

Use `aria-pressed` or tab semantics. Prefer `aria-pressed` if implementation speed and test stability matter more than full tablist semantics.

## OD-02 — Whether selected detail replaces or appends below command cards

**Decision:** Selected detail replaces the full command card set, while preserving:

- the Project Readiness active-surface hero/context card, and
- the module index/selector card.

Selected section mode must render:

```text
Hero / context
Module index / selector
Selected detail module only
```

It must not render all command cards plus selected detail.

## OD-03 — Whether embedded modules should be internally compressed now

**Decision:** No.

This package only removes embedded module cards from the default view and makes them intentional detail views. Internal compression of Permit/Inspection, Responsibility Matrix, Constraints, or Buyout can be a later remediation if selected detail views remain too dense.

## OD-04 — How to handle enabled controls

**Decision:** Enabled local view-selection controls are allowed, but all workflow-like controls remain disabled or absent.

Allowed enabled controls must:

- use `type="button"`;
- be marked with `data-pcc-readiness-drilldown-control`;
- only update local selected-section state;
- not call APIs;
- not write, sync, submit, approve, upload, execute, launch, or mutate anything;
- use copy like `View details`, `View command overview`, or `Open read-only detail`.

Forbidden enabled labels include:

```text
submit
approve
upload
run
execute
sync
write back
writeback
complete checklist
launch
create
modify
delete
save
```

## OD-05 — Read-model hook behavior

**Decision:** Hooks stay unconditional.

`ReadModelContent` may resolve all current view-models every render. Rendering selected detail sections must branch only after hooks have already run.

## OD-06 — Unified Lifecycle

**Decision:** Split hook/state resolution from card rendering.

The existing `PccProjectReadinessUnifiedLifecycleSection` can either be retained as a detail-only component or decomposed into:

```text
useProjectReadinessUnifiedLifecycleState(...)
PccProjectReadinessUnifiedLifecycleCards(...)
```

The default command overview must not render its three cards.

## OD-07 — Shared primitive changes

**Decision:** No shared primitive changes in this remediation.

Do not edit:

```text
apps/project-control-center/src/layout/PccBentoGrid.tsx
apps/project-control-center/src/layout/PccDashboardCard.tsx
apps/project-control-center/src/layout/footprints.ts
```

unless a test failure proves the command/detail remediation cannot be completed otherwise. If such a failure occurs, stop and report the specific evidence before editing primitives.

## OD-08 — Package metadata

**Decision:** No package metadata changes.

Do not edit:

```text
package.json
pnpm-lock.yaml
config/package-solution.json
*.manifest.json
```

## OD-09 — Evidence and scorecard posture

**Decision:** Produce evidence closeout only.

Do not claim:

- final 100-point scorecard pass;
- final 56/56 pass;
- Phase 4 readiness;
- hard-stop closure.

Those remain expert-reviewed.
