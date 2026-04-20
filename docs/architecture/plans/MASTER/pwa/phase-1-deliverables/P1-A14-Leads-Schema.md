# P1-A14: Leads & Pipeline Schema

**Document ID:** P1-A14
**Phase:** 1 (Foundation)
**Classification:** Internal — Engineering
**Status:** Draft
**Date:** 2026-03-17
**Read With:** [P1-A1-Data-Ownership-Matrix.md](./P1-A1-Data-Ownership-Matrix.md), [P1-A2-Source-of-Record-Register.md](./P1-A2-Source-of-Record-Register.md), [P1-A3-SharePoint-Lists-Libraries-Schema-Register.md](./P1-A3-SharePoint-Lists-Libraries-Schema-Register.md)

---

## Purpose

Define the canonical schema for market leads (individual business development opportunities) and pipeline snapshots (division-level portfolio health summaries). These two related concerns serve the sales/business development workflow — leads capture individual opportunities sourced from public procurement portals, data services, and market intelligence; pipeline snapshots capture periodic aggregate views of division pipeline health across stages.

---

## Relationship to P1-A1 / P1-A2 / P1-A3

| Artifact | Relationship |
|----------|-------------|
| **P1-A1** | The `leads` domain in P1-A1 is the governance-level home for lead data. P1-A1 references leads in the domain register but does not yet have field-level definitions. This schema establishes the canonical entity model. |
| **P1-A2** | Lead and pipeline data follows P1-A2 adapter patterns for SharePoint persistence. |
| **P1-A3** | P1-A3 defines the SharePoint lists that store lead and pipeline records on the Sales/BD site. |

---

## Scope and Non-Scope

### In Scope
- Market lead canonical schema (primary transactional entity)
- Market lead tags as normalized child records
- Pipeline snapshot schema (division-level aggregate analytics entity)
- Person attribution for matched BD representative
- Import batch / provenance tracking
- Storage-boundary alignment

### Out of Scope
- Lead-to-project conversion workflow (Phase 2)
- AI/ML confidence scoring model and recomputation logic (Phase 2+)
- Lead source reference dictionary governance (P1-A5 extension, Phase 1 late)
- Sector/region dictionary reconciliation with A5 shared dictionaries (deferred)
- Pipeline snapshot automation / periodic capture (Phase 2)
- Full bid/proposal tracking (future domain extension)
- SharePoint physical container definitions (P1-A3)

---

## Source File Analysis

### Market Leads Source

**File:** `docs/reference/example/marketLeads.json`

| Property | Value |
|----------|-------|
| Format | JSON array of lead objects |
| Total records | 20 |
| ID format | Sequential string ("1", "2", ..., "20") |
| `id` uniqueness | Unique within file |

**Fields:**

| Field | Type | Unique? | Purpose |
|-------|------|---------|---------|
| `id` | string | Yes (within file) | Sequential source identifier |
| `source` | string | No | Lead source name (e.g., "Palm Beach County RFQ", "ConstructConnect") |
| `leadTitle` | string | No | Opportunity title |
| `sector` | string | No | Market sector (e.g., "Healthcare", "Transportation", "Education") |
| `region` | string | No | Geographic region (e.g., "Tampa Bay", "Palm Beach County") |
| `deadline` | datetime | No | Response/submission deadline |
| `link` | string | No | Source URL for the opportunity listing |
| `confidenceScore` | number | No | AI/match confidence score (0–100 scale) |
| `matchedRep` | string | No | Matched BD representative display name |
| `estimatedValue` | number | No | Estimated project value (USD) |
| `description` | string | No | Opportunity description |
| `tags` | string[] | No | Classification tags (e.g., ["Government", "Renovation", "Public Safety"]) |

**Key findings:**

| Finding | Detail |
|---------|--------|
| Source ID is sequential | Not globally unique; treated as source-specific |
| `source` has ~15 distinct values | Lead sources include procurement portals, data services, industry networks |
| `sector` has ~10 distinct values | Market sectors; may overlap with A5 shared sector dictionary |
| `region` is geographic | Florida-centric; company-specific region names |
| `tags` is multi-value | 2–4 tags per lead; ~25 distinct values across dataset |
| `matchedRep` is display-only | Person name without identity resolution |
| `confidenceScore` range | 76–95 in sample |
| `link` is external URL | Points to procurement portals or project listing services |

### Pipeline Source

**File:** `docs/reference/example/pipeline.json`

| Property | Value |
|----------|-------|
| Format | JSON array of pipeline summary objects |
| Total records | 22 |
| ID format | `project-pipeline-{N}` |
| `id` uniqueness | Globally unique |

**Fields:**

| Field | Type | Unique? | Purpose |
|-------|------|---------|---------|
| `id` | string | Yes | Source pipeline identifier (e.g., `project-pipeline-1`) |
| `division` | string | No | Business division (Residential, Commercial) |
| `title` | string | No | Pipeline display title |
| `size` | string | No | Pipeline size: small, medium, large |
| `config.pipelineValue` | number | No | Total pipeline dollar value |
| `config.probabilityWeighted` | number | No | Probability-weighted pipeline value |
| `config.stages[]` | array | — | Stage breakdown: stage name, count, value, probability |
| `config.recentWins[]` | array | — | Recent wins: name, value, division |
| `config.recentLosses[]` | array | — | Recent losses: name, value, division |
| `location.city` | string | No | City |
| `location.state` | string | No | State |
| `location.zip` | string | No | ZIP code |
| `type` | string | No | Construction type (tunnel form, wood frame, masonry, curtain wall, remodel, renovation, etc.) |
| `anticipated_start` | date | No | Anticipated project start date |
| `duration` | number | No | Duration in calendar days |

**Stage values (4):** Lead (25% probability), Proposal (60%), Negotiation (80%), Award (95%)

**Key findings:**

| Finding | Detail |
|---------|--------|
| Each record is a **division pipeline summary** | Not individual leads; portfolio-level aggregate |
| `stages` is aggregate data | Count + total value per stage; not individual opportunity records |
| `recentWins`/`recentLosses` are snapshots | Lightweight name + value + division; not full project records |
| `division` has 2 values | Residential, Commercial |
| `size` has 3 values | small, medium, large |
| `type` has ~8 values | Construction type classification |
| Location is FL-centric | All records are Florida locations |

---

## Canonical Entity Model

### Entity Summary

| # | Entity | Purpose | Source |
|---|--------|---------|--------|
| 1 | `market_lead` | Individual market lead/opportunity record | marketLeads.json |
| 2 | `market_lead_tag` | Normalized classification tag for a market lead | marketLeads.json `tags[]` |
| 3 | `pipeline_snapshot` | Division-level pipeline health snapshot with aggregate stage/outcome data | pipeline.json |
| 4 | `lead_import_batch` | Import provenance tracking | Platform operational |
| 5 | `lead_import_finding` | Validation findings | Platform operational |

### market_lead

The primary market lead record. One row per identified business development opportunity.

| Field | Type | Required | Key | Description |
|-------|------|----------|-----|-------------|
| lead_id | string | Yes | PK (surrogate) | HB Intel canonical lead identifier |
| batch_id | string | No | FK | FK to lead_import_batch (null for user-entered leads) |
| source_lead_id | string | No | — | Original source `id` field (preserved for import traceability) |
| lead_title | string | Yes | — | Opportunity title |
| lead_source | string | No | — | Source name (e.g., "ConstructConnect", "Palm Beach County RFQ") |
| lead_source_url | string | No | — | External URL for the opportunity listing |
| sector | string | No | — | Market sector classification |
| region | string | No | — | Geographic region |
| deadline | datetime | No | — | Response/submission deadline |
| confidence_score | number | No | — | AI/match confidence score (0–100); stored as-is from source |
| estimated_value | number | No | — | Estimated project value (USD) |
| matched_rep_display | string | No | — | Matched BD representative display name (raw from source; always preserved) |
| matched_rep_key | string | No | — | Stable person identity (Class G: UPN when resolved via Entra ID); nullable if unresolved |
| description | text | No | — | Opportunity description |
| tags_raw | text | No | — | Raw JSON array of tags (preserved for source fidelity) |
| lead_status | string | No | — | Lead lifecycle status (new, reviewing, pursuing, won, lost, deferred); nullable until workflow defined |
| is_active | boolean | Yes | — | Whether the lead is currently active |
| created_at | datetime | Yes | — | Record creation timestamp |
| updated_at | datetime | Yes | — | Last modification timestamp |
| created_by | string | No | — | Creator identity (UPN) |
| notes | text | No | — | Implementation or processing notes |

### market_lead_tag

Normalized classification tags for market leads. Follows the same pattern as `permit_tag` (P1-A9).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| tag_id | string | Yes | Tag record identifier |
| lead_id | string | Yes | FK to market_lead |
| tag_value | string | Yes | Normalized tag value (lowercase, trimmed) |
| raw_tag_value | string | No | Original source tag value |

### pipeline_snapshot

A point-in-time snapshot of division pipeline health. Each record captures aggregate pipeline data for a division at a specific import date. Nested structures (stages, recent wins/losses) are stored as JSON text — they are analytics summary data, not individually managed records.

| Field | Type | Required | Key | Description |
|-------|------|----------|-----|-------------|
| snapshot_id | string | Yes | PK (surrogate) | HB Intel canonical snapshot identifier |
| batch_id | string | No | FK | FK to lead_import_batch |
| source_pipeline_id | string | No | — | Original source `id` field (e.g., `project-pipeline-1`) |
| division | string | Yes | NK | Business division (e.g., Residential, Commercial) |
| snapshot_date | date | Yes | NK | Date this snapshot was captured; `(division, snapshot_date)` forms natural key |
| title | string | No | — | Pipeline display title |
| size | string | No | — | Pipeline size classification: small, medium, large |
| pipeline_value | number | No | — | Total pipeline dollar value |
| probability_weighted_value | number | No | — | Probability-weighted pipeline value |
| stages_json | text | No | — | JSON array of stage breakdowns: `[{stage, count, value, probability}]` |
| recent_wins_json | text | No | — | JSON array of recent wins: `[{name, value, division}]` |
| recent_losses_json | text | No | — | JSON array of recent losses: `[{name, value, division}]` |
| location_city | string | No | — | City |
| location_state | string | No | — | State |
| location_zip | string | No | — | ZIP code |
| construction_type | string | No | — | Construction type classification |
| anticipated_start | date | No | — | Anticipated project start date |
| duration_days | number | No | — | Duration in calendar days |
| is_current | boolean | Yes | — | Whether this is the most recent snapshot for the division (managed by import service) |
| created_at | datetime | Yes | — | Record creation timestamp |
| notes | text | No | — | Implementation notes |

### lead_import_batch

Tracks each lead/pipeline import operation for provenance.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| batch_id | string | Yes | Import batch identifier |
| source_type | string | Yes | Source type: `market_leads`, `pipeline_snapshot` |
| source_system | string | Yes | Source system name |
| source_file_name | string | Yes | Original file name |
| import_status | string | Yes | pending, parsing, complete, failed |
| total_records_imported | number | No | Records processed |
| total_records_excluded | number | No | Excluded/invalid rows |
| total_warnings | number | No | Non-fatal findings |
| total_errors | number | No | Fatal findings |
| uploaded_by | string | Yes | Uploader identity (UPN) |
| uploaded_at | datetime | Yes | Upload timestamp |
| completed_at | datetime | No | Processing completion timestamp |
| parser_version | string | No | Parser version used |
| notes | text | No | Import notes |

### lead_import_finding

Validation findings from lead/pipeline import.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| finding_id | string | Yes | Finding identifier |
| batch_id | string | Yes | FK to lead_import_batch |
| severity | string | Yes | error, warning, info |
| category | string | Yes | parse_error, validation_failure, mapping_warning |
| entity_type | string | No | market_lead, pipeline_snapshot, tag |
| message | string | Yes | Human-readable description |

---

### Keying and Uniqueness Rules

| Rule | Decision |
|------|----------|
| **Market lead PK** | `lead_id` (surrogate, system-generated) |
| **Market lead source identity** | `source_lead_id` preserved for import traceability; not globally unique |
| **Market lead natural key** | None enforced — leads from different sources may describe the same opportunity; deduplication is a future concern |
| **Pipeline snapshot PK** | `snapshot_id` (surrogate) |
| **Pipeline snapshot natural key** | `(division, snapshot_date)` — one snapshot per division per import date |
| **Repeat import handling** | Market leads: each import creates new records (no upsert by default); Pipeline: same `(division, snapshot_date)` supersedes prior snapshot |

---

### Identity Class Alignment (Frozen)

Each A14 entity maps to a frozen identity class from the [P1-A2 Identity Strategy Freeze](./P1-A2-Source-of-Record-Register.md).

| Entity | Identity Class | Identity Key | Notes |
|--------|---------------|-------------|-------|
| `market_lead` | B (SP-backed business record) | `lead_id` (surrogate) | `source_lead_id` preserved; no raw SP numeric IDs exposed |
| `market_lead_tag` | D (child record) | `tag_id` (surrogate); FK `lead_id` | `tag_value` normalized; `raw_tag_value` preserved |
| `pipeline_snapshot` | B (SP-backed business record) | `snapshot_id` (surrogate); `(division, snapshot_date)` natural key | `source_pipeline_id` preserved; immutable once imported |
| `lead_import_batch` | E (import-batch) | `batch_id` (surrogate, system-generated) | `source_file_name` is metadata, not identity |
| `lead_import_finding` | J (findings/audit) | `finding_id` (surrogate); batch-scoped | Append-only; immutable once logged |

### Person Attribution (Frozen)

The `matched_rep_display` / `matched_rep_key` pair follows the frozen **Class G (Person-attribution)** pattern:

| Rule | Decision |
|------|----------|
| **Display preservation** | `matched_rep_display` stores the raw person name from source. Always preserved. Never a join key. |
| **Stable identity** | `matched_rep_key` stores UPN when the person is an Entra ID-resolved user. |
| **Nullable if unresolved** | `matched_rep_key` remains `null` when the person cannot be matched. No synthetic IDs. |
| **Resolution ownership** | Adapter/import layer owns resolution via Entra ID lookup. |

---

### Tags Strategy

Follows the same pattern as `permit_tag` (P1-A9):

| Aspect | Rule |
|--------|------|
| **Normalized values** | Each tag becomes a `market_lead_tag` child record with lowercase-normalized `tag_value` |
| **Raw preservation** | `tags_raw` on `market_lead` preserves the original JSON array; `raw_tag_value` on each tag record |
| **Duplicate handling** | Deduplicate within a lead; log finding if duplicates detected |
| **Dictionary candidate** | ~25 tag values should become a governed dictionary in P1-A5 when the set stabilizes |

---

### Pipeline Snapshot Strategy (Flattened Aggregate)

**Decision:** Nested `stages[]`, `recentWins[]`, and `recentLosses[]` arrays are stored as JSON text fields on `pipeline_snapshot` — **not** modeled as first-class child entities.

**Rationale:**
1. Stage/win/loss breakdowns are aggregate analytics snapshots, not individually managed business records
2. They change wholesale on each import — no individual record lifecycle
3. They are not independently queried, edited, or referenced by other domains
4. Modeling them as child entities would add significant schema complexity without business value
5. Dashboard rendering can parse the JSON directly; analytics queries can extract values from JSON if needed

**Future extension:** If business requirements emerge for individual stage tracking, win/loss linkage to projects, or cross-snapshot stage trending, these structures can be promoted to child entities in a future version without breaking the parent schema.

---

### Search / Analytics / Reporting Role

| Role | Treatment |
|------|-----------|
| **Search indexed?** | Yes — lead_title, description, lead_source, sector, region, tags |
| **Search role** | `lead_title`: Keyword Content; `description`: Keyword Content; `sector`: Facet / Filter; `region`: Facet / Filter; `lead_source`: Facet / Filter; `lead_status`: Facet / Filter; tag values: Facet / Filter; `confidence_score`: Sort / Range Filter |
| **Analytics included?** | Yes — BD pipeline and market intelligence |
| **Analytics role** | Operational Reporting (lead funnel, conversion rates, source effectiveness); Portfolio / Cross-Project Analytics (pipeline value by division/stage, win/loss trends, confidence distribution) |
| **Dashboard use** | Active leads by sector/region, pipeline value by division, confidence distribution, deadline calendar, win/loss trends |
| **AI context** | Market leads and pipeline data provide context for opportunity scoring and BD strategy |

---

### Storage Boundary Alignment

| Data | Storage | Authority | P1-A1/A2 Alignment |
|------|---------|-----------|---------------------|
| Market lead records | SharePoint List (Sales/BD site) | Authoritative for market lead data | Aligns with P1-A1: leads domain in SharePoint |
| Market lead tags | SharePoint List (Sales/BD site) | Authoritative child records | Same |
| Pipeline snapshots | SharePoint List (Sales/BD site) | Authoritative for pipeline analytics | Same site; analytics-focused list |
| Import batches | Azure Table Storage | Operational state | Aligns with P1-A1/A2: Table Storage for operational state |
| Import findings | Azure Table Storage | Operational audit | Same |

---

## Open Decisions / Future Expansion

| Decision | Scope | Owner | Target |
|----------|-------|-------|--------|
| **Lead-to-project conversion** | Define linkage mechanism when a lead converts to an active project (FK, junction, or status transition) | Platform Architecture + BD | Phase 2 |
| **AI/ML confidence model** | Define the scoring model, recomputation triggers, and confidence lifecycle | Platform Architecture + AI | Phase 2+ |
| **Lead source dictionary** | Formalize ~15 source values as governed reference set in P1-A5 | Platform Architecture | Phase 1 (late) |
| **Sector/region dictionary alignment** | Reconcile market lead sectors/regions with A5 shared dictionaries | Platform Architecture | Phase 1 (late) |
| **Pipeline snapshot automation** | Automated periodic capture from BD systems | Platform Architecture + BD | Phase 2 |
| **Lead deduplication** | Cross-source deduplication strategy for leads describing the same opportunity | Platform Architecture | Phase 2 |
| **Proposal/negotiation tracking** | Extend lead lifecycle with proposal, negotiation, and award tracking stages | BD + Platform Architecture | Phase 2–3 |

---

## Decision Owners and Approval

| Role | Name | Approval Date |
|------|------|----------------|
| Platform Architecture Lead | — | — |
| Business Development Lead | — | — |
| Sales Operations Lead | — | — |

**Approval Status:** Pending — Schema defined; pending operational validation
**Comments:** Schema derived from marketLeads.json (20 leads) and pipeline.json (22 pipeline summaries). Two distinct entity families: transactional market leads with tag children, and flattened pipeline analytics snapshots. Person attribution frozen as Class G.

---

## Revision History

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 0.1 | 2026-03-17 | Architecture | Initial schema; 5 canonical entities (market_lead, market_lead_tag, pipeline_snapshot, lead_import_batch, lead_import_finding). Market leads from marketLeads.json (20 records, person attribution, tags). Pipeline snapshots from pipeline.json (22 records, flattened aggregate stages/wins/losses). Identity classes frozen (B, D, E, J). Evidence-based from two source files. |
