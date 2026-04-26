# Execution Waves

## Wave 00 — Leadership schema and tenant deltas

Add/verify:

- `ReaderKey: leadership-message`
- `HomepageSlot: Leadership Message Reader`
- `PlacementKey: Leadership Message Active`
- `PageContext: Leadership Message`

Do not change homepage or Foleon UI in this wave.

## Wave 01 — Shared Foleon reader package

Create/update `@hbc/foleon-reader` with all three reader exports.

No homepage cutover in this wave.

## Wave 02 — Standalone Foleon Leadership alignment

Add standalone Leadership route/toolbox support if not already covered by shared package extraction.

Package Foleon only if intended for tenant deployment.

## Wave 03 — Homepage three-lane cutover

Replace zone internals for:

- Project Portfolio Spotlight;
- Company Pulse;
- Leadership Message.

Bump homepage package version and package proof.

## Wave 04 — Final docs/package/tenant validation

Update docs, run full validation, deploy packages, update persisted expected versions, validate tenant runtime.
