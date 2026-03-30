# Phase 2 — Data Contract Action Plan

## Objective

Bring the Estimating / Project Setup backend onto a **production-accurate `Projects` list data contract** by removing display-name assumptions, implementing a canonical field-mapping layer, and protecting the new contract with tests and runtime validation.

This phase is not intended to solve every remaining production-readiness gap. It is intended to make the backend’s SharePoint persistence layer trustworthy, explicit, and stable so later phases can build on a correct data foundation.

## In scope

- `Projects` list schema reconciliation against the real production export
- Canonical business/domain contract for Project Setup request data
- Separation of domain DTOs from SharePoint persistence DTOs
- Centralized mapping between internal SharePoint field names and business properties
- Refactor of read, write, query, filter, and update paths to use the centralized mapping
- Contract/unit/integration tests for the data contract
- Runtime validation and observability for schema drift and mapping failures
- Documentation of the Phase 2 data contract

## Out of scope unless strictly required to enable Phase 2

- Full Entra token-version redesign
- Broad auth / identity model redesign
- CORS redesign
- General Azure infrastructure hardening
- Broad provisioning workflow redesign
- UX changes unrelated to data-contract correctness

## Known starting facts for Phase 2

- The production `Projects` list export you provided is the authoritative target list for this phase.
- The current backend still assumes friendly field names such as `ProjectId`, `ProjectNumber`, `ProjectName`, `RequestState`, and `SiteUrl` in persistence logic.
- The production list uses internal SharePoint field names that do not match those friendly names.
- This mismatch is a production blocker because the current service layer is not guaranteed to read or write the intended fields correctly.
- Phase 1 scope control should prevent non-Project-Setup seams from obscuring this work.

## Phase 2 success criteria

Phase 2 is complete only when all of the following are true:

1. The repo contains a single authoritative `Projects` list field-map used by the backend.
2. No backend persistence path relies on friendly SharePoint display names for the production list.
3. The domain model is clearly separated from the SharePoint storage model.
4. All serialization and deserialization flows use shared mapping helpers.
5. Query/select/filter/update code paths are aligned to the canonical field-map.
6. Schema drift and missing-field conditions fail loudly in tests and diagnostically at runtime.
7. A future regression cannot silently reintroduce direct `field_*` scattering or display-name assumptions.

## Workstream A — Repo truth and field-map baseline

### Tasks
- Inventory every backend file that reads from or writes to the `Projects` list.
- Inventory every business property currently assumed by the Project Setup domain.
- Inventory the actual production list internal names and friendly names from the export you provided.
- Produce a one-to-one mapping matrix between:
  - domain property name
  - SharePoint display name
  - SharePoint internal name
  - data type
  - nullable / required posture
  - read/write/update usage
- Identify any fields currently used in code that do not exist in production.
- Identify any production fields that are required for the domain but are not yet consumed correctly.

### Deliverables
- Baseline field-map matrix
- Current-code usage inventory
- Data-contract gap list

### Acceptance criteria
- There is one authoritative baseline document before refactoring begins.
- All active read/write/query paths are accounted for in the matrix.

## Workstream B — Canonical data contract and type boundaries

### Tasks
- Define a canonical domain model for Project Setup request/project data.
- Define a persistence DTO or adapter model for SharePoint list items.
- Define translation rules between domain and persistence layers.
- Decide how nulls, empty strings, missing values, numbers, booleans, dates, people fields, URLs, and state values are normalized.
- Decide how to represent fields that exist in SharePoint but are not yet needed in the domain.

### Deliverables
- Canonical domain type definitions
- Persistence contract definitions
- Mapping rules and normalization notes

### Acceptance criteria
- Engineers can tell exactly where business semantics end and SharePoint storage semantics begin.
- There is no ambiguity about type conversion or normalization rules.

## Workstream C — Centralized SharePoint field mapping and serialization

### Tasks
- Create a single authoritative field-map module for the `Projects` list.
- Implement shared helpers for:
  - list-item to domain conversion
  - domain to create payload conversion
  - domain to update payload conversion
  - safe query/select/filter field resolution
- Remove ad hoc field-name usage from service-layer code.
- Ensure the mapping layer is readable and auditable.

### Deliverables
- Central field-map module
- Serialization/deserialization helpers
- Refactored service-layer adapters

### Acceptance criteria
- No production persistence path bypasses the central field-map.
- Internal-name knowledge is centralized rather than scattered.

## Workstream D — Query/write-path refactor and tests

### Tasks
- Refactor create, read, update, list, filter, and state-transition paths to use the mapping layer.
- Add tests for:
  - read mapping
  - write mapping
  - partial update mapping
  - filter/query field resolution
  - null/empty conversions
  - unexpected missing fields
  - incompatible type inputs
- Add regression tests proving the old direct field assumptions do not reappear.

### Deliverables
- Refactored query/write paths
- Unit tests
- Contract tests
- Optional narrow integration tests if the current test harness supports them safely

### Acceptance criteria
- The full Project Setup persistence path runs through the canonical mapping layer.
- Test coverage proves the production field-map is enforced.

## Workstream E — Runtime validation and observability

### Tasks
- Add startup or first-use validation for critical expected list fields where appropriate.
- Add safe diagnostics for mapping failures without leaking secrets or sensitive data.
- Add logs/errors that distinguish:
  - missing field in production schema
  - unsupported value type
  - malformed SharePoint item
  - null/empty required field
  - stale code assumption
- Add a lightweight operator/developer note explaining how to diagnose field-contract failures.

### Deliverables
- Runtime validation helpers
- Logging / diagnostics improvements
- Troubleshooting notes

### Acceptance criteria
- Mapping failures are obvious and diagnosable.
- Schema drift cannot fail silently.

## Recommended execution sequence

1. Prompt 01 — Repo truth and field-map baseline
2. Prompt 02 — Canonical data contract and types
3. Prompt 03 — SharePoint field mapping and serialization
4. Prompt 04 — Query/write-path refactor and contract tests
5. Prompt 05 — Runtime validation and observability
6. Prompt 06 — Final verification and handoff

## Non-negotiable constraints

- Do not re-read files already in current context or memory unless needed to verify a contradiction or retrieve exact evidence.
- Do not let this phase drift into full auth or infrastructure redesign.
- Do not hardcode additional `field_*` usages outside the central field-map.
- Do not preserve legacy display-name assumptions “for compatibility” if they are not correct for the production list.
- Do not mix domain semantics and SharePoint persistence semantics in the same layer after the refactor.
- Do not ship silent fallback behavior for missing critical fields.

## Phase 2 exit artifacts

At the end of Phase 2, the repo should contain:

- authoritative `Projects` list field-map documentation
- centralized field-map implementation
- canonical domain and persistence types
- refactored read/write/query paths
- contract and regression tests
- runtime diagnostics for schema drift and mapping failures
- final verification notes and known-follow-on items for later phases
