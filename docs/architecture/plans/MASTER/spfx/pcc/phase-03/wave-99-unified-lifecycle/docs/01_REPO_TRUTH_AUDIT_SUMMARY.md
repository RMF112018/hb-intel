# Repo-Truth Audit Summary Requirements

Prompt 01 must produce a read-only audit before implementation.

## Required Local Commands

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

## Required Audit Questions

1. What is the latest local HEAD?
2. Is the local branch clean?
3. Does current HEAD include unified lifecycle developer-contract documentation baseline `58f53d49d59f8c70683725c999e8f55e2bc2dfef` or a later equivalent?
4. Does `unified-lifecycle-developer-contracts/` exist and contain the expected contract docs/reference JSONs?
5. Does the Wave 99 aggregate closeout exist?
6. Are the unified lifecycle model contracts present and exported?
7. Are unified lifecycle read-model DTOs present and mapped in `PccReadModels.ts`?
8. Are backend GET-only route/provider seams present for the aggregate and leaf read models?
9. Are SPFx client methods present for the aggregate and leaf read models?
10. Are fixture clients present and deterministic?
11. Are adapter/view-model/component/hook seams present under `surfaces/unifiedLifecycle/`?
12. Is Project Home integration present?
13. Is Project Readiness integration present?
14. Is Ask-HBI preview integrated into Project Home without creating a route?
15. Are guard tests present for no standalone routes/workspaces?
16. Are HBI/refusal/security/redaction tests present?
17. Are source-of-truth disclaimers present?
18. Are no-live-integration import guards present?
19. Which package scripts are available and should be used for validation?
20. What remains incomplete or operator-pending?

## Current Known Baseline From Prior Conversation

- GitHub showed `58f53d49d59f8c70683725c999e8f55e2bc2dfef` as the latest unified lifecycle developer documentation commit.
- Prior commits indicate model, backend, SPFx, Ask-HBI, surface integration, and security hardening work already exists.
- Local repo commands must still verify this before implementation proceeds.

## Expected Result

Prompt 01 should return one of:

- `ready-noop-aware`: repo already contains significant implementation and later prompts should verify/harden rather than reimplement;
- `ready-implementation-needed`: repo has docs but missing code seams;
- `blocked`: local worktree or missing docs/scripts make implementation unsafe.
