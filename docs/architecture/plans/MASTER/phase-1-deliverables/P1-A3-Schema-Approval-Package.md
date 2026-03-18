# P1-A3 SharePoint Physical Schema — Approval Package

**Document Type:** Decision Package — requires Product Owner approval before physical deployment.
**Date:** 2026-03-18
**Prepared by:** Architecture / Engineering
**Governing Schema Register:** [P1-A3-SharePoint-Lists-Libraries-Schema-Register.md](P1-A3-SharePoint-Lists-Libraries-Schema-Register.md)

---

## Decision Requested

Approve the Phase 1 SharePoint physical schema (49 containers across 4 deployment scopes) for tenant deployment. Column-level schemas are fully specified in P1-A3 through P1-A15. Content type strategy (hub gallery vs site-local) can be resolved separately and does not block this approval.

---

## Executive Summary

HB Intel Phase 1 defines 49 SharePoint lists and libraries across 4 deployment scopes. All schemas are fully specified with column names, types, indexing strategy, versioning requirements, and relationship mappings. Backend provisioning code implements 34 lists in TypeScript configuration files ready for automated deployment.

**What works today without approval:** All 11 proxy adapter repositories are being built and tested against mocked fetch. Port interfaces, envelope parsing, and path building all function correctly against test data.

**What cannot proceed without approval:** Physical list deployment to any SharePoint site. Production data ingestion. Staging smoke tests against real lists. P1-E2 staging readiness verification.

---

## Schema Summary by Deployment Scope

### Hub Site — 15 containers (one-time platform setup)

| Group | Count | Purpose | Key Columns (sample) | Relationships |
|---|---|---|---|---|
| Shared Reference Dictionaries | 9 | Cost codes, CSI codes, project types, stages, regions, states, countries, delivery methods, sectors | CodeValue, Description, Category, IsActive | None — consumed as lookups by project-site lists |
| Template/Definition Lists | 4 | Kickoff templates, checklist templates, scorecard rubrics, responsibility templates | TemplateName, Domain, Version, IsActive | Referenced by project-site instances |
| Project Registry | 2 | Master project records (60 fields) and new project intake requests (32 fields) | project_id, project_number, project_name, project_stage | Master record for all project-scoped domains |

### Project Site — 31 containers (per-project provisioning)

| Domain | Lists | Purpose | Scale Notes |
|---|---|---|---|
| Estimating | 4 | Pursuits, preconstruction, estimate tracking, team members | 10–50 items per project |
| Buyout/Procurement | 9 | Commitments, milestones, allowances, long-lead, VE, compliance checklists, waivers, E-Verify | 50–500 items; financial/compliance restricted |
| Schedule | 3 | Activities, import batches, file uploads (library) | Potentially thousands per import batch |
| Financial | 3 | Budget lines, import batches, file uploads (library) | Financial domain team restricted |
| Operational Register | 1 | Risk, constraint, issue, action, delay (hybrid subtypes) | 20–100 items per project |
| Estimating Kickoff | 2 | Kickoff instances and task/milestone rows | 50–70 rows per instance |
| Permits & Inspections | 2 | Permit tracking and inspection records | 5–30 per project |
| Lifecycle Checklists | 1 | Startup, safety, closeout checklists | 3 per project (one per type) |
| Responsibility Matrix | 2 | Role assignment headers and individual assignments | 10–30 per project |
| Lessons Learned | 2 | Report headers and individual lesson records | 5–20 per project |
| Subcontractor Scorecard | 2 | Evaluation instances and criterion scores | 5–20 per project |
| Prime Contracts | 1 | Prime contract records | 1 per project typical |

### Sales/BD Site — 2 containers (one-time department setup)

| List | Purpose | Key Columns |
|---|---|---|
| MarketLeads | Individual market leads with classification | lead_id, sector, region, lead_status, estimatedValue |
| PipelineSnapshots | Pipeline snapshots for BD reporting | snapshot_date, sector, totalValue, leadCount |

### Shared Site — 1 container (one-time department setup)

| List | Purpose | Key Columns |
|---|---|---|
| EstimatingTeamMembers | Estimating team roster | UPN, role, department, isActive |

---

## Content Type Strategy

Phase 1 uses three hub-level content types only (frozen in P1-A3):
- **HBBaseListItem** — all list items
- **HBDocumentItem** — all library documents
- **HBDictionaryItem** — all reference data

Domain-specific content types are deferred to Phase 2. The pending decision on hub gallery vs site-local publication does NOT block schema approval — it affects deployment mechanics only.

---

## Schema Stability Assessment

| Area | Status | Can Adapter Dev Proceed? |
|---|---|---|
| Hub site reference dictionaries (9) | Stable — column schemas locked | Yes — mock data used |
| Hub site project registry (2) | Stable — 60+ fields specified | Yes — mock data used |
| Project site domain lists (31) | Stable — column-level schemas in P1-A4 through P1-A15 | Yes — mock data used |
| Sales/BD site lists (2) | Stable — P1-A14 schema locked | Yes — mock data used |
| Shared site roster (1) | Stable — 7 fields | Yes — mock data used |
| Backend list definition code (34 lists) | Implemented and tested | N/A — provisioning code ready |

**All schemas are stable enough for adapter development against mocks.** Physical deployment is the only step that requires this approval.

---

## Deployment Dependencies

| Dependency | Status | Blocks |
|---|---|---|
| Product Owner schema approval | **This decision** | All physical list creation |
| `Sites.Selected` per-site grants | Process-documented (manual script) | Site access after creation |
| `Group.ReadWrite.All` IT grant | Code-complete, awaiting IT | Entra group lifecycle (Step 6) |
| Managed Identity provisioned | IT prerequisite | All backend operations |

---

## Risk if Deferred

1. **Staging readiness (P1-E2) cannot be verified** — smoke tests require real SharePoint lists
2. **Production provisioning creates empty sites** — Steps 1-3 create site/library/templates but Step 4 (data lists) has no schema to deploy
3. **Adapter→mock divergence risk increases** — longer delay between mock testing and real SharePoint validation means more late-stage surprises
4. **Domain teams cannot seed reference data** — dictionaries (cost codes, CSI codes) cannot be loaded

---

## How to Review

1. **Quick scan:** This document (scope, counts, risk)
2. **Detailed schema review:** [P1-A3 Schema Register](P1-A3-SharePoint-Lists-Libraries-Schema-Register.md) — complete column-level specifications
3. **Domain-by-domain schemas:** P1-A4 through P1-A15 — individual domain canonical schemas
4. **Backend implementation:** `backend/functions/src/config/*-list-definitions.ts` — TypeScript list definitions used by provisioning

---

## Approval

| Role | Name | Decision | Date |
|---|---|---|---|
| Product Owner | ___________________ | Approve / Reject / Approve with conditions | __________ |
| Architecture Lead | ___________________ | Reviewed | __________ |
| Business Domain Lead(s) | ___________________ | Reviewed | __________ |

**Approval scope:** Column schemas for all 49 containers as specified in P1-A3. Does NOT include content type gallery publication decision (resolved separately).
