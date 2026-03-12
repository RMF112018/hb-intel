# @hbc/post-bid-autopsy

Read-only Tier-1 primitive seam for SF22 post-bid learning-loop published signals.

## Purpose

This package exposes public TypeScript contracts for published autopsy learning signals that downstream adapters and primitives can consume safely.

## Public Surface

- `PostBidLearningSignal` (discriminated union)
- `IBenchmarkDatasetEnrichmentSignal`
- `IRecalibrationInputSignal`
- `IPredictiveDriftInputSignal`

## Boundary Rules

- Read-only contract seam only.
- No domain outcome writes.
- No raw pursuit-detail payload exposure.
- App-shell-safe package surface (`apps/` imports are prohibited).
