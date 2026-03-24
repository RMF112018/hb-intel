# Phase 3 — Unified Documents Enabling Plan
**Document ID:** 04A  
**Classification:** Phase Enabling Plan Addendum  
**Status:** Proposed Update  
**Primary Role:** Define the late-Phase-3 enabling work needed so the unified Documents feature can be implemented cleanly in Phase 5 without dragging full feature scope into current Project Hub execution  
**Recommended Parent Location:** `docs/architecture/plans/MASTER/`  
**Read With:**  
- `04_Phase-3_Project-Hub-and-Project-Context-Plan.md`  
- `06_Phase-5_Search-Connected-Records-and-Document-Access-Plan.md`  
- `docs/architecture/blueprint/current-state-map.md`  
- `docs/architecture/blueprint/package-relationship-map.md`

---

## 1. Purpose

This plan defines the **enabling seams only** that should be implemented during the current Project Hub / Phase 3 cycle so that the unified Documents capability can later be implemented in Phase 5 without architectural rework.

This plan exists to prevent two failure modes:

1. **Premature full implementation** of the Documents feature inside Phase 3.
2. **Failure to prepare** the project-context, route, registry, and UX seams that Phase 5 will need.

This is intentionally an **enablement plan**, not a substitute for the Phase 5 implementation plan.

---

## 2. Context and Assumptions

### 2.1 Program posture

This plan assumes:

- the MASTER plan still places **Search, Connected Records, and Document Access** in **Phase 5**,
- **Project Hub** remains the authoritative project-centered operating layer of Phase 3,
- and current active development is still centered on **Phase 3 deliverables / P3-E10 in progress** per current execution direction.

### 2.2 Repo-truth foundations already present

Phase 3 should leverage, not re-invent, the following existing foundations:

- PWA shell and routing already exist.
- `/project-hub` already exists as a real route, even if the feature package remains partial.
- `@hbc/shell` already owns project/workspace context.
- `@hbc/auth` already owns dual-mode auth.
- `@hbc/session-state` already owns offline-safe session persistence.
- `@hbc/sharepoint-docs` already owns SharePoint document lifecycle and direct Graph file calls.
- `@hbc/related-items` already owns cross-record relationship presentation.
- `@hbc/workflow-handoff`, `@hbc/publish-workflow`, `@hbc/notification-intelligence`, and `@hbc/ui-kit` already provide shared primitives that Phase 3 should hook into rather than bypass.

### 2.3 Planning consequence

Phase 3 should **not** attempt to build:

- the full Global Documents shell,
- the full root model,
- global smart views,
- the full publish/canonical-record product,
- or platform-wide document search.

Instead, Phase 3 should produce the contracts, launch points, and project-scoped seams that make those Phase 5 workstreams straightforward.

---

## 3. Strategic Objective

Phase 3 must leave HB Intel with the following document-related capabilities in place:

1. **Project context can launch a future shared Documents shell cleanly.**
2. **Project-scoped document navigation can be normalized conceptually** even if the full Phase 5 shell is not yet built.
3. **Project Hub can express document relationships and authority states** without needing the full feature.
4. **The project layer does not hard-code raw SharePoint assumptions** that would later block the Phase 5 product.
5. **The current P3-E10 work can proceed without uncontrolled scope expansion** into a full document product.

---

## 4. Non-Negotiable Guardrails

Phase 3 enablement must follow all of the following:

- Do **not** build a full standalone Documents product in Phase 3.
- Do **not** add direct Graph file operations outside `@hbc/sharepoint-docs`.
- Do **not** make raw SharePoint library URLs the long-term Project Hub document model.
- Do **not** introduce workspace-specific bespoke document surfaces that diverge from the future shared shell.
- Do **not** bypass `@hbc/ui-kit`, `@hbc/shell`, or existing shared primitives.
- Do **not** allow current deliverables to absorb global-search scope under the label of “project document access.”

---

## 5. Phase 3 Enabling Scope

## 5.1 In scope

- Project-context launch contracts for future Documents entry
- Project-scoped route/deep-link shapes
- Project document-zone model and registry schema
- Raw-library fallback definition for Project Hub
- Initial project-scoped preview/details shell contract
- Source/authority badge vocabulary and UI states
- Related-item document reference model
- Restricted-stub behavior in project context
- Publish/handoff intent and event seams
- Adaptive tablet/field UI pattern requirements for project-scoped document surfaces
- Telemetry seam definitions for future document usage inside Project Hub

## 5.2 Out of scope

- Global Documents navigation
- Roots like My Files / Departments / Company as full product surfaces
- Global smart views such as Recent / Shared With Me / Pinned
- Platform-wide search ranking and taxonomy
- Broad publish workflow implementation
- Cross-workspace document unification beyond contract and launch prep
- Desktop-sync orchestration beyond plain guidance text
- Broad offline document caching/editing features

---

## 6. Workstreams

## 6.1 Workstream E1 — Project-Scoped Document Launch and Route Contracts

**Goal:** make Project Hub able to open the future Documents experience in a stable, shared way.

### Activities
- Define route contracts for:
  - project-scoped document landing
  - project-zone landing
  - direct document deep link
  - raw library fallback
  - escape hatch to future Global Documents
- Define launch-state parameters:
  - project id
  - workspace id
  - zone id
  - source route
  - related-record context
  - search scope default

### Deliverables
- Route contract catalog
- Launch-state schema
- Redirect / deep-link handling rules

### Acceptance
- A future shared shell could be mounted without changing Project Hub’s route assumptions.
- Project-scoped launches are not tied to raw SharePoint URLs as their primary contract.

---

## 6.2 Workstream E2 — Project Zone Model and Registry Schema

**Goal:** create the project-side normalized model Phase 5 will rely on.

### Activities
- Define the initial normalized project-zone schema.
- Map each zone to:
  - document purpose,
  - default location target,
  - fallback raw structure reference,
  - visibility/governance metadata.
- Define project-level supplemental zone request metadata.
- Define which parts are globally governed vs project-extensible.

### Deliverables
- Project-zone registry schema
- Mapping and fallback rules
- Governance field matrix

### Acceptance
- Project document access can be represented in a normalized way even before the full shell exists.
- A project can be rendered through zones first and raw structure second without architectural contradiction.

---

## 6.3 Workstream E3 — Project Hub Contextual Entry Surface

**Goal:** introduce the Project Hub document surface as a **contextual entry point**, not a separate product.

### Activities
- Add a governed Project Hub document entry surface or panel.
- Keep it explicitly scoped to the active project.
- Use future shared-shell language and patterns rather than creating a local-only product vocabulary.
- Provide clear CTA paths for:
  - open project documents
  - view by zone
  - raw library fallback
  - related documents from records
  - preview when supported

### Deliverables
- Project Hub entry-surface design
- Component composition contract
- Empty-state and no-access states

### Acceptance
- The Project Hub document surface behaves like a launch/entry layer, not a divergent feature.
- User language and interaction patterns match the future shared shell direction.

---

## 6.4 Workstream E4 — Related-Items and Connected Document References

**Goal:** make documents first-class related items in project context.

### Activities
- Define document reference objects for:
  - linked project records
  - record attachments
  - zone associations
  - restricted placeholders
- Bind Project Hub surfaces into `@hbc/related-items` where appropriate.
- Define when a document should appear as a related item vs a zone item vs both.
- Define the minimum metadata needed for contextual visibility:
  - title
  - source type
  - authority state
  - availability state
  - originating record
  - last relevant activity

### Deliverables
- Related-document reference model
- Rendering rules for Project Hub panels
- Restricted-stub contract for contextual visibility

### Acceptance
- Project-related documents can be surfaced through related-item context without broad permission leakage.
- Document references remain compatible with the future Phase 5 connected-record model.

---

## 6.5 Workstream E5 — Source, Authority, and Restriction State Vocabulary

**Goal:** establish the trust language now so later phases do not invent conflicting meanings.

### Activities
- Define project-context vocabulary and visual states for:
  - governed project file
  - restricted item
  - preview available
  - raw library location
  - canonical / authoritative indicator
  - not authoritative / linked copy
- Bind those states to `@hbc/ui-kit` badge, list-row, preview-card, and empty-state patterns.
- Define plain-language explanation copy rules.

### Deliverables
- State vocabulary spec
- UI state matrix
- Copy/terminology guardrails

### Acceptance
- The project layer uses one consistent trust model that can carry into Phase 5.
- Users can tell what they are looking at without learning SharePoint internals.

---

## 6.6 Workstream E6 — Publish / Handoff Intent Seams

**Goal:** prepare Project Hub to participate in document promotion and handoff later without implementing the full product now.

### Activities
- Define event and payload shapes for:
  - publish requested
  - destination suggested
  - handoff requested
  - publish completed
  - publish failed
- Identify where `@hbc/workflow-handoff`, `@hbc/publish-workflow`, and `@hbc/notification-intelligence` will bind later.
- Add lightweight UI affordances only where they support current Project Hub clarity.

### Deliverables
- Event contract catalog
- Future workflow integration map
- Notification seam design

### Acceptance
- Phase 5 can add guided publish/handoff without changing Project Hub’s domain contracts.
- Phase 3 does not overbuild publish lifecycle UI before the product is ready.

---

## 6.7 Workstream E7 — Preview and Adaptive Tablet/Field Contract

**Goal:** make sure the future preview-first model has the right Project Hub seam now.

### Activities
- Define the project-scoped preview/details surface contract.
- Define adaptive behavior requirements for:
  - desktop
  - tablet
  - field mode
- Bind those requirements to `@hbc/ui-kit` adaptive standards.
- Keep preview-provider choice abstract enough for Phase 5 to implement cleanly.

### Deliverables
- Preview shell contract
- Adaptive behavior matrix
- UI-kit dependency map

### Acceptance
- Project Hub does not assume native-open-first or desktop-only layouts.
- The future preview-first model can be introduced without redesigning the Project Hub surface.

---

## 6.8 Workstream E8 — Data, Telemetry, and Readiness Spikes

**Goal:** remove uncertainty before Phase 5 commits broader implementation.

### Activities
- Spike project-scoped registry resolution against real/proposed site-library patterns.
- Spike auth/token flow for project-context document access.
- Spike preview feasibility and handoff mechanics.
- Define telemetry events for:
  - launch
  - preview
  - raw fallback
  - restricted-stub exposure
  - no-access states
- Capture contradictions discovered during the spike.

### Deliverables
- Spike findings memo
- Contradiction / gap register
- Telemetry event shortlist
- Phase 5 handoff recommendations

### Acceptance
- The biggest implementation unknowns are reduced before full Phase 5 execution.
- Any project-context assumptions that would damage the Phase 5 product are surfaced early.

---

## 7. Suggested Sequencing Relative to Current P3 Work

### Sequence A — immediate insertion into current Project Hub planning
- E1 Launch and route contracts
- E2 Project-zone schema
- E5 Source/authority state vocabulary

### Sequence B — then bind into contextual Project Hub behavior
- E3 Contextual entry surface
- E4 Related-document references
- E7 Preview/adaptive contract

### Sequence C — then execute validation and future-proofing
- E6 Publish/handoff seams
- E8 Spikes, telemetry, contradiction register

This sequencing is intentionally front-loaded on **contract and vocabulary stability**, not feature breadth.

---

## 8. Milestones

### M3D.1 — Project document context contracts locked
- route/deep-link model approved
- zone schema approved
- source/authority state vocabulary approved

### M3D.2 — Project Hub contextual entry ready
- project-scoped entry surface live
- raw fallback path defined
- related-item document references render correctly

### M3D.3 — Preview/adaptive and workflow seams ready
- preview/details contract live
- adaptive field/tablet requirements bound to UI kit
- publish/handoff events defined

### M3D.4 — Phase 5 handoff package ready
- spike findings complete
- contradiction register updated
- next-phase handoff memo approved

---

## 9. Package and Lane Ownership

## 9.1 PWA lane
Owns:
- project-scoped launch states in the PWA shell
- future-compatible document route patterns
- preview/details composition in shared shell terms
- any Project Hub PWA entry surfaces

## 9.2 SPFx lane
Owns:
- project-site companion launch points
- contextual panels/links in SharePoint-hosted project surfaces
- handoff into the shared shell when appropriate

SPFx should not create a separate project document product.

## 9.3 Shared packages
- `@hbc/shell` — project/workspace context
- `@hbc/auth` — auth and permission gates
- `@hbc/sharepoint-docs` — SharePoint document operations only
- `@hbc/related-items` — project related-item presentation
- `@hbc/session-state` — offline-safe state
- `@hbc/workflow-handoff` — future handoff seam
- `@hbc/publish-workflow` — future publication seam
- `@hbc/notification-intelligence` — user feedback and status routing
- `@hbc/ui-kit` — all reusable UI and adaptive patterns

---

## 10. Acceptance Criteria

Phase 3 document enablement should not be considered complete until all of the following are true:

1. Project Hub can launch document access through a stable shared contract rather than raw SharePoint assumptions.
2. A normalized project-zone model exists and is good enough for future rendering.
3. Source/authority/restriction states are defined and reusable.
4. Project-related documents can appear through related-item context safely.
5. The Project Hub surface uses future shared-shell language and does not invent a divergent local model.
6. Preview-first and adaptive-tablet assumptions are prepared, not contradicted.
7. Publish/handoff seams are defined without dragging the full publish product into Phase 3.
8. A contradiction register exists for any discovered blockers to Phase 5 execution.

---

## 11. No-Go Conditions

Do **not** declare this enablement work complete if any of the following remain true:

- Project Hub still depends on raw SharePoint library URLs as its primary document model.
- There is no normalized zone schema.
- Contextual document links cannot express restricted / authority / preview states.
- The Project Hub surface creates a local-only vocabulary that Phase 5 would have to undo.
- Publish/handoff events are absent, forcing future breaking changes.
- Tablet/field adaptation is left to “later responsive cleanup” instead of a defined contract.
- Current P3 work has silently expanded into a half-built global Documents product.

---

## 12. Risks and Mitigations

| Risk | Why it matters | Mitigation |
|---|---|---|
| Scope creep in current P3 execution | Slows Project Hub and produces a shallow documents feature | Enforce the enablement-only boundary |
| Raw SharePoint assumptions become entrenched | Makes Phase 5 redesign expensive | Lock route, zone, and state contracts now |
| Project-only implementation diverges from future global shell | Creates duplicate products and retraining | Use shared-shell naming and launch assumptions |
| Publish semantics are ignored until too late | Causes breaking changes later | Define events and seams now even if UI remains light |
| Tablet/field behavior is deferred | Desktop assumptions become embedded in the surface | Bind adaptive expectations to UI kit during enablement |
| Document references leak permissions | Erodes trust | Use contextual restricted stubs only and keep broad visibility out of scope |

---

## 13. Immediate Next Actions

1. Insert this plan into the current Phase 3 planning stack as an addendum or linked enabling artifact.
2. Update the active Project Hub planning work so it explicitly distinguishes:
   - current enablement work,
   - deferred Phase 5 implementation work.
3. Stand up a short contradiction register for document-related P3 assumptions.
4. Create the initial project-zone schema and route contract before adding more document UI.
5. Ensure all current document-related P3 UI work routes through `@hbc/ui-kit` and shared-shell patterns.

---

## 14. Summary Verdict

The right Phase 3 action is **enablement, not implementation**.  
Project Hub should leave Phase 3 with the correct **context contracts, zone model, trust vocabulary, related-item seams, preview/adaptive contract, and publish/handoff seams** so that Phase 5 can later deliver the real unified Documents product without redoing project-context architecture.
