# P3-E10: Project Closeout Module — Field and Data Model Specification

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E10 |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Document Type** | Module Field Specification |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-23 |
| **Related Contracts** | P3-E1 §3.1, P3-E2 §3, P3-H1 §18.5, P3-E4 (Financial), P3-E8 (Reports) |
| **Source Examples** | docs/reference/example/ |

---

## Purpose

This specification defines the complete data model, field definitions, status enumerations, business rules, and required workflows for the Project Closeout module implementation. Every field listed here **MUST** be implemented. A developer reading this specification must have no ambiguity about what to build.

This document is grounded in the company's working operational processes, regulatory closeout checklists, and subcontractor evaluation workflows. The Project Closeout module is an **always-on lifecycle module** that activates when a project enters closeout phase and provides five operational sub-surfaces:

1. **Closeout Checklist** — 70-item tri-state operational checklist with dates where applicable
2. **Subcontractor Scorecard** — Multi-sub weighted evaluation form (6 sections, 28 criteria, 5-point scale)
3. **Lessons Learned** — Structured lessons capture form with categorization and impact assessment
4. **Aggregation Dashboard** — Organization-wide subcontractor performance database (multi-project)
5. **Lessons Database** — Organization-wide lessons searchable database (read-only from individual project view)

### Hybrid Model and Ownership

**Project Closeout** is the source-of-truth owner for all operational closeout data: checklists, scorecards, and lessons. The **Reports module** consumes this data to assemble release-ready report artifacts (PDF/export) when Section 6 items are completed. Project Closeout does **NOT** generate reports — it manages the operational state that the Reports module consumes.

### Source Files

- `docs/reference/example/Project_Closeout_Checklist.pdf` — 70-item tri-state operational checklist (7 sections)
- `docs/reference/example/20260307_SOP_SubScorecard-DRAFT.xlsx` — Subcontractor evaluation form (6 sections, 28 criteria, weighted scoring)
- `docs/reference/example/20260307_SOP_LessonsLearnedReport-DRAFT.xlsx` — Lessons learned form with categorization and impact thresholds

---

## 1. Closeout Checklist Working Model

The closeout checklist is the operational core of project completion tracking. It consists of 70 items organized into 7 sections (6 standard + 1 jurisdiction-specific). Each item has a tri-state result: `Yes | No | N/A`, with optional date fields for milestone tracking.

### 1.1 Checklist Header (ICloseoutChecklist)

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Business Rule / Formula |
|------------------------|-----------------|----------|------------|------------------------|
| checklistId | `string` | Yes | Yes | UUID generated on creation; immutable |
| projectId | `string` | Yes | No | FK to project record; one checklist per project |
| projectName | `string` | Yes | No | Inherited from project at creation |
| projectNumber | `string` | Yes | No | Inherited from project at creation |
| projectLocation | `string` | No | No | Inherited from project; optional if null in project |
| projectType | `string` | No | No | Inherited from project; optional if null in project |
| jurisdiction | `string` | Yes | No | Enum: `PBC` \| `Other` — determines which Section 7 template to load |
| createdAt | `datetime` | Yes | Yes | Timestamp of checklist creation |
| createdBy | `string` | Yes | No | userId of creator |
| lastModifiedAt | `datetime` | Yes | Yes | Timestamp of most recent item edit |
| lastModifiedBy | `string` | No | No | userId of most recent editor; null if not yet modified |
| status | `enum` | Yes | No | Enum: `Draft` \| `InProgress` \| `Complete` \| `Archived` — auto-calculated based on section and item states |
| completionPercentage | `number` | Yes | Yes | **Calculated**: (count of items with result = Yes / count of total applicable items) × 100; integer 0–100 |
| sections | `ICloseoutChecklistSection[]` | Yes | No | Array of 7 section objects; array is immutable in length |
| notes | `string` | No | No | Optional project-level closeout notes |

### 1.2 Checklist Section Model (ICloseoutChecklistSection)

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Business Rule / Formula |
|------------------------|-----------------|----------|------------|------------------------|
| sectionId | `string` | Yes | Yes | UUID; immutable |
| sectionNumber | `number` | Yes | No | 1–7 |
| sectionTitle | `string` | Yes | No | Enum: `Tasks` \| `DocumentTracking` \| `Inspections` \| `Turnover` \| `PostTurnover` \| `CompleteProjectCloseoutDocs` \| `JurisdictionSpecific` |
| itemCount | `number` | Yes | No | Total items in this section (e.g., 5 for Tasks; 16 for Section 7) |
| items | `ICloseoutChecklistItem[]` | Yes | No | Array of items in this section |
| sectionCompletionPercentage | `number` | Yes | Yes | **Calculated**: (count of items with result = Yes / count of total applicable items in section) × 100 |
| completedAt | `datetime` | No | No | When the section was marked as all-Yes; null until completion |

### 1.3 Checklist Item Model (ICloseoutChecklistItem)

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Business Rule / Formula |
|------------------------|-----------------|----------|------------|------------------------|
| itemId | `string` | Yes | Yes | UUID; immutable |
| sectionId | `string` | Yes | No | FK to parent section |
| itemNumber | `string` | Yes | No | e.g., "1.1", "2.10", "7.15" (section.number notation) |
| itemDescription | `string` | Yes | No | Full human-readable description (e.g., "Installation of phone lines for Fire Alarm & Elevator") |
| hasDateField | `boolean` | Yes | No | If true, a date can be recorded when the item is marked Yes |
| isJurisdictionSpecific | `boolean` | Yes | No | If true, item appears only for specified jurisdiction |
| isCalculated | `boolean` | Yes | No | If true, field value is auto-calculated (e.g., item 4.14) |
| result | `enum` | Yes | No | Enum: `Yes` \| `No` \| `N/A` \| `Pending` — `Pending` is transient until resolved |
| resultDate | `datetime` | No | No | When result was recorded; populated on any state change; not editable by user (system auto-timestamp) |
| itemDate | `datetime` | No | No | If `hasDateField` = true and `result` = Yes, this is the completion date entered by user; null until filled |
| calculatedDate | `datetime` | No | No | For calculated items (e.g., item 4.14), this is the auto-calculated deadline; read-only |
| notes | `string` | No | No | Optional item-level notes (e.g., "Awaiting final sign-off from City") |
| linkedItemId | `string` | No | No | For cross-section references (e.g., item 6.4 references Financial module); null if no link |

### 1.4 Complete 70-Item Reference

**SECTION 1 — TASKS (5 items)**

| Item # | Description | Has Date | Calculated | Linked Module |
|--------|-------------|----------|------------|--------------|
| 1.1 | Installation of phone lines for Fire Alarm & Elevator — by owner to set up account | No | No | — |
| 1.2 | All RFI's closed | No | No | — |
| 1.3 | All Submittals approved | No | No | — |
| 1.4 | All Change Orders approved | No | No | — |
| 1.5 | Request all as-builts from Subs | No | No | — |

**SECTION 2 — DOCUMENT TRACKING (13 items)**

| Item # | Description | Has Date | Calculated | Linked Module |
|--------|-------------|----------|------------|--------------|
| 2.1 | Soil investigation and certification of building pad if required | No | No | — |
| 2.2 | Soil Poison/Termite letter (usually from Shell contractor) prior to pours | No | No | — |
| 2.3 | Insulation certificate from insulation contractor | No | No | — |
| 2.4 | Form board survey | No | No | — |
| 2.5 | Tie-in survey showing setbacks and finish floor elevation | No | No | — |
| 2.6 | Final Survey & Elevation Certificate | No | No | — |
| 2.7 | Letter on fire-treated lumber if applicable | No | No | — |
| 2.8 | Fire Alarm Monitoring letter received from Owner | No | No | — |
| 2.9 | Letter from Structural Engineer certifying building as-builts, if necessary | No | No | — |
| 2.10 | Architect to issue Certificate of Substantial Completion Affidavit (date of S.C.) | Yes | No | — |
| 2.11 | Engineer Cert for all sitework — Paving & Utilities | No | No | — |
| 2.12 | Threshold Inspection reports for Bldg Dept | No | No | — |
| 2.13 | Final Landscape acceptance letter for the LA of record submitted if required | No | No | — |

**SECTION 3 — INSPECTIONS (11 items)**

| Item # | Description | Has Date | Calculated | Linked Module |
|--------|-------------|----------|------------|--------------|
| 3.1 | All plan changes submitted and approved by Building Department | No | No | — |
| 3.2 | Health Department approval of water and sewer lines | No | No | — |
| 3.3 | Utility company's approval of water and sewer lines | No | No | — |
| 3.4 | Demo Final | No | No | — |
| 3.5 | Plumbing Final | No | No | — |
| 3.6 | HVAC Final | No | No | — |
| 3.7 | Electrical Final | No | No | — |
| 3.8 | Fire alarm & Fire sprinkler Final | No | No | — |
| 3.9 | Building Final | No | No | — |
| 3.10 | Complete Pre-Certificate of Occupancy checklist | No | No | — |
| 3.11 | Obtain Certificate of Occupancy (C.O.) or Certificate of Completion if shell building | Yes | No | *Spine event: `closeout.co-obtained`* |

**SECTION 4 — TURNOVER (15 items)**

| Item # | Description | Has Date | Calculated | Linked Module |
|--------|-------------|----------|------------|--------------|
| 4.1 | Send copy of C.O. to Owner or Owner's Representative | No | No | — |
| 4.2 | Schedule meeting with Architect & Owner for punch list | Yes | No | — |
| 4.3 | Complete punch list | Yes | No | — |
| 4.4 | Complete as-built drawings | Yes | No | — |
| 4.5 | Schedule "turn-over" meeting with Owner & Owner's Representative | No | No | — |
| 4.6 | Give Owner list of subs and all warranty letters | No | No | — |
| 4.7 | Give Owner all Maintenance Manuals | No | No | — |
| 4.8 | Convey any Attic Stock | No | No | — |
| 4.9 | Forward letter of appreciation to Owner | No | No | — |
| 4.10 | Order plant for delivery (best wishes...) | No | No | — |
| 4.11 | Prepare Public Relations Announcement | No | No | — |
| 4.12 | Complete final payment forms for each subcontractor | No | No | — |
| 4.13 | Date last contractual work on project was performed | Yes | No | — |
| 4.14 | Flag 80 calendar days from last day HB worked on project | No | Yes | **Calculated**: item 4.13 date + 80 days |
| 4.15 | Obtain Release of Liens from Subs | No | No | — |

**SECTION 5 — POST TURNOVER (5 items)**

| Item # | Description | Has Date | Calculated | Linked Module |
|--------|-------------|----------|------------|--------------|
| 5.1 | If final payment is not received, send letter to Owner that we intend to lien property | No | No | — |
| 5.2 | If final payment is not received within 88 days, file lien | No | No | — |
| 5.3 | Six months after completion of project, give photographs taken | No | No | — |
| 5.4 | Request from Owner a recommendation letter | No | No | — |
| 5.5 | Project Manager return all files, permit plans, and permit card to Estimator | No | No | — |

**SECTION 6 — COMPLETE PROJECT CLOSEOUT DOCUMENTS (5 items, integration triggers)**

| Item # | Description | Has Date | Calculated | Linked Module | Integration Trigger |
|--------|-------------|----------|------------|--------------|-------------------|
| 6.1 | Project Closeout Checklist | No | Yes | — | **Calculated**: auto-population of checklist completion % |
| 6.2 | Project Recap Form | No | No | — | — |
| 6.3 | Subcontractor Evaluation Form | No | No | Closeout.Scorecard | **Trigger**: at least one SubScorecard with status ≥ Submitted drives item 6.3 completion |
| 6.4 | Cost Variance Report | No | No | Financial | **Trigger**: consumed from Financial module cost variance data |
| 6.5 | Send Lessons Learned to Victoria Miel | No | No | Closeout.Lessons | **Trigger**: LessonsLearned with status ≥ Submitted; signals to Reports module to assemble release artifacts |

**SECTION 7 — PBC JURISDICTION-SPECIFIC (16 items, template-based)**

| Item # | Description | Has Date | Calculated | Template Note |
|--------|-------------|----------|------------|--------------|
| 7.1 | Soil Bearing Capacity Certification Letter | No | No | PBC-specific; instantiate for jurisdiction = PBC |
| 7.2 | Foundation Soil Density Test Results | No | No | PBC-specific |
| 7.3 | Form Board Survey - Signed & Sealed by Surveyor | No | No | PBC-specific |
| 7.4 | Termite Pre-Treatment Certificate | No | No | PBC-specific |
| 7.5 | Shoring Reports | No | No | PBC-specific |
| 7.6 | Final Certification Letter - Structural (signed and sealed by Structural EOR) | No | No | PBC-specific |
| 7.7 | Fire Main Underground Pressure Test Passed (PBCFD will include DDCV & Plumbing) | No | No | PBC-specific |
| 7.8 | Final Survey - Signed & Sealed | No | No | PBC-specific |
| 7.9 | Insulation Certificates | No | No | PBC-specific |
| 7.10 | Intumescent Fire Coating Certificate (if applicable) | No | No | PBC-specific; conditional |
| 7.11 | Plenum Door Certificate (if applicable) | No | No | PBC-specific; conditional |
| 7.12 | Termite Post-Treatment Certificate | No | No | PBC-specific |
| 7.13 | All Inspections Recorded as "Approved" / "Passed" | No | No | PBC-specific; critical for TCO issuance |
| 7.14 | Partial Final Inspections Passed (as required by Master Building Permit) | No | No | PBC-specific |
| 7.15 | Certification of Completion Letter - Private Provider | No | No | PBC-specific |
| 7.16 | Final Building Inspections by PBC (discretionary) | No | No | PBC-specific; may be required in addition to UES |

---

## 2. Subcontractor Scorecard Working Model

The Subcontractor Scorecard is a multi-criterion weighted evaluation form completed once per subcontractor per project. It consists of 6 evaluation sections with 28 total criteria on a 5-point scale.

### 2.1 Scorecard Header (ISubScorecardHeader)

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Business Rule / Formula |
|------------------------|-----------------|----------|------------|------------------------|
| scorecardId | `string` | Yes | Yes | UUID generated on creation; immutable after submission |
| projectId | `string` | Yes | No | FK to project record |
| projectName | `string` | Yes | No | Inherited from project at creation |
| projectNumber | `string` | Yes | No | Inherited from project at creation |
| projectLocation | `string` | No | No | Inherited from project; optional |
| projectType | `string` | No | No | Inherited from project; optional |
| subcontractorName | `string` | Yes | No | Name of subcontractor being evaluated |
| tradeScope | `string` | Yes | No | Trade or scope of work (e.g., "Mechanical HVAC", "Electrical", "Concrete Foundation") |
| contractValue | `number` | Yes | No | Contract value in USD; decimal to 2 places; may be $0 if T&M |
| finalCost | `number` | No | No | Final cost in USD; populated at closeout; null until finalized |
| scheduledCompletion | `string` | Yes | No | ISO 8601 date — scheduled completion date from contract |
| actualCompletion | `string` | No | No | ISO 8601 date — actual completion date; may be null if sub still working |
| evaluatorName | `string` | Yes | No | Name of evaluator (e.g., "Project Superintendent") |
| evaluatorTitle | `string` | No | No | Title of evaluator (e.g., "Superintendent", "Project Manager") |
| evaluationDate | `string` | Yes | No | ISO 8601 date — date evaluation was completed |
| status | `enum` | Yes | No | Enum: `Draft` \| `Submitted` \| `Reviewed` \| `Archived` |
| pmSignedAt | `datetime` | No | No | ISO 8601 timestamp when PM signed off; null until signed |
| superintendentSignedAt | `datetime` | No | No | ISO 8601 timestamp when Superintendent signed; null until signed |
| peApprovedAt | `datetime` | No | No | ISO 8601 timestamp when PE (Project Executive) approved; null until approved |
| reBidRecommendation | `enum` | Yes | No | Enum: `Yes` \| `YesWithConditions` \| `No` — recommend re-bid for future work |
| keyStrengths | `string` | No | No | Rich text field — evaluator's assessment of sub's key strengths |
| areasForImprovement | `string` | No | No | Rich text field — evaluator's assessment of areas for improvement |
| notableIncidentsOrIssues | `string` | No | No | Rich text field — notable incidents, disputes, or issues on this project |
| overallNarrativeSummary | `string` | No | No | Rich text field — overall narrative summary of performance |

### 2.2 Scoring Scale (Universal)

All criteria use this standardized 5-point scale:

| Score | Rating | Definition |
|-------|--------|-----------|
| 5 | Exceptional | Significantly exceeded expectations; set a standard for excellence |
| 4 | Above Average | Exceeded expectations in most areas; minor issues resolved quickly |
| 3 | Satisfactory | Met expectations; acceptable and within contract scope |
| 2 | Below Average | Partially met expectations; recurring issues required GC intervention |
| 1 | Unsatisfactory | Failed to meet expectations; serious deficiencies; may not re-bid |
| N/A | Not Applicable | Criterion not applicable to this sub's scope; excluded from section average |

### 2.3 Scorecard Section Model (ISubScorecardSection)

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Business Rule / Formula |
|------------------------|-----------------|----------|------------|------------------------|
| sectionId | `string` | Yes | Yes | UUID; immutable |
| sectionKey | `enum` | Yes | No | `Safety` \| `Quality` \| `Schedule` \| `CostMgmt` \| `Communication` \| `Workforce` |
| sectionLabel | `string` | Yes | No | Display name (e.g., "Safety & Compliance") |
| sectionWeight | `number` | Yes | No | Decimal weight in scoring formula (Safety=0.20, Quality=0.20, Schedule=0.20, CostMgmt=0.15, Communication=0.15, Workforce=0.10) |
| criteria | `ISubScorecardCriterion[]` | Yes | No | Array of criteria within this section |
| sectionAvg | `number` | Yes | Yes | **Calculated**: sum(score × itemWeight FOR each criterion WHERE isNA = false) / sum(itemWeight FOR each criterion WHERE isNA = false); rounded to 2 decimals |

### 2.4 Scorecard Criterion Model (ISubScorecardCriterion)

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Business Rule / Formula |
|------------------------|-----------------|----------|------------|------------------------|
| criterionId | `string` | Yes | Yes | UUID; immutable |
| criterionNumber | `number` | Yes | No | Sequential within section (1–5 for Safety/Quality/Schedule/CostMgmt/Communication; 1–4 for Workforce) |
| criterionLabel | `string` | Yes | No | Human-readable criterion text (e.g., "Adherence to site safety plan and OSHA standards") |
| evidenceNote | `string` | Yes | No | Guidance text describing what evidence to use when scoring (e.g., "Evidence: Incidents, near-misses, safety observations") |
| score | `number \| null` | Yes | No | Score 1–5, or null if not yet scored |
| isNA | `boolean` | Yes | No | If true, criterion is marked Not Applicable and excluded from section average |
| comments | `string` | No | No | Optional evaluator comments specific to this criterion |
| itemWeight | `number` | Yes | No | Equal weight within section (0.20 for 5-item sections; 0.25 for 4-item Workforce section) |

### 2.5 Complete Scorecard Sections and Criteria

**SAFETY & COMPLIANCE (section weight: 0.20, 5 criteria @ 0.20 each)**

| Criterion # | Label | Evidence Note |
|-------------|-------|-----------------|
| 1 | Adherence to site safety plan and OSHA standards | Evidence: Incidents, near-misses, safety observations |
| 2 | PPE compliance and toolbox-talk participation | Evidence: Attendance records, field observations |
| 3 | Housekeeping and site cleanliness | Evidence: Daily clean, lay-down areas, debris removal |
| 4 | Incident/injury rate on this project | Evidence: TRIR, recordables, first-aid events |
| 5 | Corrective action response to safety issues | Evidence: Time to close NCRs / safety violations |

**QUALITY OF WORK (section weight: 0.20, 5 criteria @ 0.20 each)**

| Criterion # | Label | Evidence Note |
|-------------|-------|-----------------|
| 1 | Workmanship quality and craftsmanship | Evidence: Punch list density, rework required |
| 2 | Compliance with plans, specs & submittals | Evidence: RFI clarity, revision compliance |
| 3 | First-time inspection pass rate | Evidence: AHJ / third-party inspection results |
| 4 | Materials and equipment quality | Evidence: Substitutions, as-specified compliance |
| 5 | Closeout documentation completeness | Evidence: O&Ms, warranties, as-builts, attic stock |

**SCHEDULE PERFORMANCE (section weight: 0.20, 5 criteria @ 0.20 each)**

| Criterion # | Label | Evidence Note |
|-------------|-------|-----------------|
| 1 | On-time mobilization | Evidence: Actual vs. planned start date |
| 2 | 3-week look-ahead participation & reliability | Evidence: % commitments kept on Last Planner / pull plan |
| 3 | Progress relative to baseline schedule | Evidence: Float consumption, milestone compliance |
| 4 | Recovery effort when behind schedule | Evidence: Added crew, extended hours, phasing coordination |
| 5 | Coordination with other trades | Evidence: BIM / pre-construction coordination, conflicts |

**COST MANAGEMENT (section weight: 0.15, 5 criteria @ 0.20 each)**

| Criterion # | Label | Evidence Note |
|-------------|-------|-----------------|
| 1 | Budget adherence — no unwarranted overruns | Evidence: Change order volume vs. scope growth |
| 2 | Change order pricing accuracy & timeliness | Evidence: Days to submit COs, fair pricing |
| 3 | Back-charge exposure created | Evidence: Back-charges assessed by GC |
| 4 | Material procurement & financial stability | Evidence: No stoppages due to unpaid suppliers |
| 5 | Billing accuracy and schedule of values quality | Evidence: Overbilling, retainage disputes |

**COMMUNICATION & MANAGEMENT (section weight: 0.15, 5 criteria @ 0.20 each)**

| Criterion # | Label | Evidence Note |
|-------------|-------|-----------------|
| 1 | Responsiveness to RFIs, emails, and calls | Evidence: Avg response time, dropped items |
| 2 | Quality of superintendent / foreman leadership | Evidence: Decision authority, problem ownership |
| 3 | Submittals: accuracy, completeness, timeliness | Evidence: Resubmittal rate, lead times met |
| 4 | Participation in OAC and coordination meetings | Evidence: Attendance, action item closure |
| 5 | Issue escalation and conflict resolution | Evidence: Transparent communication vs. avoidance |

**WORKFORCE & LABOR (section weight: 0.10, 4 criteria @ 0.25 each)**

| Criterion # | Label | Evidence Note |
|-------------|-------|-----------------|
| 1 | Adequate and consistent crew staffing | Evidence: Planned vs. actual headcount |
| 2 | Workforce skill level and supervision ratio | Evidence: Journeyman/apprentice mix, field leadership |
| 3 | Compliance with labor requirements | Evidence: MBE/DBE, prevailing wage, union rules if applicable |
| 4 | Subcontractor to sub-tier management | Evidence: Sub-tier oversight, insurance, payments |

### 2.6 Scoring Formulas

**Section Average:**
```
sectionAvg = sum(score × itemWeight FOR each criterion WHERE isNA = false)
           / sum(itemWeight FOR each criterion WHERE isNA = false)
```
Rounded to 2 decimal places. If all criteria in a section are marked N/A, sectionAvg = null.

**Overall Weighted Score:**
```
overallWeightedScore = sum(sectionAvg × sectionWeight FOR each section WHERE sectionAvg != null)
```
Rounded to 2 decimal places.

**Performance Rating (derived from overallWeightedScore):**

| Score Range | Rating |
|-------------|--------|
| 4.50–5.00 | Exceptional |
| 3.50–4.49 | Above Average |
| 2.50–3.49 | Satisfactory |
| 1.50–2.49 | Below Average |
| 1.00–1.49 | Unsatisfactory |

### 2.7 Aggregation Dashboard Row (IAggregationDashboardRow)

The Aggregation Dashboard is an organization-wide multi-project subcontractor performance database. Each row represents one Scorecard submission.

| Field Name (camelCase) | TypeScript Type | Business Rule |
|------------------------|-----------------|---------------|
| subcontractorName | `string` | Name of subcontractor |
| tradeScope | `string` | Trade/scope |
| projectName | `string` | Project name from scorecard |
| projectNumber | `string` | Project number from scorecard |
| evalDate | `string` (ISO 8601) | Evaluation date |
| contractValue | `number` | Contract value in USD |
| safetyScore | `number` | Section average for Safety |
| qualityScore | `number` | Section average for Quality |
| scheduleScore | `number` | Section average for Schedule |
| costMgmtScore | `number` | Section average for Cost Management |
| communicationScore | `number` | Section average for Communication |
| workforceScore | `number` | Section average for Workforce |
| overallWeightedScore | `number` | Final weighted score (1.00–5.00) |
| ratingBand | `enum` | Performance rating: `Exceptional` \| `Above Average` \| `Satisfactory` \| `Below Average` \| `Unsatisfactory` |

---

## 3. Lessons Learned Working Model

The Lessons Learned report captures project insights, root causes, and recommendations for future projects. It is organized as a header record plus one or more individual lesson entries, each with structured categorization, impact assessment, and keyword tagging.

### 3.1 Lessons Learned Report Header (ILessonsLearnedHeader)

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Business Rule / Formula |
|------------------------|-----------------|----------|------------|------------------------|
| reportId | `string` | Yes | Yes | UUID generated on creation; immutable |
| projectId | `string` | Yes | No | FK to project record |
| projectName | `string` | Yes | No | Inherited from project at creation |
| projectNumber | `string` | Yes | No | Inherited from project at creation |
| projectLocation | `string` | No | No | Inherited from project; optional |
| projectType | `string` | No | No | Inherited from project; optional |
| originalContractValue | `number` | Yes | No | Original contract value in USD; decimal to 2 places |
| finalContractValue | `number` | Yes | No | Final contract value in USD; includes all approved COs |
| contractVariance | `number` | Yes | Yes | **Calculated**: `finalContractValue - originalContractValue`; can be positive or negative |
| scheduledCompletion | `string` | Yes | No | ISO 8601 date — scheduled completion from contract |
| actualCompletion | `string` | Yes | No | ISO 8601 date — actual project completion date |
| daysVariance | `number` | Yes | Yes | **Calculated**: datediff(actualCompletion, scheduledCompletion) in calendar days; negative = early, positive = late |
| projectManager | `string` | Yes | No | Name of project manager |
| superintendent | `string` | No | No | Name of superintendent |
| projectExecutive | `string` | No | No | Name of project executive |
| reportPreparedBy | `string` | Yes | No | userid or name of person preparing this report |
| reportDate | `string` | Yes | No | ISO 8601 date — date report was prepared |
| status | `enum` | Yes | No | Enum: `Draft` \| `Submitted` \| `Archived` |
| deliveryMethod | `enum` | Yes | No | Enum: `DesignBidBuild` \| `DesignBuild` \| `CMAtRisk` \| `GMP` \| `LumpSum` \| `IDIQJobOrder` \| `PublicPrivateP3` |
| marketSector | `enum` | Yes | No | Enum: `K12Education` \| `HigherEducation` \| `HealthcareMedical` \| `GovernmentCivic` \| `OfficeCommercial` \| `IndustrialMfg` \| `RetailHospitality` \| `ResidentialMixedUse` \| `TransportationInfra` \| `DataCenterTech` \| `MissionCritical` \| `RenovationHistoric` \| `Other` |
| projectSizeBand | `enum` | Yes | No | Enum: `Under1M` \| `OneToFiveM` \| `FiveToFifteenM` \| `FifteenToFiftyM` \| `FiftyToOneHundredM` \| `OverOneHundredM` |
| complexityRating | `number` | Yes | No | Integer 1–5 (1=Straightforward, 2=Moderate, 3=Complex, 4=Highly Complex, 5=Exceptional) |
| entries | `ILessonEntry[]` | Yes | No | Array of individual lessons; may be empty on first creation |

### 3.2 Individual Lesson Entry Model (ILessonEntry)

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Business Rule / Formula |
|------------------------|-----------------|----------|------------|------------------------|
| lessonId | `string` | Yes | Yes | UUID generated on creation; immutable |
| reportId | `string` | Yes | No | FK to parent LessonsLearned report |
| projectId | `string` | Yes | No | FK to project record |
| lessonNumber | `number` | Yes | Yes | **Calculated**: sequential integer 1–N within report; auto-assigned |
| category | `enum` | Yes | No | Enum: `PreConstruction` \| `EstimatingBid` \| `Procurement` \| `Schedule` \| `CostBudget` \| `Safety` \| `Quality` \| `Subcontractors` \| `DesignRFIs` \| `OwnerClient` \| `TechnologyBIM` \| `WorkforceLabor` \| `Commissioning` \| `CloseoutTurnover` \| `Other` |
| phaseEncountered | `string` | Yes | No | Free-text project phase description (e.g., "Framing Phase", "MEP Rough-In", "Final Inspection") |
| applicability | `number` | Yes | No | Integer 1–5 (1=rarely applicable to future projects, 5=always applicable to future projects) |
| keywords | `string[]` | No | No | Array of parsed keywords (auto-extracted from comma-separated input or manually entered) |
| situation | `string` | Yes | No | Rich text — what happened; when; who; what triggered it (operational narrative) |
| impact | `string` | Yes | No | Rich text — consequences, quantified where possible (cost impact, schedule impact, quality impact, risk/safety impact) |
| impactMagnitude | `enum` | Yes | No | Enum: `Minor` \| `Moderate` \| `Significant` \| `Critical` — derived from thresholds below |
| rootCause | `string` | Yes | No | Rich text — underlying cause analysis; dig deeper than the symptom |
| response | `string` | No | No | Rich text — corrective or mitigation actions taken on this project in response |
| recommendation | `string` | Yes | No | Rich text — **MUST start with an action verb** — what future teams should do differently to avoid or replicate this |
| supportingDocuments | `string` | No | No | Comma-separated or line-separated file paths, RFI numbers, CO numbers, photo file IDs, schedule snapshots, or URLs to supporting materials |
| createdAt | `datetime` | Yes | Yes | ISO 8601 timestamp of lesson creation |
| createdBy | `string` | Yes | No | userid of lesson author |

### 3.3 Impact Magnitude Thresholds (Non-Negotiable)

Impact Magnitude is **NOT** user-selected; it is derived from the impact description. The system MUST validate the impact statement against these thresholds and auto-assign magnitude.

| Magnitude | Cost Impact | OR | Schedule Impact | Definition |
|-----------|-------------|--------|-----------------|-----------|
| **Minor** | < $10,000 | OR | < 2 calendar days | Low impact; easily absorbed |
| **Moderate** | $10,000–$50,000 | OR | 2–10 calendar days | Medium impact; requires attention |
| **Significant** | $50,000–$200,000 | OR | 10–30 calendar days | High impact; affects P&L and delivery |
| **Critical** | > $200,000 | OR | > 30 calendar days | Severe impact; project defining |

**Validation rule:** If impact statement contains quantified cost or days, system extracts and validates; if no quantification, UI prompts for clarification before saving.

### 3.4 Lessons Learned Category Definitions

| Category | Definition | Typical Examples |
|----------|-----------|------------------|
| PreConstruction | Planning, scope development, constructability reviews, BIM coordination, owner alignment | Scope gaps found late, design freeze delays, lack of pre-con coordination |
| EstimatingBid | Quantity takeoffs, bid strategy, allowances, unit price gaps, scope exclusions | Underestimate, exclusion from bid that became issue, pricing strategy error |
| Procurement | Lead times, supplier qualification, subcontract terms, material escalation | Material supply chain failure, long-lead delay, wrong supplier selected |
| Schedule | CPM logic, float management, look-ahead reliability, milestone tracking | Schedule compression needed, float burned early, milestone missed |
| CostBudget | Contingency use, change order management, GMP risk, buyout savings/losses | Contingency exhausted, unfavorable CO, GMP overrun |
| Safety | Incidents, near-misses, safety culture, PPE, subcontractor compliance, JHAs | Accident, near-miss, safety culture issue, regulatory violation |
| Quality | Rework, punch list density, inspection failures, mock-ups, material substitutions | Rework required, punch list heavier than expected, inspection failure |
| Subcontractors | Selection, performance, default, coordination issues, contract clarity | Sub non-performance, coordination conflict, contract ambiguity |
| DesignRFIs | Design gaps, RFI volume, architect responsiveness, drawing coordination | RFI volume high, drawing discrepancy, architect unresponsive |
| OwnerClient | Scope creep, decision latency, design freeze, communication protocols | Scope change, owner decision delays, communication breakdown |
| TechnologyBIM | BIM clash detection, drone use, project management software, digital twins | BIM clash found late, software integration issue, digital twin gap |
| WorkforceLabor | Crew productivity, craft shortage, overtime, union issues, workforce development | Labor shortage, productivity below plan, overtime surge |
| Commissioning | Systems startup, OAC sign-off, testing deficiencies, owner training, TAB | Commissioning delay, test deficiency, owner training gap |
| CloseoutTurnover | As-builts, O&Ms, warranties, attic stock, final lien waivers, COO | Missing as-builts, warranty gap, COO delay |
| Other | Lessons not fitting above categories | Novel issues, external events (weather, pandemic, supply chain) |

### 3.5 Lessons Database Row (ILessonsDatabaseRow)

The Lessons Database is an organization-wide searchable knowledge base of all captured lessons. Each row represents one lesson entry from a submitted LessonsLearned report.

| Field Name (camelCase) | TypeScript Type | Business Rule |
|------------------------|-----------------|---------------|
| projectName | `string` | Project name from parent report |
| projectNumber | `string` | Project number from parent report |
| marketSector | `enum` | Market sector from parent report |
| deliveryMethod | `enum` | Delivery method from parent report |
| projectSize | `enum` | Project size band from parent report |
| reportDate | `string` (ISO 8601) | Report date from parent report |
| lessonNumber | `number` | Sequential number within report |
| category | `enum` | Lesson category |
| situation | `string` | Situation text (searchable) |
| rootCause | `string` | Root cause text (searchable) |
| recommendation | `string` | Recommendation text (searchable; must start with action verb) |
| keywords | `string[]` | Keywords for filtering and discovery |
| impactMagnitude | `enum` | Impact magnitude |
| applicability | `number` | Applicability score 1–5 |

---

## 4. Field Specification Tables (Complete Data Model Mapping)

### 4.1 Closeout Checklist Field Specifications

See §1.1 (Checklist Header), §1.2 (Section Model), §1.3 (Item Model) for complete field tables.

### 4.2 Subcontractor Scorecard Field Specifications

See §2.1 (Header), §2.3 (Section Model), §2.4 (Criterion Model) for complete field tables.

### 4.3 Lessons Learned Field Specifications

See §3.1 (Report Header), §3.2 (Individual Lesson Entry) for complete field tables.

---

## 5. Enum Definitions

### 5.1 Closeout Checklist Enums

```typescript
enum CloseoutItemResult {
  Yes = "Yes",
  No = "No",
  NA = "N/A",
  Pending = "Pending"
}

enum CloseoutChecklistStatus {
  Draft = "Draft",
  InProgress = "InProgress",
  Complete = "Complete",
  Archived = "Archived"
}

enum SectionTitle {
  Tasks = "Tasks",
  DocumentTracking = "DocumentTracking",
  Inspections = "Inspections",
  Turnover = "Turnover",
  PostTurnover = "PostTurnover",
  CompleteProjectCloseoutDocs = "CompleteProjectCloseoutDocs",
  JurisdictionSpecific = "JurisdictionSpecific"
}

enum Jurisdiction {
  PBC = "PBC",
  Other = "Other"
}
```

### 5.2 Subcontractor Scorecard Enums

```typescript
enum SubScorecardStatus {
  Draft = "Draft",
  Submitted = "Submitted",
  Reviewed = "Reviewed",
  Archived = "Archived"
}

enum ReBidRecommendation {
  Yes = "Yes",
  YesWithConditions = "YesWithConditions",
  No = "No"
}

enum SectionKey {
  Safety = "Safety",
  Quality = "Quality",
  Schedule = "Schedule",
  CostMgmt = "CostMgmt",
  Communication = "Communication",
  Workforce = "Workforce"
}

enum PerformanceRating {
  Exceptional = "Exceptional",
  AboveAverage = "Above Average",
  Satisfactory = "Satisfactory",
  BelowAverage = "Below Average",
  Unsatisfactory = "Unsatisfactory"
}
```

### 5.3 Lessons Learned Enums

```typescript
enum LessonCategory {
  PreConstruction = "PreConstruction",
  EstimatingBid = "EstimatingBid",
  Procurement = "Procurement",
  Schedule = "Schedule",
  CostBudget = "CostBudget",
  Safety = "Safety",
  Quality = "Quality",
  Subcontractors = "Subcontractors",
  DesignRFIs = "DesignRFIs",
  OwnerClient = "OwnerClient",
  TechnologyBIM = "TechnologyBIM",
  WorkforceLabor = "WorkforceLabor",
  Commissioning = "Commissioning",
  CloseoutTurnover = "CloseoutTurnover",
  Other = "Other"
}

enum ImpactMagnitude {
  Minor = "Minor",
  Moderate = "Moderate",
  Significant = "Significant",
  Critical = "Critical"
}

enum LessonsLearningReportStatus {
  Draft = "Draft",
  Submitted = "Submitted",
  Archived = "Archived"
}

enum DeliveryMethod {
  DesignBidBuild = "DesignBidBuild",
  DesignBuild = "DesignBuild",
  CMAtRisk = "CMAtRisk",
  GMP = "GMP",
  LumpSum = "LumpSum",
  IDIQJobOrder = "IDIQJobOrder",
  PublicPrivateP3 = "PublicPrivateP3"
}

enum MarketSector {
  K12Education = "K12Education",
  HigherEducation = "HigherEducation",
  HealthcareMedical = "HealthcareMedical",
  GovernmentCivic = "GovernmentCivic",
  OfficeCommercial = "OfficeCommercial",
  IndustrialMfg = "IndustrialMfg",
  RetailHospitality = "RetailHospitality",
  ResidentialMixedUse = "ResidentialMixedUse",
  TransportationInfra = "TransportationInfra",
  DataCenterTech = "DataCenterTech",
  MissionCritical = "MissionCritical",
  RenovationHistoric = "RenovationHistoric",
  Other = "Other"
}

enum ProjectSizeBand {
  Under1M = "Under1M",
  OneToFiveM = "OneToFiveM",
  FiveToFifteenM = "FiveToFifteenM",
  FifteenToFiftyM = "FifteenToFiftyM",
  FiftyToOneHundredM = "FiftyToOneHundredM",
  OverOneHundredM = "OverOneHundredM"
}

enum ComplexityRating {
  Straightforward = 1,
  Moderate = 2,
  Complex = 3,
  HighlyComplex = 4,
  Exceptional = 5
}
```

---

## 6. Business Rules

### 6.1 Closeout Checklist Rules

1. **Single Checklist per Project:** Only one checklist is created per project, upon project activation of closeout phase.
2. **Section 7 Jurisdiction Configuration:** Section 7 is instantiated based on the `jurisdiction` field. PBC is the default template; other jurisdictions can be configured at project creation.
3. **Item 4.14 Auto-Calculation:** `item4_14_calculatedDate = item4_13_date + 80 calendar days` when item 4.13 is marked Yes. This field is read-only.
4. **Tri-State Results:** Each item result is one of: `Yes`, `No`, `N/A`, `Pending`. Pending is transient; must resolve to Yes, No, or N/A before section completion.
5. **Date Tracking:** Items with `hasDateField = true` accept a user-entered date when marked Yes. Dates are immutable once set.
6. **Completion Percentage:** Overall completion = (count of Yes results / count of total applicable items excluding N/A) × 100. Section completion = same formula for section items.
7. **Status Auto-Update:** Checklist `status` is auto-calculated:
   - If any item is Yes: `InProgress`
   - If all non-N/A items are Yes: `Complete`
   - If no items resolved yet: `Draft`

### 6.2 Subcontractor Scorecard Rules

1. **One Scorecard per Sub per Project:** Multiple subcontractors → multiple scorecards. One scorecard per sub per project.
2. **Score Validation:** All scores must be 1–5 or N/A. Null scores prevent form submission.
3. **Section Average Calculation:** If all criteria in a section are N/A, the section average is null and excluded from overall weighted score.
4. **Overall Weighted Score Range:** 1.00–5.00, rounded to 2 decimals.
5. **Performance Rating Derivation:** Rating band is auto-derived from overall weighted score using the thresholds in §2.6.
6. **Status Workflow:**
   - Draft: Initial creation state; editable
   - Submitted: Form locked; requires PM or Superintendent signature
   - Reviewed: PE approval gate passed
   - Archived: Final state; no edits
7. **Signature Requirements:** Transitions to Submitted require PM or Superintendent sign-off; transitions to Reviewed require PE approval.

### 6.3 Lessons Learned Rules

1. **One Report per Project:** Only one LessonsLearned report per project, though it may contain multiple lesson entries.
2. **Lesson Numbering:** Lessons are sequentially numbered 1–N within the report; auto-assigned on creation.
3. **Impact Magnitude Derivation:** Magnitude is **not** user-selected; it is auto-derived from the impact statement:
   - If statement quantifies cost > $200,000 OR days > 30 → Critical
   - If statement quantifies cost $50K–$200K OR days 10–30 → Significant
   - If statement quantifies cost $10K–$50K OR days 2–10 → Moderate
   - If statement quantifies cost < $10K OR days < 2 → Minor
   - If no quantification, UI must prompt for clarification before save
4. **Recommendation Requirement:** Recommendation field MUST start with an action verb (e.g., "Establish...", "Implement...", "Develop...", "Require..."). Validation rule enforced at form save.
5. **Keyword Extraction:** Keywords can be auto-parsed from comma-separated input or manually entered; stored as array.
6. **Status Workflow:**
   - Draft: Editable; entries can be added/removed
   - Submitted: Locked; triggers Reports module publication signal
   - Archived: No edits allowed
7. **Applicability Scale:** 1–5 integer; 1 = rarely applicable, 5 = always applicable. Used for database filtering.

---

## 7. Data Validation Rules

### 7.1 Checklist Validation

- `projectId` must reference a valid, existing project record
- `jurisdiction` must be one of the defined enum values (PBC, Other)
- Each item result must be one of: Yes, No, N/A, Pending
- If item `hasDateField = true` and result = Yes, `itemDate` must be provided
- For item 4.13 (last day HB worked), if marked Yes, item 4.14 `calculatedDate` is auto-set
- All dates must be ISO 8601 format (YYYY-MM-DD)

### 7.2 Scorecard Validation

- `projectId` must reference a valid project
- `subcontractorName` and `tradeScope` are required and non-empty
- `evaluationDate` must be ≤ today's date
- All scores must be 1–5 or null (for incomplete) or N/A
- If score is null, form cannot be submitted
- Section average calculation excludes N/A criteria
- Overall weighted score must fall in 1.00–5.00 range after calculation
- `reBidRecommendation` is required before submission

### 7.3 Lessons Learned Validation

- `reportId` and `projectId` must reference valid records
- `deliveryMethod`, `marketSector`, `projectSizeBand`, `complexityRating` are required
- `originalContractValue` and `finalContractValue` must be ≥ 0
- `scheduledCompletion` and `actualCompletion` must be ISO 8601 dates
- Each lesson entry must have: `category`, `situation`, `impact`, `rootCause`, `recommendation`, `phaseEncountered`, `applicability`
- `recommendation` must start with an action verb (regex validation)
- `impactMagnitude` is auto-derived; user cannot override
- `keywords` are auto-extracted or manually entered; stored as array

---

## 8. Section 6 Integration Rules (Closeout Checklist → Reports Module)

Section 6 of the closeout checklist contains items that integrate with other modules and trigger Reports module actions.

### 8.1 Item 6.1 — Project Closeout Checklist

**Rule:** Automatically populated with current `completionPercentage` of the overall checklist. This is not a manual entry; it is a read-only display of progress.

**Calculation:** `completionPercentage = (count of items with result = Yes / count of total applicable items) × 100`

**Linked to:** Overall checklist completion tracking.

### 8.2 Item 6.3 — Subcontractor Evaluation Form

**Rule:** Marked complete when at least one SubScorecard record for the project has `status ≥ Submitted`.

**System Logic:**
- Query all SubScorecard records for this projectId
- If count > 0 AND any status in {Submitted, Reviewed, Archived}, then item 6.3 result = Yes
- Else item 6.3 result = Pending

**Linked to:** Closeout.Scorecard sub-surface; triggers Spine activity event `closeout.scorecard-submitted`

### 8.3 Item 6.4 — Cost Variance Report

**Rule:** Driven by Financial module cost variance data. Marked complete when Financial module calculates final project-level variance.

**Linked to:** Financial module; read-only display of final variance (originalBudget vs. finalBudget)

### 8.4 Item 6.5 — Send Lessons Learned to Victoria Miel

**Rule:** Marked complete when LessonsLearned report has `status = Submitted` or `Archived`.

**System Logic:**
- Query LessonsLearned record for this projectId
- If status = Submitted or Archived, then item 6.5 result = Yes
- Else item 6.5 result = Pending

**Publication Trigger:** When item 6.5 is marked Yes (i.e., LessonsLearned is submitted), the system sends a publication signal to the Reports module:
- Event: `closeout.lessons-submitted`
- Payload: snapshot of LessonsLearned report (full report record + all entries)
- Reports module receives signal and assembles release-ready report artifacts

---

## 9. Spine Publication Contract

Project Closeout publishes the following Spine events:

### 9.1 Activity Events

| Event | Trigger | Payload |
|-------|---------|---------|
| `closeout.item-completed` | User marks any checklist item result as Yes, No, or N/A | `{ itemId, itemNumber, result, projectId }` |
| `closeout.section-completed` | User completes an entire section (all non-N/A items = Yes) | `{ sectionId, sectionTitle, completionPercentage, projectId }` |
| `closeout.co-obtained` | Item 3.11 (Certificate of Occupancy) is marked Yes | `{ itemId, itemDate, projectId }` |
| `closeout.checklist-complete` | All non-N/A items in checklist = Yes | `{ checklistId, completionPercentage, projectId }` |
| `closeout.scorecard-submitted` | First SubScorecard for project is submitted (status = Submitted) | `{ scorecardId, subcontractorName, projectId }` |
| `closeout.lessons-submitted` | LessonsLearned report status changes to Submitted | `{ reportId, entryCount, projectId }` — triggers Reports module to assemble release artifacts |

### 9.2 Health Events

| Dimension | Calculation | Threshold |
|-----------|-------------|-----------|
| **Closeout Health Score** | (count of Yes items / count of applicable items) × 100 | 100% = Project fully closed out |
| **Scorecard Coverage** | (count of submitted scorecards / estimated sub count) × 100 | >90% = Good coverage |
| **Lessons Captured** | (count of submitted lesson entries) | ≥1 required for archived report |

### 9.3 Work Queue Events

Project Closeout raises work queue items for:

- **Item 3.11 Not Yet Obtained:** If item 3.11 (C.O.) = No and project is in closeout phase, raise priority work queue item
- **Item 4.14 Deadline Passed:** If item 4.14 calculated date has passed and item 4.15 (Release of Liens) = No, raise legal/compliance priority item
- **Late Scorecard Submission:** If more than 30 days have passed since project completion and no scorecard submitted, raise reminder
- **Incomplete Lessons:** If project status = Archive Ready but LessonsLearned = Draft, raise reminder

### 9.4 Related Items (Spine Linking)

- Closeout → Permits: Items 3.9–3.11 link to Building Permit workflow
- Closeout → Financial: Item 6.4 Cost Variance links to Financial module final project ledger
- Closeout → Reports: Items 6.3, 6.5 trigger Reports module publication workflow

---

## 10. Executive Review Boundary

Per P3-E1 §3.9, Project Closeout is a **review-capable surface**. Project Executive (PE) annotation rules:

### 10.1 Annotation Capability

- PE may annotate at full field-level depth on any Scorecard section, criterion, or narrative field
- PE may annotate on Lessons Learned entries, categories, and recommendations
- PE may leave observations on Checklist section completions

### 10.2 Annotation Isolation

- All PE annotations are stored in `@hbc/field-annotations` artifact
- **MUST NOT** write to operational ledger (Scorecard score, Lessons Learned entry content)
- Annotations are visible alongside operational data but remain isolated
- Example: PE cannot override a Scorecard criterion score; PE can annotate "This rating seems high given punch list density"

### 10.3 Annotation Visibility

- Annotations are visible to all project stakeholders (PM, Superintendent, PE, Finance)
- Annotations do not prevent form submission or lock data
- Annotation history is retained for audit trail

---

## 11. Required Capabilities

1. **Closeout Checklist Tracking:** 70-item tri-state tracking across 7 sections with jurisdiction-specific templating
2. **Date Field Tracking:** Dates recorded for items 2.10, 3.11, 4.2, 4.3, 4.4, 4.13
3. **Auto-Calculated Item 4.14:** 80-day lien deadline auto-calculated from item 4.13
4. **Jurisdiction Configuration:** Section 7 instantiation based on project jurisdiction (PBC default; expandable)
5. **Completion Percentage Calculation:** Overall and per-section progress tracking
6. **Multi-Subcontractor Scorecard Entry:** Support multiple scorecards per project (one per sub)
7. **Weighted Scoring System:** 6 sections with variable criteria count, weighted average calculation
8. **Performance Rating Derivation:** Auto-derived from overall weighted score
9. **Lessons Learned Form:** Structured entry with categorization, impact magnitude derivation, keyword tagging
10. **Lessons Database Aggregation:** Organization-wide searchable database with filters (category, keywords, applicability, market sector, delivery method, impact magnitude)
11. **Aggregation Dashboard:** Organization-wide subcontractor performance database with section-level and overall scores
12. **Section 6 Integration Triggers:** Items 6.3 (scorecard check), 6.4 (financial variance), 6.5 (lessons + report trigger) drive completion logic
13. **Reports Module Publication Hook:** When item 6.5 is marked Yes, emit `closeout.lessons-submitted` event with full report snapshot for Reports module
14. **Spine Publication Contract:** Activity, Health, Work Queue, Related Items events as defined in §9
15. **Executive Review Annotation:** Full-field annotation via `@hbc/field-annotations` without operational ledger mutation

---

## 12. Acceptance Gate

Reference P3-H1 §18.5. Project Closeout module must meet:

- **Source-of-Truth Requirement:** All operational closeout data is owned by Project Closeout; Reports module consumes but does not mutate
- **Action Boundary:** Closeout checklist and scorecards are action ledgers; once submitted, historical records are immutable; new evaluations create new scorecards
- **Spine Publication Contract:** All events defined in §9 are emitted on state changes
- **Executive Review Boundary:** PE annotations stored in @hbc/field-annotations; operational ledger protected
- **Data Validation:** All enums, required fields, and business rules enforced at API boundary
- **Cross-Module Integration:** Section 6 items trigger Reports module workflow correctly; Financial variance is read-only from Project Closeout
- **Field Index Completeness:** All 11 data models fully implemented with no field omissions

---

## 13. Field Index (All Fields Referenced)

**Closeout Checklist:** checklistId, projectId, projectName, projectNumber, projectLocation, projectType, jurisdiction, createdAt, createdBy, lastModifiedAt, lastModifiedBy, status, completionPercentage, sections, notes | sectionId, sectionNumber, sectionTitle, itemCount, items, sectionCompletionPercentage, completedAt | itemId, sectionId, itemNumber, itemDescription, hasDateField, isJurisdictionSpecific, isCalculated, result, resultDate, itemDate, calculatedDate, notes, linkedItemId

**Subcontractor Scorecard:** scorecardId, projectId, projectName, projectNumber, projectLocation, projectType, subcontractorName, tradeScope, contractValue, finalCost, scheduledCompletion, actualCompletion, evaluatorName, evaluatorTitle, evaluationDate, status, pmSignedAt, superintendentSignedAt, peApprovedAt, reBidRecommendation, keyStrengths, areasForImprovement, notableIncidentsOrIssues, overallNarrativeSummary | sectionId, sectionKey, sectionLabel, sectionWeight, criteria, sectionAvg | criterionId, criterionNumber, criterionLabel, evidenceNote, score, isNA, comments, itemWeight | subcontractorName, tradeScope, projectName, projectNumber, evalDate, contractValue, safetyScore, qualityScore, scheduleScore, costMgmtScore, communicationScore, workforceScore, overallWeightedScore, ratingBand

**Lessons Learned:** reportId, projectId, projectName, projectNumber, projectLocation, projectType, originalContractValue, finalContractValue, contractVariance, scheduledCompletion, actualCompletion, daysVariance, projectManager, superintendent, projectExecutive, reportPreparedBy, reportDate, status, deliveryMethod, marketSector, projectSizeBand, complexityRating, entries | lessonId, reportId, projectId, lessonNumber, category, phaseEncountered, applicability, keywords, situation, impact, impactMagnitude, rootCause, response, recommendation, supportingDocuments, createdAt, createdBy | projectName, projectNumber, marketSector, deliveryMethod, projectSize, reportDate, lessonNumber, category, situation, rootCause, recommendation, keywords, impactMagnitude, applicability

---

## Document Version and Maintenance

| Revision | Date | Author | Change |
|----------|------|--------|--------|
| 1.0 | 2026-03-23 | Project Hub Leadership | Initial specification document |

This specification is canonical for Phase 3, Workstream E implementation. Any deviations from this specification require explicit authorization via ADR or task amendment.
