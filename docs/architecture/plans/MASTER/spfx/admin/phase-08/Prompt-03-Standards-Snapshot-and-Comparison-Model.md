# Prompt-03 — Standards Snapshot and Comparison Model

## Objective

Implement or formalize the standards snapshot and comparison model needed for SharePoint control so drift detection and preview / repair flows compare real SharePoint posture against a stable, explainable standards view.

## Important execution rules

- Extend existing repo contracts if suitable instead of inventing parallel models.
- Do not hard-wire Phase 10 live-governance assumptions unless the repo already requires compatible extension points.
- Keep the model versionable and traceable.

## Inputs

Use:
- the Phase 8 audit and baseline
- existing shared admin run / audit / config models
- any existing SharePoint standards or provisioning standards contracts already present

## Scope of work

Create or update the smallest correct contract / model surfaces needed for:

- managed asset identifiers
- standards snapshot resolution
- standards version / provenance references
- normalized actual-posture capture
- drift categories / severities
- comparison result summaries
- preview / repair eligibility flags

## Expected artifact areas

Touch the correct repo locations based on current architecture, for example:
- shared admin model packages
- backend/functions shared contracts
- docs under `docs/architecture/plans/MASTER/spfx/admin/phase-8/`

## Required documentation output

Create:
- `docs/architecture/plans/MASTER/spfx/admin/phase-8/admin-spfx-phase-8-standards-comparison-model.md`

Document:
1. model purpose
2. contract surfaces
3. provenance / versioning behavior
4. comparison rules
5. limitations / future-extension notes
6. validation strategy

## Implementation requirements

The model must support at least:
- one managed asset target
- one standards snapshot
- one actual observed posture snapshot
- one normalized drift result
- one operator-facing summary suitable for SPFx display
- one backend-facing detail payload suitable for preview / repair execution

## Validation

Run the smallest targeted validation required for the touched contract/code surfaces.

Document:
- what was verified,
- what was not run,
- and why that set was sufficient.

## Completion condition

Stop after the model surfaces and the supporting doc are complete.
Do not yet implement the full drift workflow in this prompt.
