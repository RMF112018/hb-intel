# 05 – Data Layer and SharePoint Materialization Plan

## Recommended data architecture

### Layer 1 — Connection and run-control plane
Primary technology:
- existing backend/functions control-plane
- Azure Table storage for connector records, run ledgers, checkpoints, idempotency keys, and publication-state markers where appropriate

Use for:
- connector configs
- sync runs
- watermarks / checkpoints
- replay requests
- failure / dead-letter ledgers
- rollout gates

### Layer 2 — Raw landing / custody
Primary technology:
- Azure Blob Storage (or equivalent object storage)

Use for:
- raw JSON payload archives
- page-level extraction payloads
- failed payload quarantine
- replay source material
- optional file metadata or selective binary replication staging

Rules:
- append-oriented
- immutable per extraction run where feasible
- keyed by connector/company/project/subject-area/run timestamp

### Layer 3 — Canonical relational layer
Primary technology:
- Azure SQL Database as the default first practical choice for HB Intel

Use for:
- conformed dimensions
- bridge tables
- current-state facts
- snapshot facts
- lineage tables
- project and company crosswalks
- publication-friendly read-model source tables

Why Azure SQL here instead of SharePoint or only Azure Tables:
- relational joins matter immediately for Procore
- the package expects bridge-heavy modeling and snapshots
- the first useful financial / project-management subject areas already require relational behavior

### Layer 4 — Curated publication/materialization layer
Primary technologies:
- backend API read models
- selective SharePoint lists
- selective document-library outputs
- Power BI / reporting models where needed

Use for:
- project master summary
- cost/change summary
- RFI/submittal/open-item summary
- quality/safety KPI summary
- vendor/contact summaries
- generated reports
- admin health/status views

## SharePoint materialization rules

### Put in SharePoint lists
Only narrow, current-state, collaboration-friendly data:
- project summary index
- project KPI snapshots
- current open-item queues
- selected vendor/contact summaries
- selected workflow queues if later required
- small dictionaries needed for SPFx lookup UX

### Put in document libraries
Only curated artifacts:
- generated reports
- executive exports
- selected replicated files when business value is explicit
- audit/reconciliation exports

### Keep out of SharePoint
- raw Procore payload archives
- detailed budget snapshot rows at enterprise scale
- timecard detail
- daily-log segment detail at volume
- large document mirrors
- workflow history/event logs
- deep change/activity histories

## Key strategy

### Preserve source keys
Always store:
- Procore company id
- Procore project id
- native Procore object id
- parent-object ids where applicable

### Add HB Intel canonical keys
Issue internal surrogate keys for:
- company
- project
- user
- vendor
- WBS code
- location
- publication entities

### Crosswalk requirements
Create durable crosswalk tables for:
- Procore project id ↔ HB Intel project record
- Procore company scope ↔ HB Intel tenant/company context
- Procore user/vendor references ↔ canonical entities

## Initial subject-area publication set
First publication set should include:
- project master + project health snapshot
- cost / change / commitment summary
- RFI + submittal + observation + punch + incident summary
- project team / vendor summary
- sync freshness and connector-health indicators

## Sync cadence
### Nightly
- company/project/user/vendor/WBS masters
- broad financial refresh for inactive projects
- metadata-heavy dictionaries

### Intra-day / hourly for active projects
- active-project financial deltas
- RFIs
- submittals
- observations
- punch
- incidents
- current-state health snapshots

### Later / optional
- document metadata refresh
- drawings
- daily-log detail
- timecards / productivity
- workflow activity
