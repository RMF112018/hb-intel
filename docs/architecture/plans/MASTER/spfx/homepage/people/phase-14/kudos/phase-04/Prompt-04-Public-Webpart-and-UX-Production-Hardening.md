# Prompt 04 — Public Webpart and UX Production Hardening

You are working in the local live repo.

## Objective

Harden the public-facing `HB Kudos` experience and adjacent shared surfaces so the production implementation is safe, coherent, and aligned with the locked site model.

## Scope

This prompt covers:

- `HB Kudos` public webpart
- archive/browse behavior
- submission flow
- detail panel
- celebrate interaction
- any shared Kudos-specific helper/surface behavior directly required for production correctness
- adjacent UI/UX hardening required to remove obvious production risk

## Repo-truth questions to answer first

1. Does the public webpart already operate correctly when hosted on `HBCentral`?
2. Are submit / celebrate / detail / archive paths production-safe?
3. Are any governance-only details still exposed to ordinary viewers?
4. Are any current local inline patterns unacceptable for production quality or repeated enough to justify promotion?
5. Are loading/error/empty states strong enough for production?

## Required implementation target

Leave the public-facing HB Kudos surface in a production-safe state where:

- spotlight and archive behavior are correct
- visibility rules are enforced
- detail-panel role safety is enforced
- celebrate behavior is correct and does not rely on broken site resolution
- archive search/filter behavior is robust
- submission works under the canonical list host model
- no dev-only path bleeds into public behavior

## UI/UX production hardening requirements

Harden:
- loading states
- empty states
- error states
- detail-panel close / action behavior
- form cancellation / dirty-state behavior
- archive affordances
- public-facing copy where obviously stale or prompt-era

Keep the premium/shared-surface discipline intact:
- prefer existing `@hbc/ui-kit/homepage` exports where they are correct
- do not regress into weaker local UI
- only promote new shared patterns if there is a clear repeated durable need

## Accessibility / interaction checks

Confirm and tighten as needed:
- dialog/flyout focus handling
- keyboard operation
- button semantics
- tab/filter semantics
- aria labels for actionable elements
- reduced-motion-safe behavior if touched

## Deliverables for this prompt

- production-hardened public-facing Kudos implementation
- corrected public detail/celebrate/archive/submission behavior as needed
- concise note listing the public-side production fixes
