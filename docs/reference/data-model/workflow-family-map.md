# Workflow-Family Ownership Map — G2

> **Doc Classification:** Living Reference (Diátaxis) — Reference quadrant; data model audience; workflow-family ownership matrix and parent/child structures for all Wave 0 Group 2 lists.

**Source:** W0-G2-T01 — Shared List Schema Standards and PID Contract (§4–§5)
**Consumers:** T02–T06 (workflow-family schemas), T07 (provisioning ordering), Wave 1 app teams

---

## Five-Family Ownership Matrix

### T02 — Startup / Kickoff / Handoff

| Workflow | Primary Owner | Cross-Reference To |
|---------|--------------|-------------------|
| Job Startup Checklist | **T02** | Project Controls (permit tasks), Safety (safety plan) |
| Estimating Kickoff / Responsibility Matrix | **T02** | Financial (cost structure), Closeout (evaluation) |
| Procore Startup Setup | **T02** | (reference file only — no cross-family data dependency) |
| Project Management Plan | **T02** | (reference file only) |
| Internal Responsibility Matrix | **T02** | (list only — role assignments; cross-referenced by all families by project) |

### T03 — Closeout / Turnover / Punch

| Workflow | Primary Owner | Cross-Reference To |
|---------|--------------|-------------------|
| Job Closeout Checklist | **T03** | Financial (final payment), Project Controls (final inspections) |
| Turnover Package / O&M Manual Tracking | **T03** | (list only; file storage in `Closeout` folder) |
| Punch List Batch / Walk Management | **T03** | Core `Punch List` list (item records live in core) |
| Subcontractor Evaluation | **T03** | Financial (subcontract records in T06) |
| Project Evaluation / Case Study | **T03** | (reference file only) |

### T04 — Safety / JHA / Incident

| Workflow | Primary Owner | Cross-Reference To |
|---------|--------------|-------------------|
| JHA (Job Hazard Analysis) | **T04** | (parent/child — see Parent/Child Pairs) |
| Incident Report | **T04** | Core `Safety Log` list (observation/incident type) |
| Site Specific Safety Plan | **T04** | (seed now — plan document + list header) |
| Toolbox Talks | **T04** | (list only — date, topic, attendee count) |
| Weekly Site Walk | **T04** | (list only — date, findings, corrective actions) |
| Subcontractor Safety Certifications | **T04** | Financial family T06 (subcontractor identity) |

### T05 — Project Controls / Permits / Inspections / Constraints

| Workflow | Primary Owner | Cross-Reference To |
|---------|--------------|-------------------|
| Permit Log | **T05** | Startup (permit applications), Closeout (final inspections) |
| Required Inspections | **T05** | Closeout (final inspection status) |
| Constraints Log | **T05** | Schedule (3-week look-ahead context) |
| 3-Week Look-Ahead / Schedule | **T05** | (reference file only / future feature target) |

### T06 — Financial / Buyout / Forecast / Draw / Subcontract

| Workflow | Primary Owner | Cross-Reference To |
|---------|--------------|-------------------|
| Buyout Log | **T06** | Startup (kickoff), Closeout (final subcontractor status) |
| Draw Schedule / Pay App | **T06** | Closeout (final payment) |
| Financial Forecast | **T06** | (list + seeded file) |
| Subcontract Checklist | **T06** | Safety (subcontractor certifications), Closeout (evaluation) |
| GC-GR (General Condition - General Requirements) | **T06** | (seed now — reference file) |

---

## Confirmed Parent/Child Pairs

| Parent List | Child List | Owning Family | Lookup Column |
|-------------|-----------|--------------|---------------|
| Startup Checklist | Startup Checklist Items | T02 — Startup | `ParentRecord` → Parent `ID` |
| Estimating Kickoff | Kickoff Responsibility Items | T02 — Startup | `ParentRecord` → Parent `ID` |
| Job Closeout Checklist | Closeout Checklist Items | T03 — Closeout | `ParentRecord` → Parent `ID` |
| JHA Log | JHA Steps | T04 — Safety | `ParentRecord` → Parent `ID` |
| JHA Log | JHA Attendees | T04 — Safety | `ParentRecord` → Parent `ID` |
| Buyout Log | Buyout Line Items | T06 — Financial | `ParentRecord` → Parent `ID` |

**Lookup column specification:**
- InternalName: `ParentRecord`
- Type: `Lookup`
- LookupFieldName: `ID`
- Required: `true`
- Parent lists must have a lower `provisioningOrder` than their child lists

---

## Cross-Family Reference Pattern

Cross-family references use `pid` as the join key, **not** cross-family Lookup columns. This avoids:
- Tight coupling between list families at the SharePoint schema level
- Provisioning order dependencies across families
- Fragile relationships that break if one family's lists are reprovisioned

**Rule:** A list may only contain Lookup columns to lists within the same family. Cross-family data access uses `pid`-based queries at the application layer.

---

*End of Workflow-Family Ownership Map v1.0*
