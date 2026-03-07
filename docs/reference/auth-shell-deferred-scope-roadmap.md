# Auth/Shell Deferred Scope Roadmap (Phase 5)

- **Status:** Phase 5 deferred-scope roadmap (required by PH5.18)
- **Date:** 2026-03-06

This roadmap captures deferred interview-driven Option C items. Each item is documented
with the required four-part structure.

## Deferred Item 1: Full Advanced Admin Governance Workspace

- **Not in Phase 5 scope:** advanced dashboards, broad analytics, bulk tooling, and high-density governance UX.
- **Intentionally deferred:** Phase 5 delivers minimum production admin operability only.
- **Expected future direction:** expand admin module into a richer governance workspace with advanced review/reporting surfaces.
- **Dependency assumptions for later implementation:** stable backend governance contracts from Phase 5.10-5.13 remain reusable; expanded telemetry/reporting inputs required.

## Deferred Item 2: Rich Request History and Notification Experience

- **Not in Phase 5 scope:** full request timeline UX, cross-channel notifications, and historical request analytics.
- **Intentionally deferred:** Phase 5 supports immediate request submission and review queue outcomes only.
- **Expected future direction:** introduce richer request tracking, notifications, and lifecycle timeline views.
- **Dependency assumptions for later implementation:** current request/audit identifiers remain stable and can seed timeline correlation.

## Deferred Item 3: Advanced Audit Monitoring and Analytics

- **Not in Phase 5 scope:** anomaly detection, trend dashboards, alerting pipelines, and deep audit analytics.
- **Intentionally deferred:** Phase 5 includes structured audit trail + operational visibility only.
- **Expected future direction:** add analytics and monitoring layers on top of structured events and archived history.
- **Dependency assumptions for later implementation:** event taxonomy and metadata schema remain backward compatible.

## Deferred Item 4: Tiered Retention by Event Type

- **Not in Phase 5 scope:** per-event-type retention windows and automated tier policies.
- **Intentionally deferred:** Phase 5 uses standard retention (180-day active + archive strategy).
- **Expected future direction:** define policy tiers by event criticality/regulatory classification.
- **Dependency assumptions for later implementation:** retention utilities and event-type taxonomy continue as extension seam.

## Deferred Item 5: Deep Custom Per-Feature Permission Grammar

- **Not in Phase 5 scope:** domain-specific permission DSLs beyond standardized feature/action model.
- **Intentionally deferred:** Phase 5 uses standardized action vocabulary + protected feature registration contract.
- **Expected future direction:** add deeper per-feature grammar via documented extension seams.
- **Dependency assumptions for later implementation:** registration contracts and action-grant mappings remain source of truth baseline.

## Deferred Item 6: Rich Shell-Status Multi-Message/Sub-State UI

- **Not in Phase 5 scope:** complex multi-message status composition and richer sub-state visualizations.
- **Intentionally deferred:** Phase 5 enforces one centralized fixed-priority status model.
- **Expected future direction:** evolve status presentation while preserving centralized arbitration ownership.
- **Dependency assumptions for later implementation:** existing priority model and status snapshot contract remain compatibility baseline.

## Deferred Item 7: Broad Offline-First Feature Behavior

- **Not in Phase 5 scope:** full offline-first sync conflict handling across feature domains.
- **Intentionally deferred:** Phase 5 provides controlled degraded mode only.
- **Expected future direction:** extend offline behavior per feature domain with conflict/sync policies.
- **Dependency assumptions for later implementation:** degraded eligibility, restricted-zone communication, and safe recovery boundaries remain enforced.

## Deferred Item 8: Expanded SPFx Host Integrations

- **Not in Phase 5 scope:** broad host-driven integration points beyond approved seam set.
- **Intentionally deferred:** Phase 5 permits only container metadata, identity handoff, and limited host signals.
- **Expected future direction:** evaluate additional host seams only with explicit boundary ADRs.
- **Dependency assumptions for later implementation:** shell composition authority remains in HB Intel shell; host never becomes source of truth.

## Traceability

- `docs/architecture/plans/PH5-Auth-Shell-Plan.md` (Explicitly Deferred Beyond Phase 5)
- `docs/architecture/plans/PH5.11-Auth-Shell-Plan.md` through `PH5.18-Auth-Shell-Plan.md`
- ADR chain `ADR-0064` through `ADR-0071`
