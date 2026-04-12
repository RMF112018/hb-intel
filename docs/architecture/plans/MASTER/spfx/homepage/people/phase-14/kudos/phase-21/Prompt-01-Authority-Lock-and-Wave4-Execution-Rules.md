# Prompt 01 — Authority lock and Wave 4 execution rules

## Objective

Lock the execution rules for Wave 4 so the final closure work is disciplined, preserves prior-wave improvements, and focuses on containment, proof, and release-grade confidence.

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

Treat Wave 1, Wave 2, and Wave 3 decisions as locked unless a narrowly scoped Wave 4 correction requires a minimal supporting adjustment.

## Files in scope

Public runtime and experience seams:
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

Runtime / packaging / validation seams:
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/HbKudosWebPart.manifest.json`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanionWebPart.manifest.json`
- `apps/dev-harness/src/tabs/KudosTab.tsx`
- `apps/dev-harness/src/harness/kudosHarness.ts`

## Required execution behavior

### 1. Treat Wave 4 as a containment-and-proof wave
You are not doing open-ended product work.
You are:
- reducing remaining drift risk
- verifying model-grade quality
- tightening validation
- preserving correct runtime/manifest seams

### 2. Preserve prior-wave decisions
Do not casually reopen:
- doctrine/design-system work
- major structural refactors
- cohesion/accessibility improvements

### 3. Preserve correct runtime/package seams
Registration and manifest adjacency are correct.
Treat them as seams to preserve and verify, not as opportunities for speculative change.

### 4. Demand proof, not assertion
Final closure must be demonstrated through real validation and explicit checks, not a narrative claim.

## Guardrails

- Do not re-read files that are already in your current context or memory unless you need fresh verification or additional surrounding context.
- Do not collapse split runtimes just to reduce conceptual complexity.
- Do not ship a “final closure” package with weak or partial validation.
- Do not destabilize packaged/runtime SharePoint behavior.

## Deliverable

Before moving on, produce a concise internal execution note summarizing:
- exact files and seams to change in Wave 4
- what earlier-wave decisions remain locked
- what runtime/package seams must remain intact
- how proof of closure will be demonstrated
