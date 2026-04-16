# Prompt-02 — Harden Node Toolchain Resolution for SPFx Packaging

## Objective
Remove user-specific workstation assumptions from the packaging entrypoint and replace them with deterministic toolchain preflight behavior.

## Governing authority / required reference docs
- live repo truth in `main`
- `tools/build-spfx-package.ts`
- root `package.json`
- `tools/spfx-shell/package.json`

## Exact repo files and code paths to inspect
- `tools/build-spfx-package.ts`
- root `package.json`
- `tools/spfx-shell/package.json`
- any packaging docs or scripts that describe local build prerequisites

## Exact issue to close
The orchestrator currently defaults to a hard-coded `~/.nvm/.../node` path for Node 18 while the root repo declares Node `>=20`. That is fragile and not appropriate for repeated-use packaging.

## Required implementation outcome
- replace hard-coded user-path assumptions with a deterministic preflight / resolution strategy
- fail clearly and early if the required shell toolchain is unavailable
- document the expected packaging runtime in a concise operator-facing note

## Validation / proof-of-closure requirements
- prove the script no longer depends on a user-specific path
- prove the failure mode is actionable when the correct Node runtime is unavailable
- prove successful packaging still works with the new resolver

## Deliverables or closure docs to create
- code changes
- brief operator-facing note for packaging prerequisites

## Explicit guardrails
- conduct an exhaustive scrub of the current Node/runtime assumptions before editing
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
- do not make unrelated build-system changes
