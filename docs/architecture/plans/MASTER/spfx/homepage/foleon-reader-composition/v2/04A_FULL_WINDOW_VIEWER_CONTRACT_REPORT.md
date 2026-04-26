# Full-Window Viewer Contract Report

## Scope

Phase-04 Wave-01 Prompt-04A introduces a **shared, reusable Foleon full-window viewer contract** so any Foleon article/card can open its selected document in a focused full-window reading experience. This is a shared-infrastructure pass: visible Spotlight, Pulse, and Leadership layouts are unchanged. The pass adds the target model, the lane-scoped state ownership (Context provider + hook), the overlay component, the view-model field for article cards, and structured `openViewer` results — but does **not** retrofit any lane to call `openViewer` from a card click. That retrofit is Prompt 04B.

Out of scope: lane redesigns (Leadership lane redesign is Prompt 05; Spotlight/Pulse retrofit is Prompt 04B); inline iframe behavior changes; iframe origin-policy changes; route map changes; backend sync; SharePoint schemas; shell edge contract activation; Safety, HB Kudos, People & Culture.

## Baseline Inputs

- `00_BASELINE_AUDIT.md`
- `01_EDGE_CONTRACT_REPORT.md`
- `02_VIEW_MODEL_AND_REGISTRY_REPORT.md`
- `03_PROJECT_SPOTLIGHT_LAYOUT_REPORT.md`
- `04_COMPANY_PULSE_LAYOUT_REPORT.md`

The Prompt-01 edge contract is unchanged. Prompt-02/03/04 view-model and lane structures are extended additively — `primaryArticle` is a new optional field consumed only by future card-launch code.

## Source Files Changed

| File | Change |
|---|---|
| `packages/foleon-reader/src/readers/FoleonViewerTypes.ts` | **New.** `FoleonViewerSource`, `FoleonViewerDisabledReason`, `FoleonViewerTarget`, `FoleonArticleCardViewModel`, `FoleonViewerOpenResult` (discriminated `{ opened: true, target } \| { opened: false, reason }`), and the **internal** adapters `createReadyFoleonViewerTarget`, `createPreviewFoleonViewerTarget`. The lane-key mapping is duplicated locally to break a runtime import cycle with `FoleonReaderViewModel.ts` (only the type is imported across the seam). |
| `packages/foleon-reader/src/components/FoleonFullWindowViewer.tsx` | **New, internal.** Overlay component. `role="dialog"` + `aria-modal="true"` + `aria-labelledby`. Hosts the iframe via `FoleonIframeHost` (same origin policy as the inline path). Loading/error/blocked surface for disabled targets. Focus moves into close button on open; Escape closes; Tab cycles within the dialog only (scoped trap, never permanent). |
| `packages/foleon-reader/src/components/FoleonFullWindowViewer.module.css` | **New.** Overlay styles. No global `overflow-x: hidden` — containment is scoped to the overlay. |
| `packages/foleon-reader/src/components/FoleonFullWindowViewer.module.css.d.ts` | **New.** Hand-written type declaration. |
| `packages/foleon-reader/src/components/FoleonFullWindowViewerProvider.tsx` | **New.** `FoleonFullWindowViewerProvider` + `useFoleonFullWindowViewer()`. Owns viewer state (`currentTarget`), `openViewer(target, launchElement?)`, `closeViewer()`. `openViewer` returns a structured `FoleonViewerOpenResult` — disabled targets are **never** silent no-ops. Restores focus to the launch element on close (when supplied). Renders `<FoleonFullWindowViewer>` when a target is active. Threads four optional viewer-telemetry callbacks distinct from inline iframe lifecycle. |
| `packages/foleon-reader/src/readers/FoleonReaderViewModel.ts` | Adds `primaryArticle?: FoleonArticleCardViewModel` to the view model. Both adapters (preview + ready) populate it for all three governed lanes. The ready adapter passes `resolution.embedUrl` to `createReadyFoleonViewerTarget` so the target's `viewerUrl` matches what the inline iframe path uses. |
| `packages/foleon-reader/src/readers/FoleonReaderModule.tsx` | Adds four optional viewer telemetry props (`onViewerOpen`, `onViewerClose`, `onViewerIframeLoaded`, `onViewerIframeError`) — all distinct from the existing inline iframe lifecycle (`onReaderOpen` / `onReaderClose` / `onEmbedError` / `onGateBlocked`). Wraps the rendered layout in `<FoleonFullWindowViewerProvider originPolicy={contract.originPolicy} …>` for both preview and ready paths. Loading / error / blocked branches are unchanged (no provider needed because no lane layout renders). |
| `packages/foleon-reader/src/index.ts` | Adds **conservative** public exports: types only (`FoleonViewerSource`, `FoleonViewerDisabledReason`, `FoleonViewerTarget`, `FoleonViewerOpenResult`, `FoleonArticleCardViewModel`, `FoleonFullWindowViewerContextValue`, `FoleonFullWindowViewerProviderProps`) plus `FoleonFullWindowViewerProvider` and `useFoleonFullWindowViewer`. The viewer component itself and the target adapters stay internal. |
| `packages/foleon-reader/src/readers/__tests__/FoleonViewerTypes.test.ts` | **New.** Adapter tests: ready target maps `embedUrl` → `viewerUrl` and `publishedUrl` → `url` and resolves `canOpen=true`; disabled with `'no-embed-url'` / `'embed-not-allowed'` / `'requires-external-open'`; the orchestrator can override `embedUrl` with the resolution-derived URL; preview targets always `canOpen=false` with `disabledReason='preview-only'`. |
| `packages/foleon-reader/src/components/__tests__/FoleonFullWindowViewerProvider.test.tsx` | **New.** Provider/hook + viewer tests: open success returns `{ opened: true, target }` and renders the dialog; preview target returns `{ opened: false, reason: 'preview-only' }` and does NOT render the dialog; `embed-not-allowed` returns `{ opened: false, reason: 'embed-not-allowed' }`; close removes the dialog, fires `onViewerClose`, and returns focus to the launch element; Escape closes; using the hook outside a provider returns the structured-refusal default (no silent no-op); iframe inside the dialog mounts via `FoleonIframeHost` with descriptive title. |
| `apps/hb-homepage/config/package-solution.json` | Bump solution + feature versions `1.1.84.0` → `1.1.85.0`. |
| `apps/hb-homepage/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json` | Bump web-part version `1.1.84.0` → `1.1.85.0`. |
| `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json` | Bump runtime-copy version `1.1.84.0` → `1.1.85.0`. |
| `packages/homepage-launcher/src/constants.ts` | Bump `HOMEPAGE_LAUNCHER_VERSION` `'1.1.84.0'` → `'1.1.85.0'`. |

Files explicitly **not touched**: `ProjectSpotlightReaderLayout.tsx`, `CompanyPulseReaderLayout.tsx`, `LeadershipMessageReaderLayout.tsx`, `FoleonReaderCompatibilityLayout.tsx`, `FoleonReaderLayoutRegistry.tsx`, `FoleonIframeHost.tsx`, `FoleonStates.tsx`, `FoleonReaderContentService.ts`, all shell / entry-stack code, `apps/hb-webparts/src/webparts/hbHomepage/wiring/foleonHomepageConfig.ts`, `FoleonHomepageLaneHost.tsx`, all foleon-content / foleon-runtime types beyond the consumed URL fields, Foleon governance / route / sync / schema files, Safety / Kudos / People & Culture.

## Viewer Target Model

```ts
export type FoleonViewerSource = 'active-record' | 'archive' | 'preview' | 'manual';

export type FoleonViewerDisabledReason =
  | 'no-embed-url'
  | 'embed-not-allowed'
  | 'requires-external-open'
  | 'preview-only'
  | 'unknown';

export interface FoleonViewerTarget {
  readonly id: string;
  readonly lane: FoleonReaderLayoutKey;
  readonly source: FoleonViewerSource;
  readonly title: string;
  readonly summary?: string;
  readonly url?: string;          // ← FoleonContentRecord.publishedUrl
  readonly viewerUrl?: string;    // ← FoleonContentRecord.embedUrl
  readonly publishedLabel?: string;
  readonly categoryLabel?: string;
  readonly canOpen: boolean;
  readonly disabledReason?: FoleonViewerDisabledReason;
}

export type FoleonViewerOpenResult =
  | { readonly opened: true; readonly target: FoleonViewerTarget }
  | { readonly opened: false; readonly reason: FoleonViewerDisabledReason };
```

### Confirmed `FoleonContentRecord` URL/embed mapping

Source: `packages/foleon-reader/src/types/foleon-content.types.ts:67-84` (verified pre-implementation).

| Target field | Source field | Notes |
|---|---|---|
| `viewerUrl` | `record.embedUrl` (or orchestrator-supplied `resolution.embedUrl`) | Same URL the existing inline `FoleonIframeHost` uses. The viewer reuses `FoleonIframeHost` under the **same** origin policy — no new origin-policy surface. |
| `url` | `record.publishedUrl` | External "view on Foleon" link. |
| `canOpen` | `record.embedUrl` exists ∧ `record.allowEmbed` ∧ `!record.requiresExternalOpen` | All three signals live on `FoleonContentRecord`. |
| `disabledReason` | `'no-embed-url'` (no embedUrl) ∨ `'embed-not-allowed'` (allowEmbed=false) ∨ `'requires-external-open'` (requiresExternalOpen=true) ∨ `'preview-only'` (preview adapter) | Schema-derived; `'unknown'` is reserved for defensive code paths. |

`record.previewUrl` is **not** consumed by this contract — it is admin-only preview content and is outside the in-line viewer's scope.

## Viewer State Ownership

**Lane-scoped.** `FoleonFullWindowViewerProvider` is added inside `FoleonReaderModule.tsx`. Each `FoleonReaderModule` invocation creates its own provider, so the homepage's three Foleon lanes (Project Spotlight, Company Pulse, Leadership Message) carry three independent viewer states. Opening the viewer in one lane does not surface the viewer in the others. This is intentional — it lets each lane's launch elements (cards, Open archive buttons, etc.) own their own focus-restore target without cross-lane state leaks.

A single homepage-level provider was considered but rejected for this prompt because it would require touching `apps/hb-webparts/src/webparts/hbHomepage/zones/FoleonHomepageLaneHost.tsx` or similar shell-adjacent surfaces, widening the change blast radius beyond the Foleon-reader package. Lane-scoped is the lower-risk default. A future prompt can promote to a homepage-level provider if cross-lane viewer coordination becomes necessary.

The hook `useFoleonFullWindowViewer()` is safe to call outside a provider — the default Context value returns a structured-refusal `openViewer` that emits `{ opened: false, reason: target.disabledReason ?? 'unknown' }`, so missing-provider paths are observable and never silent.

## Full-Window Viewer Component

`FoleonFullWindowViewer` (internal) is the overlay rendered by the provider when a target is active. Composition:

```
<div role="dialog" aria-modal="true" aria-labelledby={titleId}
     data-foleon-full-window-viewer="active"
     data-foleon-viewer-lane={lane}
     data-foleon-viewer-source={source}>
  <header>
    <eyebrow (target.categoryLabel)>
    <h2 id={titleId}>{target.title}</h2>
    <metadata (target.publishedLabel)>
    <button aria-label="Close Foleon viewer">Close</button>
  </header>
  <body>
    {target.canOpen
      ? <FoleonIframeHost src={target.viewerUrl} title="… — Foleon viewer" policy={originPolicy} … />
      : <statePanel role="status" aria-live="polite">
          <heading>{formatDisabledHeading(reason)}</heading>
          <body>{formatDisabledBody(reason)}</body>
        </statePanel>}
  </body>
</div>
```

## Preview Behavior

- Preview cards (populated by `createPreviewFoleonReaderViewModel` for every governed lane) carry a target with `canOpen: false`, `disabledReason: 'preview-only'`, no `viewerUrl`, no `url`.
- Calling `openViewer(previewTarget)` returns `{ opened: false, reason: 'preview-only' }` — the dialog does **not** open. Layouts that wire a card click in Prompt 04B should respect this result and render a tooltip / muted control rather than a fake open.
- Preview cards are clearly labeled via `previewOnly: true` on `FoleonArticleCardViewModel` and via the existing visible "Preview layout" banner in each lane's preview layout.

## Ready Behavior

- Ready cards are populated from `FoleonContentRecord` only. The orchestrator passes `resolution.embedUrl` so the card target uses the same URL the inline iframe path validates.
- `openViewer(readyTarget)` with `canOpen: true` renders the dialog and emits `onViewerOpen(target)`. The iframe is mounted via `FoleonIframeHost` with the runtime contract's origin policy.
- The existing inline iframe surface is **not** removed in this prompt. Spotlight and Pulse layouts continue rendering their existing iframe surface unchanged. Prompt 04B will retrofit cards to call `openViewer` from a launch button.

## Accessibility / Focus Management

- Overlay carries `role="dialog"`, `aria-modal="true"`, `aria-labelledby={titleId}` (with stable `useId`-driven id).
- Close button has accessible name `Close Foleon viewer` and is the first focusable element on open.
- Tab cycles focus within the overlay (scoped trap).
- Escape always closes — never overridden, never permanent trap.
- On close, focus returns to the launch element captured by `openViewer(target, launchElement)` (deferred via `queueMicrotask` so React unmounts the dialog first).
- Disabled-target panel uses `role="status"` `aria-live="polite"` so the disabled reason is announced to assistive tech.
- Mobile: dialog stretches to viewport; close button stays in safe area; no body-scroll lock is added (scoped overlay containment is sufficient and avoids polluting the host page).

## Iframe Governance Preservation

- The viewer mounts iframes **only** through `FoleonIframeHost` — the same component the inline path uses. No raw `<iframe>` is introduced.
- The provider receives `originPolicy` from `FoleonReaderModule`, which forwards `contract.originPolicy` from the existing runtime contract. The viewer therefore inherits the same accepted-origin set, the same gate behavior, and the same telemetry surface as the inline iframe path.
- Viewer telemetry is **distinct** from inline iframe telemetry to avoid duplicating semantics:
  - `onViewerOpen(target)` — viewer opened.
  - `onViewerClose(target)` — viewer closed.
  - `onViewerIframeLoaded(target)` — iframe inside the viewer loaded.
  - `onViewerIframeError(target)` — iframe inside the viewer errored.
  - These do not overlap with `onReaderOpen` / `onReaderClose` / `onEmbedError` / `onGateBlocked`, which continue to fire for the inline iframe path only.

## Tests Added / Updated

**New** `FoleonViewerTypes.test.ts` — adapter rules for both ready and preview, including all three disabled reasons and the orchestrator-supplied embed URL override.

**New** `FoleonFullWindowViewerProvider.test.tsx` — provider + hook + viewer tests:

1. Successful open returns `{ opened: true, target }`, renders `role="dialog"`, fires `onViewerOpen`.
2. Preview target returns `{ opened: false, reason: 'preview-only' }` and the dialog is **not** rendered.
3. `embed-not-allowed` ready target returns `{ opened: false, reason: 'embed-not-allowed' }` — disabled-reason exposure proven for at least one ready-state disabled path.
4. Close removes the dialog, fires `onViewerClose`, and returns focus to the launch element (asserted via `waitFor(() => expect(document.activeElement).toBe(launch))`).
5. Escape closes the dialog.
6. Hook outside any provider returns structured-refusal default (`reason: 'unknown'`) — never silent.
7. Iframe inside the dialog has the descriptive `Foleon viewer` title and is mounted via `FoleonIframeHost`.

No existing tests were modified. Project Spotlight / Company Pulse / Leadership lane tests continue to pass unchanged because the layouts themselves were not touched.

## Validation Commands and Results

| Command | Scope | Result |
|---|---|---|
| `pnpm --filter @hbc/foleon-reader test` | foleon-reader full suite | **12 files / 130 tests pass** |
| `pnpm --filter @hbc/foleon-reader check-types` | foleon-reader typecheck | clean |
| `pnpm --filter @hbc/foleon-reader lint` | foleon-reader lint | clean |
| `pnpm --filter @hbc/spfx-hb-webparts exec vitest run --config vitest.config.ts src/webparts/hbHomepage` | hbHomepage consumer | **32 files / 469 tests pass** (lockstep `hbHomepagePackageAuthority` test green at `1.1.85.0`) |
| `pnpm --filter @hbc/spfx-hb-webparts check-types` | not re-run; deltas to this prompt are foleon-reader-side and view-model-side, not hb-webparts source | hb-webparts pre-existing 4 errors (Prompts 01/02/03/04 documented) remain unchanged. |

## Version / Package Impact

`hb-intel-homepage` SPFx solution + web-part + launcher-constant + runtime-copy manifest advanced together to `1.1.85.0`. `hbHomepagePackageAuthority.test.ts` lockstep green.

DOM rendered by Spotlight, Pulse, and Leadership lanes is **visually unchanged by default**. The provider only renders the overlay when a layout calls `openViewer(target)` — which no lane does in Prompt 04A. The provider's wrapping `<FoleonFullWindowViewerContext.Provider>` is a transparent React fragment from the user's perspective.

The change is a deployable surface change because the bundle now carries the viewer overlay code, the provider, the new view-model field, and the four new optional viewer telemetry props. Hosted proof of the new viewer is deferred to Prompt 04B / 06.

## Known Follow-Up Work

- **Prompt 04B** — Project Spotlight + Company Pulse card launch retrofit. Wire each lane's primary article card (and any future article cards) to call `useFoleonFullWindowViewer().openViewer(card.target)` from a keyboard-reachable launch control. Surface disabled targets via tooltip / aria-disabled. Decide whether to keep or retire the inline iframe surface in the Spotlight feature layout / Pulse briefing layout when the viewer becomes the preferred path.
- **Prompt 05** — Leadership Message lane-owned layout using the viewer contract. Leadership can adopt the card-launch pattern from day one without intermediate compatibility-shell wiring.
- **Prompt 06** — Testing / package / hosted proof. Playwright visual-regression coverage for the viewer overlay (open/close, focus return, Escape, mobile layout, scoped containment). Hosted geometric proof at `1.1.85.0+`. Tenant rollout runbook updates.
- **Optional homepage-scoped provider promotion** — if cross-lane viewer coordination becomes a requirement (e.g. opening one viewer at a time across all three lanes), promote the provider from lane-scoped to homepage-scoped at `apps/hb-webparts/src/webparts/hbHomepage/HbHomepage.tsx` or `FoleonHomepageLaneHost.tsx`.

## Risks / Mitigations

| Risk | Mitigation |
|---|---|
| Lane-scoped state means three independent viewer instances on the homepage. Opening one does not close the others. | Acceptable for Prompt 04A — only one lane will ever have its viewer open at a time in practice (UI is exclusive at the click level). The homepage-scoped promotion is recorded as a follow-up if cross-lane coordination becomes a requirement. |
| Provider added inside `FoleonReaderModule` could disturb existing lane layout tests. | Tests confirmed: 130/130 foleon-reader pass, 469/469 hb-webparts hbHomepage pass. The provider renders a transparent fragment when no target is active, so DOM is unchanged for default behavior. |
| Public surface widening could lock the package into types we want to evolve. | Conservative export choice — only types, the provider, and the hook. The component itself, the adapters, and the disabled-reason copy formatters are internal until a downstream consumer needs them. |
| Telemetry semantics could be confused with inline iframe lifecycle. | Distinct event names (`onViewerOpen` vs `onReaderOpen`, `onViewerIframeError` vs `onEmbedError`). Documented above. |
| Focus restoration requires the caller to pass a launch element. | Documented; the close branch defers focus restore via `queueMicrotask` so the dialog unmount completes first. Layout authors in Prompt 04B will pass the launch element via the second parameter to `openViewer`. |
| Disabled targets could be silently no-op'd by future code. | The `FoleonViewerOpenResult` discriminated union forces callers to handle the disabled branch. Tests cover preview, embed-not-allowed, and outside-provider refusal cases. |

## Rollback Plan

The change set is bounded to the foleon-reader package, four version files, and the new view-model field. Rollback steps:

1. **Source rollback:** delete `FoleonViewerTypes.ts`, `FoleonFullWindowViewer.{tsx,module.css,module.css.d.ts}`, `FoleonFullWindowViewerProvider.tsx`, and the two new test files. Revert the additive `primaryArticle` field on `FoleonReaderViewModel` and its preview/ready adapter populations. Revert the four optional viewer telemetry props on `FoleonReaderModule`. Revert the provider wrap in the module's render path. Revert the `index.ts` additions.
2. **Test rollback:** none required beyond deleting the new test files.
3. **Version rollback:** revert all four version files to `1.1.84.0`.
4. **Deploy rollback:** redeploy the prior `.sppkg` (solution `1.1.84.0`).

Compatibility is preserved across the rollback because the existing inline iframe surface is unchanged. No lane currently calls `openViewer`, so removing the provider has zero observable effect.
