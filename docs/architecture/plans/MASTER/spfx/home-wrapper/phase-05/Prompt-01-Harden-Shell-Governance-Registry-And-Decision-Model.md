# Prompt 01 — Harden Shell Governance Registry and Decision Model

## Objective

Strengthen the shell’s existing governance registry and decision seams so the shell can support future governed reconfiguration without drifting into child-module redesign.

## Why this issue exists in the current code

The shell already has real governance groundwork, but it is not yet explicit enough about:

- what the shell owns
- what remains code-governed
- what may later become maintainer-configurable
- what compatibility and placement decisions belong to shell policy versus hosted-surface implementation

The attached Wave 02 package correctly sensed a governance gap, but it understated how much registry and decision logic already exists in `main` and did not define the stronger end state precisely enough.

## Current repo-truth evidence

- `shell/occupantRegistry.ts` already defines occupant descriptors with slot-role eligibility, prominence ceilings, first-lane eligibility, comfort ranges, and pairing restrictions.
- `shell/protectedDecisions.ts` already defines protected shell decisions, protected entry-state rules, and configurable decision categories.
- `shellTypes.ts` already defines the core shell policy types, but the model still leaves future authorability and configuration boundaries too implicit.
- `shellValidation.ts` already enforces some policy outcomes, which means the correct answer is to harden the policy model rather than invent a new one.

## Required future state

The shell should have an explicit, reviewable governance model that makes all of the following clear:

- which placement and prominence decisions are hard shell policy
- which layout choices are future maintainer-tunable within governance bounds
- which pairings, bands, and role assignments are permanently protected
- which occupants are eligible for limited reorder or visibility control
- which policy facts future persistence and preview tools are allowed to consume

The resulting model should be strong enough to support future control-panel work without implying that the shell owns hosted-surface redesign.

## Files / seams / symbols to inspect

- `apps/hb-webparts/src/webparts/hbHomepage/shell/occupantRegistry.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/protectedDecisions.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellTypes.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellValidation.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/presetLibrary.ts`
- any shell-local docs or inline comments that imply future authorability boundaries

## Implementation requirements

1. Refactor or extend the existing registry and decision model into a clearly shell-owned policy surface.
2. Distinguish explicitly between:
   - protected decisions
   - bounded configurable decisions
   - descriptive metadata
   - shell-fit metadata
3. Add any missing policy metadata needed for:
   - allowed band compatibility
   - reorder domains or reorder constraints
   - visibility eligibility
   - future persisted-policy interpretation
4. Keep the model shell-only.
5. Do not add module-maturity scores, redesign directives, or hosted-surface implementation obligations to the registry.
6. Update validation and type seams as needed so the harder policy model is actually consumable rather than decorative.

## Validation / proof of closure

Return all of the following:

- the updated governance model and supporting type changes
- a concise explanation of what the shell now explicitly governs
- a concise explanation of what remains intentionally code-governed
- examples of future maintainer actions that are now supportable versus still prohibited
- test coverage or validation additions proving the new governance model is enforced

## Out-of-scope guardrails

- Do not redesign child modules.
- Do not convert this into a shell-fit parity program.
- Do not add novelty metadata with no enforcement path.
- Do not build the control panel UI itself.
- Do not widen scope into hero or priority-actions redesign beyond the shell-policy seam they depend on.

## Active-context discipline

Do not re-read files that are already in active context or memory unless you need to confirm drift, dependencies, or uncertainty after making changes.

## No-deferral requirement

Do not leave this prompt in a “future wave,” “follow-up later,” or “optional if time permits” state.
If a shell-only issue must be solved now to close the shell correctly, solve it now and prove it now.
