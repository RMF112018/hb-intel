# Project Spotlight Reader Layout Report

## Scope

Phase-04 Wave-01 Prompt-03 replaces only the **Project Spotlight** body with a true lane-owned monthly visual project profile composition. `ProjectSpotlightReaderLayout` no longer delegates to `FoleonReaderCompatibilityLayout`. Pulse and Leadership remain on the compatibility shell until Prompts 04 / 05.

Out of scope: lane redesigns for Pulse and Leadership; activating global edge-to-window behavior (the Prompt-01 contract stays dormant); inventing client / location / team / milestone copy for ready state; touching iframe governance, route map, content resolver, schemas, backend sync, Safety / HB Kudos / People & Culture, or shell pairing.

## Baseline Inputs

- `00_BASELINE_AUDIT.md`
- `01_EDGE_CONTRACT_REPORT.md`
- `02_VIEW_MODEL_AND_REGISTRY_REPORT.md`

The Prompt-01 edge contract is unchanged. The Prompt-02 view model + registry are extended additively (two new optional fields for the Project Spotlight lane only).

## Source Files Changed

| File | Change |
|---|---|
| `packages/foleon-reader/src/readers/layouts/ProjectSpotlightReaderLayout.tsx` | **Rewritten.** Lane-owned monthly visual project profile composition. No longer delegates to compatibility layout. Emits `data-foleon-reader-layout="project-spotlight"`, `data-foleon-reader-lane="projectSpotlight"`, `data-foleon-reader-state`, **and the new `data-foleon-layout="project-spotlight-feature"`** marker. Does NOT emit legacy `data-preview-tone` / `data-foleon-preview-route`. |
| `packages/foleon-reader/src/readers/layouts/FoleonReaderLayouts.module.css` | **New.** Lane-owned CSS module. Project-Spotlight feature surface, media banner, eyebrow row, ribbon, "Why this project matters" callout, project facts grid, action row, mobile gate, iframe frame, warnings. No outer card border. Outer surface is edge-bleed-ready (no outer `padding-inline`, `margin-inline: 0`). Internal safe area via `padding-inline: clamp(1rem, 4vw, 2.5rem)` on inner blocks. No global `overflow-x: hidden`. |
| `packages/foleon-reader/src/readers/layouts/FoleonReaderLayouts.module.css.d.ts` | **New.** Hand-written type declaration matching the existing pattern. |
| `packages/foleon-reader/src/readers/FoleonReaderViewModel.ts` | Adds two **optional** fields used only for Project Spotlight: `projectFacts?: { client?, location?, market?, team?, milestone?, arePlaceholders }` and `featureCallout?: { heading, body }`. Adapters populate them only when `lane === 'projectSpotlight'`. Pulse + Leadership view models leave both `undefined`. |
| `packages/foleon-reader/src/readers/__tests__/ProjectSpotlightReaderLayout.test.tsx` | **New.** Lane-specific test suite (markers, no legacy three-card skeleton, preview/ready parity, preview labeling, record-backed facts with "Not listed" fallback, iframe rendering rules, sibling-lane non-interference). |
| `packages/foleon-reader/src/readers/__tests__/FoleonReaderViewModel.test.ts` | Adds Project-Spotlight-only assertions for `projectFacts` and `featureCallout` on both preview and ready adapters; verifies Pulse + Leadership leave both fields undefined. |
| `packages/foleon-reader/src/readers/__tests__/FoleonReaderModule.test.tsx` | Updated. The Project-Spotlight-preview test now asserts the new lane markers and the absence of the legacy preview skeleton + tone markers. The three-lane composition test asserts the new feature marker for Spotlight, expects only Pulse/Leadership to retain `data-preview-tone` (because they still use the compatibility shell), and counts `data-foleon-preview-route` at `2` (no longer `3`). |
| `apps/hb-homepage/config/package-solution.json` | Bump solution + feature versions `1.1.82.0` → `1.1.83.0`. |
| `apps/hb-homepage/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json` | Bump web-part version `1.1.82.0` → `1.1.83.0`. |
| `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json` | Bump runtime-copy version `1.1.82.0` → `1.1.83.0`. |
| `packages/homepage-launcher/src/constants.ts` | Bump `HOMEPAGE_LAUNCHER_VERSION` `'1.1.82.0'` → `'1.1.83.0'`. |

Files explicitly **not touched**: `CompanyPulseReaderLayout.tsx`, `LeadershipMessageReaderLayout.tsx`, `FoleonReaderCompatibilityLayout.tsx`, `FoleonReaderModule.tsx`, `FoleonReaderLayoutRegistry.tsx`, `FoleonReaderModule.module.css`, `FoleonReaderPreview.tsx`, `index.ts` (no new public exports needed in this prompt — `FoleonReaderProjectFacts` and `FoleonReaderFeatureCallout` are internal until a downstream consumer requires them), all shell / entry-stack code, the Prompt-01 edge contract, all Foleon governance / route / sync / schema files, Safety / Kudos / People & Culture.

## Layout Composition

```
<div data-foleon-reader-layout="project-spotlight"
     data-foleon-reader-lane="projectSpotlight"
     data-foleon-reader-state="preview|ready"
     data-foleon-layout="project-spotlight-feature">
  <article class="featureSurface" aria-labelledby={titleElementId}>
    <header class="mediaBanner">
      <div class="mediaInner">
        <eyebrow row: "Project Spotlight Reader" + "Monthly" cadence + "Preview layout" tag (preview only)>
        <h2 class="title">{title}</h2>
        <p class="summary">{summary}</p>
      </div>
    </header>
    <ul class="ribbon" aria-label="Project Spotlight metadata">
      [freshness, audience, archive group, cadence]
    </ul>
    <section class="callout" aria-label="Why this project matters">
      <h3>{featureCallout.heading}</h3>
      <p>{featureCallout.body}</p>
    </section>
    <dl class="projectFacts" aria-label="Project facts">
      [client, location, market, team, milestone — record-backed or "Not listed" or sample-labeled]
    </dl>
    <div class="actions">[Open reader (mobile gate), Open full archive]</div>
    <div class="mobileGate"> {/* present when ready+mobile+!open */} </div>
    <div class="iframeFrame">{iframeSurface}</div> {/* only when iframe.visible && iframeSurface */}
    <p class="warning">…</p>* {/* per warning */}
  </article>
</div>
```

## Edge-Bleed Posture

The new layout is **edge-bleed-ready by structure**: outer surface has zero `margin-inline` and zero outer `padding-inline`; inner blocks each carry their own `padding-inline: clamp(1rem, 4vw, 2.5rem)` for the internal safe area. When the Prompt-01 shell-slot edge contract is later activated by an opt-in policy, the negative `margin-inline-start/-end` applied to the slot wrapper will travel through this layout cleanly so the media banner reaches the canvas inner edge. **Prompt-03 does not activate global edge-to-window behavior on its own** — `DEFAULT_HOMEPAGE_EDGE_POLICY` remains `{ edgeMode: 'standard', heroEdge: 'none' }`.

## Record-Backed Project Facts (Ready State)

The ready adapter sources every visible Project Spotlight fact from `FoleonContentRecord`:

| Layout label | Source field |
|---|---|
| Client | `record.relatedProjectName ?? record.relatedProjectNumber` |
| Location | `record.region` |
| Market | `record.sector` |
| Team | (not present in `FoleonContentRecord`) — adapter emits `undefined`; layout renders `Not listed` |
| Milestone | `formatFreshnessDate(record.issueDate ?? record.publishedOn)` |

The adapter **does not invent** any value. When a record field is absent the layout renders the honest fallback `Not listed`. Preview state uses sample placeholders (`Sample client`, `Sample location`, etc.) and the layout marks them with `arePlaceholders: true` so they render in the italicized placeholder style alongside the visible **Preview layout** banner.

## Behavior Preserved

- **Loading / error / blocked / preview / ready** orchestration in `FoleonReaderModule` — unchanged.
- **Iframe governance, lifecycle, telemetry** — `FoleonIframeHost` is still constructed by the orchestrator with the same `src`, `title`, `policy`, `onLoaded`, `onError` props. `onReaderOpen` / `onReaderClose` / `onEmbedError` / `onGateBlocked` / `onStatusChange` semantics unchanged.
- **Mobile lazy-mount** — view-model's `mobileGate` and `open-mobile-reader` action drive the mobile collapsed state; the `Open reader` button still surfaces only when ready + mobile + reader-not-yet-opened. Existing mobile activation test passes unchanged.
- **Accessibility** — `aria-labelledby` relationship preserved via `viewModel.titleElementId`; iframe `title` preserved via `viewModel.iframe.title`; ribbon, callout, project facts, and mobile gate all carry `aria-label` attributes; preview banner carries `aria-label="Preview content"`. Focus outlines remain visible (no `outline: none` introduced).
- **Prompt-01 edge contract** — entry stack default policy and dormant CSS remain unchanged.

## Tests

**New** `ProjectSpotlightReaderLayout.test.tsx` — covers:

- new feature marker `data-foleon-layout="project-spotlight-feature"` is emitted alongside the Prompt-02 lane markers.
- Pulse / Leadership layout markers are absent from the rendered tree.
- preview and ready states share the same `data-foleon-layout` marker; only `data-foleon-reader-state` differs.
- legacy three-card support skeleton (`[aria-label$="supporting preview placeholders"]`, `[aria-label="Preview status"]`, `[aria-label="Preview metadata zones"]`) is absent.
- legacy `data-preview-tone` / `data-foleon-preview-route` markers are absent.
- preview state retains a visible `Preview layout` label.
- ready-state project facts derive only from `FoleonContentRecord`; missing record fields render as `Not listed`.
- iframe renders inside `.iframeFrame` only when `viewModel.iframe?.visible` is true and `iframeSurface !== null`.
- sibling lanes (Pulse + Leadership) still render their compatibility-shell markers (`data-preview-tone`, `data-foleon-preview-route`).

**Updated** `FoleonReaderViewModel.test.ts` — covers `projectFacts` and `featureCallout` for preview and ready adapters across all three lanes (only Spotlight populates them).

**Updated** `FoleonReaderModule.test.tsx` — Project-Spotlight-preview test rewritten to assert the new lane-owned layout structure and the absence of legacy markers. Three-lane composition test updated for the new marker count and the legitimate absence of `data-preview-tone="blue"` (Spotlight no longer routes through the tone-driven compatibility shell). Existing iframe / lifecycle / mobile / blocked / status-reporting tests unchanged.

## Validation Commands and Results

| Command | Scope | Result |
|---|---|---|
| `pnpm --filter @hbc/foleon-reader test` | foleon-reader full suite | **9 files / 101 tests pass** |
| `pnpm --filter @hbc/foleon-reader check-types` | foleon-reader typecheck | clean |
| `pnpm --filter @hbc/foleon-reader lint` | foleon-reader lint | clean |
| `pnpm --filter @hbc/spfx-hb-webparts exec vitest run --config vitest.config.ts src/webparts/hbHomepage` | hbHomepage consumer | **32 files / 469 tests pass** (lockstep `hbHomepagePackageAuthority` test green at 1.1.83.0) |
| `pnpm --filter @hbc/spfx-hb-webparts check-types` | not re-run; deltas to this prompt are foleon-reader-side and view-model-side, not hb-webparts source | hb-webparts pre-existing 4 errors (Prompt 01/02 documented) remain unchanged. No new errors introduced from this prompt; the package-solution / manifest / launcher-constant version bumps are JSON / string literals only, not typed surfaces. |

## Package / Versioning Impact

`hb-intel-homepage` SPFx solution + web-part + launcher-constant + runtime-copy manifest advanced together to `1.1.83.0`. `hbHomepagePackageAuthority.test.ts` lockstep green.

DOM is **visually unchanged by default** for Pulse and Leadership. Project Spotlight visibly changes: new lane-owned composition replaces the legacy preview / ready compatibility chrome. The change is intentional — this is the prompt's deliverable, not a regression.

## Known Limitations

1. **JSDOM cannot prove the new layout's geometry.** Tests assert DOM markers, structure, and conditional rendering rules. Visual proof (responsive breakpoints, edge-bleed reach, focus outlines) requires a Playwright / browser proof which is recorded as Prompt-06 follow-up.
2. **Team field has no record source.** The adapter emits `team: undefined` and the layout renders `Not listed`. If the SharePoint schema is later extended to carry team metadata, the adapter switches to `record.<newField>` without changing the layout.
3. **`ProjectFacts` typing is shared on `FoleonReaderViewModel`.** Pulse + Leadership leave it `undefined`; their layouts (still on the compatibility shell) ignore it. This keeps the registry's `FoleonReaderLayoutProps` simple at the cost of optional fields on the shared type.
4. **Public surface is unchanged.** The two new types (`FoleonReaderProjectFacts`, `FoleonReaderFeatureCallout`) are not exported from `index.ts` because no downstream consumer requires them yet. Promotion is a follow-up if needed.

## Follow-Up Work

- **Prompt 04** — Company Pulse reader layout (replace `CompanyPulseReaderLayout` body with lane-specific composition; stop delegating to compatibility shell).
- **Prompt 05** — Leadership Message reader layout.
- **Prompt 06** — Testing / package / hosted proof: Playwright visual-regression coverage for all three lanes; hosted geometric proof; tenant rollout runbook.
- **Schema extension (optional)**: add a `team` / `crew` field to `FoleonContentRecord` if HB Caldwell wants ready-state to display team data instead of the `Not listed` fallback.

## Risks / Mitigations

| Risk | Mitigation |
|---|---|
| New layout's outer wrapper might mismatch the compatibility shell when hosted in the homepage shell slot. | Outer wrapper has zero outer inset; the shell-slot inline inset (Prompt-01 contract) governs the gutter. Default policy keeps geometry visually unchanged. |
| Existing snapshots or visual-regression rigs (none observed in foleon-reader package) could break. | None present in the package; future Prompt-06 rig will assert against the new layout from the outset. |
| Pulse / Leadership tests could flake if they assumed Spotlight still rendered compatibility-shell markers. | Three-lane test was updated to expect only two `data-foleon-preview-route` markers (Pulse + Leadership) and only Pulse + Leadership tone markers. |
| Iframe surface render rule (`visible && iframeSurface !== null`) could regress if a future change drops one half of the gate. | Test `renders the iframe inside .iframeFrame only when …` covers all three combinations. |
| Project Spotlight read state currently has no record source for `team`. The "Not listed" fallback could be misread as a backend bug. | Documented above and in the layout's source comment. The fallback is intentional and honest. |

## Rollback Plan

The change set is bounded to the foleon-reader package, four version files, and the new view-model fields. Rollback steps:

1. **Source rollback:** revert `ProjectSpotlightReaderLayout.tsx`, the new CSS module + `.d.ts`, the two new view-model fields, and the test updates. The previous Prompt-02 lane wrapper (delegating to compatibility shell) is preserved in git history.
2. **Test rollback:** delete `ProjectSpotlightReaderLayout.test.tsx`; revert the additive `FoleonReaderViewModel.test.ts` block; restore the Prompt-02 form of `FoleonReaderModule.test.tsx`.
3. **Version rollback:** revert all four version files to `1.1.82.0`.
4. **Deploy rollback:** redeploy the prior `.sppkg` (solution `1.1.82.0`).

Compatibility is preserved across the rollback because `FoleonReaderCompatibilityLayout` remains in the package — Pulse + Leadership are unaffected and Project Spotlight simply re-routes through the shared shell on revert.
