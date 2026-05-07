# 08 — Agent Execution Protocol

## 1. Purpose

This document defines execution controls for agents implementing or auditing Wave 15A remediation.

## 2. Universal Agent Instructions

Agents must:

1. Use repo truth, not prior chat memory.
2. Review the canonical PCC scorecard and use guide before scoring or remediation.
3. Do not re-read files still in current context unless exact wording, line references, or changed repo state must be verified.
4. Separate confirmed findings from suspected findings.
5. Tie every remediation to a scorecard pillar.
6. Tie every claimed improvement to evidence.
7. Avoid generic “polish” language.
8. Preserve no-runtime/no-mutation/no-live-integration guardrails unless explicitly changed.
9. Do not make read-only/preview/deferred controls appear executable.
10. Stop when a change would violate source-of-record, HBI authority, or integration boundaries.

## 3. Required Pre-Implementation Repo Truth Pass

Before implementation, inspect:

- Current branch/commit.
- PCC package/version.
- Current Wave 15A docs.
- Canonical scorecard and use guide.
- PCC shell/source files.
- Shared primitives.
- Target surfaces.
- Existing tests.
- Current evidence screenshots.
- Existing hard-stop risks.

## 4. Implementation Rules

### Shared First

Correct shared shell, navigation, layout, card, and state systems before page-local styling.

### No Local Styling Drift

Do not introduce ad hoc one-off styles when a shared primitive or token should be used.

### No Feature Creep

Do not add new live features to satisfy UX scoring. Improve clarity and honest boundaries.

### No False Actions

Every visible action must either work, clearly explain why it is unavailable, or be removed from the primary path.

### No Diagnostic Dominance

Developer diagnostics, seams, fixture states, and integration boundaries should not dominate user-facing hierarchy.

### Mold Breaker Required

Do not simply reproduce incumbent construction-tech patterns in cleaner styling. Reduce cognitive load, module hunting, and field-office divergence.

## 5. Prompt Closeout Requirements

Each prompt/agent execution should close with:

```markdown
## Objective Completed

## Files Changed

## Scorecard Pillars Addressed

## Hard Stops Addressed

## Doctrine Criteria Addressed

## Mold Breaker Criteria Addressed

## Tests Run

## Screenshots / Evidence

## Scorecard Impact

## Residual Issues

## Next Recommended Prompt
```

## 6. Validation Commands

Use the applicable repo validation commands for the scope changed. Typical commands may include:

```bash
git status --short
pnpm exec prettier --check <changed-files>
pnpm exec tsc --noEmit
pnpm test <targeted-tests>
git diff --check
```

Use package-specific commands where the repo defines them.

## 7. Branch / Commit Guidance

Commit messages should identify:

- PCC scope.
- Wave 15A.
- Prompt/step number if applicable.
- User-facing outcome.
- Scorecard or hard-stop impact.

Suggested format:

```text
feat(pcc): Wave 15A 100-point UI/UX remediation — <scope>
```

## 8. Agent Stop Conditions

Stop and report if:

- A hard-stop failure cannot be resolved without scope expansion.
- A proposed change requires live mutation/integration authority.
- A source-of-record boundary is unclear.
- Evidence contradicts a claimed score.
- Accessibility or host-fit behavior cannot be verified.
- A local fix would bypass shared primitives.
- Requirements conflict with governing doctrine.

## 9. Required Agent Mindset

Treat Wave 15A as a product-readiness program. The goal is not visual polish. The goal is a credible flagship PCC surface that can enter Phase 4 with a durable, evidence-backed UI/UX standard.


## Canonical References

Wave 15A now consumes the PCC 100-point scorecard as a durable reference standard, not as a wave-owned scoring file.

- PCC scorecard: `docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md`
- PCC scorecard use guide: `docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Scorecard_Use_Guide.md`
- Construction-tech UI study: `docs/explanation/design-decisions/con-tech-ui-study.md`
- Construction-tech UX study: `docs/explanation/design-decisions/con-tech-ux-study.md`
- SPFx governing standard: `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- Acceptance and scoring model: `docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md`

