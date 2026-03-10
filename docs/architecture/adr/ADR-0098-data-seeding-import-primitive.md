# ADR-0098 — Data Seeding Import Primitive

**Status:** Accepted
**Date:** 2026-03-10
**Deciders:** HB Intel Architecture Team
**Supersedes:** None
**Note:** Source spec (PH7-SF-09) referenced ADR-0094 for data-seeding, but ADR-0094 was assigned to versioned-record-platform-primitive. ADR-0095 (stub-detection), ADR-0096 (field-annotations), ADR-0097 (workflow-handoff) are also taken. The canonical ADR for SF-09 Data Seeding is ADR-0098.

## Context

HB Intel deployments face a cold-start problem: the platform has no mechanism to import existing data from Excel, CSV, or legacy PM software (e.g., Procore). Without a structured import layer, onboarding requires weeks of manual data entry before the platform provides value. `@hbc/data-seeding` solves this by making validated, resumable bulk import a platform-wide primitive.

## Decisions

### D-01 — Client-Side Parsing + Server-Side Fallback
Files <10MB are parsed client-side using SheetJS (xlsx) and native CSV parsing.
Files ≥10MB are uploaded to SharePoint first, then parsed by the `seedParse` Azure Function.

### D-02 — Fuzzy Header Auto-Mapping (Threshold 0.8)
Auto-mapping uses normalized Levenshtein similarity ≥ 0.8. User can override any auto-map.

### D-03 — Validate-on-Map + Full-Pass Validation
Validation runs when each mapping is confirmed, and again as a full pass before import.

### D-04 — Opt-In Partial Import
`allowPartialImport: true` in ISeedConfig skips invalid rows and collects them in a CSV report.
Default is false (all errors must be resolved).

### D-05 — Configurable Batch Size
Default 50 rows per batch. Progress updated after each batch. Configurable via batchSize.

### D-06 — SharePoint System Context Storage Before Parsing
All seed files stored in SharePoint System context before any parsing begins.
The stored file is the audit source-of-truth for the import.

### D-07 — Versioned-Record Snapshot Tagged 'imported'
First imported version of each record tagged `tag: 'imported'`. Integration opt-in.
`@hbc/data-seeding` does NOT import `@hbc/versioned-record` directly.

### D-08 — First-Class Procore Export Parser
ProcoreExportParser handles Procore project JSON export format for Project Hub seeding.

### D-09 — Complexity Gating: Mapper and Preview Standard+ Only
Essential shows simplified uploader + row count confirm. Standard/Expert show full 5-step flow.

### D-10 — Testing Sub-Path: `@hbc/data-seeding/testing`
7 canonical fixtures: createMockSeedConfig, createMockSeedResult, createMockValidationError,
createMockSeedRow, mockSeedStatuses. Excluded from production bundle.

## Consequences

- All consuming modules must implement `ISeedConfig<TSource, TDest>` to use data seeding.
- SheetJS dependency is confined to `XlsxParser.ts` only — tree-shaking preserves bundle budget for non-xlsx consumers.
- Large file handling requires `@hbc/sharepoint-docs` System context upload wiring.
- Consuming modules opt-in to versioned-record tagging via `onImportComplete` callback.
- Five reference `ISeedConfig` implementations ship in `src/reference-configs/`.

## Compliance

This ADR is locked by CLAUDE.md §6.3. May only be reversed by a superseding ADR.
