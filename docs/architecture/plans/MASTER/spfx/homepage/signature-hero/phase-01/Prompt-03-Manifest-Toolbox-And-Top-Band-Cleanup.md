# Prompt 03 — Manifest, Toolbox, and Top-Band Cleanup

## Objective

Clean the packaging, manifest, and rollout posture so the current build exposes only the rebuilt Signature Hero as the visible homepage webpart.

This phase is about shipping discipline, not just UI.

## Scope

Target:
- `HbSignatureHeroWebPart.manifest.json`
- all non-hero homepage webpart manifests
- any registration, export, or build references that affect toolbox visibility or top-band ambiguity

Do not re-read files that are still within your current context window or memory. Re-open files only when necessary to verify changed or unresolved details.

## Required Changes

### 1. Clean the Signature Hero manifest
Update the Signature Hero manifest so its default properties align with the hard-reset implementation.

Remove stale default properties that no longer belong to the flagship hero:
- `headline`
- `message`
- `metadata`
- `cta`
- any other legacy editorial/banner fields

Replace them with only what the new implementation genuinely needs.
If the rebuilt hero no longer needs default authoring properties, keep the properties object minimal.

### 2. Preserve full-width support
Ensure the Signature Hero manifest still explicitly preserves full-width support.

This must remain true:
- `supportsFullBleed: true`

### 3. Hide all non-hero homepage webparts from the toolbox
For the current rollout cycle, update every non-hero homepage webpart manifest so only the Signature Hero is visible in SharePoint.

Use the supported manifest approach:
- `hiddenFromToolbox: true`

Apply this to all non-hero homepage surfaces that should not be authorable yet.

### 4. Remove top-band ambiguity
If any manifest descriptions or titles imply that another webpart is a flagship homepage hero, fix that wording.

Standalone greeting or legacy banner surfaces must not present themselves as the homepage flagship.

## Hard Gates

- Do not comment out JSON bodies.
- Do not use brittle hacks to suppress webparts.
- Do not leave stale hero defaults in the Signature Hero manifest.
- Do not keep multiple visible top-band candidates in the SharePoint toolbox.

## Deliverables

- cleaned Signature Hero manifest
- hidden-from-toolbox updates for non-hero webparts
- wording cleanup where needed
- concise rollout note showing which webparts remain visible vs hidden

## Validation

Prove:
- only the Signature Hero remains visible in the toolbox for this cycle
- full-width support is still enabled
- stale flagship hero properties were removed from the Signature Hero manifest
