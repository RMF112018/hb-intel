# Prompt 06 — Validation, Packaging, and Closure

## Objective

Validate the full People & Culture + HR companion implementation, reconcile remaining gaps, and rebuild/package the final SharePoint artifact.

## Required Inputs

- live repo: `https://github.com/RMF112018/hb-intel`
- `apps/hb-webparts/src/webparts/peopleCulture/`
- adjacent homepage/data/contracts/helper seams
- `packages/ui-kit/`
- `docs/reference/ui-kit/`
- `Decision-Lock-Appendix.md`
- `Plan-Summary.md`

## Governing Rules

- Treat repo truth as authoritative.
- Implement the locked decisions exactly unless a hard repo-truth conflict prevents it.
- Preserve the split between People & Culture and HB Kudos.
- Do not re-read files that are still within your current context window or memory unless you need to verify a specific uncertain detail.
- Preserve SPFx packaging discipline and shared import discipline.
- Prefer specific validation evidence over blanket approval.

## Scope

1. End-to-end state/lifecycle validation
2. Permission and audience validation
3. Preview/homepage-governance validation
4. Packaging validation
5. Closure report

## Instructions for the Agent

1. Validate the full People & Culture lifecycle end to end:
   - draft
   - submit/needs-approval path
   - schedule
   - live
   - expiring soon
   - expired
   - archived
   - suppressed
   - pinned/high-visibility approval handling
2. Validate visibility rules for:
   - public viewer
   - targeted viewer
   - irrelevant viewer who should not see targeted content
   - Editor
   - Approver/Admin
   - designated non-HR submitter
3. Validate the Overview, Approvals, Homepage, and content-family surfaces.
4. Validate claim/reassign behavior and confirm it applies only to approval work.
5. Validate profile-photo-first and override media behavior.
6. Validate multi-context preview behavior.
7. Validate recurring milestone candidate flow into HR review.
8. Rebuild/package the final `hb-webparts.sppkg`.
9. Prove the final package contains the latest source changes and correct manifest registrations.
10. Produce a closure report naming:
   - completed work
   - validation evidence
   - remaining defects/gaps
   - package outcome

## Deliverables

- final validated runtime
- final package build
- proof of package freshness
- final closure report

## Validation

- compile/typecheck/lint as repo permits
- validate critical user flows
- validate authorization and targeting paths
- validate package generation and contents
- validate no forbidden behavior was introduced contrary to the decision register

## Required Report Back

Return:
1. final changed-file summary
2. validation matrix
3. package build result
4. proof the package is fresh/current
5. remaining issues, if any
6. final closure recommendation
