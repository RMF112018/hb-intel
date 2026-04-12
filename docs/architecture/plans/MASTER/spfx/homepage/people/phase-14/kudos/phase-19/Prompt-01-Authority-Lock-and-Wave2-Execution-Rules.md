# Prompt 01 — Authority lock and Wave 2 execution rules

## Objective

Lock the execution rules for Wave 2 so the refactor stays disciplined, preserves Wave 1 gains, and improves the UI-layer architecture without becoming a broad product rewrite.

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

Treat Wave 1 doctrine decisions as locked.
Wave 2 is not allowed to undo them.

## Files in scope

Public runtime:
- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/PublicKudosSurface.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/ArchiveList.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosArticleReader.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosFeedBody.tsx` if present / used

Companion runtime:
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`

Shared UI / behavior seams:
- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`
- `apps/hb-webparts/src/homepage/shared/KudosDetailPanelContent.tsx`
- `apps/hb-webparts/src/homepage/data/usePeopleCultureData.ts`
- `apps/hb-webparts/src/homepage/data/useSharePointPeopleSearch.ts`
- `apps/hb-webparts/src/homepage/data/useKudosComposer.ts`
- `apps/hb-webparts/src/homepage/data/peopleCultureSubmissionSource.ts`
- `apps/hb-webparts/src/homepage/data/kudosGovernanceWriter.ts`
- `apps/hb-webparts/src/homepage/webparts/kudosContracts.ts`

## Required execution behavior

### 1. Treat Wave 2 as a structural/productization wave
You are not doing broad visual polish for its own sake.
You are improving:
- component boundaries
- orchestration discipline
- shared seam clarity
- local product-surface rigor
- maintainability

### 2. Preserve core runtime invariants
Do not break or casually redesign:
- manifest IDs
- mount wiring
- SharePoint list binding
- role/capability semantics
- audit-event semantics
- dev-harness runtime assumptions

### 3. Preserve authored presentation-lane quality
Do not simplify the public surface into polite enterprise filler.
Do not strip the companion of its operational richness.

### 4. Improve structure without rewriting behavior
If a behavior already works and fits the product model, preserve it.
Wave 2 is not a pretext for speculative workflow redesign.

### 5. Stop cleanly at Wave 2
Do not drift into broad accessibility closure or later-wave experience harmonization except where a narrow Wave 2 dependency requires minor supporting work.

## Guardrails

- Do not re-read files that are already in your current context or memory unless you need fresh verification or additional surrounding context.
- Do not keep oversized containers intact if clear extraction boundaries exist.
- Do not invent abstractions that hide the runtime model instead of clarifying it.
- Do not break the harness or SharePoint host behavior.

## Deliverable

Before moving on, produce a concise internal execution note summarizing:
- exact files to change in Wave 2
- what Wave 1 decisions are locked and must remain intact
- what structures will be extracted or reorganized
- what is explicitly not part of Wave 2
