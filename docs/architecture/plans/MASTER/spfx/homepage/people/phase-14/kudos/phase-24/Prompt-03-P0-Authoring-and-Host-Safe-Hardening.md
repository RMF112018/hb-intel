# Prompt 03 — P0 authoring-safe and SharePoint-host-safe hardening

## Objective

Harden the **HB Kudos Companion** so it behaves more reliably as a **SharePoint-hosted homepage-family webpart** under real page-canvas and authoring conditions.

This prompt is specifically about P0 **authoring safety** and **host-safe behavior**.

## Governing authority

Primary governing files:

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

Secondary supporting references:

- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/companion.module.css`
- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`
- `apps/hb-webparts/src/mount.tsx`
- `apps/dev-harness/src/tabs/KudosCompanionTab.tsx`

## Problem to correct

The Companion already respects the host better than many SPFx surfaces, but its hosted/runtime hardening is still not strong enough for a P0-complete production posture.

The doctrine requires the webpart to behave well when:

- placed on the SharePoint page canvas
- rendered under normal host chrome
- used in edit mode
- moved between sections
- viewed under constrained widths or mixed page conditions

The current implementation relies too much on incidental layout wrapping and happy-path behavior.

## Required implementation direction

### 1. Strengthen host-safe layout behavior
Review the Companion’s top-level workspace composition and control clusters for host-safe behavior.

Make the layout more resilient under typical SharePoint width and canvas constraints.

This includes, where appropriate:

- clearer breakpoint behavior
- better control wrapping rules
- safer spacing and alignment under tighter widths
- fewer brittle assumptions in queue/detail presentation

### 2. Improve authoring-safe rendering
The webpart must remain understandable and visually stable when authors or editors interact with the page.

Improve any behavior that currently feels too brittle, too implicit, or too dependent on an ideal final page condition.

### 3. Preserve host-respect posture
Do not add shell-like banners, nav bars, footer rails, or app-frame mimicry.

The Companion must remain a premium page-canvas workspace, not a fake standalone admin shell.

### 4. Keep the changes P0-scoped
This prompt is about hardening reliability and host-safe behavior.

Do not drift into a broad action-model redesign or non-P0 structural overhaul unless a narrow supporting change is required to eliminate a real P0 fragility.

## Files in scope

Primary targets:

- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/companion.module.css`
- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`
- `apps/dev-harness/src/tabs/KudosCompanionTab.tsx`

You may add a narrow local helper or small CSS/module seam if it materially improves host-safe reliability.

## Constraints

- Do not re-read files that are already in your current context or memory unless you need fresh verification or additional surrounding context.
- Do not introduce host-fighting DOM hacks.
- Do not add fake shell chrome.
- Do not broaden homepage imports to prohibited entry points.
- Do not weaken current runtime behavior in the happy path.

## Validation requirements

Validate at least the following:

1. normal SharePoint-hosted layout assumptions
2. tighter-width behavior for the workspace controls and queue
3. dev-harness rendering
4. edit/authoring-safe visual stability to the extent supported by the existing local workflows

## Deliverable

Implement the hardening and report:

- what host-safe and authoring-safe improvements were made
- what layout or control fragilities were corrected
- what validations were run
- any remaining host limitations that still exist and why
