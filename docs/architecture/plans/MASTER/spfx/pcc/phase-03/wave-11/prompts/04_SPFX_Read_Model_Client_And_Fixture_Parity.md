# Prompt 04 — SPFX Read-Model Client and Fixture Parity

## Objective

Add or extend the SPFx Project Control Center read-model client, fixture-default behavior, and parity tests for the Responsibility Matrix read model.

## Required Instruction

```text
Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
```

## Working Directory

```text
/Users/bobbyfetting/hb-intel
```

## Global Guardrails

You must preserve these guardrails throughout this prompt:

- Do not edit `docs/architecture/plans/**` unless separately authorized.
- Do not run broad formatting across the repo.
- Do not change dependencies, package manifests, lockfiles, workflows, CI, SPFx packaging, deployment files, app settings, or secrets unless this prompt explicitly authorizes a narrow change and you can justify it.
- Do not add runtime calls to Graph, PnP, SharePoint REST, Procore, Sage, AHJ portals, Document Crunch, Adobe Sign, or other external systems.
- Do not add backend write routes.
- Do not mutate Team & Access state.
- Do not execute approvals/checkpoints owned by Wave 14.
- Do not implement evidence file upload/download/sync/storage behavior.
- Do not provide legal advice, infer legal obligations, create legal obligations, or replace executed contracts.
- Stop and report if local repo truth contradicts the Wave 11 documentation package or this prompt.

## Allowed / Likely Files

Use Prompt 01–03 results. Likely files include:

```text
apps/project-control-center/src/api/
apps/project-control-center/src/fixtures/
apps/project-control-center/src/surfaces/<repo-consistent responsibility matrix or project readiness adapter files>
apps/project-control-center/src/tests/
apps/project-control-center/src/api/*.test.ts
```

Do not build the full UI in this prompt unless a very small adapter stub is required to prove client shape.

## Required Behavior

Implement repo-consistent client behavior for the Responsibility Matrix read model:

- fixture-first by default, if that is current PCC convention;
- explicit backend opt-in only if existing PCC convention supports it;
- backend URL matches Prompt 03 route;
- safe degraded states mapped to existing preview/error/missing-config state vocabulary;
- fixture/backend parity maintained for top-level shape and count metadata;
- `109 / 98 / 0` posture visible in adapter/client test data;
- source-health warnings and owner-contract placeholder messaging preserved.

## Tests

Add tests to prove:

- client resolves fixture read model by default;
- backend opt-in builds correct route without executing external runtime calls;
- degraded source states produce safe preview-shaped output;
- fixture and backend envelope shapes are compatible;
- counts and warnings are not dropped;
- no Graph/PnP/SharePoint REST/Procore/Sage/AHJ imports are introduced in SPFx source.

## Boundary

Do not implement the full surface shell in this prompt. Leave UI composition for Prompt 05.

## Validation Commands

Run only repo-appropriate commands based on touched files and actual package scripts.

Baseline before edits:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
md5 pnpm-lock.yaml
```

Core validation after edits:

```bash
git diff --check
pnpm exec prettier --check <touched files>
git diff --cached --name-only
git status --short
md5 pnpm-lock.yaml
```

Package validation, as applicable:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
```



## Staged-File Proof Before Commit

Before committing, show:

```bash
git diff --cached --name-only
git diff --cached --stat
md5 pnpm-lock.yaml
```

If `pnpm-lock.yaml` changed, stop and report unless this prompt explicitly authorized a dependency change.

## Commit Requirements

Use this format in your final response:

```text
Commit summary:
<type(scope): concise summary>

Commit description:
<short body explaining what changed, what was validated, and what was intentionally not changed>
```

## Final Output Requirements

- State files changed.
- State validation commands run and results.
- State lockfile hash before and after.
- State guardrail confirmations.
- State residual risks or follow-up prompts.
