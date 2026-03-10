# SF09 — `@hbc/data-seeding`: Structured Data Import & Initial State Population

> **Doc Classification:** Canonical Normative Plan — SF09 master plan; pending PH7.12 sign-off (ADR-0090) before implementation begins.

**Package:** `packages/data-seeding/`
**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-09-Shared-Feature-Data-Seeding.md`
**Priority Tier:** 2 — Application Layer (required before production onboarding)
**Mold Breaker:** UX-MB §5 (Offline-Safe Workflows); con-tech-ux-study §10.4 (Form State Preservation — cold-start problem)
**Estimated Effort:** 4.5 sprint-weeks total (see breakdown below)
**ADR:** `docs/architecture/adr/0094-data-seeding-import-primitive.md` (ADR-0094)
**Note:** Source spec referenced ADR-0018. Per CLAUDE.md §7, all numbers below ADR-0091 are reserved. ADR-0091 through ADR-0093 are assigned (SF07, SF08, SF05-step-wizard). The canonical locked ADR for this feature is ADR-0094.

---

## Problem Statement

Every new HB Intel deployment faces a cold-start problem: the platform is only valuable when it contains real project, lead, and pursuit data — but there is no mechanism to import from existing systems. Without this package, onboarding requires weeks of manual data entry before the platform can provide value. `@hbc/data-seeding` makes structured, validated, resumable data import a platform-wide primitive.

---

## Locked Interview Decisions

| # | Decision | Chosen Option | Rationale |
|---|----------|---------------|-----------|
| D-01 | **Parsing strategy** | Client-side SheetJS for files <10MB; Azure Functions streaming endpoint for files ≥10MB | Eliminates server round-trip for the common case; streaming endpoint handles Procore exports and large project lists without blocking the main thread |
| D-02 | **Column auto-mapping** | Fuzzy header matching (normalized Levenshtein, threshold 0.8) when `autoMapHeaders: true`; user can always override any mapping | Auto-mapping dramatically reduces mapping burden for standard exports; manual override preserves flexibility for non-standard headers |
| D-03 | **Validation timing** | Validate-on-map: field-level validation runs as each mapping is confirmed; full-pass validation on "Proceed to Preview" | Early error surfacing prevents the user from reaching the Preview step with unresolvable errors; avoids a full re-parse |
| D-04 | **Partial import** | Opt-in per `ISeedConfig.allowPartialImport`; when true, valid rows are imported and invalid rows are collected into a downloadable CSV error report | Required for real-world imports where some legacy records are always malformed; the alternative (block on any error) would make large imports nearly impossible |
| D-05 | **Batch size & progress** | Default 50 rows per batch; configurable per `ISeedConfig.batchSize`; `SeedStatus` and progress counter updated after each batch completes | Prevents timeout on large imports; provides visible progress to avoid the perception of a frozen UI |
| D-06 | **SharePoint file storage** | Uploaded seed files stored in `@hbc/sharepoint-docs` System context folder before parsing begins; the stored file is the audit source-of-truth | Ensures every import is traceable to a specific file version; required for compliance and for the "retry from stored file" recovery path |
| D-07 | **Versioned-record integration** | First successfully imported version of each record tagged `tag: 'imported'`; integration is opt-in and does not block import if `@hbc/versioned-record` is unavailable | Enables historical benchmarking from day one; opt-in keeps the package usable before versioned-record is implemented |
| D-08 | **Procore export parser** | First-class `ProcoreExportParser` for Project Hub import; JSON format; maps the Procore project schema to `IProjectRecord`; custom parsers may be registered via a future `ISeedConfig.customParser` extension point | Procore is the dominant construction PM platform; first-class support dramatically reduces Project Hub onboarding time; JSON is more reliable than screen-scraping |
| D-09 | **Complexity rendering** | Essential: simplified uploader only — pre-defined field mapping, no Mapper/Preview components rendered; Standard+: full five-step flow (upload → map → preview → import → result) | The Mapper and Preview are power-user tools; Essential users benefit from the simplified "upload and confirm" flow without the cognitive overhead of manual column mapping |
| D-10 | **Testing sub-path** | `@hbc/data-seeding/testing` exports `createMockSeedConfig<S,D>`, `createMockSeedResult`, `createMockValidationError`, `createMockSeedRow`, `mockSeedStatuses` (7 canonical states); excluded from production bundle | Consistent with SF-02, SF-05, SF-06, SF-07, SF-08 testing sub-path pattern; consuming module tests must use these factories rather than defining their own |

---

## Package Directory Tree

```
packages/data-seeding/
├── package.json                            # @hbc/data-seeding; dual ./  ./testing exports
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── index.ts                            # Public barrel
│   ├── types/
│   │   ├── IDataSeeding.ts                 # All interfaces & union types
│   │   └── index.ts
│   ├── parsers/
│   │   ├── XlsxParser.ts                   # SheetJS Excel → row arrays
│   │   ├── CsvParser.ts                    # Native CSV → row arrays
│   │   ├── ProcoreExportParser.ts          # Procore JSON → IProjectRecord rows
│   │   └── index.ts
│   ├── validation/
│   │   ├── validateRow.ts                  # Per-row field-level validation engine
│   │   ├── autoMapHeaders.ts               # Fuzzy header matching (D-02)
│   │   └── index.ts
│   ├── api/
│   │   └── SeedApi.ts                      # Batch import + streaming endpoint wrapper
│   ├── hooks/
│   │   ├── useSeedImport.ts                # Full file→validate→preview→import state machine
│   │   ├── useSeedHistory.ts               # Prior imports for a record type
│   │   └── index.ts
│   └── components/
│       ├── HbcSeedUploader.tsx             # Drag-drop + format detection
│       ├── HbcSeedMapper.tsx               # Column-to-field mapping UI (Standard+)
│       ├── HbcSeedPreview.tsx              # Preview table with validation (Standard+)
│       ├── HbcSeedProgress.tsx             # Real-time progress + result summary
│       └── index.ts
└── testing/
    ├── index.ts                            # Testing sub-path barrel (D-10)
    ├── createMockSeedConfig.ts
    ├── createMockSeedResult.ts
    ├── createMockValidationError.ts
    ├── createMockSeedRow.ts
    └── mockSeedStatuses.ts
```

---

## Complexity Rendering Matrix

| Component | Essential | Standard | Expert |
|---|---|---|---|
| `HbcSeedUploader` | Visible — simplified (accepted formats label only) | Visible — full drag-drop with detected format + row count | Visible — full + file size + MIME type |
| `HbcSeedMapper` | **Not rendered** — pre-defined mapping applied automatically (D-09) | Visible — auto-mapped with override dropdowns | Visible — full + fuzzy confidence score per column |
| `HbcSeedPreview` | **Not rendered** — row count summary only before confirm | Visible — first 20 rows with error highlighting | Visible — first 50 rows + all validation detail + row error count |
| `HbcSeedProgress` | Visible — spinner + "Importing N records…" | Visible — progress bar + imported/error counts | Visible — progress bar + per-batch detail + timing |

**Essential flow:** Upload → simplified confirm ("Import 48 rows?") → Progress → Result summary.
**Standard/Expert flow:** Upload → Mapper → Preview with validation → Import confirm → Progress → Result summary.

---

## Import State Machine

```
                     ┌──────┐
                     │ idle │
                     └──┬───┘
                        │ file uploaded
                     ┌──▼──────────┐
                     │ validating  │   (parsers run; field validation on map)
                     └──┬──────────┘
                        │ validation complete
                     ┌──▼──────────┐
                     │  previewing │   (user reviews mapped preview)
                     └──┬──────────┘
                        │ user confirms import
                     ┌──▼──────────┐
                     │  importing  │   (batch loop; progress updates per batch)
                     └──┬────────┬─┘
               all pass │        │ some rows fail + allowPartialImport
                    ┌───▼───┐  ┌─▼──────┐
                    │complete│  │partial │
                    └───────┘  └────────┘
                        or any hard failure ↓
                              ┌──────┐
                              │failed│
                              └──────┘
```

**SeedStatus transitions:**
- `idle → validating` — file selected or dropped
- `validating → previewing` — parse + validation complete
- `previewing → importing` — user confirms
- `importing → complete` — all rows imported successfully
- `importing → partial` — `allowPartialImport: true`; at least one row failed but others succeeded
- `importing → failed` — hard error (network, auth, batch endpoint failure)
- Any state → `idle` — user clicks Cancel or Reset

---

## Integration Points

| Package | Integration | Task File |
|---|---|---|
| `@hbc/sharepoint-docs` | Seed files stored in System context folder pre-parse; file is audit source-of-truth | T08 |
| `@hbc/versioned-record` | First imported record version tagged `tag: 'imported'`; opt-in per consuming module config | T08 |
| `@hbc/notification-intelligence` | Import completion → Digest notification to initiating admin | T08 |
| `@hbc/complexity` | Mapper and Preview rendered Standard+ only; Essential shows simplified uploader (D-09) | T06/T07 |

**Architecture boundary isolation:**
`@hbc/data-seeding` does NOT import `@hbc/versioned-record`, `@hbc/notification-intelligence`, or `@hbc/bic-next-move`. All integrations are implemented as inversion-of-control callbacks in `ISeedConfig` or as post-import hooks in the consuming module.

---

## SPFx Constraints

- `HbcSeedUploader`, `HbcSeedMapper`, `HbcSeedPreview`, `HbcSeedProgress` are PWA-primary (Admin module surface)
- No SPFx webpart variant required — seeding is an Admin-only, one-time onboarding operation
- SheetJS dependency is excluded from any SPFx bundle where seeding is not present (tree-shaking via explicit entry points)
- Files ≥10MB routed through Azure Functions streaming endpoint — client parses only the metadata row to display upload confirmation, then delegates to server

---

## Effort Estimates

| Task File | Description | Effort |
|---|---|---|
| T01 | Package scaffold, vitest config, barrel stubs | 0.25 sw |
| T02 | TypeScript contracts (all interfaces, types, constants) | 0.25 sw |
| T03 | File parsers (XlsxParser, CsvParser, ProcoreExportParser) + validation engine | 0.75 sw |
| T04 | Storage and API (SeedApi, Azure Functions batch + streaming endpoints) | 0.50 sw |
| T05 | Hooks (useSeedImport, useSeedHistory) | 0.50 sw |
| T06 | HbcSeedUploader and HbcSeedMapper | 0.50 sw |
| T07 | HbcSeedPreview and HbcSeedProgress | 0.50 sw |
| T08 | Platform wiring + reference implementations (5 modules) | 0.50 sw |
| T09 | Testing strategy, deployment checklist, ADR-0094 | 0.75 sw |
| **Total** | | **4.50 sw** |

---

## Definition of Done (20 items)

- [ ] D-01: XlsxParser, CsvParser, ProcoreExportParser all functional; file size routing implemented
- [ ] D-02: `autoMapHeaders` fuzzy matching functional (≥0.8 threshold); user can override any auto-mapped column
- [ ] D-03: Validate-on-map and full-pass validation both active; errors surfaced before Preview step
- [ ] D-04: `allowPartialImport` mode: valid rows imported, error rows collected, CSV error report downloadable
- [ ] D-05: Batch size configurable; `SeedStatus` and progress counter updated per batch
- [ ] D-06: Seed file stored in `@hbc/sharepoint-docs` System context before parsing (D-06)
- [ ] D-07: `tag: 'imported'` applied to first version of each imported record when consuming module opts in
- [ ] D-08: ProcoreExportParser handles Procore project JSON export format
- [ ] D-09: Mapper and Preview are NOT rendered in Essential complexity tier; simplified uploader flow functional
- [ ] D-10: `@hbc/data-seeding/testing` sub-path exports all 5 factories/constants
- [ ] All four mechanical enforcement gates pass (build, lint, check-types, P1 tests — CLAUDE.md §6.3.3)
- [ ] `ISeedConfig<TSource, TDest>` generic contract fully typed end-to-end
- [ ] `useSeedImport` manages full idle→complete state machine without race conditions
- [ ] `HbcSeedUploader` handles drag-drop, click-to-browse, format auto-detection, and file >10MB routing
- [ ] `HbcSeedMapper` renders two-column mapping table with auto-map + manual override
- [ ] `HbcSeedPreview` renders first N rows with validation error cells and summary stats
- [ ] `HbcSeedProgress` renders real-time progress bar with per-batch update and final result summary
- [ ] Unit test coverage ≥95% on all parsers, validation engine, hooks, and components
- [ ] E2E test: Excel upload → map → preview → import → records visible in target module
- [ ] ADR-0094 created; developer adoption how-to and API reference published in `docs/`

---

## Reference Implementation Modules

| Module | Config Name | Source Format | Priority |
|---|---|---|---|
| Business Development | `bdLeadsImportConfig` | Excel (.xlsx) | P0 |
| Estimating | `estimatingBidCalendarImportConfig` | Excel (.xlsx) | P0 |
| Project Hub | `projectHubImportConfig` | Excel (.xlsx) + Procore JSON | P1 |
| Admin | `adminUserImportConfig` | CSV | P1 |
| Strategic Intelligence | `strategicIntelWinLossImportConfig` | Excel (.xlsx) | P2 |

---

## Task File Index

| File | Description |
|---|---|
| `SF09-T01-Package-Scaffold.md` | `package.json`, `tsconfig.json`, `vitest.config.ts`, barrel stubs |
| `SF09-T02-TypeScript-Contracts.md` | All interfaces, union types, constants |
| `SF09-T03-Parsers-and-Validation.md` | `XlsxParser`, `CsvParser`, `ProcoreExportParser`, `validateRow`, `autoMapHeaders` |
| `SF09-T04-Storage-and-API.md` | `SeedApi`, Azure Functions batch endpoint, streaming endpoint for large files |
| `SF09-T05-Hooks.md` | `useSeedImport`, `useSeedHistory` |
| `SF09-T06-HbcSeedUploader-and-HbcSeedMapper.md` | Uploader (drag-drop, format detection) + Mapper (column mapping UI) |
| `SF09-T07-HbcSeedPreview-and-HbcSeedProgress.md` | Preview (validation table) + Progress (real-time bar + result summary) |
| `SF09-T08-Platform-Wiring.md` | Integration with sharepoint-docs, versioned-record, notifications, complexity; 5 reference implementations |
| `SF09-T09-Testing-and-Deployment.md` | Testing sub-path, unit tests, E2E, ADR-0094, deployment checklist, adoption guide |

<!-- IMPLEMENTATION PROGRESS & NOTES
SF09 master plan created: 2026-03-10
Status: In progress — T01–T07 complete, T08–T09 pending.
ADR to be created: docs/architecture/adr/0094-data-seeding-import-primitive.md
Source spec ADR reference (ADR-0018) superseded by CLAUDE.md §7 governance.
SF09-T01 completed: 2026-03-10 — Package scaffold with all stubs, dual entry points verified.
SF09-T02 completed: 2026-03-10 — Full type contracts (IDataSeeding.ts) and constants.ts; barrel updated; check-types + build pass.
SF09-T03 completed: 2026-03-10 — XlsxParser, CsvParser, ProcoreExportParser, validateRow, validateAllRows, autoMapHeaders implemented. ESLint config added. All gates pass.
SF09-T04 completed: 2026-03-10 — SeedApi implemented (importBatch, parseStreaming, recordCompletion, getHistory, getImport, getErrorReportUrl); configureSeedApiFetch DI; api/index.ts barrel created; main barrel updated. All gates pass.
SF09-T05 completed: 2026-03-10 — useSeedImport (full state machine) and useSeedHistory (TanStack Query wrapper) implemented. crypto.randomUUID() used instead of uuid dep. IImportCompleteRequest extended with 3 fields. seedHistoryQueryKey exported. All gates pass.
SF09-T06 completed: 2026-03-10 — HbcSeedUploader and HbcSeedMapper implemented. Three spec fixes applied: (1) useComplexity().variant → .tier; (2) DocumentApi dynamic import replaced with uploadFile callback prop (IoC/ports-adapters); (3) @hbc/sharepoint-docs dependency not needed. All gates pass.
SF09-T07 completed: 2026-03-10 — HbcSeedPreview (Essential summary, Standard/Expert table with error highlighting) and HbcSeedProgress (segmented bar, terminal actions, Expert batch detail) implemented. useComplexity().variant → .tier fix applied (6 occurrences). All gates pass.
SF09-T08 completed: 2026-03-10 — Platform wiring: uploadToSystemContext() added to @hbc/sharepoint-docs UploadService; 5 reference ISeedConfig implementations in packages/data-seeding/src/reference-configs/ (bdLeads, estimatingBidCalendar, projectHub, adminUser, strategicIntelWinLoss). Architecture boundary verification passed (0 forbidden imports). All gates pass.
Next: SF09-T09-Testing-and-Deployment.md
-->
