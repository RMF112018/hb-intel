# Prompt 01 — Authority lock and Wave 1 execution rules

## Objective

Before making any implementation changes, lock the execution rules for Wave 1 so the work stays disciplined, repo-truth-driven, and limited to the correct scope.

## Source of truth

Repo:
- `https://github.com/RMF112018/hb-intel.git`

Branch:
- `main`

## Governing docs

You must read and follow:
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/ui-kit/Presentation-Lane-Standard.md`
- `docs/reference/ui-kit/README.md`

Treat these as binding authority for homepage-facing HB Kudos work.

## Files in scope

Public surface:
- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/PublicKudosSurface.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/ArchiveList.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosArticleReader.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosFeedBody.tsx` if present / used

Companion / shared seams:
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`
- `apps/hb-webparts/src/homepage/shared/KudosDetailPanelContent.tsx`

Context / validation seams:
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/HbKudosWebPart.manifest.json`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanionWebPart.manifest.json`

## Required execution behavior

### 1. Treat Wave 1 as a foundation wave
You are not doing general cleanup.
You are not doing the full public/companion architectural refactor.
You are correcting the doctrine and design-system foundation first.

### 2. Preserve all critical runtime seams
Do not break or casually redesign:
- webpart IDs
- manifest linkage
- mount registration
- SharePoint list binding
- role/capability behavior
- audit-event model
- host-safe SharePoint behavior

### 3. Keep the authored visual ambition
Do not “solve” compliance by flattening HB Kudos into bland enterprise cards.
The surface should remain presentation-lane, premium, and visibly authored.

### 4. Do not overreach into later waves
Avoid broader structural refactors except where a very narrow Wave 1 implementation dependency requires one.

### 5. Apply the approved homepage premium stack where relevant
Wave 1 is allowed to materially adopt the approved stack when that adoption directly helps:
- icon compliance
- variant systems
- surface consistency
- motion discipline
- maintainable styling architecture

## Guardrails

- Do not re-read files that are already in your current context or memory unless you need fresh verification or additional surrounding context.
- Do not introduce prohibited homepage imports.
- Do not perform a fake compliance pass that leaves the dominant local styling posture untouched.
- Do not make decorative changes without structural UI-system value.

## Deliverable

Before moving on, produce a concise internal execution note summarizing:
- the exact files you will touch in Wave 1
- what you will preserve
- what you will correct
- what you are explicitly not doing in Wave 1
