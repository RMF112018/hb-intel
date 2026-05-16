# Prompt 04 — Activity Rows, Summary Rails, and Preview Context

## Prompt to Send Local Agent

```md
You are working in the live `hb-intel` repository on Prompt 04 of the Adobe Sign flagship UI/UX remediation package.

# Objective

Replace the current raw key/value list posture with Adobe-specific operational list grammar:

1. activity row primitives for Action Queue and Completed;
2. activity list wrapper;
3. stronger summary rails;
4. preview-limit context lines;
5. graceful completed metadata rendering without `Updated date unavailable`.

# Required Ground Rules

- Follow the decision-closed package exactly.
- Do not re-read files that are still within your current context or memory unless repo truth is stale, missing, contradictory, or exact edit context must be verified.
- Do not implement Prompt 05 state-panel/retry work yet.
- Do not modify package manifests, lockfiles, SPFx manifests, backend/functions code, or deployment files.
- Do not synthesize Adobe URLs.
- Do not use `git add .`.
- Do not push.

# Required Pre-Edit Baseline

Run and paste raw output for:

```bash
cd /Users/bobbyfetting/hb-intel
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -20
md5 pnpm-lock.yaml
```

# Files to Inspect

```text
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.tsx
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.module.css
apps/my-dashboard/src/state/myWorkCardViewModel.ts
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.test.tsx
```

# Allowed Files to Modify or Create

```text
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.tsx
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.module.css
apps/my-dashboard/src/modules/adobeSign/AdobeSignActivityRow.tsx
apps/my-dashboard/src/modules/adobeSign/AdobeSignActivityList.tsx
apps/my-dashboard/src/state/myWorkCardViewModel.ts
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.test.tsx
```

# Required Implementation

## 1. Create `AdobeSignActivityRow.tsx`

Support:

```text
variant="queue"
variant="completed"
```

Each row must render:

- primary title;
- secondary metadata;
- explicit Open anchor only when `sourceOpenUrl` exists.

Do not make the full row clickable.

## 2. Create `AdobeSignActivityList.tsx`

Own:

- `<ul>` list semantics;
- row mapping;
- preview-context line;
- data markers.

Add stable markers such as:

```text
data-adobe-sign-activity-list
data-adobe-sign-activity-row
data-adobe-sign-row-open-action
data-adobe-sign-preview-context
```

## 3. Queue row metadata rules

Metadata order:

1. required action label;
2. `From {sender}` when present;
3. `Expires {date}` when present.

Do not emit dangling separators.

## 4. Completed row metadata rules

Apply the locked fallback order:

1. date label if present;
2. sender label if present;
3. if both absent, subdued:
   - `Completion metadata not reported.`

Delete the old visible fallback:

```text
Updated date unavailable
```

from final rendered UI.

## 5. Add summary preview-context shaping

Add pure helpers in:

```text
apps/my-dashboard/src/state/myWorkCardViewModel.ts
```

for:

- Action Queue preview context;
- Completed preview context.

Render only when total > displayed.

Required copy:

```text
Showing {displayedCount} of {totalCount} agreements requiring action.
Showing latest {displayedCount} of {totalCount} completed agreements.
```

## 6. Completed summary rail

Use the completion summary VM to render a strong summary line such as:

```text
{count} completed in the last {windowDays} days
```

with guarded fallback if window days are not available.

## 7. Styling

Use the Adobe CSS module to create:

- clear list row separation;
- readable title hierarchy;
- subdued metadata line;
- explicit row action treatment;
- preview-context rhythm.

## 8. Tests

Update/add tests proving:

- no final rendered text contains `Updated date unavailable`;
- queue rows show title + metadata + Open when URL exists;
- completed rows show:
  - date/sender when present;
  - sender-only when date absent;
  - `Completion metadata not reported.` only when both absent;
- preview context renders only when total > visible;
- row action anchors preserve `_blank` and `noopener noreferrer`;
- no Open action renders when URL is absent.

# Required Validation

Run:

```bash
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard test
pnpm --filter @hbc/spfx-my-dashboard lint
git diff --check
md5 pnpm-lock.yaml
```

# Commit Guidance

Commit summary:

```text
my-dashboard(adobe-sign): add flagship activity rows and preview context
```

# Required Final Response

Return:

## 1. Implementation Summary
## 2. Files Changed
## 3. Validation Results
## 4. Lockfile MD5 Before / After
## 5. Staged File Proof
## 6. Commit SHA
## 7. Explicit Forbidden-Scope Confirmation
## 8. Prompt 05 Readiness Decision

# Stop Conditions

Stop before commit if:

- preview-context copy cannot be derived from existing summary/list data without backend/model changes;
- removing the old date fallback requires backend modifications;
- any validation fails;
- lockfile checksum changes.
```
