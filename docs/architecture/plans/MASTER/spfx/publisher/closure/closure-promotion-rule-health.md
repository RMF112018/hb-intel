# Closure — Promotion-rule health is fail-truthful

**Scope:** `apps/hb-publisher` — `hb-publisher Feature 1.0.0.14`
**Prompt:** `docs/architecture/plans/MASTER/spfx/publisher/phase-11/Prompt-03-Make-promotion-rule-health-fail-truthful.md`

## Defect that was closed
`useDraftWorkspace` loaded `repositories.promotionRules.listActive()` and silently collapsed any thrown error into `setPromotionRules([])`. Two materially different operational states — "no active rules are configured" and "the rules failed to load" — produced identical shell behaviour and identical promotion summary copy, so operators had no way to tell whether the current promotion behaviour reflected genuine policy absence, deterministic fallback, or degraded policy health.

## Promotion-rule health states introduced
New module: `apps/hb-publisher/src/webparts/articlePublisher/controllers/promotionRuleHealthModel.ts`.

`PromotionRuleHealth` discriminated union (priority enforced by `derivePromotionRuleHealth`):
1. `loading` — read is in flight.
2. `loadFailure` (with `message`) — read threw; outranks `readyEmpty` so an intermittent fault is never misreported as "no rules configured".
3. `readyEmpty` — successful read, zero active rows.
4. `ready` — successful read, at least one active row.

Companion helpers:
- `promotionRulesFor(health)` — selector-facing reducer; degrades to `[]` for every non-`ready` state so selection precedence and save-time normalization stay deterministic and safe.
- `isPromotionRuleLoadFailure(health)` — boolean for action gating / diagnostics.
- `promotionRuleHealthHeadline(health)` — concise operator-facing line, `undefined` when `ready`.

## Failure vs genuine empty configuration
- **`loadFailure`**: "Promotion rules failed to load — {message}. Publisher defaults are applied as a safety fallback." Rendered with the blocking notice style so operators can tell the difference at a glance. The underlying error message is preserved so support / debugging remains actionable.
- **`readyEmpty`**: "No active promotion rules are configured — publisher defaults apply." Rendered with the non-blocking notice style; this is a deliberate steady state, not a fault.
- **`ready`**: no headline; the existing promotion summary is the sole voice, exactly as before.

## Shell surfaces that expose policy health
- `workspace/useDraftWorkspace.ts` now tracks `promotionRulesRaw`, `promotionRulesLoading`, `promotionRulesError` with cancel-safe effect teardown, derives `promotionRuleHealth`, and exposes it alongside the existing `promotionRules` array (computed via `promotionRulesFor(health)` so consumers keep the deterministic-empty behaviour on non-ready states).
- `controllers/useReadinessController.ts` accepts `promotionRuleHealth` and returns it plus a precomputed `promotionRuleHealthHeadline`. No action gating is wired to promotion-rule health — failed rule load does not block save/publish, it just narrates truthfully — which preserves the current supported Project Spotlight flow.
- `ArticlePublisher.tsx` reads the two passthrough values and renders a `role="status" aria-live="polite"` line inside the Promotion section above the existing `promotionSummary`. The line uses `canvasNoticeBlocking` for `loadFailure` and `canvasNotice` for `readyEmpty`, and disappears entirely when the ruleset is `ready`.

## Selection precedence unchanged
- `promotionRuleSelector.ts` is not modified. The `destination > homepage > global` precedence continues to govern selection.
- Save-time normalization in `useDraftLifecycle.handleSave()` still applies locked policies because `workspace.promotionRules` remains an array input on success. On `loadFailure` or `readyEmpty` the array degrades to `[]`, which is exactly the selector's documented safe fallback behaviour.

## Tests added / updated
- `controllers/promotionRuleHealthModel.test.ts` (new, 7 cases) — pins priority order (loading → loadFailure → readyEmpty → ready), the `loadFailure` preference over `readyEmpty`, the deterministic `[]` reducer for every non-ready state, and headline copy distinctness.
- `controllers/useReadinessController.test.ts` extended with 2 cases covering `loadFailure` vs `readyEmpty` headline distinctness and the healthy-ready no-headline case.
- Existing Phase-11 Prompt-01 save-health cases, Prompt-02 authoring-health cases, and milestone legacy hard-block cases all remain green.

## Verification performed
- `pnpm --filter hb-publisher test` — 564 pass, 6 unchanged pre-existing failures in `src/data/publisherAdapter/__tests__/publisherEndToEnd.test.ts` (also fail on main at ef1c7860; not in scope for this prompt).
- `pnpm --filter hb-publisher check-types` — clean.

## Versioning
- `apps/hb-publisher/config/package-solution.json`: `1.0.0.13` → `1.0.0.14` (both `solution.version` and the `hb-publisher Feature` entry).
