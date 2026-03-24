# P3-E10-T11 — Implementation and Acceptance Guide

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E10-T11 |
| **Parent** | [P3-E10 Project Closeout Module](P3-E10-Project-Closeout-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T11 of 11 |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Governing — locked architecture |

---

## 1. Where to Start

An implementation team beginning Closeout should complete the following five orientation steps before writing any code:

1. **Read T01 §1–2** — understand the three surface classes and the hard boundary between operational writes (Class 1) and org intelligence reads (Class 2/3). This boundary governs every data flow decision in this module.
2. **Read T03 §1 and §3** — understand template governance and the full item metadata schema before touching any checklist data model. These fields are non-negotiable.
3. **Read T04 §2–4** — understand the state machine, milestones, and the 8-criterion Archive-Ready gate before building any lifecycle logic.
4. **Verify shared packages are unblocked** — use the blocker table in §2 below. Do not begin Stage 1 with unresolved blockers.
5. **Resolve the org intelligence placement decision** — T10 §1.4 documents an unresolved placement decision. Resolve before starting Stage 6.

---

## 2. Shared Package Blockers and No-Go Conditions

### 2.1 Blocker Table

| Package | Required capability | Blocker risk | No-go stage |
|---|---|---|---|
| `@hbc/related-items` | Cross-feature bidirectional pairs (`closeout-item → permit`; `closeout-item → financial`) | **Medium** — cross-feature pair support may not exist | Stage 1 (checklist readiness signals) |
| `@hbc/workflow-handoff` | Multiple concurrent open handoffs per project; revision (reject-back) path; callback on resolution | **Medium** — concurrent handoff and callback support may be partial | Stage 2 (PE approval gating) |
| `@hbc/acknowledgment` | Multi-party acknowledgment on a single entity (PM + SUPT both required) | **Low** | Stage 3 (scorecard sign-off) |
| `@hbc/field-annotations` | Role-gated visibility (PE vs PER annotations have different audiences) | **Low** | Stage 3 (PE annotation on scorecards) |
| `@hbc/versioned-record` | Field-level versioning (not just record-level) | **Low** | Stage 1 (item audit trail) |
| `@hbc/bic-next-move` | Cross-module trigger prompts (permit-triggered prompt surfaced in Closeout) | **Low-medium** | Stage 1 |
| `@hbc/notification-intelligence` | Escalation path configuration for missed deadlines | **Low** | Stage 4 (lien deadline) |

### 2.2 Hard No-Go Conditions

The following conditions must be resolved before the indicated stage may proceed to implementation. These are not deferred risks — they are blocking gates.

| Condition | Blocking stage | Resolution required |
|---|---|---|
| `@hbc/workflow-handoff` does not support concurrent open handoffs | Stage 2 | Package enhancement; Closeout cannot implement its own routing |
| `@hbc/workflow-handoff` does not support PE revision/reject-back path | Stage 2 | Package enhancement; this path is required for scorecard and lessons workflows |
| `@hbc/related-items` does not support cross-feature bidirectional pairs | Stage 1 | Package enhancement or architectural decision to use API-only cross-module data flow |
| Org intelligence layer placement is unresolved | Stage 6 | Architecture decision per T10 §1.4 before any org index implementation begins |
| `@hbc/bic-next-move` has no prompt registration API | Stage 1 | Package enhancement or descope of BIC integration for Phase 3 |

---

## 3. Implementation Sequence

Stages have sequential dependencies. Stage N must have an approved acceptance gate before Stage N+1 begins. Within a stage, deliverables may be built in parallel.

```
Stage 1: Checklist Core
    ↓
Stage 2: Lifecycle State Machine + Milestones
    ↓
Stage 3: Subcontractor Scorecard         ┐
Stage 4: Lessons Learned                 ├── may overlap after Stage 2 gate
Stage 5: Project Autopsy                 ┘
    ↓ (all three complete)
Stage 6: Org Intelligence Indexes + Project Hub Consumption
    ↓
Stage 7: Cross-Module Integration Verification + Release Readiness
```

### Stage 1: Checklist Foundation

**Depends on:** `@hbc/related-items`, `@hbc/versioned-record`, `@hbc/bic-next-move` available.

| Deliverable | Governing spec | Notes |
|---|---|---|
| `ChecklistTemplate` record and MOE governance model | T03 §1 | Seed initial version `2026.1.0` for PBC jurisdiction |
| Checklist instantiation on closeout phase activation | T03 §6 | 9-step instantiation sequence; capture template version at creation |
| `CloseoutChecklist`, `CloseoutChecklistSection`, `CloseoutChecklistItem` | T03 §3 | Full 70-item baseline; all 15 metadata fields per item |
| Item result mutation with `@hbc/versioned-record` audit trail | T04 §3 | Every result change creates a version record |
| Completion percentage calculation (section + overall) | T03 §5 | Governed formula; NA items excluded from denominator if NA-with-justification |
| Overlay item creation (PM only; max 5 per section) | T03 §4 | Auditable; MOE visibility into all overlays |
| Related items integration (permit → item readiness signal) | T10 §3.1 | Read-only signal; never auto-resolves items |
| BIC next-move prompts registration | T10 §3.1 | At least: C.O. not obtained; lien deadline prompts |
| Activity Spine publication | T08 §5.1 | `closeout.checklist-created`, `closeout.item-completed`, `closeout.substantial-completion`, `closeout.co-obtained` |
| Health Spine publication | T08 §5.2 | `closeoutCompletionPct` dimension |
| Work Queue items | T04 §7 | C.O. not obtained; lien deadline approaching; lien deadline missed |

**Stage 1 acceptance gate:** A test project can activate Closeout → instantiate the 70-item checklist from the governed template → mark items through all result states → overlay items function within bounds → completion percentage is accurate → Spine events fire correctly → audit trail records each result change.

---

### Stage 2: Lifecycle State Machine and Milestones

**Depends on:** Stage 1 gate approved; `@hbc/workflow-handoff`, `@hbc/acknowledgment` available.

| Deliverable | Governing spec | Notes |
|---|---|---|
| `CloseoutLifecycleState` state machine — all 9 states | T04 §2 | API rejects out-of-sequence transitions |
| `CloseoutMilestone` records — all 13 milestones | T04 §3–4 | Evidence type, external dependency, PE approval flags |
| PE approval workflow for gated transitions | T04 §5 | Via `@hbc/workflow-handoff`; `OWNER_ACCEPTANCE` and `ARCHIVE_READY` gates |
| `OWNER_ACCEPTANCE` evidence attachment | T04 §6 | Document attachment required; verbal acceptance requires PE annotation |
| Archive-Ready gate readiness check | T04 §4.3 | All 8 criteria evaluated; action disabled until all pass; gate-readiness panel in UI |
| Work Queue items to PE | T04 §7 | Owner Acceptance evidence submitted; Archive Ready all criteria pass |

**Stage 2 acceptance gate:** A test project can progress through all 9 lifecycle states. PE approval gates block advancement. `OWNER_ACCEPTANCE` requires document attachment and PE approval. Archive-Ready gate correctly evaluates all 8 criteria. No state can be skipped.

---

### Stage 3: Subcontractor Scorecard

**Depends on:** Stage 2 gate approved; `@hbc/workflow-handoff`, `@hbc/acknowledgment`, `@hbc/field-annotations` available.

| Deliverable | Governing spec | Notes |
|---|---|---|
| `SubcontractorScorecard`, `ScorecardSection`, `ScorecardCriterion` | T06 §2 | 6 sections, 28 criteria, all metadata fields |
| Interim and FinalCloseout evaluation types | T06 §1.1 | Type enforcement; FinalCloseout uniqueness constraint (409 on duplicate) |
| Scoring formulas | T06 §3 | Section average, overall weighted score (2 decimal), performance rating derivation (system-derived; not user-selectable) |
| Submission and dual sign-off workflow | T06 §4.2 | PM + SUPT acknowledgment via `@hbc/acknowledgment` |
| PE approval workflow | T06 §4.3 | Via `@hbc/workflow-handoff`; revision path back to PM |
| `@hbc/field-annotations` integration | T10 §3.1 | All attachment points per T10 §3.1 table |
| `SCORECARDS_COMPLETE` milestone check | T04 §4.2 | Re-evaluate on each PE approval; milestone transitions to `APPROVED` when all subs have PE_APPROVED FinalCloseout |
| FinalCloseout amendment edge case | T06 §4.5 | PE `allowAmendment` flag; original transitions to `SUPERSEDED` |
| Snapshot API for Reports module | T08 §6.1 | `GET /api/closeout/{projectId}/scorecard/{scorecardId}/snapshot`; PE role required; precondition: `publicationStatus ≥ PE_APPROVED` |
| `closeout.scorecard-submitted` and `closeout.scorecard-approved` Activity Spine events | T08 §5.1 | |

**Stage 3 acceptance gate:** Create Interim and FinalCloseout scorecards. Scoring calculations are accurate per T06 §3. FinalCloseout uniqueness constraint rejects duplicate. PE approval transitions `publicationStatus`. Snapshot API returns correct frozen payload for a PE_APPROVED scorecard. Field annotations do not write to the scorecard record.

---

### Stage 4: Lessons Learned

**Depends on:** Stage 2 gate approved; `@hbc/workflow-handoff`, `@hbc/field-annotations` available.

| Deliverable | Governing spec | Notes |
|---|---|---|
| `LessonEntry` rolling capture | T05 §5.1 | Available at any project lifecycle state; `reportId = null` until linked |
| Impact magnitude derivation engine | T05 §3 | Backend service; regex text parsing; 422 if no quantified signal; PM cannot override |
| Recommendation action-verb validation | T05 §4 | API-enforced; 422 on violation; controlled verb list |
| `LessonsLearningReport` synthesis container | T05 §5.2 | One per project; PM links entries; unlinked entry flag in UI |
| Keyword deduplication | T05 §6.8 | Stored normalized (lowercase, trimmed) |
| PE review and approval workflow | T05 §5.3 | Via `@hbc/workflow-handoff`; revision path |
| Checklist item 6.5 auto-resolution on PE approval | T03 §3 (item 6.5) | Resolves to Yes only on `PE_APPROVED`; not on `SUBMITTED` |
| `LESSONS_APPROVED` milestone check | T04 §4.2 | Transitions to `APPROVED` on PE approval |
| Lessons snapshot API for Reports module | T08 §6.1 | `GET /api/closeout/{projectId}/lessons/snapshot`; PE role required |
| Activity Spine events | T08 §5.1 | `closeout.lessons-submitted`, `closeout.lessons-approved`, `closeout.lessons-published` |

**Stage 4 acceptance gate:** Rolling entries created during any project phase. Impact magnitude derived correctly from text signals; PM cannot manually override. Recommendation action-verb validation rejects non-compliant entries at the API. PE approval triggers item 6.5 resolution and `LESSONS_APPROVED` milestone. Snapshot API returns correct payload.

---

### Stage 5: Project Autopsy and Learning Legacy

**Depends on:** Stages 3 and 4 gate approved; source modules (Financial, Schedule, Safety) have summary/snapshot APIs available.

| Deliverable | Governing spec | Notes |
|---|---|---|
| `AutopsyRecord` header and status state machine | T07 §10 | Full field model; `DRAFT → IN_PROGRESS → PE_APPROVAL_PENDING → PE_APPROVED → ARCHIVED` |
| Pre-survey issuance and response collection | T07 §6 | `PreSurveyTemplate` governed by MOE; `PreSurveyResponse` records per participant |
| Pre-briefing pack assembly | T07 §7 | Reads Financial, Schedule, Safety, Scorecard, Lessons modules via their API snapshot endpoints — no direct imports |
| Workshop facilitation model | T07 §8 | Agenda structure, facilitation rules |
| `AutopsySection` definitions — 12 thematic sections | T07 §9 | All section keys and guidance |
| `AutopsyFinding` with evidence references | T07 §11 | `FindingType` enum; `FindingEvidenceRef` interface |
| Root-cause and contributing-factor capture | T07 §12 | 4-level framework; `RootCauseCategory` enum |
| `AutopsyAction` with Work Queue integration | T07 §13 | Open actions published to Work Queue on autopsy approval |
| `LearningLegacyOutput` per-output PE approval | T07 §14 | Per-output approval; publication to org feed on project `ARCHIVED` |
| `AUTOPSY_COMPLETE` milestone | T04 §4.2 | Transitions to `APPROVED` on `AutopsyRecord.publicationStatus = PE_APPROVED` |
| Learning Legacy org feed publication events | T08 §5.1 | `closeout.autopsy-complete`, `closeout.learning-legacy-published` |

**Stage 5 acceptance gate:** Autopsy activated → pre-survey issued and responses collected → pre-briefing pack assembles from cross-module API endpoints → workshop findings and actions created → PE approval transitions correctly → `AUTOPSY_COMPLETE` milestone advances → learning legacy outputs tagged and published to org feed on archive.

---

### Stage 6: Org Intelligence Indexes and Project Hub Consumption

**Depends on:** Stages 3, 4, and 5 gate approved; org intelligence layer placement decision resolved (T10 §1.4).

| Deliverable | Governing spec | Notes |
|---|---|---|
| `LessonsIntelligenceIndex` read model | T08 §2.1 | Populated from `closeout.lessons-published` events; queryable per search dimensions |
| `SubIntelligenceIndex` read model | T08 §2.2 | Populated from `closeout.scorecard-published` events; role-gated at API layer |
| `LearningLegacyFeed` read model | T08 §2.3 | Populated from `closeout.learning-legacy-published` events |
| Role-gating enforcement at API layer | T09 §3.3 | `SUB_INTELLIGENCE_VIEWER` grant check before any SubIntelligence response |
| Contextual lessons panel in Project Hub | T08 §3.1 | Relevance scoring: `match(sector)×3 + match(method)×2 + match(size)×1 + applicability×0.5` |
| Sub vetting intelligence panel in Project Hub | T08 §3.2 | Score bars, history list, aggregate trend (PE/PER/MOE only for narratives) |
| Learning legacy feed in Project Hub | T08 §3.3 | Browsable + contextual on new project setup |
| Immutability guarantee for all index entries | T02 §2 | No update path exists on published entries |

**Stage 6 acceptance gate:** Org indexes populated from archived project records. Project Hub surfaces correct lessons (ranked by relevance algorithm). Role gating rejects SubIntelligence queries for users without correct access. Project Hub cannot mutate any source record. Field visibility rules per T09 §3.2–3.3 enforced.

---

### Stage 7: Integration Verification and Release Readiness

**Depends on:** All stages 1–6 gate approved.

| Verification | How to verify |
|---|---|
| Related items → permit readiness signal | CloseoutChecklistItem with `linkedModuleHint = permits` surfaces related `IssuedPermit` via `@hbc/related-items` without direct import |
| Item result never auto-mutated | Confirm no item result changes without explicit user confirmation; verify audit trail shows user-initiated mutations only |
| Scorecard snapshot immutability | Request snapshot; mutate underlying scorecard draft (if possible); confirm snapshot is unchanged |
| Lessons snapshot immutability | Same as above for lessons |
| PE approval is distinct from PE annotation | Annotate a scorecard without approving it; confirm `publicationStatus` is unchanged |
| Annotations do not write to operational records | Annotate every entity type; inspect operational record fields; confirm all zeros |
| Org intelligence is write-once | Attempt to update a published index entry via any API path; confirm 404/405 |
| SubIntelligence role gate | Authenticate as a user without `SUB_INTELLIGENCE_VIEWER`; attempt SubIntelligence query; confirm rejection |
| Autopsy actions → Work Queue | Approve autopsy with open actions; confirm actions appear in assignees' Work Queues |
| Archive state immutability | Archive a test project; attempt to mutate any Closeout record; confirm all mutations rejected |
| Snapshot API PE role gate | Authenticate as PM; call snapshot API; confirm 403 |
| Concurrent PE handoffs | Submit scorecard + lessons simultaneously; confirm both appear in PE Work Queue independently |

---

## 4. Required Cross-Module API Contracts

Closeout depends on the following API contracts from other modules. These must be confirmed as stable before the implementation stage that consumes them.

| Contract | API path | Consumer stage | Notes |
|---|---|---|---|
| Financial final variance summary | `GET /api/financial/{projectId}/variance-summary` | Stage 5 (pre-briefing pack) | Closeout needs final cost vs. budget variance; must not import `@hbc/financial` |
| Schedule milestone summary | `GET /api/schedule/{projectId}/milestone-summary` | Stage 5 (pre-briefing pack) | Planned vs. actual dates for key milestones |
| Safety incident summary | `GET /api/safety/{projectId}/incident-summary` | Stage 5 (pre-briefing pack) | TRIR, recordables, near-misses for autopsy context |
| Financial final payment signal | Internal event or `GET /api/financial/{projectId}/payment-status` | Stage 2 (`FINAL_COMPLETION` trigger) | `financialFinalPaymentConfirmed` flag required for `FINAL_COMPLETION` milestone |
| Reports scorecard snapshot consumption | `GET /api/closeout/{projectId}/scorecard/{scorecardId}/snapshot` | Stage 3 (Closeout provides; Reports consumes) | PE role required; 409 if not PE_APPROVED |
| Reports lessons snapshot consumption | `GET /api/closeout/{projectId}/lessons/snapshot` | Stage 4 (Closeout provides; Reports consumes) | PE role required; 409 if not PE_APPROVED |
| Org intelligence query (Project Hub surface) | `GET /api/org-intelligence/lessons?projectProfile=...` | Stage 6 (Closeout writes; Project Hub queries) | Relevance scoring done server-side |

---

## 5. Acceptance Criteria

### 5.1 Data Architecture Requirements

- All operational Closeout data owned exclusively by `@hbc/project-closeout`.
- No other module may write to any Closeout record.
- Reports module consumes Closeout data only via the snapshot API.
- Org intelligence indexes are populated only from PE-approved publication events at project `ARCHIVED` state.
- `ARCHIVED` is a terminal state; no mutations possible after reaching it.

### 5.2 Lifecycle and Governance

- All 9 lifecycle states and 13 milestones are implemented.
- Gated transitions block without PE approval at the API layer (not UI layer only).
- `OWNER_ACCEPTANCE` requires evidence attachment and PE approval.
- Archive-Ready gate correctly evaluates all 8 criteria.
- No state can be skipped; the API rejects out-of-sequence transitions.

### 5.3 Checklist

- 70-item baseline instantiated from governed template with correct template version captured.
- All 15 item metadata fields present per T03 §2.
- Completion percentage formula matches T03 §5 (NA-with-justification items handled correctly).
- Overlay items bounded at max 5 per section.
- Every item result change produces an audit trail entry in `@hbc/versioned-record`.
- Related-items signals surface as suggestions only; never auto-resolve items.

### 5.4 Subcontractor Scorecard

- 6 sections, 28 criteria per T06 §2.
- Scoring formulas produce correct section averages, overall weighted score (rounded to 2 decimal), and performance rating derivation (system-derived).
- FinalCloseout uniqueness constraint returns 409 on duplicate attempt.
- FinalCloseout scorecard requires PM + SUPT acknowledgment before submission.
- PE approval required before org index publication.
- Snapshot API: returns 403 without PE role; returns 409 if not PE_APPROVED.

### 5.5 Lessons Learned

- Rolling entry creation works at any project lifecycle state.
- Impact magnitude derived by backend service from text signals; PM cannot select or override directly.
- Save returns 422 with specific message if no quantified cost or schedule signal is present.
- Recommendation action-verb validation returns 422 with specific message on violation.
- PE approval triggers item 6.5 resolution to Yes and `LESSONS_APPROVED` milestone.
- Snapshot API: returns 403 without PE role; returns 409 if not PE_APPROVED.

### 5.6 Project Autopsy

- All record types implemented per T07 with correct field models.
- Pre-briefing pack assembles from cross-module API endpoints (no direct feature imports).
- `AutopsyFinding` correctly references `LessonEntry` records by ID without copying content.
- `AUTOPSY_COMPLETE` milestone advances only on `AutopsyRecord.publicationStatus = PE_APPROVED`.
- Open `AutopsyAction` records appear in assignees' Work Queues on autopsy approval.
- `LearningLegacyOutput` records require individual PE approval before org feed publication.

### 5.7 Org Intelligence

- SubIntelligence API rejects all queries for users without `PE`, `PER`, `MOE`, or explicit `SUB_INTELLIGENCE_VIEWER` grant.
- `SUB_INTELLIGENCE_VIEWER` grant is checked at API layer, not inferred from project membership.
- LessonsIntelligence is accessible to all internal Project Hub users.
- Project Hub consumption surfaces are strictly read-only; no mutation path exists from any Project Hub surface into Closeout or org intelligence records.
- Narrative fields (keyStrengths, areasForImprovement, issues) are returned only for PE/PER/MOE requests.

### 5.8 Executive Review

- PE annotations stored in `@hbc/field-annotations`; zero writes to operational Closeout records from annotation actions.
- PE approval is a separate, distinct API action from PE annotation.
- Executive review surfaces only the formal gates listed in T09 §6.1; routine PM operations do not generate PE Work Queue items.

### 5.9 Shared Package Integration

All seven shared packages integrated and exercised. No Closeout stage may be declared complete if a required shared package integration is bypassed or stubbed for production delivery.

---

## 6. Testing and Validation Concerns

### 6.1 Business Logic Validation

| Concern | Recommended test approach |
|---|---|
| Impact magnitude derivation engine | Unit test the backend text parser against the full threshold table (T05 §3.2); edge cases: multi-signal (cost + schedule; higher governs), no signal (422), vague signal (conservative threshold) |
| Scoring formulas | Unit test section average and overall weighted score; test NA exclusion from denominator; test null-result for all-NA section |
| Performance rating derivation | Test each boundary: 4.49 → AboveAverage; 4.50 → Exceptional; etc. |
| Archive-Ready gate | Integration test with all 8 criteria: individually block each; confirm gate stays closed; unblock all 8; confirm gate opens |
| State machine transition guards | Test every prohibited transition (e.g., FINAL_COMPLETION → NOT_STARTED); confirm API rejection |

### 6.2 Integration Validation

| Concern | Recommended test approach |
|---|---|
| Field annotation isolation | After adding annotations on every entity type, inspect all operational record fields; confirm zero mutations |
| Snapshot immutability | Generate snapshot; then submit a new version of the underlying record (if allowed); confirm snapshot unchanged |
| Concurrent handoffs | Submit scorecard and lessons simultaneously; verify both appear in PE Work Queue independently |
| Cross-module data boundary | Confirm no `@hbc/financial`, `@hbc/permits`, `@hbc/safety`, `@hbc/schedule` imports in `@hbc/project-closeout` package |
| Role-gate enforcement | Verify SubIntelligence API at the HTTP layer with tokens for each role type |

### 6.3 PWA vs. SPFx Validation

| Concern | Recommended test approach |
|---|---|
| No localStorage use | Review bundle for any localStorage/sessionStorage calls; SPFx environment will silently fail these |
| SPFx auth path | Integration test with SPFx token acquisition; confirm API calls succeed with SharePoint-derived token |
| Bundle size | Measure SPFx webpart bundle against size limits after all Closeout sub-surface features are included |

---

## 7. Related Files Requiring Updates

The following P3 canonical plan files require updates before implementation begins to reflect the full T-file architecture:

| File | Required update |
|---|---|
| `P3-E1-Phase-3-Module-Classification-Matrix.md` | Update Closeout entry: 5 sub-surfaces (not 3); add Autopsy; revised SoT class; correct mutation authority |
| `P3-E2-Module-Source-of-Truth-Action-Boundary-Matrix.md` | Update Closeout: org intelligence is a derived read model; PE approval gates publication |
| `P3-D3-Project-Work-Queue-Contract.md` | Add Autopsy action items as Work Queue source; verify all Closeout Work Queue item types are registered |
| `P3-D4-Related-Items-Registry-Presentation-Contract.md` | Register Closeout relationship pairs (item → permit; item → financial; autopsy-finding → lesson-entry) |
| `P3-E9-Reports-Module-Field-Specification.md` | Verify scorecard and lessons-learned artifact families require PE_APPROVED (not just SUBMITTED) precondition |
| `P3-G1-Lane-Capability-Matrix.md` | Add Autopsy to Closeout lane; update Health and Activity signal event lists |
| `P3-H1-Acceptance-Staging-Release-Readiness-Checklist.md` §18.5 | Replace prior Closeout acceptance criteria with the §5 criteria above; add Autopsy criteria |
| Phase-3-deliverables `README.md` | Update P3-E10 entry with T-file count (11), status, and T-file index |

---

*[← T10](P3-E10-T10-Lane-Ownership-and-Shared-Package-Reuse.md) | [Master Index](P3-E10-Project-Closeout-Module-Field-Specification.md)*
