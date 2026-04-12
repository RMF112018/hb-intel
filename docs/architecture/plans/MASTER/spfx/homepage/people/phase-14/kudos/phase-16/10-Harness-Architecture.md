# 10 — HB Kudos Stress Test Harness Architecture

Authoritative harness contract for the phase-16 Kudos stress suite.
Consumed by prompts 04 (fixtures), 05 (public), 06 (companion), 07
(shared seams), and 08 (hosted validation).

## Decision lock

- **Primary harness:** Playwright webparts lane
  (`playwright.webparts.config.ts`, `testDir: ./e2e/webparts`).
- **Rejected alternatives:** Cypress sidecar, Vitest-only browser
  substitute, ad-hoc mega spec. No second competing browser harness is
  introduced.
- **Base URL:** `http://localhost:3000` (dev-harness preview via
  `pnpm --filter @hbc/dev-harness preview`).
- **Parallelism:** `fullyParallel: false`, `workers: 1` (inherited from
  the webparts config — the dev harness shares a single Zustand store).
- **Retries:** 2 in CI, 0 locally (inherited).
- **Trace:** `on-first-retry` (inherited).
- **Reporter:** `github` in CI, `html` locally (inherited).

No changes to `playwright.webparts.config.ts` are required. Specs under
`e2e/webparts/kudos/**` are auto-discovered by `testDir`.

## Suite structure

```
e2e/webparts/kudos/
├── README.md                  run + layout quick reference
├── public/                    prompt 05 — public webpart matrix specs
├── companion/                 prompt 06 — companion webpart matrix specs
├── shared/                    prompt 07 — cross-seam + drift guard specs
├── hosted/                    prompt 08 — host/runtime matrix specs
├── fixtures/                  prompt 04 — deterministic seed payloads
│   └── baseline.ts            workflow/visibility/governance/prominence baselines
└── helpers/
    ├── kudosClock.ts          deterministic timestamps + anchors
    ├── kudosSeed.ts           seed factories (items, audits, recipients)
    ├── kudosLocators.ts       test-id registry + matrixTag()
    ├── kudosHarnessPage.ts    goto() helpers + seed hook entry
    ├── kudosAssertions.ts     public/admin boundary + drift guard
    └── kudosArtifacts.ts      screenshot/trace naming discipline
```

Every spec tags its cases with the matrix coordinates from
`09-Scenario-Matrix.md` (e.g. `[A3][C1][E3][H1]`) so coverage can be
reconstructed from test titles and artifact paths without re-parsing
spec bodies.

## Seeding model

Seams are injected, not mocked at the HTTP layer. The dev harness
Kudos tab (prerequisite below) attaches:

| Global | Role | Consumed by |
|---|---|---|
| `window.__hbKudosSeed(payload)` | accepts `SeedPayload` and installs it into the in-memory data layer before mount | `gotoKudosPublic`, `gotoKudosCompanion` |
| `window.__hbKudosProbe.workflowStates` | enumerates the exported workflow union | `assertWorkflowEnumLocked` |
| `window.__hbKudosCacheProbe.invalidations` | counter incremented on every `invalidatePeopleCultureCache()` call | cache-invalidation specs |

Real vs simulated seams:

| Seam | Real in harness? | Notes |
|---|---|---|
| `HbcPeopleCultureSurface` render | real | mounted from `@hbc/ui-kit/homepage` |
| `HbcKudosComposerFlyout` / `Form` / `Preview` | real | composer lifecycle is exercised in-browser |
| `usePeopleCultureData` + `invalidatePeopleCultureCache` | real | backed by in-memory seeded store |
| `submitKudosDraft` | simulated | writes to seeded store, records audit |
| `submitKudosGovernanceAction` | simulated | enforces writer rules (role gate, prominence collision, one-audit-per-action) |
| Graph photo hydration | simulated | photo presence driven by `recipient.hasPhoto` |
| SharePoint people search adapter | simulated | success / empty / error modes toggled via seed |
| Role resolution via security groups | simulated | `currentUserRole` on seed payload |
| Hosted SharePoint chrome | simulated | overlay injected by hosted-group helper (prompt 08) |

## Determinism

- Timestamps derive from `KUDOS_CLOCK_ANCHOR_ISO` (`2026-01-15T12:00Z`)
  via `at(offsetMinutes)` and the `KUDOS_SCHEDULED_FUTURE_ISO` /
  `KUDOS_AGED_OFF_ISO` / `KUDOS_ARCHIVE_ELIGIBLE_ISO` constants.
- Seeded IDs are monotonic, reset per fixture via
  `resetKudosSeedSequence()`. No random data.
- Etag values start at `"1"` and increment on each simulated write.

## Locators and test-id discipline

- Stable test ids live in `kudosLocators.ts` as `KUDOS_TESTIDS`.
- Selector form: `[data-hbc-testid="<id>"]`.
- When a required test id is missing from product code, it is added in
  the same commit that references it in a spec. No forced clicks, no
  reliance on brittle visual text for critical-path assertions.
- ARIA role + accessible name is preferred over a test id when a role
  already exposes the semantics to assistive tech (e.g. queue tab
  buttons use both a test id and `role="tab"`).

## Artifacts

- Screenshots: `test-results/kudos/<group>/<spec>/<case>-<tag>.png` via
  `captureProof()` in `kudosArtifacts.ts`.
- Traces: inherited from Playwright (`on-first-retry`), preserved under
  `test-results/`.
- HTML report: `pnpm exec playwright show-report`.
- Curated proof screenshots are captured only at the assertion moment
  that defines the case (no decorative captures).

## Running focused subsets

```
# full kudos lane
pnpm exec playwright test --config=playwright.webparts.config.ts e2e/webparts/kudos

# one group
pnpm exec playwright test --config=playwright.webparts.config.ts e2e/webparts/kudos/public
pnpm exec playwright test --config=playwright.webparts.config.ts e2e/webparts/kudos/companion
pnpm exec playwright test --config=playwright.webparts.config.ts e2e/webparts/kudos/shared
pnpm exec playwright test --config=playwright.webparts.config.ts e2e/webparts/kudos/hosted

# single matrix coord
pnpm exec playwright test --config=playwright.webparts.config.ts e2e/webparts/kudos --grep "\\[A3\\]\\[C1\\]"

# P0 tier only
pnpm exec playwright test --config=playwright.webparts.config.ts e2e/webparts/kudos --grep "\\[P0\\]"
```

## Prerequisites (handoff to prompt 04)

This workstream wires the harness skeleton. The following items are
owned by prompt 04 (fixtures/seed) before the `test.fixme` guards on
the group smoke specs are removed:

1. Add a Kudos tab to `apps/dev-harness/src/tabs/` that mounts
   `HbKudos` and `HbKudosCompanion` under `?tab=kudos` and
   `?tab=kudos-companion`.
2. Attach `window.__hbKudosSeed` that replaces the in-memory data
   layer with a `SeedPayload` before mount.
3. Attach `window.__hbKudosProbe` exposing the exported workflow
   states (used by drift guard).
4. Attach `window.__hbKudosCacheProbe` exposing an invalidation
   counter wired to `invalidatePeopleCultureCache()`.
5. Register `data-hbc-testid` attributes on the locators listed in
   `kudosLocators.ts` that are not yet present in product code.

When items 1–5 are in place, each group smoke spec drops its
`test.fixme` guard in the same commit that adds the first real
matrix case for that group.

## Authority references

- `09-Scenario-Matrix.md` — matrix coordinates and priority tiers
- `01-Audit-Summary.md` — repo truth for runtime seams
- `docs/reference/developer/verification-commands.md` — broader
  verification routing
- `playwright.webparts.config.ts` — lane configuration (do not fork)
