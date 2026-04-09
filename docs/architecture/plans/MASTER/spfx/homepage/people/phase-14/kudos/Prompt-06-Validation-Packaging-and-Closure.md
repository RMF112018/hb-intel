# Prompt 06 — Validation, Packaging, and Closure

Validate the HB Kudos + HR approval companion implementation, rebuild the required artifacts, and produce final closure evidence.

## Objective

Prove that the implementation is:

- schema-aligned
- role-safe
- shared-surface-disciplined
- homepage-entry-point-compliant
- functionally coherent
- packaging-current

This prompt is the final proof pass, not a new design phase.

## Required Validation Areas

### 1. Contract / schema validation
Prove that:
- recipient handling is typed against the real list fields
- workflow/scheduling/prominence logic aligns to the live schema
- audit-event writes use the expected audit-event shape

### 2. Import-discipline validation
Prove that homepage webparts in scope use `@hbc/ui-kit/homepage` as the primary UI entry point.

Explicitly check for prohibited homepage webpart imports from:
- `@hbc/ui-kit`
- `@hbc/ui-kit/primitives`
- `@hbc/ui-kit/app-shell`
- `@hbc/ui-kit/fluent`

### 3. Shared-primitive validation
Prove that repeated recognition/governance patterns were promoted into shared homepage-safe primitives instead of being left as local premium duplication.

Explicitly call out:
- shared primitives reused directly
- shared primitives newly created or extended
- local patterns intentionally left local and why

### 4. Functional flow validation
Validate critical flows at minimum:
- submit kudos
- request revision
- resubmit revision
- approve
- reject
- approve + flag for admin review
- claim / reassign
- schedule / cancel schedule
- pin / unpin
- feature / unfeature
- remove / restore
- detail-panel access by role
- associated-item visibility after age-off/removal where allowed

### 5. Notification / reminder validation
Validate:
- submitter notifications
- recipient notifications only on actual go-live
- overdue/reminder targeting and cadence hooks

### 6. Packaging / artifact freshness validation
Rebuild the relevant package(s), then prove the final artifact is current:
- manifests/registrations are correct
- the built artifact reflects the latest source
- no stale package contents remain

## Required Evidence

Produce explicit proof for:

1. files changed
2. validation matrix
3. list fields read/written by each critical flow
4. audit-event validation summary
5. import-discipline summary
6. shared-primitive summary
7. build/package result
8. freshness proof for the final artifact
9. remaining issues, if any
10. final closure recommendation

## Important Rules

- Do not claim closure if the final recipient model is still string-based.
- Do not claim closure if homepage webparts still rely on prohibited entry points.
- Do not claim closure if repeated recognition/governance patterns remain duplicated locally without justification.
- Do not re-read files that are still within your active context window or memory unless a detail is genuinely uncertain.
