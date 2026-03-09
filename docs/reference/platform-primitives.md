# Platform Primitives Registry

**Version:** 1.0
**Last Updated:** 2026-03-09
**Phase:** PH7.4 — Shared-Feature Tier-1 Normalization
**Audience:** Developers, Architects, Feature Authors

---

## What Is a Tier-1 Platform Primitive?

A **Tier-1 Platform Primitive** is a shared-feature package that has been elevated from optional utility to mandatory-use status when its concern area is present in a feature. Tier-1 primitives are:

1. **Cross-module in scope** — they solve a problem that recurs across multiple feature domains.
2. **Differentiating in value** — they embody construction-tech UX advantages that no competitor provides consistently.
3. **Normalized in contract** — they expose stable, documented APIs with typed contracts, testing utilities, and Storybook stories.
4. **Release-gate participants** — their adoption status is checked during feature planning and release review.
5. **Non-duplicable** — new domain work must not re-implement their concern areas locally without an ADR exception (see [Non-Duplication Rule](#non-duplication-rule)).

### Qualification Criteria

A package qualifies as Tier-1 when it meets **all five** of the following:

| # | Criterion | Evidence Required |
|---|-----------|-------------------|
| 1 | Cross-module scope | Concern area present in ≥3 feature domains |
| 2 | Differentiating value | Documented in UX competitive study or architecture blueprint |
| 3 | Normalized contracts | Typed interfaces, exported hooks/components, testing sub-path |
| 4 | Release-gate participation | Listed in platform-primitives registry with adoption matrix |
| 5 | Clear adoption rules | Decision tree and mandatory-use conditions documented |

---

## In-Scope Tier-1 Packages

| Package | Name | Concern Area | Version | ADR | README |
|---------|------|-------------|---------|-----|--------|
| `packages/sharepoint-docs` | `@hbc/sharepoint-docs` | Document lifecycle management | v0.1.0 | — | [`packages/sharepoint-docs/README.md`](../../packages/sharepoint-docs/README.md) |
| `packages/bic-next-move` | `@hbc/bic-next-move` | Ball-in-court ownership tracking | v0.1.0 | [ADR-0080](../architecture/adr/ADR-0080-bic-next-move-platform-primitive.md) | [`packages/bic-next-move/README.md`](../../packages/bic-next-move/README.md) |
| `packages/complexity` | `@hbc/complexity` | Three-tier UI density context (Complexity Dial) | v0.1.0 | [ADR-0081](../architecture/adr/ADR-0081-complexity-dial-platform-primitive.md) | [`packages/complexity/README.md`](../../packages/complexity/README.md) |

---

## Package Detail

### `@hbc/sharepoint-docs` — Document Lifecycle Management

**Purpose:** Wraps Microsoft Graph document operations into a unified lifecycle covering pre-provisioning staging, upload, migration, and offline queue. Any feature that creates, reads, updates, or manages SharePoint-hosted documents must use this package.

**Concern Area:** Document upload, document listing, offline queue, migration tracking, conflict resolution, folder management, permission management.

**Mandatory-Use Conditions:**
- Feature involves uploading files to SharePoint
- Feature displays document lists from SharePoint libraries
- Feature needs offline document queue capability
- Feature manages document migration or conflict resolution

**Extension Rules:**
- New document-related UI components should be contributed to this package, not created locally in feature packages.
- Custom document workflows that extend the lifecycle should use `SharePointDocsProvider` and the existing hook layer.

**Maturity:** v0.1.0 (scaffold complete, core API and components implemented, zero adoption)

**Canonical Docs:**
- [`packages/sharepoint-docs/README.md`](../../packages/sharepoint-docs/README.md)
- [SF01 Master Plan](../architecture/plans/shared-features/SF01-SharePoint-Docs.md) (if exists)

---

### `@hbc/bic-next-move` — Ball-in-Court Ownership

**Purpose:** Platform-wide accountability primitive answering "Who owns the next move on this item?" Every actionable item across all HB Intel modules renders BIC ownership state through this package, extending Procore's Ball-In-Court concept into a consistent cross-platform primitive.

**Concern Area:** Ownership tracking, urgency tier calculation, transfer detection, cross-module item registry, blocked-state visibility.

**Mandatory-Use Conditions:**
- Feature displays ownership or "ball-in-court" for actionable items
- Feature tracks who is responsible for the next action on a record
- Feature needs urgency tier visualization (upcoming/watch/immediate)
- Feature implements ownership transfer or handoff workflows

**Extension Rules:**
- New BIC-aware modules must call `registerBicModule()` at bootstrap with a manifest key.
- Custom urgency thresholds are configured via `IBicNextMoveConfig.urgencyThresholds`, not by reimplementing urgency logic.
- Transfer detection uses `recordBicTransfer()` — do not build local transfer tracking.

**ADR Exception Rules:**
- If a feature needs ownership tracking that fundamentally differs from the BIC model (e.g., multi-party simultaneous ownership), file an ADR exception referencing [ADR-0080](../architecture/adr/ADR-0080-bic-next-move-platform-primitive.md).

**Maturity:** v0.1.0 (full implementation complete, zero adoption across features)

**Canonical Docs:**
- [`packages/bic-next-move/README.md`](../../packages/bic-next-move/README.md)
- [ADR-0080](../architecture/adr/ADR-0080-bic-next-move-platform-primitive.md)
- [SF02 Master Plan](../architecture/plans/shared-features/SF02-BIC-Next-Move.md)
- [API Reference](bic-next-move/api.md)
- [Module Adoption Guide](../how-to/developer/bic-module-adoption.md)
- [Server Aggregation Migration](../how-to/developer/bic-server-aggregation-migration.md)

---

### `@hbc/complexity` — Complexity Dial (Three-Tier Density)

**Purpose:** Platform-wide context answering "How much information should I show this user right now?" Provides a consistent three-tier density model (Essential / Standard / Expert) that all modules read to adapt UI density. Without this package, modules make independent density decisions, destroying cross-module consistency.

**Concern Area:** UI density adaptation, complexity tier persistence, role-derived defaults, admin tier locking, cross-tab synchronization, coaching visibility.

**Mandatory-Use Conditions:**
- Feature renders UI that should adapt to user expertise level
- Feature has fields, panels, or controls that vary by information density
- Feature includes coaching or onboarding content gated by user tier
- Feature needs to respect admin-locked complexity tiers

**Extension Rules:**
- Use `useComplexity()` to read the current tier — do not query storage directly.
- Use `HbcComplexityGate` for declarative show/hide — do not write conditional rendering against raw tier values.
- New components with density-aware behavior should accept `complexityMinTier`/`complexityMaxTier` props following the retrofit pattern in [complexity-sensitivity.md](./ui-kit/complexity-sensitivity.md).

**ADR Exception Rules:**
- If a feature needs a density model that differs from Essential/Standard/Expert (e.g., a four-tier model for a specialized domain), file an ADR exception referencing [ADR-0081](../architecture/adr/ADR-0081-complexity-dial-platform-primitive.md).

**Maturity:** v0.1.0 (full implementation complete, zero adoption across features)

**Canonical Docs:**
- [`packages/complexity/README.md`](../../packages/complexity/README.md)
- [ADR-0081](../architecture/adr/ADR-0081-complexity-dial-platform-primitive.md)
- [SF03 Master Plan](../architecture/plans/shared-features/SF03-Complexity-Dial.md)

---

## Decision Tree for Feature Authors

Use this decision tree when planning any new feature or modifying an existing one:

```
START: Does your feature involve any of these concern areas?
│
├── Documents (upload, list, migrate, offline queue)?
│   └── YES → You MUST use @hbc/sharepoint-docs
│       └── Import: SharePointDocsProvider, useDocumentUpload, useDocumentList, etc.
│       └── Do NOT build local document upload/list/queue logic
│
├── Ownership / "Who owns next move?" / accountability tracking?
│   └── YES → You MUST use @hbc/bic-next-move
│       └── Call registerBicModule() at bootstrap
│       └── Use useBicNextMove() for state, HbcBicBadge/Detail for rendering
│       └── Do NOT build local ownership/urgency logic
│
├── UI density / show-hide by expertise / coaching gates?
│   └── YES → You MUST use @hbc/complexity
│       └── Use useComplexity() or HbcComplexityGate
│       └── Accept complexityMinTier/complexityMaxTier props
│       └── Do NOT build local density/tier logic
│
└── NONE of the above?
    └── No Tier-1 primitive required for this concern area.
        └── Check if a new shared concern is emerging (≥3 modules) — if so, propose a new primitive.
```

### Exception Process

If your feature genuinely cannot use a Tier-1 primitive for a concern area it covers:

1. Draft an ADR in `docs/architecture/adr/` explaining the technical reason.
2. Reference the primitive's ADR (ADR-0080 or ADR-0081) and this registry.
3. Get architecture owner approval before proceeding with local implementation.
4. Record the exception in the [Adoption Matrix](#adoption-matrix) below.

---

## Adoption Matrix

Current adoption status across all active feature packages and applications.

### Legend

| Status | Meaning |
|--------|---------|
| **Required** | Concern area is present; primitive must be adopted |
| **Planned** | Adoption planned for a future phase |
| **N/A** | Concern area is not present in this package/app |
| **ADR-Excepted** | Exception granted via ADR |
| **Implemented** | Adoption complete |

### Feature Packages (11)

| Feature Package | `@hbc/sharepoint-docs` | `@hbc/bic-next-move` | `@hbc/complexity` |
|----------------|----------------------|---------------------|-------------------|
| `@hbc/features-accounting` | Planned | Required — manifest key pending | Planned |
| `@hbc/features-estimating` | Planned | Required (workflows: estimating-pursuit, estimating-kickoff) | Planned |
| `@hbc/features-project-hub` | Planned | Required (workflows: project-hub-pmp, project-hub-turnover, project-hub-constraints, project-hub-permits, project-hub-monthly-review) | Planned |
| `@hbc/features-leadership` | N/A | Required — manifest key pending | Planned |
| `@hbc/features-business-development` | Planned | Required (workflows: bd-scorecard, bd-department-sections) | Planned |
| `@hbc/features-admin` | N/A | Required (workflows: admin-provisioning) | Planned |
| `@hbc/features-safety` | Planned | Required — manifest key pending | Planned |
| `@hbc/features-quality-control-warranty` | Planned | Required — manifest key pending | Planned |
| `@hbc/features-risk-management` | Planned | Required — manifest key pending | Planned |
| `@hbc/features-operational-excellence` | N/A | Required — manifest key pending | Planned |
| `@hbc/features-human-resources` | N/A | N/A (no action-owning workflows) | Planned |

### Applications (14)

| Application | `@hbc/sharepoint-docs` | `@hbc/bic-next-move` | `@hbc/complexity` |
|------------|----------------------|---------------------|-------------------|
| `@hbc/spfx-accounting` | Planned | Required — manifest key pending | Planned |
| `@hbc/spfx-estimating` | Planned | Required (workflows: estimating-pursuit, estimating-kickoff) | Planned |
| `@hbc/spfx-project-hub` | Planned | Required (workflows: project-hub-pmp, project-hub-turnover, project-hub-constraints, project-hub-permits, project-hub-monthly-review) | Planned |
| `@hbc/spfx-leadership` | N/A | Required — manifest key pending | Planned |
| `@hbc/spfx-business-development` | Planned | Required (workflows: bd-scorecard, bd-department-sections) | Planned |
| `@hbc/spfx-admin` | N/A | Required (workflows: admin-provisioning) | Planned |
| `@hbc/spfx-safety` | Planned | Required — manifest key pending | Planned |
| `@hbc/spfx-quality-control-warranty` | Planned | Required — manifest key pending | Planned |
| `@hbc/spfx-risk-management` | Planned | Required — manifest key pending | Planned |
| `@hbc/spfx-operational-excellence` | N/A | Required — manifest key pending | Planned |
| `@hbc/spfx-human-resources` | N/A | N/A (no action-owning workflows) | Planned |
| `@hbc/dev-harness` | N/A | N/A | Planned |
| `@hbc/pwa` | Planned | Required | Planned |
| `@hbc/hb-site-control` | Planned | Required | Planned |

> **Note:** All feature packages and apps are currently at v0.0.0 (scaffold stage) with zero adoption of any Tier-1 primitive. "Required" status indicates the concern area is confirmed present; manifest keys are either assigned or pending. Statuses will be updated to "Implemented" as adoption phases execute.

---

## Release Gate Rule

**Rule:** No module with action-owning workflows ships without one of:

1. **Full BIC integration** — registered via `registerBicModule()`, UI wired with `HbcBicBadge`/`HbcBicDetail`, tests passing with canonical fixtures from `@hbc/bic-next-move/testing`.
2. **Explicit "N/A" classification** — documented rationale that the module has no action-owning workflows (e.g., `@hbc/features-human-resources`).
3. **ADR exception** — architecture owner approval with an ADR in `docs/architecture/adr/` referencing [ADR-0080](../architecture/adr/ADR-0080-bic-next-move-platform-primitive.md).

**Enforcement:** Release review must verify BIC status against this registry before approving any feature module for production deployment.

---

## BIC Adoption Detail

Per-module BIC integration status under `@hbc/bic-next-move`.

| Feature Package | Manifest Key(s) | Registration | UI Components | Testing | Release Gate | Exception ADR |
|----------------|-----------------|-------------|---------------|---------|-------------|---------------|
| `@hbc/features-business-development` | `bd-scorecard`, `bd-department-sections` | Pending | Pending | Pending | Blocked | — |
| `@hbc/features-estimating` | `estimating-pursuit`, `estimating-kickoff` | Pending | Pending | Pending | Blocked | — |
| `@hbc/features-project-hub` | `project-hub-pmp`, `project-hub-turnover`, `project-hub-constraints`, `project-hub-permits`, `project-hub-monthly-review` | Pending | Pending | Pending | Blocked | — |
| `@hbc/features-admin` | `admin-provisioning` | Pending | Pending | Pending | Blocked | — |
| `@hbc/features-accounting` | Pending | Pending | Pending | Pending | Blocked | — |
| `@hbc/features-leadership` | Pending | Pending | Pending | Pending | Blocked | — |
| `@hbc/features-safety` | Pending | Pending | Pending | Pending | Blocked | — |
| `@hbc/features-quality-control-warranty` | Pending | Pending | Pending | Pending | Blocked | — |
| `@hbc/features-risk-management` | Pending | Pending | Pending | Pending | Blocked | — |
| `@hbc/features-operational-excellence` | Pending | Pending | Pending | Pending | Blocked | — |
| `@hbc/features-human-resources` | N/A | N/A | N/A | N/A | N/A — no action-owning workflows | — |

> **BIC Registration Standard:** See [`docs/reference/bic-next-move/api.md`](bic-next-move/api.md) for compliance requirements.

---

## Non-Duplication Rule

**Architecture Rule:** New domain work must not re-implement Tier-1 primitive concern areas locally without an ADR exception.

Specifically:

1. **Document lifecycle operations** (upload, list, migrate, offline queue) must use `@hbc/sharepoint-docs`. Do not write local SharePoint Graph API calls, upload handlers, or document list components.

2. **Ownership/accountability tracking** (ball-in-court, next-move, urgency tiers) must use `@hbc/bic-next-move`. Do not write local ownership resolution, urgency calculation, or transfer detection logic.

3. **UI density/complexity adaptation** (tier-based show/hide, coaching gates, density context) must use `@hbc/complexity`. Do not write local tier checks, density toggles, or expertise-gated rendering.

**Enforcement:**
- Code review must verify that new features touching these concern areas import from the Tier-1 primitive, not from local implementations.
- The `@hb-intel/eslint-plugin-hbc` package may be extended with rules to detect local reimplementation of Tier-1 concern areas.
- Feature planning templates require explicit declaration of which Tier-1 primitives apply (see [Developer Planning Guidance](#developer-planning-guidance)).

**Exception Process:**
- File an ADR in `docs/architecture/adr/` with rationale.
- Reference this registry and the relevant primitive's ADR.
- Get architecture owner sign-off.
- Update the Adoption Matrix with "ADR-Excepted" status.

---

## Developer Planning Guidance

Every new feature plan must include the following section:

```markdown
## Tier-1 Platform Primitive Assessment

| Primitive | Concern Present? | Adoption Status | Exception ADR |
|-----------|-----------------|-----------------|---------------|
| `@hbc/sharepoint-docs` | Yes / No | Planned / N/A | — |
| `@hbc/bic-next-move` | Yes / No | Planned / N/A | — |
| `@hbc/complexity` | Yes / No | Planned / N/A | — |

<!-- If any concern is present but an exception is requested, reference the ADR here. -->
```

This assessment is a **mandatory section** in all feature plans created after PH7.4. Feature plans missing this section must be returned for revision before implementation begins.

**Cross-references:**
- [Platform Primitives Registry](../reference/platform-primitives.md) (this document)
- [ADR-0080 — BIC Next Move as Platform Primitive](../architecture/adr/ADR-0080-bic-next-move-platform-primitive.md)
- [ADR-0081 — Complexity Dial as Platform Primitive](../architecture/adr/ADR-0081-complexity-dial-platform-primitive.md)
- [Current-State Architecture Map](../architecture/current-state-map.md) §3 Category C

---

<!-- PH7.4 — Shared-Feature Tier-1 Normalization
Created: 2026-03-09
Sections: Tier-1 policy (§7.4.1), registry (§7.4.2), decision tree (§7.4.3),
          adoption matrix (§7.4.4), non-duplication rule (§7.4.5),
          developer planning guidance (§7.4.6)
-->
<!-- PH7.6 — BIC Standardization & Registration Enforcement
Updated: 2026-03-09
Changes:
  - BIC adoption matrix refined from coarse "Planned" to per-workflow classification (§7.6.2, §7.6.5)
  - Admin-provisioning conflict resolved: Option A — kept manifest key, updated matrix to "Required" (§7.6.2)
  - Release Gate Rule added (§7.6.4)
  - BIC Adoption Detail table added (§7.6.5)
  - Canonical docs links added to @hbc/bic-next-move package detail
  - Applications table updated to mirror feature package BIC classifications
-->
