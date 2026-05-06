---
package: PCC Host Shell Add-On Remediation Package
phase: Phase 3 / Wave 15A
scope: Host shell remediation beyond hero and tab rail
generated: 2026-05-06
status: Planning and local-code-agent handoff package
---

# 02 — SharePoint Host Fit and Canvas Rhythm Contract

## Purpose

Define how the PCC shell sits inside the SharePoint page and how the shell transitions into the active surface canvas.

## Host-Fit Requirements

The PCC shell must:

- respect SharePoint chrome;
- not create fake SharePoint header/navigation chrome;
- not rely on `min-height: 100vh`;
- not create double-scroll;
- not use fixed positioning for hero or tabs in this phase;
- not use sticky hero or sticky tab rail in this phase;
- avoid horizontal overflow at all PCC responsive modes;
- preserve SharePoint edit-mode usability;
- preserve published/view-mode usability.

## Host Boundary Structure

Target structure:

```tsx
<div data-pcc-shell data-pcc-shell-mode={mode}>
  <PccProjectHeroBand />
  <PccHorizontalTabs />
  <main
    id="pcc-active-surface-panel"
    role="tabpanel"
    aria-labelledby={`pcc-tab-${activeSurfaceId}`}
    data-pcc-canvas
    data-pcc-active-surface-panel={activeSurfaceId}
  >
    <PccBentoGrid>
      <PccSurfaceRouter />
    </PccBentoGrid>
  </main>
</div>
```

## Canvas Rhythm

### Required Visual Rhythm

The shell must establish four distinct zones:

1. SharePoint host chrome.
2. PCC shell hero.
3. PCC tab navigation.
4. Active surface canvas.

The canvas should not appear jammed directly against the tab rail.

### Canvas Spacing Rules

| Mode | Canvas Top Padding | Canvas Side Padding |
|---|---:|---:|
| phone | compact | compact |
| tabletPortrait | compact/standard | compact |
| tabletLandscape | standard | standard |
| smallLaptop | standard | standard |
| standardLaptop | standard/comfortable | standard |
| largeLaptop | comfortable | comfortable |
| desktop | comfortable | comfortable |
| ultrawide | comfortable, max content discipline | comfortable |

Use existing spacing tokens only.

## Shell Height Stability

The shell should not jump or materially change height when switching surfaces. The active surface content may change, but the shell frame should stay stable.

## Scroll Behavior

Resolved decision:

- On tab change, reset the active canvas to top.
- Do not move keyboard focus into the panel automatically.
- Focus remains on the activated tab after keyboard activation.
- The user can tab into the active panel.

## Short-Height Behavior

The shell must be validated at constrained browser heights where SharePoint edit tools, browser chrome, or docked UI consume vertical space.

Short-height rules:

- hero and tab rail remain normal-flow;
- no sticky/fixed behavior;
- shell content flows naturally;
- no primary control is obscured;
- active surface canvas begins with intentional content or intentional state.

## Acceptance Criteria

- No double-scroll in SharePoint edit or view mode.
- No horizontal overflow.
- No fixed or sticky shell behavior in this phase.
- Canvas boundary is visually distinct.
- Active surface starts with operational content or intentional state.
