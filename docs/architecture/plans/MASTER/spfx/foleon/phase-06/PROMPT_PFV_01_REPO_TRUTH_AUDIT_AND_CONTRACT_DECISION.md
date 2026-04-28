# PROMPT PFV-01 — Repo-Truth Audit and Viewer Contract Decision

You are working in the `RMF112018/hb-intel` repository.

## Objective

Audit the current Foleon reader preview fallback, viewer target, provider, full-window viewer, lane layouts, and tests. Confirm whether the implementation package assumptions are still true before code changes.

## Critical instruction

Do not re-read files that are still within your current context or memory unless needed to verify current repo truth, line-level details, contradictions, dependency behavior, or drift after changes.

## Files to inspect

```text
packages/foleon-reader/src/readers/FoleonViewerTypes.ts
packages/foleon-reader/src/components/FoleonFullWindowViewerProvider.tsx
packages/foleon-reader/src/components/FoleonFullWindowViewer.tsx
packages/foleon-reader/src/components/FoleonFullWindowViewer.module.css
packages/foleon-reader/src/components/__tests__/FoleonFullWindowViewerProvider.test.tsx
packages/foleon-reader/src/readers/layouts/ProjectSpotlightReaderLayout.tsx
packages/foleon-reader/src/readers/layouts/CompanyPulseReaderLayout.tsx
packages/foleon-reader/src/readers/layouts/LeadershipMessageReaderLayout.tsx
packages/foleon-reader/src/readers/__tests__/ProjectSpotlightReaderLayout.test.tsx
packages/foleon-reader/src/readers/__tests__/FoleonReaderModule.test.tsx
packages/foleon-reader/src/readers/__tests__/FoleonReaderViewModel.test.ts
```

Also inspect homepage/version authority tests if source changes may require package bumps.

## Audit questions

1. Does `createPreviewFoleonViewerTarget` still return `canOpen: false` and `disabledReason: 'preview-only'`?
2. Does `openViewer` still refuse all `canOpen: false` targets?
3. Does `FoleonFullWindowViewer` have a non-iframe body branch?
4. Do Project Spotlight, Company Pulse, and Leadership all block preview through `isDisabled = !target.canOpen`?
5. Which tests currently expect preview refusal?
6. Which tests cover ready target disabled refusal?
7. Which package/version files are governed by lockstep tests?
8. Are there any existing preview viewer components that should be reused?

## Required output

Return a concise audit report with:

```text
Summary:
Current preview behavior:
Viewer contract findings:
Files inspected:
Recommended contract:
Tests to change:
Package/version implications:
Proceed / do not proceed:
```

## Do not

- Do not implement code changes.
- Do not bump versions.
- Do not change tests.
