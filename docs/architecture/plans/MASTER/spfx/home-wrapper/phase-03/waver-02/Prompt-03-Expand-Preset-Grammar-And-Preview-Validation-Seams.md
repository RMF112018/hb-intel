# Prompt 03 — Expand preset grammar and add preview-safe validation ergonomics

## Objective
Build on the strengthened shell contract to support a richer but still governed preset system and the preview/validation seams needed for later maintainer workflows.

## Governing authority
- `docs/reference/shell/HB-Shell-Entry-Breakpoint-Spec.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

## Inspect these files first
- `apps/hb-webparts/src/webparts/hbHomepage/shell/presetLibrary.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellValidation.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/protectedDecisions.ts`
- any new persistence/preview seams added in Wave 01

Do not re-read files that are still in active context unless you need to confirm drift, dependencies, or uncertainty after changes.

## Current gap
The shell has the beginnings of a preset model, but it needs a more mature preset vocabulary and preview-safe validation ergonomics before a future control panel can be introduced confidently.

## Required implementation outcome
- expand the approved preset library with only justified presets
- ensure each preset obeys protected rules
- add validation messaging that would support a future preview/editor experience
- document what presets are for and when they should be used

## Closure proof required
Provide:
- final preset library inventory
- reasons each preset exists
- validation/diagnostic improvements made
- note on how this reduces risk for a future maintainer-facing tool

## Prohibited
- no tenant-facing editor UI
- no arbitrary freeform layout canvas
