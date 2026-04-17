# Publisher list key contract — authoritative reference

Owner: Article Publisher backend (apps/hb-publisher).
Companion: `publisher-list-schema-report.md` (tenant field discovery).
Scope: the text-key identity columns the live backend depends on.

The publisher uses **text keys**, not SharePoint lookup columns, as the
identity primitives across its eight operational lists. That posture is
durable only if the key contract is explicit and enforced. This file is
the authoritative source for:

1. which columns carry identity,
2. the uniqueness / index posture expected on each,
3. where code-side duplicate detection lives when SharePoint
   enforcement is not assumed, and
4. the failure behavior when the contract is violated.

If this file and the live repo disagree, the live repo wins and this
file must be updated.

## Contract at a glance

| List | Key column | Role | Uniqueness | Index recommended | Duplicate failure seam |
|------|------------|------|------------|-------------------|------------------------|
| HB Articles | `ArticleId` | Primary identity | **Required unique** | Yes | `articles.getByArticleId` — refuses duplicate reads |
| HB Articles | `Slug` | Operational identity (destination scope) | Unique within Destination | Yes (+ Destination) | Enforced at hosted publish via SharePoint Pages REST (page filename collision); slug governance layer in `slugGovernance.ts` |
| HB Article Destination Pages | `BindingId` | Binding identity | **Required unique** | Yes | Writer emits a new `BindingId` per create; reads keyed by `ArticleId` |
| HB Article Destination Pages | `ArticleId` | Foreign key to master | **1:1 with master row** | Yes | `pageBindings.getByArticleId` + `pageBindingWriter.findExistingItemId` — both refuse duplicate matches |
| HB Article Team Members | `TeamMemberId` | Row identity | **Required unique** | Yes (+ `ArticleId`) | Row rejection surfaces via `readDiagnostics` |
| HB Article Team Members | `ArticleId` | Foreign key | Many-to-one | Yes | — |
| HB Article Media | `MediaId` | Row identity | **Required unique** | Yes (+ `ArticleId`) | Row rejection surfaces via `readDiagnostics` |
| HB Article Media | `ArticleId` | Foreign key | Many-to-one | Yes | — |
| HB Article Template Registry | `TemplateKey` | Template identity | **Required unique** | Yes | `templateRegistry.getByKey` — refuses duplicate reads |
| HB Article Promotion Rules | `RuleId` | Rule identity | **Required unique** | Yes | Row rejection surfaces via `readDiagnostics` |
| HB Article Workflow History | `HistoryId` | Append-only identity | **Required unique** | Yes (+ `ArticleId`) | Writer generates a new id per append |
| HB Article Workflow History | `ArticleId` | Foreign key | Many-to-one | Yes | — |
| HB Article Publishing Errors | `ErrorId` | Append-only identity | **Required unique** | Yes (+ `ArticleId`) | Writer generates a new id per append |
| HB Article Publishing Errors | `ArticleId` | Foreign key | Many-to-one | Yes | — |

"Required unique" means the app treats duplicate values on this column
as a control-plane defect and fails closed. "Index recommended" is a
provisioning hint — SharePoint indexes are the strongest operational
lever for listing performance at scale; the live app does not depend
on an index to be correct, but operators should set one.

## Code-side enforcement

The backend does not currently assume SharePoint-enforced uniqueness
on these columns because the tenant schema report does not prove it.
Instead, every critical identity read and the binding writer carry
explicit duplicate detection:

- `articles.getByArticleId` — queries with `$top=2`; duplicate matches
  push a `readDiagnostics` entry and return `undefined`.
- `pageBindings.getByArticleId` — queries with `$top=2`; same posture.
- `templateRegistry.getByKey` — queries with `$top=2`; same posture.
- `pageBindingWriter.findExistingItemId` — queries with `$top=2`;
  duplicate matches fail the upsert with
  `reason: 'duplicateBindings'` so the orchestrator surfaces a
  typed failure instead of merging an arbitrary row.

List scans (`articles.listByWorkflowState`, child `listByArticle`
methods) do not fail closed; they return all mapped rows and emit
`readDiagnostics` entries for any rows the mappers refused. This is
consistent with Wave-03 Prompt-03 closure: surviving valid rows still
load, rejections become durable signals rather than silent drops.

## Provisioning posture (target state)

Operators provisioning the publisher lists on HBCentral should set:

1. Uniqueness / required on every `*Id` and `TemplateKey` column (set
   "Require that this column contains unique values" + "Require that
   this column contains information" in SharePoint).
2. Additional indexes on child-list `ArticleId` columns for
   `listByArticle` query performance.
3. A compound (Destination, Slug) index on `HB Articles` if slug scale
   warrants it; this is performance-only, not correctness-critical.

If you cannot set uniqueness at provisioning time (for example because
the list already contains historical duplicates), keep the code-side
detection described above. Duplicate diagnostics will surface the
problem for repair rather than hiding it.

## Drift detection

This file is the authoritative place to encode the key contract.
When you change the list schema, update this file. When the schema
report (`publisher-list-schema-report.md`) changes, cross-check the
contract here and update if uniqueness / index guidance shifts. If a
new key column is added to any publisher list, add it here before
depending on it in code.

If duplicate detection becomes noisy in production because a list
genuinely should tolerate duplicates, reconsider whether the column
is identity at all — demoting from "identity" to "attribute" is an
explicit design decision that belongs in this file and, where the
change is architecturally significant, in an ADR.

## References

- `apps/hb-publisher/src/data/publisherAdapter/publisherRepositories.ts`
- `apps/hb-publisher/src/data/publisherAdapter/pageBindingWriter.ts`
- `apps/hb-publisher/src/data/publisherAdapter/publisherRowMappers.ts`
- `docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`
