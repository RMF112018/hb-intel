# Current State and Repo-Truth Context

## Current two-lane direction

The current homepage cutover plan uses **Strategy A: Shared React Component Integration**. That plan recognizes that `apps/hb-webparts` cannot cleanly import directly from `apps/hb-intel-foleon/src/*`, and it avoids loading `window.__hbIntel_foleon` twice. It proposes a shared package under `packages/foleon-reader` consumed by both the standalone Foleon app and the homepage shell.

## Existing Foleon reader state

The Foleon app already supports two dedicated public reader routes:

- `projectSpotlight`
- `companyPulse`

It has also added:

- shared `FoleonReaderModule`;
- `ProjectSpotlightReader`;
- `CompanyPulseReader`;
- split-lane preview remediation;
- Project Spotlight blue preview treatment;
- Company Pulse orange preview treatment;
- scalar-safe public content query discipline;
- Manager two-lane workflow support.

## Homepage shell state

The current homepage shell already has occupant/zone structure for:

- Project Portfolio Spotlight;
- Company Pulse / Newsroom;
- Leadership Message.

Repo search confirms an existing homepage zone file:

```text
apps/hb-webparts/src/webparts/hbHomepage/zones/LeadershipMessageZone.tsx
```

That makes the safest cutover strategy: preserve existing occupant IDs and replace the zone internals.

## Known homepage constraints

- The homepage package has a standalone `hb-homepage` mount, but runtime code flows through `apps/hb-webparts`.
- Existing protected shell layout and occupant registry must not be destabilized.
- The `hb-homepage` package currently uses its own package/version truth.
- The cutover should not affect hero, Priority Actions launcher, Safety, Kudos, PnP Ops, or unrelated homepage features.

## Known Foleon constraints

- Do not duplicate reader gate logic.
- Do not duplicate public content query logic.
- Do not reintroduce public SharePoint REST selection of person fields.
- Do not use `window.__hbIntel_foleon` as an embedded homepage strategy.
- Do not hardcode tenant list IDs.
- Do not treat configuration/query failures as preview.
- Do not fake CTA/archive/reader functionality in preview states.

## Implication

The new requirement is not just “add a third card.” It is a controlled expansion from a two-lane communications model to a three-lane communications model and must update schema, shared package API, Foleon routes/toolbox if needed, homepage zones, tests, and tenant rollout.
