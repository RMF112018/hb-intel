---
name: hb-verification-router
description: Choose the smallest credible validation set for HB Intel changes across docs, packages, shared contracts, UI/SPFx, backend, provisioning, deployment, and hosted proof.
when_to_use: Use when the user asks what validation should run, whether validation is enough, how to test a change, or how to classify failed checks.
argument-hint: "[change summary, files changed, or target package]"
context: fork
agent: hb-verification-runner
allowed-tools: Read, Grep, Glob
---

# HB Verification Router

Select validation for:

```text
$ARGUMENTS
```

## Objective

Recommend the smallest credible validation set that can catch meaningful defects in the changed scope without over-running the workspace.

## Routing Procedure

1. Classify the change:
   - docs-only;
   - package-local code;
   - shared package or public export;
   - app runtime/routing;
   - UI/SPFx;
   - backend;
   - architecture/workspace/manifest;
   - provisioning/tenant/deployment;
   - hosted proof.

2. Identify validation level:
   - **Level 1 — Narrow Verification**
   - **Level 2 — Affected Package Verification**
   - **Level 3 — Cross-Package Verification**
   - **Level 4 — Broader Workspace / E2E**
   - **Level 5 — Hosted / Tenant-Gated Verification**

3. Prefer known repo commands from:
   - `package.json`;
   - affected package `package.json`;
   - `docs/reference/developer/verification-commands.md`;
   - active prompt package validation matrix.

4. Do not recommend high-risk commands as normal validation unless explicitly authorized:
   - `az`;
   - `m365`;
   - `pnp`;
   - `gh workflow run`;
   - app catalog upload/deployment;
   - Azure deployment;
   - live Graph/PnP;
   - Procore probes;
   - live endpoint `curl`;
   - `.sppkg` generation/deployment;
   - dependency install/update commands.

## Output Format

## Recommended Validation

| Level | Command | Why |
| --- | --- | --- |
| <level> | `<command>` | <reason> |

## Not Recommended / Requires Authorization

- `<command>` — <why>

## Failure Classification Guidance

If validation fails, classify each failure as:

- new;
- pre-existing;
- environmental;
- flaky;
- ambiguous.

## Residual Risk

- <what remains unverified>

See `reference/verification-levels.md` for the reusable validation matrix.


## Standing Constraints

- Use current repo truth before historical summaries.
- Do not re-read files still in active context unless they may have changed, line-level proof is needed, validation/closeout requires proof, scope expanded, or the user asked for a repo-truth audit.
- Separate evidence from recommendation.
- State uncertainty explicitly.
- Do not broaden scope into adjacent cleanup unless the user explicitly authorizes it.
- Do not claim completion without stating what was actually inspected or verified.

