# Prompt 01 — P2 Responsive hosted-condition hardening

## Objective

Add **explicit responsive behavior** and **hosted-condition hardening** to the HB Kudos Companion so the workspace behaves predictably across real SharePoint page-canvas constraints instead of relying too heavily on incidental wrapping.

## Governing authority

Treat the following as binding:

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

Key doctrine implications for this prompt:

- SharePoint-host-safe responsive behavior is mandatory
- the webpart must respect host reality rather than pretending it owns the shell
- the result must remain premium and non-generic, not collapse into a weak card grid

## Files in scope

Primary targets:

- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/companion.module.css`
- `apps/hb-webparts/src/homepage/shared/governance.module.css`

Adjacency if needed:

- `apps/dev-harness/src/tabs/KudosCompanionTab.tsx`

## Problem to solve

The Companion currently relies too much on natural wrapping and inline layout behavior for:

- filter/search controls
- queue row layouts
- bulk action bars
- detail-panel action group presentation

That is not strong enough proof of hosted-condition resilience for production SharePoint use.

## Required implementation direction

### 1. Add explicit breakpoint behavior
Introduce explicit breakpoint-driven behavior for the key Companion workspace zones rather than leaving them to incidental wrapping.

### 2. Harden narrow and constrained states
Handle realistic constrained-width cases, including page-canvas compression caused by SharePoint chrome and surrounding layout conditions.

### 3. Preserve hierarchy while adapting
Do not “solve” responsiveness by flattening hierarchy or making everything visually timid.

### 4. Keep host-safe coexistence
Do not create host-fighting sticky behavior, shell mimicry, or brittle hacks.

## Constraints

- Do not redesign the public `HbKudos` runtime.
- Do not replace sound structural work from P1.
- Do not use JavaScript layout hacks unless a narrow, clearly justified assist is required.

## Guardrails

- Do not re-read files that are already in your current context or memory unless you need fresh verification or additional surrounding context.
- Prefer explicit CSS-module breakpoint logic over accidental layout behavior.
- Keep the result page-canvas-safe, premium, and maintainable.

## Deliverable

Implement the responsive hardening and report:

- what breakpoints or responsive rules were added
- what hosted-condition cases are now handled explicitly
- how the result remains premium and host-safe
