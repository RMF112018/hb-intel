# 05 — Downstream Safety Field Excellence Publishing Model

## Objective

Define how the structured safety records should support downstream Safety Field Excellence.

## Separation of concerns

### Transactional capture layer
- reporting periods
- project-week records
- inspection events
- findings
- corrective actions

### Downstream publish layer
- curated top-line summary
- primary spotlight
- secondary signals
- freshness metadata
- publish snapshot

## Recommended downstream objects

### Top-line summary
Examples:
- weekly completion status
- average safety score across active projects
- number of high-priority findings
- number of open corrective actions

### Primary spotlight
Examples:
- most urgent active project-week issue
- highest-risk unresolved finding
- major positive safety highlight if no urgent negatives exist

### Secondary signals
Examples:
- projects below score threshold
- stale corrective actions
- repeated incomplete inspections
- multiple inspections in a week indicating elevated oversight

## Publish-snapshot recommendation

Rather than reading raw transactional lists directly into homepage components, publish a bounded snapshot payload. This lets the homepage seam stay thin and curated.

## Freshness
Each publish snapshot should carry:
- `PublishedAt`
- `FreshUntil`
- optional status label such as `Updated today`

## Human override
Managers should be able to override or curate the published primary spotlight text even if the transactional model generated a suggested candidate.
