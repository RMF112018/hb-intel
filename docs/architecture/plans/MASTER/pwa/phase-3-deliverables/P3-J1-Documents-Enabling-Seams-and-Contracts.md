# P3-J1 — Documents Enabling Seams and Contracts

**Doc ID:** P3-J1
**Workstream:** J — Documents Enabling Seams
**Classification:** Specification
**Status:** Complete — E1–E8 all implemented (v0.2.15–v0.2.22); all 8 enabling workstreams closed
**Phase:** Phase 3 — Project Hub and Project Context
**Governing Plan:** [04_Phase-3_Unified-Documents-Enabling-Plan.md](./04_Phase-3_Unified-Documents-Enabling-Plan.md)
**Deferred Full Implementation:** `docs/architecture/plans/MASTER/06_Phase-5_Search-Connected-Records-and-Document-Access-Plan.md`

---

## 1. Purpose

This specification defines the eight enabling workstreams that Phase 3 must deliver so that the unified Documents feature can be implemented cleanly in Phase 5 without architectural rework. These are **seams and contracts only** — not a full document management product.

Phase 3 must leave the platform with:

- stable project-context launch contracts for the future Documents shell,
- a normalized project-zone model,
- a reusable source/authority/restriction vocabulary,
- project-related document references routed through `@hbc/related-items`,
- preview-first and adaptive-tablet contracts aligned to `@hbc/ui-kit`,
- publish/handoff event seams for future `@hbc/workflow-handoff` and `@hbc/publish-workflow` integration, and
- a contradiction register and Phase 5 handoff package produced from spike work.

Full Documents implementation — global shell, My Files, Department roots, smart views, platform-wide search — remains **Phase 5 scope** (see §9).

---

## 2. Guardrails

All Workstream J implementation must follow these constraints:

- Do **not** build a full standalone Documents product in Phase 3.
- Do **not** add direct Graph file operations outside `@hbc/sharepoint-docs`.
- Do **not** make raw SharePoint library URLs the long-term Project Hub document model.
- Do **not** introduce project-specific bespoke document surfaces that diverge from the future shared shell language and interaction model.
- Do **not** bypass `@hbc/ui-kit`, `@hbc/shell`, or existing shared primitives.
- Do **not** allow current deliverables to silently expand into global-search scope under the label of "project document access."

---

## 3. Workstream Definitions

### E1 — Project-Scoped Document Launch and Route Contracts

**Goal:** make Project Hub able to open the future Documents experience through a stable shared contract.

**Deliverables:**
- Route contract catalog: project-scoped document landing, project-zone landing, direct document deep link, raw library fallback, and escape hatch to future Global Documents
- Launch-state schema: `projectId`, `workspaceId`, `zoneId`, `sourceRoute`, `relatedRecordContext`, `searchScopeDefault`
- Redirect / deep-link handling rules

**Acceptance:**
- A future shared shell can be mounted without changing Project Hub's route assumptions.
- Project-scoped launches do not use raw SharePoint library URLs as their primary contract.

---

### E2 — Project Zone Model and Registry Schema

**Goal:** create the project-side normalized model Phase 5 will rely on.

**Deliverables:**
- Project-zone registry schema
- Zone-to-purpose and fallback mapping rules (default location target, fallback raw structure reference, visibility/governance metadata)
- Governance field matrix distinguishing globally governed vs project-extensible zones

**Acceptance:**
- Project document access can be represented in a normalized way even before the full shell exists.
- A project can be rendered through zones first and raw structure second without architectural contradiction.

---

### E3 — Project Hub Contextual Entry Surface

**Goal:** introduce the Project Hub document surface as a contextual entry point, not a separate product.

**Deliverables:**
- Project Hub entry-surface design using shared-shell language and patterns
- Component composition contract (all UI via `@hbc/ui-kit` — no feature-local primitive duplication)
- CTA paths: open project documents, view by zone, raw library fallback, related documents from records, preview when supported
- Empty-state and no-access states

**Acceptance:**
- The surface behaves like a launch/entry layer, not a divergent feature with its own vocabulary.
- User language and interaction patterns match the future shared shell direction.

---

### E4 — Related-Items and Connected Document References

**Goal:** make documents first-class related items in project context.

**Deliverables:**
- Related-document reference model: linked project records, record attachments, zone associations, restricted placeholders
- Rendering rules for Project Hub panels via `@hbc/related-items`
- Restricted-stub contract for contextual visibility (minimum metadata: title, sourceType, authorityState, availabilityState, originatingRecord, lastRelevantActivity)

**Acceptance:**
- Project-related documents can be surfaced through related-item context without broad permission leakage.
- Document references remain compatible with the Phase 5 connected-record model.

---

### E5 — Source, Authority, and Restriction State Vocabulary

**Goal:** establish the trust language now so Phase 5 does not invent conflicting meanings.

**Deliverables:**
- State vocabulary spec: governed project file, restricted item, preview available, raw library location, canonical / authoritative indicator, not-authoritative / linked copy
- UI state matrix bound to `@hbc/ui-kit` badge, list-row, preview-card, and empty-state patterns
- Copy/terminology guardrails (plain-language explanation rules; no SharePoint internals exposed to users)

**Acceptance:**
- The project layer uses one consistent trust model that Phase 5 can carry forward unchanged.
- Users can identify what they are looking at without learning SharePoint internals.

---

### E6 — Publish / Handoff Intent Seams

**Goal:** prepare Project Hub to participate in document promotion and handoff later without building the full product now.

**Deliverables:**
- Event contract catalog: publish requested, destination suggested, handoff requested, publish completed, publish failed
- Future workflow integration map (binding points for `@hbc/workflow-handoff`, `@hbc/publish-workflow`, `@hbc/notification-intelligence`)
- Notification seam design

**Acceptance:**
- Phase 5 can add guided publish/handoff without changing Project Hub's domain contracts.
- Phase 3 does not overbuild publish lifecycle UI before the product is ready.

---

### E7 — Preview and Adaptive Tablet/Field Contract

**Goal:** make sure the future preview-first model has the correct Project Hub seam now.

**Deliverables:**
- Preview shell contract (provider choice intentionally left abstract for Phase 5 to resolve)
- Adaptive behavior matrix: desktop / tablet / field mode
- `@hbc/ui-kit` adaptive dependency map

**Acceptance:**
- Project Hub does not assume native-open-first or desktop-only layouts.
- The future preview-first model can be introduced without redesigning the Project Hub surface.

---

### E8 — Data, Telemetry, and Readiness Spikes

**Goal:** remove uncertainty before Phase 5 commits broader implementation.

**Deliverables:**
- Spike findings memo: project-scoped registry resolution against real/proposed site-library patterns; auth/token flow for project-context document access; preview feasibility; handoff mechanics
- Contradiction / gap register
- Telemetry event shortlist: launch, preview, raw fallback, restricted-stub exposure, no-access states
- Phase 5 handoff recommendations

**Acceptance:**
- The biggest implementation unknowns are reduced before full Phase 5 execution.
- Any project-context assumptions that would damage the Phase 5 product are surfaced early.

---

## 4. Sequencing

The workstreams should be executed in three sequences. E1, E2, and E5 are front-loaded because contract and vocabulary stability must be established before any surface or integration work begins.

**Sequence A — contract and vocabulary stability (start first)**
- E1 Route and launch contracts
- E2 Project-zone schema
- E5 Source/authority state vocabulary

**Sequence B — contextual Project Hub behavior (then bind)**
- E3 Contextual entry surface
- E4 Related-document references
- E7 Preview/adaptive contract

**Sequence C — validation and future-proofing (then execute)**
- E6 Publish/handoff seams
- E8 Spikes, telemetry, contradiction register

---

## 5. Milestones

### M3D.1 — Project document context contracts locked
- Route/deep-link model approved
- Zone schema approved
- Source/authority state vocabulary approved

### M3D.2 — Project Hub contextual entry ready
- Project-scoped entry surface live
- Raw fallback path defined
- Related-item document references render correctly

### M3D.3 — Preview/adaptive and workflow seams ready
- Preview/details contract live
- Adaptive field/tablet requirements bound to `@hbc/ui-kit`
- Publish/handoff events defined

### M3D.4 — Phase 5 handoff package ready
- Spike findings complete
- Contradiction register updated
- Phase 5 handoff memo approved

---

## 6. Package and Lane Ownership

### PWA lane

Owns: project-scoped launch states in the PWA shell, future-compatible document route patterns, preview/details composition in shared-shell terms, and any Project Hub PWA entry surfaces. Future content-aware entry points must align to [P1-F12 Microsoft 365 Graph Content](../phase-1-deliverables/P1-F12-Microsoft-365-Graph-Content-Connector-Family.md) through published content read models and references, not direct Graph connector operations.

### SPFx lane

Owns: project-site companion launch points, contextual panels and links in SharePoint-hosted project surfaces, handoff into the shared shell when appropriate. SPFx must not create a separate project document product.

### Shared packages

| Package | Role in Workstream J |
|---|---|
| `@hbc/shell` | Project/workspace context for document launch states |
| `@hbc/auth` | Auth and permission gates for document access |
| `@hbc/sharepoint-docs` | SharePoint document operations only; all direct Graph calls route here; future Graph-content awareness must enter through `P1-F12` published read models and references |
| `@hbc/related-items` | Project related-item presentation (E4) |
| `@hbc/session-state` | Offline-safe state |
| `@hbc/workflow-handoff` | Future handoff seam (E6) |
| `@hbc/publish-workflow` | Future publication seam (E6) |
| `@hbc/notification-intelligence` | User feedback and status routing (E6) |
| `@hbc/ui-kit` | All reusable UI and adaptive patterns (E3, E5, E7) |

---

## 7. Acceptance Criteria

Phase 3 document enablement is complete only when all of the following are true:

1. Project Hub can launch document access through a stable shared contract rather than raw SharePoint assumptions.
2. A normalized project-zone model exists and is good enough for future rendering in Phase 5.
3. Source/authority/restriction states are defined and bound to `@hbc/ui-kit`.
4. Project-related documents can appear through related-item context safely.
5. The Project Hub surface uses future shared-shell language and does not invent a divergent local model.
6. Preview-first and adaptive-tablet assumptions are prepared, not contradicted.
7. Publish/handoff seams are defined without dragging the full publish product into Phase 3.
8. A contradiction register exists for any discovered blockers to Phase 5 execution.
9. Future Microsoft 365 content-aware document access is expressed through `P1-F12` published read models and references rather than direct connector or raw Graph layers.

---

## 8. No-Go Conditions

Do **not** declare this enablement work complete if any of the following remain true:

- Project Hub still depends on raw SharePoint library URLs as its primary document model.
- There is no normalized zone schema.
- Contextual document links cannot express restricted / authority / preview states.
- The Project Hub surface creates a local-only vocabulary that Phase 5 would have to undo.
- Publish/handoff events are absent, forcing future breaking changes.
- Tablet/field adaptation has been deferred to "later responsive cleanup" instead of a defined contract.
- Current P3 work has silently expanded into a half-built global Documents product.

---

## 9. Phase 5 Deferred Scope

The following are explicitly **not** Phase 3 scope and must not be treated as such:

- Global Documents navigation (My Files, Departments, Company root)
- Global smart views (Recent, Shared With Me, Pinned)
- Platform-wide document search ranking and taxonomy
- Broad publish workflow implementation
- Cross-workspace document unification beyond contract and launch prep
- Desktop-sync orchestration and offline document caching/editing features

**Governing Phase 5 plan:** `docs/architecture/plans/MASTER/06_Phase-5_Search-Connected-Records-and-Document-Access-Plan.md`

---

**Last Updated:** 2026-03-24
**Governing Plan:** [04_Phase-3_Unified-Documents-Enabling-Plan.md](./04_Phase-3_Unified-Documents-Enabling-Plan.md)
