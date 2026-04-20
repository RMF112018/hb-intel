# P3-G2: Cross-Lane Navigation and Handoff Map

| Field | Value |
|---|---|
| **Doc ID** | P3-G2 |
| **Phase** | Phase 3 |
| **Workstream** | G — Dual-lane capability and coexistence |
| **Document Type** | Specification |
| **Owner** | Experience / Shell Team + Architecture |
| **Update Authority** | Architecture lead; changes require review by Experience lead and Project Hub platform owner |
| **Last Reviewed Against Repo Truth** | 2026-03-28 |
| **References** | [Phase 3 Plan §10](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md); [P3-G1 §5, §7](P3-G1-Lane-Capability-Matrix.md); [P3-B1 §6, §8](P3-B1-Project-Context-Continuity-and-Switching-Contract.md); [P3-C3 §8](P3-C3-Lane-Aware-Home-Canvas-Capability-Matrix.md); [P3-A1](P3-A1-Project-Registry-and-Activation-Contract.md) |

---

## Specification Statement

This specification defines the **complete cross-lane navigation map** for Phase 3 Project Hub — every scenario where a user navigates between the PWA and SPFx lanes, the deep-link URL format, context preservation mechanism, escalation flow, and return-navigation pattern.

P3-G1 §5 established launch-to-PWA escalation rules and §7 defined cross-lane navigation and handoff rules. P3-B1 §6 defined deep-link handling and §8 defined cross-lane context consistency. P3-C3 §8 defined canvas-level navigation depth. This specification consolidates and expands those rules into a single actionable navigation map.

Both lanes consume the same canonical shared contracts. Lane differences are about **depth, continuity, and host behavior**, not about inventing different project semantics (Phase 3 plan §10.1). Cross-lane navigation occurs when a user needs capabilities that the current lane cannot provide or when the user wants to access the project in the other lane's native context.

**Repo-truth audit — 2026-03-25.** The SPFx `BackToProjectHub` pattern exists for SPFx-to-PWA return navigation. The PWA deep-link handler processes arrival via route parameters per P3-B1 §6.1. The project registry (P3-A1) stores `siteUrl` for PWA-to-SPFx navigation. Stage 10.2 now adds governed module-lane surfaces in `apps/project-hub`, which means Launch-to-PWA actions are no longer theoretical placeholders: module pages must surface the handoff explicitly wherever P3-G1 marks a deeper workflow as `Launch-to-PWA`. Cross-lane navigation rules remain locked in P3-G1 §7, P3-B1 §6/§8, and P3-C3 §8. This specification formalizes those rules into a complete map.

---

## Specification Scope

### This specification governs

- All cross-lane navigation scenarios (SPFx-to-PWA and PWA-to-SPFx)
- Deep-link URL format and construction rules
- Launch-to-PWA escalation map (every scenario that triggers escalation)
- Context preservation during cross-lane handoff
- Return navigation mechanics (`returnTo` parameter, return-memory)
- Module-level cross-lane navigation patterns
- Canvas tile cross-lane navigation
- Error handling during cross-lane navigation

### This specification does NOT govern

- Within-lane navigation (PWA routing or SPFx routing independently)
- Lane capability depth — see [P3-G1](P3-G1-Lane-Capability-Matrix.md)
- Project context continuity mechanics — see [P3-B1](P3-B1-Project-Context-Continuity-and-Switching-Contract.md)
- Canvas tile content or governance — see [P3-C1](P3-C1-Project-Canvas-Governance-Note.md), [P3-C2](P3-C2-Mandatory-Core-Tile-Family-Definition.md)

---

## Definitions

| Term | Meaning |
|---|---|
| **Cross-lane navigation** | Any user navigation that transitions between the PWA and SPFx lanes |
| **Launch-to-PWA** | SPFx navigation pattern that opens the PWA for deeper interaction via a constructed deep link |
| **Deep link** | A URL that targets a specific project and optionally a specific module/page within the PWA |
| **Portfolio root** | The permission-aware unscoped Project Hub route at `/project-hub`; meaningful oversight + launch surface, not a thin selector |
| **Control Center** | The canonical project-scoped Project Hub route at `/project-hub/{projectId}` |
| **Handoff** | A cross-lane navigation that carries project identity and context from the source lane to the target lane |
| **returnTo parameter** | A URL-encoded return path included in a deep link for back-navigation to the source |
| **Site-URL resolution** | The process of resolving a SharePoint site URL to a project identity (P3-B1 §2.3) |
| **Escalation** | The act of routing a user from SPFx to PWA because the requested interaction requires PWA-depth capability |
| **Context preservation** | Ensuring project identity, membership, and module state remain consistent across a cross-lane navigation |

---

## 1. Current-State Reconciliation

| Artifact | Status | Relevance |
|---|---|---|
| `BackToProjectHub` pattern | **Live** — SPFx apps | Existing SPFx-to-PWA return navigation pattern |
| PWA deep-link handler | **Locked** — P3-B1 §6.1 | Processes arrival via route parameters |
| `siteUrl` in project registry | **Locked** — P3-A1 | Enables PWA-to-SPFx navigation |
| P3-G1 §7 cross-lane rules | **Locked** | PWA-to-SPFx and SPFx-to-PWA scenarios defined |
| P3-B1 §8 cross-lane consistency | **Locked** | Identity, membership, module availability consistency |
| P3-C3 §8 navigation depth | **Locked** | Canvas tile cross-lane patterns defined |

**Classification:** Cross-lane navigation patterns are established in governance. The `BackToProjectHub` pattern provides a working reference implementation. This specification formalizes and completes the navigation map.

---

## 2. Deep-Link URL Format

### 2.1 PWA deep-link format

```
{pwaBaseUrl}/project-hub/{projectId}
{pwaBaseUrl}/project-hub/{projectId}/{module}
{pwaBaseUrl}/project-hub/{projectId}/{module}?{queryParams}
{pwaBaseUrl}/my-work
```

| Component | Format | Example |
|---|---|---|
| Project Control Center | `/project-hub/{projectId}` | `/project-hub/abc-123` |
| Module page | `/project-hub/{projectId}/{module}` | `/project-hub/abc-123/financial` |
| Module with filter | `/project-hub/{projectId}/{module}?{params}` | `/project-hub/abc-123/permits?status=active` |
| Personal Work Hub | `/my-work` | `/my-work` |
| Portfolio root | `/project-hub` | `/project-hub` |

### 2.2 SPFx URL format

```
{siteUrl}/_layouts/15/workbench.aspx
{siteUrl}/SitePages/{appPage}
```

SPFx URLs are constructed from the project's `siteUrl` stored in the project registry (P3-A1).

### 2.3 Cross-lane query parameters

| Parameter | Usage | Example |
|---|---|---|
| `projectId` | Explicit project identity for cross-lane handoff | `?projectId=abc-123` |
| `returnTo` | URL-encoded return path for back-navigation | `?returnTo=%2Fproject-hub%2Fabc-123%2Fschedule` |
| `source` | Source lane identifier for analytics/telemetry | `?source=spfx` |
| `artifact` | Executive review artifact ID for preserving PER review context across lane handoff; builders may accept `reviewArtifactId` as an input field name but MUST serialize the wire query as `artifact` | `?artifact=rev-artifact-uuid` |

**Normalization rule:** All cross-lane handoffs MUST use `projectId` (UUID). If any inbound handoff carries a `projectNumber` instead of `projectId`, the receiving lane MUST normalize to `projectId` via registry lookup per P3-A1 §3.4 before constructing return links or processing context. All outbound deep links generated by either lane MUST use `projectId`, not `projectNumber`.

---

## 3. SPFx-to-PWA Navigation Map

Every scenario where SPFx navigates to PWA:

| # | Scenario | Trigger surface | Deep-link target | Context params | Return behavior |
|---|---|---|---|---|---|
| 1 | **Cross-project navigation** | Any SPFx surface needing another project | `/project-hub` (portfolio root) | None | No return (new project context) |
| 2 | **Schedule file ingestion** | Schedule module "Import Schedule" action | `/project-hub/{projectId}/schedule?action=import` | `projectId`, `returnTo` | Return to SPFx schedule view |
| 3 | **Schedule upload history/restore** | Schedule module "View History" action | `/project-hub/{projectId}/schedule?view=history` | `projectId`, `returnTo` | Return to SPFx schedule view |
| 4 | **Report run-ledger history** | Reports module "View Full History" action | `/project-hub/{projectId}/reports?view=history` | `projectId`, `returnTo` | Return to SPFx reports view |
| 5 | **Advanced draft recovery** | Session recovery prompt | `/project-hub/{projectId}?recovery=true` | `projectId` | No return (recovery flow) |
| 6 | **Multi-project portfolio** | Portfolio or cross-project view request | `/project-hub` (portfolio view) | None | No return (cross-project context) |
| 7 | **Full work queue feed** | Work Queue tile "View All" action | `/my-work?projectId={projectId}` | `projectId`, `returnTo` | Return to SPFx project home |
| 8 | **Full activity timeline** | Activity tile "View All" action | `/project-hub/{projectId}/activity` | `projectId`, `returnTo` | Return to SPFx project home |
| 9 | **Advanced canvas admin** | Canvas "Advanced Settings" action | `/project-hub/{projectId}?admin=canvas` | `projectId`, `returnTo` | Return to SPFx project home |
| 10 | **Personal Work Hub** | App shell "My Work" link | `/my-work` | None | No return (workspace-level) |
| 11 | **Executive review thread management** | Review annotation "Manage Thread" action (PER only) | `/project-hub/{projectId}/review?artifact={reviewArtifactId}&view=thread` | `projectId`, `reviewArtifactId`, `returnTo` | Return to SPFx review surface |
| 12 | **Multi-run review comparison** | PER "Compare Runs" action on reviewer-generated runs | `/project-hub/{projectId}/review?view=compare` | `projectId`, `returnTo` | Return to SPFx reports view |
| 13 | **Full executive review history** | PER "View All Review History" action | `/project-hub/{projectId}/review?view=history` | `projectId`, `returnTo` | Return to SPFx review surface |

### 3.1 Escalation trigger rules

SPFx MUST route to PWA when (P3-G1 §5.2 and §4.8):
- The interaction requires complex file processing (schedule ingestion)
- The interaction requires multi-step history browsing (upload history, report run-ledger)
- The interaction requires cross-project scope (portfolio, project switching)
- The interaction requires IndexedDB-backed session-state (advanced recovery)
- The interaction requires the full feed/timeline page (work queue feed, activity timeline)
- The interaction requires executive review thread management (replies, history, resolution)
- The interaction requires multi-run review comparison
- The interaction requires full executive review history browsing

Stage 10.2 module pages MUST surface these handoffs at the module level. It is not sufficient for the shell to have a generic launch utility; each affected module page must present an explicit action for its governed PWA-depth workflows.

Stage 10.3 closes the remaining runtime gap by requiring the rest of the map to be surfaced from the actual SPFx shell surfaces where the user reaches the lane-depth boundary:

- dashboard / home / canvas actions for portfolio-root, Personal Work Hub, work queue, activity, and advanced canvas administration
- module actions for schedule ingestion/history and run-ledger history
- reports / executive-review actions for advanced draft recovery, comparison, history, and artifact-specific thread management

If a scenario requires context that is not yet present on the current SPFx surface, the surface must render a truthful governed affordance that explains the missing context and blocks launch rather than fabricating an alternate deep link.

---

## 4. PWA-to-SPFx Navigation Map

| # | Scenario | Trigger surface | Target URL | Context preservation |
|---|---|---|---|---|
| 1 | **Access project in SharePoint** | Project header "Open in SharePoint" action | `{siteUrl}` from P3-A1 registry | Opens new tab; project identity via siteUrl |
| 2 | **View project documents** | Document-related actions | `{siteUrl}/Shared Documents/` | Opens new tab; document library navigation |
| 3 | **View project in site-native context** | Project context menu | `{siteUrl}` from P3-A1 registry | Opens new tab |

### 4.1 URL construction rules

- PWA constructs SPFx URLs from the project's `siteUrl` stored in the project registry (P3-A1).
- PWA-to-SPFx navigation always opens a **new tab** — the PWA session is not replaced.
- No `returnTo` parameter is used for PWA-to-SPFx (the user returns to PWA by switching tabs or using the existing PWA tab).

---

## 5. Context Preservation Rules

### 5.1 Identity preservation (P3-B1 §8)

All cross-lane navigation MUST preserve project identity. All generated deep links MUST use `projectId` (UUID), not `projectNumber`:

| Direction | Mechanism | Resolution |
|---|---|---|
| SPFx → PWA | Include `projectId` in deep-link URL path or query parameter | PWA resolves via route params (P3-B1 §2); normalizes `projectNumber` to `projectId` if present per P3-A1 §3.4 |
| PWA → SPFx | Use `siteUrl` from project registry | SPFx resolves via site-URL resolution (P3-B1 §2.3) |

**Normalization invariant:** During the transitional dual-key inbound routing period (P3-A1 §3.4), either lane receiving a `projectNumber` in a handoff URL MUST resolve it to `projectId` before generating any response links, return links, or internal state. New links generated after resolution MUST use `projectId` only.

### 5.2 Consistency guarantees (P3-B1 §8)

| Guarantee | Rule |
|---|---|
| Same project identity | Given navigation to the same project, both lanes resolve the same `projectId`, `projectNumber`, `projectName` |
| Same membership validation | Both lanes apply the same access eligibility rules (P3-A2 §6) |
| Same module availability | Both lanes show the same accessible modules for a given user and project (P3-A2 §4) |
| Route authority per lane | PWA uses URL route params; SPFx uses site-URL resolution — both are route-canonical within their lane |

### 5.3 State that does NOT transfer

| State | Reason |
|---|---|
| Canvas layout | Canvas persistence is lane-independent (P3-C3 §6.3) |
| Edit-mode state | Edit mode is session-local |
| Panel open/close state | UI state is session-local |
| Scroll position | UI state is session-local |
| Unsaved form data | Form state is session-local; users should save before navigating |

---

## 6. Return Navigation

### 6.1 returnTo parameter

| Aspect | Rule |
|---|---|
| **Format** | URL-encoded relative path: `?returnTo=%2Fproject-hub%2Fabc-123%2Fschedule` |
| **Usage** | SPFx includes when the user should return to SPFx after completing the PWA action |
| **Processing** | PWA reads `returnTo` and offers back-navigation after the action completes |
| **Omission** | Omit when the navigation is a context switch (cross-project, Personal Work Hub) |

### 6.2 Return-memory (P3-B1 §8.5)

| Aspect | PWA | SPFx |
|---|---|---|
| Per-project return-memory | Maintained — stores last-visited module per project | Not maintained — site-scoped navigation model |
| Cross-session persistence | Yes — stored in session-state | No |

### 6.3 Fallback behavior

When no `returnTo` is available and return-memory does not apply:
- PWA: navigate to the target project's Control Center
- SPFx: navigate to the project site home page

---

## 7. Escalation Mechanism

### 7.1 Step-by-step escalation flow

```
1. User triggers an action that requires PWA-depth capability
2. SPFx constructs the deep-link URL:
   a. Build PWA base URL
   b. Append /project-hub/{projectId}/{module} path
   c. Add action-specific query parameters
   d. Add ?returnTo= if return is appropriate
   e. Add ?source=spfx for telemetry
3. Open deep link in new tab (or navigate, host-dependent)
4. PWA deep-link handler (P3-B1 §6.1) processes the arrival:
   a. Extract projectId from route
   b. Validate project exists (P3-A1)
   c. Validate user access (P3-A2)
   d. Synchronize store
   e. Render requested page
   f. Update return-memory
```

### 7.2 Error handling

| Error | Behavior |
|---|---|
| Project not found | Render dedicated in-shell Project Hub not-available state using `@hbc/smart-empty-state`; no silent redirect to another project or workspace |
| Access denied | Render dedicated in-shell Project Hub no-access state using `@hbc/smart-empty-state`; no silent redirect to another project or workspace |
| Invalid module path | Fall back only to the authorized target project's Control Center |
| Network error | Show standard offline/error state |

---

## 8. Module-Level Navigation Matrix

For each always-on core module, the following defines cross-lane navigation patterns:

### 8.1 Financial

> **Repo-truth note (2026-03-28, updated).** Cross-lane navigation patterns are **target-state requirements**. Current PWA implementation: 9 canonical sub-tool routes are URL-routed at `/project-hub/:projectId/financial/:tool` with per-project context and return-memory (FIN-PR1 Stage 3 — mock data). SPFx Financial lane routes exist as infrastructure stubs (Stage 2) with no data-connected surfaces or launch-to-PWA actions. Per [Financial-LODM](financial/Financial-Lane-Ownership-Decision-Matrix.md): all deep editing is PWA-native; SPFx provides summary/status/Launch-to-PWA only. Per [Financial-CLHLC](financial/Financial-Cross-Lane-Handoff-and-Launch-Contract.md): SPFx launch constructs canonical PWA deep-link; no SPFx editing.

| Interaction | In-lane (SPFx) | Escalates to PWA | Deep-link format |
|---|---|---|---|
| Financial Home (summary tiles) | Yes (KPI band) | No | — |
| Open Financial (deep access) | No | **Yes** — Launch-to-PWA | `/project-hub/{projectId}/financial` |
| View Financial Summary (confirmed/published) | Yes (read-only) | No | — |
| Edit Financial Summary (Working) | No | **Yes** — Launch-to-PWA | `/project-hub/{projectId}/financial/forecast` |
| Budget import workflow | No | **Yes** — Launch-to-PWA | `/project-hub/{projectId}/financial/budget` |
| Budget import status | Yes (status view) | No | — |
| GC/GR editing | No | **Yes** — Launch-to-PWA | `/project-hub/{projectId}/financial/gcgr` |
| Cash Flow editing | No | **Yes** — Launch-to-PWA | `/project-hub/{projectId}/financial/cash-flow` |
| Buyout management | No | **Yes** — Launch-to-PWA | `/project-hub/{projectId}/financial/buyout` |
| Buyout status view | Yes (summary) | No | — |
| Review / PER status view | Yes (status indicator) | No | — |
| Review / PER annotation | No | **Yes** — Launch-to-PWA | `/project-hub/{projectId}/financial/review` |
| Publication management | No | **Yes** — Launch-to-PWA | `/project-hub/{projectId}/financial/publication` |
| Publication status / download | Yes (status + links) | No | — |
| History / audit summary view | Yes (recent activity) | No | — |
| History / audit investigation | No | **Yes** — Launch-to-PWA | `/project-hub/{projectId}/financial/history` |
| Checklist resolution | No | **Yes** — Launch-to-PWA | `/project-hub/{projectId}/financial/checklist` |
| Checklist posture view | Yes (badge) | No | — |

### 8.2 Schedule

| Interaction | In-lane (SPFx) | Escalates to PWA | Deep-link format |
|---|---|---|---|
| View schedule summary | Yes | No | — |
| Milestone tracking | Yes | No | — |
| Forecast overrides | Yes | No | — |
| **File ingestion** | No | **Yes** | `/project-hub/{projectId}/schedule?action=import` |
| **Upload history/restore** | No | **Yes** | `/project-hub/{projectId}/schedule?view=history` |

### 8.3 Constraints

| Interaction | In-lane (SPFx) | Escalates to PWA | Deep-link format |
|---|---|---|---|
| All CRUD operations | Yes | No | — |
| Change Tracking | Yes | No | — |
| Delay Log | Yes | No | — |

### 8.4 Permits

| Interaction | In-lane (SPFx) | Escalates to PWA | Deep-link format |
|---|---|---|---|
| All CRUD operations | Yes | No | — |
| Inspections | Yes | No | — |

### 8.5 Safety

| Interaction | In-lane (SPFx) | Escalates to PWA | Deep-link format |
|---|---|---|---|
| All CRUD operations | Yes | No | — |
| Safety plan management | Yes | No | — |
| Incident reports | Yes | No | — |

### 8.6 Reports

See P3-E9-T07 §6 for full cross-lane navigation details.

| Interaction | In-lane (SPFx) | Escalates to PWA | Deep-link format |
|---|---|---|---|
| View report list | Yes | No | — |
| Generate/queue report | Yes | No | — |
| View report output | Yes | No | — |
| PM narrative (basic) | Broad | No | — |
| Approval (PX Review) | Yes | No | — |
| Release / distribution state | Broad | No | — |
| **Run-ledger full history** | No | **Yes** | `/project-hub/{projectId}/reports?view=history` |
| **Advanced draft editing** | No | **Yes** | `/project-hub/{projectId}/reports/{familyKey}/draft` |
| **Multi-run comparison (PER)** | No | **Yes** | `/project-hub/{projectId}/review?view=compare` |
| **Review thread management (PER)** | No | **Yes** | `/project-hub/{projectId}/review?artifact={reviewArtifactId}&view=thread` |
| **Full executive review history (PER)** | No | **Yes** | `/project-hub/{projectId}/review?view=history` |

### 8.8 Executive Review (PER posture only)

Applies to Portfolio Executive Reviewer posture; non-PER users are unaffected by these escalation rules.

| Interaction | In-lane (SPFx) | Escalates to PWA | Deep-link format |
|---|---|---|---|
| View review-capable module content (read) | Yes | No | — |
| Place review annotations | Broad | No | — |
| Generate reviewer-generated review runs | Broad | No | — |
| Push-to-Project-Team | Broad | No | — |
| Confirm PER closure of pushed work item | Broad | No | — |
| **Executive review thread management** | No | **Yes** | `/project-hub/{projectId}/review?artifact={reviewArtifactId}&view=thread` |
| **Multi-run review comparison** | No | **Yes** | `/project-hub/{projectId}/review?view=compare` |
| **Full executive review history** | No | **Yes** | `/project-hub/{projectId}/review?view=history` |

**Context preservation rule:** When escalating to PWA for executive review, the `reviewArtifactId` MUST be included in the deep link. The PWA review handler extracts the artifact ID and restores the review context. `returnTo` should include the SPFx surface where the PER was working.

### 8.7 Health / Activity / Work Queue / Related Items

| Interaction | In-lane (SPFx) | Escalates to PWA | Deep-link format |
|---|---|---|---|
| Tile view | Yes | No | — |
| Panel overlay | Yes | No | — |
| **Full feed/timeline page** | No (WQ, Activity) | **Yes** | `/my-work?projectId={projectId}` or `/project-hub/{projectId}/activity` |
| Health explainability | Yes (shared component) | No | — |

---

## 9. Canvas Tile Navigation

Canvas tile interactions follow the navigation depth rules from P3-C3 §8:

### 9.1 Tile click behavior

| Tile | PWA behavior | SPFx behavior |
|---|---|---|
| Health | Navigate to health detail page (in-app) | Navigate to health detail (SPFx route) |
| Work Queue | Navigate to work queue page (in-app) | Open work queue panel; "View All" escalates to `/my-work?projectId={projectId}` |
| Activity | Navigate to activity timeline (in-app) | Show recent activity tile; "View All" escalates to `/project-hub/{projectId}/activity` |
| Related Items | Open Related Items panel (in-app) | Open Related Items panel (shared component) |
| Module tiles (Financial, etc.) | Navigate to module page (in-app) | Navigate to module page (SPFx route) |

Dashboard / home / canvas-level launches are first-class Stage 10.3 evidence. The SPFx lane must expose explicit actions for cross-project navigation, multi-project portfolio, Personal Work Hub, work queue, activity, and advanced canvas administration rather than relying on undocumented shell shortcuts.

### 9.2 Panel overlays

Panel overlays (Related Items panel, Work Queue panel) use the same shared components in both lanes. No cross-lane navigation occurs for panel interactions.

---

## 10. Cross-Lane Consistency Rules

### 10.1 MUST be preserved during navigation

| Rule | Description |
|---|---|
| Project identity | Same `projectId` resolved in both lanes after handoff |
| Membership | Same access eligibility applied in both lanes |
| Module availability | Same modules accessible in both lanes |
| Data consistency | Same spine data consumed (no lane-specific data branching) |

### 10.2 Acceptable differences

| Difference | Reason |
|---|---|
| Navigation model | PWA uses in-app routing; SPFx uses site-native routing |
| Return-memory | PWA-only feature (P3-B1 §8.5) |
| Canvas layout | Lane-independent persistence (P3-C3 §6.3) |
| Session recovery depth | PWA richer via IndexedDB; SPFx limited via localStorage |

---

## 11. Repo-Truth Reconciliation Notes

1. **`BackToProjectHub` pattern — compliant**
   Existing SPFx pattern for return navigation to PWA. Provides a working reference for the escalation mechanism. Classified as **compliant**.

2. **PWA deep-link handler — compliant (contract locked)**
   P3-B1 §6.1 defines the deep-link handling contract. PWA route handler processes `projectId` from URL path. Classified as **compliant — contract locked**.

3. **`siteUrl` in project registry — compliant (contract locked)**
   P3-A1 project registry stores `siteUrl` for each project, enabling PWA-to-SPFx URL construction. Classified as **compliant — contract locked**.

4. **Cross-lane navigation scenarios — formalized**
   P3-G1 §7 defined high-level scenarios. This specification expands them into a complete map with deep-link formats, context parameters, and return behavior. Classified as **gap — now formalized**.

5. **Module-level and shell-level escalation patterns — closed by Stage 10.3**
   Stage 10.2 introduced governed module surfaces but left parts of the 13-scenario escalation map only partially represented in runtime. Stage 10.3 closes that gap by requiring explicit trigger placement on module, dashboard / home / canvas, and reports / executive-review surfaces. Classified as **controlled evolution — Stage 10.3 closes runtime gap**.

---

## 12. Acceptance Gate Reference

**Gate:** Dual-lane gates (Phase 3 plan §18.7)

| Field | Value |
|---|---|
| **Pass condition** | Cross-lane navigation works correctly: SPFx-to-PWA escalation preserves context, all 13 Stage 10.3 scenarios are surfaced from their governed trigger surfaces, PWA-to-SPFx opens correct project site, return navigation functions, and no context loss occurs during handoff |
| **Evidence required** | P3-G2 (this document), SPFx-to-PWA deep links functional, module/dashboard/reports-review trigger placement proof, PWA-to-SPFx siteUrl navigation functional, `returnTo` parameter processed, project identity preserved across lane transitions, and error handling for invalid projects/access or missing launch context |
| **Primary owner** | Experience / Shell Team + Architecture |

---

## 13. Policy Precedence

This specification establishes the **cross-lane navigation and handoff rules** that implementation must satisfy:

| Deliverable | Relationship to P3-G2 |
|---|---|
| **P3-G1 §5, §7** — Lane Capability Matrix | Provides escalation rules and high-level handoff patterns that this specification expands into a complete map |
| **P3-B1 §6, §8** — Project Context Continuity | Provides deep-link handling, handoff launch behavior, and cross-lane consistency rules |
| **P3-C3 §8** — Canvas Navigation Depth | Defines canvas tile cross-lane navigation patterns referenced in §9 |
| **P3-A1** — Project Registry | Provides `siteUrl` for PWA-to-SPFx URL construction and `projectId` for identity preservation |
| **P3-A2** — Membership / Role Authority | Provides access eligibility rules applied during handoff arrival |
| **P3-G3** — Lane-Specific Acceptance Matrix | Must include cross-lane navigation acceptance criteria |
| **P3-H1** — Acceptance Checklist | Must include dual-lane navigation gate evidence |

If a downstream deliverable conflicts with this specification, this specification takes precedence for cross-lane navigation behavior unless the Architecture lead approves a documented exception.

---

**Last Updated:** 2026-03-22
**Governing Authority:** [Phase 3 Plan §10](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md)
