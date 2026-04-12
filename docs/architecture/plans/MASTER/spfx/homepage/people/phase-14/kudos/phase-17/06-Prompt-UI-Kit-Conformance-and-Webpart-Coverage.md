# 06 — Prompt: UI-Kit Conformance and Full Affected-Area Coverage

## Mission

Review the entire affected public-surface implementation area and ensure the compaction / overflow work is applied in the correct architectural seams and in conformance with ui-kit guidance.

## Why this prompt exists

The risk is not just bad styling.
The risk is **piecemeal webpart-local edits** that create drift from `@hbc/ui-kit`, leave neighboring elements out of sync, and weaken the Kudos surface as the model for other homepage webparts.

## Required rules

- Follow `@hbc/ui-kit` guidance and homepage/presentation-lane doctrine.
- If the homepage variant owns the affected treatment, update it there.
- If a local webpart composition owns the treatment, keep it token-driven and aligned with the ui-kit language.
- Do not leave half of the affected area on old sizing logic and half on new logic.

## Mandatory full-area review

The code agent must explicitly review and, where needed, adjust all affected areas touched by the vertical-compaction goal:

- `HbcPeopleCultureSurface` homepage variant sizing and rhythm
- hero band sizing
- hero CTA sizing/rhythm
- featured-card sizing/rhythm
- recent-section continuation styling
- archive-section continuation styling
- browse/feed continuation styling if impacted
- local webpart footer spacing
- public-surface action affordances and focus-visible consistency
- any test hooks needed for these changed visible areas

## Deliverables

- implementation note identifying which changes were made in ui-kit and which remained local, with justification
- confirmation that all directly affected elements were reviewed and addressed, not just the most obvious ones
- confirmation that no accidental override sprawl was introduced
