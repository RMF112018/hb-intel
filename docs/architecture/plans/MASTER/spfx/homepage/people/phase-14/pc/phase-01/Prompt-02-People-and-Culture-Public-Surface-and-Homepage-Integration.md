# Prompt 02 — People & Culture Public Surface and Homepage Integration

## Objective

Implement or reconcile the dedicated People & Culture public webpart so it reflects the locked non-recognition product boundary and consumes companion-driven governance safely.

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
- Do not let the public People & Culture surface drift back into ownership of Kudos.
- Do not re-read files that are still within your current context window or memory unless you need to verify a specific uncertain detail.
- Preserve SPFx packaging discipline and shared import discipline.
- Prefer strong composition, clear hierarchy, and explicit homepage-governance integration over flat feed behavior.

## Scope

1. Dedicated People & Culture public webpart boundary
2. Feature/supporting hierarchy
3. Audience-aware rendering
4. Profile-photo-first and media-aware rendering
5. Homepage-governance integration
6. Empty/sparse/fallback resilience

## Instructions for the Agent

1. Confirm the public People & Culture webpart is distinct from HB Kudos in both ownership and composition.
2. Update or refine the public surface so it supports:
   - announcements
   - celebrations / milestones
   - broader culture programs/events
3. Ensure the public surface reads the governance model required by the companion:
   - system-default featured/supporting selection
   - HR override when present
4. Implement or refine feature/supporting hierarchy so the surface does not degrade into a generic flat list.
5. Implement profile-photo-first rendering for person-based items with correct fallback and override support.
6. Support campaign/event artwork for non-person culture programming.
7. Honor audience targeting so viewers only see relevant items.
8. Preserve strong empty/loading/authoring-safe behavior.
9. Remove or isolate any lingering Kudos coupling from the final People & Culture public runtime.

## Deliverables

- refined public People & Culture runtime
- audience-aware homepage hierarchy behavior
- profile-photo/media rendering improvements
- clarified split boundary from HB Kudos

## Validation

- verify the public surface no longer acts as the merged People & Culture / Kudos end-state
- verify featured/supporting behavior works with and without HR overrides
- verify person-photo and non-person media behavior
- verify audience-targeted items do not leak to irrelevant viewers

## Required Report Back

Return:
1. public-surface changes implemented
2. homepage-governance integration implemented
3. media/profile-photo behavior implemented
4. audience and sparse-state validation performed
5. known remaining public-surface gaps
