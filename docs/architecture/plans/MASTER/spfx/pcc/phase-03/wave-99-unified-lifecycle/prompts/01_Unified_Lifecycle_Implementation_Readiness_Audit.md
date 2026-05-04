# 01 — Unified Lifecycle Implementation Readiness Audit

## Objective

Conduct an exhaustive read-only repo-truth audit for the PCC Unified Lifecycle implementation. Do not edit files and do not commit.

## Required Instruction

```text
Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
```

## Working Directory

```text
/Users/bobbyfetting/hb-intel
```

## Prohibited Scope

- No file edits.
- No staging.
- No commits.
- No package/dependency/lockfile/manifest/workflow changes.
- No tenant or source-system mutation.

## Required Commands

Run and capture:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

## Required Inspection

Inspect the files listed in:

```text
reference/01_REQUIRED_REPO_TRUTH_FILES.md
```

Focus first on repo truth for:

- unified lifecycle docs and developer contracts;
- Wave 99 aggregate closeout;
- model contracts and exports;
- backend GET-only route/provider seams;
- SPFx clients, fixtures, adapters, hooks, Project Home/Readiness integration;
- Ask-HBI preview and guardrails;
- route/workspace prohibition tests;
- package scripts.

## Required Questions To Answer

1. Latest HEAD and branch?
2. Clean worktree?
3. Lockfile MD5?
4. Are the developer contracts present?
5. Are model contracts present and exported?
6. Are backend route/provider seams present?
7. Are SPFx client/fixture/adapter/hook seams present?
8. Are Project Home/Project Readiness integrations present?
9. Is Ask-HBI integrated without a route?
10. Are redaction/no-blame/refusal tests present?
11. Are no-route/no-live-integration guard tests present?
12. Which implementation prompts should be no-op verification versus implementation work?
13. Which files are likely touched by each later prompt?
14. Which validation scripts exist?
15. What is blocked/operator-pending?

## Final Output Requirements

Return:

- files inspected;
- repo truth answers;
- recommended next prompt path;
- no-op/implementation expectations for Prompts 02–07;
- lockfile MD5;
- guardrail confirmation.

No commit.
