# P3-E9-T01 — Reports: Scope, Operating Model, and Family Typology

**Module:** P3-E9 Reports
**Governing contract:** P3-F1 — Reports Workspace / Definition / Run / Release Contract Package
**Locked decisions driving this file:** LD-REP-01, LD-REP-02, LD-REP-03, LD-REP-04, LD-REP-08, LD-REP-12

---

## 1. Module Boundary

### 1.1 What Reports Owns

Reports is the governed report-production and distribution architecture for a project. It owns:

- **The corporate template library** — the set of approved report family definitions, section schemas, allowed content types, approval/release class configuration, and audience governance. MOE/Admin owns template library governance.
- **Project family registrations** — a project's activated set of report families, including any project-level configuration overlays within template-permitted bounds. PE owns project-level activation.
- **Draft configuration state** — PM-owned working configuration for a project family, including narrative-only section content, pending structural customizations, and staleness tracking.
- **The run ledger** — the immutable record of all report generation runs, approval actions, release events, and distribution metadata for a project.
- **Artifact provenance** — the association between a run and the exact module snapshots consumed at generation time.
- **The PDF production pipeline** — asynchronous queued generation, rendered artifact storage in SharePoint, and artifact URL tracking.
- **Spine publication** — Activity events, Health metric (report currency), Work Queue items, and Related Items for report lifecycle events.
- **Enforcement of the central project-governance policy record** — Reports reads and enforces effective policy; it does not own it (P3-F1 §14.6).

### 1.2 What Reports Does NOT Own

- **Source-of-truth data from originating modules.** Reports assembles reports from immutable snapshots; it does not hold or re-derive module source data.
- **Sub-scorecard operational data** (subcontractor evaluations, criterion scores, section scores, performance ratings). This is owned by P3-E10 (Project Closeout). Reports ingests a completed Closeout-generated snapshot.
- **Lessons-learned operational data** (lesson entries, categories, impact ratings, keywords, aggregation rows). Also owned by P3-E10. Reports ingests a completed Closeout-generated snapshot.
- **The central project-governance policy record.** Owned by MOE (global floor) and PE (project overlay). Reports enforces it only.
- **Field annotations / review layer.** Owned by `@hbc/field-annotations`. Reports surfaces the annotation attachment point but does not own annotation data.

### 1.3 Module Classification

- **Module type:** Governed reporting and distribution architecture
- **Review-capable surface:** Yes — PER may view report runs, annotate, and generate reviewer-generated runs (P3-E1 §9.1)
- **Source-of-truth class:** Reports is source-of-truth for its run ledger, draft configuration state, and artifact provenance. It is NOT source-of-truth for the data content of generated reports.
- **Mutation authority:** PM (draft editing, narrative), PE (activation, approval, review chain), PER (reviewer-generated runs, annotations), MOE/Admin (global governance), API layer enforces all constraints.

---

## 2. Operating Model

### 2.1 Core Principle

Reports operates as a **governed assembly architecture**. It does not hold the data it reports on. Instead, at generation time it:

1. Reads the latest confirmed PM draft configuration for the requested family.
2. Resolves all required module snapshot sources as specified by the family's section definitions.
3. Requests and receives immutable module snapshots from each source module's snapshot API.
4. Assembles the report artifact from snapshot data, approved rollup calculations, and PM-authored narrative sections.
5. Queues PDF generation, stores the rendered artifact in SharePoint, and records the run in the ledger.

This architecture guarantees that every run is traceable to specific snapshot versions of source data, making report provenance auditable and artifact content immutable after generation.

### 2.2 Authority Model

| Role | Authority |
|------|-----------|
| **MOE / Admin** | Owns corporate template library; defines global governance floor; governs template promotion; sets global policy floor |
| **Project Executive (PE)** | Activates project families; approves project-level structural customizations; approves PX Review runs; approves class changes; sets project-level governance overlay (may tighten, not loosen global floor) |
| **Project Manager (PM)** | Configures draft state; authors narrative sections; initiates generation runs; manages draft refresh |
| **Portfolio Executive Reviewer (PER)** | Views all report runs in scope; places field annotations; generates reviewer-generated runs against confirmed PM snapshots; may release families where `perReleaseAuthority = 'per-permitted'` |
| **Superintendent / Field** | No direct Reports authority; consumes published report artifacts through Project Hub |

### 2.3 Configuration Version Model

Report family configuration for a project exists in two states:

- **Draft configuration:** PM-editable working state. Structural customizations pending PE approval exist here. Draft configuration drives what a new generation run will produce.
- **Active configuration:** PE-activated state. Immutable once activated. All generation runs reference the active configuration version in effect at generation time.

Post-activation structural changes (adding/removing sections, changing section types) create a new draft configuration version requiring PE re-approval before becoming active (LD-REP-07). Non-structural changes (narrative edits, section ordering within approved schema) do not require PE re-approval.

### 2.4 Report Definition Registry

The report-definition registry is the single source of truth for registered report families. It is a governed data store, not a code constant. Each registered family has:

- A unique `familyKey` (e.g., `'px-review'`, `'owner-report'`)
- A family type classification (see §3)
- Section definitions (content type, source module reference, narrative flag)
- Approval/release class configuration
- Audience/distribution class configuration
- `approvalGated` flag
- `perReleaseAuthority` setting
- `staleness ThresholdDays` (default: 7)

The registry is extensible. Existing family definitions are immutable post-activation; structural changes require the version workflow described in §2.3.

---

## 3. Report Family Taxonomy

### 3.1 Family Types

| Type | Description | Examples |
|------|-------------|---------|
| **Native — Corporate Locked** | Defined and maintained by MOE; structure is locked; no project-level structural override permitted | `px-review` |
| **Native — Corporate Configurable** | Defined by MOE with governed customization zones; projects may configure within template bounds | `owner-report` |
| **Integration-Driven Artifact** | Family definition is governed by Reports; source data is fully owned by another module; Reports assembles but does not originate | `sub-scorecard` (E10), `lessons-learned` (E10) |
| **Project Extension** | Project-specific family added by PM and PE-activated; follows corporate extension template guardrails; may be promoted to corporate template via MOE | Future — not required for Phase 3 |

### 3.2 Phase 3 Registered Families

| Family Key | Type | Approval-Gated | PER Release Authority | Owning Source |
|------------|------|---------------|----------------------|---------------|
| `px-review` | Native — Corporate Locked | **Yes** — PE approval required | `'pe-only'` | Reports (native) |
| `owner-report` | Native — Corporate Configurable | **No** — non-gated release | `'per-permitted'` or `'pe-only'` per project policy | Reports (native) |
| `sub-scorecard` | Integration-Driven Artifact | **No** — non-gated (generated internally) | `'pe-only'` | P3-E10 (Closeout) |
| `lessons-learned` | Integration-Driven Artifact | **No** — non-gated (generated internally) | `'pe-only'` | P3-E10 (Closeout) |

### 3.3 PX Review — Locked Corporate Template

The PX Review (`px-review`) family is a locked corporate template. Key constraints:

- MOE is the only authority that may modify its structure, section definitions, or approval class configuration.
- No project may override PX Review structure, section list, or approval gate.
- PE approval is required before a PX Review run transitions from `generated` to `approved`.
- Once approved, the run transitions to `released` for distribution.
- PM↔PE internal review chain may be configured to block PX Review approval until the chain completes (P3-F1 §14.5).

### 3.4 Owner Report — Corporate Configurable

The Owner Report (`owner-report`) family has a corporate base configuration with governed customization zones:

- Projects may configure narrative sections within the allowed schema.
- No approval gate. Status transitions directly from `generated` to `released`.
- External-facing — template specifies which audience/distribution classes are permitted.
- PM↔PE internal review chain may be bypassed for Owner Report only when `bypassInternalReviewChainForOwnerReport: true` is explicitly set in project governance policy (default: `false`).

### 3.5 Integration-Driven Artifact Families

Sub-scorecard and lessons-learned families:

- Reports owns the family definition (section schema, assembly rules, release configuration).
- P3-E10 owns all source data. Reports ingests a Closeout-generated, PE-confirmed snapshot at generation time.
- These families are not generated from PM-initiated draft refreshes in the normal sense. Generation is triggered at project closeout, per subcontractor (for sub-scorecard) or per project (for lessons-learned).
- Scoring formulas (sub-scorecard section averages, overall weighted score, performance rating derivation) are executed by P3-E10 at source data entry time, not by Reports at generation time.
- Reports assembles the scored, confirmed snapshot data into a governed PDF artifact.

---

## 4. Operating Principles

### 4.1 Snapshot Immutability

Once a module snapshot is consumed by a generation run and the run transitions out of `queued` status, the snapshot association is immutable. The run artifact permanently references the snapshot versions used.

### 4.2 Narrative Ownership

PM narrative sections (text-only, as defined in T06) are authored by the PM and preserved across draft refreshes. Refreshing a draft updates module-snapshot-sourced sections; it does not overwrite PM narrative. PM narrative is exclusively PM/PE-authored — PER has no authority over narrative content.

### 4.3 No Project-Authored Data Bindings

PM-authored content is restricted to narrative-only sections (free text, rich text). Projects may not introduce custom data bindings, formula overrides, or calculated fields. All data in generated reports flows from approved source-module snapshots or MOE-approved rollup calculations. (LD-REP-08)

### 4.4 Policy Enforcement Without Ownership

Reports reads the effective project-governance policy record (merged global floor + project overlay) and enforces it. It does not store, own, or modify the policy record. If the policy changes, the next generation run or status transition respects the new effective policy automatically.

### 4.5 PER as Consumer, Not Author

The PER role is a read-and-review consumer of Reports. PER:
- reads all report runs in governed scope,
- annotates using the `@hbc/field-annotations` review layer,
- generates reviewer-generated runs against confirmed PM snapshots (not unconfirmed drafts),
- may release families where `perReleaseAuthority = 'per-permitted'` per effective policy.

PER may not write to PM draft state, PM narrative, run-ledger entries, or the PM↔PE review chain under any circumstances.
