# Prompt 03 — Header, Status Rail, and View-Switch Rebuild

## Prompt to Send Local Agent

```md
You are working in the live `hb-intel` repository on Prompt 03 of the Adobe Sign flagship UI/UX remediation package.

# Objective

Rebuild the Adobe Sign card's upper composition into the target flagship posture:

1. stable card heading: `Agreement Activity`;
2. visible active-view status chip;
3. freshness/confidence rail;
4. semantic manual-activation view switch separate from the heading.

# Required Ground Rules

- Follow the decision-closed package exactly.
- Do not re-read files that are still within your current context or memory unless repo truth is stale, missing, contradictory, or exact edit context must be verified.
- Do not implement Prompt 04 row/list work yet.
- Do not implement Prompt 05 retry/state-panel work yet.
- Do not modify package manifests, lockfiles, SPFx manifests, backend/functions code, or deployment files.
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
apps/my-dashboard/src/modules/adobeSign/AdobeSignViewSwitch.tsx
apps/my-dashboard/src/modules/adobeSign/AdobeSignStatusRail.tsx
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.test.tsx
```

# Required Implementation

## 1. Card identity

Set Adobe card:

```text
eyebrow: Adobe Sign
title: Agreement Activity
```

The heading must remain noninteractive and stable across views.

## 2. Create `AdobeSignViewSwitch.tsx`

Implement the view switch as a manual-activation tab pattern:

- `role="tablist"`
- two tabs:
  - Action Queue
  - Completed
- `role="tab"`
- `aria-selected`
- `aria-controls`
- roving `tabIndex`
- keyboard behavior:
  - ArrowRight
  - ArrowLeft
  - Home
  - End
  - Enter
  - Space
- panel activation should remain controlled by the parent card.

Do not auto-activate on Arrow focus movement.

## 3. Create `AdobeSignStatusRail.tsx`

Render:

- visible status chip;
- freshness line when valid.

The chip must reflect the active view and use the locked mapping from `docs/02_Closed_Decisions_And_Target_Posture.md`.

Freshness text:

```text
Last refreshed {formatted timestamp}
```

Suppress if no valid timestamp exists.

## 4. Wire the rebuilt upper card structure

Inside `AdobeSignActionQueueCard.tsx`, compose:

1. stable card heading via `MyWorkCard title="Agreement Activity"`;
2. status rail inside the card body;
3. view switch below the title area and status/freshness rhythm as defined by the target anatomy.

The view switch remains visible only in the capable states already defined by the module.

## 5. Styling

Use `AdobeSignActionQueueCard.module.css` to establish:

- clear header/body rhythm;
- visually decisive active tab;
- subdued inactive tab;
- status-chip treatments;
- freshness typography;
- visible focus treatment.

Do not add dependency changes.

## 6. Data markers

Add/preserve markers:

```text
data-adobe-sign-view-switch
data-adobe-sign-status-chip
data-adobe-sign-freshness
```

## 7. Tests

Update/add tests to verify:

- card now visibly contains `Agreement Activity`;
- stable heading semantics remain correct;
- view switch is no longer embedded in a heading;
- tabs/panels relationships exist where Prompt 03 can prove them;
- chip labels render for at least:
  - queue ready;
  - queue partial;
  - completed loading or ready state where available without Prompt 05 retry changes;
- freshness renders only when generated timestamp is available.

# Required Validation

Run:

```bash
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard test
pnpm --filter @hbc/spfx-my-dashboard lint
git diff --check
md5 pnpm-lock.yaml
```

# Required Staging Discipline

Stage explicitly by path only. Do not use `git add .`.

# Commit Guidance

Commit summary:

```text
my-dashboard(adobe-sign): rebuild activity header status rail and semantic view switch
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
## 8. Prompt 04 Readiness Decision

# Stop Conditions

Stop before commit if:

- the stable heading cannot be separated from the switch without altering shared card architecture beyond Prompt 02 cleanup;
- tab semantics require a dependency addition;
- any validation fails;
- lockfile checksum changes.
```
