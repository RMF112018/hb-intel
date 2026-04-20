# P3-E10-T03 — Closeout Execution Checklist, Template Library, and Overlay Model

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E10-T03 |
| **Parent** | [P3-E10 Project Closeout Module](P3-E10-Project-Closeout-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T03 of 11 |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Governing — locked architecture |

---

## 1. Template Library Architecture

### 1.1 Governance Model

The checklist template library is a **MOE-controlled governed asset**. It defines the company baseline that all project checklists inherit. Project teams cannot modify the governed baseline — they may only add project-local overlay items within defined bounds.

| Role | Authority |
|---|---|
| MOE / Admin | Create, version, retire templates; define governed items |
| PE | May request template revision via MOE; may not edit templates directly |
| PM | No template authority; receives instantiated checklist |
| SUPT | No template authority |

### 1.2 Template Versioning

Templates follow semantic versioning (`YYYY.major.minor`, e.g., `2026.1.0`). Only one template version is `current` at a time. When a new version is published:

- All **newly activated** projects receive the new template.
- **In-flight checklists** retain the version they were instantiated with — no retroactive upgrade.
- The `CloseoutChecklist.templateVersion` field is immutable after instantiation.

### 1.3 Jurisdiction Variants

Section 7 content varies by project jurisdiction. The `CloseoutChecklist.jurisdiction` field governs which Section 7 items are instantiated:

| Jurisdiction | Section 7 behavior |
|---|---|
| `PBC` | Instantiates all 16 PBC-specific items |
| `Other` | Section 7 instantiated as empty scaffold; PM may add overlay items |
| *(future)* Broward, Miami-Dade, etc. | MOE may add named jurisdiction sections in future template versions |

---

## 2. Checklist Item Metadata Schema

Every checklist item — governed or overlay — carries the following metadata. This schema drives UI rendering, completion logic, audit behavior, and cross-module integration.

| Metadata field | Type | Values / Rules |
|---|---|---|
| `isGoverned` | boolean | `true` = company baseline; `false` = PM overlay |
| `isRequired` | boolean | `true` = cannot be NA without `naJustification`; enforced at submission |
| `responsibleRole` | enum | `PM` \| `SUPT` \| `PE` \| `OWNER` \| `AHJ` \| `ARCHITECT` \| `ENGINEER` \| `MOE` — who is accountable for completing this item |
| `sourceBasis` | string | e.g., "OSHA 1926.150", "company policy §14", "AIA A201 §9.8", "contract §12.3" |
| `lifecycleStageTrigger` | enum | `ALWAYS` \| `INSPECTIONS` \| `TURNOVER` \| `POST_TURNOVER` \| `FINAL_COMPLETION` \| `ARCHIVE_READY` — the lifecycle stage at which this item becomes active/due |
| `hasEvidenceRequirement` | boolean | If true, UI surfaces an evidence attachment / note prompt when marking Yes |
| `evidenceHint` | string | Short guidance text for what evidence is expected |
| `hasDateField` | boolean | If true, itemDate is recorded when result = Yes |
| `isCalculated` | boolean | If true, value is system-derived; user cannot enter result manually |
| `calculationSource` | string | Describes the derivation formula |
| `linkedModuleHint` | string | Module whose records relate to this item (`permits`, `financial`, `safety`, `schedule`) |
| `linkedRelationshipKey` | string | Key registered in `@hbc/related-items` registry; enables contextual record panel |
| `spineEventOnCompletion` | string | Activity Spine event emitted when this item = Yes (null if none) |
| `milestoneGateKey` | enum | If this item's completion is required for a milestone, the `CloseoutMilestoneKey` |

---

## 3. Complete Governed Baseline — All 70 Items

### Column key for the tables below:
- **Req** — `R` = Required (cannot be NA without justification); `O` = Optional
- **Role** — Primary responsible role abbreviation
- **Stage** — `A` = Always active; `I` = Inspections phase; `T` = Turnover; `PT` = Post-turnover; `FC` = Final completion; `AR` = Archive ready
- **Date** — `✓` = records a date; blank = no date
- **Evid** — `✓` = evidence hint / attachment recommended
- **Calc** — `✓` = system-calculated
- **Spine** — Activity Spine event key (abbreviated); blank = none
- **Gate** — Milestone gate key triggered (abbreviated); blank = none
- **Module** — Linked module for related-items

---

### Section 1 — Tasks (5 items)

| # | Description | Req | Role | Stage | Date | Evid | Calc | Spine | Gate | Module |
|---|---|---|---|---|---|---|---|---|---|---|
| 1.1 | Installation of phone lines for Fire Alarm & Elevator — by owner to set up account | O | OWNER | A | | | | | | |
| 1.2 | All RFIs closed | R | PM | T | | ✓ | | | TASKS_COMPLETE | |
| 1.3 | All Submittals approved | R | PM | T | | ✓ | | | TASKS_COMPLETE | |
| 1.4 | All Change Orders approved | R | PM | T | | ✓ | | | TASKS_COMPLETE | financial |
| 1.5 | Request all as-builts from Subs | R | PM | T | | | | | | |

**Section gate:** All items = Yes (or required items with NA+justification) → `TASKS_COMPLETE` milestone.

---

### Section 2 — Document Tracking (13 items)

| # | Description | Req | Role | Stage | Date | Evid | Calc | Spine | Gate | Module |
|---|---|---|---|---|---|---|---|---|---|---|
| 2.1 | Soil investigation and certification of building pad if required | O | ENGINEER | A | | ✓ | | | | |
| 2.2 | Soil Poison/Termite letter from Shell contractor prior to pours | O | SUPT | A | | ✓ | | | | |
| 2.3 | Insulation certificate from insulation contractor | O | SUPT | T | | ✓ | | | | |
| 2.4 | Form board survey | O | ENGINEER | A | | ✓ | | | | |
| 2.5 | Tie-in survey showing setbacks and finish floor elevation | O | ENGINEER | A | | ✓ | | | | |
| 2.6 | Final Survey & Elevation Certificate | R | ENGINEER | T | | ✓ | | | DOCUMENTS_COMPLETE | |
| 2.7 | Letter on fire-treated lumber if applicable | O | SUPT | A | | ✓ | | | | |
| 2.8 | Fire Alarm Monitoring letter received from Owner | O | OWNER | T | | ✓ | | | | |
| 2.9 | Letter from Structural Engineer certifying building as-builts if necessary | O | ENGINEER | T | | ✓ | | | | |
| 2.10 | Architect to issue Certificate of Substantial Completion Affidavit | R | ARCHITECT | T | ✓ | ✓ | | subst-compl | DOCUMENTS_COMPLETE | |
| 2.11 | Engineer Cert for all sitework — Paving & Utilities | O | ENGINEER | T | | ✓ | | | | |
| 2.12 | Threshold Inspection reports for Bldg Dept | O | ENGINEER | I | | ✓ | | | | |
| 2.13 | Final Landscape acceptance letter from LA of record submitted if required | O | ARCHITECT | T | | ✓ | | | | |

**Section gate:** Items 2.6 and 2.10 both = Yes → `DOCUMENTS_COMPLETE` milestone (informational; not a state-machine gate).

---

### Section 3 — Inspections (11 items)

| # | Description | Req | Role | Stage | Date | Evid | Calc | Spine | Gate | Module |
|---|---|---|---|---|---|---|---|---|---|---|
| 3.1 | All plan changes submitted and approved by Building Department | R | PM | I | | ✓ | | | | permits |
| 3.2 | Health Department approval of water and sewer lines | O | PM | I | | ✓ | | | | |
| 3.3 | Utility company's approval of water and sewer lines | O | PM | I | | ✓ | | | | |
| 3.4 | Demo Final | O | SUPT | I | | | | | | permits |
| 3.5 | Plumbing Final | R | SUPT | I | | | | | | permits |
| 3.6 | HVAC Final | R | SUPT | I | | | | | | permits |
| 3.7 | Electrical Final | R | SUPT | I | | | | | | permits |
| 3.8 | Fire Alarm & Fire Sprinkler Final | R | SUPT | I | | | | | | permits |
| 3.9 | Building Final | R | SUPT | I | | | | | | permits |
| 3.10 | Complete Pre-Certificate of Occupancy checklist | R | PM | I | | ✓ | | | | |
| 3.11 | Obtain Certificate of Occupancy or Certificate of Completion (shell buildings) | R | PM | I | ✓ | ✓ | | co-obtained | CO_OBTAINED | permits |

**Section gate:** Item 3.11 = Yes with date → `CO_OBTAINED` milestone → lifecycle state `INSPECTIONS_CLEARED`. This is Owner/AHJ dependent; cannot be self-certified. PE is alerted.

**Evidence rule for 3.11:** The C.O. document must be attached or referenced. The `evidenceHint` is: "Attach C.O. or C.C. document; record issue date."

---

### Section 4 — Turnover (15 items)

| # | Description | Req | Role | Stage | Date | Evid | Calc | Spine | Gate | Module |
|---|---|---|---|---|---|---|---|---|---|---|
| 4.1 | Send copy of C.O. to Owner or Owner's Representative | R | PM | T | | | | | | |
| 4.2 | Schedule meeting with Architect & Owner for punch list | R | PM | T | ✓ | | | | | |
| 4.3 | Complete punch list | R | PM | T | ✓ | ✓ | | | | |
| 4.4 | Complete as-built drawings | R | SUPT | T | ✓ | ✓ | | | | |
| 4.5 | Schedule "turn-over" meeting with Owner & Owner's Representative | R | PM | T | | | | | | |
| 4.6 | Give Owner list of subs and all warranty letters | R | PM | T | | ✓ | | | | |
| 4.7 | Give Owner all Maintenance Manuals (O&Ms) | R | PM | T | | ✓ | | | | |
| 4.8 | Convey any Attic Stock | O | SUPT | T | | ✓ | | | | |
| 4.9 | Forward letter of appreciation to Owner | O | PM | T | | | | | | |
| 4.10 | Order plant for delivery (best wishes) | O | PM | T | | | | | | |
| 4.11 | Prepare Public Relations Announcement | O | MOE | T | | | | | | |
| 4.12 | Complete final payment forms for each subcontractor | R | PM | FC | | ✓ | | | | financial |
| 4.13 | Date last contractual work on project was performed | R | PM | FC | ✓ | | | last-work-date | | |
| 4.14 | Flag 80 calendar days from last day HB worked on project (lien deadline) | R | PM | FC | | | ✓ | | | |
| 4.15 | Obtain Release of Liens from all Subs | R | PM | FC | | ✓ | | liens-released | LIENS_RELEASED | financial |

**Section gate:** All required items = Yes → `TURNOVER_COMPLETE` milestone → PE approval required to advance lifecycle to `OWNER_ACCEPTANCE`.

**Item 4.14 calculation rule:** `calculatedDate = item4.13.itemDate + 80 calendar days`. Read-only. A Work Queue item fires when `calculatedDate` is within 14 days and item 4.15 = No. `evidenceHint` = "Ensure all lien waivers received before this date."

---

### Section 5 — Post Turnover (5 items)

| # | Description | Req | Role | Stage | Date | Evid | Calc | Spine | Gate | Module |
|---|---|---|---|---|---|---|---|---|---|---|
| 5.1 | If final payment not received, send letter to Owner of intent to lien property | O | PM | PT | | ✓ | | | | |
| 5.2 | If final payment not received within 88 days, file lien | O | PM | PT | | ✓ | | | | |
| 5.3 | Six months after completion: give photographs taken during construction to Owner | O | PM | PT | | | | | | |
| 5.4 | Request from Owner a recommendation letter / testimonial | O | PM | PT | | | | | | |
| 5.5 | PM return all files, permit plans, and permit card to Estimator | R | PM | AR | | | | files-returned | FILES_RETURNED | |

---

### Section 6 — Complete Project Closeout Documents (5 items — integration-driven)

These five items are partially or fully system-driven. They serve as the formal acknowledgment gate that all Closeout sub-surfaces are complete.

| # | Description | Req | Role | Stage | Date | Evid | Calc | Spine | Gate | Integration Logic |
|---|---|---|---|---|---|---|---|---|---|---|
| 6.1 | Project Closeout Checklist completion percentage | R | System | AR | | | ✓ | | | Auto-populated from `completionPercentage`; read-only display |
| 6.2 | Project Recap Form | R | PM | AR | | ✓ | | | | Manual entry; no system integration |
| 6.3 | Subcontractor Evaluation Forms | R | System | AR | | | ✓ | | SCORECARDS_COMPLETE | Auto-Yes when all registered subs have `FinalCloseout` scorecard with `publicationStatus = PE_APPROVED` |
| 6.4 | Cost Variance Report | R | System | AR | | | ✓ | | | Auto-populated from Financial module final project variance; read-only; PM cannot manually mark Yes |
| 6.5 | Lessons Learned / Send to Knowledge System | R | System | AR | | | ✓ | lessons-approved | LESSONS_APPROVED | Auto-Yes when `LessonsLearningReport.publicationStatus = PE_APPROVED` |

**Critical rule for 6.3:** Item 6.3 requires all registered subcontractors to have a PE-approved `FinalCloseout` evaluation. The system does not auto-approve if a sub has only an interim evaluation or if a FinalCloseout is in `SUBMITTED` state but not yet `PE_APPROVED`.

**Critical rule for 6.5:** The original P3-E10 triggered item 6.5 on `status = Submitted`. This is superseded. The trigger is now `LessonsLearningReport.publicationStatus = PE_APPROVED`. PE approval is required — PM submission alone is not sufficient.

---

### Section 7 — PBC Jurisdiction-Specific (16 items)

Instantiated only when `CloseoutChecklist.jurisdiction = PBC`. All items have `isJurisdictionSpecific = true`, `jurisdictionKey = PBC`, `responsibleRole = PM` or `ENGINEER` as noted, and link to the `permits` module where applicable.

| # | Description | Req | Role | Stage | Evid |
|---|---|---|---|---|---|
| 7.1 | Soil Bearing Capacity Certification Letter | O | ENGINEER | A | ✓ |
| 7.2 | Foundation Soil Density Test Results | O | ENGINEER | A | ✓ |
| 7.3 | Form Board Survey — Signed & Sealed by Surveyor | O | ENGINEER | A | ✓ |
| 7.4 | Termite Pre-Treatment Certificate | O | SUPT | A | ✓ |
| 7.5 | Shoring Reports | O | ENGINEER | A | ✓ |
| 7.6 | Final Certification Letter — Structural (signed & sealed by Structural EOR) | R | ENGINEER | T | ✓ |
| 7.7 | Fire Main Underground Pressure Test Passed (PBCFD includes DDCV & Plumbing) | R | SUPT | I | ✓ |
| 7.8 | Final Survey — Signed & Sealed | R | ENGINEER | T | ✓ |
| 7.9 | Insulation Certificates | O | SUPT | T | ✓ |
| 7.10 | Intumescent Fire Coating Certificate (if applicable) | O | SUPT | T | ✓ |
| 7.11 | Plenum Door Certificate (if applicable) | O | SUPT | T | ✓ |
| 7.12 | Termite Post-Treatment Certificate | R | SUPT | T | ✓ |
| 7.13 | All Inspections Recorded as "Approved" / "Passed" in PBCBD system | R | PM | I | ✓ |
| 7.14 | Partial Final Inspections Passed (as required by Master Building Permit) | O | PM | I | ✓ |
| 7.15 | Certification of Completion Letter — Private Provider | O | ENGINEER | T | ✓ |
| 7.16 | Final Building Inspections by PBC (discretionary) | O | PM | I | |

---

## 4. Project Overlay Model

### 4.1 Rules

| Rule | Value |
|---|---|
| PMs may add overlay items | Yes |
| Maximum overlay items per section | 5 |
| Overlay items require PE pre-approval | No (PM self-service; overlay additions are logged) |
| Overlay items are audit-logged | Yes — via `@hbc/versioned-record` |
| Overlay items included in completion % | Yes |
| Overlay items deletable | No — once created, may only be marked NA (with justification) |
| Overlay item number format | `{sectionNumber}.OL-{sequence}` e.g., `3.OL-1` |
| Overlay item description max length | 500 characters |
| Overlay items may be `isRequired` | Yes — PM sets required flag on creation |

### 4.2 Overlay Item Creation Flow

1. PM opens a section and selects "Add local item."
2. PM enters description, selects whether it has a date field and whether it is required.
3. System assigns `itemNumber` in OL format, sets `isGoverned = false`, and creates an audit entry.
4. Overlay item appears in the section list after governed items, visually distinguished (e.g., "Project addition" badge).
5. Overlay item count for the section is incremented; "Add local item" is disabled when limit is reached.

### 4.3 NA on Governed Required Items

When a PM marks a governed `isRequired` item as `NA`:
- System surfaces a required `naJustification` text field before save.
- The NA + justification is audit-logged.
- The item is flagged in the PE review panel as "Required item waived — review."
- PE receives a Work Queue notification if a governed required item is marked NA without prior PE approval.

---

## 5. Checklist Instantiation Sequence

On project closeout phase activation:

1. System reads the current `ChecklistTemplate` (latest `isCurrent = true` version).
2. Creates `CloseoutChecklist` record; captures `templateVersion` (immutable).
3. Creates 7 `CloseoutChecklistSection` records from template sections.
4. Creates `CloseoutChecklistItem` records for all governed items.
5. If `jurisdiction = PBC`, instantiates all 16 Section 7 items; if `Other`, Section 7 scaffold only.
6. All items start with `result = Pending`.
7. Creates 13 `CloseoutMilestone` records in `Pending` status.
8. Emits `closeout.checklist-created` Activity Spine event.
9. Creates a `LessonsLearningReport` container for the project (if one does not already exist from earlier rolling capture).

---

## 6. Completion Logic

### 6.1 Item Completion

An item is "complete" when `result ∈ {Yes, NA}`. `Pending` and `No` are non-complete states.

### 6.2 Section Completion Percentage

```
sectionCompletionPct =
  count(items WHERE result = Yes)
  / count(items WHERE result ≠ NA)
  × 100
```

If all items = NA: section is complete (fully waived). Rounded to integer.

### 6.3 Overall Completion Percentage

Same formula applied across all items (governed + overlay) in the checklist.

### 6.4 Completion Percentage vs. Lifecycle State

Reaching 100% does not automatically advance lifecycle state. Formal stage transitions require explicit PM or PE action via the lifecycle state machine (T04). Completion percentage is a health indicator, not a state machine input.

---

*[← T02](P3-E10-T02-Record-Families-Identity-Field-Architecture-Publication-States.md) | [Master Index](P3-E10-Project-Closeout-Module-Field-Specification.md) | [T04 →](P3-E10-T04-Lifecycle-State-Machine-Milestones-Evidence-Gates-Approval-Rules.md)*
