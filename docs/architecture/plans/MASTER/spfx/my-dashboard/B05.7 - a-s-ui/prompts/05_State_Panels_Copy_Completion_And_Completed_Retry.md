# Prompt 05 — State Panels, Copy Completion, and Completed Retry

## Prompt to Send Local Agent

```md
You are working in the live `hb-intel` repository on Prompt 05 of the Adobe Sign flagship UI/UX remediation package.

# Objective

Complete authored state presentation and add card-owned retry for Completed history:

1. authored state panel primitive;
2. production copy deck integration;
3. completed-view loading/empty/degraded panel upgrades;
4. Completed recent-completions retry behavior.

# Required Ground Rules

- Follow the decision-closed package exactly.
- Do not re-read files that are still within your current context or memory unless repo truth is stale, missing, contradictory, or exact edit context must be verified.
- Do not modify backend/functions code.
- Do not change package manifests, lockfiles, SPFx manifests, or deployment files.
- Do not broaden retry behavior to Action Queue home-read failures.
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
apps/my-dashboard/src/modules/adobeSign/useAdobeSignRecentCompletionsReadModel.ts
apps/my-dashboard/src/modules/adobeSign/useAdobeSignRecentCompletionsReadModel.test.tsx
apps/my-dashboard/src/state/myWorkCardViewModel.ts
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.test.tsx
```

# Allowed Files to Modify or Create

```text
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.tsx
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.module.css
apps/my-dashboard/src/modules/adobeSign/AdobeSignStatePanel.tsx
apps/my-dashboard/src/modules/adobeSign/useAdobeSignRecentCompletionsReadModel.ts
apps/my-dashboard/src/modules/adobeSign/useAdobeSignRecentCompletionsReadModel.test.tsx
apps/my-dashboard/src/state/myWorkCardViewModel.ts
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.test.tsx
```

# Required Implementation

## 1. Create `AdobeSignStatePanel.tsx`

Build a local primitive that can render:

- loading;
- empty;
- partial/degraded;
- authorization/configuration/principal source guidance;
- optional CTA slot;
- optional Retry action slot.

Keep it local to Adobe Sign.

## 2. Integrate the locked production copy deck

Apply copy from:

```text
docs/07_Copy_Deck_And_Content_Rules.md
```

Do not invent substitute developer copy.

## 3. Upgrade Action Queue state panels

Use authored state panels for:

- loading;
- empty ready;
- authorization required;
- configuration required;
- principal unresolved;
- source unavailable;
- backend unavailable.

Preserve Connect CTA behavior and failure alert semantics.

## 4. Upgrade Completed state panels

Use authored state panels for:

- loading;
- empty ready;
- partial;
- authorization required;
- configuration required;
- principal unresolved;
- source unavailable;
- backend unavailable.

## 5. Add Completed retry support

Enhance:

```text
useAdobeSignRecentCompletionsReadModel.ts
```

to expose a local `retry` method that reissues the existing recent-completions request after an error/degraded request path.

Required behavior:

- retry remains local to this hook;
- retry does not alter backend routes;
- retry does not break successful caching;
- retry should reset the request guard in a predictable way.

## 6. Wire Retry button

Completed degraded/error state panels show:

```text
Retry
```

button that calls the hook retry method.

Add marker:

```text
data-adobe-sign-completed-retry
```

## 7. Announcements

Completed loading must render a polite status:

```text
role="status"
aria-live="polite"
```

Connect failure alert remains:

```text
role="alert"
```

## 8. Tests

Add/update tests for:

- copy deck output for key Action Queue/Completed states;
- Completed retry appears in degraded/error state;
- clicking Retry reissues the recent-completions request;
- successful completed view still caches and does not refetch on simple toggle round-trip;
- loading status semantics exist;
- Connect failure alert remains.

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
my-dashboard(adobe-sign): complete authored states and completed-history retry
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
## 8. Prompt 06 Readiness Decision

# Stop Conditions

Stop before commit if:

- retry requires backend or route contract changes;
- authored panel copy conflicts with live state shape and cannot be resolved in frontend;
- any validation fails;
- lockfile checksum changes.
```
