# Prompt 05 — SPFx Launch Pad Surface Shell

## Objective

Refactor the External Systems surface into the Wave 15 Launch Pad home and project launch-links shell using read-model data with safe fixture fallback.

## Required Instruction Phrase

```text
Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
```

## Working Directory

```bash
cd /Users/bobbyfetting/hb-intel
```

## Required Initial Repo-Truth Commands

Run and record:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

If the worktree is not clean, distinguish user-owned drift from authorized prompt scope before editing. Do not stage unrelated files.

## Global Guardrails

- Work only in `/Users/bobbyfetting/hb-intel`.
- Preserve Wave 15 as a governed launch/reference layer first.
- Preserve no-writeback, no-sync, no-mirror posture.
- Preserve source-system ownership of source records.
- Preserve PCC ownership of launch/mapping/review/audit/health posture records.
- Preserve Wave 14 ownership of approval/checkpoint semantics.
- Preserve HBI no-authority posture.
- Do not add live external-system API calls.
- Do not add SharePoint/Graph/PnP writes.
- Do not add tenant/list/group/security mutation.
- Do not add command/write routes.
- Do not add iframe/current-image embed behavior.
- Do not add package dependencies or mutate lockfile.
- Do not mutate SPFx manifests, SPPKGs, deployment config, or CI workflows.
- Do not run broad formatting across the repo.


## Authorized Scope

- `apps/project-control-center/src/surfaces/externalSystems/**`
- External Systems SPFx tests

## Required Reference Inputs

Read:

```text
docs/05_SPFX_UX_IMPLEMENTATION_BLUEPRINT.md
reference/04_HARD_GUARDRAILS.md
```

## Required Implementation

1. Preserve existing surface identity `external-systems`.
2. Add/use hook to load Wave 15 read model from client if available, with fixture fallback as repo pattern allows.
3. Build Launch Pad header/summary.
4. Build Project Launch Links panel/card group.
5. Render states: loading, empty, unavailable, degraded, blocked-by-policy, stale.
6. Show hostname and policy state.
7. No iframe.
8. No write actions.
9. Only allow external opening if policy allowed and implemented safely.

## Required Tests

- Launch Pad renders from read model.
- sourceStatus maps to state UI.
- blocked policy disables open affordance.
- no iframe rendered.
- no direct provider SDK imports.
- fixture fallback works.
- existing Procore card posture remains display-only or is incorporated into the new view without live behavior.

## Validation

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
md5 pnpm-lock.yaml
```


## Commit

Commit scoped changes if validations pass. Use the repo's standard commit summary/description style and include validation/guardrail evidence in the response.

## Final Output Requirements

Use `reference/08_PROMPT_CLOSEOUT_TEMPLATE.md` where applicable. Include exact commands run, validation results, files changed, guardrail attestation, and residual risks.
