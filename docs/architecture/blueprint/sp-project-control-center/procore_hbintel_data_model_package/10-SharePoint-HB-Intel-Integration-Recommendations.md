# SharePoint / HB Intel Integration Recommendations

## Executive position
Do **not** force the full Procore operational model into SharePoint lists.

Use a layered architecture:
1. **Raw landing / integration store** for API payload retention and replay
2. **Canonical warehouse-like relational layer** for conformed dimensions and facts
3. **Curated SharePoint / HB Intel materializations** for app UX, dashboards, and lightweight work queues
4. **Document/file storage pattern** that stores metadata centrally and binaries externally

## Recommended landing pattern

### A. Raw extraction layer (external storage)
Best candidates:
- full JSON payloads
- large fact/event tables
- historical snapshots
- drawings/spec revisions
- document/file metadata at scale
- email metadata/bodies
- daily log segmented detail
- timecard/production/equipment transactions

Suggested storage:
- Azure SQL / Fabric / Lakehouse / Dataverse-style warehouse layer
- object storage for payload archives and binary documents
- append-only raw tables plus checkpoint metadata

Reason:
- volume and history are likely to exceed practical SharePoint list limits and governance comfort
- large joins, snapshots, and trend reporting are materially easier outside SharePoint lists

### B. Canonical relational layer (external but governed)
This is the source of truth for HB Intel analytics.
Store:
- conformed dimensions
- bridge tables
- financial facts
- operational facts
- snapshot facts
- document metadata
- lineage keys back to Procore

### C. SharePoint / HB Intel materialized layer
Only publish what needs to be surfaced directly in collaborative UX:
- project master index
- project summary KPIs
- current cost position summary
- current change exposure summary
- current RFI/submittal/observation/punch backlog
- current quality/safety KPI summaries
- selected project contacts, vendors, and document links
- small operational queues for PM/PX/safety/quality users

## What belongs in SharePoint lists
### Good candidates
- project dimension summary
- project team / key contacts summary
- vendor summary
- current project KPI snapshots
- current project cost/change summary
- current open-item snapshot
- curated RFI/submittal summary lists
- curated observation / punch / incident summary lists
- selected workflow approval queue summaries
- custom field dictionary and WBS dictionary for UI lookup if needed

### Why
These are:
- relatively narrow
- current-state oriented
- user-facing
- suitable for filtering/search in SharePoint/HB Intel

## What belongs in document libraries
### Good candidates
- curated exports
- generated reports
- approved PDFs / deliverables
- extracted attachment replicas only when the business explicitly wants them in M365
- small-volume derived documents for executive reporting or audit packages

### Not recommended as the primary binary system of record
- high-volume drawing files
- frequent document revisions synced 1:1
- full attachment mirror of every Procore binary

Use metadata and deep links first; replicate binaries selectively.

## What should stay in external storage
- budget detail and snapshot rows
- line-item financial data
- timecard entries
- actual production quantities
- equipment utilization and maintenance events
- daily log segment rows
- workflow activity events
- coordination issue activity histories
- drawing revisions and file trees at scale
- raw API archives
- large text/history objects

## Incremental sync strategy
### Near-real-time / frequent
- RFIs
- submittals
- observations
- inspections
- incidents
- punch items
- workflow instances
- coordination issues
- current open item snapshots

### Hourly / intra-day
- daily logs
- timecard entries
- actual production quantities
- direct costs
- submittal responses / RFI replies

### Nightly
- projects
- users
- vendors
- WBS reference data
- project roles / permission assignments
- drawings/specifications/documents metadata
- commitments / primes / invoices / payments

### Snapshot cadence
- budget view snapshots: use native Procore snapshots plus scheduled extraction of rows
- project KPI snapshots: daily
- vendor performance snapshots: weekly
- executive portfolio snapshots: daily or nightly

## Derived versus directly replicated
### Directly replicate
- durable business objects
- line-item facts
- statuses and key dates
- explicit source relationships
- native snapshots where available

### Derive
- aging buckets
- overdue flags
- cycle times
- portfolio KPIs
- project health scores
- vendor performance scores
- labor efficiency metrics
- issue burden indexes

## Recommended first-stage implementation order
1. company / project / user / vendor / WBS master
2. budget views + budget snapshots + change events + budget changes
3. commitments + requisitions + direct costs + prime contracts + owner invoices
4. RFIs + submittals + correspondences
5. observations + inspections + incidents + punch items
6. daily logs + timecard entries + production quantities
7. drawings + specifications + document metadata
8. workflows + coordination issues + equipment / telematics if justified

## SharePoint-specific guidance
- keep lists narrow and current-state oriented
- avoid stuffing multiline JSON blobs into SharePoint columns
- store Procore object ids and canonical keys on every surfaced row
- use one “project summary” list and a small number of subject-area lists rather than dozens of transactional SharePoint lists
- let HB Intel query the canonical relational layer for detail screens whenever possible