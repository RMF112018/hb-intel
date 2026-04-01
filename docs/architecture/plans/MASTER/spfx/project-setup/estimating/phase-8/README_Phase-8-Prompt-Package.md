# Phase 8 Prompt Package — Project Setup Frontend/Backend Reconciliation and Production Readiness

## Purpose

This package contains the Phase 8 implementation plan and a sequenced set of prompts for a local code agent to remediate the highest-priority blockers identified in the Project Setup frontend/backend audit.

The package is designed to do four things in order:

1. verify the current `.sppkg` build output and packaging pipeline against repo truth
2. reconcile the SPFx shell/runtime-config/token contract
3. resolve missing or ambiguous route and host-boundary expectations
4. harden the backend and release process for production deployment, including user-assigned identity, API-access approvals, and CORS gating

## Execution Order

Run the prompts in this order:

1. `Prompt-01_Phase-8-Build-Artifact-Audit-and-Scaffold.md`
2. `Prompt-02_Phase-8-SPFx-Runtime-Config-and-Token-Contract-Reconciliation.md`
3. `Prompt-03_Phase-8-Resolve-Users-Me-Routes-and-Identity-Dependency-Surface.md`
4. `Prompt-04_Phase-8-Backend-Host-Boundary-and-Scope-Reduction.md`
5. `Prompt-05_Phase-8-User-Assigned-Managed-Identity-and-App-Access-Model.md`
6. `Prompt-06_Phase-8-API-Access-Approvals-CORS-and-Operational-Gates.md`
7. `Prompt-07_Phase-8-Startup-Validation-Release-Gates-and-Deployment-Hardening.md`
8. `Prompt-08_Phase-8-End-to-End-Verification-and-Documentation-Reconciliation.md`

## Required Standing Rules for Every Prompt

- Treat the live repo as the primary implementation truth source.
- Do not re-read files that are still within your active context or memory unless needed to verify a contradiction, inspect exact evidence, or resolve an ambiguity.
- Prefer repo-truth verification over plan-text assumptions.
- Do not claim completion unless the repo contains direct evidence.
- Preserve permanent light-mode behavior for the SPFx surface unless a prompt explicitly says otherwise.
- Do not broaden scope unnecessarily; where a design choice is unresolved, make a grounded recommendation and implement the minimal production-correct path.
- Update the Phase 8 review report after every prompt with:
  - work completed
  - files changed
  - unresolved items
  - repo-truth evidence
  - explicit closure or carry-forward notes

## Expected New/Updated Documentation

The prompts assume the agent will create and maintain these files:

- `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-8/Phase-8-Plan_Project-Setup-Frontend-Backend-Reconciliation-and-Production-Readiness.md`
- `docs/architecture/reviews/project-setup-phase-8-remediation-report.md`

## Output Standard

Each prompt is written to support:

- repo-truth audit first
- implementation second
- documentation reconciliation third

The final result should leave the repo with a production-readiness posture that is materially clearer, narrower, and more defensible than the current state.
