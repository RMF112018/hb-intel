# 09 — Implementation Prompt 05 — Stories, Harness, and Visual Proof

**Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**
## Objective

Add durable proof that both behavior families work and that HBCentral homepage output did not regress.

## Required outcome

- Story/harness proof exists for homepage mode and article mode.
- Visual proof is captured.
- Validation is strong enough to protect future changes.

## Repo-truth starting points

Inspect relevant proof seams in the live repo, including:

- `packages/ui-kit/src/HbcSignatureHeroSurface/`
- any existing story files under the shared hero primitive
- homepage dev-harness patterns
- current visual-proof scripts and README files
- any existing SPFx/webpart validation flow appropriate to this footprint

## Required implementation direction

1. Add or update proof cases for:
   - locked homepage mode
   - article mode with full data
   - article mode with missing optional data
   - author-photo fallback
2. Capture visual proof for before/after comparison.
3. Add any lightweight harness coverage needed to verify mode resolution.

## Hard constraints

- Do not treat “it compiles” as proof.
- Do not skip homepage regression proof.
- Do not leave article mode validated only by manual spot checks.

## Required scrub

Remove or update:
- stale stories
- misleading story names
- old proof cases that no longer match runtime truth
- comments implying unsupported hero behaviors

## Validation

Prove all of the following before closing:

- homepage locked mode still matches the intended flagship identity surface
- article mode renders correctly under all supported states
- reduced-motion and accessibility expectations are preserved
- visual-proof artifacts are current
- no stale validation seams remain

## Deliverable note

When finished, leave a closure note covering:
- proof surfaces added/updated
- screenshots or capture outputs generated
- exact regression checks completed
- readiness for final closure audit
