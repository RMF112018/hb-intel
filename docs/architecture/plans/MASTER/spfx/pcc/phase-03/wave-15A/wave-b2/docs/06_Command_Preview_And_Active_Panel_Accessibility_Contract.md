---
package: PCC Host Shell Add-On Remediation Package
phase: Phase 3 / Wave 15A
scope: Host shell remediation beyond hero and tab rail
generated: 2026-05-06
status: Planning and local-code-agent handoff package
---

# 06 — Command Preview and Active Panel Accessibility Contract

## Purpose

Resolve command preview behavior and complete the accessibility model beyond tab buttons.

## Disabled Command Preview

Resolved decision:

- Command search is disabled preview in this phase.
- It should not render as a text input.
- It should not accept typing.
- It should not imply results are available.
- It should not be a misleading primary interaction.

## Target Command Preview Treatment

Use a non-interactive status capsule or disabled preview affordance:

```text
Command Search — Preview
Search and project commands are unavailable in this preview.
```

### Behavior

| Mode | Treatment |
|---|---|
| desktop / ultrawide | visible non-interactive preview capsule with helper copy |
| laptop | compact capsule |
| tablet | compact label or collapsed utility row |
| phone | hide from primary first read or show as compact text below hero if space allows |

### Focus Behavior

Resolved decision:

- The preview affordance is not keyboard focusable if it performs no action.
- Helper copy must be visible or programmatically associated if the visual element is announced.
- Do not create a disabled button as the only explanation if screen-reader users cannot reach it.

## Active Panel A11y

The tab system must be wired to the active panel.

### Required Structure

```tsx
<div role="tablist" aria-label="PCC primary navigation">
  <button
    id={`pcc-tab-${surfaceId}`}
    role="tab"
    aria-selected={isActive}
    aria-controls="pcc-active-surface-panel"
  >
    {label}
  </button>
</div>

<main
  id="pcc-active-surface-panel"
  role="tabpanel"
  aria-labelledby={`pcc-tab-${activeSurfaceId}`}
  data-pcc-active-surface-panel={activeSurfaceId}
>
  ...
</main>
```

## Keyboard Behavior

Required:

- Tab enters the active tab.
- ArrowLeft / ArrowRight move between tabs.
- Home / End move to first/last tabs.
- Enter / Space activate tabs.
- Focus remains on activated tab.
- Next Tab moves toward active panel content.
- Visible focus ring is present.
- Reduced motion is respected.

## Acceptance Criteria

- `PccHorizontalTabs` receives a panel id from `PccShell`.
- Active panel has `role="tabpanel"`.
- Active panel has `aria-labelledby` pointing to active tab.
- Search preview is not an input.
- Tests cover panel relationship and disabled preview semantics.
