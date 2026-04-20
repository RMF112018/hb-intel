# P3-E10-T07 — Project Autopsy & Learning Legacy

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E10-T07 |
| **Parent** | [P3-E10 Project Closeout Module](P3-E10-Project-Closeout-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T07 of 11 |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Governing — locked architecture |

---

## 1. Purpose and Role in Closeout

The **Project Autopsy & Learning Legacy** is the synthesis and institutional learning engine of the Closeout module. It is a new surface introduced by the locked architecture — not present in the original P3-E10 — and it sits at the top of the Closeout learning hierarchy.

Its core purpose is to **convert project experience into durable organizational knowledge** by:

1. Structuring a formal collaborative reflection event (the Autopsy Workshop).
2. Surfacing patterns, root causes, and contributing factors that cut across individual lesson entries.
3. Producing `LearningLegacyOutput` artifacts that future project teams can retrieve and act on.
4. Driving organizational standards updates, training recommendations, and process improvements.

The Autopsy is **not a report**. It is an event, a structured record, and a knowledge production engine.

---

## 2. Why Autopsy Does Not Replace Lessons Learned or Scorecards

These three tools form a deliberate three-layer architecture:

| Layer | Tool | Operator | Granularity | Timing |
|---|---|---|---|---|
| **Raw learning ledger** | Lessons Learned | PM, SUPT | Individual events | Rolling throughout delivery |
| **Partner performance ledger** | Subcontractor Scorecard | PM, SUPT, PE | Per-sub per-criterion evaluation | Interim + FinalCloseout |
| **Synthesis and institutional engine** | **Project Autopsy** | PE (lead), PM (coord) | Cross-cutting patterns; system-level insights | Closeout workshop |

**Lessons Learned** captures what happened at the event level. **Scorecard** measures partner performance systematically. **Autopsy** asks: "Why did this project go the way it did? What systemic patterns can we carry forward? What should change in how we operate?"

The Autopsy draws on both as evidence — `AutopsyFinding` records may reference `LessonEntry` and `ScorecardCriterion` records by ID — but produces its own distinct records (`AutopsyFinding`, `AutopsyAction`, `LearningLegacyOutput`). It does not copy, duplicate, or supersede lessons or scorecard data.

---

## 3. Delivery Autopsy vs. Operational Outcomes Review

The Autopsy surface supports two distinct modes, both under the `AutopsyRecord` umbrella:

### 3.1 Delivery Autopsy

Focused on the **construction delivery experience**: how the project was planned, bid, built, and closed. Covers preconstruction through substantial completion and turnover. This is the primary mode for all projects.

### 3.2 Operational Outcomes Review (Post-Occupancy / Business Outcome Review)

Applicable to projects where the organization has ongoing relationship with the owner and can assess **building performance and business outcomes** after occupancy:

- How is the building performing against owner expectations?
- Were the business case outcomes achieved?
- What quality, reliability, or operational issues emerged in the first 6–18 months?
- Developer / asset performance metrics where HB Intel has a developer or owner-operator role.

This mode is optional. The `operationalOutcomesApplicable` field on `AutopsyRecord` controls whether this section is active. For most projects, only the Delivery Autopsy sections are completed.

**Timing difference:** The Delivery Autopsy occurs during closeout (recommended within 30–60 days of substantial completion). The Operational Outcomes Review occurs 6–18 months post-occupancy if applicable.

---

## 4. Timing and Triggers

### 4.1 Recommended Timing

| Event | Timing | Rationale |
|---|---|---|
| Autopsy activation | At closeout phase activation | Ensures briefing pack data accumulates during final months |
| Pre-survey issuance | 2–3 weeks before workshop | Gives participants time to reflect |
| Pre-briefing pack generation | 1 week before workshop | Data is recent; pre-reading time |
| Autopsy Workshop | Within 30–60 days of substantial completion | Memory is fresh; team still engaged |
| Findings and actions logged | Within 1 week post-workshop | Preserve workshop discussions |
| PE approval and publication | Before `ARCHIVE_READY` gate | Required for milestone |
| Operational Outcomes Review (if applicable) | 12–18 months post-occupancy | Sufficient operational data |

### 4.2 Mandatory Triggers

The Autopsy is **mandatory for all projects** that proceed through a full Closeout phase. It cannot be bypassed to reach `ARCHIVE_READY`. The `AUTOPSY_COMPLETE` milestone must reach `APPROVED` status.

Exception: If a project is terminated or abandoned before substantial completion, MOE may waive the Autopsy with PE documentation. This is tracked on the `AutopsyRecord.waived` field.

---

## 5. Participants and Stakeholder Groups

### 5.1 Core Team (Always Present)

| Role | Autopsy role | Responsibility |
|---|---|---|
| Project Executive (PE) | Lead Facilitator | Leads workshop; approves all outputs; accountable for quality |
| Project Manager | Coordinator | Logistics; pre-briefing preparation; note-taking; findings entry |

### 5.2 Expanded Participants (Project-Dependent)

| Stakeholder | When to include |
|---|---|
| Superintendent | All projects |
| Estimator / Preconstruction Manager | Projects where bid strategy, buyout, or pricing was a factor |
| MEP Coordinator | Projects with significant mechanical/electrical scope |
| Safety Director | Projects with safety events or noteworthy safety culture findings |
| BIM Coordinator / VDC Manager | Projects with significant BIM or coordination scope |
| Owner Representative | Optional; invited for selected findings discussion |
| Architect / Structural EOR | Optional; invited if design coordination was a significant factor |
| Subcontractor Representatives | Optional; invited by PE for specific high-value or complex subs |
| Developer / Asset Manager | Applicable on developer or owner-operator projects |

### 5.3 Participant Tracking

`AutopsyRecord.workshopParticipants` stores the array of userIds of confirmed attendees. Participants who completed the pre-survey but did not attend are flagged separately.

---

## 6. Pre-Survey Model

### 6.1 Purpose

The pre-survey collects structured stakeholder perspectives before the workshop. It serves two functions:
1. Surfaces themes and patterns that the facilitator can use to structure the workshop agenda.
2. Creates a psychological safe space — participants articulate concerns before the group dynamic forms.

### 6.2 PreSurveyTemplate (MOE-Governed)

```typescript
interface PreSurveyTemplate {
  templateId: string;
  version: string;
  effectiveDate: date;
  questions: PreSurveyQuestion[];
}

interface PreSurveyQuestion {
  questionId: string;
  questionText: string;
  responseType: 'Scale1to5' | 'Scale1to10' | 'Text' | 'MultiSelect' | 'Ranked';
  responseOptions: string[] | null;       // For MultiSelect and Ranked types
  theme: AutopsyTheme;                    // Which autopsy section this question feeds
  isRequired: boolean;
}
```

### 6.3 Standard Pre-Survey Question Bank (Phase 3 Baseline)

| Theme | Sample questions |
|---|---|
| Overall | Rate overall project success 1–10. What was the single most significant challenge? What would you do differently if you started this project again? |
| Planning | How well did preconstruction planning set the project up for success? Where were the biggest planning gaps? |
| Commercial | How well were contract risks identified and managed? Were change orders handled fairly and efficiently? |
| Schedule | How realistic was the baseline schedule? What drove the most schedule impact? |
| Cost | How well did the project track to budget? What drove cost variance? |
| Safety | How would you rate the safety culture on this project? Any incidents or near-misses the team should learn from? |
| Quality | Where was quality strongest? Where did rework cost the project most? |
| Subcontractors | Which sub partnerships worked well and why? Which had performance issues, and what caused them? |
| Team | How well did the team collaborate? Were there communication breakdowns that cost the project? |
| Closeout | How smooth was turnover? What would you do differently to set up the next project's closeout? |

### 6.4 PreSurveyResponse Record

```typescript
interface AutopsyPreSurveyResponse {
  responseId: string;
  autopsyId: string;
  respondentUserId: string;
  submittedAt: datetime;
  responses: Array<{
    questionId: string;
    scaleValue: number | null;
    textValue: string | null;
    selectedOptions: string[] | null;
    rankedOptions: string[] | null;
  }>;
}
```

**Confidentiality:** Individual survey responses are visible to PE (facilitator) only. Workshop participants see aggregate themes, not individual attribution. This design encourages candor.

---

## 7. Pre-Briefing Pack — Inputs and Data Sources

The pre-briefing pack is a **read-only assembled evidence summary** generated by the system. It is delivered to participants 5–7 days before the workshop as a structured document (or rendered view in HB Intel).

### 7.1 Data Sources and Content

| Section | Source | Data points |
|---|---|---|
| Project Identity | Project record | Name, number, location, type, market sector, delivery method, size band, contract value |
| Team | Project record | PM, SUPT, PE, estimator, key subcontractors |
| Schedule Performance | P3-E5/E6 Schedule | Original duration vs. actual; baseline vs. actual finish; key milestone actuals; critical float history; schedule variance narrative |
| Financial Performance | P3-E4 Financial | Original contract value; final contract value; contract variance; contingency budget vs. usage; buyout result; top CO values |
| Safety Summary | P3-E8 Safety | TRIR; recordable incidents; near-misses; stop-work events; safety inspection scores |
| Subcontractor Summary | Submitted `SubcontractorScorecard` records | Score by sub, section, and overall; reBid recommendations; any Unsatisfactory ratings |
| Lessons Learned Summary | Submitted `LessonEntry` records | Entry count by category; impact magnitude distribution; top 5 by applicability; any Critical-magnitude entries |
| Permit History | P3-E7 Permits | Permit count; first submission to final dates; inspection pass/fail rates; any stop-work orders |
| Work Queue History | P3-D3 Work Queue | Count of critical/high items raised during delivery; unresolved items |
| Pre-Survey Synthesis | `AutopsyPreSurveyResponse` records | Aggregate theme ratings; top-mentioned challenges (de-attributed) |

### 7.2 Pack Format

The pack is rendered as a structured multi-page document. Each section follows the pattern:
1. Data snapshot (key metrics in table or chart form)
2. System-generated summary narrative (2–4 sentences from the data)
3. "Discussion starter" questions for the workshop facilitator

The pack is read-only. It does not modify any source record.

---

## 8. Full-Day Workshop Structure

### 8.1 Workshop Format

The Autopsy is designed as a **full-day structured workshop** (6–8 hours). For smaller projects, a half-day condensed format is acceptable. The format is collaborative, not presentational — the PE facilitates, but the team constructs the findings.

### 8.2 Recommended Agenda

| Time | Block | Description |
|---|---|---|
| 08:00 – 08:30 | Welcome and ground rules | PE sets expectations; psychological safety; purpose of the autopsy vs. blame |
| 08:30 – 09:00 | Briefing pack review | PM walks through pre-briefing pack highlights; data corrections if any |
| 09:00 – 10:30 | **Part 1: What happened — Delivery review** | Structured review of delivery experience by autopsy section/theme (§9) |
| 10:30 – 10:45 | Break | |
| 10:45 – 12:00 | **Part 2: Why it happened — Root cause analysis** | PE leads root-cause mapping for top-priority findings; contributing factor capture |
| 12:00 – 13:00 | Lunch break | |
| 13:00 – 14:30 | **Part 3: Sub-specific findings** | Structured review of subcontractor scorecard findings; cross-reference with delivery events |
| 14:30 – 15:30 | **Part 4: What changes — Action register** | For each root cause, what will the organization do differently? Standards updates; process changes; training needs |
| 15:30 – 16:00 | **Part 5: Legacy synthesis** | PE leads discussion: what are the most important learning legacies from this project? |
| 16:00 – 16:30 | Wrap-up and commitments | Action owners confirmed; PE closes; next steps |

### 8.3 Facilitation Rules

- PE is the facilitator; PM supports logistics.
- No blame, no defense of past decisions. The autopsy is forward-looking.
- Every finding must have at least one "what should we do differently" discussion, even if no formal action is registered.
- Participants may raise pre-survey themes anonymously ("The survey suggested that...").
- All findings are tentative until logged in the system — nothing is binding from the verbal discussion alone.

---

## 9. Autopsy Sections and Themes

The `AutopsySection` records structure the Autopsy into thematic areas. Each section may contain multiple `AutopsyFinding` records. Sections guide the workshop agenda and enable future retrieval by theme.

### 9.1 Defined Autopsy Sections

| Section key | Label | Applicable when |
|---|---|---|
| `BusinessCase` | Business Case & Success Criteria | Always |
| `PreconPlanningProcurement` | Preconstruction, Planning & Procurement | Always |
| `DesignCoordination` | Design, Coordination & Constructability | Always |
| `CommercialChanges` | Commercial, Changes & Contracts | Always |
| `ScheduleProduction` | Schedule, Production & Logistics | Always |
| `CostFinancialOutcomes` | Cost, Forecasting & Financial Outcomes | Always |
| `SafetyRiskCompliance` | Safety, Risk & Compliance | Always |
| `QualityReworkTurnover` | Quality, Rework & Turnover Readiness | Always |
| `StakeholderCommunication` | Stakeholder Management & Communication | Always |
| `CloseoutHandover` | Closeout, Handover & Warranty | Always |
| `OccupancyUserExperience` | Occupancy, Operations & User Experience | `operationalOutcomesApplicable = true` |
| `DeveloperAssetOutcomes` | Developer & Asset Performance Outcomes | `developerProjectApplicable = true` |

### 9.2 Section Guidance

**BusinessCase:** Was the project business case validated? Were the original owner success criteria met? Cost, schedule, quality, and relationship outcomes vs. original targets.

**PreconPlanningProcurement:** How well did preconstruction set the project up? Scope definition completeness; BIM / constructability review effectiveness; subcontract procurement strategy and results; long-lead procurement; budget confidence at GMP.

**DesignCoordination:** Design document quality at the time of GMP/bid; RFI volume and root causes; coordination meeting effectiveness; architect/engineer responsiveness; BIM clash detection ROI; drawing evolution and revision management.

**CommercialChanges:** Change order volume and type (owner-directed, error, differing site conditions, force majeure); change order pricing timeliness and dispute rate; back-charge events; contract clarity; risk allocation effectiveness; retainage and final payment experience.

**ScheduleProduction:** Baseline schedule quality; float management; look-ahead planning effectiveness; recovery strategies employed; trade sequencing; crew productivity vs. plan; phasing wins and losses; critical path performance.

**CostFinancialOutcomes:** Final budget vs. GMP; contingency performance; buyout savings or losses; materials escalation impact; labor productivity vs. estimate; cost-to-complete accuracy throughout delivery; financial close timeliness.

**SafetyRiskCompliance:** Safety culture assessment; incident/near-miss analysis; PPE and toolbox effectiveness; sub safety performance; regulatory compliance events; risk identification and mitigation effectiveness.

**QualityReworkTurnover:** Overall quality culture; rework cost estimate; punch list density and root causes; inspection first-pass rates; mock-up effectiveness; materials and system performance; O&M and warranty documentation quality.

**StakeholderCommunication:** Owner satisfaction assessment; decision latency impacts; communication cadence effectiveness; OAC meeting quality; scope change management; relationship health at turnover vs. at GMP.

**CloseoutHandover:** Punch list management; as-built documentation quality and timing; owner training and O&M delivery; lien waiver and final payment velocity; C.O. process and timing; warranty registration.

**OccupancyUserExperience (post-occupancy):** How is the facility performing in year 1? Owner / occupant satisfaction; systems reliability; commissioning effectiveness in practice; warranty claims; unexpected operational issues; user adoption.

**DeveloperAssetOutcomes (developer/operator projects):** Pro forma vs. actual construction costs; lease-up or occupancy achievement; NOI performance vs. underwriting; asset value implications; lessons for future development decisions.

---

## 10. AutopsyRecord — Complete Field Architecture

| Field | Type | Req | Rule |
|---|---|---|---|
| `autopsyId` | `string` | Yes | UUID; immutable |
| `projectId` | `string` | Yes | FK; unique constraint (one per project) |
| `autopsyTitle` | `string` | Yes | e.g., "2026 — [Project Name] Project Autopsy" |
| `leadFacilitatorUserId` | `string` | Yes | Default = PE assigned to project; delegation requires PE annotation |
| `coordinatorUserId` | `string` | No | Typically PM |
| `publicationStatus` | `enum` | Yes | 6-state model per T02 §2 |
| `waived` | `boolean` | Yes | Default `false`; `true` = autopsy formally waived by MOE/PE for terminated project |
| `waiverNote` | `string` | No | Required when `waived = true` |
| `operationalOutcomesApplicable` | `boolean` | Yes | Whether Sections 11–12 (OccupancyUserExperience, DeveloperAssetOutcomes) are active |
| `developerProjectApplicable` | `boolean` | Yes | Whether DeveloperAssetOutcomes section is active |
| `preBriefingPackReady` | `boolean` | Yes | Default `false`; `true` when pack generated |
| `preBriefingPackGeneratedAt` | `datetime` | No | Timestamp |
| `preBriefingPackVersion` | `number` | No | Auto-incremented on each regeneration |
| `preSurveyEnabled` | `boolean` | Yes | Whether pre-survey was/will be issued |
| `preSurveyIssuedAt` | `datetime` | No | When survey links sent |
| `preSurveyDeadline` | `date` | No | Submission deadline |
| `preSurveyResponseCount` | `number` | No | Count received |
| `preSurveyParticipantCount` | `number` | No | Count invited |
| `workshopDate` | `date` | No | Scheduled date |
| `workshopFormat` | `enum` | No | `FullDay` \| `HalfDay` \| `Virtual` \| `Hybrid` |
| `workshopCompletedAt` | `datetime` | No | When workshop marked complete |
| `workshopParticipants` | `string[]` | No | userIds of confirmed attendees |
| `deliveryAutopsySectionsCompleted` | `boolean` | No | Whether sections 1–10 are logged and reviewed |
| `operationalOutcomesSectionsCompleted` | `boolean` | No | Whether sections 11–12 are complete (if applicable) |
| `findingCount` | `number` | Yes | Count of `AutopsyFinding` records; calculated |
| `actionCount` | `number` | Yes | Count of `AutopsyAction` records; calculated |
| `outputCount` | `number` | Yes | Count of `LearningLegacyOutput` records; calculated |
| `peApprovedAt` | `datetime` | No | PE approval timestamp |
| `peApprovedBy` | `string` | No | userId |
| `publishedAt` | `datetime` | No | When outputs were published to org feed |
| `notes` | `string` | No | Facilitator notes |

---

## 11. AutopsyFinding — Structured Findings Record Model

| Field | Type | Req | Rule |
|---|---|---|---|
| `findingId` | `string` | Yes | UUID; immutable |
| `autopsyId` | `string` | Yes | FK |
| `sectionKey` | `AutopsyTheme` | Yes | Which autopsy section this finding belongs to |
| `findingSequence` | `number` | Yes | Auto-assigned sequential integer within autopsy |
| `findingType` | `enum` | Yes | `Strength` \| `Gap` \| `Risk` \| `Opportunity` \| `SystemicPattern` |
| `title` | `string` | Yes | One-line summary; 10–100 characters |
| `description` | `string` | Yes | Rich text; what was observed; when; what happened |
| `rootCauses` | `string[]` | No | Array of identified root causes (see §12) |
| `contributingFactors` | `string[]` | No | Array of contributing factors |
| `impactOnProject` | `string` | No | Rich text; how this affected cost, schedule, quality, or relationship |
| `recurrenceRisk` | `enum` | No | `Low` \| `Medium` \| `High` |
| `severity` | `enum` | No | `Minor` \| `Moderate` \| `Significant` \| `Critical` — aligned with lesson magnitude |
| `evidenceRefs` | `FindingEvidenceRef[]` | No | Cross-refs to source records |
| `linkedLessonIds` | `string[]` | No | `LessonEntry.lessonId` values that support this finding |
| `linkedScorecardCriterionIds` | `string[]` | No | Criterion IDs that evidence this finding |
| `linkedActionIds` | `string[]` | No | `AutopsyAction` records derived from this finding |
| `createdBy` | `string` | Yes | userId |
| `createdAt` | `datetime` | Yes | System timestamp |

### 11.1 FindingType Definitions

| Type | Definition |
|---|---|
| `Strength` | Something that worked well and should be replicated |
| `Gap` | Something that fell short and should be improved |
| `Risk` | A condition that created risk; may recur on similar projects |
| `Opportunity` | Potential improvement identified; not yet acted on |
| `SystemicPattern` | A pattern that recurs across multiple projects or scope areas |

### 11.2 FindingEvidenceRef

```typescript
interface FindingEvidenceRef {
  refType: 'LessonEntry' | 'ScorecardCriterion' | 'ScheduleSnapshot' |
           'FinancialVariance' | 'SafetyEvent' | 'PermitEvent' |
           'PreSurveyResponse' | 'ExternalDocument';
  recordId: string | null;          // Internal record ID; null for ExternalDocument
  description: string;              // Brief label
  url: string | null;               // External URL or SharePoint link
}
```

---

## 12. Root-Cause and Contributing-Factor Capture

### 12.1 Purpose

Root-cause capture goes beyond symptom description. The facilitator must push teams from "what happened" to "why it happened at the system level."

### 12.2 Root-Cause Framework

Teams should consider causes at four levels:

| Level | Question | Examples |
|---|---|---|
| **Immediate** | What directly caused this? | "The sub ran out of material" |
| **Contributing** | What allowed the immediate cause to occur? | "Procurement lead times were underestimated in the estimate" |
| **Systemic** | What organizational or process weakness enabled this? | "We have no systematic long-lead procurement review in pre-con" |
| **Cultural / Behavioral** | What behaviors or norms reinforced the problem? | "Teams don't escalate schedule concerns early enough" |

The structured `rootCauses[]` and `contributingFactors[]` arrays on `AutopsyFinding` capture these as discrete string statements. Implementation tip: the UI should prompt with the four levels and allow entry for each.

### 12.3 Root-Cause Categories for Tagging

```typescript
enum RootCauseCategory {
  Planning = 'Planning',
  Estimation = 'Estimation',
  Procurement = 'Procurement',
  Communication = 'Communication',
  ContractClarity = 'ContractClarity',
  Staffing = 'Staffing',
  Process = 'Process',
  Technology = 'Technology',
  External = 'External',              // Owner, AHJ, supply chain, weather
  OwnerDecision = 'OwnerDecision',
  DesignQuality = 'DesignQuality',
  SubPerformance = 'SubPerformance',
  Cultural = 'Cultural',
  Other = 'Other',
}
```

---

## 13. AutopsyAction — Action Register and Standards Update Flow

### 13.1 AutopsyAction Record

| Field | Type | Req | Rule |
|---|---|---|---|
| `actionId` | `string` | Yes | UUID |
| `autopsyId` | `string` | Yes | FK |
| `findingId` | `string` | No | FK to originating finding; null if cross-cutting |
| `actionSequence` | `number` | Yes | Auto-assigned sequential |
| `title` | `string` | Yes | One-line; must begin with an action verb |
| `description` | `string` | Yes | Rich text; what will be done |
| `actionType` | `enum` | Yes | See §13.2 |
| `assignedToUserId` | `string` | No | userId of action owner |
| `assignedToRoleHint` | `string` | No | e.g., "Chief Estimator"; used if no individual yet |
| `targetDate` | `date` | No | Target completion date |
| `status` | `enum` | Yes | `Open` \| `InProgress` \| `Complete` \| `Deferred` \| `Cancelled` |
| `completedAt` | `datetime` | No | Completion timestamp |
| `completedNote` | `string` | No | How it was completed |
| `workQueueItemId` | `string` | No | FK to Work Queue item when published |

### 13.2 Action Types

| Type | Description | Who typically owns |
|---|---|---|
| `ProcessChange` | Revise how we execute a specific process | PM, Operations Director |
| `StandardsUpdate` | Update a company standard, template, or policy | MOE, PE |
| `TrainingRequired` | Identify and deliver training to address a gap | Safety, Operations |
| `ToolOrSystemChange` | Modify or adopt a technology | IT, BIM/VDC |
| `ContractualAdjustment` | Revise standard contract language or terms | Legal, PE |
| `RelationshipAction` | Action specific to a sub, owner, or trade partner | PE, PM |
| `FeedForwardToEstimating` | Feed insight to estimating for future bid strategy | Estimator |
| `Other` | Does not fit above | Assigned owner |

### 13.3 Standards Update Flow

When `actionType = StandardsUpdate`:

1. The action is logged with `assignedToRoleHint = "MOE"` (or a specific individual).
2. At autopsy PE approval, the action is published to the Work Queue for the assigned owner.
3. The owner receives: "[Project Name] Autopsy: Standards update recommended — [action title]."
4. The owner addresses the action within their workflow (not tracked in HB Intel; HB Intel records completion note on the action).
5. When resolved, the owner marks the action `Complete` with a `completedNote` describing what was updated.

---

## 14. LearningLegacyOutput — Publication and Approval

### 14.1 What a Learning Legacy Output Is

A `LearningLegacyOutput` is a curated, standalone, retrievable institutional artifact. It is not a finding (which is project-specific); it is the *generalized lesson* extracted from findings that future project teams can act on.

Multiple outputs may be derived from one autopsy. A single finding may contribute to multiple outputs.

### 14.2 LearningLegacyOutput Record

| Field | Type | Req | Rule |
|---|---|---|---|
| `outputId` | `string` | Yes | UUID; immutable after `PUBLISHED` |
| `autopsyId` | `string` | Yes | FK |
| `outputType` | `enum` | Yes | See §14.3 |
| `title` | `string` | Yes | Clear, actionable; 10–120 characters |
| `summary` | `string` | Yes | 2–4 sentences; what a future PM should know |
| `fullContent` | `string` | Yes | Rich text; complete institutional artifact |
| `actionableRecommendations` | `string[]` | Yes | Minimum 2; each starts with action verb |
| `targetAudience` | `string[]` | No | e.g., ["PM", "Estimator", "PE"] |
| `applicableMarketSectors` | `MarketSector[]` | Yes | Minimum 1; governs index retrieval |
| `applicableDeliveryMethods` | `DeliveryMethod[]` | Yes | Minimum 1 |
| `applicableSizeBands` | `ProjectSizeBand[]` | Yes | Minimum 1 |
| `tags` | `string[]` | Yes | Minimum 3; free-form; governs search and retrieval |
| `recurrenceRisk` | `RecurrenceRisk` | Yes | `Low` \| `Medium` \| `High` |
| `sourceFindings` | `string[]` | No | `findingId` references |
| `sourceLessons` | `string[]` | No | `lessonId` references |
| `publicationStatus` | `enum` | Yes | `DRAFT` \| `PE_APPROVED` \| `PUBLISHED` |
| `peApprovedAt` | `datetime` | No | PE approved this output |
| `publishedAt` | `datetime` | No | Published to org learning feed |

### 14.3 LearningLegacyOutputType

```typescript
enum LearningLegacyOutputType {
  FeedForwardLesson = 'FeedForwardLesson',
  StandardsUpdateRecommendation = 'StandardsUpdateRecommendation',
  ProcessImprovementProposal = 'ProcessImprovementProposal',
  TrainingNeedIdentified = 'TrainingNeedIdentified',
  SupplierOrPartnerInsight = 'SupplierOrPartnerInsight',
  TechnologyOrToolInsight = 'TechnologyOrToolInsight',
  ClientOrOwnerInsight = 'ClientOrOwnerInsight',
  DeveloperAssetInsight = 'DeveloperAssetInsight',
}
```

### 14.4 Per-Output PE Approval

Each `LearningLegacyOutput` has its own `publicationStatus`. PE approves each output independently. A PE may approve some outputs and reject others from the same autopsy. Rejected outputs remain as `DRAFT` and may be revised.

**Publication rule:** A `LearningLegacyOutput` can only transition to `PUBLISHED` when:
1. Its own `publicationStatus = PE_APPROVED`.
2. The parent `AutopsyRecord.publicationStatus = PE_APPROVED`.
3. The project `CloseoutLifecycleState = ARCHIVED`.

---

## 15. Feed-Forward: Future Project Retrieval

### 15.1 Tagging for Retrieval

`LearningLegacyOutput` records are tagged across four dimensions to enable future retrieval:

| Dimension | Field | Example values |
|---|---|---|
| Market sector | `applicableMarketSectors` | `K12Education`, `HealthcareMedical` |
| Delivery method | `applicableDeliveryMethods` | `GMP`, `DesignBuild` |
| Project size | `applicableSizeBands` | `FifteenToFiftyM`, `FiftyToOneHundredM` |
| Work package / trade | `tags` (free-form) | `"MEP coordination"`, `"concrete foundations"`, `"subcontractor default"` |

### 15.2 Future Project Hub Retrieval Query

A PM opening a new project in Project Hub should be able to ask:
> "Show me Learning Legacy outputs relevant to K12 Education / GMP delivery / $15–50M projects with High recurrence risk involving subcontractor management."

The retrieval query combines index filters on `applicableMarketSectors`, `applicableDeliveryMethods`, `applicableSizeBands`, `recurrenceRisk`, and full-text search on `tags`, `summary`, `title`.

Results are sorted: `recurrenceRisk = High` first, then by `publishedAt DESC` (most recent).

---

## 16. Role in Project Hub and Knowledge Retrieval

The `LearningLegacy Feed` (Class 2 derived read model per T01) is the primary retrieval surface for autopsy outputs. Project Hub surfaces this feed contextually when:

- A new project is being set up and the profile (sector/method/size) matches available outputs.
- An active project reaches a phase where relevant high-recurrence-risk outputs exist.
- A PM explicitly searches the learning library by tag, sector, or keyword.

This is a **read-only discovery surface**. Project Hub users cannot create or modify autopsy outputs. The only creation path is through the Autopsy sub-surface within the source project's Closeout module.

---

## 17. Developer / Asset-Performance Extension

For projects where `developerProjectApplicable = true`:

The `DeveloperAssetOutcomes` section adds the following to the Autopsy:

| Dimension | Questions to address |
|---|---|
| Pro forma vs. actual | How did construction costs compare to the original development budget? What drove variance? |
| Revenue performance | Are lease-up, occupancy, or NOI targets tracking to underwriting? |
| Asset quality | How is the building performing physically? Any reliability or systems issues? |
| Capital events | Were any warranty claims filed? Any post-occupancy capital expenditures unforeseen? |
| Investment thesis | Was the investment thesis validated? What would you do differently on the next deal? |

These findings populate `AutopsyFinding` records with `sectionKey = DeveloperAssetOutcomes`. `LearningLegacyOutput` records of type `DeveloperAssetInsight` are tagged with sector/method/size and carry development-specific tags (e.g., `"pro-forma validation"`, `"lease-up timing"`, `"NOI performance"`).

---

*[← T06](P3-E10-T06-Subcontractor-Scorecard-Model-and-Intelligence-Publication.md) | [Master Index](P3-E10-Project-Closeout-Module-Field-Specification.md) | [T08 →](P3-E10-T08-Project-Hub-Consumption-Derived-Intelligence-Indexes-and-Reporting.md)*
