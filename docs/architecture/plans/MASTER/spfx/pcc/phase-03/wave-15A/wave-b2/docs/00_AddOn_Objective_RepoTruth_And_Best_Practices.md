---
package: PCC Host Shell Add-On Remediation Package
phase: Phase 3 / Wave 15A
scope: Host shell remediation beyond hero and tab rail
generated: 2026-05-06
status: Planning and local-code-agent handoff package
---

# 00 — Add-On Objective, Repo Truth, and Best-Practice Basis

## Objective

Extend the Hero + Tab Rail flagship remediation package into a complete **host shell remediation phase**. The goal is to produce a PCC shell that behaves like a productized SharePoint-hosted operational frame, not just a visually improved header.

## Current Repo-Truth Findings

### Current Shell Composition

`PccShell.tsx` already follows the broad target order:

```tsx
<PccProjectHeroBand />
<PccHorizontalTabs />
<main data-pcc-canvas>
  <PccBentoGrid>{children}</PccBentoGrid>
</main>
```

This matches the earlier Wave 15A target direction, but the current implementation is still a thin scaffold rather than a premium shell operating system.

### Current Canvas Styling

`PccShell.module.css` provides only baseline shell/canvas treatment:

```css
.shell {
  background: var(--pcc-color-canvas);
  display: flex;
  flex-direction: column;
}

.canvas {
  flex: 1 1 auto;
  padding: var(--pcc-space-md) var(--pcc-space-lg);
  overflow-x: hidden;
}
```

This avoids obvious host collision, but it does not yet create a premium canvas boundary, first-view rhythm, shell-to-surface transition, or hosted short-height behavior.

### Current Context Duplication

`PccSurfaceContextHeader.tsx` repeats project label, surface label, surface description, posture, source status, source confidence, and last updated. This now conflicts with the target shell direction because the hero should establish primary context and the surface should move quickly into work content.

### Current Command Search

`PccCommandSearch.tsx` renders either:

- a disabled icon button; or
- a read-only search input.

This should become a non-interactive disabled preview affordance rather than an input-shaped control.

### Current Surface Labels

`PccHorizontalTabs.tsx` currently maps `external-systems` to `Apps`. The approved taxonomy is:

- tab: `External Platforms`
- page title: `External Platforms Launch Pad`

### Current Responsive Basis

`footprints.ts` already implements the PCC 8-mode contract. This package preserves that contract and adds shell-level behavior requirements per mode.

## Best-Practice Basis

### SharePoint / SPFx Host Fit

PCC is an SPFx app surface hosted inside SharePoint. The shell must respect the SharePoint page and web part host model and avoid creating fake SharePoint chrome, fixed viewport ownership, or double-scroll behavior.

### Accessibility

SharePoint provides keyboard support for the web part container, but custom UI inside the web part still requires explicit keyboard and screen-reader design. Tabs must be wired as a real `tablist` / `tab` / `tabpanel` interface, and the active panel relationship must be complete.

### Responsive Layout

Responsive behavior must be container-aware and SharePoint-safe. PCC already has an 8-mode resolver; the missing piece is a shell behavior contract at each mode.

## Add-On Remediation Principles

1. **Shell owns global context once.**
2. **Surfaces own work content.**
3. **Reference/preview posture is honest but subordinate.**
4. **No blank first-view states.**
5. **No misleading command affordances.**
6. **No fake SharePoint chrome or viewport ownership.**
7. **No icons in tabs in this phase.**
8. **No sticky hero/tab rail in this phase.**
9. **No final 56/56 claim without evidence.**

## Resolved Open Items

| Open Item | Resolved Decision |
|---|---|
| URL/hash routing | Keep internal state only in this phase |
| Scroll on tab change | Reset active canvas to top on surface change |
| Disabled command preview focus | Non-interactive and skipped in tab order; visible helper copy required |
| Surface context headers | Remove from normal happy-path first views; retain only compact local state where needed |
| Hero stickiness | Do not make hero sticky |
| Tab rail stickiness | Do not make tab rail sticky |
| Unavailable first-view minimum | Render an intentional state card above the fold |
| Tab visibility | Keep all MVP tabs visible in preview |
| External platform launches | Open in new tab; unmapped items render disabled/unavailable state |
