# Prompt 01 — Authority lock and Wave 3 execution rules

## Objective

Lock the execution rules for Wave 3 so the work improves cohesion, accessibility consistency, interaction clarity, and host-safe reliability without undoing prior-wave structure.

## Source of truth

Repo:
- `https://github.com/RMF112018/hb-intel.git`

Branch:
- `main`

## Governing docs

You must continue to follow:
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/ui-kit/Presentation-Lane-Standard.md`
- `docs/reference/ui-kit/README.md`

Treat Wave 1 and Wave 2 decisions as locked unless a narrow Wave 3 correction requires a minimal supporting adjustment.

## Files in scope

Public experience:
- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/PublicKudosSurface.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/ArchiveList.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosArticleReader.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosFeedBody.tsx` if present / used

Companion experience:
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`

Shared local UI seams:
- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`
- `apps/hb-webparts/src/homepage/shared/KudosDetailPanelContent.tsx`

## Required execution behavior

### 1. Treat Wave 3 as an experience-quality wave
You are improving:
- public experience cohesion
- flyout/body consistency
- accessibility systemization
- companion control clarity
- host-safe reliability

### 2. Preserve prior-wave structure
Do not casually reopen Wave 1 or Wave 2 decisions.
Preserve:
- doctrine/design-system corrections
- icon/token/variant posture
- extracted runtime boundaries and productization improvements

### 3. Preserve authored presentation quality
Do not reduce richness or hierarchy to make the UI simpler.
Wave 3 should improve clarity without flattening the experience.

### 4. Stay within Wave 3
Do not drift into final aggregate production-readiness closure or unrelated runtime re-architecture.

## Guardrails

- Do not re-read files that are already in your current context or memory unless you need fresh verification or additional surrounding context.
- Do not replace a cohesive improvement with a large speculative redesign.
- Do not break harness/runtime assumptions.
- Do not remove host protections without a better replacement.

## Deliverable

Before moving on, produce a concise internal execution note summarizing:
- exact files to change in Wave 3
- what prior-wave decisions remain locked
- what parts of the experience will be harmonized
- what is explicitly not part of Wave 3
