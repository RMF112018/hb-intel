# Prompt-01 — Phase 9: Repo-Truth Release Readiness Audit

## Objective

Perform a repo-truth audit of current release readiness for the Accounting app and the connected Project Setup / provisioning workflow. Establish what is actually ready, what is partially ready, what remains blocked, and what manual/non-code prerequisites still exist.

## Instructions

You are working inside the live repository.

Start from repo truth. Do not rely on prior summaries unless you verify them against the current repo state. Do not re-read files that are still within your current context or memory.

Audit the current release posture across:
- Accounting app
- Project Setup backend host
- provisioning lifecycle and status surfaces
- Admin exception path
- related docs governing deployment, readiness, and operations

Focus on:
1. what is complete in code
2. what is complete in documentation
3. what still requires implementation
4. what is externally blocked
5. what is required before staging / pilot / production

## Required review targets

Review and reconcile the most relevant current-state and release-oriented materials, including as applicable:
- current-state map
- Phase 1 through Phase 8 output docs
- release/readiness checklists
- provisioning runbooks
- deployment-related docs
- Accounting / Admin / backend / provisioning verification artifacts
- environment/config docs
- test and verification coverage docs

## Deliverables

Create or update:
- `docs/architecture/reviews/phase-9-release-readiness-audit.md`

The report must include:
1. Executive Summary
2. Scope Reviewed
3. Repo-Truth Findings
4. Readiness Classification by Area
   - Repo Complete
   - Staging Ready
   - Pilot Ready
   - Production Ready
5. External / Tenant / Operational Dependencies
6. Blocking Items
7. Recommended Order for Remaining Phase 9 Work
8. Explicit Open Risks
9. Evidence Appendix

## Acceptance criteria

- Every major readiness statement is grounded in repo evidence.
- Repo-complete vs deployable vs production-ready are clearly distinguished.
- External dependencies are separated from code-deliverable items.
- The resulting report gives a credible baseline for the rest of Phase 9.
