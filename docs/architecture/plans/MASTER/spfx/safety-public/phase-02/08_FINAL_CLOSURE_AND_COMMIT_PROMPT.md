# 08 — Final Closure and Commit Prompt

You are working in the local `RMF112018/hb-intel` repository. Main is authoritative.

## Objective

Produce final implementation closure, commit summary, and handoff evidence for the Safety Field Excellence dynamic cutover.

## Preconditions

Do not run this prompt until:

- schema foundation is implemented
- scoring package tests pass
- backend rollup APIs pass
- timer/publish workflow passes
- homepage dynamic adapter passes
- UI/UX scorecard reaches target or exceptions are documented
- hosted runtime proof is captured
- rollback is documented

## Required Final Checks

Run repo-appropriate verification, such as:

```bash
git status --short
pnpm typecheck
pnpm test --filter @hbc/features-safety
pnpm test --filter backend-functions
pnpm test --filter hb-webparts
pnpm lint
```

Adjust exact commands to repo scripts. Do not invent passing results.

## Required Evidence Review

Confirm evidence exists for:

- backend route proof
- published highlight artifact
- candidate generation
- low-activity 100% suppression tests
- homepage source modes
- preview fallback
- runtime proof object
- hosted screenshots
- package truth
- scorecard
- rollback

## Final Commit Message Template

Use this structure:

```bash
git commit --trailer "Made-with: Cursor" -m "$(cat <<'EOF'
Safety Field Excellence Dynamic Cutover: implement governed weekly highlight pipeline

Summary:
- Adds Safety Field Excellence candidate/highlight schema, descriptors, and provisioning definitions.
- Adds backend Function App rollup, approval, publish, and homepage read APIs using existing Safety backend posture.
- Adds weekly scoring rules that suppress low-activity perfect-score artifacts and require multi-signal evidence.
- Adds homepage dynamic source modes, backend read adapter, preview fallback, runtime proof, and curated fallback.
- Hardens UI against homepage doctrine/checklist/scorecard requirements.

Validation:
- <insert exact commands and results>
- <insert backend proof>
- <insert SPFx package proof>
- <insert hosted runtime proof>
- <insert scorecard result>

Rollback:
- <insert rollback steps>

EOF
)"
```

## Required Final Report

Produce:

```md
# Final Closure Report

## Executive Summary

## Implemented Scope

## Backend Function App Integration

## Safety Scoring and Recognition Controls

## Homepage Surface Cutover

## Preview Fallback Behavior

## UI/UX Scorecard

## Validation Results

## Hosted Proof

## Package Truth

## Rollback

## Known Follow-Up Items

## Commit
```

## Do Not

- Do not commit if hosted proof contradicts source/package truth.
- Do not claim dynamic-only readiness if only dynamic-preview was validated.
- Do not claim scorecard closure without scorecard evidence.
- Do not claim backend production readiness without route proof.
- Do not re-read files still in current context.
