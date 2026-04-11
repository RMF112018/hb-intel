# HB Kudos Public Surface — UI Remediation Prompt Package

## Purpose

This package breaks the HB Kudos **public-facing** UI remediation effort into a focused series of code-agent prompts rather than one broad prompt.

The intent is to improve the rendered SharePoint homepage experience for the employee-facing HB Kudos webpart while maintaining strict compliance with:

- live repo truth in `main`
- the current `@hbc/ui-kit`
- `docs/reference/ui-kit/` doctrine
- homepage/SPFx host-aware design expectations

This package is **UI-only**. It is not a workflow, data-model, permissions, or backend mutation package except where those layers must be lightly touched to support correct UI behavior.

## Package Contents

- `HB-Kudos-Public-UI-Plan-Summary.md`
- `HB-Kudos-Public-UI-Remediation-Matrix.md`
- `Prompt-01-HB-Kudos-Public-Composition-Architecture.md`
- `Prompt-02-HB-Kudos-Public-Featured-Surface-and-Archive.md`
- `Prompt-03-HB-Kudos-Public-Composer-Flow-and-Form-Experience.md`
- `Prompt-04-HB-Kudos-Public-Recipient-Selection-and-Entry-UX.md`
- `Prompt-05-HB-Kudos-Public-Responsive-Accessibility-and-Polish.md`
- `Prompt-06-HB-Kudos-Public-UI-Kit-Promotion-and-Cleanup.md`
- `Prompt-07-HB-Kudos-Public-Final-Integration-and-Compliance-Closure.md`

## Working Method

Use the prompts in order.

- `01` sets the surface architecture and top-level composition target
- `02` resolves featured recognition and archive browse quality
- `03` rebuilds the composer experience
- `04` resolves recipient-selection UX
- `05` tightens responsive behavior, accessibility, and polish
- `06` performs the shared-surface / ui-kit promotion and cleanup pass
- `07` performs final integration, closure, and doctrine validation

## Important Framing

These prompts are intentionally **explicit about intent and target product quality** but **looser about implementation path**.

The agent is expected to:

- use repo truth, not assumptions
- preserve what is already strong
- restructure what is weak
- promote or create shared ui-kit/homepage-safe primitives where warranted
- avoid overfitting to one speculative layout too early

These prompts do **not** prescribe one exact visual solution. They define the bar that must be reached.

## Governing Expectations

The agent must treat the following as binding:

- homepage webparts must use `@hbc/ui-kit/homepage` as the primary entry point
- changes must remain host-aware for SharePoint/SPFx
- homepage presentation surfaces must not settle for timid card-grid outcomes
- local hardcoded premium styling should be reduced; shared surface promotion should occur where patterns are durable
- any new or upgraded shared surface must be placed in the correct layer/package, not left as accidental local duplication

## Prompt Execution Rules

Every prompt instructs the agent to follow these rules:

1. Do **not** begin by re-reading files that are already in the agent's active context or memory.
2. Use already-loaded context first; only read more files when needed to close uncertainty.
3. Treat the live repo as authoritative.
4. Keep changes scoped to the public HB Kudos UI unless a shared ui-kit refactor is the correct path.
5. Prefer strong structural improvement over cosmetic tinkering.
6. Do not claim completion without validating the rendered outcome against doctrine and the remediation matrix.

## Recommended Review Pattern

After each prompt:

- require the agent to list what changed
- require the agent to state which remediation-matrix rows were advanced or closed
- review screenshots before moving to the next prompt when possible

After Prompt 07:

- require a final closure report against the full matrix
- require explicit callouts for anything still partial, deferred, or uncertain

## Success Standard

The public HB Kudos webpart should end this prompt series reading as:

- a premium presentation-lane recognition surface
- a cohesive authored homepage feature rather than a stack of small cards
- a cleaner, more confident SharePoint-hosted surface
- a warmer and more elegant recognition experience
- a more guided, compact, and trustworthy composer flow

