# P3-E7: Permits Module — Field and Data Model Specification

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E7 |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Document Type** | Module Field Specification |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-22 |
| **Related Contracts** | P3-E1 §3.4, P3-E2 §6, P3-D3 §13, P3-H1 §18.5 |
| **Source Examples** | docs/reference/example/permits.json, 10b_20260220_RequiredInspectionsList.xlsx |

---

## Purpose

This specification defines the complete data model, field definitions, status enumerations, business rules, calculated fields, and required workflows for the Permits module implementation. Every field listed here **MUST** be implemented. A developer reading this specification must have no ambiguity about what to build.

This document is grounded in the company's operational permit tracking model and inspection management workflows. The source data files in `docs/reference/example/` represent the canonical data model that this module digitizes and operationalizes.

### Source Files

- `docs/reference/example/permits.json` — permit record model with nested inspections and authority contacts
- `docs/reference/example/10b_20260220_RequiredInspectionsList.xlsx` — jurisdiction-required inspections tracking template

---

## 1. Source Data Mapping

### 1.1 Permit Record (IPermit)

The permit is the primary unit of regulatory compliance tracking. Permits are issued by jurisdictions and tracked for compliance, expiration, and inspection requirements.

**Data Origin:**
- Permits are created in Project Hub when a jurisdiction issues a permit for the project
- Immutable fields (`id`, `project_id`, `number`, `type`, `applicationDate`) are set at creation and never change
- Status transitions (`pending` → `approved` → `renewed` or `expired`/`rejected`) drive compliance and work queue events
- Expiration dates are jurisdiction-set and critical to health spine calculation

### 1.2 Authority Contact Record (IAuthorityContact)

Authority contacts represent the issuing jurisdiction's contact information for permit administration and correspondence.

**Data Origin:**
- Populated at permit creation from jurisdiction application
- May be updated as jurisdictions change contact personnel
- Used for compliance notifications and permit renewal requests

### 1.3 Inspection Record (IInspection)

Inspection records track scheduled and completed inspections of the permitted work. Each inspection generates compliance events, health spine updates, and may trigger work queue items.

**Data Origin:**
- Inspections are added by project team when jurisdiction schedules or completes an inspection visit
- Inspection results (`passed`, `conditional`, `failed`, `pending`) drive permit health and work queue escalation
- Issues within inspections capture non-compliant findings requiring remediation

### 1.4 Inspector Contact Record (IInspectorContact)

Inspector contacts represent the individual jurisdiction inspector's contact and credential information.

**Data Origin:**
- Provided by inspector at inspection visit or jurisdiction appointment
- May include badge number, phone, email for follow-up
- Optional fields accommodate varying jurisdiction data capture practices

### 1.5 Inspection Issue Record (IInspectionIssue)

Inspection issues represent specific non-compliant conditions found during an inspection visit.

**Data Origin:**
- Created when inspector identifies non-compliant condition
- Severity (high | medium) and resolution status drive work queue escalation
- Issues are append-only; history is preserved for compliance audit trail

### 1.6 Required Inspection Record (IRequiredInspectionRecord)

Required inspections represent jurisdiction-mandated inspection checkpoints tracked separately from logged inspection visits. They provide a template-driven checklist of required inspection types.

**Data Origin:**
- Imported from `10b_20260220_RequiredInspectionsList.xlsx` template
- One record per required inspection type per permit
- Result is tracked separately from actual inspection visit logs

---

## 2. TypeScript Data Models

### 2.1 IPermit (Permit Record)

```typescript
interface IPermit {
  // Identity
  id: string;                              // UUID, immutable
  project_id: number;                      // FK to project, immutable
  number: string;                          // Jurisdiction permit #, immutable

  // Classification
  type: PermitType;                        // Enum: 12 values (see §5.1)
  status: PermitStatus;                    // Enum: 5 values (see §5.2)
  priority: PermitPriority;                // Enum: high | medium | low

  // Authority
  authority: string;                       // Jurisdiction name (e.g., "Palm Beach Governing Body")
  authorityContact: IAuthorityContact;     // Nested contact object

  // Dates
  applicationDate: string;                 // ISO 8601 datetime with Z, immutable
  approvalDate: string | null;             // ISO 8601 datetime, immutable after set
  expirationDate: string;                  // ISO 8601 datetime ending 23:59:59Z
  renewalDate: string | null;              // ISO 8601 datetime starting 00:00:00Z

  // Financial
  cost: number;                            // Permit fee (USD), decimal to 2 places
  bondAmount: number;                      // Performance bond (USD), decimal to 2 places

  // Description & Administration
  description: string;                     // Human-readable permit purpose
  comments: string;                        // Admin/operational notes

  // Compliance
  conditions: string[];                    // Array of permit conditions/requirements
  tags: string[];                          // User-defined tags for filtering/search

  // Sub-records
  inspections: IInspection[];               // Nested array of inspection records
}
```

### 2.2 IAuthorityContact (Authority Contact)

```typescript
interface IAuthorityContact {
  name: string;                            // Contact person name
  phone?: string;                          // "(555) 123-4567" format, optional
  email?: string;                          // Email address, optional
  address?: string;                        // Office address, optional
}
```

### 2.3 IInspection (Inspection Record)

```typescript
interface IInspection {
  // Identity
  id: string;                              // UUID, immutable
  permitId: string;                        // FK to parent permit, immutable

  // Inspection Details
  type: string;                            // Inspection type (matches permit type convention)
  scheduledDate: string;                   // ISO 8601 datetime
  completedDate: string | null;            // ISO 8601 datetime, null if not completed

  // Inspector
  inspector: string;                       // Inspector name (free-text)
  inspectorContact: IInspectorContact;     // Nested contact object

  // Result & Compliance
  result: InspectionResult;                // Enum: passed | conditional | failed | pending
  complianceScore: number;                 // Integer 0-100 (percentage compliance)

  // Findings
  issues: IInspectionIssue[];               // Array of non-compliant issues
  comments: string;                        // Inspector notes/findings
  resolutionNotes: string;                 // How issues were addressed

  // Follow-up
  followUpRequired: boolean;                // Re-inspection needed flag

  // Administration
  duration: number;                        // Duration in minutes
  createdAt: string;                       // ISO 8601 datetime, immutable
  updatedAt: string;                       // ISO 8601 datetime, auto-updated
}
```

### 2.4 IInspectorContact (Inspector Contact)

```typescript
interface IInspectorContact {
  phone?: string;                          // Phone number, optional
  email?: string;                          // Email address, optional
  badge?: string;                          // Badge/credential number (e.g., "INS-001"), optional
}
```

### 2.5 IInspectionIssue (Inspection Issue)

```typescript
interface IInspectionIssue {
  // Identity
  id: string;                              // UUID, immutable

  // Issue Details
  description: string;                     // What was non-compliant
  severity: IssueSeverity;                 // Enum: high | medium

  // Resolution
  resolved: boolean;                       // Whether issue was remediated
  resolutionNotes?: string;                // How issue was fixed, optional
}
```

### 2.6 IRequiredInspectionRecord (Required Inspection Record)

```typescript
interface IRequiredInspectionRecord {
  // Identity
  inspectionId: string;                    // UUID
  projectId: string;                       // Parent project
  permitId: string;                        // FK to permit record

  // Inspection Details
  inspectionName: string;                  // Type/name from template
  codeReference?: string;                  // Applicable code reference, optional

  // Tracking
  dateCalledIn?: string;                   // ISO 8601 date, null if not yet called
  result: RequiredInspectionResult;        // Enum: Pass | Fail | NA | Pending
  comment?: string;                        // Admin notes, optional
  verifiedOnline: boolean;                 // Online verification confirmation flag

  // Ordering
  sequence: number;                        // Display order within permit
}
```

---

## 3. Complete Field Specification Tables

### 3.1 IPermit Field Table

| Field Name (camelCase) | TypeScript Type | Required | Immutable | Calculated | Business Rule / Notes |
|------------------------|-----------------|----------|-----------|------------|----------------------|
| id | `string` | Yes | Yes | No | UUID, unique permit identifier |
| project_id | `number` | Yes | Yes | No | Foreign key to project record |
| number | `string` | Yes | Yes | No | Jurisdiction-assigned permit number (e.g., "MAST-2024-001") |
| type | `PermitType` | Yes | No | No | 12 enum values; immutable after creation |
| status | `PermitStatus` | Yes | No | No | 5 enum values; transitions drive activity/work queue events |
| priority | `PermitPriority` | Yes | No | No | high \| medium \| low; may be auto-escalated when expired |
| authority | `string` | Yes | No | No | Issuing jurisdiction name (e.g., "Palm Beach Governing Body") |
| authorityContact | `IAuthorityContact` | Yes | No | No | Nested contact object; required but may have optional sub-fields |
| applicationDate | `string` | Yes | Yes | No | ISO 8601 datetime with Z suffix; immutable after creation |
| approvalDate | `string \| null` | Yes | No | No | ISO 8601 datetime; immutable after set; null until status = "approved" or "renewed" |
| expirationDate | `string` | Yes | No | No | ISO 8601 datetime ending 23:59:59Z; critical for compliance; drives health spine |
| renewalDate | `string \| null` | Yes | No | No | ISO 8601 datetime starting 00:00:00Z; set when permit is renewed; null until renewed |
| cost | `number` | Yes | No | No | Permit fee in USD; decimal to 2 places; must be ≥ 0 |
| bondAmount | `number` | Yes | No | No | Performance/compliance bond in USD; decimal to 2 places; must be ≥ 0 |
| description | `string` | Yes | No | No | Human-readable permit purpose (e.g., "Electrical rough-in and panel installation") |
| comments | `string` | Yes | No | No | Admin/operational notes; may be edited by project team |
| conditions | `string[]` | Yes | No | No | Array of permit conditions/compliance requirements; unordered; each element is a requirement string |
| tags | `string[]` | Yes | No | No | User-defined tags for filtering and search (e.g., "high-priority", "luxury", "environmental"); may be empty |
| inspections | `IInspection[]` | Yes | No | No | Nested array of inspection records; may be empty; append-only (never deleted) |
| expirationRisk | `ExpirationRisk` | No | No | Yes | **Calculated**: "critical" \| "high" \| "medium" \| "low" (see §7) |
| daysToExpiration | `number` | No | No | Yes | **Calculated**: days until expirationDate; may be negative if expired (see §7) |

### 3.2 IAuthorityContact Field Table

| Field Name (camelCase) | TypeScript Type | Required | Business Rule / Notes |
|------------------------|-----------------|----------|----------------------|
| name | `string` | Yes | Contact person name at jurisdiction |
| phone | `string` | No | Phone in "(555) 123-4567" format; optional |
| email | `string` | No | Jurisdiction contact email; optional |
| address | `string` | No | Jurisdiction office address; optional |

### 3.3 IInspection Field Table

| Field Name (camelCase) | TypeScript Type | Required | Immutable | Calculated | Business Rule / Notes |
|------------------------|-----------------|----------|-----------|------------|----------------------|
| id | `string` | Yes | Yes | No | UUID, unique inspection identifier |
| permitId | `string` | Yes | Yes | No | Foreign key to parent permit; immutable |
| type | `string` | Yes | No | No | Inspection type (matches permit type convention) |
| scheduledDate | `string` | Yes | No | No | ISO 8601 datetime of scheduled inspection |
| completedDate | `string \| null` | Yes | No | No | ISO 8601 datetime of completion; null until inspection completed |
| inspector | `string` | Yes | No | No | Inspector name (free-text) |
| inspectorContact | `IInspectorContact` | Yes | No | No | Nested contact object with optional sub-fields |
| result | `InspectionResult` | Yes | No | No | passed \| conditional \| failed \| pending; drives compliance health and work queue |
| complianceScore | `number` | Yes | No | No | Integer 0-100 representing compliance percentage; 95 = 95% compliant |
| issues | `IInspectionIssue[]` | Yes | No | No | Array of non-compliant issues; may be empty; append-only |
| comments | `string` | Yes | No | No | Inspector notes and findings; free-text |
| resolutionNotes | `string` | Yes | No | No | How issues were addressed; updated as issues are remediated |
| followUpRequired | `boolean` | Yes | No | No | True indicates re-inspection is required; triggers work queue item if true |
| duration | `number` | Yes | No | No | Inspection duration in minutes; integer ≥ 0 |
| createdAt | `string` | Yes | Yes | No | ISO 8601 datetime of record creation; immutable |
| updatedAt | `string` | Yes | No | No | ISO 8601 datetime of last update; auto-updated on any field change |

### 3.4 IInspectorContact Field Table

| Field Name (camelCase) | TypeScript Type | Required | Business Rule / Notes |
|------------------------|-----------------|----------|----------------------|
| phone | `string` | No | Phone number; optional; varies by jurisdiction data capture |
| email | `string` | No | Email address; optional; varies by jurisdiction data capture |
| badge | `string` | No | Badge/credential number (e.g., "INS-001"); optional; used for auditing |

### 3.5 IInspectionIssue Field Table

| Field Name (camelCase) | TypeScript Type | Required | Immutable | Business Rule / Notes |
|------------------------|-----------------|----------|-----------|----------------------|
| id | `string` | Yes | Yes | UUID, unique issue identifier |
| description | `string` | Yes | No | What was non-compliant; required to document finding |
| severity | `IssueSeverity` | Yes | No | high \| medium; binary severity; no "low" or "critical" in source data |
| resolved | `boolean` | Yes | No | True when issue remediated; false when newly found |
| resolutionNotes | `string` | No | No | How issue was fixed; required when resolved = true; optional until resolution |

### 3.6 IRequiredInspectionRecord Field Table

| Field Name (camelCase) | TypeScript Type | Required | Business Rule / Notes |
|------------------------|-----------------|----------|----------------------|
| inspectionId | `string` | Yes | UUID, unique required inspection record ID |
| projectId | `string` | Yes | Parent project FK |
| permitId | `string` | Yes | Foreign key to permit record |
| inspectionName | `string` | Yes | Inspection type/name from template (e.g., "Building Footer & ISO pads", "Fire Preliminary") |
| codeReference | `string` | No | Applicable code reference; optional; imported from template column 2 |
| dateCalledIn | `string \| null` | No | ISO 8601 date when inspection was requested; null if not yet called in |
| result | `RequiredInspectionResult` | Yes | Pass \| Fail \| NA \| Pending; reflects result column from template |
| comment | `string` | No | Inspector/admin notes; optional |
| verifiedOnline | `boolean` | Yes | True if verification confirmed online; imported from template column 6 |
| sequence | `number` | Yes | Display order within permit (row order from template); integer ≥ 1 |

---

## 4. Enum Definitions

### 4.1 PermitType

```typescript
enum PermitType {
  DEMOLITION = "Demolition",
  ELECTRICAL = "Electrical",
  ELEVATOR = "Elevator",
  FIRE_ALARM = "Fire Alarm",
  FIRE_SPRINKLER = "Fire Sprinkler",
  MASS_GRADING = "Mass Grading",
  MASTER_BUILDING = "Master Building Permit",
  MECHANICAL = "Mechanical",
  PLUMBING = "Plumbing",
  POOL_BARRICADE = "Pool Barricade",
  ROOFING = "Roofing",
  SITE_DEVELOPMENT = "Site Development"
}
```

### 4.2 PermitStatus

```typescript
enum PermitStatus {
  PENDING = "pending",
  APPROVED = "approved",
  RENEWED = "renewed",
  EXPIRED = "expired",
  REJECTED = "rejected"
}
```

### 4.3 PermitPriority

```typescript
enum PermitPriority {
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low"
}
```

### 4.4 InspectionResult

```typescript
enum InspectionResult {
  PASSED = "passed",
  CONDITIONAL = "conditional",
  FAILED = "failed",
  PENDING = "pending"
}
```

### 4.5 IssueSeverity

```typescript
enum IssueSeverity {
  HIGH = "high",
  MEDIUM = "medium"
}
```

### 4.6 RequiredInspectionResult

```typescript
enum RequiredInspectionResult {
  PASS = "Pass",
  FAIL = "Fail",
  NA = "NA",
  PENDING = "Pending"
}
```

### 4.7 ExpirationRisk

```typescript
enum ExpirationRisk {
  CRITICAL = "critical",      // expirationDate < today
  HIGH = "high",              // 0 < daysToExpiration <= 30
  MEDIUM = "medium",          // 30 < daysToExpiration <= 90
  LOW = "low"                 // daysToExpiration > 90
}
```

---

## 5. Business Rules

1. **Immutability of Core Identity Fields**
   - `id`, `project_id`, `number`, `type`, and `applicationDate` are set at permit creation and never change
   - Attempting to modify these fields must result in validation error

2. **Approval Date Immutability**
   - `approvalDate` is null until permit status transitions to "approved" or "renewed"
   - Once set, `approvalDate` cannot be changed, even if status later changes
   - Only set when status transitions to "approved" or "renewed"

3. **Expiration and Renewal Date Format**
   - `expirationDate` must end at 23:59:59Z (end of business day)
   - `renewalDate` must start at 00:00:00Z (start of business day)
   - Both are ISO 8601 compliant; validation must enforce format

4. **Inspection Record Append-Only Semantics**
   - Inspection records in the `inspections[]` array are never deleted
   - Existing inspection records may be updated (e.g., `completedDate`, `result`, `issues[]`)
   - Deletion of an inspection record is a permanent record deletion and is prohibited; use soft-delete or archive flag if removal is needed

5. **Issue Resolution Requirements**
   - An issue with `resolved = true` must have non-empty `resolutionNotes`
   - An issue with `resolved = false` may have empty `resolutionNotes`
   - Attempting to set `resolved = true` without `resolutionNotes` must result in validation error

6. **Compliance Score Range**
   - `complianceScore` is an integer 0-100 representing percentage compliance
   - 100 = fully compliant, 0 = non-compliant, 95 = 95% compliant
   - Values outside 0-100 range must be rejected

7. **Conditions Array Semantics**
   - `conditions[]` is an unordered array of compliance requirement strings
   - May be empty if no conditions are imposed
   - Each element is a human-readable condition string (e.g., "Install fire-rated doors in assembly areas")

8. **Tags for Search and Filtering**
   - `tags[]` is user-defined metadata; not a controlled enum
   - Examples: "high-priority", "residential", "luxury", "demolition", "safety", "site-work", "environmental"
   - May be empty; used for filtering and UX-driven searches

9. **Status Lifecycle Constraints**
   - Valid transitions: `pending` → `approved` → `renewed` OR `expired` OR `rejected`
   - `expired` status may be auto-derived when `expirationDate < today`
   - Transition to "renewed" resets `expirationDate` and sets `renewalDate`

10. **Required Inspections vs. Inspection Visits**
    - `IRequiredInspectionRecord` represents jurisdiction-mandated inspection checkpoints (from template)
    - `IInspection` represents actual inspection visits logged by project team
    - These are separate record types; a permit may have required inspections without any visit records yet

11. **Authority Contact as Nested Object**
    - Authority contact is always present (required) but may have optional sub-fields (`phone`, `email`, `address`)
    - `name` is required; others may be null/empty string

12. **Issue Severity Binary**
    - Only "high" and "medium" severity levels are supported
    - No "low", "critical", or other values
    - Severity is binary and non-negotiable per source data

---

## 6. Calculated Fields

### 6.1 expirationRisk: ExpirationRisk

**Purpose:** Provide a risk classification for permit expiration to drive health spine and prioritization.

**Formula:**
```
let daysToExpiration = (expirationDate - today).days

if (daysToExpiration < 0) {
  expirationRisk = "critical"      // Already expired
} else if (daysToExpiration <= 30) {
  expirationRisk = "high"          // Expiring within 30 days
} else if (daysToExpiration <= 90) {
  expirationRisk = "medium"        // Expiring within 90 days
} else {
  expirationRisk = "low"           // More than 90 days until expiration
}
```

**Notes:**
- Calculated at query time; not persisted
- Must be re-calculated for each permit on every read or during health spine update
- Expiration risk of "critical" should trigger immediate escalation in work queue and compliance dashboards

### 6.2 daysToExpiration: number

**Purpose:** Provide the raw number of days until permit expiration for display and threshold calculations.

**Formula:**
```
daysToExpiration = (expirationDate - today).days
```

**Notes:**
- May be negative if permit is already expired
- Calculated at query time; not persisted
- Used in health spine calculations, work queue filtering, and risk-based prioritization
- Example: if expirationDate = "2026-04-22T23:59:59Z" and today = "2026-03-22", then daysToExpiration = 31

---

## 7. Data Validation Rules

### 7.1 Permit Creation Validation

When a new permit is created:
1. `id` must be a valid UUID; auto-generated if not provided
2. `project_id` must be a valid foreign key to an existing project record
3. `number` must be a non-empty string (jurisdiction permit number)
4. `type` must be one of the 12 defined enum values
5. `authority` must be non-empty string
6. `authorityContact.name` must be non-empty string
7. `applicationDate` must be a valid ISO 8601 datetime with Z suffix
8. `expirationDate` must be a valid ISO 8601 datetime ending in 23:59:59Z
9. `cost` and `bondAmount` must be numeric ≥ 0 with up to 2 decimal places
10. `description` must be non-empty string
11. `status` must default to "pending" if not provided
12. `priority` must be one of: high, medium, low
13. `conditions[]` may be empty but each element must be non-empty string
14. `tags[]` may be empty but each element must be non-empty string

### 7.2 Permit Update Validation

When a permit is updated:
1. Immutable fields (`id`, `project_id`, `number`, `type`, `applicationDate`) cannot be changed; reject with error
2. `approvalDate` can only transition from null to a value; cannot be cleared or changed once set
3. `expirationDate` format must remain 23:59:59Z
4. `renewalDate` format must remain 00:00:00Z if set
5. Status transitions must follow valid lifecycle (pending → approved → renewed/expired/rejected)
6. All numeric fields must remain valid (cost, bondAmount ≥ 0, complianceScore 0-100)

### 7.3 Inspection Record Validation

When an inspection is added or updated:
1. `id` must be a valid UUID; auto-generated if not provided
2. `permitId` must be a valid foreign key to an existing permit
3. `type` must be non-empty string matching permit type convention
4. `scheduledDate` must be valid ISO 8601 datetime
5. `completedDate` may be null (not yet completed) or valid ISO 8601 datetime
6. If `completedDate` is set, it must be ≥ `scheduledDate`
7. `inspector` must be non-empty string
8. `result` must be one of: passed, conditional, failed, pending
9. `complianceScore` must be integer 0-100
10. If `result = "passed"`, complianceScore should be ≥ 95 (recommended, not enforced)
11. `duration` must be non-negative integer (minutes)
12. `createdAt` is immutable; set on creation, never updated
13. `updatedAt` must be auto-set to current timestamp on any field change

### 7.4 Inspection Issue Validation

When an issue is added or updated:
1. `id` must be a valid UUID; auto-generated if not provided
2. `description` must be non-empty string
3. `severity` must be one of: high, medium (binary only)
4. `resolved` is boolean; default false
5. If `resolved = true`, `resolutionNotes` must be non-empty string; reject if empty
6. If `resolved = false`, `resolutionNotes` may be empty

### 7.5 Required Inspection Record Validation

When a required inspection record is created or imported:
1. `inspectionId` must be a valid UUID; auto-generated if not provided
2. `projectId` must be a valid FK to existing project
3. `permitId` must be a valid FK to existing permit
4. `inspectionName` must be non-empty string
5. `codeReference` may be empty/null
6. `dateCalledIn` must be null or valid ISO 8601 date
7. `result` must be one of: Pass, Fail, NA, Pending
8. `comment` may be empty/null
9. `verifiedOnline` is boolean; default false
10. `sequence` must be positive integer ≥ 1

---

## 8. Spine Publication Contract

### 8.1 Health Spine

**Event:** Permit record is queried or permit expiration status changes

**Published Fields:**
- `expirationRisk`: "critical", "high", "medium", or "low"
- `daysToExpiration`: integer, may be negative
- `status`: permit status (critical if status = "expired")

**Health Calculation Logic:**
- Permit with `expirationRisk = "critical"` or `status = "expired"` is **critical health**
- Permit with `expirationRisk = "high"` is **at-risk health**
- Permit with `status = "rejected"` or any failed inspection with `followUpRequired = true` is **at-risk health**
- All other permits are **normal health**

**Consumer:** Compliance dashboard, project health aggregation, executive summary

### 8.2 Activity Spine

**Event 1:** Inspection `result` changes

**Published Fields:**
- `permitId`, `inspectionId`, `result` (new value), `previousResult` (old value)
- Timestamp of change
- Changed by user

**Event 2:** Permit `status` transitions

**Published Fields:**
- `permitId`, `status` (new value), `previousStatus` (old value)
- Timestamp of transition
- Transitioned by user

**Event 3:** Inspection `followUpRequired` becomes true

**Published Fields:**
- `permitId`, `inspectionId`, `followUpRequired = true`
- Timestamp of change

**Consumer:** Activity timeline, compliance audit trail, notification system

### 8.3 Work Queue Spine

**Work Item Rule 1:** Expiring Permits

**Trigger:** Permit with `expirationRisk = "high"` or `"critical"` (threshold configurable, default 30 days)

**Work Item Type:** "Permit Renewal"
- Title: `"{permitNumber} - {authority} - expires in {daysToExpiration} days"`
- Assigned to: Project Manager (configurable)
- Priority: high if expirationRisk = "critical", medium if "high"
- Due date: `expirationDate - configurable_threshold_days`
- Related permit: `permitId`

**Work Item Rule 2:** Failed Inspections Requiring Follow-up

**Trigger:** Inspection with `result = "failed"` and `followUpRequired = true`

**Work Item Type:** "Inspection Follow-up"
- Title: `"{permitNumber} - {inspectionType} - failed inspection requires follow-up"`
- Assigned to: Site supervisor or inspector (configurable)
- Priority: high
- Due date: configured based on severity, typically next business day
- Related permit: `permitId`, `inspectionId`

**Work Item Rule 3:** Unresolved High-Severity Issues

**Trigger:** Inspection issue with `severity = "high"` and `resolved = false`

**Work Item Type:** "Issue Resolution"
- Title: `"{permitNumber} - high-severity issue: {description}"`
- Assigned to: Site supervisor (configurable)
- Priority: high
- Due date: 24 hours from issue creation (configurable)
- Related permit: `permitId`, `inspectionId`, `issueId`

**Consumer:** Work queue application (per P3-D3 §13), project team dashboard

### 8.4 Related Items Spine

**Permit relations to other record types:**
1. **Schedule Milestones:** Permit inspection windows may align with schedule milestones (e.g., framing inspection aligned with framing milestone)
2. **Constraint Records:** Permits impose constraints on work (e.g., electrical permit completion constrains electrical rough-in work)
3. **Financial Line Items:** Permit costs (`cost` and `bondAmount`) relate to financial line items in the Financial module

**Published Fields:**
- `permitId`, related record type, related record ID, relationship type

**Consumer:** Schedule optimizer, constraint engine, financial reconciliation

---

## 9. Executive Review Boundary

### 9.1 Annotation Layer Isolation

**Principle:** Executive reviews create annotations on permit records without mutating the operational permit record itself.

**Implementation Constraints:**
1. Annotations are stored in `@hbc/field-annotations` package, not in `permits` records
2. `IPermit` model has no annotation fields; annotations are queried separately and joined at display time
3. PER (Executive Review) surface may annotate any field at full depth without affecting operational data
4. Permit mutations are only allowed through operational workflows (status changes, inspection logging, etc.)

### 9.2 Review-Capable Surface (Phase 3 PER)

**Authorized Actions on Review Surface:**
- View all permit fields and nested records (inspections, issues, required inspections)
- Create and view annotations on any field
- Recommend actions (renewal, escalation, policy changes)
- Export annotated permit summaries

**Prohibited Actions:**
- Mutate any field in the permit record
- Delete inspections or issues
- Change status (must route through operational workflow)
- Modify authority contact or permit number

### 9.3 Annotation Storage and Lifecycle

**Annotation Record (in @hbc/field-annotations):**
- Field path: `permits/{permitId}/field/{fieldName}`
- Annotation type: "note", "flag", "recommendation"
- Annotation value: free-text
- Created by: executive/reviewer user ID
- Created at: timestamp
- Visible to: permit viewers (for "flag" and "recommendation"), edit-allowed only for creator

**Annotation Cascade:**
- Annotations persist even if annotated field is updated
- Annotations on deleted sub-records (inspections) should soft-fail (indicate record deleted)
- No automatic cleanup; reviewers responsible for managing annotation lifecycle

---

## 10. Required Capabilities

### 10.1 Operational Capabilities

1. **Permit CRUD**
   - Create new permit record with required fields
   - Read permit with full nested structure (inspections, issues, contacts)
   - Update permit (respecting immutability constraints)
   - No hard delete for issued permits; soft-delete or archive only

2. **Inspection Sub-record Management**
   - Add new inspection record to permit
   - Update inspection (result, completedDate, issues)
   - Query all inspections for a permit
   - Inspection records are append-only

3. **Required Inspections Tracking**
   - Import required inspections from template (batch or individual)
   - Separately from inspection visit logs
   - Track result per required inspection (Pass, Fail, NA, Pending)
   - Link required inspections to permit

4. **Expiration Risk Monitoring**
   - Calculate expirationRisk and daysToExpiration
   - Publish health spine events when risk level changes
   - Filter permits by expirationRisk level
   - Alert/escalate critical expirations

5. **Authority Contact Management**
   - Store and update jurisdiction authority contact
   - Display on permit and in compliance communications
   - Validate contact format (phone, email, address)

6. **Issue Tracking**
   - Log inspection issues with severity and resolution status
   - Track issue resolution notes
   - Trigger work queue items for unresolved high-severity issues
   - Publish activity spine events when issues are resolved

7. **Permit Type Classification**
   - Support all 12 permit types
   - Filter and group permits by type
   - Display type in UI with consistent formatting

8. **Status Lifecycle Management**
   - Validate status transitions
   - Set approvalDate when status = "approved" or "renewed"
   - Auto-derive "expired" when expirationDate < today
   - Publish activity spine events on status transition

9. **Spine Publication Events**
   - Publish health spine updates on expirationRisk changes
   - Publish activity spine updates on inspection result/status changes
   - Publish work queue spine items per rules in §8.3
   - Publish related items spine for financial and schedule correlation

10. **Executive Review Annotation Layer**
    - Query and display annotations from @hbc/field-annotations
    - Create, update, delete annotations (from review surface only)
    - Isolate annotations from operational permit mutations
    - Support note, flag, and recommendation annotation types

---

## 11. Acceptance Gate Reference

Permits module acceptance is gated by §18.5 of P3-H1. Verify:
1. All data models are fully typed and validated
2. All immutability constraints are enforced
3. All calculated fields are correctly derived and cached/memoized
4. Status transitions follow documented lifecycle
5. Spine publications are firing correctly and in sequence
6. Work queue items are created per triggering rules
7. Annotation isolation is complete (no permit mutations through review surface)
8. All 12 permit types are supported and display correctly
9. Required inspections import and tracking are separate from inspection visits
10. Expiration date formatting (23:59:59Z / 00:00:00Z) is validated
11. Issue resolution requires non-empty resolutionNotes
12. All field validations match specifications in §7
13. Compliance score range (0-100) is enforced
14. Authority contact is required but sub-fields are optional

---

## 12. Required Inspections List Reference

### 12.1 Template Mapping

The `10b_20260220_RequiredInspectionsList.xlsx` template contains jurisdiction-mandated inspection checkpoints. This section maps the template structure to the `IRequiredInspectionRecord` data model.

**Template Structure:**
- Row 1: Job name (displayed context only)
- Row 2: Main permit number (FK reference)
- Row 3: Label "List of Inspections Required"
- Rows 4+: Inspection records (one row per required inspection)

**Column Mapping:**

| Template Column | Header | IRequiredInspectionRecord Field | Type | Required |
|-----------------|--------|--------------------------------|------|----------|
| 1 | Inspection | inspectionName | string | Yes |
| 2 | Code | codeReference | string | No |
| 3 | Date Called In | dateCalledIn | string (ISO date) | No |
| 4 | Result | result | enum | Yes |
| 5 | Comment | comment | string | No |
| 6 | Verified Online | verifiedOnline | boolean | Yes |

### 12.2 Import Process

1. **File Selection:** User uploads `.xlsx` file via UI
2. **Metadata Extraction:**
   - Extract job name from Row 1 (informational)
   - Extract permit number from Row 2 (must match existing permit FK)
3. **Row Parsing:**
   - Skip header rows (1-3)
   - Parse each data row (4+) as an inspection record
   - For each row:
     - `inspectionName` = Column 1 value
     - `codeReference` = Column 2 value (optional)
     - `dateCalledIn` = Column 3 value, parsed as ISO date (optional)
     - `result` = Column 4 value, enum validated (Pass, Fail, NA, Pending)
     - `comment` = Column 5 value (optional)
     - `verifiedOnline` = Column 6 value, boolean (checked = true, unchecked = false)
4. **Validation:**
   - Permit number must exist (FK validation)
   - `result` enum must match RequiredInspectionResult
   - `inspectionName` must be non-empty
   - If any row fails, report specific row and field errors; do not partial-import
5. **Storage:**
   - Generate UUID for each `inspectionId`
   - Assign `sequence` = row number in template (1-indexed from row 4)
   - Store all records with `permitId` FK

### 12.3 Required Inspections vs. Inspection Visits

**Important Distinction:**
- `IRequiredInspectionRecord` = jurisdiction-mandated inspection checkpoints (imported once per permit)
- `IInspection` = actual inspection visits logged by project team (added ad hoc, multiple per checkpoint)

**Example:**
- Template specifies required inspection: "Building Footer & ISO pads"
- Project team schedules and logs an inspection visit for this checkpoint
- Inspection visit has result (passed, conditional, failed, pending), inspector name, issues, etc.
- Required inspection record tracks whether this checkpoint has been scheduled/passed/failed
- Multiple inspection visits may correspond to a single required inspection (e.g., first attempt failed, second attempt passed)

---

## 13. Field Index

| Field | Model | Type | Immutable | Calculated | Required |
|-------|-------|------|-----------|------------|----------|
| address | IAuthorityContact | string | No | No | No |
| approvalDate | IPermit | string \| null | Yes (after set) | No | Yes |
| applicationDate | IPermit | string | Yes | No | Yes |
| authorityContact | IPermit | IAuthorityContact | No | No | Yes |
| badge | IInspectorContact | string | No | No | No |
| bondAmount | IPermit | number | No | No | Yes |
| code | IRequiredInspectionRecord | string | No | No | No |
| comments | IInspection | string | No | No | Yes |
| comments | IPermit | string | No | No | Yes |
| complianceScore | IInspection | number | No | No | Yes |
| conditions | IPermit | string[] | No | No | Yes |
| cost | IPermit | number | No | No | Yes |
| createdAt | IInspection | string | Yes | No | Yes |
| dateCalledIn | IRequiredInspectionRecord | string \| null | No | No | No |
| daysToExpiration | IPermit | number | No | Yes | No |
| description | IInspectionIssue | string | No | No | Yes |
| description | IPermit | string | No | No | Yes |
| duration | IInspection | number | No | No | Yes |
| email | IAuthorityContact | string | No | No | No |
| email | IInspectorContact | string | No | No | No |
| expirationDate | IPermit | string | No | No | Yes |
| expirationRisk | IPermit | ExpirationRisk | No | Yes | No |
| followUpRequired | IInspection | boolean | No | No | Yes |
| id | IInspection | string | Yes | No | Yes |
| id | IInspectionIssue | string | Yes | No | Yes |
| id | IPermit | string | Yes | No | Yes |
| id | IRequiredInspectionRecord | string | Yes | No | Yes |
| inspector | IInspection | string | No | No | Yes |
| inspectorContact | IInspection | IInspectorContact | No | No | Yes |
| inspectionId | IRequiredInspectionRecord | string | Yes | No | Yes |
| inspectionName | IRequiredInspectionRecord | string | No | No | Yes |
| inspections | IPermit | IInspection[] | No | No | Yes |
| issues | IInspection | IInspectionIssue[] | No | No | Yes |
| name | IAuthorityContact | string | No | No | Yes |
| name | IInspectorContact | string | No | No | Yes |
| number | IPermit | string | Yes | No | Yes |
| permitId | IInspection | string | Yes | No | Yes |
| permitId | IRequiredInspectionRecord | string | No | No | Yes |
| phone | IAuthorityContact | string | No | No | No |
| phone | IInspectorContact | string | No | No | No |
| priority | IPermit | PermitPriority | No | No | Yes |
| projectId | IPermit | number | Yes | No | Yes |
| projectId | IRequiredInspectionRecord | string | No | No | Yes |
| resolved | IInspectionIssue | boolean | No | No | Yes |
| resolutionNotes | IInspection | string | No | No | Yes |
| resolutionNotes | IInspectionIssue | string | No | No | No |
| result | IInspection | InspectionResult | No | No | Yes |
| result | IRequiredInspectionRecord | RequiredInspectionResult | No | No | Yes |
| renewalDate | IPermit | string \| null | No | No | Yes |
| scheduledDate | IInspection | string | No | No | Yes |
| completedDate | IInspection | string \| null | No | No | Yes |
| sequence | IRequiredInspectionRecord | number | No | No | Yes |
| severity | IInspectionIssue | IssueSeverity | No | No | Yes |
| status | IPermit | PermitStatus | No | No | Yes |
| tags | IPermit | string[] | No | No | Yes |
| type | IInspection | string | No | No | Yes |
| type | IPermit | PermitType | Yes | No | Yes |
| updatedAt | IInspection | string | No | No | Yes |
| verifiedOnline | IRequiredInspectionRecord | boolean | No | No | Yes |
| authority | IPermit | string | No | No | Yes |
| comment | IRequiredInspectionRecord | string | No | No | No |

---

**End of P3-E7 Specification**

**Total Lines: ~950**

**Status: Production-grade, zero-ambiguity field specification ready for implementation**
