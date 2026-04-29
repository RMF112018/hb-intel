# SPFx Widget and Bento Layout Patterns

> **Governance Status:** Supporting pattern
> **Inherits from:**
>
> - `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
> - `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Full-Page-App-Widget-Overlay.md`
> - `docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md`
>   **Doctrine Precedence:** This document does not override Layer 1 runtime doctrine.

## Purpose

Define composition patterns for widgetized non-homepage SPFx surfaces that require cockpit-grade overview density without sacrificing workbench clarity.

## Pattern posture

- Use bento/cockpit patterns for overview and summary decision surfaces.
- Use structured workbench patterns for workflows, forms, logs, approvals, and detail review.
- Do not use generic enterprise-card-grid outcomes as the dominant posture.

## Widget footprint variants

Supported widget footprint variants:

- compact
- standard
- wide
- hero
- tall
- full
- rail
- detail

## Required widget contract fields

Every governed widget pattern must document:

- purpose
- minimum width
- preferred span
- height behavior
- compact behavior
- state obligations
- data seam/freshness obligations
- accessibility obligations

## Variant guidance

| Variant  | Typical role                        | Minimum width guidance      | Preferred span guidance | Height behavior                                  |
| -------- | ----------------------------------- | --------------------------- | ----------------------- | ------------------------------------------------ |
| compact  | lightweight KPI/status tile         | narrow container-safe floor | 1 unit                  | content-limited, no forced equal-row stretch     |
| standard | default operational card            | medium floor                | 1-2 units               | content-driven with predictable max              |
| wide     | comparative or multi-signal summary | medium-large floor          | 2+ units                | content-driven with stable overflow strategy     |
| hero     | dominant surface summary            | large floor                 | prominent primary span  | expandable with bounded collapse strategy        |
| tall     | timeline/log/status stack           | medium floor                | 1-2 units               | vertical growth allowed with controlled overflow |
| full     | primary panel/workbench block       | large floor                 | full row/zone span      | dynamic height by task context                   |
| rail     | side context/filters/alerts         | narrow floor                | rail column             | scroll-safe, hierarchy-preserving                |
| detail   | deep inspection content             | medium-large floor          | 2+ units or full zone   | adaptive to detail density                       |

## Container-aware composition rules

- Choose variant by container constraints, not by static viewport breakpoint alone.
- Permit one-column fallback when multi-column fit degrades readability or interaction quality.
- Prohibit fixed equal-height row defaults where whitespace or compression traps appear.

## Device-depth parity

Patterns must preserve equivalent design depth across desktop, tablet, and mobile:

- complete state and action model
- clear hierarchy
- no critical feature collapse into hidden/unreachable controls

## Acceptance linkage

Pattern adoption is acceptable only when scored against the acceptance model and free of hard-stop failures.
