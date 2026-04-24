# 08 – Recommended Execution Waves

## Wave 1 — Foundation and control plane
### Goal
Make the repo genuinely ready to host Procore.

### Includes
- durable connection registry
- Procore token broker / connector client
- Key Vault secret references
- raw landing storage
- run ledger / checkpoint / replay framework
- canonical relational schema foundation
- first publication contracts
- durable project registry and crosswalks
- admin health / test / freshness surfaces

### Exit criteria
- Procore connection can be created, tested, and health-checked
- a controlled sync can run and persist raw payloads and checkpoints
- canonical tables can be populated for at least foundation masters
- first published read-model contracts exist
- project registry is no longer mock-only

## Wave 2 — First production data slice
### Goal
Deliver the first real business value.

### Includes
- foundation masters
- financial core ingestion/publications
- project-management core ingestion/publications
- project health snapshots
- project and portfolio summary APIs
- initial curated SharePoint/SPFx materializations
- PWA/source assembly conversion from mock to live publication consumers

### Exit criteria
- project-level and portfolio-level summaries are live
- cost/change and open-item views are real
- current-state summaries are visible in project-facing surfaces
- sync freshness, failures, and replay status are operator-visible

## Wave 3 — Recommended practical expansion
### Goal
Reach the package’s recommended practical model.

### Includes
- inspections/checklists
- daily log headers + key segment detail
- timecards / production
- document metadata
- workflow instances/activity
- expanded correlations and operational drilldown

### Exit criteria
- project control center use cases are materially supported
- PM/PX/Supt role-based intelligence can drill past summary-only views
