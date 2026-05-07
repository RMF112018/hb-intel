# Prompt 03 — PCC Scorecard Traceability and Hard-Stop Model

## Role

You are the local code agent implementing **Prompt 03** for the PCC 100-Point UI/UX Mold Breaker Scorecard evidence automation track in the `RMF112018/hb-intel` repository.

You are implementing **scorecard pillar models, hard-stop models, evidence-to-scorecard traceability maps, and manual scoring worksheet data structures only**.

You are **not** running live tenant evidence capture, not calculating a final 100-point score, not marking hard stops as passed/failed based on incomplete evidence, and not modifying PCC runtime/source code.

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

---

## Critical Context

Prompt 01 established the PCC live SharePoint Playwright harness foundation.

Prompt 02 established:

```text
e2e/pcc-live/pcc-evidence.types.ts
e2e/pcc-live/pcc-evidence.registry.ts
e2e/pcc-live/pcc-evidence.manifest.ts
e2e/pcc-live/pcc-evidence.registry.spec.ts
```

Prompt 02 follow-up corrected:

1. `REQUIRED_PCC_EVIDENCE_IDS` is now an explicit 80-item literal tuple.
2. `PccEvidenceId` is a strict EV ID union.
3. Manifest artifact sanitization excludes raw Playwright/auth/session artifact paths.
4. Curated evidence paths remain repo-visible.

Current known Prompt 02 issue to address in Prompt 03:

- Prompt 02 registry entries currently use broad foundation-level scorecard mappings; many records are mapped generically to `pillarRefs: ['P1', 'P2']`.
- Prompt 03 must formalize the authoritative scorecard pillar and hard-stop models and generate traceability maps that can be used to review/refine evidence mappings without creating a false final score.

The attached Prompt 03 objective was:

```text
Implement scorecard pillar and hard-stop mapping modules. Generate pillar evidence map and hard-stop evidence map. Include scoring worksheet data structures but leave scoring values empty/manual unless explicit automated gates apply.
```

This updated prompt expands that objective into a deterministic, testable implementation contract.

---

## Governing References

Use current repo truth from these references:

```text
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard_v2.md
docs/explanation/design-decisions/con-tech-ui-study.md
docs/explanation/design-decisions/con-tech-ux-study.md
docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md
docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md
e2e/pcc-live/pcc-evidence.types.ts
e2e/pcc-live/pcc-evidence.registry.ts
e2e/pcc-live/pcc-evidence.manifest.ts
e2e/pcc-live/pcc-evidence.registry.spec.ts
```

Critical distinction:

```text
Automate evidence traceability and reproducibility.
Do not automatically calculate the final 100-point score.
Final scoring remains expert-review-only unless a future prompt defines a narrowly bounded automated gate.
```

---

## Repo-Truth Gate Before Editing

Before editing, verify the current checkout has Prompt 02 follow-up content.

Run/inspect enough to confirm:

```bash
git status --short
test -f e2e/pcc-live/pcc-evidence.types.ts
test -f e2e/pcc-live/pcc-evidence.registry.ts
test -f e2e/pcc-live/pcc-evidence.manifest.ts
test -f e2e/pcc-live/pcc-evidence.registry.spec.ts
test -f docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard_v2.md
```

Inspect the relevant current implementation only as needed:

```bash
sed -n '1,220p' e2e/pcc-live/pcc-evidence.types.ts
sed -n '1,260p' e2e/pcc-live/pcc-evidence.registry.ts
sed -n '1,260p' docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard_v2.md
```

Stop and report if:

- `REQUIRED_PCC_EVIDENCE_IDS` is not an explicit literal tuple.
- `PccEvidenceId` appears widened to `string`.
- Prompt 02 files are missing.
- The scorecard file is missing.
- Existing scorecard traceability/model files already exist and conflict with this design.

---

## Objective

Implement deterministic scorecard traceability structures that map:

1. Scorecard pillars to evidence IDs.
2. Hard-stop gates to evidence IDs.
3. Evidence IDs to scorecard pillars and hard stops.
4. Scorecard worksheet rows to manual scoring placeholders.
5. Hard-stop worksheet rows to manual status placeholders.

The implementation must provide enough structure for future prompts and fresh-session auditors to understand whether each pillar and hard stop has evidence coverage, without implying that a final score or readiness decision has been reached.

---

## Required Files To Add

Create these files unless repo truth shows equivalent files already exist:

```text
e2e/pcc-live/pcc-scorecard.types.ts
e2e/pcc-live/pcc-scorecard.model.ts
e2e/pcc-live/pcc-scorecard.traceability.ts
e2e/pcc-live/pcc-scorecard.traceability.spec.ts
```

Update these existing files only if needed:

```text
e2e/pcc-live/README.md
package.json
```

Optionally update:

```text
e2e/pcc-live/pcc-evidence.registry.ts
```

Only update `pcc-evidence.registry.ts` if the prompt needs to replace overly broad placeholder pillar/hard-stop mappings with the more precise mappings defined in the new traceability module.

Do not add committed evidence run artifacts.

---

## Files Allowed To Modify

Allowed:

```text
e2e/pcc-live/pcc-scorecard.types.ts
e2e/pcc-live/pcc-scorecard.model.ts
e2e/pcc-live/pcc-scorecard.traceability.ts
e2e/pcc-live/pcc-scorecard.traceability.spec.ts
e2e/pcc-live/pcc-evidence.registry.ts
e2e/pcc-live/README.md
package.json
```

`package.json` may be modified only if adding an opt-in scorecard traceability validation script.

Do not modify:

```text
apps/project-control-center/src/**
apps/project-control-center/package.json
apps/project-control-center/config/**
apps/project-control-center/src/webparts/**
pnpm-lock.yaml
playwright.config.ts
playwright.kudos-live.config.ts
playwright.homepage-live.config.ts
playwright.pcc-live.config.ts
e2e/pcc-live/pcc-live.env.ts
e2e/pcc-live/pcc-live.runtime.spec.ts
e2e/pcc-live/pcc-evidence.manifest.ts
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard_v2.md
docs/explanation/design-decisions/**
docs/reference/ui-kit/doctrine/**
packages/**
backend/**
.gitignore
```

If a forbidden file appears necessary, stop and report instead of editing.

---

## Scorecard Pillar Model Requirements

Define the 9 scorecard pillars from the governing scorecard.

Create typed IDs:

```ts
export type PccScorecardPillarId =
  | 'P1'
  | 'P2'
  | 'P3'
  | 'P4'
  | 'P5'
  | 'P6'
  | 'P7'
  | 'P8'
  | 'P9';
```

Define a strict ordered tuple:

```ts
export const PCC_SCORECARD_PILLAR_IDS = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9'] as const;
```

Each pillar model must include:

```ts
id
title
weight
purpose
manualScoringRequired
scorecardSectionRef
sourceRefs
```

The weights must total exactly 100:

```text
P1 = 15
P2 = 20
P3 = 12
P4 = 12
P5 = 12
P6 = 10
P7 = 8
P8 = 6
P9 = 5
```

Pillar titles must match the governing scorecard:

```text
P1 — PCC Product Strategy and Command-Center Clarity
P2 — Construction-Tech Mold Breaker Differentiation
P3 — Shell, Navigation, and Project Context
P4 — Layout, Bento, Card Hierarchy, and Density
P5 — Workflow, Interaction, and Next-Action Clarity
P6 — State Model, Read-Only, Preview, Degraded, and Source Confidence
P7 — Responsive, Field, Touch, and Host-Fit Behavior
P8 — Accessibility, Visual Semantics, and Inclusive Use
P9 — Evidence, Validation, and Phase 4 Readiness
```

Every pillar should default to `manualScoringRequired: true`.

Do not add numeric score values.

---

## Hard-Stop Model Requirements

Define the 10 hard-stop gates from the governing scorecard.

Create typed IDs:

```ts
export type PccHardStopId =
  | 'HS-01'
  | 'HS-02'
  | 'HS-03'
  | 'HS-04'
  | 'HS-05'
  | 'HS-06'
  | 'HS-07'
  | 'HS-08'
  | 'HS-09'
  | 'HS-10';
```

Define a strict ordered tuple:

```ts
export const PCC_HARD_STOP_IDS = [
  'HS-01',
  'HS-02',
  'HS-03',
  'HS-04',
  'HS-05',
  'HS-06',
  'HS-07',
  'HS-08',
  'HS-09',
  'HS-10',
] as const;
```

Each hard-stop model must include:

```ts
id
title
failure
blocksPhase4
manualReviewRequired
scorecardSectionRef
sourceRefs
```

All hard stops must have:

```ts
blocksPhase4: true
manualReviewRequired: true
```

Hard-stop failures must map to the scorecard:

```text
HS-01 Incumbent mimicry failure
HS-02 Command-center failure
HS-03 Cognitive-overload failure
HS-04 False-affordance failure
HS-05 Field-office divergence failure
HS-06 State-model failure
HS-07 Accessibility failure
HS-08 SharePoint host-fit failure
HS-09 Evidence failure
HS-10 HBI authority failure
```

Do not infer pass/fail status in Prompt 03.

---

## Worksheet Model Requirements

Create manual worksheet data structures, not scoring outputs.

Recommended worksheet types:

```ts
export type PccManualScoreValue = null;

export type PccHardStopReviewStatus =
  | 'manual-review-required'
  | 'operator-pending'
  | 'passed'
  | 'failed'
  | 'not-applicable';

export interface PccScorecardWorksheetRow {
  pillarId: PccScorecardPillarId;
  title: string;
  weight: number;
  manualScore: null;
  automatedScore: null;
  scoringOwner: 'expert-review';
  evidenceIds: PccEvidenceId[];
  notes: string;
}

export interface PccHardStopWorksheetRow {
  hardStopId: PccHardStopId;
  title: string;
  blocksPhase4: true;
  reviewStatus: 'manual-review-required';
  evidenceIds: PccEvidenceId[];
  notes: string;
}
```

Rules:

- `manualScore` must be `null`.
- `automatedScore` must be `null`.
- No row may include a numeric score.
- No hard-stop row may default to `passed` or `failed`.
- `scoringOwner` must be `expert-review`.
- Every worksheet row must include evidence IDs from the Prompt 02 registry.

---

## Traceability Map Requirements

Create traceability functions in:

```text
e2e/pcc-live/pcc-scorecard.traceability.ts
```

Required exports:

```ts
export function buildPccPillarEvidenceMap(registry: readonly PccEvidenceRecord[]): PccPillarEvidenceMap;

export function buildPccHardStopEvidenceMap(registry: readonly PccEvidenceRecord[]): PccHardStopEvidenceMap;

export function buildPccEvidenceScorecardMap(registry: readonly PccEvidenceRecord[]): PccEvidenceScorecardMap;

export function buildPccScorecardWorksheet(registry: readonly PccEvidenceRecord[]): PccScorecardWorksheetRow[];

export function buildPccHardStopWorksheet(registry: readonly PccEvidenceRecord[]): PccHardStopWorksheetRow[];

export function getPccScorecardTraceabilityCoverage(registry: readonly PccEvidenceRecord[]): PccScorecardTraceabilityCoverage;
```

Map requirements:

1. Every pillar `P1..P9` must appear in the pillar evidence map.
2. Every hard stop `HS-01..HS-10` must appear in the hard-stop evidence map.
3. Every evidence ID must map back to its pillar/hard-stop refs.
4. Every pillar must have at least one evidence ID.
5. Every hard stop should have at least one evidence ID. If a hard stop does not yet have evidence coverage, the coverage result must identify it as a gap and the tests should fail unless explicitly accepted in the test as a known gap. Prefer full coverage.
6. No unknown pillar refs are allowed.
7. No unknown hard-stop refs are allowed.
8. No evidence ID outside the strict Prompt 02 required ID set may appear.

---

## Evidence Registry Mapping Refinement

Prompt 02 registry may still contain overly broad placeholder mapping.

Prompt 03 should update `e2e/pcc-live/pcc-evidence.registry.ts` to align with the new pillar/hard-stop model if needed.

Minimum mapping standard:

- Every EV record must retain at least one pillar.
- Every pillar `P1..P9` must be represented by at least one EV.
- Every hard stop `HS-01..HS-10` must be represented by at least one EV.
- EV-52 through EV-58 should retain `HS-08` and/or `HS-09` where relevant.
- Closure EVs should retain `HS-09` and may map to other hard stops only where justified.
- Accessibility EVs should map to `HS-07`, not only cognitive-overload.
- State model EVs should map to `HS-06`.
- Read-only/false-affordance EVs should map to `HS-04`.
- HBI authority / content-language EVs should map to `HS-10`.
- Host-fit / responsive evidence should map to `HS-05` and/or `HS-08`.
- Evidence completeness / reproducibility should map to `HS-09`.

Use broad but meaningful mapping; do not overfit every EV to every hard stop.

Suggested pillar coverage bands:

```text
EV-37..43  -> P9, plus relevant P1/P2/P8 where doctrine/source supports it
EV-44..51  -> P2, plus P1/P5 where mold-breaker/operational clarity applies
EV-52..58  -> P3, P7, P9
EV-59..68  -> P1, P3, P4, P5
EV-69..76  -> P4, P7, P8
EV-77..84  -> P8
EV-85..92  -> P5, P6
EV-93..99  -> P6
EV-100..106 -> P6, P9
EV-125..134 -> P9
```

Suggested hard-stop coverage bands:

```text
HS-01 -> EV-44..51, EV-59..68
HS-02 -> EV-37..43, EV-59..68, EV-85..92
HS-03 -> EV-59..76
HS-04 -> EV-85..92, EV-93..99
HS-05 -> EV-69..76
HS-06 -> EV-93..99, EV-100..106
HS-07 -> EV-77..84
HS-08 -> EV-52..58, EV-69..76
HS-09 -> EV-37..43, EV-52..58, EV-125..134
HS-10 -> EV-85..92, EV-100..106, EV-125..134
```

If using helper functions to derive these mappings by EV number, keep the logic explicit, tested, and easy to audit.

---

## Model File Requirements

Create:

```text
e2e/pcc-live/pcc-scorecard.model.ts
```

It should export:

```ts
PCC_SCORECARD_PILLARS
PCC_HARD_STOPS
getPccScorecardPillarById
getPccHardStopById
getPccTotalScorecardWeight
```

Requirements:

- `PCC_SCORECARD_PILLARS` length = 9.
- `PCC_HARD_STOPS` length = 10.
- total pillar weight = 100.
- all hard stops block Phase 4.
- lookup functions return the matching model or `undefined`.

---

## Type File Requirements

Create:

```text
e2e/pcc-live/pcc-scorecard.types.ts
```

It should include:

```text
pillar ID and hard-stop ID tuples/unions
pillar model interface
hard-stop model interface
pillar evidence map type
hard-stop evidence map type
evidence-to-scorecard map type
worksheet row types
traceability coverage result type
manual scoring null types
manual review status type
```

Keep types dependency-light. Import `PccEvidenceId`, `PccEvidenceRecord`, `PccScorecardPillarRef`, and `PccHardStopRef` from Prompt 02 types only where useful.

Avoid duplicating incompatible pillar/hard-stop union definitions if possible. If new `PccScorecardPillarId` / `PccHardStopId` types are defined, they must be assignable to the existing Prompt 02 `PccScorecardPillarRef` / `PccHardStopRef` types.

---

## Test Requirements

Create:

```text
e2e/pcc-live/pcc-scorecard.traceability.spec.ts
```

Tests must not require live tenant env, storageState, or live SharePoint access.

Required assertions:

1. Pillar model contains exactly 9 pillars.
2. Pillar IDs are exactly `P1..P9`.
3. Pillar weights total exactly 100.
4. Every pillar has title, purpose, sourceRefs, and manual scoring required.
5. Hard-stop model contains exactly 10 hard stops.
6. Hard-stop IDs are exactly `HS-01..HS-10`.
7. Every hard stop has title, failure, sourceRefs, `blocksPhase4: true`, and manual review required.
8. Pillar evidence map contains every pillar.
9. Every pillar maps to at least one EV.
10. Hard-stop evidence map contains every hard stop.
11. Every hard stop maps to at least one EV.
12. Evidence-to-scorecard map contains all 80 EV IDs.
13. No evidence-to-scorecard map entry contains unknown pillar IDs.
14. No evidence-to-scorecard map entry contains unknown hard-stop IDs.
15. Scorecard worksheet has 9 rows.
16. Scorecard worksheet rows have `manualScore: null`, `automatedScore: null`, and `scoringOwner: 'expert-review'`.
17. No worksheet row contains a numeric score.
18. Hard-stop worksheet has 10 rows.
19. Hard-stop worksheet rows have `reviewStatus: 'manual-review-required'`.
20. No hard-stop worksheet row defaults to `passed` or `failed`.
21. Traceability coverage reports no missing pillars or hard stops.
22. Traceability coverage reports all 80 evidence IDs represented.
23. Existing Prompt 02 registry guard still passes.

---

## Optional Root Script

If materially useful, add this opt-in root script:

```json
"pcc:e2e:scorecard:traceability": "playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-scorecard.traceability.spec.ts"
```

Do not wire this script into:

```text
test
e2e
build
CI
Turbo defaults
```

Do not modify `pnpm-lock.yaml`.

If `package.json` is not changed, omit it from changed files and validation targets.

---

## README Update Requirements

Update `e2e/pcc-live/README.md` with a concise Prompt 03 section only if useful.

Include:

```text
scorecard pillar/hard-stop model purpose
manual scoring boundary
traceability map purpose
how to run traceability validation
not-final-scoring disclaimer
```

Do not remove Prompt 01/Prompt 02 safety posture.

---

## Validation Commands

Run and report:

```bash
git status --short
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-scorecard.traceability.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-evidence.registry.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts --list
pnpm exec prettier --check --ignore-unknown e2e/pcc-live package.json
git diff --check
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
```

If `package.json` is not changed, it is acceptable to omit `package.json` from the Prettier target.

---

## Acceptance Criteria

Prompt 03 is complete only when:

- 9 scorecard pillars are modeled.
- 10 hard stops are modeled.
- pillar weights total 100.
- all hard stops block Phase 4.
- every pillar maps to at least one EV.
- every hard stop maps to at least one EV.
- all 80 EV IDs appear in the evidence-to-scorecard map.
- no unknown pillar/hard-stop/evidence IDs appear.
- scorecard worksheet rows exist but have no numeric scores.
- hard-stop worksheet rows exist but do not default to pass/fail.
- manual scoring and manual hard-stop review boundaries are explicit.
- Prompt 02 registry tests still pass.
- no live tenant run is required.
- no EV is marked `captured`.
- no final 100-point score is calculated or implied.
- no raw Playwright/auth/session artifacts are generated or committed.
- curated evidence path remains repo-visible and is not ignored.
- no PCC runtime/source files are modified.
- `pnpm-lock.yaml` is unchanged.

---

## Stop Conditions

Stop and report instead of continuing if:

- Prompt 02 strict ID tuple is missing.
- Prompt 02 registry/writer tests fail before your changes.
- Existing scorecard traceability files conflict with this design.
- Implementation requires PCC runtime/source edits.
- `pnpm-lock.yaml` changes.
- Any worksheet or model calculates or implies final score.
- Any hard-stop model defaults to `passed` or `failed`.
- Any writer/test would serialize secrets, cookies, storageState, raw traces, raw videos, raw Playwright outputs, or unsanitized console output.
- Any implementation attempts live tenant execution.
- Curated evidence paths are added to `.gitignore`.

---

## Required Closeout Response

Return exactly this structure:

```markdown
Prompt completed.

Files changed:
- <path>
- <path>

Validation:
- `git status --short` — <result>
- `pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-scorecard.traceability.spec.ts` — <result>
- `pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-evidence.registry.spec.ts` — <result>
- `pnpm exec playwright test --config=playwright.pcc-live.config.ts --list` — <result>
- `pnpm exec prettier --check --ignore-unknown e2e/pcc-live package.json` — <result or adjusted command with reason>
- `git diff --check` — <result>
- `pnpm --filter @hbc/spfx-project-control-center check-types` — <result>
- `pnpm --filter @hbc/spfx-project-control-center test` — <result>

Evidence / scorecard impact:
- Scorecard pillar model established for P1..P9.
- Hard-stop model established for HS-01..HS-10.
- Pillar evidence map generated.
- Hard-stop evidence map generated.
- Manual worksheet structures created without score values.
- No final 100-point score calculated.

Safety confirmation:
- No tenant mutation.
- No live tenant run required.
- No storageState committed.
- No raw Playwright artifacts committed.
- No PCC runtime source modified.
- `pnpm-lock.yaml` unchanged.
- No EV marked captured.
- No hard stop marked passed/failed.

Residual risks or pending items:
- <items>
```
