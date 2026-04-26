# Prompt 01 — Preview Model and Fixtures

## Objective

Implement only the isolated preview model and fixture utilities for the Foleon preview fallback. Do not wire the preview UI into any route yet.

## Context

The Foleon app currently renders generic empty states on configured-but-empty public routes. The preview fallback must use safe sample content without pretending sample content is real Foleon content.

## Global instructions for the code agent

- Use the live repo `main` branch as source of truth.
- Do not rely on prior summaries without verifying source files.
- Do not re-read files already within your current context unless verifying a specific line, contradiction, or diff.
- Do not touch unrelated `.gitignore`, Safety files, or untracked phase docs.
- Do not implement beyond this prompt's scope.
- Preserve current Foleon runtime proof and diagnostics.
- Preserve the runtime config bridge, manual Foleon property pane behavior, safe defaults, and diagnostics behavior introduced through versions `1.0.14.0`–`1.0.16.0`.
- Do not weaken reader origin, iframe, publish-status, display-window, or preview-URL gates.
- Do not add backend dependencies for preview content.
- Do not change SharePoint list provisioning unless the implementation proves a strict source-architecture need.


## Files to inspect

- `apps/hb-intel-foleon/src/types/foleon-content.types.ts`
- `apps/hb-intel-foleon/src/components/FoleonCard.tsx`
- `apps/hb-intel-foleon/src/components/FoleonStates.tsx`
- `apps/hb-intel-foleon/src/pages/HighlightsPage.tsx`
- `apps/hb-intel-foleon/src/pages/ContentHubPage.tsx`
- Existing test conventions under `apps/hb-intel-foleon/src/**/__tests__`

## Files likely to add

- `apps/hb-intel-foleon/src/preview/FoleonPreviewTypes.ts`
- `apps/hb-intel-foleon/src/preview/FoleonPreviewData.ts`
- `apps/hb-intel-foleon/src/preview/__tests__/FoleonPreviewData.test.ts`

## Implementation requirements

- Add a preview-specific `FoleonPreviewRecord` model.
- Do not modify `FoleonContentRecord` unless there is a compelling typed reason.
- Add static fixture arrays for Highlights and Hub.
- Fixture IDs must be strings prefixed with `preview-`.
- Fixture records must not include Foleon doc IDs, URLs, SharePoint item IDs, or live telemetry identifiers.
- Fixture titles/summaries must communicate sample/preview status through surrounding UI copy or helper text.
- Include at least one feature record and at least three compact records.
- Use current content type union values: `Project Highlight`, `Newsletter`, `Company News`, `Market Update`, `Leadership`, `Other`.

## Explicit non-goals

- Do not update `HighlightsPage`.
- Do not update `ContentHubPage`.
- Do not add visual fallback components yet unless necessary for model tests.
- Do not route, open, or emit telemetry.
- Do not change package version.

## Testing requirements

Add tests that prove:

- fixture arrays are non-empty;
- IDs start with `preview-`;
- no unsafe URL-like or live ID fields exist;
- records include required display fields;
- records support one feature + multiple compact cards.

## Validation commands

Run the narrowest useful subset during this prompt, and document anything intentionally deferred to Prompt 05.

```bash
git status --short
git branch --show-current
git log -5 --oneline

pnpm --filter @hbc/spfx-hb-intel-foleon lint
pnpm --filter @hbc/spfx-hb-intel-foleon check-types
pnpm --filter @hbc/spfx-hb-intel-foleon test
```


## Commit rules

- One focused commit for this prompt if changes are made.
- Do not include generated `.sppkg` binaries unless the active repo packaging standard explicitly requires them.
- Commit message format:
  - Summary: `hb-intel-foleon: <specific behavior>`
  - Body: include tests run, proof impact, and any deferred items.


## Required closure report

```md
# Closure Report

## Summary
## Files Changed
## Behavior Implemented
## Tests Added / Updated
## Validation Commands and Results
## Runtime Proof Impact
## Telemetry Impact
## Risks / Follow-Ups
## Commit
```

