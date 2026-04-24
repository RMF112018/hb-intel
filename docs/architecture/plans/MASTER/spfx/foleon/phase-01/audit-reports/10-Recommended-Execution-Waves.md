# 10 — Recommended Execution Waves

## Wave 01 — Source-of-Truth, Package Identity, Runtime Proof, and List Contracts

Purpose: make the Foleon app real on `main` and prove that it can be built, packaged, configured, and queried safely.

Prompts:

1. Reconcile missing Foleon implementation and commit reality.
2. Add/verify governed SPFx app package identity and build registration.
3. Implement runtime config validation and runtime binding proof.
4. Implement SharePoint list schemas, internal names, indexes, and query proof.

Exit criteria:

- `apps/hb-intel-foleon` exists on `main`.
- Manifest GUID and version are proven in source and package.
- Package build emits Foleon `.sppkg`.
- Runtime binding proof is safe and useful.
- List schemas and indexes are provisionable and testable.

## Wave 02 — Reader Security, Telemetry, Backend Sync, Admin, and Homepage Release UX

Purpose: turn the app from package-real into production-safe.

Prompts:

1. Implement Reader/origin/embed policy and iframe hardening.
2. Implement telemetry supportability and backend event seam.
3. Implement backend sync/admin/snapshot architecture or explicitly constrain launch scope.
4. Implement homepage launcher integration, Content Hub UX, accessibility, and release gates.

Exit criteria:

- Reader refuses unsafe content with typed failure reasons.
- No iframe renders on homepage highlights.
- `postMessage` handling is exact-origin, shape-safe, bounded, and cleaned up.
- Telemetry has correlation IDs and non-blocking failure behavior.
- Backend sync and admin deferrals are explicitly classified with release gates.
- E2E tests cover SharePoint-hosted critical flows.
