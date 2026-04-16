# Prompt-03 — Remove Committed Generated Shell Artifacts and Tighten Ignores

## Objective
Clean generated packaging outputs out of repo truth so audits and future packaging reviews do not confuse generated residue with authoritative source.

## Governing authority / required reference docs
- live repo truth in `main`
- `.gitignore`
- `tools/spfx-shell/release/`
- `tools/build-spfx-package.ts`

## Exact repo files and code paths to inspect
- `.gitignore`
- generated files under `tools/spfx-shell/release/`
- any adjacent generated shell output folders
- `tools/build-spfx-package.ts` cleanup logic

## Exact issue to close
Generated shell release artifacts are present in repo truth and the ignore rules do not clearly express that they are generated-only.

## Required implementation outcome
- remove generated shell release artifacts from version control where appropriate
- tighten ignore rules so they do not return
- confirm the packaging flow reproduces the required artifacts deterministically

## Validation / proof-of-closure requirements
- prove the repo no longer depends on committed generated shell outputs
- prove a fresh package run recreates the needed generated artifacts
- document any intentionally retained generated artifact and justify it explicitly if one must remain

## Deliverables or closure docs to create
- cleanup commit(s)
- concise closure note on generated-vs-source boundaries

## Explicit guardrails
- conduct an exhaustive scrub of generated-output boundaries before editing
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
- do not delete authoritative source files by mistake
