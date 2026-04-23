# 04 — Repository and Graph Risk Assessment

## Why provisioning works while ingestion fails

### Provisioning dry-run
The provisioning dry-run succeeds because it stays in the control-plane seam:
- authoritative site-target resolution,
- reference-list validation,
- bounded PnP/SharePoint service operations,
- and no dependency on the failing Safety repository data-plane reads.

### Ingestion
The ingestion route uses the same outer control-plane validation, but then:
1. builds a REST app-only HTTP client,
2. instantiates `SharePointSafetyInspectionRepository`,
3. and immediately calls `repo.getReportingPeriod(...)`.

That first repository read is the failing hop.

## Most likely cause stack
This is best explained as a **combination** of:
- REST-vs-Graph split,
- a different outbound auth/data-plane seam than the working provisioning lane,
- and a repository abstraction that still assumes SharePoint REST list-item semantics for operations the user now wants to consolidate under Graph.

It is less persuasive to treat this as only:
- a wrong site binding, or
- a single missing digest/header problem,
because the first failing call is a read, not a write, and the provisioning/control-plane seam is already proving broader site/list reachability.

## Why the current repository is the wrong steady-state seam
The repository:
- bakes in REST endpoint shapes,
- bakes in `SP.Data.<ListName>ListItem` metadata types,
- bakes in MERGE semantics,
- and relies on GUID-overlay resolution as a REST binding primitive.

That can be made to work, but it is directly at odds with the desired backend direction:
- one application-facing API surface,
- one primary permission model,
- one primary auth path,
- simpler rollout-time governance.

## Graph cutover feasibility by entity
### Easily migrated
- Reporting periods
- Project week records
- Inspection events
- Findings
- Ingestion runs
- Upload library file placement (drive/file APIs)

### Requires care but still tractable
- Lookup-style foreign key handling
- field value updates versus whole-item updates
- replacement/supersession flows
- list-item ID ↔ business ID mapping
- upload library metadata write-back after file creation

### Requires design attention, not just API substitution
- any logic that assumes SharePoint REST metadata type names
- any logic that assumes server-relative path semantics rather than Graph drive/site abstractions
- any mutation logic that relies on implicit REST behaviors rather than explicit Graph field updates

## Risk judgment
The Graph-only cutover is the correct structural solution, but it should be done through a new repository implementation boundary rather than piecemeal edits inside the REST repository. Trying to slowly “Graph-ify” a REST adapter tends to create a hybrid adapter that is harder to reason about than either model alone.
