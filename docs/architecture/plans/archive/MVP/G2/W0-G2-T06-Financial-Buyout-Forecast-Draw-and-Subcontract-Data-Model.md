# W0-G2-T06 — Financial, Buyout, Forecast, Draw, and Subcontract Data Model

> **Doc Classification:** Canonical Normative Plan — Wave 0 Group 2 task plan for the Financial / Buyout / Forecast / Draw / Subcontract workflow family. Defines the list schemas, seeded files, and cross-family references for financial workflow foundations. Governed by T01 schema standards.

**Phase Reference:** Wave 0 Group 2 — Backend Hardening and Workflow Data Foundations Plan
**Depends On:** T01 (schema standards and PID contract)
**Unlocks:** T07 (provisioning saga step 4 extension for financial lists), T09 (financial list tests)
**Source Materials:** `Buyout Log_Template 2025.xlsx`, `HB Draw Schedule -Cash Flow.xlsx`, `Financial Forecast Summary & Checklist.xlsx`, `SUBCONTRACT CHECKLIST.xlsx`, `Procore budget report.pdf`
**ADR Output:** Contributes to ADR-0115

---

## Objective

Define the complete data model for the Financial / Buyout / Forecast / Draw / Subcontract workflow family. This is the most structurally complex family in G2 because financial workflows (buyout, forecast, draw schedule, subcontract management) involve hierarchical records, multi-party relationships, and data that is currently tightly integrated with Procore.

**G2 scope constraint for financial workflows:** T06 must be conservative. Financial data that is currently owned and managed in Procore should not be duplicated in SharePoint lists without a clear reason. T06's primary purpose is to create the structural foundation that Wave 1 financial intelligence features can build against — not to replace Procore as the source of truth for financial data.

---

## Why This Task Exists

Several financial workflows have clear list-backing value that is distinct from Procore data:

1. **Buyout Log** — The buyout process (selecting subcontractors, getting bids, awarding scopes) happens before subcontracts are executed in Procore. A structured buyout log provides the bidding and award intelligence that Procore's contract module does not capture well.
2. **Draw Schedule / Cash Flow** — The draw schedule is a financial forecast tool that maps budget line items to anticipated pay application dates. Procore tracks actual pay applications; the draw schedule tracks the forecast. This forecast data is distinct and valuable.
3. **Financial Forecast Summary** — The monthly forecast checklist (from `Financial Forecast Summary & Checklist.xlsx`) captures the state of forecast deliverables. This is a structured status check, not duplicated Procore data.
4. **Subcontract Compliance** — The `SUBCONTRACT CHECKLIST.xlsx` tracks compliance items (insurance, bonding, safety, documentation) that must be verified before a subcontract is awarded or active. This is a pre-award and ongoing compliance posture, not Procore data.

Without these structures, Wave 1 financial intelligence features (GC-GR analysis, forecast accuracy, buyout efficiency) have no pre-positioned data foundation.

---

## Scope

T06 covers:

1. Buyout Log (parent/child structure)
2. Draw Schedule / Cash Flow (seed now — list + seeded file)
3. Financial Forecast Status (list only)
4. Subcontract Compliance Checklist (list only)
5. GC-GR / General Conditions tracking (reference file only)

T06 does not cover:

- Procore budget data (Procore owns the budget — T06 does not duplicate it)
- Pay application processing (Procore owns the pay application workflow)
- Lien release tracking (Wave 1+ feature; complex enough to require its own scope)
- Cost code structures (Procore owns cost codes; T06 may reference cost code categories but not define them)
- Lessons Learned Report (`07 20260307_SOP_LessonsLearnedReport-DRAFT.xlsx`) — classified as future feature target for the `@hbc/post-bid-autopsy` package (post-project intelligence, Wave 2)

---

## Governing Constraints

Same as T02–T05. Additional financial-specific constraint: G2 must not position SharePoint lists as competing with Procore for financial source-of-truth. Lists capture intelligence and compliance data that Procore does not own. If Procore owns the record, T06 uses a reference field (Procore project number, subcontract ID) rather than duplicating the record.

---

## 1. Workflow Classification Summary

| Workflow | Classification | Lists Created | Seeded Files |
|---------|--------------|--------------|-------------|
| Buyout Log | **Seed now** | `Buyout Log`, `Buyout Bid Lines` | `Buyout Log Template.xlsx` |
| Draw Schedule / Cash Flow | **Seed now** | `Draw Schedule` | `Draw Schedule Template.xlsx` |
| Financial Forecast Status | **List only** | `Financial Forecast Status` | — |
| Subcontract Compliance | **List only** | `Subcontract Compliance Log` | — |
| GC-GR / General Conditions | **Reference file only** | — | (seeded only if a standard HBC GC-GR template exists) |
| Lessons Learned Report | **Future feature target** | — | — |
| Subcontractor Scorecard SOP | **Future feature target** | — | — |

---

## 2. List Schemas

### 2.1 Buyout Log (Parent List)

**Title:** `Buyout Log`
**Description:** Master buyout tracking record for the project. Each record represents one scope of work being bid and awarded.
**Template:** 100

**Source material:** `Buyout Log_Template 2025.xlsx` — fields observed: Project Name, Project #, Scope/Trade, Subcontractor names (multiple bidders), Quote/Bid amounts, Award Status, Award Date, Contract Value, NTO date, Start Date, Completion Date, COI status, Bonding status, Notes.

| InternalName | DisplayName | Type | Required | Notes |
|-------------|------------|------|----------|-------|
| `pid` | Project ID | Text | Yes | `defaultValue: projectNumber`, `indexed: true` |
| `Title` | Scope / Trade Description | Text | Yes | E.g., "Division 03 — Concrete" |
| `Status` | Status | Choice | Yes | `Pending Bids | Bids Received | Under Review | Awarded | Executed | On Hold` |
| `Division` | CSI Division | Choice | No | `Division 01 | Division 02 | ... | Division 16 | Other` — aligns with estimating bid structure |
| `BudgetAmount` | Budget Amount | Number | No | |
| `AwardAmount` | Award Amount | Number | No | Final contract value awarded |
| `AwardedTo` | Awarded To (Sub Name) | Text | No | |
| `AwardDate` | Award Date | DateTime | No | |
| `ContractExecutedDate` | Contract Executed Date | DateTime | No | |
| `NTPDate` | Notice to Proceed Date | DateTime | No | |
| `ScheduledStartDate` | Scheduled Start Date | DateTime | No | |
| `ScheduledCompletionDate` | Scheduled Completion Date | DateTime | No | |
| `InsuranceCOIReceived` | COI Received | Boolean | No | Certificate of Insurance |
| `BondingRequired` | Bonding Required | Boolean | No | |
| `BondReceived` | Bond Received | Boolean | No | |
| `ProcoreSubcontractId` | Procore Subcontract ID | Text | No | Reference to Procore contract record |
| `Notes` | Notes | MultiLineText | No | |

### 2.2 Buyout Bid Lines (Child List)

**Title:** `Buyout Bid Lines`
**Description:** Individual bid submissions for each Buyout Log scope. Tracks competitive bidding process.
**Template:** 100

**Source material:** `Buyout Log_Template 2025.xlsx` — multiple bidder columns per scope row.

| InternalName | DisplayName | Type | Required | Notes |
|-------------|------------|------|----------|-------|
| `pid` | Project ID | Text | Yes | `defaultValue: projectNumber`, `indexed: true` |
| `Title` | Bid Line Title | Text | Yes | E.g., "Smith Electric — Bid Submission" |
| `ParentRecord` | Buyout Log Entry | Lookup | Yes | `lookupListTitle: Buyout Log`, `lookupFieldName: ID` |
| `SubcontractorName` | Subcontractor Name | Text | Yes | |
| `BidAmount` | Bid Amount | Number | No | |
| `BidDate` | Bid Date | DateTime | No | |
| `BidStatus` | Bid Status | Choice | No | `Invited | Pending | Submitted | Declined | Awarded | Alternate | Rejected` |
| `Scope` | Scope Notes / Qualifications | MultiLineText | No | Any exclusions or qualifications in the bid |
| `ContactName` | Bidder Contact Name | Text | No | |
| `ContactEmail` | Bidder Contact Email | Text | No | |
| `Notes` | Notes | MultiLineText | No | |

---

### 2.3 Draw Schedule

**Title:** `Draw Schedule`
**Description:** Tracks the anticipated pay application schedule and cash flow forecast by budget category.
**Template:** 100

**Source material:** `HB Draw Schedule -Cash Flow.xlsx` — Cost Code, Description, Contract/Budget Total, monthly pay app dates and amounts, Cumulative to Date, Remaining Budget.

**Design decision for Wave 0:** The `HB Draw Schedule -Cash Flow.xlsx` is a complex matrix with monthly pay applications as column headers. A SharePoint list cannot replicate this matrix format natively. The Wave 0 approach is a simplified list structure that captures: each budget line item with its total, and the most recently updated pay application amount. The full monthly cash flow matrix is handled by the seeded Excel file during the transition period.

**Ambiguity note:** If the product owner requires a full monthly cash-flow structure in the list (one list item per budget line × month), the schema would need to be significantly different (normalized structure with one row per period per line item). T07 must confirm which interpretation is intended before implementing. This plan specifies the simplified row-per-budget-line model.

| InternalName | DisplayName | Type | Required | Notes |
|-------------|------------|------|----------|-------|
| `pid` | Project ID | Text | Yes | `defaultValue: projectNumber`, `indexed: true` |
| `Title` | Budget Line Description | Text | Yes | E.g., "Division 03 — Concrete" |
| `CostCode` | Cost Code | Text | No | Procore cost code reference |
| `ContractBudget` | Contract Budget | Number | No | Total budgeted amount for this line |
| `CurrentForecast` | Current Forecast | Number | No | Most recent forecast for this line |
| `BilledToDate` | Billed to Date | Number | No | Cumulative pay apps to date |
| `RemainingBudget` | Remaining Budget (Calculated) | Number | No | `ContractBudget - BilledToDate` — manually updated |
| `PercentComplete` | Percent Complete | Number | No | |
| `Status` | Status | Choice | Yes | `On Track | At Risk | Over Budget | Complete` |
| `LastUpdated` | Last Updated | DateTime | No | Last time this row was reviewed |
| `Notes` | Notes | MultiLineText | No | |

---

### 2.4 Financial Forecast Status

**Title:** `Financial Forecast Status`
**Description:** Monthly financial forecast deliverables checklist. Tracks whether all required forecast documents have been completed for each forecast period.
**Template:** 100

**Source material:** `Financial Forecast Summary & Checklist.xlsx` — checklist items: Procore Budget updated, Forecast Summary, vendor quotes, permits, insurance, etc. Monthly status check.

| InternalName | DisplayName | Type | Required | Notes |
|-------------|------------|------|----------|-------|
| `pid` | Project ID | Text | Yes | `defaultValue: projectNumber`, `indexed: true` |
| `Title` | Forecast Period | Text | Yes | E.g., "April 2026 Forecast" |
| `ForecastMonth` | Forecast Month | DateTime | Yes | First day of the forecast month |
| `Status` | Status | Choice | Yes | `Not Started | In Progress | Submitted | Approved` |
| `ProcoreBudgetUpdated` | Procore Budget Updated | Boolean | No | From forecast checklist |
| `ForecastSummaryComplete` | Forecast Summary Complete | Boolean | No | |
| `VendorQuotesReceived` | Vendor Quotes Received | Boolean | No | |
| `GCGRUpdated` | GC-GR Updated | Boolean | No | |
| `ContractType` | Contract Type | Choice | No | `CM/GMP | Lump Sum | Cost Plus | Other` — from Financial Forecast Summary header |
| `ProjectType` | Project Type | Choice | No | `New Construction | Renovation | Other` |
| `SubmittedBy` | Submitted By | User | No | |
| `SubmissionDate` | Submission Date | DateTime | No | |
| `Notes` | Notes | MultiLineText | No | |

---

### 2.5 Subcontract Compliance Log

**Title:** `Subcontract Compliance Log`
**Description:** Tracks compliance requirements (insurance, bonding, safety documentation) for each subcontractor on the project.
**Template:** 100

**Source material:** `SUBCONTRACT CHECKLIST.xlsx` — columns: Requirement Category (insurance, bonding, safety, documentation), Specific Requirement, Required (yes/no), Received (yes/no), Date Received, Expiration Date.

| InternalName | DisplayName | Type | Required | Notes |
|-------------|------------|------|----------|-------|
| `pid` | Project ID | Text | Yes | `defaultValue: projectNumber`, `indexed: true` |
| `Title` | Compliance Item | Text | Yes | E.g., "Smith Electric — General Liability COI" |
| `SubcontractorName` | Subcontractor Name | Text | Yes | |
| `RequirementType` | Requirement Type | Choice | Yes | `General Liability Insurance | Workers Comp Insurance | Auto Insurance | Professional Liability | Umbrella | Payment Bond | Performance Bond | Safety Program | OSHA Compliance | W-9 | Other` |
| `Status` | Status | Choice | Yes | `Required — Not Received | Received | Verified | Expired | Waived` |
| `DateRequested` | Date Requested | DateTime | No | |
| `DateReceived` | Date Received | DateTime | No | |
| `ExpirationDate` | Expiration Date | DateTime | No | |
| `DocumentLink` | Document (SharePoint) | URL | No | |
| `WaiverApproval` | Waiver Approval | Text | No | Who approved any waiver (from Compliance Waiver Request sheet in SUBCONTRACT CHECKLIST.xlsx) |
| `Notes` | Notes | MultiLineText | No | |

---

## 3. Seeded File Specifications

### 3.1 Buyout Log Template
- **File name:** `Buyout Log Template.xlsx`
- **Target library:** `Project Documents`
- **Asset path:** `backend/functions/src/assets/templates/Buyout Log Template.xlsx`
- **Source:** Derived from `Buyout Log_Template 2025.xlsx` — strip project-specific data, retain column headers and structure
- **Classification:** Seed now (operational bridge until Wave 1 buyout management feature)

### 3.2 Draw Schedule Template
- **File name:** `Draw Schedule Template.xlsx`
- **Target library:** `Project Documents`
- **Asset path:** `backend/functions/src/assets/templates/Draw Schedule Template.xlsx`
- **Source:** Derived from `HB Draw Schedule -Cash Flow.xlsx` — strip project-specific data, retain the monthly matrix structure and cost code layout
- **Classification:** Seed now (operational bridge; the `Draw Schedule` list captures simplified data)

### 3.3 Financial Forecast Checklist Reference
- **File name:** `Financial Forecast Checklist.xlsx`
- **Target library:** `Project Documents`
- **Asset path:** `backend/functions/src/assets/templates/Financial Forecast Checklist.xlsx`
- **Source:** Derived from `Financial Forecast Summary & Checklist.xlsx` — retain checklist structure, strip project-specific data
- **Classification:** Seed now (operational bridge alongside the `Financial Forecast Status` list)

---

## 4. Cross-Family References

### 4.1 → Startup (T02)

The Estimating Kickoff (T02) is the point at which the buyout process begins. The `Buyout Log` parent record (T06) may reference the kickoff date and budget transferred flag from T02's `Estimating Kickoff Log` via `pid` cross-reference.

### 4.2 → Closeout (T03)

Final subcontractor payments and lien release verification happen in the closeout phase. The `Closeout Checklist Items` (T03) include financial closeout items. T06's `Buyout Log` records the subcontract award and final status. T03 references T06 records via subcontractor name and `pid`.

### 4.3 → Safety (T04)

The `Sub Safety Certifications` list (T04) tracks safety compliance documentation for subcontractors. The `Subcontract Compliance Log` (T06) tracks insurance and bonding compliance. Together, they provide a full compliance picture for a subcontractor. The two lists are complementary: T04 owns safety certifications; T06 owns financial/legal compliance documents.

---

## 5. Acceptance Criteria

- [ ] `Buyout Log` parent schema is fully specified
- [ ] `Buyout Bid Lines` child schema is fully specified with lookup column
- [ ] `Draw Schedule` schema is specified with Wave 0 simplified model; ambiguity about monthly matrix vs. simplified model is resolved and documented in T07
- [ ] `Financial Forecast Status` schema is fully specified
- [ ] `Subcontract Compliance Log` schema is fully specified
- [ ] GC-GR classified as "reference file only" with justification
- [ ] Lessons Learned and Subcontractor Scorecard classified as "future feature target" with notes pointing to `@hbc/post-bid-autopsy` as the intended consumer package
- [ ] 3 seeded files specified with asset paths
- [ ] Cross-family references to Startup, Closeout, and Safety are documented
- [ ] All lists include `pid` with `defaultValue: projectNumber` and `indexed: true`
- [ ] No list duplicates Procore-owned financial records

---

## 6. Known Risks and Pitfalls

**Risk T06-R1: Financial data schemas are the most likely to require Wave 1 rework.** Financial workflows are complex, project-type-specific, and evolve rapidly. The Wave 0 schemas defined here are intentionally simplified. Wave 1 financial features should expect to extend or restructure these schemas. The T06 schemas must not be treated as final — they are a structural placeholder that enables pre-positioning.

**Risk T06-R2: Draw Schedule list vs. Excel conflict.** The `Draw Schedule` list is a simplified row-per-budget-line structure that cannot replicate the full monthly cash-flow matrix in `HB Draw Schedule -Cash Flow.xlsx`. PM staff who use the Excel daily will not enter data into both formats. During the transition period, the list may be entirely unused. This is acceptable for Wave 0 — the structural foundation is the goal. However, T07 must clearly document in the list description that the Excel template is the operational tool during transition, not the list.

**Risk T06-R3: `Buyout Log` vs. Procore contract module overlap.** Once subcontracts are executed in Procore, the `Buyout Log` records the same information at different fidelity. There is a risk of data drift where the SharePoint list and Procore have different contract amounts. T01's transition doctrine applies: the `Buyout Log` is operative for the pre-award bidding phase; Procore is authoritative for post-award contract execution. This boundary must be documented in the list description and in the Wave 1 planning guidance.

**Risk T06-R4: `Subcontract Compliance Log` duplication risk with T04's `Sub Safety Certifications`.** The `SUBCONTRACT CHECKLIST.xlsx` includes both financial compliance (insurance, bonds) and safety compliance (OSHA, safety program). T06 covers financial/legal compliance; T04 covers safety certifications. Implementors must not create overlapping records. The split is: T04 owns OSHA certifications, competent person certificates, equipment operator certifications. T06 owns insurance certificates, bonds, W-9s, legal documentation.

---

## Follow-On Consumers

- **T07:** Adds T06 lists and seeded files to provisioning configuration; resolves Draw Schedule model ambiguity
- **T09:** Tests presence and structure of T06 lists
- **Wave 1 financial intelligence:** `Buyout Log` and `Draw Schedule` are primary Wave 1 inputs for project financial monitoring features
- **`@hbc/post-bid-autopsy`:** `Lessons Learned` data (future feature target) is the intended input for this intelligence package; T06 notes this as the deferred dependency

---

*End of W0-G2-T06 — Financial, Buyout, Forecast, Draw, and Subcontract Data Model v1.0*
