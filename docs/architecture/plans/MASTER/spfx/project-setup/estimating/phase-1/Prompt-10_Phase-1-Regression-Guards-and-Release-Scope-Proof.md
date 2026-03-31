# Prompt-07-04 — Phase 1 Regression Guards and Release-Scope Proof

## Context
You are continuing the Phase 1 remediation after implementing the Project Setup domain host and scoping its operational assumptions.

Relevant review file to keep current as you work:
- `docs/architecture/reviews/project-setup-phase-1-through-5-implementation-and-gap-report.md`

Critical standing instruction:
- **Do not re-read files that are already in your active context or memory unless needed to verify a contradiction, inspect a dependency you have not yet loaded, or retrieve exact evidence for docs/tests.**

## Objective
Prove that Phase 1 is actually closed — or identify the precise residuals preventing closure — by strengthening regression guards and release-scope evidence around the dedicated Project Setup host.

## Required Work

### 1) Strengthen regression guards
Add or update tests/guards so repo truth will fail loudly if Project Setup backend scope drifts again.

At minimum, protect against:
- unrelated route registration returning to the Project Setup host,
- unrelated service/container dependencies being wired into the Project Setup host,
- docs or config drifting back toward ambiguous shared-host language for Project Setup,
- accidental expansion of Project Setup runtime prerequisites.

### 2) Reconcile current tests with the new architecture
Review existing Phase 1/backend release/readiness tests and update them so they validate the intended domain-host architecture rather than the old broad-host posture.

If any old tests are now misleading, replace them with better scope-specific tests.

### 3) Produce release-scope proof
Create a concise proof set demonstrating:
- what the Project Setup host includes,
- what it excludes,
- why the excluded surfaces belong to other domain hosts,
- how shared services remain reusable without widening the Project Setup host.

This proof can be captured in tests, lightweight machine-checkable manifests, or durable docs — but it must be specific and auditable.

### 4) Assess closure honestly
At the end of this prompt, decide whether Phase 1 backend scope remediation is:
- closed,
- closed with minor documentary follow-up only,
- or still open with named technical residuals.

Do not use optimistic language unless the evidence actually supports it.

## Required Validation
Run the most targeted relevant tests for:
- Phase 1 scope guards
- host-specific route registration
- host-specific dependency/config scoping
- any updated release/readiness guards tied to the new host boundary

Capture the actual test outcomes in your final response.

## Required Documentation Updates
Update `docs/architecture/reviews/project-setup-phase-1-through-5-implementation-and-gap-report.md` with:

### Progress Notes
- what regression guards were added/updated,
- what proof artifacts now exist,
- what tests were run and their results.

### Closure Statement
Add a direct closure assessment for the Phase 1 backend-scope findings.

### Evidence
List exact file paths for the new or updated:
- regression guards
- route-scope tests
- dependency-scope tests
- proof artifacts/docs

Also update any phase handoff or architecture docs that still overstate or misstate the backend boundary.

## Constraints
- No vague “trust the architecture” narrative.
- No closure claim without evidence.
- No unrelated phase churn unless required to make the evidence truthful.

## Deliverables
1. Stronger Phase 1 regression-proof suite.
2. Clear release-scope proof for the Project Setup host.
3. Updated review report with progress notes, closure assessment, and evidence.

## Final Response Requirements
Summarize:
- regression guards added/updated,
- tests run and results,
- whether Phase 1 is honestly closed now,
- if not, the exact residual blockers.
