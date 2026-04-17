# Prompt 01 — Lock Shell-Owned Boundaries and Non-Goals

## Objective

Make the shell-owned boundary explicit enough that no future agent can mistake Wave 01 for a hosted-module remediation effort.

This is not a generic scoping prompt. It is a shell-governance closure prompt.

## Why this issue exists in the current code

The current package is correct that shell drift is a risk, but the repo is now mature enough that broad “stay shell-only” language is no longer sufficient.

The shell already owns:
- layout contracts
- preset selection
- validation and normalization
- breakpoint policy
- slot fit and pairing logic
- post-hero operating-layer composition

But production still depends on adjacent seams that can easily invite drift:
- hero
- priority actions
- composition reference
- mount/dispatch

Without a sharper ownership model, a code agent can still:
- mutate child modules to solve shell fit
- treat the shell as responsible for child internals
- blur what future control-panel work may configure
- blur what must remain code-governed

## Current repo-truth evidence

Inspect and treat as shell-owned:
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepage.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageContract.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellTypes.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellSchema.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellValidation.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/defaultPreset.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/presetLibrary.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/protectedDecisions.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/breakpointPolicy.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/useShellContainer.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/slotComfortResolver.ts`

Inspect as shell-adjacent but not shell-owned child internals:
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/homepage/ReferenceHomepageComposition.tsx`
- `apps/hb-webparts/src/webparts/hbSignatureHero/**`
- `apps/hb-webparts/src/webparts/priorityActionsRail/**`

## Required future state

After this prompt is complete, all of the following must be true:

1. The shell-owned boundary is explicit in code comments and/or nearby docs.
2. The shell’s responsibilities are clearly named:
   - placement
   - layout governance
   - breakpoint governance
   - pairing/stacking decisions
   - preset governance
   - normalization and diagnostics
   - shell-facing entry-stack policy integration
3. Child-surface responsibilities are clearly excluded:
   - module-specific UI redesign
   - module-specific data model redesign
   - child interaction-pattern overhauls
4. Future control-panel work is clearly bounded to configurable shell decisions.
5. Protected shell decisions are clearly identified as non-negotiable.

## Files / seams / symbols to inspect

Inspect at minimum:
- files listed above under repo-truth evidence
- symbols such as:
  - `HbHomepageShell`
  - `HB_HOMEPAGE_WEBPART_ID`
  - `parseShellLayout`
  - `resolveBandLayout`
  - `SHELL_PROTECTED_DECISIONS`
  - `PROTECTED_ENTRY_STATE_RULES`
  - `CONFIGURABLE_DECISIONS`

## Implementation requirements

1. Add or tighten shell-boundary comments / docs near the shell seams.
2. Remove or rewrite any language that still implies shell work may solve fit by redesigning child modules.
3. Make the shell-owned / child-owned split obvious in the contract layer, not just in a README.
4. Preserve the post-hero boundary.
5. Make future control-panel readiness explicit without suggesting freeform editor behavior.

## Validation / proof of closure

Return all of the following:
1. exact files changed
2. the final shell-owned boundary statement
3. the final child-owned boundary statement
4. any comments or docs removed because they encouraged drift
5. confirmation that no child-module implementation was redesigned

## Out-of-scope guardrails

Do not:
- redesign hosted child surfaces
- change child data contracts unless a shell-facing contract seam absolutely requires a narrow additive change
- broaden Wave 01 into module maturity work

## Instruction not to re-read files that are still in active context unless needed to confirm drift, dependencies, or uncertainty after changes

Do not re-read files that are still in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## No-deferral requirement

Do not defer any in-scope shell work to a later wave. If a detail is required now to make the shell correct, governed, and provably closed, address it now.

