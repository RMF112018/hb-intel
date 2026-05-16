# Prompt 02 — Module Boundary and Card Height Posture

## Prompt to Send Local Agent

```md
You are working in the live `hb-intel` repository on Prompt 02 of the Adobe Sign flagship UI/UX remediation package.

# Objective

Correct the structural foundation before richer UI work begins:

1. remove the low-value card-height/stretch posture causing Adobe Sign to appear as a sparse oversized white well;
2. remove `MyWorkCard.titleContent` because the view switch will no longer live inside the heading;
3. move Adobe-specific view-toggle styling out of the generic My Work card CSS;
4. create the local Adobe Sign CSS module scaffold that future prompts will build upon.

# Required Ground Rules

- Follow the decision-closed package exactly.
- Do not re-read files that are still within your current context or memory unless repo truth is stale, missing, contradictory, or exact edit context must be verified.
- Do not implement Prompt 03+ work yet.
- Do not broaden the card redesign in this prompt.
- Do not change package manifests, lockfiles, SPFx manifests, backend/functions code, or deployment files.
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

If Prompt 01 produced a clean baseline and no state-changing command occurred since, you may cite that baseline and re-run only `git status --short` before editing. State explicitly which path you use.

# Files to Inspect

Use current context first. Re-open only as needed:

```text
apps/my-dashboard/src/layout/MyWorkBentoGrid.module.css
apps/my-dashboard/src/layout/MyWorkCard.tsx
apps/my-dashboard/src/layout/MyWorkCard.module.css
apps/my-dashboard/src/layout/MyWorkCard.test.tsx
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.tsx
```

# Allowed Files to Modify

```text
apps/my-dashboard/src/layout/MyWorkBentoGrid.module.css
apps/my-dashboard/src/layout/MyWorkCard.tsx
apps/my-dashboard/src/layout/MyWorkCard.module.css
apps/my-dashboard/src/layout/MyWorkCard.test.tsx
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.tsx
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.module.css
```

# Forbidden Scope

Do not modify:

```text
backend/**
backend/functions/**
packages/models/**
packages/ui-kit/**
apps/my-dashboard/package.json
pnpm-lock.yaml
SPFx manifests
.sppkg artifacts
docs/**
```

# Required Implementation

## 1. Correct grid/card vertical stretch posture

Implement the smallest correct CSS/layout change that prevents the Adobe Sign card from visually stretching to match a taller My Projects sibling in the same bento row.

Target result:

- shorter cards remain top-aligned;
- Adobe Sign card height follows authored content;
- no large low-value white well remains simply because the left sibling is taller.

Do not add decorative filler.

## 2. Remove `titleContent` from `MyWorkCard`

Delete the prop from:

```text
apps/my-dashboard/src/layout/MyWorkCard.tsx
```

Restore heading content to the stable `title` prop only.

Remove/update tests that exist solely to prove `titleContent` rendering.

## 3. Remove Adobe-specific CSS from shared `MyWorkCard.module.css`

Delete the Adobe-specific selectors currently used by the old heading toggle.

If any heading-level flex/inline styles exist only to support the old embedded toggle, revert them to the cleanest generic card heading posture that remains compatible with existing cards.

## 4. Create Adobe local CSS module scaffold

Create:

```text
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.module.css
```

For Prompt 02, it may initially contain only the styles needed to preserve current Adobe view-toggle styling after the class import moves out of `MyWorkCard.module.css`. Do not yet implement the flagship switch/header redesign reserved for Prompt 03.

## 5. Update Adobe card imports

Switch `AdobeSignActionQueueCard.tsx` off shared MyWork toggle classes and onto the new local module CSS only for the currently existing toggle class usage.

Do not redesign the view switch yet.

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

If validation passes:

1. Stage explicitly by path only.
2. Do not use `git add .`.
3. Run:
   ```bash
   git diff --cached --stat
   git diff --cached --name-only
   ```
4. Confirm staged files match the allowed file list.

# Commit Guidance

Commit summary:

```text
my-dashboard(adobe-sign): correct card posture and localize module style boundary
```

Use an accurate body noting:

- bento/card posture correction;
- removal of titleContent seam;
- local Adobe CSS module introduction;
- validation results.

# Required Final Response

Return:

## 1. Implementation Summary
## 2. Files Changed
## 3. Validation Results
## 4. Lockfile MD5 Before / After
## 5. Staged File Proof
## 6. Commit SHA
## 7. Explicit Forbidden-Scope Confirmation
## 8. Prompt 03 Readiness Decision

# Stop Conditions

Stop before staging/commit if:

- the stretch posture cannot be corrected without changing unrelated card systems beyond this prompt;
- removing `titleContent` breaks a runtime consumer other than Adobe Sign that repo truth did not previously reveal;
- any validation fails;
- the lockfile checksum changes.
```
