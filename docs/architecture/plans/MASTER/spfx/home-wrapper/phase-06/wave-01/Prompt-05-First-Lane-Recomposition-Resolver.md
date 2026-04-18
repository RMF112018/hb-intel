# Prompt 05 — First-Lane Recomposition Resolver

## Objective

Use the content-state contract from Prompt 04 to make the first shell lane prefer the **strongest legal non-empty candidate or compatible pair**, instead of blindly honoring preset order when early candidates are empty, invalid, or low-signal.

This prompt implements the resolver behavior. It does not redesign child modules.

## Why this prompt exists now

The shell already has strong layout/fit governance, but current repo truth suggests it still lacks value-aware early-lane selection.

Without this resolver, the homepage can remain technically “valid” while still feeling empty before it feels useful.

## Repo-truth findings to respect

- the default preset currently hard-anchors `project-portfolio-spotlight` + `company-pulse` in the first band
- shell pairing and comfort logic already exists and must remain authoritative for fit
- prohibited pairings, prominence ceilings, and first-lane single-column protections already exist
- this prompt must consume the new content-state contract rather than inventing a parallel heuristic system

## Governing authorities

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/shell/HB-Shell-Entry-Breakpoint-Spec.md`
- shell registry / pairing / comfort rules already in code
- the new content-state contract introduced in Prompt 04

## External best-practice guidance to apply

- Early flagship real estate should favor high-value top tasks/content over technically renderable but weak states.
- Selection logic must stay explainable.
- Reflow safety and breakpoint protections still come first.

## Exact files / seams to inspect first

- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/defaultPreset.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/occupantRegistry.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/slotComfortResolver.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellTypes.ts`
- the new Prompt-04 contract/reporting seams
- any shell diagnostics or conformance surfaces that should explain the decision

Do **not** re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Current problem state

The shell currently appears to prioritize:
- preset order
- static eligibility
- comfort and pairing rules

It does not yet appear to prioritize:
- actual current value / non-empty strength

That is why empty or weak candidates can occupy premium early positions.

## Required future state

- The first lane prefers the strongest legal candidate or compatible pair available at render time.
- Empty / invalid / low-signal candidates can be demoted from premium early positions.
- Protected layout rules remain intact.
- The decision remains explainable through diagnostics or inspectable attributes.
- The result still feels shell-governed, not ad hoc.

## Implementation requirements

1. **Consume the Prompt-04 content-state contract.**
   - do not invent a second content-state mechanism

2. **Respect existing shell protections.**
   - no prohibited pairings
   - no broken prominence ceilings
   - no portrait or phone multi-column regression
   - no illegal first-lane occupants

3. **Keep preset logic understandable.**
   - presets should remain the authored baseline
   - the resolver should apply bounded promotion/demotion, not turn the shell into a free-for-all sorter

4. **Make the promotion logic inspectable.**
   - explain why a candidate was promoted, retained, or demoted
   - surface the decision through diagnostics, structured state, or inspectable attributes

5. **Prefer stable legal quality over unstable cleverness.**
   - if only one strong candidate is available, a disciplined single-item first lane is acceptable
   - do not force a pair just to preserve symmetry

## Definition of done

This prompt is done only when:

- the first lane no longer blindly honors preset order when that would surface empty / invalid / low-signal content first
- the shell promotes the strongest legal candidate or compatible pair
- existing comfort/pairing/protection logic remains intact
- the decision is explainable and inspectable
- the flagship page no longer exhibits obvious empty-state-first early composition when a stronger legal option exists

## Proof of closure required in the final response

Provide all of the following:

- exact selection logic added or changed
- exact files changed
- before / after description of first-lane candidate resolution
- proof that protected shell rules still hold
- one or more concrete examples showing empty / weak candidate demotion
- any tests or harness updates

## Constraints

- Do not redesign child-zone UI to hide this problem.
- Do not bypass shell protections to force a prettier layout.
- Do not create an opaque “magic ranking” system with no diagnostics.
- Do not allow unrestricted reordering beyond the bounded resolver purpose.
