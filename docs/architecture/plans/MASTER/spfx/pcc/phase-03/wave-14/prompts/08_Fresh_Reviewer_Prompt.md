# Prompt 08 — Fresh Reviewer Prompt for Wave 14 Implementation

## Objective

Act as a fresh-session reviewer for the completed Wave 14 Approvals / Checkpoints implementation. Conduct an independent repo-truth audit, validate the implementation against Wave 14 target architecture, and report pass/fail findings with required remediation.

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
- Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
- Preserve Wave 14 as a PCC-native approval/checkpoint control layer.
- Preserve source-module ownership. Do not transfer source record ownership to Phase 14.
- Preserve Wave 13G as Estimating Workbench feature/UX authority.
- Backend posture is GET-only until a separate command gate is explicitly authorized.
- SPFx posture is fixture-first unless the repo-standard backend opt-in path is already present and explicitly used.
- Do not add live approval execution, command handlers, external-system writeback, SharePoint/Graph/PnP mutation, tenant/list/group/security mutation, package/dependency changes, workflow changes, CI changes, deployment, or production rollout.
- Do not add legal, claim, entitlement, compensability, delay-damages, pricing, award, or accounting authority behavior.
- HBI may summarize/cite visible evidence and explain policy requirements only. HBI must not approve, reject, waive, override, defer, cancel, supersede, manual-close, price, recommend award as authority, post accounting entries, or execute source-system mutations.
- Do not use Power Automate as an MVP runtime dependency. It is reference architecture only unless a future integration gate authorizes it.
- Do not run broad formatting across the repo.
- Do not mutate `package.json`, `pnpm-lock.yaml`, SPFx manifests, tenant config, or deployment/package-solution files unless the prompt explicitly authorizes it and you first stop for approval.
- Do not edit `docs/architecture/plans/**` unless the prompt explicitly authorizes a closeout/auditor artifact there.

## Review Scope

Audit:

- all commits produced by Prompts 02–07;
- current Wave 14 models/fixtures;
- backend GET-only read model provider/routes/tests;
- SPFx read-model clients/fixtures/tests;
- Approvals / Checkpoints surface;
- Project Home approvals card;
- Priority Actions/readiness/source-module/Wave 13G seams;
- closeout docs;
- package/lockfile/manifest/workflow drift.

## Required Checks

1. Confirm latest HEAD and worktree cleanliness.
2. Confirm Wave 14 implementation commits are present.
3. Confirm no unauthorized files were changed.
4. Confirm all required model contracts exist and are exported.
5. Confirm state transition helpers and route-mode helpers match Wave 14 docs.
6. Confirm HBI refusal/no-authority utilities and UI copy exist.
7. Confirm backend routes are GET-only.
8. Confirm no backend command routes exist.
9. Confirm no prohibited runtime imports/calls exist.
10. Confirm SPFx default remains fixture-first and backend opt-in remains safe.
11. Confirm Approvals surface includes all required screens or documented MVP-equivalent sections.
12. Confirm disabled action reasons are visible and tested.
13. Confirm Priority Actions dedupe/resolve/suppress behavior is deterministic.
14. Confirm source-module and Wave 13G ownership boundaries are preserved.
15. Confirm command execution remains future-gated.
16. Confirm validation commands pass or failures are correctly scoped.
17. Confirm lockfile MD5 unchanged unless explicitly authorized.
18. Confirm implementation closeout is complete and honest.

## Suggested Validation Commands

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
git diff --check
```

Use only scripts confirmed by local package files.

## Reviewer Output

Return:

- executive pass/fail summary;
- repo-truth snapshot;
- implementation compliance matrix;
- guardrail findings;
- validation evidence;
- missing tests;
- runtime posture;
- residual risks;
- required remediation prompt if any;
- readiness recommendation for follow-on hardening/non-production validation.

## Commit

No commit. Reviewer report only.
