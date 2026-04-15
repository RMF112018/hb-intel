# Closure — Phase-11 Publisher remediation (consolidated)

**Scope:** `apps/hb-publisher` — `hb-publisher Feature 1.0.0.15`
**Package:** `docs/architecture/plans/MASTER/spfx/publisher/phase-11/`
**Prompts:**
1. `Prompt-01-Make-first-persistence-and-save-readiness-truthful.md`
2. `Prompt-02-Add-authoring-health-preflight-for-template-registry-and-bootstrap.md`
3. `Prompt-03-Make-promotion-rule-health-fail-truthful.md`
4. `Prompt-04-Prove-closure-with-regression-build-and-reporting.md` (this report)

## Summary verdict
Phase-11 is **closed**. Prompts 01–03 replaced three silent, reactive failure paths in the Publisher shell with three explicit, typed health models and wired them into action gating, right-rail narration, and top-of-canvas preflight UI. The supported Project Spotlight authoring path continues to work unchanged on a healthy environment. `tsc --noEmit` is clean. `vite build` is clean. The vitest suite reports 564 passing tests and 6 pre-existing failures in `src/data/publisherAdapter/__tests__/publisherEndToEnd.test.ts` that are unchanged from `main` at ef1c7860 and unrelated to the three remediation vectors in this package (see **Pre-existing unrelated residuals** below).

## Prompt-by-prompt closure proof

### Prompt 01 — Truthful first-persistence & save readiness (shipped as 1.0.0.12)
- **What changed:** explicit `SaveHealth` discriminated union in `controllers/saveHealthModel.ts`, `isPersisted` threaded through `useDraftLifecycle`, `useReadinessController` derives `saveEnabled` / `saveBlockedReason` from the typed state, and `ArticlePublisher.tsx` renders a new right-rail "Finish these before saving" block (`aria-live="polite"`) naming each missing tenant field.
- **First-persistence required-field set** mirrors the tenant MVP profile in `data/publisherAdapter/validation/validationEngine.ts`: `Title` (with `"Untitled article"` sentinel guard), `ProjectId` + `ProjectName`, `Subhead`, `SummaryExcerpt`, `BodyRichText` (via `isRichBodyEmpty`), `HeroPrimaryImage`, conditional `HeroPrimaryImageAltText`.
- **Subsequent saves** short-circuit to `readySubsequentPersistence` so the `DraftSaveOutcome` partial-persistence recovery model is fully preserved.
- **Tests added:** `controllers/saveHealthModel.test.ts` (15 cases) and four new `controllers/useReadinessController.test.ts` cases.
- **Closure artifact:** `closure-first-persistence-save-readiness.md`.

### Prompt 02 — Authoring-health preflight (shipped as 1.0.0.13)
- **What changed:** new `controllers/authoringHealthModel.ts` with the `AuthoringHealth` discriminated union (`loading | registryReadFailure | emptyRegistry | draftNoTemplateMatch | healthy`), eager preload of the template registry in `workspace/useDraftWorkspace.ts` with cancel-safe effect teardown and a typed `TemplateRegistryState`, folded into `useReadinessController` action gating, and surfaced in `ArticlePublisher.tsx` as a top-of-canvas `role="status" aria-live="polite"` banner.
- **Global vs draft-specific separation** is strict: `registryReadFailure` outranks `emptyRegistry`; global failures block every write; `draftNoTemplateMatch` blocks only Publish / Republish / Recompose preview, leaving the save-time resolver to own the targeted save refusal with its own copy.
- **Tests added:** `controllers/authoringHealthModel.test.ts` (10 cases) plus five new `useReadinessController` preflight cases.
- **Closure artifact:** `closure-authoring-health-preflight.md`.

### Prompt 03 — Fail-truthful promotion-rule health (shipped as 1.0.0.14)
- **What changed:** new `controllers/promotionRuleHealthModel.ts` with the `PromotionRuleHealth` discriminated union (`loading | loadFailure | readyEmpty | ready`). `useDraftWorkspace` now tracks loading / error / raw rows separately, derives `promotionRuleHealth`, and computes its selector-facing `promotionRules` via `promotionRulesFor(health)` so non-ready states degrade to `[]` deterministically. `useReadinessController` exposes `promotionRuleHealth` and a precomputed `promotionRuleHealthHeadline`; `ArticlePublisher.tsx` renders the headline inside the Promotion section (blocking-notice style for `loadFailure`, non-blocking for `readyEmpty`, no line when `ready`).
- **Selection precedence** (`destination > homepage > global`) is not modified; `promotionRuleSelector.ts` is untouched.
- **Tests added:** `controllers/promotionRuleHealthModel.test.ts` (7 cases) plus two new `useReadinessController` passthrough cases.
- **Closure artifact:** `closure-promotion-rule-health.md`.

## Changed code files
- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/index.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/useDraftLifecycle.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/useReadinessController.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/saveHealthModel.ts` (new)
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/authoringHealthModel.ts` (new)
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/promotionRuleHealthModel.ts` (new)
- `apps/hb-publisher/src/webparts/articlePublisher/workspace/useDraftWorkspace.ts`
- `apps/hb-publisher/config/package-solution.json` (version bumps only)

## Added / updated test files
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/saveHealthModel.test.ts` (new)
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/authoringHealthModel.test.ts` (new)
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/promotionRuleHealthModel.test.ts` (new)
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/useReadinessController.test.ts` (extended)

## Commands run
| Command | Result |
|---------|--------|
| `pnpm --filter @hbc/spfx-hb-publisher check-types` | ✅ clean (`tsc --noEmit` exit 0) |
| `pnpm --filter @hbc/spfx-hb-publisher test` | ⚠️ 564 pass / 6 fail — all 6 are pre-existing and unrelated (see below) |
| `pnpm --filter @hbc/spfx-hb-publisher build` | ✅ clean (`vite build` emitted `dist/hb-publisher-app.js`, ~1.08 MB / ~332 KB gz) |

## Pre-existing unrelated residuals
All 6 vitest failures are in `src/data/publisherAdapter/__tests__/publisherEndToEnd.test.ts`:

1. `publishes a valid post and writes a binding row with the composed identity`
2. `republish preserves the existing BindingId and stamps LastOperation=republish`
3. `blocks publish when content validation fails (missing Title) and writes nothing`
4. `blocks publish when a gallery image is missing alt text`
5. `blocks republish on an archived binding (no writes)`
6. `preview returns a structurally complete composition with validation attached, no writes`

These failures were verified to reproduce on `main` at commit ef1c7860 via a clean-stash run prior to Phase-11 work. They stem from the E2E fixture reporting outcome `stage === 'resolution'` where the test expects `'validation'` or `'policy'` — a resolution-context-seed issue in the fixture, not in the orchestrator. Phase-11 did not touch `publishResolutionContext.ts`, `publishOrchestrator.ts`, `validationEngine.ts`, `republishPolicy.ts`, `publisherWriters.ts`, or any of the fixtures/adapters exercised by these cases. They are tracked as orthogonal to this remediation wave.

## Supported Project Spotlight path — final confidence statement
- **Destination scope:** `projectSpotlight` remains the single supported destination; the unsupported-destination hard-block continues to produce its existing blocking notice unchanged.
- **Operational content types:** `monthlySpotlight` and `projectUpdate` remain the operational content types; `milestoneSpotlight` remains legacy-read-compatible and hard-blocks Publish/Republish via the unchanged milestone legacy hard-block.
- **Workflow progression:** no changes to `workflowStateMachine.ts`, `publishOrchestrator.ts`, `draftSaveOrchestrator.ts`, `publisherWriters.ts`, or `republishPolicy.ts`. `handleTransition`, `handlePublishAction`, and the staged `DraftSaveOutcome` recovery in `handleSave` all behave exactly as before on a healthy environment.
- **Truthful save/readiness/health messaging:**
  - First save of a well-formed Project Spotlight draft: `saveHealth = readyFirstPersistence`, `saveEnabled = true`, no right-rail "Finish these before saving" block, no preflight banner, no promotion-rule-health headline. Unchanged from the operator's perspective except that the button no longer lies on a half-formed draft.
  - Subsequent saves of the same draft: `saveHealth = readySubsequentPersistence`, partial-persistence recovery unchanged, status-banner copy unchanged.
  - Healthy authoring environment: no preflight banner. Registry-empty, registry-read-failure, and draft-no-template-match cases now each surface distinct, accessible, narrated messages with targeted action hints.
  - Healthy promotion ruleset: Promotion section shows only the existing promotion summary. `readyEmpty` adds the non-blocking "publisher defaults apply" headline; `loadFailure` adds the blocking headline with the underlying error message preserved.

Given the clean typecheck, clean production build, green targeted test suite for every Phase-11 module, unchanged supported-path behavior, and explicit attribution of the pre-existing residual failures to an orthogonal area of the adapter, Phase-11 is closed with high confidence for the supported Project Spotlight authoring path.

## Versioning across the phase
| Prompt | Solution version | Feature version | Commit |
|--------|------------------|-----------------|--------|
| Prompt 01 | `1.0.0.12` | `1.0.0.12` | save-health model + right-rail block |
| Prompt 02 | `1.0.0.13` | `1.0.0.13` | authoring-health preflight |
| Prompt 03 | `1.0.0.14` | `1.0.0.14` | promotion-rule health |
| Prompt 04 | `1.0.0.15` | `1.0.0.15` | consolidated closure report |
