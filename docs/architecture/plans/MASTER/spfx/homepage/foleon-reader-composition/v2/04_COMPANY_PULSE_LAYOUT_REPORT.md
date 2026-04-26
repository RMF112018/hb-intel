# Company Pulse Reader Layout Report

## Scope

Phase-04 Wave-01 Prompt-04 replaces only the **Company Pulse** body with a lane-owned **briefing / newsroom digest** composition. `CompanyPulseReaderLayout` no longer delegates to `FoleonReaderCompatibilityLayout`. Project Spotlight (Prompt 03) is unchanged. Leadership Message remains on the compatibility shell pending Prompt 05.

Out of scope: Leadership Message redesign; activating global edge-to-window behavior (Prompt-01 contract stays dormant); inventing record fields for the secondary digest; touching iframe governance, route map, content resolver, schemas, backend sync, Safety / HB Kudos / People & Culture, or shell pairing.

## Baseline Inputs

- `00_BASELINE_AUDIT.md`
- `01_EDGE_CONTRACT_REPORT.md`
- `02_VIEW_MODEL_AND_REGISTRY_REPORT.md`
- `03_PROJECT_SPOTLIGHT_LAYOUT_REPORT.md`

The Prompt-01 edge contract is unchanged. The Prompt-02 view model + registry are extended additively (four new optional fields for the Company Pulse lane only).

## Source Files Changed

| File | Change |
|---|---|
| `packages/foleon-reader/src/readers/layouts/CompanyPulseReaderLayout.tsx` | **Rewritten.** Lane-owned briefing/newsroom digest composition. Header (eyebrow + "Frequent" cadence + preview label + title + summary) → category chips → latest-update lead → secondary digest (preview-populated; ready empty with explanatory state) → optional pulse timeline (preview only) → action row → mobile gate → iframe frame → warnings. Outer wrapper carries Prompt-02 lane markers plus the new `data-foleon-layout="company-pulse-briefing"`. Does NOT emit legacy `data-preview-tone` or `data-foleon-preview-route`. |
| `packages/foleon-reader/src/readers/layouts/FoleonReaderLayouts.module.css` | Adds Company-Pulse classes (`.briefingSurface`, `.briefingHeader`, `.briefingHeaderRow`, `.briefingEyebrow`, `.briefingCadence`, `.briefingPreviewLabel`, `.briefingTitle`, `.briefingSummary`, `.categoryChips`, `.categoryChip`, `.briefingLead`, `.leadKicker`, `.leadTitle`, `.leadBody`, `.leadDateline`, `.briefingDigest`, `.digestItem`, `.digestCategory`, `.digestTitle`, `.digestSummary`, `.digestDateline`, `.digestEmpty`, `.digestEmptyHeading`, `.digestEmptyBody`, `.pulseTimeline`, `.timelineEntry`, `.timelineLabel`, `.timelineValue`, `.briefingActions`, `.briefingArchiveNote`, `.briefingMobileGate`, `.briefingMobileGateLabel`, `.briefingMobileGateBody`, `.briefingIframeFrame`, `.briefingWarning`). No outer card border. Outer surface is edge-bleed-ready (`margin-inline: 0`, no outer `padding-inline`). Internal safe area via `padding-inline: clamp(1rem, 4vw, 2.5rem)`. Less image-heavy than Spotlight (no full-bleed gradient media banner). No global `overflow-x: hidden`. |
| `packages/foleon-reader/src/readers/layouts/FoleonReaderLayouts.module.css.d.ts` | Synced with the new class names. |
| `packages/foleon-reader/src/readers/FoleonReaderViewModel.ts` | Adds four **optional** Company-Pulse-only fields: `briefingLead?: { title, body, category?, dateline?, isPlaceholder }`, `briefingDigest?: readonly FoleonReaderBriefingItem[]`, `categoryChips?: readonly FoleonReaderCategoryChip[]`, `pulseTimeline?: readonly FoleonReaderPulseTimelineEntry[]`. Adapters populate them only when `lane === 'companyPulse'`. Spotlight + Leadership leave all four `undefined`. Ready state's digest is **always** an empty array (no fabricated entries) and the timeline is `undefined` (preview-only). |
| `packages/foleon-reader/src/readers/__tests__/CompanyPulseReaderLayout.test.tsx` | **New.** Lane-specific test suite — markers, no legacy three-card skeleton, preview/ready parity, preview labeling, populated preview digest spanning four conceptual categories, ready-state empty-digest explanatory state, record-backed lead with honest summary fallback, iframe rendering rules, no inline margin overrides, sibling-lane non-interference. |
| `packages/foleon-reader/src/readers/__tests__/FoleonReaderViewModel.test.ts` | Adds Pulse-adapter assertions: preview populates briefing fields with labeled placeholders; ready derives lead from record fields with honest fallback when summary missing; ready digest is empty (`[]`); timeline is preview-only; Spotlight + Leadership leave all four fields undefined. |
| `packages/foleon-reader/src/readers/__tests__/FoleonReaderModule.test.tsx` | Pulse-preview test rewritten to assert the new lane-owned briefing layout markers and the absence of legacy compatibility-shell markers. Three-lane composition test restructured to **per-lane scoping** — each lane's wrapper is queried and tested independently; no exact global marker counts. Project Spotlight sibling-test in `ProjectSpotlightReaderLayout.test.tsx` updated to reflect Pulse's migration off the compatibility shell. |
| `apps/hb-homepage/config/package-solution.json` | Bump solution + feature versions `1.1.83.0` → `1.1.84.0`. |
| `apps/hb-homepage/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json` | Bump web-part version `1.1.83.0` → `1.1.84.0`. |
| `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json` | Bump runtime-copy version `1.1.83.0` → `1.1.84.0`. |
| `packages/homepage-launcher/src/constants.ts` | Bump `HOMEPAGE_LAUNCHER_VERSION` `'1.1.83.0'` → `'1.1.84.0'`. |

Files explicitly **not touched**: `LeadershipMessageReaderLayout.tsx`, `ProjectSpotlightReaderLayout.tsx`, `FoleonReaderCompatibilityLayout.tsx`, `FoleonReaderModule.tsx`, `FoleonReaderLayoutRegistry.tsx`, `FoleonReaderModule.module.css`, `FoleonReaderPreview.tsx`, `index.ts` (no public-export changes — the new view-model subtypes are internal to the package), all shell / entry-stack code, the Prompt-01 dormant edge contract, `apps/hb-webparts/src/webparts/hbHomepage/__tests__/HbHomepageShell.edgeContract.test.tsx` (existing assertions for Row 2 right-edge bleed remain authoritative), Foleon governance / route / sync / schema files, Safety / Kudos / People & Culture.

## Layout Composition

```
<div data-foleon-reader-layout="company-pulse"
     data-foleon-reader-lane="companyPulse"
     data-foleon-reader-state="preview|ready"
     data-foleon-layout="company-pulse-briefing">
  <article class="briefingSurface" aria-labelledby={titleElementId}>
    <header class="briefingHeader">
      <div class="briefingHeaderRow">
        <p class="briefingEyebrow">Company Pulse Reader</p>
        <span class="briefingCadence">Frequent</span>
        <span class="briefingPreviewLabel"> {/* preview only */} </span>
      </div>
      <h2 class="briefingTitle">{title}</h2>
      <p class="briefingSummary">{summary}</p>
    </header>
    <ul class="categoryChips" aria-label="Pulse categories">
      [News, Events, Recognition, Operations]
    </ul>
    <section class="briefingLead" aria-label="Latest Company Pulse update">
      <p class="leadKicker">Latest update · {freshnessValue} · {dateline?}</p>
      <h3 class="leadTitle">{briefingLead.title}</h3>
      <p class="leadBody">{briefingLead.body}</p>
    </section>
    {/* Secondary digest: populated in preview, empty in ready */}
    <ul class="briefingDigest" data-foleon-pulse-digest-state="populated"> {/* preview */}
      <li class="digestItem"> News … </li>
      <li class="digestItem"> Events … </li>
      <li class="digestItem"> Recognition … </li>
      <li class="digestItem"> Operations … </li>
    </ul>
    <div class="digestEmpty" data-foleon-pulse-digest-state="empty"> {/* ready */}
      <p class="digestEmptyHeading">More updates</p>
      <p class="digestEmptyBody">Previous Company Pulse editions are available in the archive…</p>
    </div>
    <ol class="pulseTimeline" aria-label="Pulse timeline"> {/* preview only */} </ol>
    <div class="briefingActions">[Open reader (mobile gate), Open full archive]</div>
    <div class="briefingMobileGate"> {/* present when ready+mobile+!open */} </div>
    <div class="briefingIframeFrame">{iframeSurface}</div> {/* only when iframe.visible && iframeSurface */}
    <p class="briefingWarning">…</p>* {/* per warning */}
  </article>
</div>
```

## Edge-Bleed Posture

The new layout is **edge-bleed-ready by structure**: outer surface has zero `margin-inline` and zero outer `padding-inline`; inner blocks each carry their own `padding-inline: clamp(1rem, 4vw, 2.5rem)` for the internal safe area. The Prompt-01 shell-slot edge contract (`apps/hb-webparts/.../HbHomepageShell.edgeContract.test.tsx`) already proves Company Pulse paired right-dominant major resolves to `data-shell-slot-visual-side="right"` and `data-shell-slot-edge-bleed="right"` — that is the **authoritative** Row-2 hosted-shell-context proof and was not touched in this prompt. When the Prompt-01 policy is later opted into edge-to-window, the slot's negative `margin-inline-end` will travel through this layout cleanly. **Prompt-04 does not activate global edge-to-window behavior on its own**; `DEFAULT_HOMEPAGE_EDGE_POLICY` remains `{ edgeMode: 'standard', heroEdge: 'none' }`.

## Record-Backed Lead and Honest Empty-Digest State (Ready)

The ready adapter sources the briefing lead **only** from `FoleonContentRecord`:

| Lead field | Source |
|---|---|
| `title` | `record.title` |
| `body` | `record.summary` (or honest fallback `Editorial summary for this Company Pulse edition has not been provided.` when missing/empty) |
| `category` | `record.contentTypeKey` |
| `dateline` | `formatFreshnessDate(record.lastEditorialUpdate ?? record.publishedOn)` |
| `isPlaceholder` | `false` |

The ready-state secondary digest is **always empty**. The active record is the lead; previous editions live in the archive. The layout renders an explanatory empty-digest state (`<div data-foleon-pulse-digest-state="empty">`) with a "More updates" heading and copy directing users to the **Open full archive** action. The adapter never invents secondary entries.

Preview-state placeholders (`Sample latest update`, `Sample news update`, etc.) are clearly labeled with the visible **Preview layout** banner and `isPlaceholder: true` on the lead so consumers can never confuse them with real records.

## Behavior Preserved

- **Loading / error / blocked / preview / ready** orchestration in `FoleonReaderModule` — unchanged.
- **Iframe governance, lifecycle, telemetry** — `FoleonIframeHost` is still constructed by the orchestrator with the same `src`, `title`, `policy`, `onLoaded`, `onError` props. `onReaderOpen` / `onReaderClose` / `onEmbedError` / `onGateBlocked` / `onStatusChange` semantics unchanged.
- **Mobile lazy-mount** — view-model's `mobileGate` and `open-mobile-reader` action drive the mobile collapsed state; the `Open reader` button still surfaces only when ready + mobile + reader-not-yet-opened. Existing mobile activation test passes unchanged.
- **Accessibility** — `aria-labelledby` relationship preserved via `viewModel.titleElementId`; iframe `title` preserved via `viewModel.iframe.title`; chips, lead, digest, timeline, mobile gate all carry `aria-label` attributes; preview banner carries `aria-label="Preview content"`. Focus outlines remain visible (no `outline: none` introduced).
- **Prompt-01 edge contract** — entry-stack default policy and dormant CSS remain unchanged.

## Tests

**New** `CompanyPulseReaderLayout.test.tsx` covers:

- New feature marker `data-foleon-layout="company-pulse-briefing"` is emitted alongside the Prompt-02 lane markers.
- Project Spotlight / Leadership Message layout markers are absent from the rendered tree.
- Preview and ready states share the same `data-foleon-layout` marker; only `data-foleon-reader-state` differs.
- Legacy three-card support skeleton (`[aria-label$="supporting preview placeholders"]`, `[aria-label="Preview status"]`, `[aria-label="Preview metadata zones"]`) is absent.
- Legacy `data-preview-tone` / `data-foleon-preview-route` markers are absent.
- Preview state retains a visible `Preview layout` label.
- Preview state's digest is populated and spans the four conceptual categories (News / Events / Recognition / Operations).
- Ready state renders an explanatory empty-digest state (`data-foleon-pulse-digest-state="empty"`) and never fabricates secondary digest items.
- Ready state's lead derives only from `FoleonContentRecord`; honest fallback when summary missing.
- Iframe renders inside `.briefingIframeFrame` only when `viewModel.iframe?.visible` is true and `iframeSurface !== null`.
- Outer wrapper carries no inline `margin-inline` overrides — the shell-slot edge contract from Prompt 01 governs bleed.
- Sibling lanes — Project Spotlight emits its feature marker, Leadership stays on the compatibility shell with `data-preview-tone="navy"`.

**Updated** `FoleonReaderViewModel.test.ts` — adds Pulse adapter assertions across all three lanes. Spotlight + Leadership leave Pulse-only fields undefined.

**Updated** `FoleonReaderModule.test.tsx` — Pulse-preview test rewritten; three-lane composition test restructured to **per-lane scoping**:

```ts
const spotlight = document.querySelector('[data-foleon-reader-layout="project-spotlight"]');
const pulse = document.querySelector('[data-foleon-reader-layout="company-pulse"]');
const leadership = document.querySelector('[data-foleon-reader-layout="leadership-message"]');
expect(spotlight?.getAttribute('data-foleon-layout')).toBe('project-spotlight-feature');
expect(pulse?.getAttribute('data-foleon-layout')).toBe('company-pulse-briefing');
expect(spotlight?.querySelector('[data-preview-tone]')).toBeNull();
expect(pulse?.querySelector('[data-preview-tone]')).toBeNull();
expect(leadership?.querySelector('[data-preview-tone="navy"]')).not.toBeNull();
```

No exact global counts of legacy or new markers — Prompt 05 can migrate Leadership without churning these assertions.

**Updated** `ProjectSpotlightReaderLayout.test.tsx` sibling-test — Pulse no longer emits `data-preview-tone="orange"` or `data-foleon-preview-route`. Test now verifies Pulse's lane-owned marker and confirms Leadership stays on the compatibility shell.

## Validation Commands and Results

| Command | Scope | Result |
|---|---|---|
| `pnpm --filter @hbc/foleon-reader test` | foleon-reader full suite | **10 files / 117 tests pass** |
| `pnpm --filter @hbc/foleon-reader check-types` | foleon-reader typecheck | clean |
| `pnpm --filter @hbc/foleon-reader lint` | foleon-reader lint | clean |
| `pnpm --filter @hbc/spfx-hb-webparts exec vitest run --config vitest.config.ts src/webparts/hbHomepage` | hbHomepage consumer (incl. lockstep + edge contract integration) | **32 files / 469 tests pass** |
| `pnpm --filter @hbc/spfx-hb-webparts check-types` | not re-run; deltas to this prompt are foleon-reader-side and view-model-side, not hb-webparts source | hb-webparts pre-existing 4 errors (Prompt 01/02/03 documented) remain unchanged. No new errors introduced from this prompt. |

## Package / Versioning Impact

`hb-intel-homepage` SPFx solution + web-part + launcher-constant + runtime-copy manifest advanced together to `1.1.84.0`. `hbHomepagePackageAuthority.test.ts` lockstep green.

DOM is **visually unchanged by default** for Project Spotlight (Prompt 03's lane-owned layout) and Leadership Message (compatibility shell). Company Pulse visibly changes: new lane-owned briefing composition replaces the legacy preview / ready compatibility chrome. The change is intentional — this is the prompt's deliverable, not a regression.

## Known Limitations

1. **JSDOM cannot prove the new layout's geometry.** Tests assert DOM markers, structure, and conditional rendering rules. Visual proof (responsive breakpoints, edge-bleed reach, focus outlines) requires a Playwright / browser proof recorded as Prompt-06 follow-up.
2. **Ready-state digest is empty.** The active-record schema carries one record per lane; secondary editions live in the archive. The empty-digest explanatory state and the `Open full archive` action are the honest design. Adding a multi-edition digest source would require schema or resolver changes outside this prompt's scope.
3. **`briefingDigest` and friends are shared on `FoleonReaderViewModel`.** Spotlight + Leadership leave all four Pulse-only fields `undefined`; their layouts ignore them. Same pattern as Spotlight's `projectFacts` / `featureCallout`.
4. **Public surface is unchanged.** The four new view-model subtypes (`FoleonReaderBriefingLead`, `FoleonReaderBriefingItem`, `FoleonReaderCategoryChip`, `FoleonReaderPulseTimelineEntry`) are not exported from `index.ts` because no downstream consumer requires them yet. Promotion is a follow-up if needed.
5. **Pulse timeline is preview-only.** `pulseTimeline` is populated only in preview as a sample chronology hint. Ready state has no timeline source. The hosted layout therefore does not render a timeline strip in production today.

## Follow-Up Work

- **Prompt 05** — Leadership Message reader layout (replace `LeadershipMessageReaderLayout` body with lane-specific composition; stop delegating to compatibility shell).
- **Prompt 06** — Testing / package / hosted proof: Playwright visual-regression coverage for all three lanes; hosted geometric proof; tenant rollout runbook.
- **Schema extension (optional)**: a multi-edition digest source for Company Pulse so ready state can render a populated secondary digest instead of the explanatory empty state.

## Risks / Mitigations

| Risk | Mitigation |
|---|---|
| Empty-digest state could be misread as a backend bug. | The empty state is explicitly labeled "More updates" with copy directing to the archive. The view-model exposes `briefingDigest` as `readonly []` so consumers can distinguish "deliberately empty" from "field absent" (which is `undefined`, used by Spotlight + Leadership). |
| Pulse-specific styles in the shared CSS module could leak to other lanes. | All Pulse classes are namespaced (`.briefing*`, `.digest*`, `.pulse*`) and only referenced from `CompanyPulseReaderLayout.tsx`. Spotlight uses `.featureSurface`, etc. No selector overlap. |
| Three-lane test could re-introduce brittleness if a future prompt re-adds global counts. | Per-lane scoping pattern is documented in this report and codified in the rewritten test. Future prompts should follow the same pattern. |
| Pulse layout's "Frequent" cadence label is hardcoded. | This describes the lane's editorial cadence, not record data. Hardcoding is intentional and consistent with Spotlight's "Monthly" label. |
| Prompt-01 lockstep could regress if a future prompt bumps only one of the four files. | `hbHomepagePackageAuthority.test.ts` enforces lockstep; the Prompt-04 commit advances all four files together. |

## Rollback Plan

The change set is bounded to the foleon-reader package, four version files, and the new view-model fields. Rollback steps:

1. **Source rollback:** revert `CompanyPulseReaderLayout.tsx`, the new CSS classes + `.d.ts` additions, the four new view-model fields and their preview/ready adapter populations, and the test updates. The previous Prompt-02 lane wrapper (delegating to compatibility shell) is preserved in git history.
2. **Test rollback:** delete `CompanyPulseReaderLayout.test.tsx`; revert the additive `FoleonReaderViewModel.test.ts` block; restore the Prompt-03 form of `FoleonReaderModule.test.tsx` and `ProjectSpotlightReaderLayout.test.tsx` sibling test.
3. **Version rollback:** revert all four version files to `1.1.83.0`.
4. **Deploy rollback:** redeploy the prior `.sppkg` (solution `1.1.83.0`).

Compatibility is preserved across the rollback because `FoleonReaderCompatibilityLayout` remains in the package — Project Spotlight (still on its own lane-owned layout) and Leadership (still on the compat shell) are unaffected, and Company Pulse simply re-routes through the shared shell on revert.
