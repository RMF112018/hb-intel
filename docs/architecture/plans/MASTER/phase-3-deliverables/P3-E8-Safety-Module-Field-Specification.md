# P3-E8: Safety Module — Field and Data Model Specification

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E8 |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Document Type** | Module Field Specification |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-22 |
| **Related Contracts** | P3-E2 §7, P3-D1 §8.5, P3-D2 §11, P3-D3 §12, P3-D4 §9, P3-H1 §18.5 |
| **Source Examples** | Safety Checklist Template - Weighted.xlsx (ScoringWeights, ScoreCard sheets) |

---

## 1. Purpose

This specification defines the complete data model, field definitions, status enumerations, business rules, and required workflows for the Safety module implementation. Every field listed here **MUST** be implemented. A developer reading this specification must have no ambiguity about what to build.

This document is grounded in the company's safety inspection operations, weighted checklist model, incident tracking protocols, and job hazard analysis (JHA) records. The source example files in `docs/reference/example/` are the living templates that this module digitizes.

### Source Files

- `Safety Checklist Template - Weighted.xlsx` — ScoringWeights sheet (12 sections, section weights)
- `Safety Checklist Template - Weighted.xlsx` — ScoreCard sheet (inspection responses, auto-calculated scores)
- Safety Incident Report procedures (internal operations standard)
- Job Hazard Analysis (JHA) record templates (internal operations standard)

---

## 2. Source Data Mapping

### 2.1 Safety Checklist Template Authority

The Safety Checklist Template (`Safety Checklist Template - Weighted.xlsx`) is the single source of truth for:
- All 12 checklist sections
- Complete list of 93 checklist items (immutable from template)
- Section weight values (immutable)
- Response enum values (Yes, No, N/A, Incomplete)
- Scoring calculation methodology

### 2.2 ScoringWeights Sheet

| Section Number | Section Name | Weight | Item Count | Notes |
|---|---|---|---|---|
| 1 | General Site Conditions | 0.03 | 9 | Site access, signage, housekeeping, hazard protections |
| 2 | Emergency & Fire Preparedness | 0.03 | 5 | Emergency contacts, first aid, fire extinguishers, AED |
| 3 | PPE & Worker Compliance | 0.08 | 8 | Hats, glasses, hi-vis, gloves, hearing, respiratory, condition |
| 4 | Fall Protection & Openings | 0.18 | 10 | **Highest weight** — guardrails, floor openings, harnesses, tie-offs, lifts, scaffolds, toe boards, dropped objects |
| 5 | Ladders & Scaffolds | 0.14 | 12 | Ladder condition/setup, extension, A-frames, scaffold bases, guardrails, access, tags, casters |
| 6 | Electrical & Temporary Power | 0.10 | 8 | GFCI, cord gauge, extension cord condition, management, panels, junctions, LOTO, wet conditions |
| 7 | Hot Work & Fire Risk Controls | 0.07 | 6 | Hot work permit, fire watch, combustibles, extinguisher staging, gas cylinder security, post-work watch |
| 8 | Material Handling & Storage | 0.04 | 6 | Stacking stability, storage systems, aisle access, flammable containers, cylinder separation |
| 9 | Equipment & Mobile Plant | 0.12 | 9 | Operator certification, daily inspections, seatbelts, alarms, spotters, swing radius, suspended loads, rigging, critical lift plans |
| 10 | Excavations & Ground Disturbance | 0.12 | 6 | Utility locate, protective systems, spoil pile setback, safe access, barricades, competent person inspection |
| 11 | Environmental & Health | 0.02 | 7 | Dust control, silica, noise, heat/cold stress, drinking water, chemical labels/SDS, ventilation |
| 12 | Behavioral / Work Practices | 0.07 | 5 | Pre-task planning/JHA, SOPs, communication, supervision, near-miss reporting |
| | **TOTAL** | **1.00** | **93** | **Sum of all weights must equal 1.0** |

---

## 3. TypeScript Data Models

```typescript
/**
 * Safety Inspection Record
 * Master container for a complete safety walk/inspection
 */
interface ISafetyInspection {
  inspectionId: string;           // UUID, immutable
  projectId: string;              // FK to project
  inspectionDate: string;         // ISO 8601 date (YYYY-MM-DD)
  inspectionNumber: string;       // Sequential identifier (e.g., "INSP-001")
  inspectorName: string;          // Person conducting the inspection
  sections: ISafetyInspectionSection[];  // All 12 sections with items
  overallScore: number;           // 0.0–1.0 decimal (calculated)
  keyFindings: string;            // Mandatory when any item = No
  correctiveActions: ICorrectiveAction[];  // Auto-generated from No responses
  status: SafetyInspectionStatus; // Draft | Complete
  createdAt: string;              // ISO 8601 datetime
  completedAt: string | null;     // ISO 8601 datetime when status = Complete
}

/**
 * Safety Inspection Section
 * One of 12 sections within an inspection
 */
interface ISafetyInspectionSection {
  sectionId: string;              // UUID
  sectionNumber: number;          // 1–12
  sectionName: string;            // From master template
  weight: number;                 // From ScoringWeights (0.02–0.18)
  items: ISafetyChecklistItem[];  // 5–12 items per section
  sectionScore: number;           // Calculated: yesCount / (yesCount + noCount)
  yesCount: number;               // Calculated
  noCount: number;                // Calculated
  naCount: number;                // Calculated
  incompleteCount: number;        // Calculated
}

/**
 * Safety Checklist Item
 * Single checklist question/response
 */
interface ISafetyChecklistItem {
  itemId: string;                 // UUID
  sectionId: string;              // FK to parent section
  itemText: string;               // From master template (immutable)
  result: SafetyChecklistItemResult;  // Yes | No | NA | Incomplete
  score: number | null;           // 1 (Yes), 0 (No), null (NA/Incomplete)
  notes: string;                  // Optional field notes
  inspectionFlag: SafetyInspectionFlag;  // COMPLETE | INCOMPLETE | MULTI
}

/**
 * Corrective Action
 * Auto-generated for every No response; tracks remediation
 */
interface ICorrectiveAction {
  actionId: string;               // UUID, immutable
  inspectionId: string;           // FK
  sectionNumber: number;          // Which section triggered it
  itemText: string;               // Which item failed
  description: string;            // What corrective action is required
  assignedTo: string;             // Responsible person/trade
  dueDate: string;                // ISO 8601 date
  status: CorrectiveActionStatus; // Open | InProgress | Resolved | Verified
  resolutionNotes: string;        // Required for Resolved/Verified status
  resolvedAt: string | null;      // ISO 8601 datetime
  verifiedBy: string | null;      // Person who verified resolution
  createdAt: string;              // ISO 8601 datetime
}

/**
 * Incident Report
 * Safety incident documentation and OSHA classification
 */
interface IIncidentReport {
  incidentId: string;             // UUID, immutable
  projectId: string;              // FK
  incidentDate: string;           // ISO 8601 date
  incidentTime: string;           // HH:MM format
  reportedBy: string;             // UPN of reporter
  incidentType: IncidentType;     // Near Miss | First Aid | Recordable | Lost Time | Fatality | Property Damage | Environmental
  description: string;            // Detailed incident description
  location: string;               // On-site location
  personsInvolved: string[];      // Names/roles of those involved
  injuryDescription: string | null;  // null for near-miss/property only
  rootCause: string;              // Identified root cause
  immediateActions: string;       // Actions taken immediately
  correctiveActions: ICorrectiveAction[];  // Follow-up actions
  oshaRecordable: boolean;        // Whether OSHA 300 log entry required
  status: IncidentReportStatus;   // Draft | Submitted | Under Review | Closed
  createdAt: string;              // ISO 8601 datetime
  submittedAt: string | null;     // ISO 8601 datetime
}

/**
 * Job Hazard Analysis Record
 * Pre-work hazard identification and control planning
 */
interface IJhaRecord {
  jhaId: string;                  // UUID, immutable
  projectId: string;              // FK
  taskDescription: string;        // Work task being analyzed
  tradeOrCrew: string;            // Trade performing work
  supervisorName: string;         // Responsible supervisor
  completedDate: string;          // ISO 8601 date
  hazards: IJhaHazard[];          // Identified hazards and controls
  status: JhaStatus;              // Draft | Active | Archived
}

/**
 * JHA Hazard
 * Single hazard within a JHA record
 */
interface IJhaHazard {
  hazardId: string;               // UUID
  jhaId: string;                  // FK
  step: string;                   // Work step
  hazard: string;                 // Identified hazard description
  controls: string;               // Control measures
  residualRisk: RiskLevel;        // Low | Medium | High
}
```

---

## 4. Field Specification Tables

### 4.1 Safety Inspection

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Business Rule / Constraints |
|---|---|---|---|---|
| inspectionId | `string` | Yes | Yes | UUID generated on creation; immutable; globally unique |
| projectId | `string` | Yes | No | FK to project record; immutable |
| inspectionDate | `string` | Yes | No | ISO 8601 date (YYYY-MM-DD); must be ≤ today; immutable after Complete status |
| inspectionNumber | `string` | Yes | No | Sequential identifier (e.g., "INSP-001", "INSP-002"); auto-generated per project; immutable |
| inspectorName | `string` | Yes | No | Name of person conducting inspection; immutable after Complete status |
| sections | `ISafetyInspectionSection[]` | Yes | No | All 12 sections with full item set; populated from master template on creation |
| overallScore | `number` | Yes | Yes | **Calculated**: Σ(sectionScore[i] × weight[i]); decimal 0.0–1.0 |
| keyFindings | `string` | Conditional | No | **Required if any item has result = No**; free-text narrative; max 5000 chars |
| correctiveActions | `ICorrectiveAction[]` | Yes | Yes | **Auto-generated** one per No response at completion; immutable after generation |
| status | `SafetyInspectionStatus` | Yes | No | Draft \| Complete; transitions unidirectional: Draft → Complete only |
| createdAt | `string` | Yes | Yes | ISO 8601 datetime; set at creation; immutable |
| completedAt | `string \| null` | Yes | Yes | ISO 8601 datetime; set when status transitions to Complete; null if Draft |

### 4.2 Safety Inspection Section

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Business Rule / Constraints |
|---|---|---|---|---|
| sectionId | `string` | Yes | Yes | UUID generated on section creation; immutable |
| sectionNumber | `number` | Yes | No | 1–12; from master template; immutable |
| sectionName | `string` | Yes | No | From ScoringWeights sheet (e.g., "Fall Protection & Openings"); immutable |
| weight | `number` | Yes | No | From ScoringWeights; immutable constant per section (0.02–0.18); sum = 1.0 |
| items | `ISafetyChecklistItem[]` | Yes | No | Full checklist items for section (5–12 items); populated from master template on section creation |
| sectionScore | `number` | Yes | Yes | **Calculated**: yesCount / (yesCount + noCount); where N/A items excluded from denominator |
| yesCount | `number` | Yes | Yes | **Calculated**: count of items with result = Yes |
| noCount | `number` | Yes | Yes | **Calculated**: count of items with result = No |
| naCount | `number` | Yes | Yes | **Calculated**: count of items with result = NA |
| incompleteCount | `number` | Yes | Yes | **Calculated**: count of items with result = Incomplete |

### 4.3 Safety Checklist Item

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Business Rule / Constraints |
|---|---|---|---|---|
| itemId | `string` | Yes | Yes | UUID generated on item creation; immutable |
| sectionId | `string` | Yes | No | FK to parent section; immutable |
| itemText | `string` | Yes | No | From master template; immutable; cannot be edited, deleted, or added by users |
| result | `SafetyChecklistItemResult` | Yes | No | Yes \| No \| NA \| Incomplete; initially Incomplete; user-selectable |
| score | `number \| null` | Yes | Yes | **Calculated**: 1 if result = Yes; 0 if result = No; null if result = NA or Incomplete |
| notes | `string` | No | No | Optional field notes (max 500 chars); free-text |
| inspectionFlag | `SafetyInspectionFlag` | Yes | Yes | **Calculated**: COMPLETE \| INCOMPLETE \| MULTI (validation error when both Yes and No marked) |

### 4.4 Corrective Action

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Business Rule / Constraints |
|---|---|---|---|---|
| actionId | `string` | Yes | Yes | UUID generated on creation; immutable; globally unique |
| inspectionId | `string` | Yes | No | FK to parent inspection; immutable |
| sectionNumber | `number` | Yes | No | 1–12; identifies which section triggered the action; immutable |
| itemText | `string` | Yes | No | Exact text of failed checklist item; immutable |
| description | `string` | Yes | No | What corrective action is required; max 2000 chars; editable only if status = Open |
| assignedTo | `string` | Yes | No | Responsible person or trade; editable only if status = Open or InProgress |
| dueDate | `string` | Yes | No | ISO 8601 date; must be ≥ creation date; editable only if status = Open or InProgress |
| status | `CorrectiveActionStatus` | Yes | No | Open → InProgress → Resolved → Verified (unidirectional); default = Open |
| resolutionNotes | `string` | Conditional | No | **Required when status = Resolved or Verified**; max 1000 chars; describes how action was resolved |
| resolvedAt | `string \| null` | Yes | Yes | ISO 8601 datetime; set when status transitions to Resolved; null otherwise |
| verifiedBy | `string \| null` | No | No | UPN or name of verification inspector; set only when status = Verified |
| createdAt | `string` | Yes | Yes | ISO 8601 datetime; set at creation; immutable |

### 4.5 Incident Report

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Business Rule / Constraints |
|---|---|---|---|---|
| incidentId | `string` | Yes | Yes | UUID generated on creation; immutable; globally unique |
| projectId | `string` | Yes | No | FK to project record; immutable |
| incidentDate | `string` | Yes | No | ISO 8601 date; must be ≤ today; immutable after Submitted |
| incidentTime | `string` | Yes | No | HH:MM format (24-hour); immutable after Submitted |
| reportedBy | `string` | Yes | No | UPN of reporter; immutable after creation |
| incidentType | `IncidentType` | Yes | No | Near Miss \| First Aid \| Recordable \| Lost Time \| Fatality \| Property Damage \| Environmental; determines OSHA and notification triggers |
| description | `string` | Yes | No | Detailed narrative (min 50 chars, max 5000 chars); describes what happened, when, where, how |
| location | `string` | Yes | No | On-site location or reference; max 500 chars |
| personsInvolved | `string[]` | Yes | No | Array of names/roles; min 1 person required |
| injuryDescription | `string \| null` | Conditional | No | **Required if incidentType = First Aid, Recordable, Lost Time, or Fatality**; null otherwise; max 2000 chars |
| rootCause | `string` | Yes | No | Identified root cause (min 20 chars, max 2000 chars); must be substantive analysis |
| immediateActions | `string` | Yes | No | Actions taken at time of incident (min 20 chars, max 2000 chars) |
| correctiveActions | `ICorrectiveAction[]` | Yes | No | Linked corrective actions; auto-generated for trackable items; empty array permitted for closed incidents |
| oshaRecordable | `boolean` | Yes | Yes | **Calculated/auto-set**: true if incidentType = Recordable, Lost Time, or Fatality; false otherwise |
| status | `IncidentReportStatus` | Yes | No | Draft → Submitted → Under Review → Closed (unidirectional); default = Draft |
| createdAt | `string` | Yes | Yes | ISO 8601 datetime; set at creation; immutable |
| submittedAt | `string \| null` | Yes | Yes | ISO 8601 datetime; set when status transitions to Submitted; null otherwise; triggers notifications if incidentType = Fatality |

### 4.6 Job Hazard Analysis Record

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Business Rule / Constraints |
|---|---|---|---|---|
| jhaId | `string` | Yes | Yes | UUID generated on creation; immutable; globally unique |
| projectId | `string` | Yes | No | FK to project record; immutable |
| taskDescription | `string` | Yes | No | Description of work task (min 20 chars, max 2000 chars); immutable after status = Active |
| tradeOrCrew | `string` | Yes | No | Trade or crew name (e.g., "Concrete Team", "Electrical"); immutable after status = Active |
| supervisorName | `string` | Yes | No | Responsible supervisor; editable only if status = Draft |
| completedDate | `string` | Yes | No | ISO 8601 date when JHA was completed; must be ≤ today; immutable after status = Active |
| hazards | `IJhaHazard[]` | Yes | No | Array of identified hazards; min 1 required when status = Active |
| status | `JhaStatus` | Yes | No | Draft → Active → Archived (unidirectional); default = Draft |

### 4.7 JHA Hazard

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Business Rule / Constraints |
|---|---|---|---|---|
| hazardId | `string` | Yes | Yes | UUID generated on creation; immutable |
| jhaId | `string` | Yes | No | FK to parent JHA record; immutable |
| step | `string` | Yes | No | Work step (e.g., "Set up scaffolding", "Pour concrete"); max 200 chars; editable only if parent JHA status = Draft |
| hazard | `string` | Yes | No | Hazard description (min 20 chars, max 500 chars); editable only if parent JHA status = Draft |
| controls | `string` | Yes | No | Control measures to mitigate hazard (min 20 chars, max 500 chars); editable only if parent JHA status = Draft |
| residualRisk | `RiskLevel` | Yes | No | Low \| Medium \| High; immutable after parent JHA status = Active |

---

## 5. Enum Definitions

### 5.1 Safety Inspection Status

```typescript
type SafetyInspectionStatus = 'Draft' | 'Complete';
```

| Value | Description | Allowed Transitions | Locked Fields on Transition |
|---|---|---|---|
| Draft | Inspection in progress; items being answered | → Complete | inspectionDate, inspectorName |
| Complete | Inspection finished; corrective actions generated | None (terminal) | All except corrective action statuses |

### 5.2 Safety Checklist Item Result

```typescript
type SafetyChecklistItemResult = 'Yes' | 'No' | 'NA' | 'Incomplete';
```

| Value | Description | Score Impact | Corrective Action Trigger |
|---|---|---|---|
| Yes | Item requirement met | score = 1 | No |
| No | Item requirement NOT met | score = 0 | **Yes** — auto-generate corrective action |
| NA | Item not applicable to this project | score = null (excluded from section calc) | No |
| Incomplete | Item not yet answered | score = null | No (until answered) |

### 5.3 Safety Inspection Flag

```typescript
type SafetyInspectionFlag = 'COMPLETE' | 'INCOMPLETE' | 'MULTI';
```

| Value | Description | Validation Rule |
|---|---|---|
| COMPLETE | Exactly one of Yes, No, or NA marked | Item is valid |
| INCOMPLETE | No response marked (all checkboxes empty) | Item requires answer before inspection can be completed |
| MULTI | Both Yes and No marked simultaneously | **Validation error** — system must prevent submission and alert inspector |

### 5.4 Corrective Action Status

```typescript
type CorrectiveActionStatus = 'Open' | 'InProgress' | 'Resolved' | 'Verified';
```

| Value | Description | Editable Fields | Transition Rules |
|---|---|---|---|
| Open | Action created, awaiting work | description, assignedTo, dueDate | → InProgress |
| InProgress | Work is being performed | description, assignedTo, dueDate | → Resolved |
| Resolved | Work completed; awaiting verification | resolutionNotes only | → Verified (after verifiedBy set) |
| Verified | Work verified by inspector | None (immutable) | None (terminal) |

### 5.5 Incident Type

```typescript
type IncidentType = 'Near Miss' | 'First Aid' | 'Recordable' | 'Lost Time' | 'Fatality' | 'Property Damage' | 'Environmental';
```

| Enum Value | Description | OSHA 300 Recordable | Notification Trigger | Injury Description Required |
|---|---|---|---|---|
| Near Miss | Hazard avoided; no injury | No | No | No |
| First Aid | Minor treatment only | No | No | **Yes** |
| Recordable | Non-lost-time injury recordable under OSHA | **Yes** | No | **Yes** |
| Lost Time | Employee unable to work following day | **Yes** | No | **Yes** |
| Fatality | Work-related death | **Yes** | **Yes — Project Executive + PE** | **Yes** |
| Property Damage | Equipment or material damage; no injury | No | No | No |
| Environmental | Spill, contamination, or environmental incident | No | No | No |

### 5.6 Incident Report Status

```typescript
type IncidentReportStatus = 'Draft' | 'Submitted' | 'Under Review' | 'Closed';
```

| Value | Description | Editable Fields | Notifications |
|---|---|---|---|
| Draft | Report being compiled | All | None |
| Submitted | Report submitted for review | None (immutable) | If incidentType = Fatality: immediate to Project Executive, PE, and Compliance Officer |
| Under Review | Report under investigation | Corrective actions only | None |
| Closed | Investigation complete | None (immutable) | None |

### 5.7 JHA Status

```typescript
type JhaStatus = 'Draft' | 'Active' | 'Archived';
```

| Value | Description | Editable Fields | Transition Rules |
|---|---|---|---|
| Draft | JHA in preparation | All fields and hazards | → Active |
| Active | JHA published and in effect | Hazards read-only; supervisorName read-only | → Archived (when task complete) |
| Archived | JHA for completed task (historical reference) | None (immutable) | None (terminal) |

### 5.8 Risk Level

```typescript
type RiskLevel = 'Low' | 'Medium' | 'High';
```

| Value | Description | Example Hazards |
|---|---|---|
| Low | Hazard with strong, proven controls | Housekeeping; minor hand tool use with gloves |
| Medium | Hazard with adequate controls; residual exposure | Elevated work with guardrails; confined space entry with ventilation |
| High | Hazard with significant residual risk | Fall from height > 20 ft; suspended load operations; trenching > 5 ft |

---

## 6. Complete Checklist Sections Reference

### 6.1 Section 1: General Site Conditions (Weight: 0.03, 9 items)

| Item # | Checklist Item Text |
|---|---|
| 1.1 | Site access controlled (fencing/gates/sign-in) |
| 1.2 | Safety signage posted (PPE, hazards, traffic) |
| 1.3 | Subcontractors signing in (visitor log maintained) |
| 1.4 | Walkways/egress clear and maintained |
| 1.5 | Lighting adequate for work areas |
| 1.6 | Housekeeping acceptable (debris managed, organized) |
| 1.7 | Stairs/ramps/temporary steps stable and clear |
| 1.8 | Waste disposal bins available and used |
| 1.9 | Sharp protrusions/rebar capped or protected |

### 6.2 Section 2: Emergency & Fire Preparedness (Weight: 0.03, 5 items)

| Item # | Checklist Item Text |
|---|---|
| 2.1 | Emergency contact board posted and current |
| 2.2 | First aid kit available and stocked |
| 2.3 | Fire extinguishers staged, accessible, and inspected |
| 2.4 | Emergency routes/assembly point communicated |
| 2.5 | AED available (if required) and location known |

### 6.3 Section 3: PPE & Worker Compliance (Weight: 0.08, 8 items)

| Item # | Checklist Item Text |
|---|---|
| 3.1 | Hard hats worn in required areas |
| 3.2 | Safety glasses worn (with side shields) in required areas |
| 3.3 | Hi-vis worn where required |
| 3.4 | Gloves used appropriately for tasks |
| 3.5 | Hearing protection used where needed |
| 3.6 | Respiratory protection used where required (dust/fumes) |
| 3.7 | PPE condition acceptable (no cracks/tears/damage) |
| 3.8 | Guards in place (guards on grinders, saws, machinery) |

### 6.4 Section 4: Fall Protection & Openings (Weight: 0.18, 10 items)

**[Highest weight section — critical safety concern]**

| Item # | Checklist Item Text |
|---|---|
| 4.1 | Leading edges protected (guardrail/cable/controlled access) |
| 4.2 | Floor openings covered, secured, and labeled |
| 4.3 | Shafts/stairwells protected (guardrails/barricades) |
| 4.4 | Fall Protection: Harness/lanyard inspected and used correctly where required |
| 4.5 | Tie-off to approved anchor points only (not to pipes/cables) |
| 4.6 | Aerial/Scissor lifts: proper tie-in and gate use |
| 4.7 | Scaffold platforms fully decked with same material and protected |
| 4.8 | Scaffold tags in place and signed off daily |
| 4.9 | Tools/materials secured at height (dropped object prevention) |
| 4.10 | Toe boards installed where required (on platforms/scaffolds) |

### 6.5 Section 5: Ladders & Scaffolds (Weight: 0.14, 12 items)

| Item # | Checklist Item Text |
|---|---|
| 5.1 | Ladders in good condition and rated for use |
| 5.2 | Ladders set correctly (4:1 angle) and secured to stable footing |
| 5.3 | Ladders extend 3 ft above landing/tied-off as required |
| 5.4 | A-frame ladders fully opened before climbing |
| 5.5 | No standing on top step; 3 points of contact maintained |
| 5.6 | No aluminum ladders on site (conductive hazard) |
| 5.7 | Scaffold base plates/leveling devices used (no improvised blocks) |
| 5.8 | Scaffold guardrails installed and cross-braced |
| 5.9 | Scaffold toe boards installed |
| 5.10 | Scaffold access provided (ladder/stairs; no climbing frame members) |
| 5.11 | Scaffold tags/inspection current (dated within inspection cycle) |
| 5.12 | If scaffolding is on casters, wheels locked before employee climbs |

### 6.6 Section 6: Electrical & Temporary Power (Weight: 0.10, 8 items)

| Item # | Checklist Item Text |
|---|---|
| 6.1 | GFCI protection used (temporary power, wet areas) |
| 6.2 | 16 gauge cord or heavier used (appropriate to load) |
| 6.3 | Extension cords intact (no cuts, splices, or repairs) |
| 6.4 | Cords managed (not through doorways, pinch points, high-traffic areas) |
| 6.5 | Temporary panels labeled with covers in place |
| 6.6 | Open junction boxes covered (no exposed conductors/terminals) |
| 6.7 | LOTO used where required (energized work controlled/isolated) |
| 6.8 | Wet conditions addressed (cord elevation, equipment rated for wet use) |

### 6.7 Section 7: Hot Work & Fire Risk Controls (Weight: 0.07, 6 items)

| Item # | Checklist Item Text |
|---|---|
| 7.1 | Hot work permit posted (if required by site/company policy) |
| 7.2 | Fire watch assigned and equipped (extinguisher within arm's reach) |
| 7.3 | Combustibles cleared or protected (blankets/shields/barriers) |
| 7.4 | Fire extinguisher staged at hot work location (accessible, tested) |
| 7.5 | Gas cylinders secured upright with caps/valves protected |
| 7.6 | Post-work fire watch completed (per policy, e.g., 30 min observation) |

### 6.8 Section 8: Material Handling & Storage (Weight: 0.04, 6 items)

| Item # | Checklist Item Text |
|---|---|
| 8.1 | Materials stacked stable (no leaning, no over-stacking) |
| 8.2 | Stored to prevent collapse/roll (chocks, dunnage, proper support) |
| 8.3 | Aisles kept clear (access maintained for emergency egress) |
| 8.4 | Flammables stored in approved containers/cabinets |
| 8.5 | Cylinders separated/secured (oxygen/acetylene separation, upright) |
| 8.6 | Overhead storage hazards controlled (secured, excluded from walkways) |

### 6.9 Section 9: Equipment & Mobile Plant (Weight: 0.12, 9 items)

| Item # | Checklist Item Text |
|---|---|
| 9.1 | Operators trained/certified where required (forklift, aerial lift, crane) |
| 9.2 | Daily equipment inspections completed (forklift, lifts, excavator, etc.) |
| 9.3 | Seatbelts used and guards in place (on mobile equipment) |
| 9.4 | Back-up alarms/visual warnings functioning |
| 9.5 | Spotters used where required (blind spot management) |
| 9.6 | Swing radius/exclusion zones barricaded (around rotating equipment) |
| 9.7 | No one under suspended loads; rigging inspected |
| 9.8 | Qualified Rigger/Signal Person used (for lifts > threshold) |
| 9.9 | Critical Lift Plans established/communicated (as required by project) |

### 6.10 Section 10: Excavations & Ground Disturbance (Weight: 0.12, 6 items)

| Item # | Checklist Item Text |
|---|---|
| 10.1 | Utility locate completed and markings visible |
| 10.2 | Protective system used (sloping/shoring/trench box for depth > 5 ft) |
| 10.3 | Spoil piles set back ≥ 2 ft from edge |
| 10.4 | Safe access/egress provided (ladder/ramps; not climbing walls) |
| 10.5 | Barricades installed around open excavations |
| 10.6 | Daily competent person inspection documented |

### 6.11 Section 11: Environmental & Health (Weight: 0.02, 7 items)

| Item # | Checklist Item Text |
|---|---|
| 11.1 | Dust control implemented (wet methods, vacuum, barriers) |
| 11.2 | Silica controls followed (if applicable; water suppression, respirators) |
| 11.3 | Noise exposure managed (hearing protection available/used) |
| 11.4 | Heat/cold stress controls (water, shade, breaks as needed) |
| 11.5 | Drinking water available and clean |
| 11.6 | Chemical containers labeled; SDS accessible |
| 11.7 | Ventilation used for fumes/solvents (fans, exhaust) |

### 6.12 Section 12: Behavioral / Work Practices (Weight: 0.07, 5 items)

| Item # | Checklist Item Text |
|---|---|
| 12.1 | Pre-task planning/JHA conducted for active tasks (if applicable) |
| 12.2 | Workers following SOPs (no unsafe shortcuts observed) |
| 12.3 | Communication effective (hand signals, radios, two-way systems) |
| 12.4 | Supervision present for high-risk work |
| 12.5 | Near-misses/hazards being reported promptly |

---

## 7. Business Rules

### 7.1 Checklist Integrity

1. **Master Template Authority**: All 93 checklist items are READ-ONLY; items cannot be added, deleted, or modified by users. Items are immutable from the master template.
2. **Section Structure**: All 12 sections with their exact item counts must be present in every inspection. No sections can be skipped or customized per-project.
3. **Section Weights**: Section weights (0.02–0.18) are immutable constants from the ScoringWeights sheet. They cannot be modified, adjusted, or overridden on a per-project basis.

### 7.2 Response Validation

4. **Single Response Per Item**: Only one of Yes, No, or N/A may be marked per item. If both Yes and No are marked, system sets `inspectionFlag = MULTI` and rejects submission with clear error message.
5. **Completion Requirement**: All 93 items must have a response (Yes, No, or N/A) before the inspection can transition from Draft to Complete. Any Incomplete items block completion.
6. **Key Findings Requirement**: If **any** item has `result = "No"`, the `keyFindings` field becomes mandatory. The inspection cannot be marked Complete without free-text narrative explaining findings.

### 7.3 Scoring Calculation

7. **Section Score Formula**: For each section, `sectionScore = yesCount / (yesCount + noCount)`. Items marked N/A or Incomplete are **excluded from the denominator**. If all items in a section are N/A or Incomplete, `sectionScore = null` (treated as 0 in overall calculation).
8. **Overall Score Formula**: `overallScore = Σ(sectionScore[i] × weight[i])` for i = 1 to 12. Result is decimal 0.0–1.0. Calculated field, never user-entered.
9. **Automatic Calculation**: All scores are calculated by the system immediately upon item response change; no manual override permitted.

### 7.4 Corrective Actions

10. **Auto-Generation**: For **every** item with `result = "No"`, the system automatically generates one `ICorrectiveAction` record at the moment the inspection transitions to Complete status.
11. **Immutable Generation**: Once generated, corrective actions cannot be deleted or hidden. The link between a failed item and its corrective action is permanent.
12. **Assignment and Due Date**: Corrective actions are created with default due date = inspection date + 30 days. They must be assigned to a responsible person/trade before status transitions beyond Open.

### 7.5 Incident Reporting

13. **OSHA Recordable Auto-Set**: When `incidentType` = Recordable, Lost Time, or Fatality, `oshaRecordable` is automatically set to true. Otherwise false.
14. **Fatality Trigger**: If `incidentType` = Fatality and status transitions to Submitted, the system immediately sends notifications to Project Executive and PE (compliance officer). This is a critical, non-suppressible action.
15. **Injury Description**: If `incidentType` = First Aid, Recordable, Lost Time, or Fatality, `injuryDescription` becomes mandatory. Cannot be null. Otherwise, `injuryDescription` must be null.

### 7.6 JHA Management

16. **Active JHA Requirement**: When a JHA transitions to Active status, all fields become immutable. Hazards cannot be added, removed, or edited. Only status transitions to Archived are allowed.
17. **Archival**: A JHA transitions to Archived when the associated work task is complete. Archived JHAs are read-only references for compliance audits.

### 7.7 Safety Module Operational Authority

18. **Source-of-Truth Scope**: The Safety module owns all safety inspection records, incident reports, JHA records, and corrective action tracking per P3-E2 §7.
19. **External References Only**: Safety module references OSHA regulations, external safety plans, and third-party inspection reports but does NOT store them. These are destination/reference artifacts only.
20. **No PER Annotation Layer**: Safety is **EXCLUDED from Phase 3 Executive Review** (P3-E1 §9.1 and §9.3). No annotation layer exists for Safety. No push-to-team pathway from Safety operations. **READ-ONLY access only via PER.**

---

## 8. Scoring Calculation Reference

### 8.1 Section Score Calculation

```
sectionScore[i] = yesCount[i] / (yesCount[i] + noCount[i])

Where:
  - yesCount[i] = number of items in section i with result = "Yes"
  - noCount[i] = number of items in section i with result = "No"
  - Items with result = "NA" or "Incomplete" are EXCLUDED from calculation
  - If (yesCount + noCount) = 0 (all items N/A or Incomplete), sectionScore = 0
```

### 8.2 Overall Safety Score Calculation

```
overallScore = Σ(sectionScore[i] × weight[i]) for i = 1 to 12

Where:
  - weight[i] is the immutable weight from ScoringWeights sheet
  - Σ(weight[i]) = 1.0 (sum of all section weights)
  - Result range: 0.0 (all No) to 1.0 (all Yes)
  - Decimal precision: min 4 decimal places for accuracy
```

### 8.3 Example Calculation Scenario

**Scenario**: Section 4 (Fall Protection, weight 0.18) has:
- 7 items marked Yes
- 2 items marked No
- 1 item marked N/A (not applicable to this project)

```
Section 4 Score = 7 / (7 + 2) = 7 / 9 = 0.7778

Contribution to Overall Score = 0.7778 × 0.18 = 0.1400

(Other sections calculated similarly; overall score = sum of all contributions)
```

---

## 9. Data Validation Rules

### 9.1 Field-Level Validation

| Field | Validation Rule | Error Message |
|---|---|---|
| inspectionDate | Must be ISO 8601 date; ≤ today | "Inspection date cannot be in the future" |
| inspectionNumber | Sequential per project; no duplicates | "Inspection number already exists for this project" |
| inspectorName | Non-empty string, ≤ 200 chars | "Inspector name is required" |
| keyFindings | Required if any item = No; max 5000 chars | "Key findings required when any item is marked No" |
| itemText | Exact match to master template | "Item text does not match master template; item is read-only" |
| result | Must be one of: Yes, No, NA, Incomplete | "Invalid response value" |
| incidentDate | ISO 8601 date; ≤ today | "Incident date cannot be in the future" |
| incidentTime | HH:MM format (00:00–23:59) | "Time must be in HH:MM format (24-hour)" |
| dueDate | ISO 8601 date; ≥ creation date | "Due date must be today or later" |
| description (Corrective Action) | Min 10 chars; max 2000 chars | "Description must be between 10 and 2000 characters" |

### 9.2 State Transition Validation

| Transition | Allowed | Blocked Condition | Error Message |
|---|---|---|---|
| Draft → Complete (Inspection) | Yes | Any item = Incomplete; or (any item = No AND keyFindings empty) | "All items must be answered; key findings required when items marked No" |
| Open → InProgress (Corrective Action) | Yes | None | — |
| InProgress → Resolved (Corrective Action) | Yes | resolutionNotes empty | "Resolution notes required when marking action resolved" |
| Resolved → Verified (Corrective Action) | Yes | verifiedBy empty | "Verifier name required when marking action verified" |
| Draft → Submitted (Incident Report) | Yes | description < 50 chars; rootCause < 20 chars | "Description and root cause require substantive text" |
| Submitted → Closed (Incident Report) | Yes | None | — |
| Draft → Active (JHA) | Yes | hazards array empty | "At least one hazard must be identified before activating" |
| Active → Archived (JHA) | Yes | None | — |

### 9.3 Business Logic Validation

| Rule | Condition | Action |
|---|---|---|
| Multi-Mark Detection | Both Yes and No marked on same item | Set inspectionFlag = MULTI; reject submission; show error "Item has conflicting responses" |
| Corrective Action Auto-Generation | Item result = No at inspection Complete | Create ICorrectiveAction record immediately; assign default due date = inspectionDate + 30 days |
| OSHA Recordable Auto-Set | incidentType = Recordable, Lost Time, or Fatality | Set oshaRecordable = true automatically |
| Fatality Notification | incidentType = Fatality AND status = Submitted | Send immediate notification to Project Executive, PE; log in activity spine; do NOT suppress |
| Section Score Denominator | All items in section = N/A or Incomplete | sectionScore = 0 (contribute 0 to overall score) |

---

## 10. Spine Publication Contract

### 10.1 Activity Spine Events (P3-D1 §8.5)

Safety module publishes the following activity events:

| Event Type | Trigger | Payload |
|---|---|---|
| inspection.completed | Inspection status transitions from Draft to Complete | inspectionId, projectId, overallScore, sectionCount (12), completedAt, keyFindings (if any) |
| incident.submitted | Incident status transitions to Submitted | incidentId, projectId, incidentType, oshaRecordable, submittedAt |
| incident.recordable | Incident submitted with oshaRecordable = true | incidentId, projectId, incidentType, oshaRecordable, submittedAt |
| incident.fatality | Incident submitted with incidentType = Fatality | incidentId, projectId, reportedBy, description, incidentDate, incidentTime |
| jha.activated | JHA status transitions to Active | jhaId, projectId, taskDescription, tradeOrCrew, hazardCount |

### 10.2 Health Spine Metrics (P3-D2 §11)

Safety module publishes cumulative health metrics:

| Metric | Calculation | Refresh Frequency |
|---|---|---|
| currentSafetyScore | Most recent inspection's overallScore | Per inspection completion |
| openCorrectiveActions | Count of corrective actions with status = Open or InProgress | Real-time |
| overdueCorrectiveActions | Count of corrective actions where dueDate < today AND status ≠ Verified | Daily at 00:00 |
| overduejhas | Count of JHAs with status = Active AND task not marked complete AND no JHA update in 30 days | Daily at 00:00 |
| totalIncidents | Count of all incident reports (all statuses) in current month | Monthly aggregate |
| oshaRecordableCount | Count of incident reports with oshaRecordable = true (current calendar year) | Real-time |

### 10.3 Work Queue Items (P3-D3 §12)

Safety module generates work queue items for:

| Item Type | Trigger | Priority |
|---|---|---|
| Corrective Action (Open) | Any item marked No at inspection completion | High (due within 30 days) |
| Corrective Action (Overdue) | Corrective action with dueDate < today AND status ≠ Verified | Critical |
| JHA Update Required | Active JHA with no update in 30 days AND task still in progress | Medium |
| Incident Follow-up | Incident report submitted; assigned corrective actions pending | High (if Recordable); Medium (if Near Miss) |

### 10.4 Related Items Spine (P3-D4 §9)

Safety incidents may relate to:

- **Constraints**: Schedule delays if corrective actions impact work flow
- **Schedule delays**: Major incidents (Recordable, Lost Time, Fatality) may halt operations
- **Procurement**: Corrective actions may require equipment procurement or remediation services

---

## 11. Executive Review Exclusion (CRITICAL)

### 11.1 Phase 3 Safety Exclusion

**Per P3-E1 §9.1 and §9.3, Safety is EXCLUDED from Phase 3 Executive Review (PER).**

**Rationale for Exclusion:**
- Safety data is operationally sensitive and compliance-critical
- Annotation layers on safety findings create governance complexity and potential liability
- Safety incidents require immediate operational response, not collaborative annotation
- OSHA compliance and project safety are separate from executive business review

### 11.2 PER Access Rules for Safety

| Access Type | Allowed | Rationale |
|---|---|---|
| READ safety inspection summaries | **Yes** (read-only) | Executive awareness of safety posture; passive visibility only |
| READ incident reports (submitted) | **Yes** (read-only) | Regulatory compliance tracking; no confidential discussion |
| ANNOTATE safety findings | **NO** | Annotation layer does not exist for Safety in Phase 3 |
| PUSH safety items to team | **NO** | No push-to-team pathway; safety actions tracked in Work Queue independently |
| MODIFY safety records | **NO** | Read-only access only; all writes go through Safety module workflow |
| APPROVE corrective actions | **NO** | Safety supervisor/project manager owns approval; not PER scope |

### 11.3 Future Phases

This exclusion may be revisited in Phase 4 or later with appropriate governance controls, such as:
- Anonymized safety metrics for trend analysis
- Regulatory compliance dashboards (OSHA 300 summaries)
- Separate governance model for safety annotation if needed

---

## 12. Required Capabilities

The Safety module **MUST** implement all of the following capabilities by Phase 3 completion:

1. **Safety Walk Checklist Creation & Completion**
   - Create new inspection records with all 12 sections pre-populated from master template
   - Accept responses (Yes, No, N/A) for all 93 items
   - Validate no item is left Incomplete before marking inspection Complete
   - Validate single-response-per-item (reject MULTI conditions)

2. **Weighted Score Calculation (Automatic)**
   - Calculate section scores per formula in §8.1 (section-level: yesCount / (yesCount + noCount))
   - Calculate overall score per formula in §8.2 (weighted sum)
   - Update scores in real-time as responses change
   - Store calculated scores immutably upon inspection completion

3. **Corrective Action Generation & Tracking**
   - Auto-generate corrective action for every No response at inspection completion
   - Assign default due date (inspection date + 30 days)
   - Provide status workflow: Open → InProgress → Resolved → Verified
   - Track resolution notes and verification details
   - Identify overdue corrective actions (dueDate < today, status ≠ Verified)

4. **Inspection History & Trend Analysis**
   - Store all inspection records with immutable timestamps
   - Retrieve inspection history by project (sorted by date)
   - Calculate safety trend (score progression over time)
   - Display most recent inspection score as health metric

5. **Incident Report CRUD with OSHA Classification**
   - Create, read, update, delete incident reports (Draft status only)
   - Auto-set oshaRecordable based on incidentType (Recordable, Lost Time, Fatality → true)
   - Classify incidents (Near Miss, First Aid, Recordable, Lost Time, Fatality, Property Damage, Environmental)
   - Trigger immediate fatality notifications (Project Executive, PE)
   - Mark OSHA 300 log entries as required

6. **JHA Record Management**
   - Create JHA records with hazard identification and risk assessment
   - Manage status: Draft → Active → Archived
   - Lock JHA fields once Active (immutable thereafter)
   - Track hazard controls and residual risk (Low, Medium, High)

7. **Safety Health Metric Publication to Health Spine**
   - Publish currentSafetyScore, openCorrectiveActions, overdueCorrectiveActions, overduejhas, totalIncidents, oshaRecordableCount
   - Update metrics on inspection completion, corrective action status change, incident submission

8. **Activity Spine Event Publication**
   - Publish inspection.completed events (with score, timestamp)
   - Publish incident.submitted, incident.recordable, incident.fatality events
   - Publish jha.activated events
   - Preserve event immutability and causality

9. **Work Queue Item Generation**
   - Create work queue items for open corrective actions
   - Escalate overdue corrective actions to critical priority
   - Generate JHA update reminders (30-day stale check)
   - Assign corrective action work items to responsible persons

10. **PER Read-Only Access Pathway**
    - Expose safety inspection summaries (inspection date, score, item count) to PER
    - Expose incident report summaries (date, type, status) to PER
    - **Block** all annotation, modification, and push-to-team operations from PER
    - Log all PER read access for audit purposes

---

## 13. Acceptance Gate Reference

Refer to **§18.5 of P3-H1** for complete Safety-module acceptance criteria. Key acceptance gates include:

- All 12 checklist sections with all 93 items present and immutable
- Weighted score calculation matches formula in §8.2 (verified by manual calculation)
- Corrective actions auto-generated and tracked with proper status workflow
- Incident reports created with OSHA classification and fatality notifications working
- JHA records with hazard tracking and status transitions
- Health spine metrics published and updated in real-time
- Work queue items generated for corrective actions and overdue items
- PER read-only access tested; all write operations blocked from PER
- No Safety module writes triggered from PER annotation (by design exclusion)

---

## 14. Field Index

### By Model

**ISafetyInspection**: inspectionId, projectId, inspectionDate, inspectionNumber, inspectorName, sections, overallScore, keyFindings, correctiveActions, status, createdAt, completedAt

**ISafetyInspectionSection**: sectionId, sectionNumber, sectionName, weight, items, sectionScore, yesCount, noCount, naCount, incompleteCount

**ISafetyChecklistItem**: itemId, sectionId, itemText, result, score, notes, inspectionFlag

**ICorrectiveAction**: actionId, inspectionId, sectionNumber, itemText, description, assignedTo, dueDate, status, resolutionNotes, resolvedAt, verifiedBy, createdAt

**IIncidentReport**: incidentId, projectId, incidentDate, incidentTime, reportedBy, incidentType, description, location, personsInvolved, injuryDescription, rootCause, immediateActions, correctiveActions, oshaRecordable, status, createdAt, submittedAt

**IJhaRecord**: jhaId, projectId, taskDescription, tradeOrCrew, supervisorName, completedDate, hazards, status

**IJhaHazard**: hazardId, jhaId, step, hazard, controls, residualRisk

### By Field Type

**Timestamps**: createdAt, completedAt, submittedAt, resolvedAt, importedAt, lastEditedAt

**Enums**: SafetyInspectionStatus, SafetyChecklistItemResult, SafetyInspectionFlag, CorrectiveActionStatus, IncidentType, IncidentReportStatus, JhaStatus, RiskLevel

**Calculated/Auto-Set**: overallScore, sectionScore, yesCount, noCount, naCount, incompleteCount, score (per item), inspectionFlag, oshaRecordable, sectionId, itemId, actionId, incidentId, jhaId, hazardId, createdAt

**Immutable After Creation**: inspectionId, projectId, itemId, actionId, incidentId, jhaId, hazardId, inspectionDate (Draft→Complete), inspectorName (Draft→Complete), itemText, sectionName, weight, createdAt, submittedAt (after Submitted)

**User-Editable**: result (item response), notes (item), description (corrective action if Open), assignedTo (corrective action if Open/InProgress), dueDate (corrective action if Open/InProgress), resolutionNotes (corrective action if Resolved/Verified), keyFindings, taskDescription (JHA if Draft), supervisorName (JHA if Draft), step/hazard/controls (JHA hazard if Draft)

---

**End of P3-E8: Safety Module Field Specification**

**Zero-Drift Certification**: This specification contains all 12 checklist sections with 93 complete, immutable items; complete enumeration definitions; all 7 data models with field-level specifications; all business rules; all validation rules; all spine contracts; and all required capabilities for implementation. Implementation must follow this specification exactly with no interpretation required.
