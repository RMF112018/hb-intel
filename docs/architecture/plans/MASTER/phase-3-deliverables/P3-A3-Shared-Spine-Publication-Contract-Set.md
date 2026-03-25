# P3-A3: Shared Spine Publication Contract Set

| Field | Value |
|---|---|
| **Doc ID** | P3-A3 |
| **Phase** | Phase 3 |
| **Workstream** | A — Shared-canonical Project Hub contracts |
| **Document Type** | Contract |
| **Owner** | Project Hub / Project Operations platform owner + Platform / Core Services |
| **Update Authority** | Architecture lead; changes require review by Platform lead and Experience lead |
| **Last Reviewed Against Repo Truth** | 2026-03-20 |
| **References** | [Phase 3 Plan §8.3–§8.6, §14 Workstream D](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md); [P3-A1](P3-A1-Project-Registry-and-Activation-Contract.md); [P3-A2](P3-A2-Membership-Role-Authority-Contract.md); [current-state-map](../../../blueprint/current-state-map.md); [package-relationship-map](../../../blueprint/package-relationship-map.md); [`@hbc/my-work-feed` README](../../../../packages/my-work-feed/README.md); [`@hbc/related-items` README](../../../../packages/related-items/README.md); [`@hbc/features-project-hub` health-pulse](../../../../packages/features/project-hub/README.md) |

---

## Contract Statement

This contract defines how always-on core modules publish normalized data into the four shared project spines — **Activity**, **Health**, **Work Queue**, and **Related Items** — so that Project Hub can present coherent cross-module rollups on the project home canvas, activity views, reporting inputs, and cross-project continuity surfaces.

Phase 3 uses a **hybrid spine model** for all four spines (Phase 3 plan §8.3–§8.6):

- A **central normalized contract** defines the canonical item shape, registry pattern, project filtering, visibility rules, and count/badge semantics for each spine.
- **Modules retain authority** over item origin, business rules, completion semantics, deeper workflows, local thresholds, and richer drill-down behavior.
- Modules **publish** into spines through governed adapter and registration patterns. Spines **consume** those publications for normalized rollups.

Where upstream module data is connector-backed, that publication must already have been reduced to governed published read models or downstream module publications. Spines never ingest raw custody, normalized source-aligned records, thin canonical core outputs, or direct vendor connector contracts.

Three of four spines have mature existing implementations (`@hbc/my-work-feed`, `@hbc/features-project-hub` health-pulse, `@hbc/related-items`). The **Activity spine** is the primary new contract defined here.

**Repo-truth audit — 2026-03-20.** Work Queue spine (`@hbc/my-work-feed`, SF29, ADR-0115) is mature with a complete adapter registry, project-scoped filtering, and canonical item normalization. Health spine (`@hbc/features-project-hub` health-pulse, SF21) is mature with deterministic scoring, four dimensions, compound risk signals, explainability, and admin governance. Related-Items spine (`@hbc/related-items`, SF14) is mature with a bidirectional relationship registry, governance metadata, and AI suggestion hooks. Activity spine has no canonical implementation — only an `IGovernanceTimelineEvent` placeholder in `@hbc/related-items`. See §1 for full reconciliation.

---

## Contract Scope

### This contract governs

- The cross-spine architectural invariants that all four spines must follow
- The Activity spine publication contract (new — event type, registry, module emission expectations)
- Publication expectations for the Health, Work Queue, and Related-Items spines
- The module publication expectations matrix (what each always-on core module must publish into each spine)
- Cross-lane spine consistency requirements
- Project-scoped filtering requirements across all spines

### This contract does NOT govern

- Internal implementation of spine packages (adapter logic, scoring algorithms, normalization pipelines)
- Spine-specific UI rendering (canvas tiles, detail panels, full-page views) — governed by P3-C and P3-D deliverables
- Project registry identity or activation — see [P3-A1](P3-A1-Project-Registry-and-Activation-Contract.md)
- Role-based module visibility — see [P3-A2](P3-A2-Membership-Role-Authority-Contract.md)
- Individual spine deliverable specifications — see P3-D1 (Activity), P3-D2 (Health), P3-D3 (Work Queue), P3-D4 (Related Items)
- Notification-to-work signal mapping — governed by Phase 2 P2-C2

---

## Definitions

| Term | Meaning |
|---|---|
| **Spine** | A shared cross-module data contract that aggregates normalized contributions from multiple modules into a coherent project-level rollup |
| **Publication** | The act of a module making data available to a spine through a governed adapter or registration pattern |
| **Adapter** | A module-owned component that implements a spine's registration interface to provide normalized data from the module's domain |
| **Registry** | A module-singleton coordination point where adapters register at app-initialization time; the sole mechanism for spine-module coupling |
| **Project-scoped filtering** | The ability to filter spine data by `projectId` from the canonical project registry (P3-A1) |
| **Normalized item** | A data record that conforms to the spine's canonical shape, regardless of which module produced it |
| **Module-local authority** | The module's retained ownership over item origin, business rules, completion semantics, and richer drill-down behavior |
| **Deterministic projection** | A pure function that maps module data into a spine's normalized shape without side effects |
| **Activity event** | A normalized record of a meaningful change within a project, published into the Activity spine |
| **Health metric** | A normalized measurement that a module contributes to the project Health spine for scoring and status determination |

---

## 1. Current-State Reconciliation

### 1.1 Spine implementation status

| Spine | Package | Version | Maturity | Key Types | Registry Pattern |
|---|---|---|---|---|---|
| **Work Queue** | `@hbc/my-work-feed` | v0.0.1 | **Mature** (SF29, ADR-0115 locked) | `IMyWorkItem`, `IMyWorkSourceAdapter`, `IMyWorkQuery`, `IMyWorkFeedResult` | `MyWorkRegistry.register()` — singleton, freeze-on-write |
| **Health** | `@hbc/features-project-hub` | v0.0.1 | **Mature** (SF21) | `IProjectHealthPulse`, `IHealthDimension`, `IHealthMetric`, `IHealthPulseAdminConfig` | Integration adapters as deterministic projections in `health-pulse/integrations/` |
| **Related Items** | `@hbc/related-items` | v0.0.2 | **Mature** (SF14) | `IRelationshipDefinition`, `IRelatedItem`, `IGovernanceMetadata` | `RelationshipRegistry.registerBidirectionalPair()` — atomic symmetric registration |
| **Activity** | None | — | **Gap** | `IGovernanceTimelineEvent` placeholder only | None |

### 1.2 Existing registry patterns

All mature spines follow a consistent architectural pattern:

| Property | MyWorkRegistry | RelationshipRegistry | TileRegistry | NotificationRegistry |
|---|---|---|---|---|
| Registration timing | App initialization | App initialization | App initialization | App initialization |
| Singleton model | Module singleton | Module singleton | Module singleton | Module singleton |
| Late registration | Not supported | Not supported | Not supported | Not supported |
| Unregistration | Not supported | Not supported | Not supported | Not supported |
| Validation | On register | On register | On register | On register |
| Cross-adapter isolation | Enforced | Enforced | Enforced | Enforced |

The Activity spine registry (§3) MUST follow this same pattern.

### 1.3 Project context carriers

Every spine carries project context for filtering and navigation:

| Spine | Project context field | Filtering mechanism |
|---|---|---|
| Work Queue | `IMyWorkItem.context.projectId` | `IMyWorkQuery.projectId` |
| Health | `IProjectHealthPulse.projectId` | Direct field lookup |
| Related Items | Implicit via `sourceRecordType` parent lookup | Source record carries project association |
| Activity | To be defined (§3) | To be defined (§3) |

---

## 2. Cross-Spine Architectural Invariants

The following invariants apply to ALL four spines and MUST be preserved during Phase 3 implementation:

### 2.1 Registry pattern

Every spine MUST use a module-singleton registry with the following properties:
- Registration occurs at **app-initialization time only** — no late registration.
- The registry is the **sole coordination point** between spines and modules.
- Adapters are **isolated** — no adapter may reach into another adapter's data.
- Registration includes **validation** — malformed or duplicate registrations are rejected.

### 2.2 Project filtering

Every spine MUST support filtering by `projectId` from the canonical project registry (P3-A1):
- The `projectId` field MUST use the same canonical identifier defined in P3-A1 §2.1.
- Filtering MUST be deterministic — the same `projectId` always produces the same result set.
- Count/badge semantics MUST be computed from the filtered result set, not from separate queries.

### 2.3 Adapter isolation

Spine packages (`@hbc/my-work-feed`, `@hbc/related-items`, etc.) MUST NOT import from `packages/features/*`. Cross-module lookups route exclusively via:
- Public API contracts (registry entries, adapter interfaces)
- Shared model packages (`@hbc/models`)
- Platform packages (`@hbc/auth`, `@hbc/shell`)

### 2.4 Deterministic projections

Adapters that transform module data into spine-normalized shapes MUST be **deterministic pure functions** — no side effects, no network calls within the projection itself. Data fetching is the adapter's responsibility; normalization is a pure transformation.

### 2.5 UI composition rule

All spine UI surfaces MUST compose `@hbc/ui-kit` primitives. No duplicate design-system-grade components may be created within spine packages.

---

## 3. Activity Spine Publication Contract

The Activity spine is the primary new contract in this deliverable. It defines how modules publish normalized project activity events into a central stream that Project Hub consumes for home/canvas activity surfaces, project activity views, and reporting inputs.

### 3.1 Canonical activity event type

```
IProjectActivityEvent
├── eventId: string (UUID v4 — unique event identifier)
├── projectId: string (canonical project identity from P3-A1)
├── eventType: string (namespaced: e.g., 'financial.forecast-updated', 'safety.incident-reported')
├── category: ActivityCategory ('record-change' | 'status-change' | 'milestone' | 'approval' | 'handoff' | 'alert' | 'system')
├── sourceModule: string (publishing module key: 'financial', 'schedule', 'constraints', 'permits', 'safety', 'reports', etc.)
├── sourceRecordType: string (record type within the module: e.g., 'constraint', 'permit', 'safety-checklist')
├── sourceRecordId: string (identifier of the affected record)
├── summary: string (human-readable summary of what happened)
├── detail: Record<string, unknown> | null (structured detail payload — module-specific, schema-governed)
├── changedByUpn: string (UPN of the user who triggered the event)
├── changedByName: string (display name)
├── occurredAt: string (ISO 8601 — when the event occurred)
├── publishedAt: string (ISO 8601 — when the event was published to the spine)
├── significance: ActivitySignificance ('routine' | 'notable' | 'critical')
├── href: string | null (deep-link to the source record in Project Hub)
└── relatedEventIds: string[] (optional — for linking related events, e.g., approval chain)
```

### 3.2 Activity category semantics

| Category | Use | Examples |
|---|---|---|
| `record-change` | A record was created, updated, or deleted | Constraint added, permit status changed, financial forecast updated |
| `status-change` | A status or lifecycle transition occurred | Permit moved to Active, constraint closed, project health status changed |
| `milestone` | A milestone or deadline event | Schedule milestone completed, milestone at risk |
| `approval` | An approval or sign-off event | Report approved, safety checklist signed off, turnover acknowledged |
| `handoff` | A handoff or transfer between modules or users | Work item delegated, report released to distribution |
| `alert` | An attention-requiring signal | Safety incident reported, compound risk detected, overdue constraint |
| `system` | A system-originated event | Health recomputation, spine data refresh, batch import completed |

### 3.3 Activity significance levels

| Level | Meaning | Display behavior |
|---|---|---|
| `routine` | Normal operational activity | Shown in full activity view; may be collapsed in summary surfaces |
| `notable` | Activity worth highlighting | Shown prominently in activity tiles and summaries |
| `critical` | Activity requiring immediate attention | Shown with emphasis; may trigger notification-intelligence signals |

### 3.4 Activity registry pattern

The Activity spine MUST use a registry following the established cross-spine pattern:

```
ProjectActivityRegistry (module singleton)
├── register(entries: IActivitySourceRegistration[]) — one-time per source module
├── getAll() — all registered sources
├── getByModule(moduleKey: string) — lookup by module
├── getEnabledSources(context: IActivityRuntimeContext) — runtime-filtered sources
└── size() — count of registered sources
```

Each registration entry:

```
IActivitySourceRegistration
├── moduleKey: string (unique module identifier)
├── supportedEventTypes: string[] (namespaced event types this module can emit)
├── adapter: IActivitySourceAdapter
├── enabledByDefault: boolean
└── significanceDefaults: Record<string, ActivitySignificance> (default significance per event type)
```

The `IActivitySourceAdapter` interface:

```
IActivitySourceAdapter
├── isEnabled(context: IActivityRuntimeContext): boolean
├── loadRecentActivity(query: IActivityQuery): Promise<IProjectActivityEvent[]>
└── getEventTypeMetadata(eventType: string): IActivityEventTypeMetadata
```

### 3.5 Activity query contract

```
IActivityQuery
├── projectId: string (required — always project-scoped)
├── moduleKeys?: string[] (filter to specific modules)
├── categories?: ActivityCategory[] (filter to specific categories)
├── significance?: ActivitySignificance[] (filter by significance level)
├── since?: string (ISO 8601 — earliest event timestamp)
├── until?: string (ISO 8601 — latest event timestamp)
├── limit?: number (pagination limit)
└── cursor?: string (pagination cursor)
```

```
IActivityFeedResult
├── events: IProjectActivityEvent[]
├── totalCount: number
├── hasMore: boolean
├── nextCursor: string | null
└── lastRefreshedIso: string
```

### 3.6 Activity event namespace convention

Event types MUST use a `module.action` namespace convention:

| Module | Example event types |
|---|---|
| `financial` | `financial.forecast-updated`, `financial.budget-imported`, `financial.exposure-flagged` |
| `schedule` | `schedule.milestone-completed`, `schedule.file-uploaded`, `schedule.forecast-overridden` |
| `constraints` | `constraints.created`, `constraints.closed`, `constraints.delay-quantified` |
| `permits` | `permits.status-changed`, `permits.inspection-recorded`, `permits.expiration-warning` |
| `safety` | `safety.incident-reported`, `safety.checklist-completed`, `safety.orientation-recorded` |
| `reports` | `reports.draft-refreshed`, `reports.approved`, `reports.released` |
| `health` | `health.status-changed`, `health.compound-risk-detected`, `health.action-recommended` |

---

## 4. Health Spine Publication Contract

The Health spine is governed by the existing `IProjectHealthPulse` contract in `@hbc/features-project-hub` (SF21). This section defines module publication expectations, not the health model itself.

### 4.1 Module metric contribution expectations

Each always-on core module MUST contribute normalized metrics to the Health spine through deterministic integration adapters:

| Module | Required metric contributions | Health dimension |
|---|---|---|
| Financial | Budget variance, forecast accuracy, exposure level, cash flow status | Cost |
| Schedule | Milestone completion rate, schedule variance, critical path status | Time |
| Constraints | Open constraint count, overdue constraint count, delay impact total | Time + Office |
| Permits | Active permit count, pending inspection count, expiration risk count | Field + Office |
| Safety | Incident rate, open JHA count, checklist completion rate, orientation compliance | Field |
| Reports | Report currency (days since last approved PX Review / Owner Report) | Office |
| Work Queue | Project-scoped overdue item count, blocked item count | Office |

### 4.2 Metric publication rules

- Metrics MUST use the `IHealthMetric` shape defined in health-pulse types.
- Each metric MUST carry `isStale`, `lastUpdatedAt`, and `isManualEntry` metadata.
- Modules MUST NOT directly compute health scores — the Health spine owns scoring.
- Module-local thresholds and drill-down behavior remain module-owned.
- Metric updates MUST trigger health recomputation through the governed recomputation pipeline.

### 4.3 Health spine architecture boundary

The Health spine (`@hbc/features-project-hub/health-pulse/`) owns:
- Scoring algorithms, dimension weighting, compound risk detection
- Explainability output, recommended actions, triage projections
- Admin governance (staleness thresholds, manual override limits, office suppression policy)

Modules own:
- Metric data sourcing and freshness
- Local thresholds and alerts
- Richer drill-down and detail views

---

## 5. Work Queue Spine Publication Contract

The Work Queue spine is governed by the existing `IMyWorkItem` contract in `@hbc/my-work-feed` (SF29, ADR-0115). This section defines Phase 3 module publication expectations.

### 5.1 Module adapter registration expectations

Each always-on core module that produces actionable work items MUST register an `IMyWorkSourceAdapter` with `MyWorkRegistry`:

| Module | Required adapter | Work item examples |
|---|---|---|
| Financial | Yes | Forecast review due, budget import pending, exposure requires attention |
| Schedule | Yes | Milestone at risk, schedule update required, forecast override review |
| Constraints | Yes | Constraint nearing due date, constraint requiring response, delay quantification needed |
| Permits | Yes | Inspection due, permit expiring, permit application pending |
| Safety | Yes | Incident follow-up required, checklist due, orientation pending |
| Reports | Yes | Report draft stale, report approval pending, report distribution pending |

### 5.2 Project-scoped work queue rules

- All work items MUST carry `IMyWorkContext.projectId` for project-scoped filtering.
- Project-scoped work queue counts (`IMyWorkFeedResult.nowCount`, `blockedCount`, etc.) MUST be computed from the project-filtered result set.
- The project home canvas Work Queue tile MUST use `IMyWorkQuery.projectId` to show only the active project's items.
- Badge semantics on the Work Queue module nav MUST match project-scoped counts.

### 5.3 Work item lifecycle authority

- The Work Queue spine owns: canonical item shape, lane assignment, priority/scoring, deduplication, count semantics.
- Modules own: item origin, business rules, completion/update semantics, deeper module workflows.
- Modules MUST NOT modify work items through the spine — mutation flows through module-owned domain actions.

---

## 6. Related-Items Spine Publication Contract

The Related-Items spine is governed by the existing `IRelationshipDefinition` contract in `@hbc/related-items` (SF14). This section defines Phase 3 module publication expectations.

### 6.1 Module relationship registration expectations

Each always-on core module that has cross-module record relationships MUST register relationship definitions with `RelationshipRegistry`:

| Module | Required registrations | Example relationships |
|---|---|---|
| Financial | Budget → Schedule milestones, Financial → Constraints (cost impact) | `financial-forecast` → `schedule-milestone` |
| Schedule | Milestones → Constraints (schedule impact), Schedule → Permits (timeline dependency) | `schedule-milestone` → `constraint` |
| Constraints | Constraints → Financial (cost impact), Constraints → Schedule (delay impact) | `constraint` → `financial-forecast` |
| Permits | Permits → Inspections (linked required inspections), Permits → Schedule (timeline) | `permit` → `inspection` |
| Safety | Incidents → Follow-up actions, Safety plans → Subcontractor orientations | `safety-incident` → `safety-follow-up` |
| Reports | Reports → Module snapshots (data sources), Reports → Approvals | `report-run` → `module-snapshot` |

### 6.2 Relationship registration rules

- Relationships MUST use `RelationshipRegistry.registerBidirectionalPair()` to ensure symmetric visibility.
- Relationship definitions MUST include `governanceMetadata` with `relationshipPriority` for consistent ordering.
- `visibleToRoles` MUST align with the module visibility matrix in P3-A2 §4.1.
- Relationships MUST NOT create cross-feature package imports — resolution functions use record IDs and URL builders only.

### 6.3 Related-Items spine architecture boundary

The Related-Items spine (`@hbc/related-items`) owns:
- Relationship type registry, directionality, visibility rules
- AI suggestion hooks and resolver contracts
- Governance event emission (`IGovernanceTimelineEvent`)

Modules own:
- Local record linkage and data authority
- Richer drill-down behavior within the module
- Relationship creation/deletion business logic

---

## 7. Module Publication Expectations Matrix

The following matrix defines which spines each always-on core module MUST publish into:

| Module | Activity | Health | Work Queue | Related Items |
|---|---|---|---|---|
| **Financial** | **Required** | **Required** (Cost dimension) | **Required** | **Required** |
| **Schedule** | **Required** | **Required** (Time dimension) | **Required** | **Required** |
| **Constraints** | **Required** | **Required** (Time + Office) | **Required** | **Required** |
| **Permits** | **Required** | **Required** (Field + Office) | **Required** | **Required** |
| **Safety** | **Required** | **Required** (Field dimension) | **Required** | **Required** |
| **Reports** | **Required** | **Required** (Office dimension) | **Required** | **Required** |
| **Home / Canvas** | Consumes only | Consumes only | Consumes only | Consumes only |
| **Project Health** | **Required** (status changes) | Owns spine | Consumes only | Consumes only |
| **Activity** | Owns spine | Consumes only | Consumes only | Consumes only |
| **Work Queue** | **Required** (item changes) | **Required** (Office) | Owns spine | Consumes only |
| **Related Items** | **Required** (relationship changes) | Consumes only | Consumes only | Owns spine |

**Required** = module MUST register an adapter/registration and publish normalized data.
**Consumes only** = module reads from the spine but does not publish.
**Owns spine** = module is the spine's implementation owner.

---

## 8. Cross-Lane Spine Consistency Rules

The following MUST remain consistent across both the PWA and SPFx lanes:

1. **Same spine data source.** Both lanes MUST consume the same normalized spine data. Neither lane may maintain a separate spine data store.
2. **Same project filtering.** Given the same `projectId`, both lanes MUST produce the same spine results.
3. **Same count semantics.** Badge counts, summary counts, and feed totals MUST be identical across lanes for the same project and user.
4. **Same event semantics.** Activity event types, health status values, work item states, and relationship directions have the same meaning in both lanes.
5. **Same registration source.** Module adapters register once and serve both lanes. No lane-specific adapter variants.
6. **Lane-specific depth is presentation, not data.** The PWA may show richer activity detail or deeper drill-down, but the underlying spine data is the same.

---

## 9. Repo-Truth Reconciliation Notes

1. **Work Queue spine — compliant, ready for Phase 3 module adapters**
   `@hbc/my-work-feed` (SF29, ADR-0115 locked) is mature with a complete adapter registry, project-scoped filtering via `IMyWorkQuery.projectId`, and canonical item normalization. Current registered adapters serve Phase 2 sources (BIC, handoff, acknowledgment, notification, session-state). Phase 3 must register additional adapters for always-on core modules (Financial, Schedule, Constraints, Permits, Safety, Reports). Classified as **compliant — extension required**.

2. **Health spine — compliant, ready for Phase 3 module metric contributions**
   `@hbc/features-project-hub` health-pulse (SF21) is mature with deterministic scoring across four dimensions, compound risk detection, explainability, and admin governance. Integration adapters exist as deterministic projections. Phase 3 must wire always-on core modules as metric contributors. Classified as **compliant — extension required**.

3. **Related-Items spine — compliant, ready for Phase 3 relationship registrations**
   `@hbc/related-items` (SF14) is mature with bidirectional relationship registry, governance metadata, and AI suggestion hooks. Phase 3 must register cross-module relationships for always-on core modules. Classified as **compliant — extension required**.

4. **Activity spine — gap, requires new implementation**
   No canonical activity event type or registry exists. The only related artifact is `IGovernanceTimelineEvent` in `@hbc/related-items/src/reference/activityTimelineAdapter.ts` — a no-op placeholder designed to anticipate future activity integration. `INotificationEvent` in `@hbc/notification-intelligence` carries event metadata that is structurally similar to the proposed `IProjectActivityEvent` but serves a different purpose (user notification, not project activity audit). Phase 3 must implement the Activity spine contract defined in §3. Classified as **gap — new implementation required**.

5. **Cross-spine registry pattern — compliant**
   All three existing spines (`MyWorkRegistry`, `RelationshipRegistry`, `TileRegistry`) follow the same module-singleton, app-initialization, freeze-on-write pattern. The Activity spine registry defined in §3.4 follows this same pattern. Classified as **compliant**.

6. **Module adapters not yet registered for Phase 3 modules — controlled evolution**
   No always-on core module (Financial, Schedule, Constraints, Permits, Safety, Reports) has registered adapters with any spine. This is expected — these modules are Phase 3 scope. Module adapter registration is implementation-time work governed by this contract. Classified as **controlled evolution**.

---

## 10. Acceptance Gate Reference

**Gate:** Shared spine gates (Phase 3 plan §18.4)

| Field | Value |
|---|---|
| **Pass condition** | Health, activity, work queue, and related-items are fed by normalized project contracts; home, module pages, and reports consume those shared spines coherently |
| **Evidence required** | P3-A3 (this document), spine implementation for all four spines, module adapter registrations, project-scoped filtering verification, cross-lane consistency tests |
| **Primary owner** | Platform / Core Services + Project Hub platform owner |

---

## 11. Policy Precedence

This contract establishes the **spine publication foundation** that downstream Phase 3 deliverables must conform to:

| Deliverable | Relationship to P3-A3 |
|---|---|
| **P3-A1** — Project Registry and Activation Contract | Provides `projectId` used for all spine project filtering |
| **P3-A2** — Membership / Role Authority Contract | Provides module visibility rules that determine which spine data a user can see |
| **P3-C1** — Project Canvas Governance Note | Must consume spine data for mandatory operational core tiles (Health, Work Queue, Activity, Related Items) |
| **P3-C2** — Mandatory Core Tile Family Definition | Must align tile data sources with spine contracts |
| **P3-D1** — Project Activity Contract | Must implement the Activity spine contract defined in §3 |
| **P3-D2** — Project Health Contract | Must align with Health spine publication expectations in §4 |
| **P3-D3** — Project Work Queue Contract | Must align with Work Queue spine publication expectations in §5 |
| **P3-D4** — Related-Items Registry / Presentation Contract | Must align with Related-Items spine publication expectations in §6 |
| **P3-E1** — Module Classification Matrix | Must align module depth classifications with publication expectations in §7 |
| **P3-E2** — Module Source-of-Truth / Action-Boundary Matrix | Must respect spine architecture boundaries (§4.3, §5.3, §6.3) |
| **P3-G1** — PWA / SPFx Capability Matrix | Must respect cross-lane spine consistency rules (§8) |
| **P3-H1** — Acceptance Checklist | Must include shared spine gate evidence |

If a downstream deliverable conflicts with this contract, this contract takes precedence unless the Architecture lead approves a documented exception.

---

**Last Updated:** 2026-03-20
**Governing Authority:** [Phase 3 Plan §8.3–§8.6](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md)
