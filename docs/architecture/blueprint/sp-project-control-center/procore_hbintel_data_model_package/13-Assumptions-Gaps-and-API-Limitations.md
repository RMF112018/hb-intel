# Assumptions, Gaps, and API Limitations

## Confirmed or likely platform constraints affecting design
1. The REST surface is broad and versioned, with lifecycle phases that require active monitoring.
2. Older/legacy and newer endpoint families coexist in some domains.
3. Some resources are helper/config/filter endpoints and should not be mistaken for durable analytical tables.
4. Some file/document workflows are operational plumbing rather than reporting entities.
5. Not every project uses every tool family, so canonical model population will be sparse by design.

## Important current modeling caveats

### Budget domain
- Budget Views are analytically stronger than naïve replication of only budget line items.
- Native budget snapshots are high value and should be used.
- Budget Changes replace Budget Modifications for migrated/newer companies; legacy modification write operations are no longer the forward-looking design center.

### Workflow domain
- Workflow coverage is mixed across newer and legacy surfaces.
- Legacy workflow guidance explicitly notes there may be no programmatic way to determine whether a workflow is applied to a given object.
- For some customers, workflow analytics will be partial unless workflow adoption and endpoint usage are verified.

### Schedule domain
- Schedule coverage appears mixed, with a “Schedule (Legacy)” family plus task-oriented and metadata surfaces.
- Treat schedule data as useful but lower-confidence until tenant usage and field completeness are validated.

### Documents and binaries
- Secure file access rules and upload orchestration matter operationally.
- Binary/document replication should be selective.
- URL/download handling should not assume fixed hostnames.

### Permissions and access
- Client credentials/DMSA is preferred for broad data connections, but company/project permissions on the DMSA account determine actual visibility.
- Authorization-code integrations reflect the logged-in user’s permissions and can create uneven data coverage if used for enterprise sync.

## Assumptions used in this package
- The target organization is a general contractor using Procore as a multi-project operating platform rather than a single-tool deployment.
- HB Intel wants both executive portfolio reporting and project-level operational drilldown.
- External storage/warehouse is acceptable and preferable for high-volume operational data.
- SharePoint will be used as an experience layer and selective collaboration store, not as the sole persistence layer for all Procore facts.

## Gaps that should be validated in a tenant-specific design phase
- which Procore tools are actually enabled and used consistently
- which custom fields are analytically important
- whether budget views are standardized across projects
- whether timecards/production quantities are populated consistently
- whether coordination issues / action plans / workflows are materially used
- whether documents/drawings/specifications need metadata-only sync or curated binary replication
- whether ERP integration fields/statuses are relied on for finance workflows

## Design response to these gaps
- build canonical entities with nullable optional extensions
- use configuration tables to flag active subject areas by company/project
- prioritize robust keys and lineage even where fact population is sparse
- publish curated subject areas progressively rather than all at once