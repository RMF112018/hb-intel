# 07 — Shared Component and Seam Validation Prompt

You are working in the live repo for `RMF112018/hb-intel`.

Your task is to validate the shared components and seam contracts that make the Kudos system trustworthy across both public and governance experiences.

## Mandatory directive

Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Objective

Add focused validation around the shared components and data seams most likely to create cross-surface regressions.

## Priority seams

### A. Shared homepage entrypoint exports

Validate the governed `@hbc/ui-kit/homepage` export path and its relevant primitives for this system:

- `HbcPeopleCultureSurface`
- `HbcKudosComposerFlyout`
- `HbcKudosComposerForm`
- `HbcKudosComposerPreview`
- `HbcPeoplePicker`
- `HbcAvatarStack`

### B. Composer state seam

Validate:

- `useKudosComposer`
- dirty detection
- recipient validation
- headline/excerpt validation
- success/error transitions

### C. People search seam

Validate:

- `useSharePointPeopleSearch`
- response shape handling
- query threshold handling
- ranking/ordering behavior where current code supports it
- search error propagation

### D. Submission seam

Validate:

- `submitKudosDraft`
- pending/internal-only defaults on create
- typed-recipient bucket handling
- unresolved-recipient note behavior
- cache invalidation after successful submit

### E. Governance write seam

Validate:

- `buildKudosPatchPlan`
- `submitKudosGovernanceAction`
- authorization preflight
- etag-aware update path assumptions
- audit-event coupling
- cache invalidation after mutation
- public/admin note handling boundaries

### F. Visibility predicates and mapping helpers

Validate the pure/current helper behavior around:

- `isPubliclyVisible`
- `isArchiveEligible`
- `isAssociatedVisible`
- `hasAgedOff`
- `needsAdminReview`
- aging bucket derivation
- workflow chip / audit event descriptor helpers
- recipient summary construction

## Required implementation style

- Use focused tests where pure helper coverage adds meaningful confidence.
- Do not overmock everything into irrelevance.
- Keep tests tied to current repo truth and current contracts.
- Add narrow component-level coverage or seam-level coverage only where it supports the broader stress harness.

## Required boundary checks

Explicitly prove:

- public detail content does not leak audit timeline/internal note data
- governance detail content does include its intended timeline/internal data
- recipient and photo mapping stay consistent across main surface, preview, feed, archive, and detail views
- data contract drift would fail loudly, not silently

## Prohibited shortcuts

- no broad snapshot-only test strategy
- no meaningless render smoke tests without assertions
- no fake generic contract tests detached from actual Kudos helpers

## Closure

Commit the shared seam validation coverage and a short note identifying which regressions these tests now catch that the E2E suite alone would miss.
