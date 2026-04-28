# CP-03 — Preview Viewer Access-Point Copy and Structure

## Objective

Update Company Pulse preview viewer content so it reinforces the correct model:

> This is a preview of the HB Central access point. The actual Company Pulse content is authored and managed in Foleon.

## Files likely to change

- `packages/foleon-reader/src/readers/FoleonViewerTypes.ts`
- `packages/foleon-reader/src/components/FoleonFullWindowViewer.tsx`
- `packages/foleon-reader/src/components/FoleonFullWindowViewer.module.css`
- tests under `packages/foleon-reader/src/components/__tests__/`

## Requirements

- Preview viewer must not imply that HB Central hosts the publication.
- Preview viewer must not render an iframe.
- Preview viewer must show a sample edition-launch structure, not fake article content.
- Copy should be employee-facing and admin-clean.

## Suggested preview copy

Title:
`Company Pulse Preview`

Summary:
`This preview shows how HB Central will introduce the current Company Pulse edition. Marketing manages the full publication in Foleon.`

Notice:
`When a live edition is selected, this window opens the governed Foleon viewer.`

Bullets:
- Current edition
- Company updates
- Recognition and events
- Full Foleon publication

## Tests

- preview mode mounts no iframe;
- Company Pulse preview copy does not use developer/system language;
- Escape closes viewer;
- focus returns to launcher;
- dialog labels are descriptive.
