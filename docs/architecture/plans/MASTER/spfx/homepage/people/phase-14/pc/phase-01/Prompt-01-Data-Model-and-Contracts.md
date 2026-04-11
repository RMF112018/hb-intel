# Prompt 01 — Data Model and Contracts

## Objective

Implement or normalize the explicit data contracts required for the People & Culture public webpart and the HR operating companion webpart.

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
- Preserve split boundaries between People & Culture and HB Kudos.
- Do not re-read files that are still within your current context window or memory unless you need to verify a specific uncertain detail.
- Preserve SPFx packaging discipline and shared import discipline.
- Prefer explicit strongly typed contracts over implicit scattered metadata.

## Scope

1. Content-family model
2. Lifecycle/state model
3. Approval trigger model
4. Audience model
5. Homepage-governance metadata
6. Media-source model
7. Milestone-candidate model
8. Role/permission model
9. Notification/intake metadata where required

## Instructions for the Agent

1. Introduce or normalize the required People & Culture contracts so they explicitly support:
   - Announcements
   - Celebrations / Milestones
   - Culture Programs / Events
2. Model the lifecycle views/states required by the decision register:
   - Draft
   - Needs Approval
   - Scheduled
   - Live
   - Expiring Soon
   - Expired
   - Archived
   - Suppressed
3. Model the approval trigger metadata needed to distinguish:
   - ordinary items
   - enterprise-wide / high-visibility items
   - pinned items requiring added approval
4. Add audience metadata that supports:
   - company-wide
   - targeted audiences
5. Add homepage-governance fields that support:
   - system default selection
   - HR override
   - feature/pin/order/conflict handling as supported by repo truth
6. Add media-source fields supporting:
   - profile-photo-first
   - explicit HR override
   - campaign/event artwork
7. Add milestone candidate/intake fields supporting:
   - auto-generated recurring milestones
   - HR review/edit/suppress/publish handling
8. Add role-related metadata needed for:
   - Editor
   - Approver/Admin
9. Add limited-intake metadata for designated non-HR submitters if required by repo truth.
10. Update normalizers/helpers/adapters so the public and companion surfaces can consume the new contracts safely.
11. Keep the contracts narrow and explicit; do not introduce loose “misc metadata” escape hatches unless strictly required.

## Deliverables

- updated contracts/types
- updated normalization/helper logic
- state and audience model support
- homepage/media/milestone metadata support
- implementation notes for any unresolved repo constraints

## Validation

- verify the state model is internally consistent
- verify public-surface consumers and companion consumers can read the contracts
- verify split boundaries between People & Culture and HB Kudos remain explicit
- verify no contract field silently collapses archived vs expired vs suppressed behavior

## Required Report Back

Return:
1. contracts introduced/updated
2. state and audience model implemented
3. homepage/media/milestone fields implemented
4. helper/normalizer changes made
5. remaining repo-truth constraints, if any
