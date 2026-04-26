# 09 — Standing Local Agent Operating Rules

Use these rules in every implementation wave.

## Repo Truth

- Use the live local repo as truth.
- Confirm current branch and working tree before edits.
- Do not assume previously generated plans are current if repo truth differs.
- If docs and code conflict, document the conflict and follow code truth unless the prompt explicitly says to update code to match governing docs.
- Do not re-read files that are still within your current context or memory window.

## Scope Control

- Stay inside the wave scope.
- Do not make opportunistic broad refactors.
- Do not redesign unrelated homepage surfaces.
- Do not change Safety ingestion behavior unless the wave explicitly requires it.
- Do not alter backend auth posture unless explicitly instructed.
- Do not create a separate backend application.
- Use the existing backend Function App currently used by the Safety app.

## Safety Recognition Rules

- Do not select, rank, or publish a project based only on a single inspection score.
- A 100% inspection score must be suppressed or downgraded when activity/exposure evidence is missing.
- Recognition must be based on multiple signals:
  - inspection consistency
  - active project / active field exposure
  - finding severity
  - corrective-action response
  - data quality
  - trend / rolling performance
- Positive recognition must not discourage issue, hazard, or near-miss reporting.
- Do not expose individual employee performance details on the homepage.

## Homepage Architecture Rules

- Preserve shell ownership boundaries.
- `HbHomepageShell` owns placement, layout, and render mode.
- `SafetyFieldExcellenceZone` should stay a thin integration seam.
- The Safety Field Excellence component may own source-mode state and rendering decisions, but not raw data aggregation.
- The homepage client must consume a bounded published artifact from the backend or fallback/preview state.
- Do not aggregate raw inspection/finding/project-week records in browser code.

## UI/UX Doctrine Rules

- Review `docs/reference/ui-kit/doctrine/**` before UI edits.
- Review homepage audit checklist and scorecard before UI closure.
- Use `@hbc/ui-kit/homepage` where appropriate.
- Preserve or extend `HbcSafetyHomepageSurface` where possible.
- Do not ship a generic white-card enterprise result.
- Use premium-stack libraries materially where doctrine expects them.
- Compact/minimal states must show less information, not squeezed standard content.
- Preview fallback must be polished, future-state-like, and honestly labeled.

## Backend Rules

- Use existing Safety backend Function App.
- Reuse existing middleware, request ID, telemetry, and auth patterns.
- Reuse existing managed identity / Graph-only posture for Safety data access.
- Use indexed, bounded queries.
- Treat truncation/incomplete rollup data as a failure or low-confidence candidate.
- Do not expose raw workbook JSON through homepage endpoints.

## Verification Rules

- Typecheck relevant packages.
- Run targeted tests for changed packages.
- Add tests for every new scoring and mapping rule.
- For SPFx, prove package truth, not just source truth.
- For hosted cutover, prove runtime binding in browser.
- For UI, complete scorecard and capture evidence.
- Do not declare closure from local build success alone.

## Required Wave Report Format

Each wave must end with:

```md
# Wave Closure Report

## Summary

## Files Inspected

## Files Changed

## Validation

## Runtime / Hosted Proof

## Scorecard Impact

## Risks / Open Items

## Next Wave Readiness

## Commit Recommendation
```
