# Phase 05-01 — Home Site and Global Navigation Governance

## Objective

Use the live repo, the existing SharePoint homepage / shell boundary docs, and the completed Phase 01–04 work to create the canonical governance model for **Lane C — Navigation & Governance**.

This prompt is not a request to build another app surface. It is a governance and architecture execution prompt that should produce the documents and rules required to operate HB Central as a supported SharePoint home-site experience.

## Required repo-truth inputs

Review at minimum:

- `docs/reference/sharepoint-homepage-shell-boundaries.md`
- `docs/README.md`
- `docs/architecture/blueprint/current-state-map.md`
- the Phase 04 completion notes
- `apps/hb-webparts/README.md`
- `apps/hb-shell-extension/README.md`

Do not restate assumptions from older planning docs if live repo truth differs.

## Core task

Define and document the governance model for:

1. **Home-site posture**
   - what HB Central is at the tenant/site level
   - what must be configured through supported SharePoint administration rather than custom code
   - relationship between the homepage, the shell-extension lane, and native SharePoint navigation

2. **Global navigation doctrine**
   - what belongs in global navigation
   - what belongs in hub navigation vs page-level navigation vs homepage utilities
   - what must never be duplicated by Lane A or Lane B

3. **Ownership and operating model**
   - who owns nav taxonomy
   - who approves changes
   - who can request updates
   - how changes are reviewed for architectural or UX risk

4. **Audience and information architecture**
   - primary nav buckets
   - role / department / audience considerations
   - how to avoid nav sprawl and over-specialization

5. **Escalation and exception rules**
   - when a nav request requires architecture review
   - when a new surface should be a homepage webpart, shell extension, native nav item, or separate site/page
   - when a change is rejected as unsupported or redundant

## Required deliverables

Create or update repo-ready markdown docs under the SharePoint homepage / shell planning library, including:

1. **Lane C navigation governance document**
   - authoritative purpose and scope
   - relationship to Lane A and Lane B
   - supported-vs-prohibited governance actions
   - ownership model
   - change-control model

2. **Home-site and global-nav taxonomy / ownership reference**
   - recommended nav structure
   - bucket definitions
   - ownership / approval table
   - anti-sprawl guardrails

3. **Site-owner / admin operating guide**
   - how approved nav changes should be made in supported SharePoint configuration
   - when to route requests to product / architecture instead of self-service

4. **Completion note**
   - exact files created/updated
   - major decisions locked
   - verification performed
   - deferred items for Prompt 02

## Required standards

- Stay inside supported SharePoint posture.
- Do not propose custom replacement of SharePoint suite bar or app bar.
- Do not let Lane C re-introduce homepage content inside navigation.
- Preserve the Phase 01–04 boundary model.
- Keep the rules practical for site owners and administrators.

## Acceptance criteria

- Lane C is documented as a first-class governance lane.
- Navigation ownership and approval are explicit.
- The relationship between home-site nav, hub nav, page-canvas content, and shell placeholders is clear.
- The docs make it harder, not easier, to create duplicate or conflicting navigation systems.
- The output is repo-ready and written as authoritative guidance.

## Verification

Run and report any doc or lint validation that is appropriate. If no code changes are made, say so explicitly and state what was verified anyway.
