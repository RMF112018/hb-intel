# Phase 06 Prompt Package — Homepage Operating Model and Content Governance

This package is the next phase following Phase 05 closure.

## Why this phase is next

Phase 05 closed Lane C governance for navigation, branding, and page-template rules. At this point:

- **Lane A** is implemented and governed as the singular HB Central homepage product.
- **Lane B** is implemented and governed as the shell-extension product.
- **Lane C** is now documented and active as a governance lane.
- The next unresolved area is the **operating model for homepage content itself**: ownership, freshness, authoring workflow, escalation, and admin-safe configuration boundaries.

This package therefore targets **Phase 06 — Homepage Operating Model and Content Governance**.

## Governing handoff inputs

Use these as the governing handoff set before making changes:

- `Phase-05-01-Completion-Note.md`
- `Phase-05-02-Completion-Note.md`
- `docs/reference/sharepoint-homepage-shell-boundaries.md`
- `docs/reference/sharepoint-navigation-governance.md`
- `docs/reference/sharepoint-nav-taxonomy.md`
- `docs/reference/sharepoint-branding-and-page-templates.md`
- `docs/how-to/administrator/sharepoint-navigation-operating-guide.md`
- `docs/how-to/administrator/sharepoint-page-authoring-guide.md`

Also preserve the already-established Lane A and Lane B boundaries from earlier phases.

## Package contents

1. `Phase-06-01-Homepage-Ownership-and-Freshness-Policy.md`
2. `Phase-06-02-Authoring-Workflow-and-Admin-Configuration.md`
3. `Phase-06-Risk-Exposure.md`
4. `Phase-06-Standards-and-Best-Practices.md`
5. `Phase-06-Implementation-Summary.md`

## Phase objective

Define the **non-code operating model** for HB Central homepage content so the completed homepage product can be sustained safely without design drift, stale content, owner confusion, or ad hoc authoring behavior.

This phase should produce:

- a homepage ownership model by zone and by webpart
- freshness, rotation, and stale-content policy
- authoring workflow and approval model
- admin configuration boundaries and escalation rules
- operational guides and governance references
- explicit distinctions between self-service authoring, governed authoring, and architecture-required changes

## Hard boundaries

Do **not** use this phase to:

- add new homepage webparts
- add new shell-extension features
- add homepage async data integration
- add homepage property-pane engineering work
- automate workflow approvals in code
- alter SharePoint’s native shell or navigation via unsupported techniques
- weaken the “homepage is singular” rule established in Phase 05

## Expected outputs in the repo

This phase should create or update documentation only, unless a tiny configuration artifact is strictly needed to support the docs.

Recommended target output location:

- `docs/reference/`
- `docs/how-to/administrator/`
- `docs/architecture/plans/MASTER/spfx/homepage/phase-06/`

## Verification expectation

Because this is primarily a governance/documentation phase, verification should focus on:

- internal consistency across all new Phase 06 docs
- correct cross-references to the established Lane A / Lane B / Lane C docs
- no contradiction with the supported SharePoint customization posture
- no contradiction with the “homepage is singular” rule
- no contradiction with page-template governance from Phase 05

If any repo code is touched, run the narrowest valid check for that touched surface and report it explicitly.
