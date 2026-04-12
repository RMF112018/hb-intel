# HB Kudos stress suite (phase-16)

Group-aware Playwright specs, fixtures, and helpers for the HB Kudos
public + companion surfaces. Runs on the existing webparts lane
(`playwright.webparts.config.ts`) against the dev harness at
`http://localhost:3000`.

## Layout

| Path | Purpose | Implemented by |
|---|---|---|
| `public/` | public webpart specs (A/C/E/F/G axes) | prompt 05 |
| `companion/` | admin companion specs (A/B/D queue/filter) | prompt 06 |
| `shared/` | cross-seam specs (cache, writer, adapter, drift guard) | prompt 07 |
| `hosted/` | host/runtime specs (H1–H9) | prompt 08 |
| `fixtures/` | deterministic seed payloads per matrix family | prompt 04 |
| `helpers/` | locators, clock, seed factories, assertions, artifacts | this prompt |

## Running

```
# full kudos lane
pnpm exec playwright test --config=playwright.webparts.config.ts e2e/webparts/kudos

# single group
pnpm exec playwright test --config=playwright.webparts.config.ts e2e/webparts/kudos/public

# single matrix coord (uses test-title grep)
pnpm exec playwright test --config=playwright.webparts.config.ts e2e/webparts/kudos --grep "\\[A3\\]\\[C1\\]"

# HTML report
pnpm exec playwright show-report
```

Traces capture on first retry (config default); per-failure artifacts
land in `test-results/kudos/**` with the naming discipline defined in
`helpers/kudosArtifacts.ts`.

## Preconditions (harness wiring)

Smoke specs under each group are `test.fixme`-guarded until the
dev-harness Kudos tab + seed hook land (prompt 04). The full contract
lives in
`docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/phase-16/10-Harness-Architecture.md`.

## Hosted closure coverage (Phase-23 Prompt 09)

The `hosted/` suite now covers ten spec files spanning
responsive, interaction, workflow, scroll, focus, chrome, zoom,
dead-control, legacy-mount, and closure-report dimensions:

| Spec | Focus |
|---|---|
| `kudos.hosted.chrome-overlap.spec.ts` | host chrome / CTA reachability |
| `kudos.hosted.dead-control-sweep.spec.ts` | non-interactive sweep |
| `kudos.hosted.keyboard-and-focus.spec.ts` | tab order, focus-visible, focus restoration, target size |
| `kudos.hosted.panel-scroll.spec.ts` | flyout body overflow |
| `kudos.hosted.zoom-regression.spec.ts` | 100% / 90% / reduced-width / safe-zone |
| `kudos.hosted.responsive.spec.ts` | desktop right-sheet vs mobile bottom-sheet; safe-zone at 720px |
| `kudos.hosted.interactions.spec.ts` | feed search filter, archive round-trip, celebrate increment |
| `kudos.hosted.workflow.spec.ts` | companion Approve + Request-revision dispatch |
| `kudos.hosted.legacy-mount-smoke.spec.ts` | legacy merged mount smoke |
| `kudos.hosted.closure-report.spec.ts` | emits `test-results/kudos-hosted-closure-report.json` |

The closure-report spec aggregates every hosted `test(...)` title
and its `matrixTag(...)` coordinates into one JSON artifact so
Phase-23 closure review can cite a single file instead of
scanning the Playwright HTML report.
