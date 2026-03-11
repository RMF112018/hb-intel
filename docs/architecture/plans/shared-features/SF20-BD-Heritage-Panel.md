# SF20 - BD Heritage Panel & Living Strategic Intelligence (`@hbc/features-business-development` adapter over `@hbc/strategic-intelligence`)

**Plan Version:** 2.0
**Date:** 2026-03-11
**Source Spec:** `docs/explanation/feature-decisions/PH7-SF-20-Module-Feature-BD-Heritage-Panel.md`
**Priority Tier:** 2 - Application Layer (BD and cross-module differentiator)
**Estimated Effort:** 5-6 sprint-weeks
**ADR Required:** `docs/architecture/adr/0105-bd-heritage-living-strategic-intelligence.md` + companion `@hbc/strategic-intelligence` ADR

> **Doc Classification:** Canonical Normative Plan - SF20 implementation master plan for BD Heritage Panel and Living Strategic Intelligence; governs SF20-T01 through SF20-T09.

---

## Purpose

SF20 now implements heritage and living intelligence as a BD adapter over the reusable Tier-1 `@hbc/strategic-intelligence` primitive. BD owns profile defaults, UX composition, and module-fit behavior; core intelligence model/offline/versioning/telemetry contracts are primitive-owned.

---

## Locked Decisions

| # | Decision | Locked Choice |
|---|---|---|
| L-01 | Primitive abstraction | Entire heritage/intelligence model is provided by Tier-1 `@hbc/strategic-intelligence` |
| L-02 | BIC ownership | Strategic gaps and intelligence risks create/link granular BIC records via `@hbc/bic-next-move` with avatar projection |
| L-03 | Progressive disclosure | `@hbc/complexity` controls Essential collapsed badge; Standard read-only panel + feed; Expert full form/queue/configure link |
| L-04 | Offline resilience | Service worker cache + IndexedDB via `@hbc/versioned-record` + Background Sync + optimistic indicators |
| L-05 | Inline AI | Contextual inline actions/placeholders in form/feed/panel only; citation + approval required; no sidecar chat |
| L-06 | Deep-linking, provenance, telemetry | `@hbc/related-items` deep-links, `@hbc/project-canvas` My Work projection, immutable `@hbc/versioned-record` provenance/snapshot freeze, five UX KPIs |

---

## Governance Alignment (PH7 Shared Features Evaluation)

SF20 aligns with PH7 governance: capabilities become shared primitives only when configuration-driven, reusable across modules, domain-agnostic, and materially reducing duplication. `@hbc/strategic-intelligence` satisfies this rule; SF20 is a bounded BD adapter profile.

---

## Package Directory Structure

```text
packages/strategic-intelligence/
|- src/types/
|- src/model/
|- src/api/
|- src/hooks/
|- src/components/
|- testing/

packages/features/business-development/
|- src/strategic-intelligence/
|  |- profiles/
|  |- adapters/
|  |- hooks/
|  |- components/
|  |- telemetry/
|  |- index.ts
|- testing/
```

Core intelligence lifecycle, approval-state contracts, offline queue semantics, provenance, and KPI schema live in `@hbc/strategic-intelligence`.

---

## Definition of Done

- [ ] all SF20 docs use locked L-01 through L-06 and no legacy D-* semantics
- [ ] canonical contracts are primitive-owned (`IStrategicIntelligence*`), with adapter projections documented
- [ ] BIC ownership and avatar/My Work projection behavior is documented
- [ ] complexity behavior is explicit for Essential/Standard/Expert across panel/feed/form/queue surfaces
- [ ] offline strategy includes SW cache, IndexedDB persistence, Background Sync, optimistic status badges
- [ ] inline AI action behavior includes citation and explicit approval constraints
- [ ] `@hbc/related-items`, `@hbc/project-canvas`, `@hbc/versioned-record`, `@hbc/notification-intelligence`, `@hbc/health-indicator`, and `@hbc/score-benchmark` interop contracts are documented
- [ ] SF20-T09 includes PH7 governance closure checks and companion primitive ADR linkage

---

## Task File Index

| File | Contents |
|---|---|
| `SF20-T01-Package-Scaffold.md` | primitive + adapter scaffolds and README requirements |
| `SF20-T02-TypeScript-Contracts.md` | canonical primitive contracts and BD adapter aliases |
| `SF20-T03-Heritage-Data-and-Intelligence-Storage.md` | primitive lifecycle/storage/provenance APIs |
| `SF20-T04-Hooks-and-State-Model.md` | primitive hooks + BD adapter orchestration and offline replay |
| `SF20-T05-BdHeritagePanel-and-StrategicIntelligenceFeed.md` | complexity-aware panel/feed behavior contracts |
| `SF20-T06-IntelligenceEntryForm-and-ApprovalQueue.md` | inline AI + approval queue + governance interactions |
| `SF20-T07-Reference-Integrations.md` | Tier-1 integration boundaries |
| `SF20-T08-Testing-Strategy.md` | fixtures and scenario matrix including offline/AI/KPI |
| `SF20-T09-Testing-and-Deployment.md` | closure gates, ADR/docs/index/state-map governance |
