# Prompt 02 — Fail closed on template required-field-set governance

## Objective

Eliminate the remaining fail-open behavior in which an unknown template `RequiredFieldSetKey` is treated as a warning and the validator falls back to global rules only.

The current repo has already scoped milestone legacy content out of normal publish/republish.
That intentional scope decision is not the defect.
The defect is that **operational templates** can still degrade to weaker validation when the registry contract is wrong.

## Why this matters technically

The template registry is control-plane authority.
If an operational registry row carries a bad required-field contract, the backend must not silently weaken enforcement and proceed as though the template is still valid.

The live repo already does two important things correctly:

- it blocks milestone legacy content from publish/republish
- it threads template-registry health into readiness/preflight

But the validation engine still tolerates unknown `RequiredFieldSetKey` values with a warning fallback.
That is still too permissive for operational templates.

## Governing repo surfaces

At minimum inspect and keep aligned:

- `apps/hb-publisher/src/data/publisherAdapter/validation/validationEngine.ts`
- `apps/hb-publisher/src/data/publisherAdapter/validation/validationEngine.test.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/authoringHealthModel.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/useReadinessController.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/useDraftLifecycle.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/draftHelpers.ts`
- `apps/hb-publisher/src/data/publisherAdapter/templateResolver.ts`
- `docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`

Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Current repo-truth reality you must preserve

The current codebase already contains intentional distinctions:

- milestone legacy content is read-compatible and preview-compatible but blocked from create/republish
- the live validation tests currently prove unknown-key fallback for a milestone-style key
- template-registry environment failures (`emptyRegistry`, `registryReadFailure`, `loading`) already influence authoring readiness
- save-time template resolution already exists and can block save if no template resolves at all

Do not collapse these distinctions into a blunt global block.
Instead, make the contract stronger where it actually matters.

## Exact defect to close

Repo truth today still allows this behavior for an operational template row:

- `RequiredFieldSetKey` is unknown or unsupported
- validation emits a warning on `template.RequiredFieldSetKey`
- global rules still run
- a well-formed draft can still present as publishable even though the template-specific contract is unresolved

That is still a fail-open governance seam.

## Required end state

Implement **fail-closed required-field-set governance for operational templates**.

Required behavior:

1. unknown or unsupported `RequiredFieldSetKey` on an operational template must block publish
2. the author-facing readiness/preflight surfaces must explain that the template contract itself is invalid
3. save behavior must not misrepresent the draft as healthy when the active operational template contract is unresolved
4. any legacy exception path must be explicit, narrow, and documented in code and tests

## Required classification model

You must make the repo’s behavior explicit rather than accidental.

At minimum classify templates into one of these bounded states:

- valid operational required-field-set contract
- invalid operational required-field-set contract
- intentionally non-operational / legacy path that is not allowed to publish anyway

You may implement this through:
- explicit allow-list/registry of operational required-field-set keys
- a stronger type/lookup structure
- a template-contract resolver result with structured status
- another bounded pattern

But the result must be deterministic and testable.

## Non-negotiable rules

- do not leave unknown operational keys as warning-only
- do not accidentally re-open milestone publishing
- do not weaken existing readiness/preflight behavior
- do not solve this only in UI copy
- do not silently treat “unknown key” and “legacy blocked content type” as the same thing unless the code and tests make that distinction explicit

## Test requirements

Update or replace the current tests so they prove the new posture at minimum for:

1. known operational key -> behavior preserved
2. unknown operational key -> publish blocked
3. unknown operational key -> readiness/preflight narrates contract failure truthfully
4. legacy milestone path remains blocked for publish/republish without pretending it is an operational contract error
5. preview/read compatibility for legacy content is not accidentally widened into operational publish support
6. no stale tests remain that still encode the old warning-only fallback as correct behavior for operational templates

## Closure notes required

Write concise closure notes that state:

- how required-field-set contracts are now classified
- where fail-closed behavior lives
- how operational-template invalidity is surfaced to the author
- how legacy milestone scope remains intentionally bounded
- which tests prove the old fail-open behavior is gone
