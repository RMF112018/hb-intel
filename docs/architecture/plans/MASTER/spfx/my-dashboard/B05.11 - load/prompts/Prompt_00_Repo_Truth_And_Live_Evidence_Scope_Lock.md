# Prompt 00 — Repo Truth and Live Evidence Scope Lock

## 1. Objective

Reconcile current `main` repo truth with the completed B05.8 telemetry findings and lock the implementation scope for the Project Links registry-performance remediation package.

This is a **no-product-code** prompt. Do not implement the optimization yet. Your deliverable is an execution-ready validation note that confirms the next prompts are grounded in current repo truth.

## 2. Repo-truth context

Inspect only the files necessary to confirm drift and current seams:

- `docs/architecture/plans/MASTER/spfx/my-dashboard/B05.8 - load/Performance_Evidence_Closeout.md`
- `backend/functions/src/hosts/my-work-read-model/read-models/project-links/my-project-links-read-model-provider.ts`
- `backend/functions/src/hosts/my-work-read-model/read-models/project-links/my-project-links-runtime-diagnostics.ts`
- `backend/functions/src/services/legacy-fallback/graph-list-client.ts`
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/legacy-project-fallback-registry.md`
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/projects.md`

Context-efficiency rule:
Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.
If a file has already been loaded and remains reliable in context, use that context instead of reopening it.
Only re-read a file if it may have changed, an exact interface or line-level detail is required, or validation/evidence requires a fresh read.

## 3. Architectural guardrails

- Do not modify product code.
- Do not modify tests.
- Do not modify package files, lockfiles, manifests, workflows, CI, deployment configuration, or tenant configuration.
- Do not run live Graph/SharePoint/Adobe mutations.
- Do not reopen the already-closed finding that registry source load is the primary backend bottleneck unless current repo truth directly contradicts the recorded evidence.
- Do not claim a performance improvement in Prompt 00.

Mandatory preflight:
1. Run and record:
   - `git status --short`
   - `git branch --show-current`
   - `git log --oneline -20`
   - `md5 pnpm-lock.yaml`
2. Identify unrelated pre-existing changes. Do not edit, stage, or absorb them.
3. Never use broad `git add .`. Stage exact intended paths only.
4. Before commit, run:
   - `git diff --check`
   - `git diff --cached --name-only`
5. After validation, run `md5 pnpm-lock.yaml` again and report before/after values.

## 4. Implementation instructions

Produce a concise validation note that confirms or corrects the following:

1. Whether `loadRegistryRows()` still fetches the registry without a source filter.
2. Whether the current provider still emits:
   - `myProjectLinks.read.sources.result`
   - `myProjectLinks.read.reconcile.result`
3. Whether `GraphListClient` still lacks in-flight Promise memoization for:
   - site ID resolution,
   - list catalog resolution.
4. Whether the registry schema doc still names `IsActive` and `MatchStatus` as implementation-relevant filter keys.
5. Whether the B05.8 KQL docs still need correction from `customEvents` to `traces`, or whether that docs gap has already been remediated.
6. Whether current `check-types` / `test` baselines are clean or show unrelated pre-existing failures.

## 5. Verification

Run only the validation needed to establish a clean implementation floor:

```bash
git diff --check
pnpm --filter @hbc/functions check-types
```

Do not run broad test suites unless a repo-truth contradiction requires it.

## 6. Documentation updates

None in this prompt unless the package has already been copied into the repo as a docs artifact and a path/index needs to be linked. Otherwise do not write files.

## 7. Deliverables / exit criteria

Return:

1. Review Decision
   - proceed / proceed with scoped correction / stop

2. Repo-truth checks performed
   - exact files inspected
   - exact mismatches, if any

3. Key findings
   - current registry loader condition
   - telemetry condition
   - Graph client memoization condition
   - KQL docs condition

4. Validation outcome
   - exact command outputs or concise pass/fail summaries

5. Required corrections before Prompt 01
   - none, or the exact blocker

6. Recommended next prompt
   - Prompt 01 if the optimization scope remains valid
