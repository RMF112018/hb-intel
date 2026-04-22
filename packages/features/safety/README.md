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
      → resolving-project ─ unresolved-project (terminal review-required)
          → parsed
              → duplicate-checked ─ high-confidence-duplicate (terminal review-required)
                  → scoring
                      → commit-pending
                          ├── committed (terminal success)
                          └── commit-failed (terminal retryable)
```

Every terminal state writes a `Safety Ingestion Run` row. Retries re-read the
workbook from the upload library and write a new run with
`AttemptNumber += 1`.

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
   Field schema for each list is in `src/lists/fieldSchema.ts`.
3. Capture each list's GUID and populate the corresponding descriptor in
   `src/lists/descriptors.ts`. The runtime fails closed if a descriptor still
   holds the zero-value GUID.
4. Grant safety coordinators **Contribute** on `Safety Checklist Uploads` and
   **Contribute** on the five HBCentral lists.
5. Grant safety coordinators **Read** on `Projects` and
   `Legacy Project Fallback Registry` on HBCentral.
6. Deploy the SPFx solution (`apps/safety/`).

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
