# Prompt 02 — Define Versioned Shell Layout Policy and Persisted Boundary

## Objective

Turn the shell’s current loose layout-input parsing into a versioned, bounded, rejectable policy contract suitable for future persisted maintainer configuration.

## Why this issue exists in the current code

The current shell already accepts layout input and band overrides, but the contract is still too permissive and too lightly specified for persisted future use.

Today, the shell can parse and normalize lightweight override input.
That is useful for preview and experimentation.
It is not yet strong enough to be the canonical persisted shell-layout policy boundary for a future maintainer-facing editor.

## Current repo-truth evidence

- `shellTypes.ts` defines `ShellLayoutInput` with raw string-based override fields.
- `shellSchema.ts` validates structure, but override fields remain generic strings rather than a stronger policy envelope.
- `shellValidation.ts` applies normalization and warnings, but there is no versioned policy layer, no explicit persisted payload boundary, and no authoritative allowed-vs-rejected examples.
- `protectedDecisions.ts` already distinguishes protected and configurable decisions, but that distinction is not yet embodied strongly enough in the persisted input contract.

## Required future state

The shell should expose a clearly versioned layout-policy input that:

- states what may be stored
- states what may not be stored
- states what is interpreted through validation
- enforces protected shell rules
- can be previewed safely before application
- rejects unsafe or ambiguous policy mutations with explicit reasons

The future maintainer control panel should be forced to operate inside this boundary rather than around it.

## Files / seams / symbols to inspect

- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellTypes.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellSchema.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellValidation.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/protectedDecisions.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageContract.ts`
- any preview helpers or test files that should validate the persisted boundary

## Implementation requirements

1. Define a versioned persisted shell-layout policy shape.
2. Make explicit which parts of the shell may be persisted and which may not.
3. Ensure protected rules remain code-governed and cannot be overridden by persisted input.
4. Introduce a strong rejection taxonomy for invalid or prohibited persisted changes.
5. Provide canonical examples of:
   - allowed payloads
   - normalized payloads
   - rejected payloads
6. Keep backward compatibility only where it can be justified safely.
7. If a compatibility shim is necessary, make the canonical policy model the authoritative future boundary.

## Validation / proof of closure

Return all of the following:

- the versioned policy contract
- updated schema and validation logic
- examples of allowed vs rejected persisted payload shapes
- tests proving protected rules are not overridable
- a brief summary of what a future control panel may safely persist after this work

## Out-of-scope guardrails

- Do not build storage plumbing or a control-panel UI.
- Do not turn this into a general settings architecture.
- Do not weaken protected shell-entry rules for convenience.
- Do not spill into hosted-surface redesign.
- Do not leave the policy boundary implicit or “to be decided later.”

## Active-context discipline

Do not re-read files that are already in active context or memory unless you need to confirm drift, dependencies, or uncertainty after making changes.

## No-deferral requirement

Do not leave this prompt in a “future wave,” “follow-up later,” or “optional if time permits” state.
If a shell-only issue must be solved now to close the shell correctly, solve it now and prove it now.
