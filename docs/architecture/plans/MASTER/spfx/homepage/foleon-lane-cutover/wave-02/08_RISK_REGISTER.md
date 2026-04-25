# 08 — Risk Register

## R1 — Dirty Baseline / Overlapping Homepage Changes

Risk: The planning workspace already showed uncommitted homepage and docs changes.

Mitigation: Implementation should start from a clean reviewed baseline or explicitly preserve user-owned changes. Do not revert unrelated files.

## R2 — Double Mounting Foleon Global

Risk: Loading or calling `window.__hbIntel_foleon` from the homepage would duplicate the standalone Foleon mount path.

Mitigation: Use `@hbc/foleon-reader` directly inside the homepage React tree. Add tests that assert no `window.__hbIntel_foleon` dependency.

## R3 — Missing Content-State API

Risk: `@hbc/foleon-reader` currently does not expose a clean status callback for shell content-state reporting.

Mitigation: Add the minimal optional `onStatusChange` callback. Treat it as diagnostics-only and non-telemetry. Decide whether this requires Foleon package rebuild/proof.

## R4 — Stale Homepage Expected Foleon Version

Risk: Homepage embedded config could point at `1.0.20.0` even though Wave 01 deployed Foleon `1.0.21.0`.

Mitigation: Property pane defaults, tests, tenant rollout, and closure must all use `1.0.21.0` unless a newer Foleon package is produced.

## R5 — Legacy Content-State Leakage

Risk: Existing `CompanyPulseZone` derives content state from legacy Company Pulse config, which would be stale after cutover.

Mitigation: Remove/replace legacy `normalizeCompanyPulseConfig` reporting. Lane host reports Foleon resolution state instead.

## R6 — Shell Governance Drift

Risk: Changing occupant IDs or row pairings would break protected shell contracts.

Mitigation: Preserve occupant IDs and zone registry. Do not alter default preset or protected row pairings. Run shell governance tests.

## R7 — Slot Fit / Overflow

Risk: Foleon reader chrome might overflow existing shell slots, especially paired minor/major contexts and phones.

Mitigation: Add a homepage wrapper CSS containment layer only if needed. Use existing shell stacking and shared Foleon responsive behavior. Validate no horizontal overflow.

## R8 — Auth Overreach

Risk: Adding a new auth path could duplicate token logic or require unnecessary permissions.

Mitigation: Use public SharePoint read path by default. Only pass `getAccessToken` when `foleonApiResource` is configured, using existing SPFx token provider.

## R9 — Tenant GUID Hardcoding

Risk: List IDs could be hardcoded in source for convenience.

Mitigation: Config/property-only list IDs. Add tests/search checks that no GUID literals appear in source for these list IDs.

## R10 — Package Proof Drift

Risk: Source, manifest version, and generated package artifact disagree.

Mitigation: Coherent version bump, package authority test, `build-spfx-package --domain hb-homepage`, effectiveness proof inspection, and closure artifact status.
