# Prompt 09 — Wave 2 Tests, Documentation, Closeout, and Proof

## Operating Instructions

You are executing this prompt in the live `RMF112018/hb-intel` repository. Treat the current repo as the source of truth. Do not assume files from memory are current. However, do not repeatedly re-read files that are still within your current context unless the file may have changed or the prompt specifically requires a freshness check.

Work to closure. Do not defer required analysis, do not ask broad clarification questions, and do not implement outside the allowed scope. If repo truth conflicts with this prompt, stop before code changes and document the conflict clearly.

## Objective

Close Wave 2 by validating tests, documentation, exports, and guardrails. Produce final closeout documentation that proves the PCC shell frame and UI/UX foundation are complete for Wave 2.

## Required Documentation

Create/update:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-2/Wave_2_Closeout.md
apps/project-control-center/README.md
```

The closeout must reference:

```text
docs/reference/ui-kit/dashboard/dashboard-basis-of-design.png
```

## Required Closeout Coverage

Document:

- implemented files;
- package name and scripts;
- basis-of-design handling;
- flexible layout contract implementation;
- MVP surface navigation coverage;
- Project Home bento dashboard coverage;
- preview/fallback state coverage;
- no-runtime guard coverage;
- validation command results;
- deferred Wave 3 backend/read-model items;
- confirmation of no backend/provisioning/tenant/Graph/PnP/Procore/deployment work.

## Required Validation

Run all relevant package-level commands. At minimum:

```bash
git status --short
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center build
pnpm --filter @hbc/spfx-project-control-center lint
pnpm --filter @hbc/spfx-project-control-center test
```

If `@hbc/spfx` exports were touched:

```bash
pnpm --filter @hbc/spfx check-types
pnpm --filter @hbc/spfx test
pnpm --filter @hbc/spfx build
```

If package names differ, use actual package names and document the difference.

## Forbidden Closeout Claims

Do not claim:

- live backend read model exists;
- tenant calls were tested;
- Procore integration exists;
- access requests execute;
- approvals execute;
- Site Health scans/repairs run;
- package was deployed;
- app catalog was updated.

## Final Readiness Statement

The intended final Wave 2 readiness statement is:

> Phase 3 Wave 2 is complete when the PCC SPFx shell frame, UI/UX basis, flexible bento layout, MVP surface navigation, preview dashboard cards, fallback states, and no-runtime guard tests are implemented and documented. The shell is ready for Wave 3 backend read-model planning, but it is not a live operational PCC release.
