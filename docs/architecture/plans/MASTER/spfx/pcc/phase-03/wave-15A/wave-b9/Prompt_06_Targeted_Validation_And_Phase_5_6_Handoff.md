# Prompt 06 — Targeted Validation and Phase 05/06 Handoff

## Objective

Close Phase 04 safely with validation, changed-file audit, evidence decision, and handoff inventory.

## Instructions

# Common Local-Agent Directive

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

You are operating inside the local `hb-intel` repo. Use current repo truth. Do not rely on this package alone where live files contradict it. Preserve SharePoint host-fit, read-only/no-writeback posture, bento direct-child invariants, and tab/tabpanel accessibility.

Do not implement Phase 05 module launcher, Phase 06 Project Home bento composition realignment, URL routing, command routing, active module state, live integrations, writeback, or broad visual redesign during Phase 04.

Use `apps/project-control-center/config/package-solution.json` for PCC package-solution references. Root `config/package-solution.json` is stale for PCC unless current repo truth proves otherwise.

## Required Validation

Run:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed-files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

If e2e selectors or visible structure materially changed, also run:

```bash
pnpm exec playwright test --config=playwright.pcc-live.config.ts --list
pnpm pcc:e2e:evidence:registry
pnpm pcc:e2e:live
```

## Required Closeout

Produce a concise following-execution report with:

1. changed files;
2. removed duplicate cards;
3. demoted/retained operational cards;
4. active-panel ownership proof;
5. test updates;
6. validation command outputs;
7. lockfile/package/manifest status;
8. Playwright/evidence decision and outputs if run;
9. Phase 05 handoff for module launcher/gateways;
10. Phase 06 handoff for Project Home bento composition.

## Commit Hygiene

Do not commit until validation is clean or any exception is explicitly accepted.

Commit summary/description should state:

- Objective;
- Scope;
- Tests/validation;
- No package/lockfile/manifest drift unless applicable;
- Phase 05/06 handoff.
