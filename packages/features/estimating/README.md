# @hbc/features-estimating

Estimating Bid Readiness feature package for HB Intel.

## 1. Adapter-over-Primitive Architecture

This package is a **domain adapter** over the reusable Tier-1 `@hbc/health-indicator` primitive. Core scoring, state management, versioning, and telemetry schemas are owned by the primitive. This package owns:

- **Profile defaults** — Estimating-specific criterion definitions, weights, and thresholds
- **UX composition** — Signal badges, dashboards, and checklists tailored to Estimating workflows
- **Domain adapters** — Maps between Estimating pursuit records and health-indicator contracts

No scoring engine or version lifecycle logic is duplicated in this package.

## 2. Estimating Profile Defaults and Admin Overrides

The `estimatingBidReadinessProfile` defines default criterion weights and threshold bands (green/yellow/red) for pursuit readiness scoring. Administrators can override profile defaults per-tenant via the Admin Intelligence configuration surface. Overrides are applied at runtime and persisted through `@hbc/versioned-record`.

## 3. Complexity-Mode Behavior

All three UI surfaces respect `@hbc/complexity` mode settings:

| Surface | Essential | Standard | Expert |
|---|---|---|---|
| **BidReadinessSignal** | Color dot only | Color dot + percentage | Color dot + percentage + trend |
| **BidReadinessDashboard** | Top-3 criteria | Full criteria list | Full criteria + history chart |
| **BidReadinessChecklist** | Blockers only | All criteria | All criteria + AI actions |

## 4. Offline Behavior and Optimistic Status Badges

- Service worker caching for read-path availability
- IndexedDB persistence via `@hbc/versioned-record` for local state
- Background Sync for deferred criterion updates when connectivity is restored
- Optimistic indicators: badges render last-known state with a staleness indicator until sync completes

## 5. Inline AI Action Constraints

Checklist rows expose inline AI actions subject to:

- **Source citation** — every AI suggestion must cite its data sources
- **Explicit approval** — no autonomous actions; user must confirm before any AI-driven change is applied
- **No sidecar chat** — AI actions are inline within the checklist, not a separate chat surface

## 6. KPI Telemetry Outputs

The `bidReadinessKpiEmitter` emits five UX KPIs:

1. **Time-to-green** — elapsed time from pursuit creation to all-green readiness
2. **Criterion-flip-rate** — frequency of criteria toggling between states
3. **AI-suggestion-accept-rate** — ratio of accepted vs. dismissed AI suggestions
4. **Dashboard-dwell-time** — time spent on the dashboard surface
5. **Checklist-completion-rate** — percentage of checklist items resolved per pursuit

These KPIs surface in the Admin Intelligence dashboard and Leadership reporting views.

## 7. SF22 Post-Bid Learning Adapter Surface

The `post-bid-learning` surface is an Estimating adapter over `@hbc/post-bid-autopsy`. It adds Estimating profile defaults, deterministic view projections, hook composition, and the `PostBidAutopsyWizard`, `AutopsySummaryCard`, and `AutopsyListView` UI surfaces without duplicating primitive-owned evidence, confidence, taxonomy, governance, publication, stale/supersession handling, or lifecycle logic.

## 8. Related Documentation

- [SF18 Master Plan](../../../docs/architecture/plans/shared-features/SF18-Estimating-Bid-Readiness.md)
- [SF18-T09 Testing and Deployment](../../../docs/architecture/plans/shared-features/SF18-T09-Testing-and-Deployment.md)
- [ADR-0107 Estimating Bid Readiness Signal](../../../docs/architecture/adr/ADR-0107-estimating-bid-readiness-signal.md)
- [ADR-0111 Health Indicator Readiness Primitive Runtime](../../../docs/architecture/adr/ADR-0111-health-indicator-readiness-primitive-runtime.md)

## 9. T09 Verification Commands

```bash
pnpm --filter @hbc/features-estimating verify:release
pnpm --filter @hbc/features-estimating test:storybook:ci
pnpm --filter @hbc/features-estimating test:playwright:smoke
```
