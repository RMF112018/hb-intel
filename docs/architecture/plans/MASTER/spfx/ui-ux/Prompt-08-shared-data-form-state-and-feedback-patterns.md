# Prompt 08 — Shared Data Form State And Feedback Patterns

## Objective

Harden the shared data-heavy interaction family for SPFx apps, including tables, form containers, status semantics, empty states, loading/retry states, and permission-transparent feedback.

## Mandatory operating instruction

Do **not** re-read files that are still within your active context or memory. Reuse already loaded repo context whenever possible and only open additional files when they are necessary to close uncertainty.

## Required repo-truth inputs

- `packages/ui-kit/`
- `packages/shell/`
- `apps/accounting/`
- `apps/estimating/`
- `apps/admin/`
- `docs/reference/ui-kit/`

## Instructions

1. Audit the current implementations of:
   - tables / list surfaces
   - field containers / forms
   - banners / alerts
   - status badges / semantic states
   - modals / drawers / side panels
   - empty states
   - loading, retry, and degraded-state patterns
   - permission-denied / limited-access messaging
2. Standardize shared patterns in the approved shared owner.
3. Ensure the suite shows users what is happening, what they can do next, and what is unavailable because of permissions, host constraints, or partial failures.
4. Where offline-safe or queued-work semantics are relevant to the current SPFx experience, make them visible and honest rather than hidden.
5. Keep content-specific fields app-local; move only governed reusable interaction primitives and containers.

## Deliverables

- hardened shared interaction primitives
- app adoption of the canonical patterns
- updated docs for state semantics, permissions messaging, and feedback patterns
- tests or example coverage for critical state variants

## Acceptance criteria

- tables/forms/states feel like they belong to one suite
- feedback is informative, non-cryptic, and permission-transparent
- degraded and retry behavior is explicitly designed
- empty states are task-forward rather than generic placeholders
- the implementation does not hard-code app-specific business logic into the shared layer

## Guardrails

- Treat `docs/architecture/blueprint/current-state-map.md` as the governing reference for present-state disagreements.
- Do not create a parallel design system outside `@hbc/ui-kit`.
- Do not flatten valid domain-specific workflow behavior just to make screenshots look more similar.
- Be explicit when something is a confirmed repo fact versus an inference.
- Prefer updating authoritative docs and existing package surfaces over introducing duplicate layers.
- Treat SPFx host limitations honestly rather than forcing false parity with non-SPFx surfaces.

## Completion note

When you finish, summarize:
- what you verified from repo truth
- what you changed
- what you intentionally left unchanged
- any residual risk or follow-up prompt dependencies
