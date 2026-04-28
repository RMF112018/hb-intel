# SharePoint Storage Pattern Recommendation

## Core position
Use SharePoint as a **collaboration and curated presentation layer**, not as the primary home for the full Procore operational model.

## Good SharePoint list candidates
- project summary index
- project team / key contact list
- vendor summary list
- current cost/change summary by project
- current RFI / submittal / observation / punch summary queues
- current quality and safety KPI summaries
- current workflow approval queue summaries
- WBS/custom-field dictionaries when small and needed for UI lookup

## Good document-library candidates
- generated executive reports
- curated PDF exports
- selected attachments intentionally replicated into M365
- implementation documentation and audit artifacts

## Poor SharePoint list candidates
- raw API payload archives
- budget snapshot detail rows at scale
- timecard entry detail at enterprise volume
- large daily-log segment tables
- drawing/spec revision histories at high volume
- workflow activity history at scale
- long text/email archives as the system of record

## Recommended external storage
- raw JSON landing store
- canonical relational layer (SQL/Fabric/Lakehouse/warehouse)
- binary/object store for files where needed
- semantic/reporting layer for analytics

## Materialization pattern
1. Ingest raw Procore data externally.
2. Normalize into canonical HB Intel entities.
3. Publish narrow, current-state SharePoint materializations.
4. Deep-link from SharePoint/HB Intel to detailed external analytics or Procore records where needed.

## Key SharePoint design rules
- Keep lists narrow, indexed, and current-state oriented.
- Always carry Procore native IDs and canonical keys.
- Avoid stuffing multiline JSON into list fields.
- Favor summary lists over many transactional lists.
- Use document libraries selectively, not as a 1:1 replica target for all Procore binaries.
