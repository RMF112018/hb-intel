# Phase 11 — Accounting SPFx Artifact Reconciliation, Packaging Alignment, and Production Hardening

## Objective

Phase 11 closes the remediation items identified in the Accounting SPFx `.sppkg` production-readiness audit by reconciling artifact truth against current repo truth, hardening the Accounting packaging/runtime path, resolving hidden dependencies, restoring cross-app SharePoint continuity, and producing a fresh, evidence-backed release candidate.

This phase is intentionally sequenced so the local code agent resolves truth and boundary questions first, then fixes implementation gaps, then rebuilds and validates the package, and only then performs staged readiness closure work.

## Core Problems This Phase Must Resolve

1. **Canonical packaging/build truth ambiguity**
   - The audited uploaded Accounting package and repo-visible Accounting entry surfaces need to be reconciled into one explicit, documented source of truth.

2. **Permission-contract ambiguity**
   - The Accounting package’s need for `hb-intel-api-production / access_as_user` must either be formally adopted in repo truth or removed from the shipped artifact path.

3. **Runtime-config injection / packaged-shell parity**
   - Accounting must have the same build-time/runtime injection discipline already expected of the Project Setup comparison package.

4. **Hidden hosted-runtime dependencies**
   - The `/api/users/me/preferences` and `/api/users/me/groups` dependency chain must be either removed, replaced, or formally documented and provisioned.

5. **Cross-app shell continuity**
   - Accounting and Project Setup must feel like one intentional SharePoint-hosted HB Intel application family, with differences limited to justified specialization rather than drift.

6. **Fresh production-target artifact proof**
   - A newly rebuilt Accounting `.sppkg` must be inspected and evidenced as the canonical release candidate before any hosted staging validation is treated as meaningful.

## Required Outcomes

By the end of Phase 11, the repo should contain:

- one explicit and documented canonical Accounting SPFx packaging/build path
- reconciled Accounting auth/permission contract documentation
- hardened Accounting packaged-shell runtime injection parity
- resolved or documented `/api/users/me/*` dependency posture
- a fresh Accounting production-target `.sppkg` build evidence package
- staged validation and tenant/admin approval checklist materials
- a final Phase 11 closure memo stating whether the Accounting surface is:
  - not ready
  - staging-ready only
  - pilot-ready with blockers
  - production-ready with caveats
  - production-ready without material blockers

## Ordered Prompt Sequence

1. `Prompt-01_Phase-11-Canonical-Packaging-and-Build-Truth-Freeze.md`
2. `Prompt-02_Phase-11-Accounting-Entry-Surface-and-Bundle-Contract-Reconciliation.md`
3. `Prompt-03_Phase-11-Accounting-Protected-API-Permission-Contract-Reconciliation.md`
4. `Prompt-04_Phase-11-Runtime-Config-Injection-Parity-and-Packaged-Shell-Hardening.md`
5. `Prompt-05_Phase-11-Hidden-Hosted-Dependency-Reconciliation-and-Complexity-Path-Cleanup.md`
6. `Prompt-06_Phase-11-UI-UX-Shell-Continuity-and-Specialization-Governance.md`
7. `Prompt-07_Phase-11-Production-Target-Rebuild-and-Artifact-Evidence-Package.md`
8. `Prompt-08_Phase-11-Hosted-Staging-Validation-and-Tenant-Approval-Readiness.md`
9. `Prompt-09_Phase-11-Final-Release-Reconciliation-and-Closure.md`

## Execution Rules for the Whole Phase

- Treat live repo code and the latest committed docs as the implementation authority.
- Treat the uploaded audit findings as the triggering evidence set, not as permanent truth if repo evidence disproves a point.
- Do not re-read files already in current context or memory unless needed to verify contradiction, capture exact wording, confirm a changed condition, or gather evidence for a written deliverable.
- Prefer narrow, traceable edits over broad rewrites.
- Where Microsoft platform behavior matters, use official Microsoft documentation and record exact implications in the produced docs.
- Do not classify anything as production-ready unless code, config, package artifact, docs, and external prerequisites all support that conclusion.
- Keep package truth, repo truth, environment prerequisites, and hosted validation evidence explicitly separate.

## Recommended Repo Destination for This Package

`docs/architecture/plans/MASTER/spfx/accounting/phase-11/`

## Completion Standard

Phase 11 is complete only when a fresh Accounting release candidate can be traced from source → build path → packaged artifact → permissions → runtime config → staged validation plan without relying on ambiguous packaging assumptions or undocumented environment behavior.
