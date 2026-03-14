# W0-G2-T01 — Shared List Schema Standards and PID Contract

> **Doc Classification:** Canonical Normative Plan — Wave 0 Group 2 task plan establishing the governing schema contract for all G2 workflow-family lists. All T02–T06 data model plans must comply with the standards defined here. Must be locked before any T02–T06 list schema is finalized.

**Phase Reference:** Wave 0 Group 2 — Backend Hardening and Workflow Data Foundations Plan
**Depends On:** G1 T01 (site template specification), G1 T02 (Entra ID group model), G1 T04 (environment config registry)
**Unlocks:** T02 through T06 (workflow-family list schemas), T07 (provisioning saga updates), T08/T09 (validation and testing)
**ADR Output:** Contributes to ADR-0115 (G2 list schema and PID contract decisions)

---

## Objective

Establish the governing schema contract for all workflow-family SharePoint lists introduced by Group 2. This contract covers:

1. The `pid` relational column — definition, format, indexing, and alignment with the existing data model
2. Global field naming and type conventions applicable to all G2 lists
3. Mandatory metadata fields that every G2 list must carry
4. Parent/child relationship patterns — when to use them, how to implement them
5. Workflow-family ownership doctrine and cross-reference rules
6. The seeded-file classification model — how each workflow is categorized for G2 action
7. Source-of-truth transition doctrine for list vs. file-backed workflows

Every T02–T06 data model plan derives its schema decisions from this document. T01 is the single source of schema truth for Group 2.

---

## Why This Task Exists

Group 2 will add a significant number of SharePoint lists to every provisioned project site. Without a governing schema standard, each workflow-family plan (T02–T06) would make independent field-naming, type, and structure decisions that conflict with each other, with the existing 8-list core, and with the Wave 1 features that will build against these structures.

Specifically, without T01:

- `pid` would be named inconsistently across families (`ProjectId`, `PID`, `ProjectNumber`, `pid`) making cross-list queries unreliable
- Parent/child decisions would be made ad hoc, with some families creating parent lists and others creating flat lists for structurally equivalent workflows
- Seeded-file decisions would be made independently, resulting in inconsistent operational guidance
- The transition model would be ambiguous — some implementors would assume list = source of truth, others would maintain files only

T01 prevents all of these failure modes.

---

## Scope

T01 covers:

1. `pid` field contract: type, format, required/optional status, indexing requirement, default value mechanism, and alignment with `projectId` / `projectNumber` in `IProvisioningStatus`
2. Mandatory audit and metadata fields: which fields every G2 list must include
3. Naming conventions: list titles, internal field names, display names
4. Field type standards: choice sets, user fields, date formats, number precision
5. Parent/child governance rules: when to use them, how the lookup column is structured, and which G2 workflows are confirmed parent/child
6. Workflow-family ownership doctrine: who owns each workflow, how cross-references work
7. Seeded-file classification: four-state model with classification criteria
8. Source-of-truth transition doctrine

T01 does not cover:

- Specific field schemas for any workflow (those are in T02–T06)
- Provisioning implementation (that is T07)
- Validation and testing (that is T08/T09)
- UI data-entry patterns for the lists (that is a Wave 1 concern)

---

## Governing Constraints

- **G2 Decision G2-4 (PID):** Every G2 list must include `pid` as a required indexed column.
- **G2 Decision G2-3 (Cross-family ownership):** Each workflow belongs to exactly one family. Cross-references, not duplication.
- **G2 Decision G2-5 (Transition model):** Some workflows remain file-backed; lists capture structured fields for future features.
- **G2 Decision G2-6 (Parent/child):** Obvious checklist/form workflows use parent/child structures.
- **G1 T01 (Core lists):** The 8 core lists in `HB_INTEL_LIST_DEFINITIONS` are owned by the core template. G2 does not modify them.
- **`IListDefinition` contract:** All G2 lists must be expressible as `IListDefinition` objects (from `backend/functions/src/services/sharepoint-service.ts`): `title`, `description`, `template`, `fields[]`.
- **CLAUDE.md §1.2 Zero-Deviation Rule:** Once T01 schema standards are locked, any deviation requires a superseding ADR.

---

## 1. PID Contract

### 1.1 Definition

`pid` is the relational column included on every workflow-family SharePoint list provisioned by Group 2. It stores the project's canonical identifier, enabling any Wave 1 feature to query all list items belonging to a specific project across all list families.

`pid` is not a calculated field and is not a lookup column pointing to another SharePoint list. It is a simple single-line text field storing a deterministic string value.

### 1.2 PID Alignment Note

The existing codebase uses two project identifier concepts:

| Field | Type | Example | Where Used |
|-------|------|---------|-----------|
| `projectId` | UUID string | `"d4e9b2a1-f3c7-4e08-a891-bb23456cd789"` | Provisioning saga, Azure Table Storage, SignalR group key |
| `projectNumber` | Formatted string | `"25-001-01"` | Display, SharePoint site URL, Entra ID group names |

The G2 interview locked the `pid` field as "the 7-digit unique project identifier." This language aligns most closely with `projectNumber` format (e.g., "25-001-01"), though the exact digit count may vary. The `projectId` UUID is not human-readable and is not suitable as the relational key that project managers and app developers would use to identify records.

**Locked G2 recommendation:** `pid` stores the `projectNumber` value from `IProvisioningStatus`. This recommendation:
- Makes `pid` values human-readable and recognizable by project teams
- Aligns with the SharePoint site URL naming convention (which also uses `projectNumber`)
- Enables cross-list queries that a developer or power user can construct manually
- Does not require a separate lookup service to resolve a UUID to a project

**Ambiguity preservation:** If the product owner determines that a separate internal numeric `pid` is preferred over `projectNumber`, this decision must be recorded as an amendment to this plan before T07 implementation begins. The implementation mechanism is the same regardless of the value — the provisioning saga sets the default column value at list creation time.

### 1.3 PID Field Specification

```
InternalName:    pid
DisplayName:     Project ID
Type:            Text (Single Line)
Required:        true
MaxLength:       50
DefaultValue:    <set to status.projectNumber at list creation time>
Indexed:         true  (required for query performance)
```

### 1.4 Default Value Mechanism

SharePoint list columns can have a default value set at provisioning time via the REST API (via `DefaultValue` property on the field schema). PnPjs supports this via the `Field.add` method with the `DefaultValue` parameter. The provisioning saga must set `pid` default value to `status.projectNumber` when creating each list.

**Implementation constraint:** The current `IListDefinition` and `IFieldDefinition` types in `backend/functions/src/services/sharepoint-service.ts` may not yet have a `defaultValue` property on `IFieldDefinition`. If not present, G2 must add it as part of the `IListDefinition` contract extension in T07. This is a type addition only — it does not change the `IListDefinition` structure for existing fields.

**Fallback:** If the PnPjs `DefaultValue` mechanism cannot be reliably set at provisioning time (to be validated in T09 Test TC-PID-01), an alternative is to create a site column with the project number value pre-set and associate it with the list. T08 §Validation specifies the test for this.

### 1.5 PID Indexing Requirement

Every G2 list's `pid` column must be indexed at list creation time. SharePoint supports column indexing via the `EnforceUniqueValues: false, Indexed: true` property. Without indexing, cross-list queries by `pid` will produce throttling errors on lists with >5,000 items (the SharePoint list view threshold).

The `IFieldDefinition` type must include an `indexed?: boolean` property. Step 4's list creation logic must read this property and set the index if `true`. G2 must verify this indexing step in T09.

---

## 2. Mandatory Metadata Fields

Every G2 workflow-family list must include the following fields in addition to workflow-specific fields:

| Field | InternalName | Type | Required | Description |
|-------|-------------|------|----------|-------------|
| Project ID | `pid` | Text | Yes | Project number (see §1) |
| Title | `Title` | Text | Yes | SharePoint built-in — repurposed as item title or record number |
| Status | `Status` | Choice | Yes | Workflow-specific choices (defined per list in T02–T06) |
| Created | (SharePoint built-in) | DateTime | Auto | SharePoint-managed creation timestamp |
| Modified | (SharePoint built-in) | DateTime | Auto | SharePoint-managed modification timestamp |
| Created By | (SharePoint built-in) | User | Auto | SharePoint-managed creator |

**Notes:**
- `Created`, `Modified`, and `Created By` are SharePoint system fields and do not need to be declared in `IListDefinition.fields[]`. They exist on every list automatically.
- `pid` and `Status` must be declared in `IListDefinition.fields[]` for every G2 list.
- The `Title` field is always present in SharePoint lists. For workflow-family lists, it is repurposed as a meaningful display name or record number (e.g., "JHA-001", "Buyout Item — Concrete"). T02–T06 specify how `Title` is used in each list.

---

## 3. Naming Conventions

### 3.1 List Title Conventions

All G2 list titles follow the pattern: `{WorkflowFamily} — {WorkflowName}` or, where the list name is self-evident and matches operational vocabulary, a plain descriptive name.

**Examples:**
- `Startup Checklist Items` (child list for startup checklist)
- `JHA Log` (parent list for JHA records)
- `JHA Steps` (child list for JHA steps)
- `Buyout Log` (financial family list)
- `Permit Log` (project controls family list)

**Rules:**
- Use sentence case (not ALL CAPS or Title Case With Every Word Capitalized)
- Use plain language matching operational vocabulary from the business artifacts
- Avoid SharePoint-style names like "List1" or developer-style names like "WorkflowInstanceLog"
- Maximum 50 characters for list title

### 3.2 Internal Field Name Conventions

Internal field names use PascalCase without spaces. They must be unique within a list.

**Examples:**
- `pid` (exception: lowercase per the `pid` contract)
- `StartDate`, `DueDate`, `CompletedDate`
- `AssignedTo`, `ReviewedBy`, `ApprovedBy`
- `Status`, `Priority`, `Category`
- `ParentRecord` (for lookup columns pointing to parent lists)

**Rules:**
- Never use spaces in internal field names (SharePoint encodes spaces as `_x0020_` which is unreadable)
- Never use reserved SharePoint internal names (e.g., `ID`, `Author`, `Editor`, `Created`, `Modified`)
- Use descriptive names that a developer could understand without documentation

### 3.3 Choice Field Conventions

Choice fields must use a defined, finite, and non-overlapping set of choices. The empty/blank choice is explicitly not allowed — every record must have a defined status.

**Standard status choice patterns:**
- Checklist items: `Open | In Progress | Complete | N/A`
- Log entries: `Open | In Progress | Closed`
- Approval workflows: `Pending | Submitted | Approved | Rejected`
- Financial records: `Pending | Active | Complete | On Hold`

T02–T06 use these patterns as defaults and may extend or restrict them based on operational requirements from the source artifacts.

---

## 4. Parent/Child Relationship Rules

### 4.1 When to Use Parent/Child

Use a parent/child structure when ALL of the following are true:
1. The workflow has a clear header record (a named instance of the workflow) that is distinct from its items
2. The header record has metadata that applies to the whole instance but not individual items (e.g., a JHA date, crew supervisor, project name)
3. The items form a repeating set under the header (e.g., job steps in a JHA, checklist items in a startup checklist)
4. The item count is variable and typically > 3 items per header

Use a flat list when:
- The workflow is a single-record-per-event log (e.g., a permit issued, an inspection result)
- Items don't group under a header
- The list is intended to capture status across a set of pre-defined items that don't vary (this can use a flat list with predefined item names seeded at provisioning time)

### 4.2 Parent/Child Implementation Pattern

**Parent list:** Contains the header record. Fields include: `pid`, `Title` (the header name/number), workflow-specific header fields, and a status field representing the overall workflow instance status.

**Child list:** Contains the repeating items. Fields include: `pid`, `ParentRecord` (a Lookup column pointing to the parent list's `ID` field), `Title` (the item name or step number), item-specific fields, and an item status field.

**Lookup column specification:**
```
InternalName:    ParentRecord
DisplayName:     Parent Record
Type:            Lookup
LookupListTitle: <parent list title>
LookupFieldName: ID
Required:        true
```

**Confirmed parent/child structures in G2:**

| Parent List | Child List | Owning Family |
|-------------|-----------|--------------|
| Startup Checklist | Startup Checklist Items | T02 — Startup |
| Estimating Kickoff | Kickoff Responsibility Items | T02 — Startup |
| Job Closeout Checklist | Closeout Checklist Items | T03 — Closeout |
| JHA Log | JHA Steps | T04 — Safety |
| JHA Log | JHA Attendees | T04 — Safety |
| Buyout Log | Buyout Line Items | T06 — Financial |

**Note on Punch List:** The core 8-list `Punch List` is a flat list (already in `HB_INTEL_LIST_DEFINITIONS`). The Closeout family (T03) introduces a `Punch List Batch` parent list that groups punch list items into named walkthroughs or batches. The core `Punch List` flat list remains the item-level record store. The `Punch List Batch` parent points to its items via a batch identifier cross-reference, not a SharePoint lookup (to avoid depending on two lists in two list families).

---

## 5. Workflow-Family Ownership Matrix

The table below defines the primary owning family for every workflow type in G2 scope. This table is the canonical reference for T02–T06.

### 5.1 Startup / Kickoff / Handoff (T02)

| Workflow | Primary Owner | Cross-Reference To |
|---------|--------------|-------------------|
| Job Startup Checklist | **T02 — Startup** | Project Controls (permit tasks), Safety (safety plan) |
| Estimating Kickoff / Responsibility Matrix | **T02 — Startup** | Financial (cost structure), Closeout (evaluation) |
| Procore Startup Setup | **T02 — Startup** | (reference file only — no cross-family data dependency) |
| Project Management Plan | **T02 — Startup** | (reference file only) |
| Internal Responsibility Matrix | **T02 — Startup** | (list only — role assignments; cross-referenced by all families by project) |

### 5.2 Closeout / Turnover / Punch (T03)

| Workflow | Primary Owner | Cross-Reference To |
|---------|--------------|-------------------|
| Job Closeout Checklist | **T03 — Closeout** | Financial (final payment), Project Controls (final inspections) |
| Turnover Package / O&M Manual Tracking | **T03 — Closeout** | (list only; file storage in `Closeout` folder of department library) |
| Punch List Batch / Walk Management | **T03 — Closeout** | Core `Punch List` list (item records live in core) |
| Subcontractor Evaluation | **T03 — Closeout** | Financial (subcontract records in T06) |
| Project Evaluation / Case Study | **T03 — Closeout** | (reference file only) |

### 5.3 Safety / JHA / Incident (T04)

| Workflow | Primary Owner | Cross-Reference To |
|---------|--------------|-------------------|
| JHA (Job Hazard Analysis) | **T04 — Safety** | (parent/child — see §4.2) |
| Incident Report | **T04 — Safety** | Core `Safety Log` list (observation/incident type) |
| Site Specific Safety Plan | **T04 — Safety** | (seed now — plan document + list header) |
| Toolbox Talks | **T04 — Safety** | (list only — date, topic, attendee count) |
| Weekly Site Walk | **T04 — Safety** | (list only — date, findings, corrective actions) |
| Subcontractor Safety Certifications | **T04 — Safety** | Financial family T06 (subcontractor identity) |

### 5.4 Project Controls / Permits / Inspections / Constraints (T05)

| Workflow | Primary Owner | Cross-Reference To |
|---------|--------------|-------------------|
| Permit Log | **T05 — Project Controls** | Startup (permit applications), Closeout (final inspections) |
| Required Inspections | **T05 — Project Controls** | Closeout (final inspection status) |
| Constraints Log | **T05 — Project Controls** | Schedule (3-week look-ahead context) |
| 3-Week Look-Ahead / Schedule | **T05 — Project Controls** | (reference file only / future feature target) |

### 5.5 Financial / Buyout / Forecast / Draw / Subcontract (T06)

| Workflow | Primary Owner | Cross-Reference To |
|---------|--------------|-------------------|
| Buyout Log | **T06 — Financial** | Startup (kickoff), Closeout (final subcontractor status) |
| Draw Schedule / Pay App | **T06 — Financial** | Closeout (final payment) |
| Financial Forecast | **T06 — Financial** | (list + seeded file) |
| Subcontract Checklist | **T06 — Financial** | Safety (subcontractor certifications), Closeout (evaluation) |
| GC-GR (General Condition - General Requirements) | **T06 — Financial** | (seed now — reference file) |

---

## 6. Seeded-File Classification Model

### 6.1 Four Classification States

| State | Definition | G2 Action |
|-------|-----------|-----------|
| **Seed now** | The workflow needs both a backing list (for future structured access) and a seeded template file (for current operational use during the transition period). | Create list in `list-definitions.ts` extension + create asset file + add to `template-file-manifest.ts` |
| **List only** | The workflow is sufficiently captured by a SharePoint list. No template file is operationally necessary. | Create list only |
| **Reference file only** | The workflow is too early-stage or too document-centric to benefit from a SharePoint list in Wave 0. A seeded template file in the document library is the appropriate G2 action. | Create asset file + add to `template-file-manifest.ts` |
| **Future feature target** | The workflow is recognized as relevant but neither a list nor a seeded file is appropriate in Wave 0. Log as a Wave 1 planning input. | No G2 provisioning action |

### 6.2 Classification Criteria

A workflow should be **Seed now** when:
- The operational team currently uses a file (Excel, Word, PDF) for this workflow
- A structured list is needed for Wave 1 features
- Running both in parallel during the transition period is operationally useful rather than confusing

A workflow should be **List only** when:
- No file-backed equivalent exists or is operationally expected
- The structured list is sufficient for operational use
- A seeded file would add no operational value

A workflow should be **Reference file only** when:
- The workflow is document-centric (a plan, a checklist form, a template report) and the structured data layer will be handled by a future integration (e.g., Procore)
- Creating a list would require Wave 1 features to be useful, and having an empty list would be confusing
- A working template file provides immediate operational value even in the absence of system integration

A workflow should be **Future feature target** when:
- The workflow depends on external system integration (Procore, schedule software) that is out of Wave 0 scope
- Creating a list or file would be premature without knowing the integration model
- The team does not use manual tracking for this workflow today

---

## 7. Source-of-Truth Transition Doctrine

### 7.1 Transition Model Definition

During the Wave 0 transition period:
- **File-backed workflows** (Excel, Word, PDF) remain the operational source of truth. The project team enters data into the file, not the SharePoint list.
- **List structures** are provisioned alongside the files as the structural foundation for future features. The list may be empty or partially populated during the transition period.
- **Transition ends** when a Wave 1 feature or admin process migrates the operational workflow onto the list. The file then becomes the archive/backup.

### 7.2 Coexistence Rules

A "Seed now" workflow must never have two concurrent operational sources of truth that teams are expected to keep synchronized. The rule is:
- The file is operational; the list is structural / pre-positioned
- The Wave 1 feature that activates the list is responsible for migration (within its sprint scope)
- G2 must not document the expectation that users manually enter data into both the file and the list

### 7.3 Conflict Resolution

If a G2 plan (T02–T06) wants to classify a workflow as "list only" but the operational team currently uses a file for that workflow, the plan must either:
- Reclassify as "seed now" to acknowledge the operational reality, or
- Document a specific reason why the file-to-list migration will happen immediately at Wave 0 rollout without a file bridge

Unresolved conflicts between list-only classification and operational file use must be called out as known risks in the relevant T02–T06 plan.

---

## 8. IListDefinition Extension Requirements

Group 2 requires the following additions to the `IListDefinition` / `IFieldDefinition` types in `backend/functions/src/services/sharepoint-service.ts` and aligned in `@hbc/models`:

### 8.1 Required Type Additions

```typescript
// Addition to IFieldDefinition
export interface IFieldDefinition {
  internalName: string;
  displayName: string;
  type: 'Text' | 'Number' | 'DateTime' | 'Boolean' | 'Choice' | 'User' | 'Lookup' | 'MultiLineText' | 'URL';
  required?: boolean;
  choices?: string[];         // already present for Choice type
  defaultValue?: string;      // NEW: for pid default value and other defaults
  indexed?: boolean;          // NEW: for pid indexing requirement
  // Lookup-type fields:
  lookupListTitle?: string;   // NEW: SharePoint list title to look up against
  lookupFieldName?: string;   // NEW: Field name in the lookup list (typically 'ID')
}
```

These additions must be implemented as part of the Project Setup T02 model contract process before Step 4 can activate G2 list provisioning with `pid` defaults and indexing.

### 8.2 Deployment of Type Changes

The implementation path for these type additions is:
1. T07 documents the required additions
2. Project Setup T02 (or a G2-specific amendment) adds the types to `IFieldDefinition` in `packages/models`
3. `SharePointService.createDataLists()` is extended to read `defaultValue`, `indexed`, `lookupListTitle`, and `lookupFieldName` and apply them via PnPjs
4. T09 validates that the new type properties are used correctly in all G2 list definitions

---

## 9. Reference Document Requirements

T01 must produce the following reference documents as its primary artifacts:

**`docs/reference/data-model/pid-contract.md`:** The complete `pid` field specification including type, format, alignment with `projectNumber`, indexing requirement, default value mechanism, and validation criteria.

**`docs/reference/data-model/workflow-list-schemas.md`:** The consolidated schema reference for all G2 lists — all fields in every list across all five families. This document is the implementation reference for Wave 1 app teams building features against the lists.

**`docs/reference/data-model/workflow-family-map.md`:** The complete ownership matrix (§5 above) plus a summary of cross-family reference patterns.

All three documents must be added to `current-state-map.md §2` as "Reference" documents.

---

## 10. Acceptance Criteria

- [ ] `pid` field contract is fully specified: InternalName, DisplayName, Type, Required, MaxLength, IndexedRequired, DefaultValue mechanism, alignment with `projectNumber`
- [ ] `pid` alignment question is resolved: T01 locked recommendation is `projectNumber`; if the product owner selects a different identifier, the plan is amended before T07 implementation begins
- [ ] Mandatory metadata fields are defined: `pid`, `Title`, `Status` are confirmed required on all G2 lists
- [ ] Naming conventions are documented: list titles, internal field names, display names, choice sets
- [ ] Parent/child governance rules are documented with specific criteria and examples
- [ ] All confirmed parent/child structures are listed with their parent list, child list, and lookup column pattern
- [ ] Workflow-family ownership matrix is complete for all five families
- [ ] Seeded-file four-state classification model is defined with criteria for each state
- [ ] Source-of-truth transition doctrine is documented
- [ ] `IListDefinition` / `IFieldDefinition` type extension requirements are specified
- [ ] Three reference documents are planned for creation during T07 and T09 execution
- [ ] No T02–T06 plan has finalized a schema that contradicts T01 standards
- [ ] Downstream G1 T01 constraint confirmed: G2 does not add `pid` to the 8 core lists

---

## 11. Known Risks and Pitfalls

**Risk T01-R1: `pid` default value mechanism may require PnPjs version verification.** Setting a default column value at list creation time requires PnPjs to pass `DefaultValue` in the field schema. If the version of PnPjs in the project does not support this, the fallback (calculated column or post-creation update) must be used. T09 Test TC-PID-01 validates this before Step 4 is deployed.

**Risk T01-R2: Lookup columns for parent/child structures are more complex to provision than simple fields.** SharePoint lookup columns require the target list to exist before the lookup column is created. This creates a provisioning order dependency: parent lists must be created before child lists. Step 4's list creation loop (in `createDataLists`) must be ordered to create parent lists first. T07 must specify this ordering.

**Risk T01-R3: Scope creep in T02–T06 may introduce more lists than G2-R1 (timeout risk) can accommodate.** If the total list count from T02–T06 schemas exceeds the safe provisioning threshold, T01 must provide guidance on which lists are highest priority and which can be deferred. T01 should define a maximum list count for Wave 0 provisioning (suggested: 30 total, including the 8 core lists). This threshold must be validated against staging duration tests in T09.

**Risk T01-R4: Inconsistent Status choice sets across families create confusion.** If T02 uses "Open / Complete" and T04 uses "Open / Closed" for what are effectively the same statuses, Wave 1 aggregation queries will fail. T01 §3.3 defines standard choice patterns. T02–T06 must use these patterns unless a workflow-specific reason requires deviation.

---

## Follow-On Consumers

- **T02–T06:** All workflow-family data model plans consume T01's standards directly. Any field schema that does not comply with T01 must be revised.
- **T07:** T07's provisioning implementation is constrained by T01's `IListDefinition` extension requirements and parent/child ordering rules.
- **T08:** T08's validation rules reference T01's `pid` indexing requirement, default value mechanism, and mandatory field set.
- **T09:** T09's test cases reference T01's `pid` contract validation, field name conventions, and parent/child implementation patterns.
- **Wave 1 app teams:** The reference documents produced by T01 are the primary schema reference for all Wave 1 features that read from or write to G2 lists.

---

*End of W0-G2-T01 — Shared List Schema Standards and PID Contract v1.0*
