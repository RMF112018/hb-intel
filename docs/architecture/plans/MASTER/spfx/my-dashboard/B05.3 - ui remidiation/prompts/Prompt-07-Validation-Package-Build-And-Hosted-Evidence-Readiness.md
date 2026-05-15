# Prompt 07 — Validation, Package Build, and Hosted-Evidence Readiness

```markdown
# Objective

Perform the final validation and packaging closeout for the My Dashboard UI posture reset. Prove that the implementation meets the locked target posture, passes project validation, and produces a structurally valid My Dashboard SPFx package artifact.

# Repo-truth context

Start after Prompts 01–06 are complete.

Primary authorities:
- `docs/02-Decision-Lock-And-Closed-Target-Posture.md`
- `docs/03-Comprehensive-Target-UI-Posture.md`
- `docs/04-Target-Primary-Page-Layout-And-Bento-Choreography.md`
- `docs/05-Target-Module-State-Matrices.md`
- `docs/08-Acceptance-Criteria-And-Proof-Of-Closure.md`
- `reference/Target-State-Acceptance-Matrix.md`

Primary runtime seams to re-check:
- the final shell/header path;
- final home surface;
- final Adobe card;
- final My Projects card;
- final tests;
- final README.

Do not reread files that are already in your active context unless they changed, context is stale, or scope expanded.

# Architectural guardrails

1. Do not make new product decisions during validation.
2. Fix only validation-breaking implementation issues or target-posture defects exposed by the checks.
3. Do not claim hosted/tenant proof unless actually performed.
4. Do not mutate external systems.

# Implementation instructions

## 1. Re-run the acceptance matrix
Confirm every acceptance item in:
- `docs/08-Acceptance-Criteria-And-Proof-Of-Closure.md`
- `reference/Target-State-Acceptance-Matrix.md`

## 2. Run full validation commands
Execute:

```bash
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard test
pnpm --filter @hbc/spfx-my-dashboard build
npx tsx tools/build-spfx-package.ts --domain my-dashboard
```

## 3. Inspect package output
Confirm:
- the package command completed successfully;
- the expected My Dashboard `.sppkg` artifact exists in the repo's packaging output path;
- no packaging error indicates stale runtime assets or unmet production runtime config gates.

## 4. Final posture proof
Provide specific proof that:
- no visible tab/dropdown launcher remains in the target runtime;
- compact header is in place;
- exactly two module cards render on the primary page;
- Adobe Sign is consolidated;
- My Projects footprint/posture is corrected;
- stale standalone cards are absent from the rendered target path.

## 5. Optional hosted-evidence note
If hosted Playwright or screenshot evidence is **not** performed, say:
- `Hosted tenant visual validation remains operator-pending and was not claimed in this local closeout.`

Do not invent hosted proof.

# Verification

This prompt is the full verification step. The validation commands above are mandatory.

# Documentation updates

Only update documentation in this prompt if final validation reveals a factual mismatch in the README or in a current-reference doc already touched by Prompt 06.

# Deliverables / exit criteria

Return:

1. **Validation Decision:** PASS / FAIL
2. **Branch / HEAD**
3. **Working tree status**
4. **Files changed during final closeout, if any**
5. **Acceptance-matrix result**
6. **Command-by-command validation results**
7. **SPFx packaging result**
8. **Artifact path, if produced**
9. **Hosted-evidence statement**
10. **Final conclusion: target UI posture met / not met**
```
