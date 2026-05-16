# Prompt 01 — Read-Only Repo-Truth Readiness Audit

## Prompt to Send Local Agent

```md
You are working in the live `hb-intel` repository on the Adobe Sign module inside My Dashboard.

# Objective

Perform a strictly **read-only repo-truth readiness audit** before any flagship Adobe Sign UI/UX remediation begins. Confirm that the attached implementation package still matches the current repository truth and identify any blocking drift.

# Required Ground Rules

- This prompt is **read-only**.
- Do **not** edit files.
- Do **not** stage files.
- Do **not** commit.
- Do **not** install packages.
- Do **not** run builds, tests, lint, or formatting.
- Do **not** modify package manifests, lockfiles, SPFx manifests, docs, or generated artifacts.
- Do not re-read files that are still within your current context or memory unless repo truth is stale, missing, contradictory, or exact inspection context must be verified.

# Required Baseline Capture

Run and paste raw output for:

```bash
cd /Users/bobbyfetting/hb-intel
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -20
md5 pnpm-lock.yaml
```

# Required Baseline Questions

Confirm:

1. Is the active branch `main`?
2. Is commit `7ae348ed5ee912e72a7ec1d703ad53bdc18bd090` present in ancestry or still active HEAD?
3. Is the worktree clean?
4. If not clean, list unrelated changes and classify whether they block this package.
5. Did `pnpm-lock.yaml` checksum capture succeed?

# Required File-Presence Checks

Verify that these current source files exist:

```text
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.tsx
apps/my-dashboard/src/modules/adobeSign/useAdobeSignRecentCompletionsReadModel.ts
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.test.tsx
apps/my-dashboard/src/modules/adobeSign/useAdobeSignRecentCompletionsReadModel.test.tsx
apps/my-dashboard/src/layout/MyWorkCard.tsx
apps/my-dashboard/src/layout/MyWorkCard.module.css
apps/my-dashboard/src/layout/MyWorkBentoGrid.module.css
apps/my-dashboard/src/layout/MyWorkCard.test.tsx
apps/my-dashboard/src/state/myWorkCardViewModel.ts
apps/my-dashboard/src/surfaces/home/MyWorkHomeSurface.tsx
apps/my-dashboard/package.json
packages/ui-kit/package.json
```

# Required Repo-Truth Inspection

Inspect enough of the above files to verify each of the following implementation-package assumptions:

1. `AdobeSignActionQueueCard.tsx` still supports `Action Queue` and `Completed`.
2. `titleContent` is still present in `MyWorkCard.tsx`.
3. Adobe-specific toggle CSS is still in `MyWorkCard.module.css`.
4. `useAdobeSignRecentCompletionsReadModel.ts` is still lazy/cached and does not yet expose retry.
5. The current card still uses generic shared `.row` / `.rowLabel` / `.rowValue` semantics for Adobe activity list rendering.
6. `MyWorkHomeSurface.tsx` still contains the current My Projects and Adobe Sign span override tables.
7. `apps/my-dashboard/package.json` still does not directly add premium-stack dependencies.
8. `packages/ui-kit/package.json` still centralizes premium stack dependencies.

# Required Audit Output

Return a concise but complete report with exactly these sections:

## 1. Repo Baseline
## 2. Worktree Status
## 3. File Presence Verification
## 4. Assumption Validation Matrix
## 5. Blocking Drift
## 6. Non-Blocking Drift
## 7. Prompt 02 Readiness Decision

The readiness decision must be one of:

- `Ready for Prompt 02 without refinements.`
- `Ready for Prompt 02 with required refinements listed above.`
- `Do not proceed to Prompt 02.`

# Stop Conditions

Stop and recommend no implementation if:

- the target module files are missing;
- the current branch is not suitable for the work;
- the implementation baseline is materially different from the package assumptions;
- unrelated dirty changes overlap the same files this package intends to edit;
- lockfile/package/manifest drift is already present and unexplained.
```
