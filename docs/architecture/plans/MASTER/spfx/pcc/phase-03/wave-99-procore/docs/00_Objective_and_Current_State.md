# Objective and Current State

## Objective

Implement the Procore data-layer remediation foundation as Wave 13A-13F while PCC is progressing through Wave 13 Buyout Log.

## Current State to Verify

Expected repo truth:

- Phase 3 roadmap places Buyout Log at Wave 13.
- Wave 13 documentation package is closed.
- Wave 13 model contracts and backend GET-only route may already exist.
- SPFx surface/client integration may be in progress.
- Existing Procore integration schema already defines no-full-mirror/no-direct-SPFx/no-secrets/deferred-writeback posture.

The local code agent MUST verify current repo truth before editing.

## Implementation Boundary

This package allows code changes only for shared contracts, fixtures, mock providers, read-model seams, SPFx fixture display, tests, and docs. It does not authorize live Procore API calls.
