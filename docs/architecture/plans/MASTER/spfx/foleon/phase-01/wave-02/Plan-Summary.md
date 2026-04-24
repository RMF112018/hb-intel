# Plan Summary — Wave 02

## Objective

Move the Foleon app from package-real to production-safe.

## Critical Path

1. Implement Reader gate, origin policy, iframe hardening, and postMessage validation.
2. Implement telemetry supportability and backend event seam.
3. Classify and implement backend sync/admin/snapshot requirements based on launch scope.
4. Integrate homepage launcher/discovery and close UX/accessibility/E2E release gates.

## Exit Criteria

- Reader rejects unsafe content with typed reasons.
- SharePoint trusted-domain and Foleon/custom-domain frame-ancestor requirements are documented and testable.
- No iframe renders on homepage highlights.
- Telemetry produces useful support evidence without blocking users.
- Backend/admin/sync deferrals have explicit release gates.
