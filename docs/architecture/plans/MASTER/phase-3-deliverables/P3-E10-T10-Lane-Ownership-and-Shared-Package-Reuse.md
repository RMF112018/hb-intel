# P3-E10-T10 — Lane Ownership and Shared Package Reuse

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E10-T10 |
| **Parent** | [P3-E10 Project Closeout Module](P3-E10-Project-Closeout-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T10 of 11 |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Governing — locked architecture |

---

## 1. Package Identity and Layer

### 1.1 Package Placement

Project Closeout is a **Layer 5 (Feature) package** in the HB Intel monorepo:

```
packages/features/project-closeout/
  package name: @hbc/project-closeout
  layer: L5 Feature
```

Feature layer rules that apply:
- May import from L1 Foundation, L2 Platform, L3 Shared, L4 UI-Kit packages.
- Must not be imported by any other feature package directly.
- Cross-feature data flows exclusively through Spine contracts (Activity, Health, Work Queue) and read-only snapshot APIs.
- Must not import from `@hbc/reports`, `@hbc/financial`, `@hbc/permits`, `@hbc/safety`, `@hbc/schedule`, or any other feature package.

### 1.2 Package Contents

| What lives in `@hbc/project-closeout` | Notes |
|---|---|
| All Closeout record types and interfaces | `CloseoutChecklist`, `CloseoutChecklistItem`, `SubcontractorScorecard`, `ScorecardSection`, `ScorecardCriterion`, `LessonEntry`, `LessonsLearningReport`, `AutopsyRecord`, `AutopsyFinding`, `AutopsyAction`, `LearningLegacyOutput`, `CloseoutMilestone`, `ChecklistTemplate`, `PreSurveyTemplate`, `PreSurveyResponse` |
| Lifecycle state machine | Internal; not exported |
| Scoring formulas and impact magnitude derivation engine | Internal; backend service; not exported |
| Checklist completion percentage computation | Internal |
| Snapshot API handlers | Exported only via API boundary (`GET /api/closeout/...`); no package-level export |
| UI components for all five Closeout sub-surfaces | Feature-local; non-reusable versions stay in this package; any reusable visual primitive promoted to `@hbc/ui-kit` |
| Publication event emitters | Internal; emit to Spine via shared contracts |
| Pre-briefing pack assembly logic | Internal aggregation service; no cross-feature import; reads source modules via their API snapshot endpoints |

### 1.3 What Does NOT Live in `@hbc/project-closeout`

| Content | Correct owner |
|---|---|
| Org intelligence index data and read models (`LessonsIntelligenceIndexEntry`, `SubIntelligenceIndexEntry`, `LearningLegacyFeedEntry`) | Separate org-intelligence layer (Phase 3 — to be defined; see §1.4 below) |
| Sub intelligence viewer UI in Project Hub | Project Hub feature package; consumes org-intelligence query API |
| Lessons intelligence search UI in Project Hub | Project Hub feature package; consumes org-intelligence query API |
| Reusable visual components (scorecard section bars, progress rings, activity timeline) | `@hbc/ui-kit` if reused across modules |
| Work Queue routing logic | `@hbc/work-queue` (P3-D3) |
| Notification delivery | `@hbc/notification-intelligence` |

### 1.4 Org Intelligence Layer Placement (Open Architecture Decision)

The three org intelligence indexes (`LessonsIntelligence`, `SubIntelligence`, `LearningLegacy`) are derived read models populated from PE-approved Closeout publication events. Their placement is **not yet resolved** in the Phase 3 blueprint:

- **Option A:** Separate `@hbc/org-intelligence` package (L3 shared layer) — preferred if other modules (e.g., BIM, Estimating) will contribute to or consume org intelligence in the future.
- **Option B:** Internal read projection within `@hbc/project-closeout` — acceptable only if org intelligence is permanently single-source from Closeout records.

**Governing rule for Phase 3:** Do not couple the org intelligence read path into `@hbc/project-closeout`'s write path. The indexes are populated by Closeout events but must be independently queryable. Project Hub surfaces consume the indexes without touching Closeout operational records. This boundary holds regardless of which option is chosen.

> ⚠️ **This placement decision must be made before Stage 6 (Org Indexes) implementation begins.** See T11 §1 for no-go conditions.

---

## 2. Surface Model: PWA vs. SPFx

Closeout sub-surfaces must be designed for both delivery targets per HB Intel's multi-surface doctrine.

### 2.1 Surface Classification

| Sub-surface | PWA target | SPFx target | Notes |
|---|---|---|---|
| Closeout Execution Checklist | Full interactive surface | Full interactive surface — primary daily-use surface for field teams on SPFx | Item-by-item mutation; completion tracking; milestone visualization |
| Subcontractor Scorecard | Full interactive surface | Full interactive surface | Form-heavy; real-time scoring; sign-off workflow |
| Lessons Learned | Full interactive surface | Read-only panel in SPFx; full authoring in PWA | Rolling entry creation and report synthesis are primarily PM operations |
| Project Autopsy | Full interactive surface (PE-led) | Read-only summary in SPFx | Workshop facilitation is not a field activity; SPFx needs only outcome visibility |
| Project Closeout Health Summary | Full surface + executive roll-up | Lightweight summary widget in SPFx | Completion % and milestone status visible in SPFx |

### 2.2 SPFx-Specific Implementation Constraints

| Constraint | Rule |
|---|---|
| No `localStorage` or `sessionStorage` | SPFx context does not support browser storage; all state must be server-round-tripped or held in component state |
| No Next.js routing | SPFx uses its own webpart container; routing must be intra-component state machine, not Next router |
| Auth token | SPFx acquires auth token via SharePoint `spHttpClient` or ADAL; not via the PWA auth flow |
| Bundle size | SPFx webparts have stricter bundle size limits; feature-local code must stay lean; heavy dependencies (charts, editors) should be loaded lazily |
| Real-time updates | SPFx webparts cannot use long-polling or WebSocket without explicit approval; polling intervals should be configurable |
| Responsive layout | PWA surface is viewport-flexible; SPFx is typically rendered in a SharePoint column with fixed width constraints |

### 2.3 PWA-Specific Behavior

| Feature | Rule |
|---|---|
| Offline tolerance | Closeout checklist item mutations should queue if offline and sync on reconnect; scorecard and lesson forms should prevent partial submission if offline |
| Notification delivery | PWA uses push notification via `@hbc/notification-intelligence`; this channel is not available in SPFx |
| Print / PDF export | Sub scorecard and lessons snapshot PDF generation is triggered from PWA surfaces only |
| Deep linking | Lifecycle milestone Work Queue items link directly to the relevant Closeout sub-surface and record in the PWA |

---

## 3. Shared Package Integration

### 3.1 Required Packages — Integration Contract

Seven shared packages are required for Closeout. The table below specifies the integration contract for each.

#### @hbc/related-items

**Closeout role:** Surfaces cross-module record readiness signals for checklist items.

| Relationship pair | Source record | Target record | Purpose |
|---|---|---|---|
| `closeout-item → permit` | `CloseoutChecklistItem` | `IssuedPermit` | Items 2.8, 3.9 — suggests readiness when permit reaches `FINAL` |
| `closeout-item → financial-variance` | `CloseoutChecklistItem` | Financial variance record | Item 6.4 — reads final cost variance without direct import |
| `closeout-item → schedule-milestone` | `CloseoutChecklistItem` | Schedule milestone | Items with date fields — pulls actual dates from schedule |
| `autopsy-finding → lesson-entry` | `AutopsyFinding` | `LessonEntry` | Cross-reference within Closeout; may use related-items for navigation |

**Critical boundary:** Related record links are evidence suggestions only. They must never trigger automatic writes to Closeout item results. The UI may surface "Permit is Final — ready to mark item 3.9 Yes?" but the user must confirm. API must reject any mutation to `CloseoutChecklistItem.result` that is not explicitly user-initiated.

**Registration:** Closeout calls `RelationshipRegistry.registerBidirectionalPair()` for each pair during module initialization.

**Blocker risk:** If `@hbc/related-items` does not yet support cross-module relationship pairs spanning different feature packages (i.e., only supports same-package pairs), this is a **required enhancement** before Closeout Stage 1 completes. Verify the `registerBidirectionalPair` capability against the cross-package boundary.

#### @hbc/versioned-record

**Closeout role:** Provides immutable audit trail for all key record mutations.

| Record | Versioned fields | Why |
|---|---|---|
| `CloseoutChecklistItem` | `result`, `naJustification`, `itemDate` | Full audit trail of who changed each item and when |
| `SubcontractorScorecard` | All scoring fields; `publicationStatus` | Scoring history for governance review |
| `ScorecardCriterion` | `score`, `isNA` | Per-criterion change history |
| `LessonsLearningReport` | `publicationStatus`; header context fields | Publication lifecycle audit |
| `AutopsyRecord` | `status`; finding/action additions | Workshop record integrity |
| `ChecklistTemplate` | Full template content | Template version history (which version was active at checklist instantiation) |

**Blocker risk:** None anticipated — `@hbc/versioned-record` is a mature shared primitive. Verify that field-level (not record-level) versioning is supported if criterion-level audit trail is required.

#### @hbc/field-annotations

**Closeout role:** PE/PER review annotation layer across all five sub-surfaces.

| Attachment point | Entity type | Annotation use |
|---|---|---|
| `CloseoutChecklistItem` | `closeout-checklist-item` | PE observations on evidence quality or item interpretation |
| `SubcontractorScorecard` (header) | `closeout-scorecard` | Overall scorecard narrative observations |
| `ScorecardSection` | `closeout-scorecard-section` | Section-level review notes |
| `ScorecardCriterion` | `closeout-scorecard-criterion` | Per-criterion score observations |
| `LessonEntry` | `closeout-lesson-entry` | Situation, root cause, or recommendation observations |
| `LessonsLearningReport` | `closeout-lessons-report` | Overall report observations |
| `AutopsyFinding` | `closeout-autopsy-finding` | Finding clarification notes |
| `LearningLegacyOutput` | `closeout-learning-legacy-output` | Pre-publication review notes |

**Critical rule from T09:** Annotations are stored only in `@hbc/field-annotations`. Zero writes to operational Closeout records from annotation actions. This must be verified at integration time.

**Blocker risk:** None anticipated. Verify that role-gated annotation visibility (PE vs PER annotations have different visibility rules per T09 §4.3) is configurable in `@hbc/field-annotations`.

#### @hbc/workflow-handoff

**Closeout role:** Routes all formal approval handoffs from PM → PE.

| Handoff trigger | From | To | Record advanced |
|---|---|---|---|
| FinalCloseout scorecard submitted | PM / SUPT | PE | `SubcontractorScorecard.publicationStatus → SUBMITTED` |
| `LessonsLearningReport` submitted | PM | PE | `LessonsLearningReport.publicationStatus → SUBMITTED` |
| `AutopsyRecord` submitted for approval | PM | PE | `AutopsyRecord.status → PE_APPROVAL_PENDING` |
| `OWNER_ACCEPTANCE` evidence submitted | PM | PE | `CloseoutMilestone.status → EVIDENCE_PENDING` |
| Archive Ready criteria met | PM requests | PE | `CloseoutMilestone[ARCHIVE_READY].status → READY_FOR_APPROVAL` |

**Closeout does not implement its own approval routing.** All PE routing goes through `@hbc/workflow-handoff`.

**Blocker risk:** Moderate. Verify that `@hbc/workflow-handoff` supports:
1. Multiple open handoffs per project simultaneously (scorecard + lessons + autopsy may all be pending PE at the same time).
2. Handoff resolution that triggers a callback to update the originating Closeout record's `publicationStatus`.
3. PE "Request Revision" path that sends the handoff back to the originator with notes.

If these capabilities are partial or absent, this is a **required enhancement** before Stage 2.

#### @hbc/acknowledgment

**Closeout role:** Named-party sign-off for FinalCloseout scorecard submissions.

| Acknowledgment use case | Parties | Trigger |
|---|---|---|
| Scorecard PM sign-off | PM | PM submits FinalCloseout scorecard |
| Scorecard SUPT sign-off | SUPT | SUPT co-signs submitted scorecard |

`@hbc/acknowledgment` stores the formal sign-off record with userId, displayName, role, and timestamp. These are auditable. The Closeout module must surface the acknowledgment requirement in the scorecard submission flow and must reject submission if required acknowledgments are missing.

**Blocker risk:** Low. Verify that multi-party acknowledgments (PM + SUPT both required) are supported on a single entity.

#### @hbc/bic-next-move

**Closeout role:** Surfaces contextual next-action prompts to PM and PE.

| Prompt | Trigger condition | Target user |
|---|---|---|
| "Permit is Final — ready to mark item 3.9 Yes?" | Related permit reaches FINAL; item 3.9 = Pending | PM |
| "FinalCloseout evaluation for [Sub] not yet submitted" | 30+ days in `FINAL_COMPLETION` with no scorecard SUBMITTED | PM |
| "Lessons report not yet submitted" | 45+ days in `FINAL_COMPLETION`; report still Draft | PM |
| "Autopsy action item assigned to you is open" | Open `AutopsyAction` with `assigneeId = currentUser` | Action owner |
| "[Project] awaiting your Archive Ready approval" | ARCHIVE_READY criteria all pass; PE approval outstanding | PE |

Closeout registers these prompts via `@hbc/bic-next-move`'s prompt registration API. `@hbc/bic-next-move` handles contextual surfacing timing and de-duplication.

**Blocker risk:** Low-moderate. Verify that cross-module prompts (permits-triggered prompt surfaced in Closeout context) are supported.

#### @hbc/notification-intelligence

**Closeout role:** Manages notification delivery for workflow events.

| Notification | Trigger | Channel |
|---|---|---|
| PE review request (scorecard, lessons, autopsy) | Handoff raised via `@hbc/workflow-handoff` | In-app + email |
| Lien deadline approaching (14-day warning) | Item 4.14 `calculatedDate` within 14 days | In-app + email |
| Lien deadline missed | Item 4.14 `calculatedDate` passed | In-app + email + escalation |
| Archive Ready — PE action needed | All 8 criteria pass | In-app + email |
| Autopsy action item reminder | Open `AutopsyAction` overdue per `targetDate` | In-app |

Closeout generates notification payloads; `@hbc/notification-intelligence` handles channel selection, rate limiting, and delivery.

**Blocker risk:** Low. Verify that escalation path (lien deadline missed → escalation beyond PM) is configurable.

---

## 4. Spine Publication Integration

Closeout emits to three Spine contracts. It does not define these contracts.

| Spine | Package | Events emitted by Closeout | Frequency |
|---|---|---|---|
| Activity Spine (P3-D1) | `@hbc/project-activity` | 17 events per T08 §5.1 | Per lifecycle event |
| Health Spine (P3-D2) | `@hbc/health-indicator` | 4 dimensions per T08 §5.2 | Per item result change, per status change |
| Work Queue (P3-D3) | `@hbc/work-queue` | 7 Work Queue item types per T04 §7 | Per trigger condition |

**Conformance rule:** Closeout must emit to these contracts in the format defined by P3-D1, P3-D2, and P3-D3. If a Spine contract requires a field that Closeout does not produce, this must be resolved before the event is emitted — not suppressed.

---

## 5. Package Dependency Diagram

```
@hbc/project-closeout (L5 Feature)
  │
  ├─ @hbc/related-items         (L3 Shared)  — cross-module record links
  ├─ @hbc/workflow-handoff      (L3 Shared)  — PE approval routing
  ├─ @hbc/acknowledgment        (L3 Shared)  — named-party sign-off
  ├─ @hbc/field-annotations     (L3 Shared)  — PE/PER annotation layer
  ├─ @hbc/versioned-record      (L3 Shared)  — mutation audit trail
  ├─ @hbc/bic-next-move         (L3 Shared)  — next-action prompts
  ├─ @hbc/notification-intelligence (L3 Shared) — notification delivery
  ├─ @hbc/project-activity      (L3 Shared)  — Activity Spine contract
  ├─ @hbc/health-indicator      (L3 Shared)  — Health Spine contract
  ├─ @hbc/work-queue            (L3 Shared)  — Work Queue contract
  ├─ @hbc/auth                  (L2 Platform) — user identity and role resolution
  ├─ @hbc/session-state         (L2 Platform) — current project context
  └─ @hbc/ui-kit                (L4 UI)      — reusable visual components
```

### 5.1 Prohibited Dependencies

| Prohibited import | Why prohibited |
|---|---|
| `@hbc/financial` | Feature-to-feature coupling; financial data flows via snapshot API |
| `@hbc/permits` | Feature-to-feature coupling; permit links via `@hbc/related-items` |
| `@hbc/safety` | Feature-to-feature coupling; pre-briefing pack reads Safety via API |
| `@hbc/schedule` | Feature-to-feature coupling; schedule dates via `@hbc/related-items` |
| `@hbc/reports` | Reports consumes Closeout snapshots, not the reverse |
| Any org-intelligence read package (if separate) | Closeout writes to intelligence; it does not query it |

---

## 6. Lane Capability — P3-G1 Reconciliation

Per P3-G1 Lane Capability Matrix, Closeout occupies the following lanes. This table reflects the T-file additions (Autopsy sub-surface was absent from the prior lane entry):

| Lane | Capability added by Closeout | Notes |
|---|---|---|
| Project Records | Checklist, scorecard, lessons, autopsy records | All project-scoped |
| Org Intelligence Write | Publishes PE-approved records to org indexes on archive | Write path only; no read path back into Closeout |
| Lifecycle Gating | Drives formal lifecycle state transitions with PE approval gates | Interacts with project lifecycle manager |
| Work Queue | Produces PM and PE work queue items for operational and governance actions | Consumes P3-D3 contract |
| Health Signal | Publishes `closeoutCompletionPct`, `scorecardCoverage`, `lessonsReadiness`, `autopsyReadiness` | Consumes P3-D2 contract |
| Activity Signal | Publishes 17 documented Activity Spine events | Consumes P3-D1 contract |
| Reports Snapshot | Provides frozen snapshots for scorecard and lessons-learned PDF generation | API-boundary only |

**Required P3-G1 update:** Add Autopsy sub-surface to the Closeout lane entry. Verify that the Health and Activity signal lanes include the full T08 §5 event set.

---

*[← T09](P3-E10-T09-Permissions-Visibility-Executive-Review-Role-Matrix.md) | [Master Index](P3-E10-Project-Closeout-Module-Field-Specification.md) | [T11 →](P3-E10-T11-Implementation-and-Acceptance-Guide.md)*
