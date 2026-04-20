# P3-E14-T08 — Lane Ownership, PWA / SPFx Acceptance, and External Collaboration Deferrals

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E14-T08 |
| **Parent** | [P3-E14 Project Warranty Module](P3-E14-Project-Warranty-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T08 of 10 |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Governing — locked architecture |

---

## 1. Lane Ownership Rationale

The Warranty module follows the dual-lane capability model governed by P3-G1. This section establishes the definitive reasoning for how warranty capability is distributed across the two lanes — and why forcing full operational depth into SPFx would be incorrect.

### 1.1 Why warranty management must live in PWA

The Warranty Case Workspace (T07 §4) is a multi-zone, context-dense control surface. It requires:

- Multi-tab navigation within a single case record (Overview, Timeline, Evidence, Assignment, Related Items)
- Inline form entry with validation across linked records (coverage item, intake log, assignment, acknowledgment)
- File upload for evidence (photos, sub reports, inspection records)
- Real-time SLA rendering with calculated due-date states
- Next Move card with contextual action routing
- Communications timeline with reverse-chronological event log
- Permission-aware affordance visibility (show/hide/disable with explainers)

SPFx web parts operate in a constrained iframe environment with limited interaction budget, restricted vertical space, and no native file system access. Attempting to render the full Case Workspace inside a web part would produce a degraded experience that misrepresents warranty management as a low-stakes list view — the opposite of the mold-breaking operational surface this module is designed to be.

**The correct design:** SPFx surfaces awareness and posture. PWA surfaces action and depth.

### 1.2 Why SPFx awareness is still valuable

Many PM-adjacent roles in HB Intel's organization access Project Hub data through SharePoint-embedded web parts as their ambient context surface. For these users:

- A warranty tile showing open case counts and overdue alerts is immediately useful
- A read-only coverage list confirms that warranty coverage is tracked for their project
- A read-only case status list gives enough context to direct conversations with the PM

SPFx does not need to be the action surface to add real value. It is the ambient awareness layer that funnels users into PWA when action is required.

---

## 2. PWA Lane

### 2.1 PWA capability depth

The PWA lane delivers the full Warranty module capability set. Every feature defined in T01–T07 is implemented and acceptance-tested in PWA. SPFx capabilities are a strict subset.

| Capability area | PWA |
|---|---|
| Coverage Registry: full filter, sort, saved-view | ✓ |
| Coverage Registry: system views (§6.3 T07) | ✓ |
| Coverage item create / edit / expire / void | ✓ |
| Turnover and commissioning linkage from coverage item | ✓ |
| Warranty Case Workspace: full lifecycle (T04) | ✓ |
| Warranty Case Workspace: owner intake log | ✓ |
| Warranty Case Workspace: communications timeline | ✓ |
| Warranty Case Workspace: evidence upload and review | ✓ |
| Warranty Case Workspace: subcontractor assignment + acknowledgment | ✓ |
| Warranty Case Workspace: resolution record + back-charge advisory | ✓ |
| Next Move card (T07 §5) | ✓ |
| Complexity dial: Essential / Standard / Expert | ✓ |
| Permission explainability (T07 §9) | ✓ |
| HBI assistive behaviors (T07 §10) | ✓ (if package ready) |
| Related Items panel (T07 §7) | ✓ |
| Canvas tile (T07 §11) | ✓ |
| Saved views: personal, team, system (T07 §6) | ✓ |
| Work Queue integration (T09) | ✓ |
| Health signal publication (T09) | ✓ |

### 2.2 PWA primary build target

All acceptance criteria in T10 apply first to the PWA lane. No SPFx capability may substitute for a PWA capability that is acceptance-gated. A working SPFx web part with a non-functional PWA counterpart does not satisfy acceptance.

---

## 3. SPFx Lane

### 3.1 SPFx capability depth

The SPFx lane surfaces warranty posture and status awareness. It does not surface case management depth.

| Capability | SPFx | PWA |
|---|---|---|
| Canvas tile with open/overdue case counts | ✓ | ✓ |
| Coverage Registry: read-only list (essential tier) | ✓ | ✓ |
| Coverage Registry: filter by status | ✓ | ✓ |
| Coverage Registry: saved views (personal only) | ✓ | ✓ (full scope) |
| Case list: read-only with status and SLA state | ✓ | ✓ |
| Case detail: read-only summary view | ✓ | ✓ |
| Create coverage item | Launch to PWA | ✓ |
| Create warranty case | Launch to PWA | ✓ |
| Edit case (any field) | Launch to PWA | ✓ |
| Record acknowledgment | Launch to PWA | ✓ |
| Upload evidence | Launch to PWA | ✓ |
| Enter communications log event | Launch to PWA | ✓ |
| Create resolution record | Launch to PWA | ✓ |
| Close, void, or reopen a case | Launch to PWA | ✓ |
| Set back-charge advisory flag | Launch to PWA | ✓ |

### 3.2 What SPFx renders for the case list

The SPFx case list is the Essential tier case list (T07 §8.3): status badge (plain-language), SLA indicator, case title, and a "Open in Project Hub" action link per row. No tabs, no inline forms, no file picker.

The case list row action model in SPFx is: read, context, and escalate. Not: act.

### 3.3 SPFx deep-link handoff and context preservation

All escalations from SPFx to PWA must carry context so the PM lands on the correct surface without a navigation step. Escalation deep-links must include:

| Parameter | Value |
|---|---|
| `projectId` | The current project's canonical ID |
| `module` | `warranty` |
| `action` | One of: `case-detail`, `case-create`, `coverage-registry`, `coverage-item-detail` |
| `recordId` | Case ID or coverage item ID (where applicable) |
| `returnTo` | URL-encoded return path for back-navigation (optional; improves round-trip) |

Example: `https://app.hb-intel.com/projects/{projectId}/warranty/cases/{caseId}?returnTo={spfxContext}`

The PWA must accept these parameters and route directly to the specified surface without requiring the PM to re-navigate.

### 3.4 Why full case management depth is not forced into SPFx

Forcing the Case Workspace into SPFx would require:

1. **Re-implementing a multi-tab form surface inside a web part** — technically possible but an immediate maintenance liability, requiring separate testing paths, separate layout behavior, and separate accessibility validation for effectively the same feature
2. **File upload in an iframe context** — requires browser permission escalation that SharePoint blocks in several enterprise configurations
3. **Real-time SLA rendering in a constrained web part** — SLA computation and rendering is stateful; managing stale-state and re-render budgets inside a web part adds complexity that scales poorly
4. **Permission surface duplication** — The warranty authority matrix (T02 §6) must be enforced consistently; splitting case management across two surfaces doubles the enforcement surface area

The cost of full SPFx parity for case management exceeds the value. The Launch-to-PWA escalation is fast, context-preserving, and keeps the complex surface single-homed.

---

## 4. External Collaboration Deferrals

The following capabilities are explicitly deferred from Phase 3. They must not be prototyped, partially implemented, or scaffolded in Phase 3 code or routes. This section is the authoritative deferral list.

### 4.1 Owner intake portal

No owner-facing intake form, view, or authentication flow is included in Phase 3. The PM-proxy model (T05 §1) is the complete Phase 3 solution. Building any owner-facing surface in Phase 3 requires:

- `EXT_OWNER` role in `@hbc/auth` (not present in Phase 3)
- External URL routing and tenant isolation decisions (not made in Phase 3)
- Owner identity model and contact record structure (not built in Phase 3)

Partial owner-facing surfaces create brittle auth surfaces that the full Layer 2 build must refactor. They are not permitted in Phase 3.

### 4.2 Owner case status view

No page or route that surfaces `WarrantyCase` status to an owner user is built in Phase 3. The plain-language status mapping (T05 §4.2) is a PM-facing tool for communicating status externally — it is not an owner-accessible view in Phase 3.

### 4.3 Subcontractor portal access

No subcontractor-facing route, view, login, or notification dispatch is included in Phase 3. The PM-proxy model (T06 §1) is the complete Phase 3 solution. The `EXT_SUB` role does not exist in `@hbc/auth` in Phase 3.

### 4.4 PM + owner + subcontractor shared workspace

No shared workspace surface that combines PM, owner, and subcontractor views is built in Phase 3. This is the central Layer 2 deliverable. It is explicitly deferred.

### 4.5 External system integrations

No integration with external property management systems, owner communication platforms, subcontractor management systems, or insurance platforms is in Phase 3 scope.

### 4.6 Why explicit deferral matters

Each of these deferrals names a capability that could be partially built in Phase 3 without a gating architectural decision — there is no code-level lock that prevents it. The explicit deferral list is the governance artifact that prevents scope creep into capabilities whose underlying model is not yet settled. A PM or developer who sees the need for an owner status link should be directed to the deferral list, not to a partial implementation.

---

## 5. Future Workspace Addition Without Architectural Churn

Phase 3 is specifically designed so that Layer 2 can be added without a data migration, a schema change, or a breaking refactor of Phase 3 surfaces. The seam contracts that enable this are distributed across T02 (record model), T05 (owner seams), and T06 (subcontractor seams).

For the lane model, the architectural preconditions for a clean Layer 2 addition are:

| Precondition | Where it is established |
|---|---|
| `sourceChannel` discriminator on `IWarrantyCase` and `IOwnerIntakeLog` | T02 §6.1; T05 §5 |
| `enteredBy` discriminator on `ISubcontractorAcknowledgment` and `IWarrantyCaseEvidence` | T02; T06 §1.2 |
| No parallel record tables — one canonical source of truth | T05 §6; T06 §10 |
| `EXT_OWNER` role reserved in auth model (not active) | T02 §6.1 |
| `EXT_SUB` role reserved in auth model (not active) | T02 §6.1; T06 §9.1 |
| Deep-link parameters defined and PWA accepts them | §3.3 above |
| Owner-facing plain-language status mapping is a render-time table, not stored data | T05 §4.2 |

When Layer 2 arrives, its build process is:

1. Activate `EXT_OWNER` and `EXT_SUB` roles in `@hbc/auth`
2. Build external portal routing (separate from Project Hub internal routing)
3. Write intake, acknowledgment, evidence, and communication records to the Phase 3 record model with `sourceChannel = OwnerPortal` or `enteredBy = DirectSubcontractor`
4. Render the plain-language status mapping for owner-facing views
5. Configure `@hbc/notification-intelligence` for external notification routing

No Phase 3 records require migration. No schema change is required. The only schema addition is the `externalPartyRef` field on `IOwnerIntakeLog` (T05 §5.3), which is additive.

---

## 6. Phase 3 Acceptance Boundary Summary

Phase 3 is accepted when:

| Acceptance condition | Lane |
|---|---|
| Full case lifecycle functional (Open → Closed, all transition paths) | PWA |
| Coverage Registry with full CRUD and saved views | PWA |
| Owner Intake Log creation and case linkage | PWA |
| Communications timeline with event log | PWA |
| Subcontractor assignment and acknowledgment workflows | PWA |
| Resolution record creation and back-charge advisory | PWA |
| Canvas tile with Health-derived metrics | PWA + SPFx |
| Coverage Registry read-only list | SPFx |
| Case list read-only with status and SLA | SPFx |
| Deep-link handoff from SPFx to PWA with context | SPFx → PWA |
| No owner-facing UI in any lane | Both |
| No subcontractor direct access in any lane | Both |
| No external notification dispatch in any lane | Both |

Full acceptance criteria matrix is in T10.

---

*← [T07](P3-E14-T07-UX-Surface-Canvas-Saved-Views-Related-Items-and-Next-Move.md) | [Master Index](P3-E14-Project-Warranty-Module-Field-Specification.md) | [T09 →](P3-E14-T09-Reports-Health-Signals-Work-Queue-Publication-and-Telemetry.md)*
