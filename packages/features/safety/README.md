# @hbc/features-safety

Domain package for HB Intel **Safety Record Keeping** (Release 1, upload-first).

See `docs/architecture/plans/MASTER/spfx/safety-records/design-pacakge/` for the
governing design package.

## Release 1 scope

- Governed `Safety Checklist Template.xlsx` upload through the SPFx app.
- Client-side workbook parsing (SheetJS).
- Deterministic template validation, metadata extraction, row-level parsing.
- Weighted scoring in `template-compat-v1` mode — preserves the documented
  row-band exclusions so parsed scores reconcile with the current workbook.
- Finding extraction for `No` / `Incomplete` / `Multi` responses and notes.
- Project resolution against `Projects` and `Legacy Project Fallback Registry`.
- Duplicate detection keyed on
  `(ProjectNumber, InspectionDate, InspectionNumber, WorkbookChecksum)`.
- SharePoint REST adapter that writes to `/sites/HBCentral`.
- Source workbook retained in `/sites/Safety/SafetyChecklistUploads`.
- Explicit ingestion state machine with every terminal state audited.

## Site topology

| Concern | Site |
|---|---|
| SPFx app shell, pages, property pane | `/sites/Safety` |
| `Safety Checklist Uploads` (document library) | `/sites/Safety` |
| `Safety Reporting Periods` | `/sites/HBCentral` |
| `Safety Project Week Records` | `/sites/HBCentral` |
| `Safety Inspection Events` | `/sites/HBCentral` |
| `Safety Findings` | `/sites/HBCentral` |
| `Safety Ingestion Runs` | `/sites/HBCentral` |
| `Projects` | `/sites/HBCentral` |
| `Legacy Project Fallback Registry` | `/sites/HBCentral` |

The structured records are never authored as a primary system on `/sites/Safety`.

## Ingestion state machine

```
uploaded
  → validating ─ invalid-template (terminal)
      → parsing ─ parse-error (terminal)
          → period-check ─ reporting-period-mismatch (terminal)
              → resolving-project ─ unresolved-project (terminal review-required)
                  → duplicate-checked
                      ├── high-confidence-duplicate + retained commit → committed (idempotent short-circuit)
                      ├── high-confidence-duplicate + supersedePrior → supersede prior + committed
                      └── (no duplicate) → scoring
                                           → commit-pending
                                              ├── committed (terminal success)
                                              └── commit-failed (terminal retryable)
```

Every terminal state writes a `Safety Ingestion Run` row. Replays re-read the
retained workbook from the upload library and write a new run with
`AttemptNumber += 1` and `ParentRunId` set. Replay lineage is **parent/child**
— the original run is never mutated, and superseded prior inspection events
carry `SupersededByInspectionEventId` pointing at the replacement.

Terminal states:

| State | Meaning | Appears in review queue |
|---|---|---|
| `committed` | Authoritative inspection event written | no (unless a replay chain is under review) |
| `invalid-template` | Template contract broken (missing sheet / anchor drift) | yes |
| `parse-error` | Template valid but row-level parse threw | yes |
| `reporting-period-mismatch` | Workbook date outside selected reporting week | yes |
| `unresolved-project` | Project could not be resolved against HBCentral | yes |
| `review-required` | High-confidence duplicate against a prior superseded event | yes |
| `commit-failed` | REST commit to HBCentral failed mid-write | yes (retryable) |

## Raw vs derived persistence

- `Safety Inspection Events.RawChecklistJson` holds the full parsed evidence.
- Scored section % / final % and finding rows are **derived** — recomputable
  from `RawChecklistJson` + `ParserVersion` + `ScoringMode`.
- Project-week `AverageInspectionScore` is **always** recomputable from the
  child inspection events.

## Tenant provisioning checklist

Before deploying Release 1 to a tenant, site admins must:

1. On `/sites/Safety`, create a document library titled `Safety Checklist Uploads`.
2. On `/sites/HBCentral`, create the five custom lists:
   - `Safety Reporting Periods`
   - `Safety Project Week Records`
   - `Safety Inspection Events`
   - `Safety Findings`
   - `Safety Ingestion Runs`
   Field schema for each list is in `src/lists/fieldSchema.ts`. Lookup columns
   (`ReportingPeriodId`, `ProjectWeekRecordId`, `InspectionEventId`) must target
   the corresponding HBCentral list by title.
3. Capture each list's GUID and the upload library's GUID. At runtime, those
   GUIDs are injected through `configureSafetyListGuids()` (see below); **the
   source descriptor files are never edited for tenant-specific GUIDs**. The
   runtime fails closed if a list is queried before its GUID is supplied.
4. Grant safety coordinators **Contribute** on `Safety Checklist Uploads` and
   **Contribute** on the five HBCentral lists.
5. Grant safety coordinators **Read** on `Projects` and
   `Legacy Project Fallback Registry` on HBCentral.
6. Deploy the SPFx solution (`apps/safety/`).

### Supplying tenant GUIDs at runtime

```ts
import { configureSafetyListGuids } from '@hbc/features-safety';

configureSafetyListGuids({
  SafetyReportingPeriods: '<guid>',
  SafetyProjectWeekRecords: '<guid>',
  SafetyInspectionEvents: '<guid>',
  SafetyFindings: '<guid>',
  SafetyIngestionRuns: '<guid>',
  SafetyChecklistUploads: '<guid>',
  Projects: '<guid>',
  LegacyProjectFallbackRegistry: '<guid>',
});
```

`apps/safety/src/App.tsx` reads these values from a bootstrap hook (e.g.
`window.__HB_SAFETY_LIST_GUIDS__`) before the repository is constructed, so
list GUIDs stay out of source control.

### Site topology contract

| Concern | Site |
|---|---|
| SPFx app shell, pages | `/sites/Safety` |
| `Safety Checklist Uploads` document library | `/sites/Safety` |
| Every authoritative safety list + `Projects` + `Legacy Project Fallback Registry` | `/sites/HBCentral` |

The `SharePointSafetyInspectionRepository` writes every authoritative record to
`/sites/HBCentral`. Cross-site writes use the SPFx user's auth context in
Release 1; service-principal flows are a future upgrade.

### SharePoint Lookup contract

Every domain entity carries both:

- a stable `id: string` (e.g. `"ie-3001"`) for UI routing, and
- an authoritative `spItemId: number` — the numeric SharePoint list item Id.

Every Lookup-backed field (`ReportingPeriodId`, `ProjectWeekRecordId`,
`InspectionEventId`) is populated with the numeric parent `spItemId`. The
pipeline never parses a business-string into a fake numeric Lookup parent.

## Scoring mode

Release 1 is `template-compat-v1` only. It preserves the documented
mismatches where rows 20, 37, 62, 63, 99, and 100 are displayed in the
template but excluded from the count-range formulas, so parsed scores match
the arithmetic of the current workbook.

`normalized-vNext` is declared in the enum but throws
`AdapterNotImplementedError` if selected. A future corrected-template phase
will implement it and migrate the scoring mode under a new template version.

## Adapter selection

```ts
import { createSafetyInspectionRepository } from '@hbc/features-safety';

const repo = createSafetyInspectionRepository({
  mode: 'sharepoint',
  sharepoint: { client: mySpHttpClient },
});

// or for dev harness / tests:
const mock = createSafetyInspectionRepository({ mode: 'mock' });
```

`apps/safety/src/App.tsx` wires the SPFx `SPHttpClient` into an `SpHttpClient`
adapter and falls back to the mock repo when `spfxContext` is absent (vite
dev server).

## Related packages

- `@hbc/sharepoint-platform` — reusable `SharePointListDescriptor` and REST
  endpoint builders.
- `@hbc/data-access` — error classes and retry/idempotency utilities used by
  the SharePoint adapter.
- `@hbc/ui-kit` — `WorkspacePageShell`, Fluent layout primitives consumed by
  the SPFx app.

## Deferred

- Azure Function-based background ingestion queue.
- Native offline-first field capture.
- `Safety Corrective Actions` list + UX.
- `Safety Publish Snapshots` list + Safety Field Excellence integration.
- `normalized-vNext` scoring.
- Service-principal cross-site writes (R1 uses current user auth).
