# Prompt-01 — Phase 8 Build Artifact Audit and Scaffold

## Objective

Audit the current Project Setup packaging pipeline and generated `.sppkg` artifact against repo truth, verify whether the current build is compiling and packaging properly, and establish the Phase 8 documentation scaffold.

## Context

The latest `.sppkg` artifact must be treated as a first-class truth source for this effort. Prior audit findings indicated likely drift between packaged shell/runtime behavior and current source code expectations. This prompt is meant to prove or disprove that drift with repo-truth evidence.

## Required Working Rules

- Treat the live repo as the primary implementation source.
- Do not re-read files that are still within your active context or memory unless needed to verify a contradiction, inspect exact evidence, or resolve an ambiguity.
- Do not assume the most recent `.sppkg` build is correct merely because it is the latest build.
- Prefer direct inspection of build scripts, emitted artifacts, manifests, and bundle contents over assumptions.

## Tasks

### 1. Create Phase 8 documentation scaffold
Create these files if they do not already exist:

- `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-8/Phase-8-Plan_Project-Setup-Frontend-Backend-Reconciliation-and-Production-Readiness.md`
- `docs/architecture/reviews/project-setup-phase-8-remediation-report.md`

If the plan file is newly created, seed it using the repo’s existing phase-plan conventions.
If the report file is newly created, add:
- executive summary
- current status
- prompt-by-prompt progress log
- open items
- evidence index

### 2. Audit the packaging pipeline
Audit the repo truth for:
- SPFx packaging orchestration scripts
- Vite bundle generation for the Project Setup surface
- shell build/runtime constant injection
- any environment-variable or compile-time substitutions that affect the packaged artifact

Confirm:
- where `functionAppUrl`, `backendMode`, `allowBackendModeSwitch`, and `apiAudience` are meant to be injected
- whether the current build pipeline actually injects them into the packaged artifact
- whether the shell bundle and app bundle agree on the runtime contract

### 3. Produce and inspect a fresh build
Run the appropriate repo build/package commands to produce a fresh Project Setup `.sppkg`.

Then inspect the generated artifact directly:
- package manifests
- shell bundle
- app bundle
- runtime-constant substitutions
- global mount/unmount export wiring
- asset references and bundle URLs

### 4. Reconcile source truth vs packaged truth
Determine whether the packaged artifact is:
- aligned with current source truth
- stale relative to source truth
- partially aligned with one or more critical defects

Be explicit about any divergence involving:
- runtime config injection
- mount signature expectations
- token audience handling
- function app URL handling
- backend mode handling
- same-origin API assumptions
- Teams Personal App host surface

### 5. Implement only the minimum artifact-truth fixes needed now
If the package build pipeline is clearly wrong, fix the pipeline and rebuild.
Do not yet broaden into unrelated architecture cleanup unless the packaging problem cannot be resolved without it.

## Deliverables

### Code / Repo Deliverables
- any required fixes to the packaging/build pipeline
- any required fixes to shell runtime-constant injection
- a reproducible current `.sppkg` build path

### Documentation Deliverables
Update `docs/architecture/reviews/project-setup-phase-8-remediation-report.md` with:
- packaging audit summary
- build commands executed
- packaged truth findings
- source-vs-package reconciliation
- files changed
- closure statement for Prompt-01
- carry-forward items for Prompt-02+

## Completion Standard

This prompt is complete only when the repo contains evidence that the current `.sppkg` can be reproduced and the shell/app runtime contract is either:
- confirmed aligned, or
- explicitly identified as broken with corrective changes committed in repo truth
