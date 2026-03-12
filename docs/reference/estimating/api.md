# Estimating Bid Readiness API Reference

## Package

- `@hbc/features-estimating`

## Canonical Primitive Contracts

SF18 is adapter-only. Canonical runtime contracts are primitive-owned in `@hbc/health-indicator`:

- `IHealthIndicatorCriterion`
- `IHealthIndicatorState`
- `IHealthIndicatorProfile`
- `IHealthIndicatorTelemetry`

## Adapter-Level Public Surface

Primary adapter exports:

- `IBidReadinessViewState`
- `estimatingBidReadinessProfile`
- `resolveBidReadinessProfileConfig`
- `useBidReadiness`
- `useBidReadinessProfile`
- `useBidReadinessTelemetry`
- `BidReadinessSignal`
- `BidReadinessDashboard`
- `BidReadinessChecklist`

Integration adapter exports:

- BIC next-move reference adapter
- notification dispatch reference adapter
- versioned-record snapshot adapter
- complexity gating adapter
- approval authority adapter

Testing exports:

- `@hbc/features-estimating/testing`
- `createMockHealthIndicatorState`
- `createMockBidReadinessProfile`
- `createMockEstimatingPursuitForReadiness`
- `mockBidReadinessStates`

## Governance and Version Notes

- Adapter aliases using `IBidReadiness*` are compatibility-only; primitive `IHealthIndicator*` contracts are canonical.
- Version/governance metadata must be preserved across checklist and config mutation paths.
- Offline optimistic indicator states (`Saved locally`, `Queued to sync`) are part of the adapter view model contract.

## Related Artifacts

- [SF18 Master Plan](/Users/bobbyfetting/hb-intel/docs/architecture/plans/shared-features/SF18-Estimating-Bid-Readiness.md)
- [ADR-0107](/Users/bobbyfetting/hb-intel/docs/architecture/adr/ADR-0107-estimating-bid-readiness-signal.md)
- [ADR-0111](/Users/bobbyfetting/hb-intel/docs/architecture/adr/ADR-0111-health-indicator-readiness-primitive-runtime.md)
