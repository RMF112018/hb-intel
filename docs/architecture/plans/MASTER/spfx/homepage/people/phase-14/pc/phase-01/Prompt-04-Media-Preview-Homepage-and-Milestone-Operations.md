# Prompt 04 — Media, Preview, Homepage, and Milestone Operations

## Objective

Implement the locked media, preview, homepage-composition, and recurring-milestone operational behavior for People & Culture.

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
- Prefer explicit preview/governance flows over hidden inference.
- Do not re-read files that are still within your current context window or memory unless you need to verify a specific uncertain detail.
- Preserve SPFx packaging discipline and shared import discipline.

## Scope

1. Profile-photo-first media behavior
2. Media override handling
3. Multi-context preview
4. Homepage composition operations
5. Recurring milestone auto-generation into HR review
6. Conflict handling for pinned/featured composition

## Instructions for the Agent

1. Implement profile-photo-first media sourcing for person-based People & Culture items.
2. Add explicit HR override support for:
   - uploaded custom image
   - campaign/event artwork
   - no-image state, if supported by final schema
3. Surface the active media source clearly in the companion editor/UI.
4. Implement multi-context preview supporting:
   - item-level preview
   - public People & Culture webpart preview
   - featured vs supporting view
   - desktop/mobile preview where practical in repo truth
5. Implement the Homepage view operations required to:
   - inspect featured/supporting composition
   - manage overrides
   - detect conflicts
   - validate pinning/high-visibility implications
6. Implement recurring milestone candidate generation into an HR review flow.
7. Ensure HR can edit/suppress/schedule/feature/publish milestone candidates.
8. Keep all operations aligned with the approval model for pinned/high-visibility items.

## Deliverables

- media-source runtime
- preview runtime
- homepage-governance runtime
- milestone candidate flow
- conflict handling for homepage composition

## Validation

- verify people-photo fallback and override behavior
- verify campaign/event artwork flow
- verify preview reflects homepage hierarchy meaningfully
- verify recurring milestones do not bypass HR review
- verify pinned/high-visibility conflicts are surfaced appropriately

## Required Report Back

Return:
1. media behavior implemented
2. preview behavior implemented
3. homepage operations implemented
4. milestone operations implemented
5. remaining unresolved edge cases, if any
