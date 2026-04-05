# Prompt — Phase 06-01 Homepage Ownership and Freshness Policy

## Objective

Use the completed Phase 05 governance work and the established Lane A/B/C architecture to create the canonical homepage content ownership and freshness policy for HB Central.

This prompt is about **operational governance**, not new feature development.

## Required pre-read

Before making changes, read:

- `Phase-05-01-Completion-Note.md`
- `Phase-05-02-Completion-Note.md`
- `docs/reference/sharepoint-homepage-shell-boundaries.md`
- `docs/reference/sharepoint-navigation-governance.md`
- `docs/reference/sharepoint-branding-and-page-templates.md`
- any existing homepage authoring-governance references from earlier phases

Do not re-read files that are already in your current working context unless necessary.

## Repo-truth assumptions to preserve

You must preserve these as hard gates:

1. **HB Central homepage is singular**
2. **Lane A owns homepage page-canvas product surfaces**
3. **Lane B owns supported shell placeholder surfaces**
4. **Lane C owns governance for navigation / branding / template policy**
5. **No unsupported SharePoint shell takeover**
6. **No reuse of homepage webparts outside the homepage without architecture approval**

## Work to perform

### 1. Create a canonical homepage ownership reference
Create a new reference document that defines, at minimum:

- homepage governance purpose
- scope of the homepage operating model
- relationship to Lane A, Lane B, and Lane C
- homepage ownership model by **zone**
- homepage ownership model by **webpart**
- primary owner role, backup owner role, and approval role
- who is accountable for freshness vs who is allowed to edit
- escalation path when ownership is unclear or the owner is inactive

Recommended filename:
- `docs/reference/sharepoint-homepage-ownership-and-freshness.md`

### 2. Define freshness and rotation policy
The document must include explicit policy for:

- freshness cadence by zone
- freshness cadence by webpart type
- expected rotation behavior for editorial vs utility vs operational content
- stale-content thresholds
- what happens when content exceeds its threshold
- what may remain evergreen and what may not
- minimum metadata expectations for time-sensitive content

You should distinguish at least:
- daily / weekly / monthly / event-driven / evergreen
- stale-but-visible vs stale-and-remove vs escalate-for-review

### 3. Define review cadence
Add an operating review model, including:

- weekly owner review
- monthly governance review
- quarterly drift / quality review
- architecture review triggers
- emergency update path for urgent homepage messaging

### 4. Align with existing page-template governance
Make sure the document explicitly reinforces that:
- homepage governance is stricter than normal SharePoint page authoring
- homepage is not an ordinary communications page
- homepage custom surfaces are reserved and governed
- template rules from Phase 05 remain binding for non-homepage pages

### 5. Update documentation routing
Update the docs navigation surfaces so the new reference is easy to find:

- `docs/README.md`
- `docs/architecture/blueprint/current-state-map.md`

Add the correct classification entries and links.

### 6. Create a completion note
Create:
- `docs/architecture/plans/MASTER/spfx/homepage/phase-06/Phase-06-01-Completion-Note.md`

It should summarize:
- files created
- files updated
- major decisions locked
- deferred items for Prompt 02

## Deliverable quality bar

The resulting ownership/freshness policy must be:

- concrete
- operational
- readable by administrators and content owners
- consistent with the established three-lane model
- narrow enough to prevent homepage sprawl
- flexible enough to permit legitimate urgent updates

## Risk Exposure

Key risks to manage:
- owner ambiguity
- stale homepage content
- homepage becoming a dumping ground for miscellaneous communications
- drift between homepage rules and generic page-template rules
- overcomplicated governance that no one will follow

## Standards / Best Practices

- keep the owner matrix simple and explicit
- separate “may edit” from “owns freshness accountability”
- use clear review cadences
- define escalation paths before they are needed
- treat the homepage as a curated front door, not a general-purpose posting surface

## Verification

Because this is primarily a documentation phase:

- verify internal consistency across the new policy and existing Lane C docs
- verify cross-references are valid
- verify no contradiction with homepage singularity or supported SharePoint posture
- if any code/config files are touched, run the narrowest relevant verification and report it

## Do not do

- do not add workflow automation
- do not build backend services
- do not implement property panes
- do not expand homepage webpart usage beyond the homepage
- do not weaken existing lane boundaries
