# Plan Summary

## Objective

Close the real backend and backend-coupled list-architecture issues that remain open in the live `apps/hb-publisher` implementation on `main`, with no wasted effort on intentionally out-of-scope destination expansion.

## Major issue clusters

### 1. Saved-state truthfulness
The authoring shell now knows when a draft is dirty and already offers a save-and-refresh-preview bridge, but Publish and Republish are still executable from a dirty working copy even though the actual preview/publish pipeline resolves from saved repository state. That remains the highest correctness risk.

### 2. Template-control-plane fail-open behavior
The validation engine still treats an unknown `RequiredFieldSetKey` as a warning and falls back to global rules. That is still too weak for operational templates, even though milestone legacy content is intentionally blocked from publish/republish.

### 3. Silent read-path lossiness
Mapper rejection still returns `undefined`, and repository reads still filter rejected rows away without a structured surfaced diagnostic. The result is operational invisibility when SharePoint data is malformed.

### 4. Weak key governance in a text-key list model
Critical reads and upserts still rely on first-match text keys while the checked-in tenant schema report does not prove uniqueness or indexing for those key columns. The code and the schema both need hardening.

### 5. Thin lineage and thin failure telemetry
Binding supersession is still preserved mainly through workflow-history note text, and publishing-error precision still depends too heavily on prefixed Title/ErrorSummary prose because the current list schema is too coarse.

## Critical risks

1. a user can still ship stale content from a dirty draft
2. a bad template registry row can still weaken validation instead of stopping publish for operational templates
3. malformed rows can still disappear from the read model without a durable signal
4. duplicate key rows can still cause wrong-row reads or wrong-row MERGEs
5. support and audit tooling still have to parse prose to understand binding supersession and detailed failure stage

## How this package closes them

- Prompt 01 closes the dirty publish gap using shell, readiness, and lifecycle alignment
- Prompt 02 converts operational required-field-set governance from warning-only to fail-closed behavior
- Prompt 03 introduces structured mapper/read diagnostics and requires that the shell narrate them truthfully
- Prompt 04 hardens key authority, uniqueness/index posture, and duplicate detection on the current text-key model
- Prompt 05 replaces note-only binding supersession with structured lineage
- Prompt 06 hardens the publishing-errors surface so backend failures are queryable by stage and subsystem rather than mostly by prose

## Scope exclusions that remain intentional

The following items are still intentionally out of scope for this package and should not consume engineering effort here:

- broader destination implementation beyond the current Project Spotlight operating model
- Company Pulse delivery architecture
- scheduled-publish queue or executor architecture
- wholesale conversion of every text-key relationship into SharePoint lookup columns
- broad activation of dormant `HB Articles` metadata that the current release does not operationally use

## Success standard

This package succeeds only if the code agent closes the real backend closure blockers and also leaves behind authoritative schema and closure notes strong enough that the same issues do not reopen through drift.
