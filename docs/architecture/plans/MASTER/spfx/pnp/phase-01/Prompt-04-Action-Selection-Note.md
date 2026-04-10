# Prompt-04 Action Selection Note

## Selected for v1.1

1. `library-folder-tree`
- Why: high-frequency need during site onboarding and information architecture audits.
- Safety: read-only hierarchy extraction from selected libraries.
- Output: folder depth/child-count model suitable for automation and review.

2. `site-groups-summary`
- Why: common operator requirement for permission diagnostics and access review prep.
- Safety: read-only group and membership summary export.
- Output: owners/members/visitors-style rollups with member counts.

3. `page-webpart-inventory`
- Why: useful for modernization triage and webpart dependency mapping across pages.
- Safety: read-only extraction of page-to-webpart relationships.
- Output: per-page webpart IDs/titles/control counts for downstream analysis.

## Deferred from Prompt-04

1. Navigation export summary
- Deferred to keep Prompt-04 bounded and avoid over-expanding extraction breadth in one step.

2. Deeper site-inventory variant
- Deferred because existing site-inventory action is already present and Prompt-04 prioritizes distinct high-ROI additions.

3. Mutating/admin-center expansion
- Explicitly out of scope for Prompt-04; retained as non-goal to preserve read-safe operator posture.
