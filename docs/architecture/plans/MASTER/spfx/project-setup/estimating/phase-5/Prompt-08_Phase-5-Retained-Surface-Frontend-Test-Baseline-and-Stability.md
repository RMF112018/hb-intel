# Prompt 08 — Phase 5 Retained-Surface Frontend Test Baseline and Stability

## Objective
Resolve the Phase 5 audit finding that frontend/package-level release evidence is weaker than the handoff/signoff language implies by bringing the retained Project Setup frontend test surface to a truthful and stable baseline.

## Critical instructions
- Work from live repo truth.
- Focus on the retained Project Setup release surface, not every historical or adjacent UI path.
- Do not treat passing isolated tests as proof of overall release readiness if retained-surface pages still fail.
- Fix tests honestly: either repair the retained path, narrow stale/bad assumptions, or explicitly de-scope unsupported surfaces.
- Do not hide legitimate failures behind broad skips without documented rationale.

## Context
The audit specifically called out weaker frontend release evidence than the docs claimed, including package-level page tests associated with the retained launch surface.

This prompt is specifically about the **retained Project Setup frontend/package test baseline**.

## Required work
1. Re-verify the current retained frontend/package test surface.
   - Identify which frontend tests are part of the retained Project Setup release proof.
   - Identify which tests are:
     - retained and should be green
     - stale or testing removed scope
     - flaky due to bad harness assumptions
     - outside retained release scope

2. Bring the retained test surface to a truthful green baseline.
   - Fix retained page/component tests so they reflect current Project Setup truth.
   - If a test is failing because the implementation drifted legitimately, update the test.
   - If a retained surface is actually broken, fix the implementation.
   - If a test covers non-retained/stale scope, narrow or relocate it with explicit rationale.

3. Improve stability and clarity.
   - Remove ambiguous or misleading assertions that overstate what the retained surface guarantees.
   - Tighten fixtures/mocks/harnesses so retained tests are decision-useful.
   - Prevent false greens that mask retained-surface regressions.

4. Make retained release proof explicit.
   - Ensure it is easy to tell which frontend tests constitute release evidence for Project Setup.
   - Prefer a clear retained-surface slice over a broad noisy package signal.

## Files likely in scope
Likely:
- `apps/estimating/src/test/NewRequestPage.test.tsx`
- `apps/estimating/src/test/RequestDetailPage.test.tsx`
- `apps/estimating/src/test/RequestDetailPage.coordinator.test.tsx`
- related retained-surface Project Setup tests
- frontend test helpers/fixtures for Project Setup
- any docs/scripts describing retained frontend verification

## Required documentation update
Update:
- `docs/architecture/reviews/project-setup-phase-1-through-5-implementation-and-gap-report.md`

Add a **Phase 5 frontend-test progress note** that:
- states which frontend tests now form the retained release proof set
- states what was fixed, narrowed, de-scoped, or reclassified
- states whether the retained Project Setup frontend test baseline is now green
- distinguishes retained proof from broader package noise

Add a **closure statement draft** such as:
- “The retained Project Setup frontend release surface now has a truthful, stable test baseline that supports Phase 5 release evidence without relying on stale or out-of-scope package failures.”

## Evidence requirements
The review doc update must include:
- exact tests changed
- exact retained-surface proof set
- any tests intentionally de-scoped from retained release proof
- any remaining frontend release caveats, if any

## Acceptance criteria
- Retained Project Setup frontend tests are explicitly identified.
- Retained frontend/package release proof is green or remaining failures are explicitly bounded and documented.
- Stale/out-of-scope frontend tests no longer distort release-readiness claims.
- The review doc is updated with truthful progress notes, closure language, and evidence.
