# Prompt 03 — PriorityActionsRail Container-Aware Alignment

## Objective

Finish the remaining alignment work so `PriorityActionsRail` behaves according to **real shell / container conditions**, not just coarse viewport-width buckets.

This is a refinement and hardening prompt, not a greenfield invention prompt.

## Why this prompt exists now

The attached Wave 01 package correctly flagged a mismatch, but repo truth changes the framing:

- the rail already has a governance bridge to shell entry-state vocabulary
- the live runtime still appears to classify conditions through `window.innerWidth` buckets

The open work is to finish the alignment in a way that preserves current authoring/data contracts.

## Repo-truth findings to respect

- `entryStackOrchestration` already contains rail ↔ shell vocabulary alignment helpers.
- `PriorityActionsRail.tsx` still resolves runtime `DeviceClass` from `window.innerWidth`.
- the list-backed config and item contracts already encode authored device-visibility and per-device caps.
- shell entry-state policy is already a first-class authority.

## Governing authorities

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/shell/HB-Shell-Entry-Breakpoint-Spec.md`
- current rail config/item contracts under `apps/hb-webparts/src/homepage/data/`
- shell breakpoint and entry-stack policy seams

## External best-practice guidance to apply

- Prefer container-aware adaptation over viewport-only assumptions where component fit depends on actual available space.
- Avoid maintaining a second, independent breakpoint authority.
- Preserve stable authoring semantics while improving runtime correctness.

## Exact files / seams to inspect first

- `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRail.tsx`
- `apps/hb-webparts/src/homepage/entryStack/entryStackOrchestration.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/breakpointPolicy.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/entryStackPolicy.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsNormalization.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsContracts.ts`
- any tests touching entry-stack policy, conformance, or rail behavior

Do **not** re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Current problem state

The live rail still appears to use coarse viewport-width classification:

- desktop
- laptop
- tabletLandscape
- tabletPortrait
- phone

That is not fully trustworthy for a SharePoint-hosted flagship page where actual shell fit depends on usable container conditions and short-height posture, not just overall viewport width.

## Required future state

- The rail is aligned to shell/container reality.
- The runtime no longer depends on a coarse independent viewport-only model as its governing truth.
- Existing authoring contracts stay stable where possible.
- Overflow behavior and visible-action budgets remain governed and inspectable.
- The solution is understandable enough that future harnesses and control surfaces can inspect the active rail condition without ambiguity.

## Implementation requirements

1. **Audit the current runtime/device path precisely.**
   - Identify every place the rail chooses a device or layout condition.
   - Separate author-facing contract vocabulary from runtime condition authority.

2. **Choose one primary runtime authority.**
   - Prefer shell-entry-state-aligned or container-aware resolution.
   - Do not create a parallel breakpoint universe.

3. **Preserve authored semantics wherever practical.**
   - existing list fields for visibility and max-visible budgets should not be broken without strong necessity
   - if translation or mapping remains necessary, centralize it

4. **Respect short-height behavior.**
   - do not regress phone-landscape / compact action posture

5. **Keep the result inspectable and testable.**
   - downstream acceptance/harness work must be able to prove the active rail condition

## Definition of done

This prompt is done only when:

- the rail no longer relies on coarse viewport-only bucketing as its governing truth
- runtime action behavior is aligned to shell/container reality
- authoring/data contracts remain coherent
- overflow and visible-action behavior are preserved or improved
- the resulting condition model is testable and inspectable

## Proof of closure required in the final response

Provide all of the following:

- exact files changed
- the old runtime condition model
- the new runtime condition model
- any mapping table or translation layer retained
- proof for standard laptop, tablet portrait, phone portrait, and short-height behavior
- any updated or added tests

## Constraints

- Do not invent a second independent breakpoint system.
- Do not casually break authored list contracts.
- Do not hide runtime ambiguity behind vague helper names.
- Do not solve this only in CSS if the behavioral/runtime authority still remains wrong.
