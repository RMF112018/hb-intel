# 08 — Validation and Closeout Requirements

## Purpose

Define objective proof required for each prompt and final Wave 15A closeout.

## Required Commands

Each implementation prompt must run repo-appropriate commands. The local agent must determine the exact available package scripts, but expected commands likely include:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
pnpm exec prettier --check <changed markdown/files>
```

If commands differ, document exact repo-truth reason and actual command used.

## Evidence Required by Prompt

Each prompt must provide:

- exact files inspected,
- exact files changed,
- test/typecheck/build command output,
- screenshot evidence where visual behavior changed,
- scorecard categories affected,
- residual issues,
- no unrelated changes attestation.

## Final 56/56 Closeout

Prompt 09 must produce:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/Wave_15A_Final_56_Closeout.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/evidence/scorecards/final-56-scorecard.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/evidence/screenshot-evidence-index.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/evidence/tenant-validation/tenant-validation-closeout.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/evidence/accessibility/accessibility-keyboard-closeout.md
```

## Stop Conditions

Stop and report if:

- tenant validation cannot be performed,
- screenshots cannot be captured,
- accessibility/keyboard checks cannot be performed,
- tests fail and cannot be resolved within scope,
- implementation requires backend/API changes,
- doctrine docs conflict and require user decision,
- shared primitives would need broader UI-kit changes outside PCC scope.
