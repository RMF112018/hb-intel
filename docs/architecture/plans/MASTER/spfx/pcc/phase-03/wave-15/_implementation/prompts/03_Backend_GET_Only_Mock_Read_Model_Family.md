# Prompt 03 — Backend GET-Only Mock Read-Model Family

## Objective

Extend the PCC backend mock read-model provider and GET-only routes for Wave 15 External Systems. Do not add commands, writes, live clients, or SPFx UI changes.

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

- `backend/functions/src/hosts/pcc-read-model/**`
- backend tests for PCC read-model routes/provider
- shared model imports needed for backend compile

## Required Reference Inputs

Read:

```text
docs/06_BACKEND_AND_ROUTE_BLUEPRINT.md
reference/04_HARD_GUARDRAILS.md
reference/07_EXPECTED_FILE_CHANGE_MAP.md
```

## Required Implementation

1. Extend provider interface with Wave 15 methods.
2. Implement mock provider methods using model fixtures from Prompt 02.
3. Register GET-only routes.
4. Return read-only envelopes for known, unknown, and backend-unavailable states.
5. Preserve existing `external-links` behavior or provide compatibility adapter if needed.
6. Add/extend route/provider tests.
7. Add prohibited-import guard test if current test style supports it.

## Required Routes

Prefer the route set in `docs/06_BACKEND_AND_ROUTE_BLUEPRINT.md`. At minimum implement a composite launch pad GET route and any additional GET routes required by SPFx UX and tests.

## Validation

```bash
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
md5 pnpm-lock.yaml
```

## Prohibited

- No POST/PATCH/DELETE.
- No Graph/PnP/SharePoint REST live calls.
- No external provider SDK/client.
- No tenant/list/provisioning mutation.
- No package changes.


## Commit

Commit scoped changes if validations pass. Use the repo's standard commit summary/description style and include validation/guardrail evidence in the response.

## Final Output Requirements

Use `reference/08_PROMPT_CLOSEOUT_TEMPLATE.md` where applicable. Include exact commands run, validation results, files changed, guardrail attestation, and residual risks.
