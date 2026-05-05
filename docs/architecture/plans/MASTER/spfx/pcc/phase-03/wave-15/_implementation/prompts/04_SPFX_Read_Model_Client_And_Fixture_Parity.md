# Prompt 04 — SPFx Read-Model Client and Fixture Parity

## Objective

Extend SPFx PCC read-model client interfaces, route registry, backend client, and fixture client for Wave 15 External Systems read models. Do not implement UI surfaces in this prompt.

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

- `apps/project-control-center/src/api/**`
- SPFx API/client tests
- package model imports if required

## Required Reference Inputs

Read:

```text
docs/06_BACKEND_AND_ROUTE_BLUEPRINT.md
reference/07_EXPECTED_FILE_CHANGE_MAP.md
```

## Required Implementation

1. Add Wave 15 route IDs and path templates.
2. Add client methods to `IPccReadModelClient`.
3. Extend backend client with GET-only calls and safe fallback.
4. Extend fixture client with parity methods and degraded shapes.
5. Update factory/tests if needed.
6. Ensure viewer persona is not serialized into URLs.
7. Preserve unified-search query behavior.

## Required Tests

- route path templates generated correctly;
- backend client calls correct URL;
- fallback returns backend-unavailable envelope;
- malformed/non-2xx/network failure degrades safely;
- fixture client known/unknown/backend-unavailable parity;
- route registry additions reflected in opt-in tests if needed.

## Validation

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
md5 pnpm-lock.yaml
```

## Prohibited

- No UI surface implementation.
- No package/lockfile changes.
- No auth/header changes unless required by existing backend client pattern.


## Commit

Commit scoped changes if validations pass. Use the repo's standard commit summary/description style and include validation/guardrail evidence in the response.

## Final Output Requirements

Use `reference/08_PROMPT_CLOSEOUT_TEMPLATE.md` where applicable. Include exact commands run, validation results, files changed, guardrail attestation, and residual risks.
