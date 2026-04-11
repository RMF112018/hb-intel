# 04 — Prompt: Archive and Browse Refinement

You are working in the live repo at:

- `https://github.com/RMF112018/hb-intel.git`

## Objective

Refine the public-facing HB Kudos archive/browse zone so it feels like a deliberate secondary homepage layer rather than a compressed footer appendage.

## Mandatory scope

Audit and remediate at minimum:

- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- any related shared surface/footer spacing that materially affects the public browse zone

## Required outcomes

- archive/search zone feels intentional and usable
- search field sizing is appropriate for the module width
- the visual rhythm from featured recognition into archive feels smoother
- browse content remains secondary, but no longer feels starved
- the module remains balanced at 100% zoom

## Required implementation direction

Review and adjust:

- archive heading spacing
- archive search width
- transition spacing between featured stack and archive area
- archive row visual weight
- browse-zone usability at standard desktop zoom

## Explicit prohibitions

Do not:
- turn the archive into a dominant primary zone
- compensate for unresolved shared surface defects by over-expanding the archive
- leave the search input artificially undersized if the module width can support better sizing

## Deliverables

Return:
- files changed
- archive/search improvements made
- explanation of the final hierarchy between featured recognition and browse/archive
