# 03 — Shell Target Specification

## Target DOM Order

The final shell should use this high-level order:

```tsx
<div data-pcc-shell data-pcc-shell-mode={shellMode}>
  <PccProjectHeroBand ... />
  <PccHorizontalTabs ... />
  <main data-pcc-canvas>
    <PccBentoGrid forceMode={forceMode}>
      {children}
    </PccBentoGrid>
  </main>
</div>
```

## Shell Behavior

- Thin shell architecture.
- No vertical navigation rail.
- No fake SharePoint chrome.
- No `min-height: 100vh` dependency that causes double-scroll in SharePoint.
- The canvas remains the primary operational content area.
- Shell should fit its parent/container and avoid horizontal overflow.
- All eight PCC surfaces must continue to route through `PccSurfaceRouter`.

## Project Hero Band

Final component:

```text
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
```

### Required Content

1. Eyebrow: `Project Control Center`
2. Project name
3. Status pills next to or near project name
4. Metadata row:
   - Client
   - Location
   - Estimated Value
5. Active surface label and workflow
6. Command search, right aligned where space allows
7. Source-confidence label using product-safe copy

### Product-Safe Source Confidence

Use labels such as:

- `Reference data`
- `Live project data`

Avoid:

- `Preview mode`
- `Mock`
- `Fixture`
- `Wave`
- `Prompt`

## Horizontal Tabs

Final component:

```text
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
```

### Tab Order

1. Project Home
2. Team & Access
3. Documents
4. Project Readiness
5. Approvals
6. External Systems
7. Control Center Settings
8. Site Health

### Required Markers

```text
data-pcc-horizontal-tabs=""
data-pcc-tab-id="<surface-id>"
data-pcc-tab-active="true|false"
data-pcc-tab-mode="<mode>"
```

### Required A11y

- `role="tablist"`
- `role="tab"`
- `aria-selected`
- `aria-controls` if a controlled panel id is available
- keyboard support:
  - ArrowLeft / ArrowRight
  - Home / End
  - Enter / Space activation
- visible focus ring
- active state not color-only

## Bento and Surface Invariants

Preserve:

- `PccSurfaceRouter` as active surface owner.
- exactly one active surface panel marker.
- every `PccDashboardCard` remains a direct DOM child of `[data-pcc-bento-grid]`.
- no wrapper around Project Home cards.
- `PccBentoGrid` and `useBentoRowSpan` remain the layout engine.

## Host-Fit Requirements

- Replace viewport assumptions with parent/container-safe shell sizing.
- Ensure canvas and shell do not fight SharePoint page scroll.
- Avoid fixed header/nav heights that break constrained host sections.
- Use responsive density per PCC 8-mode policy.
