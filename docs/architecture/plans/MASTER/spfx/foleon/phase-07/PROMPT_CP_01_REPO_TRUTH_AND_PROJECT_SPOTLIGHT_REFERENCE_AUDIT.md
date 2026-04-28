# CP-01 — Repo-Truth and Project Spotlight Reference Audit

## Objective

Audit the current Foleon reader lane implementation and specifically compare Company Pulse to the reworked Project Spotlight lane.

The goal is to confirm how Company Pulse can become a Project-Spotlight-aligned access point for Foleon-managed content without becoming a parallel news/article system.

## Mandatory context

Use current `main` as repo truth.

Do not rely on prior summaries. Do not re-read files already in current context unless needed to resolve drift or contradictions.

## Files to inspect

- `packages/foleon-reader/src/readers/layouts/ProjectSpotlightReaderLayout.tsx`
- `packages/foleon-reader/src/readers/layouts/CompanyPulseReaderLayout.tsx`
- `packages/foleon-reader/src/readers/layouts/FoleonReaderLayouts.module.css`
- `packages/foleon-reader/src/readers/FoleonReaderViewModel.ts`
- `packages/foleon-reader/src/readers/FoleonViewerTypes.ts`
- `packages/foleon-reader/src/components/FoleonFullWindowViewer.tsx`
- `packages/foleon-reader/src/components/FoleonFullWindowViewerProvider.tsx`
- `packages/foleon-reader/src/types/foleon-content.types.ts`
- `packages/foleon-reader/src/readers/__tests__/CompanyPulseReaderLayout.test.tsx`
- `packages/foleon-reader/src/readers/__tests__/ProjectSpotlightReaderLayout.test.tsx`

## Research requirement

Use current web sources to verify:
- Foleon is the content authoring/publishing system;
- Foleon embeds are intended to let host sites display updated Foleon content without redeploying host pages;
- SharePoint/Viva news surfaces act as cards/entry points into full reader experiences;
- Fluent card guidance supports one clear card action and accessible activation.

## Audit questions

1. What exact Project Spotlight design/interaction patterns should Company Pulse reuse?
2. What Project Spotlight-specific content must Company Pulse not reuse?
3. Where does the current Company Pulse implementation still behave like a digest board?
4. Which Company Pulse content is real record-backed data?
5. Which Company Pulse content is preview/static?
6. Which currently visible labels imply a parallel reader or internal article system?
7. How should the revised lane communicate that Foleon contains the actual publication?
8. What tests must be changed before implementation?

## Output

Create an audit report and stop. No code changes.

## Closure report format

```text
Summary:
Repo-truth findings:
Project Spotlight reference patterns:
Company Pulse divergence:
Research findings:
Recommended implementation scope:
Risks:
Files inspected:
Tests to update:
```
