# Closure — Authoring-health preflight for template registry and bootstrap

**Scope:** `apps/hb-publisher` — `hb-publisher Feature 1.0.0.13`
**Prompt:** `docs/architecture/plans/MASTER/spfx/publisher/phase-11/Prompt-02-Add-authoring-health-preflight-for-template-registry-and-bootstrap.md`

## Defect that was closed
Template resolution was a hard dependency of Save and Publish, but the shell only loaded the active-template registry lazily inside `handleSave()` / `buildPublishResolutionContext()`. An operator could load the Publisher, start authoring, and only learn that the `HB Article Template Registry` was empty or unreadable through a reactive action-time failure — a meaningful risk given the tenant extraction report already recorded all publisher lists as empty at extraction time. The shell did not model this as an environment-health problem and did not distinguish "environment is broken" from "this draft does not match an active template."

## Authoring-health states introduced
New module: `apps/hb-publisher/src/webparts/articlePublisher/controllers/authoringHealthModel.ts`.

`AuthoringHealth` discriminated union (priority order enforced by `deriveAuthoringHealth`):
1. `loading` — registry `listActive()` is still in flight.
2. `registryReadFailure` (with `message`) — global bootstrap failure; takes precedence over emptiness so an intermittent throw is not misreported as "no active templates".
3. `emptyRegistry` — global environment failure; registry returned zero rows.
4. `draftNoTemplateMatch` (with resolver `reason` + `message`) — **draft-specific**, author-actionable; registry is healthy but the active draft's discriminators (`Destination` / `ArticleContentType` / `SpotlightType` / `ProjectStage` / `ArticleSubject` / `TemplateKey` override) do not resolve.
5. `healthy`.

Companion helpers `isAuthoringHealthy`, `isGlobalAuthoringFailure`, `authoringHealthHeadline`, and `authoringHealthActionHint` route copy so global bootstrap failures get platform-team / reload hints and draft-specific no-match gets author-actionable discriminator guidance.

## Global vs draft-specific separation
- **Global bootstrap failures** (`registryReadFailure`, `emptyRegistry`, `loading`) block every write action — Save draft, Recompose preview, Publish, Republish — because none of those pipelines can succeed without a usable registry.
- **Draft-specific `draftNoTemplateMatch`** blocks Publish and Republish (they need a resolved template for downstream validation, shell compatibility, and binding rules) but **does not** block Save, because `resolveTemplateKeySystemManaged` already refuses the save-time master upsert with its own targeted copy from inside `useDraftLifecycle.handleSave()`; layering a second, less specific preflight message on top would be redundant and contradictory.

## Shell surfaces that expose the signal
- `workspace/useDraftWorkspace.ts` preloads `repositories.templateRegistry.listActive()` once per repositories identity and exposes a typed `TemplateRegistryState` (`{ loading, rows, error }`). Cancellation is handled on effect teardown.
- `controllers/useReadinessController.ts` accepts `templateRegistry` and the active `articleDraft`, derives `authoringHealth`, and folds the preflight into action gating (`publishEnabled`, `republishEnabled`, `saveEnabled`). The controller also threads a dedicated `saveBlockedReason` when the preflight is the proximate cause so the Save button tooltip reads truthfully.
- `ArticlePublisher.tsx` renders a top-of-canvas `role="status" aria-live="polite"` block (always visible regardless of whether a draft is loaded) that shows the headline, the underlying message where relevant (`registryReadFailure`, `draftNoTemplateMatch`), and the appropriate action hint. The block is suppressed while `loading` and while the environment is `healthy`, so it clears cleanly when the registry becomes usable again — no stale error residue.

## Action gating rules now enforced
| Health state            | Save | Recompose preview | Publish | Republish |
|-------------------------|------|-------------------|---------|-----------|
| `loading`               | ✗    | ✗                 | ✗       | ✗         |
| `registryReadFailure`   | ✗    | ✗                 | ✗       | ✗         |
| `emptyRegistry`         | ✗    | ✗                 | ✗       | ✗         |
| `draftNoTemplateMatch`  | ✓ (save-time resolver owns the block + targeted copy) | ✗ | ✗ | ✗ |
| `healthy`               | Governed by the Phase-11 Prompt-01 save-health model and the existing publish-validation / binding gates. |

Unrelated gates (milestone legacy hard-block, unsupported-destination, publish-validation) remain unchanged and continue to produce their own specific copy — preflight never overrides their messages.

## Tests added / updated
- `controllers/authoringHealthModel.test.ts` (new, 10 cases) — pins priority order, the `registryReadFailure` > `emptyRegistry` rule, the healthy-no-draft case, draft-specific no-match carrying the resolver reason, and the copy helpers keeping global vs draft copy distinct.
- `controllers/useReadinessController.test.ts` extended with 5 cases covering empty / read-failure / draft-no-match / healthy / loading gating for Publish and Save, plus the preflight-specific `saveBlockedReason` copy.
- Existing milestone legacy hard-block cases and Prompt-01 save-health cases remain green.

## Tenant-schema consistency
- Preflight consumes the same `PublisherTemplateRegistryRow` contract already enforced by `templateResolver.ts`; no new schema, no new list, no new data plumbing — just a typed read of the seam that already governs `handleSave()` and `buildPublishResolutionContext()`.
- Resolver reasons surfaced in `draftNoTemplateMatch` are the existing `TemplateResolutionFailureReason` enum; no new failure vocabulary introduced.
- No changes to `draftSaveOrchestrator`, `publisherWriters`, `publishOrchestrator`, or `validationEngine`.

## Verification performed
- `pnpm --filter hb-publisher test` — 555 pass, 6 unchanged pre-existing failures in `src/data/publisherAdapter/__tests__/publisherEndToEnd.test.ts` (also fail on main at ef1c7860; not touched by this prompt).
- `pnpm --filter hb-publisher check-types` — clean.

## Versioning
- `apps/hb-publisher/config/package-solution.json`: `1.0.0.12` → `1.0.0.13` (both `solution.version` and the `hb-publisher Feature` entry).
