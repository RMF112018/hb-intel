# Prompt 06 — Responsive Shell-Fit and Compact Mode Hardening

## Prompt to Send Local Agent

```md
You are working in the live `hb-intel` repository on Prompt 06 of the Adobe Sign flagship UI/UX remediation package.

# Objective

Harden the Adobe Sign card's responsive/card-level behavior so the flagship posture remains credible across all existing My Work responsive modes.

# Required Ground Rules

- Follow the decision-closed package exactly.
- Do not re-read files that are still within your current context or memory unless repo truth is stale, missing, contradictory, or exact edit context must be verified.
- Do not alter My Projects card.
- Do not silently change current home-surface span override tables.
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
apps/my-dashboard/src/layout/useMyWorkContainerBreakpoint.ts
apps/my-dashboard/src/layout/myWorkFootprints.ts
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.test.tsx
```

# Allowed Files to Modify

```text
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.tsx
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.module.css
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.test.tsx
```

# Required Implementation

## 1. Expose card mode marker

Use the current My Work bento/shell mode context to stamp:

```text
data-adobe-sign-layout-mode="{mode}"
```

on the Adobe card or equivalent stable wrapper.

## 2. Implement mode-aware CSS behavior

Follow the locked responsive rules in:

```text
docs/06_Responsive_And_Shell_Fit_Spec.md
```

### Wide modes
- preserve compact horizontal authority;
- summary rail can use horizontal metrics;
- row action may sit right-aligned.

### Mid modes
- status/freshness may wrap;
- metrics may wrap;
- rows must preserve readable title and visible Open action.

### Tablet portrait / phone
- single-column internal layout;
- full-width or near-full-width view switch;
- metrics stack;
- rows vertically compose title, metadata, action;
- no action disappears into ellipsis.

## 3. Protect the state panels

Loading/empty/degraded panels must remain compact and authored in narrow modes. Do not introduce large illustration blocks or vertically centered dead space.

## 4. Protect preview context

Preview context line must remain legible and not collapse into row content.

## 5. Tests

Add/update tests that assert:

- `data-adobe-sign-layout-mode` reflects at least:
  - phone;
  - standardLaptop;
  - desktop;
- all key views still render in representative forced modes;
- no structural DOM regression hides row Open actions in compact mode fixtures.

JSDOM cannot prove visual CSS appearance; use DOM markers and targeted structural assertions only. Prompt 08 will own hosted evidence.

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
my-dashboard(adobe-sign): harden responsive shell-fit and compact card behavior
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
## 8. Prompt 07 Readiness Decision

# Stop Conditions

Stop before commit if:

- responsive hardening cannot be achieved without changing current span overrides;
- the existing card mode cannot be obtained without broad shared-shell edits;
- any validation fails;
- lockfile checksum changes.
```
