# Prompt 02 — Final acceptance gates and closure standard

## Objective

Define and enforce the exact final acceptance standard that HB Kudos must meet before it can be considered closed, production-grade, and reference-quality.

## Files and seams governed by final acceptance

Public runtime and related seams:
- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/PublicKudosSurface.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/ArchiveList.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosArticleReader.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosFeedBody.tsx` if present / used

Companion runtime and shared seams:
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`
- `apps/hb-webparts/src/homepage/shared/KudosDetailPanelContent.tsx`

Shared behavior seams:
- `apps/hb-webparts/src/homepage/data/usePeopleCultureData.ts`
- `apps/hb-webparts/src/homepage/data/useSharePointPeopleSearch.ts`
- `apps/hb-webparts/src/homepage/data/useKudosComposer.ts`
- `apps/hb-webparts/src/homepage/data/peopleCultureSubmissionSource.ts`
- `apps/hb-webparts/src/homepage/data/kudosGovernanceWriter.ts`
- `apps/hb-webparts/src/homepage/webparts/kudosContracts.ts`

Runtime/package/validation seams:
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/HbKudosWebPart.manifest.json`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanionWebPart.manifest.json`
- `apps/dev-harness/src/tabs/KudosTab.tsx`
- `apps/dev-harness/src/harness/kudosHarness.ts`

## Required acceptance categories

### 1. Doctrine acceptance
HB Kudos must be verifiably compliant with the governing homepage doctrine.

### 2. Architecture acceptance
HB Kudos must no longer depend on oversized runtime containers or noisy shared seams in ways that undermine long-term maintainability.

### 3. Experience acceptance
The public and companion experiences must be coherent, clear, and productized.

### 4. Accessibility / interaction acceptance
The experience must have consistent focus, motion, control clarity, and content interaction behavior.

### 5. Host/runtime/package acceptance
The implementation must remain resilient in SharePoint-hosted conditions and preserve correct mount/manifest/package behavior.

### 6. Validation acceptance
Final closure must include real evidence from:
- lint
- typecheck
- relevant tests
- relevant harness/runtime checks
- packaging/runtime integrity verification

## Required implementation direction

### 1. Define acceptance gates concretely
Do not rely on vague language like “looks good” or “seems stable.”
Make the closure standard explicit and checkable.

### 2. Require evidence
Every final-closure claim must be backed by:
- repo truth
- real checks
- real runtime/package validation
- explicit regression verification against prior waves

### 3. Declare non-closure conditions
Define what must block closure, such as:
- doctrine regression
- package/runtime linkage regression
- unresolved host-safe breakage
- unverified stability
- remaining major audit-category defects

## Constraints

- Do not invent fake proof.
- Do not reduce acceptance to compilation-only.
- Do not skip runtime/package verification because other checks passed.

## Guardrails

- Do not re-read files that are already in your current context or memory unless you need fresh verification or additional surrounding context.
- Do not declare final closure while any major earlier-wave category has regressed.
- Do not allow “mostly done” language to substitute for an actual closure decision.

## Deliverable

Produce a final HB Kudos acceptance matrix that includes:
- each acceptance category
- specific pass/fail gates
- required evidence type
- conditions that block closure
- explicit final closure decision standard
