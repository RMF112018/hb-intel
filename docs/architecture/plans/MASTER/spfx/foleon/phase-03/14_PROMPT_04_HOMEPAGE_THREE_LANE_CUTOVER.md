# Prompt 04 — Homepage Three-Lane Foleon Cutover

## Objective

Wire the three Foleon lanes into the HB Homepage package:

```text
ProjectPortfolioSpotlightZone → Foleon Project Spotlight
CompanyPulseZone              → Foleon Company Pulse
LeadershipMessageZone         → Foleon Leadership Message
```

## Global rules

- Work in `/Users/bobbyfetting/hb-intel` on `main`.
- Use live repo truth. Do not rely on summaries without checking current files.
- Do not re-read files still in current context unless verifying a specific contradiction or line.
- Do not touch unrelated `.gitignore`, Safety files, backend files outside Foleon scope, or untracked phase docs.
- Do not hardcode tenant GUIDs.
- Do not mutate tenant lists unless the prompt explicitly authorizes tenant provisioning.
- Do not reintroduce public person-field `$select` or `$expand`.
- Do not mount `window.__hbIntel_foleon` inside the homepage.
- Do not weaken reader gate, origin allowlist, preview URL blocking, or runtime proof redaction.
- Use Node 18 where SPFx tooling requires it.


## Required implementation

- Preserve existing occupant IDs.
- Replace zone internals with shared Foleon lane host wrappers.
- Add homepage-specific Foleon config seam.
- Do not hardcode tenant GUIDs.
- Do not change hero, Priority Actions launcher, Safety, Kudos, PnP Ops, or unrelated shell modules.
- Do not use `window.__hbIntel_foleon`.

## Config properties

Add/pass:

```text
foleonContentRegistryListId
foleonPlacementsListId
foleonEventsListId
foleonAcceptedOrigins
foleonAllowPreview
foleonExpectedManifestId
foleonExpectedPackageVersion
foleonApiBaseUrl
foleonApiResource
```

## Content state mapping

Use:

- `loading` while resolving;
- `empty` for preview/no active record;
- `strong` for live reader;
- `invalid` for blocked/config/error.

## Tests

Prove:

- three zones render Foleon lanes;
- legacy modules do not render;
- config reaches all three lanes;
- all three lanes can render simultaneously;
- protected shell diagnostics do not regress;
- no global Foleon mount is used.

## Versioning

Bump homepage coherently from current version to the next version.

Do not bump Foleon unless Foleon source changes in this wave.

## Validation

Run homepage, hb-webparts, shared package, and package proof commands from repo truth.

## Commit

```text
hb-homepage: wire foleon communications lanes into homepage shell
```
