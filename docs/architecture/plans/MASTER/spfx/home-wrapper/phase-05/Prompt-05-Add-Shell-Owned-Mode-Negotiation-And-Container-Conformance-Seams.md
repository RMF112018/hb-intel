# Prompt 05 — Add Shell-Owned Mode Negotiation and Container Conformance Seams

## Objective

Turn the shell’s current comfort and render-mode calculations into a first-class shell-owned seam that future shell consumers can rely on for mode negotiation and conformance decisions.

## Why this issue exists in the current code

The shell already computes comfort and render-mode outcomes through the slot comfort resolver.
That is useful.
But today those outcomes are still exposed weakly, mostly through internal layout results and data attributes.

That leaves a gap between:
- shell-owned fit decisions
- future shell consumers that need to react to those decisions
- proof and diagnostics that should describe shell-fit outcomes clearly

## Current repo-truth evidence

- `slotComfortResolver.ts` already computes `BandLayoutResult`, `ResolvedSlot`, render modes, and comfort reasons.
- `HbHomepageShell.tsx` already adds data attributes describing some of those outcomes.
- The shell already uses container-aware entry-state resolution through `useShellContainer.ts`.
- What is missing is a stronger, shell-owned conformance seam that can be consumed, inspected, tested, and extended without scraping implementation detail.

## Required future state

The shell should expose a clearer shell-owned mode/conformance surface that makes the following explicit and reusable:

- what layout mode the shell chose
- why it stacked or paired a band
- whether a slot is comfortable, constrained, or force-stacked
- what shell-entry state governed that decision
- what future shell consumers are allowed to infer or act on

This should become a proper shell seam, not just incidental runtime detail.

## Files / seams / symbols to inspect

- `apps/hb-webparts/src/webparts/hbHomepage/shell/slotComfortResolver.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/useShellContainer.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/breakpointPolicy.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- any shell tests or harness files that should validate conformance output

## Implementation requirements

1. Define a shell-owned conformance or mode-negotiation seam based on the existing comfort resolver.
2. Make the seam reviewable and testable.
3. Preserve shell ownership of these decisions; do not push responsibility down into child modules.
4. Make the seam compatible with the shared entry-stack contract established in Prompt 04.
5. Improve diagnostics and proof value where needed so shell-fit outcomes are easy to inspect.
6. Use CSS container-query concepts where they materially strengthen style-level adaptation, but do not rebuild the shell around novelty.

## Validation / proof of closure

Return all of the following:

- the new or strengthened mode-negotiation / conformance seam
- examples of the shell-fit outcomes it can report
- tests or harness output proving stack/pair and constrained-mode behavior
- confirmation that the seam remained shell-owned rather than child-surface-owned

## Out-of-scope guardrails

- Do not redesign hosted modules to consume new modes unless a minimal shell integration seam absolutely requires it.
- Do not create an abstract framework with no runtime value.
- Do not leave mode negotiation hidden in CSS or internal objects only.
- Do not reopen module parity work.

## Active-context discipline

Do not re-read files that are already in active context or memory unless you need to confirm drift, dependencies, or uncertainty after making changes.

## No-deferral requirement

Do not leave this prompt in a “future wave,” “follow-up later,” or “optional if time permits” state.
If a shell-only issue must be solved now to close the shell correctly, solve it now and prove it now.
