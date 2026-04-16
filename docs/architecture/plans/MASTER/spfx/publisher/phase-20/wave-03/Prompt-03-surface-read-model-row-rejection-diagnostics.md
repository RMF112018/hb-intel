# Prompt 03 — Surface read-model row rejection diagnostics

## Objective

Stop silently hiding malformed SharePoint rows when publisher row mappers reject them.

The live repo still filters rejected rows away through repository mapping without durable surfaced diagnostics.
That is operationally weak.
Finish the read-truth loop.

## Why this matters technically

The current read layer still allows a malformed SharePoint row to disappear from the app with little or no structured signal.

That can cause:

- team members to vanish
- media rows to vanish
- destination bindings to vanish
- workflow history to appear incomplete
- publishing errors to disappear from the read model
- support staff to see “missing data” symptoms rather than a truthful parse failure

This is a backend/read-model integrity issue, not a cosmetic issue.

## Governing repo surfaces

At minimum inspect and keep aligned:

- `apps/hb-publisher/src/data/publisherAdapter/publisherRowMappers.ts`
- `apps/hb-publisher/src/data/publisherAdapter/publisherRepositories.ts`
- `apps/hb-publisher/src/data/publisherAdapter/publishResolutionContext.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/useDraftLifecycle.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/useReadinessController.ts`
- any tests that already cover mapper or repository behavior
- `docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`

Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Current repo-truth reality you must preserve

The repo already contains some intentional strictness:

- several row mappers deliberately reject bad rows rather than coercing them
- team-member reads now explicitly require expanded `PersonPrincipal` structure
- the publish orchestrator already has stronger typed failure classification than earlier waves

Do not undo those good strictness decisions.
The missing piece is truthful diagnostics around rejection.

## Exact defect to close

Repo truth still behaves like this:

- mapper returns `undefined` on malformed raw list data
- repository helpers such as `mapAll(...)` filter `undefined` rows away
- most callers receive only the surviving rows
- no structured parse-diagnostics surface is carried through the load path

That is still silent data loss from the app’s perspective.

## Required end state

Implement a **bounded structured read-diagnostics pattern** for mapper rejection.

Required outcome:

1. malformed row rejection must produce structured diagnostic information
2. callers must be able to distinguish “no rows existed” from “rows existed but some were rejected”
3. the load/read path must expose enough signal for:
   - operator-facing health where appropriate
   - support/debug visibility
   - deterministic tests
4. required operational reads must fail or narrate truthfully rather than silently degrading

## Allowed implementation patterns

You may choose the exact pattern, but it must be consistent and testable.

Acceptable directions include:

- repository methods return `{ rows, diagnostics }`
- mapper result objects carry `ok/error` instead of `row | undefined`
- publish-resolution loads collect parse failures into a structured diagnostics collection
- required reads (for example current binding) fail closed on duplicate/malformed ambiguity while optional child collections can load with warnings

Choose one coherent pattern and apply it deliberately.
Do not leave mixed ad hoc behavior.

## Important design guidance

Use the severity of the read surface to decide behavior:

### Primary identity / control-plane rows
For reads like the master article or current binding, malformed or ambiguous data should generally fail closed rather than disappear quietly.

### Optional child rows
For rows like team members or media, the app may continue loading surviving valid rows, but it must retain structured diagnostics and surface them truthfully.

### Workflow / error history
Do not allow the support surfaces themselves to become silently lossy.

## Non-negotiable rules

- do not solve this by only adding console logging
- do not keep repository signatures effectively silent while just sprinkling comments in the code
- do not create a new SharePoint list for diagnostics unless exhaustive review proves the current code cannot carry the needed signal
- do not coerce malformed rows into “best effort” fake validity just to avoid surfacing the issue

## Test requirements

Add or update tests to prove at minimum:

1. malformed team-member row produces diagnostics and does not disappear silently
2. malformed media row produces diagnostics and does not disappear silently
3. malformed binding row is surfaced as a control-plane read problem, not a quiet omission
4. valid rows still load without regression
5. callers that need the diagnostics can actually receive them through the chosen interface

## Closure notes required

Write concise closure notes that state:

- which diagnostic pattern was chosen
- which repository/read surfaces now carry diagnostics
- which reads fail closed versus degrade with warnings
- which tests prove malformed rows are no longer silently hidden
