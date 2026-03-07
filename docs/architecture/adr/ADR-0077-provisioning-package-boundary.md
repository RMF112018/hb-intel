# ADR-0061: @hbc/provisioning Package Boundary

**Status:** Accepted
**Date:** 2026-03-07

## Context
Phase 6 introduces provisioning UI across seven apps. Shared logic risks duplication.

## Decision
`@hbc/provisioning` owns headless logic only: API client, SignalR hook, Zustand store slice,
TypeScript types. Visual UI components are built in each consuming app. This mirrors the
@hbc/auth / @hbc/shell pattern established in Phase 5.

## Consequences
The package has no React component exports. Apps must build their own visual surfaces
consuming the package's hooks and store.
