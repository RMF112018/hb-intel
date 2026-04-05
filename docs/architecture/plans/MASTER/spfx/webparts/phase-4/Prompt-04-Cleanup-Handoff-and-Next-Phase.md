# Prompt 04 — Cleanup, Handoff, and Next Phase

## Objective

Document the cumulative full-package rollout result and prepare the next-phase handoff after the package-wide build has been implemented and inspected.

## Tasks

1. Update the rollout/handoff documentation so it no longer assumes the package is still in single-target proof-case mode.
2. Capture the final cumulative architecture that now governs `hb-webparts`.
3. Record whether proof-case-only infrastructure is still needed, dormant, or ready for removal.
4. Define the next cleanup phase.

## Required analysis

Document:

- whether `HB_WEBPARTS_PROOF_CASE_IDS` still has a valid role
- whether proof-case entry maps are now transitional or permanent
- whether neutral-manifest / shim-era code can be removed
- whether the cumulative package is now the stable default
- what remaining technical debt was intentionally deferred

## Hard constraints

- Do not re-read files that are already in your active context unless needed for verification.
- Do not remove transitional infrastructure in this prompt unless it is already proven safe to remove.
- Do not leave the handoff implying that validated webparts should continue to be replaced by later targets.

## Required output

Produce:

1. a completion note
2. an updated rollout-pattern handoff document
3. a concise recommendation for the next phase, choosing one of:
   - cleanup/removal of dormant proof-case infrastructure
   - broader runtime validation and page-level hardening
   - packaging simplification after cumulative success

Be explicit about why that next phase is the right one.
