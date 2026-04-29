# UI Doctrine — Acceptance and Scoring Model

## Purpose

This model defines binding acceptance and scoring requirements for SPFx surfaces governed by UI doctrine.

It reuses current benchmark evidence assets under `docs/reference/spfx-surfaces/` while applying surface-appropriate rigor for homepage and non-homepage SPFx contexts.

## Governing sources

Primary doctrine sources:

- [UI Doctrine — SPFx Governing Standard](./UI-Doctrine-SPFx-Governing-Standard.md)
- [UI Doctrine — SPFx Homepage Overlay](./UI-Doctrine-SPFx-Homepage-Overlay.md) (homepage only)
- [UI Doctrine — SPFx Full-Page App and Widget Overlay](./UI-Doctrine-SPFx-Full-Page-App-Widget-Overlay.md) (non-homepage full-page/widget/PCC)

Current benchmark and evidence sources:

- `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-evidence.md`
- `docs/reference/spfx-surfaces/benchmark/**`

## 1. Applicability by surface type

### 1.1 Homepage surfaces

Homepage-specific categories and constraints apply only to homepage surfaces governed by the Homepage Overlay.

### 1.2 Full-page/PCC/widget surfaces

Full-page/PCC/widget surfaces do not inherit homepage-only evaluation constraints by default.

They must achieve equivalent rigor through:

- shell and host-fit quality
- command-center/workbench composition quality
- widget contract quality
- data confidence and seam discipline
- state-model completeness
- accessibility and keyboard quality
- breakpoint/container-fit behavior
- evidence-backed closure

## 2. Scoring scale

Use 0-4 per category:

- `0`: failing or non-credible
- `1`: materially weak
- `2`: acceptable but below benchmark intent
- `3`: strong and near benchmark intent
- `4`: benchmark-grade for the surface purpose

## 3. Scoring thresholds

- Maximum score: `56`.

### 3.1 Professional SPFx acceptance

- no category below `2` unless an explicit written exception is approved
- no unresolved doctrine violation
- no unresolved hard-stop failure

### 3.2 Serious SPFx surface acceptance

- `40+/56`
- no hard-stop failures
- hosted/runtime credibility proven where relevant
- evidence-backed closure

### 3.3 Flagship / benchmark-grade SPFx acceptance

- `48+/56`
- strong purpose-fit and productized surface identity
- credible breakpoint/container-fit behavior
- evidence-backed closure
- no hard-stop failures

### 3.4 Decision-critical SPFx acceptance

- numeric score alone is insufficient
- no hard-stop failures
- explicit data-confidence and failure-mode proof
- auditable and reproducible closure evidence

## 4. Acceptance labels and thresholds

### 4.1 Professional SPFx acceptance

- no category below 2 unless explicitly accepted exception
- no unresolved doctrine violation
- no unresolved hard-stop failure

### 4.2 Serious SPFx surface acceptance

- strong category consistency
- hosted/runtime credibility proven where relevant
- evidence-backed closure with clear risk notes

### 4.3 Flagship / benchmark-grade SPFx acceptance

- high-category consistency with minimal residual exceptions
- explicit proof of premium operational composition and stability
- benchmark-grade closure evidence

### 4.4 Decision-critical SPFx acceptance

- strictest enforcement tier
- explicit data confidence and failure-mode clarity
- no tolerated hard-stop failures
- closure evidence must be auditable and reproducible

## 5. Category framework

### 5.1 Shared baseline categories

All SPFx surface types must score:

1. doctrine and host compliance
2. interaction completeness
3. state-model completeness
4. data/contract and seam rigor
5. accessibility and keyboard quality
6. host/runtime resilience
7. validation and closure evidence

### 5.2 Homepage conditional categories

Apply only to homepage surfaces:

- homepage integration rhythm
- entry-stack fit
- homepage-specific composition constraints from overlay

### 5.3 Full-page/PCC/widget conditional categories

Apply only to non-homepage full-page/PCC/widget surfaces:

- command-center and workbench composition quality
- widget footprint/span/compact contract quality
- breakpoint and container-fit stability in operational layouts
- KPI/status/command zone clarity and hierarchy

Full-page/PCC/widget surfaces must map these equivalent non-homepage categories to the same 56-point rigor model used for doctrine-governed acceptance.

## 6. Hard-stop failures

The following failures block closure regardless of numeric score:

- critical accessibility failure
- unresolved host behavior violation
- fake shell duplication or host chrome competition
- broken or misleading primary interaction path
- missing required state handling for core flows
- ambiguous or unsafe seam ownership in core flows
- unscored or evidence-free “looks good” acceptance

High numeric scores cannot override hard-stop failures.

## 7. Evidence obligations

### 7.1 Required evidence

- scored category sheet
- doctrine compliance notes
- hosted/runtime proof where relevant
- explicit hard-stop failure checklist outcome
- closure statement with residual risk disclosure

### 7.2 Surface-specific evidence emphasis

- homepage: use current homepage checklist/scorecard/evidence artifacts directly
- full-page/PCC/widget: reuse same benchmark rigor and proof discipline, but map evidence to overlay-specific obligations rather than homepage-only constraints

## 8. Tiered enforcement application

Use stricter enforcement for:

- flagship surfaces
- high-risk operational surfaces
- decision-critical surfaces
- surfaces with material write-side or high-consequence workflows

Use standard professional enforcement for routine lower-risk surfaces, without relaxing doctrine compliance.
