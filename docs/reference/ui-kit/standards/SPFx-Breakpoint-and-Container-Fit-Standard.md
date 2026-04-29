# SPFx Breakpoint and Container Fit Standard

> **Governance Status:** Supporting standard
> **Inherits from:**
>
> - `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
> - `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Full-Page-App-Widget-Overlay.md`
> - `docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md`
>   **Doctrine Precedence:** This document does not override Layer 1 runtime doctrine.

## Purpose

Require container-aware layout behavior for SPFx surfaces so hosted outcomes remain credible across desktop, tablet, and mobile contexts.

## Container-aware requirements

- Evaluate layout by available container width and height, not viewport assumptions alone.
- Define deterministic behavior for span collapse, zone stacking, overflow, and disclosure.
- Support bento/cockpit overviews with variable card sizes that adapt by container constraints.
- Support structured workbench flows with stable form/log/detail readability at constrained widths.

## Breakpoint depth requirements

Equivalent design depth is required across:

- desktop
- tablet
- mobile

Equivalent depth means each target class has intentional hierarchy, viable interactions, and complete state behavior, not a compressed desktop copy.

## Prohibited layout defaults

- fixed equal-height row defaults where resulting whitespace or compression harms scan quality;
- forced multi-column persistence when one-column fallback is the credible mode;
- mobile layouts that remove core decision context without compensating interaction strategy.

## Widget footprint application

Apply widget variants by container context:

- compact
- standard
- wide
- hero
- tall
- full
- rail
- detail

Each variant must declare minimum width, preferred span, and height behavior.

## Validation obligations

- capture breakpoint/container-fit evidence for desktop/tablet/mobile;
- verify no layout trap behavior in constrained height/width states;
- link evidence to acceptance scoring and hard-stop checklist.
