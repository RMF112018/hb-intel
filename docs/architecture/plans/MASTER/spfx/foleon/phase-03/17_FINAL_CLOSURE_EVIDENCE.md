# Final Closure Evidence — Three-Lane Foleon Homepage Cutover

Generated for Prompt 05 on 2026-04-25 and updated by the 2026-04-26 audit/proof promotion pass. This is a documentation/evidence closure pass with scoped homepage version-authority alignment only: no tenant mutation, no Foleon source change, no Foleon package/version bump, no homepage runtime behavior change, and no generated `dist/` artifact staging.

## Closure Status

Closed after audit. The prior accepted three-lane cutover target was `1.1.78.0`; the promoted deployment target is now `1.1.79.0`.

Use the current `1.1.79.0` ignored artifact only after the audit/proof commit that records coherent homepage version authority, fresh package proof, unchanged three-lane runtime behavior, unchanged embedded Foleon expected package version `1.0.23.0`, and no tenant mutation.

## Package and Version Truth

| Surface | Version | Evidence |
|---|---:|---|
| Foleon package/runtime expected version | `1.0.23.0` | `apps/hb-intel-foleon/src/webparts/foleon/runtimeContract.ts`; Foleon manifest defaults remain at `1.0.23.0`. |
| Prior accepted homepage cutover target | `1.1.78.0` | Prompt 04 acceptance target retained as historical context. |
| Promoted homepage deployment target | `1.1.79.0` | Audited coherent package authority across `apps/hb-homepage`, `apps/hb-webparts`, `packages/homepage-launcher`, and `tools/spfx-shell/config/package-solution.json`. |
| Embedded homepage Foleon expected version | `1.0.23.0` | `apps/hb-webparts/src/webparts/hbHomepage/wiring/foleonHomepageConfig.ts`. |

No Foleon package rebuild was required for this documentation pass. The existing Foleon `1.0.23.0` package truth remains the deployment baseline for the embedded homepage lanes.

## Homepage Artifact Proof

| Item | Value |
|---|---|
| Homepage package artifact | `dist/sppkg/hb-intel-homepage.sppkg` |
| Current SHA256 | `5c7e3c98760fcea37308f6d7270e78d544704cd3e3ce8fc780f86347a36526ef` |
| Effectiveness proof | `dist/sppkg/hb-intel-homepage-effectiveness-proof.json` |
| Package truth proof | `dist/sppkg/hb-homepage-package-truth-proof.json` |
| Artifact staged/tracked status | Not staged and not tracked; `git status --ignored -- dist/sppkg` reports `!! dist/`. |

Current ignored homepage package proof confirms:

- `versionAuthority.aligned: true`.
- `solutionVersion`, `featureVersion`, and `webpartManifestVersion` are all `1.1.79.0`.
- Packaged app bundle is `ClientSideAssets/hb-homepage-app-507b9572.js`.
- Package-truth proof `freshness.pass: true` with details: app bundle hash matches the current dirty local build.
- Package-truth proof `sourcePackageSemanticAlignment.pass: true`.
- Package-truth proof `liveRuntimeProof.pass: true`, including the homepage webpart id `e0a11c44-e6d7-45d1-9af5-09ba0b68f5cf`.

This is valid evidence that the package artifact is fresh relative to the audited `1.1.79.0` source/version state. `1.1.79.0` replaces `1.1.78.0` as the accepted deployment target after the audit/proof commit.

## Validation Command Results

| Command | Exit code | Status | Result summary | Scope classification |
|---|---:|---|---|---|
| `pnpm --filter @hbc/foleon-reader check-types` | `0` | Passed | TypeScript completed cleanly. | In-scope shared reader validation. |
| `pnpm --filter @hbc/foleon-reader test` | `0` | Passed | `5` files, `59` tests passed. | In-scope shared reader validation. |
| `pnpm --filter @hbc/spfx-hb-intel-foleon lint` | `0` | Passed with warnings | ESLint reported `128` warnings and `0` errors. | In-scope Foleon app validation; warnings are existing style/token warnings. |
| `pnpm --filter @hbc/spfx-hb-intel-foleon check-types` | `0` | Passed | `tsc --noEmit` completed. | In-scope Foleon app validation. |
| `pnpm --filter @hbc/spfx-hb-intel-foleon test` | `0` | Passed | `27` files, `270` tests passed. | In-scope Foleon app validation. |
| `pnpm --filter @hbc/spfx-hb-intel-foleon build` | `0` | Passed | Vite emitted `hb-intel-foleon-app.js`. | In-scope Foleon app validation; no Foleon package rebuild was staged. |
| `pnpm --filter @hbc/spfx-hb-intel-foleon schema:validate` | `0` | Passed | Feature Framework validation passed `498` checks. | In-scope schema/package source validation. |
| `pnpm --filter @hbc/spfx-hb-webparts lint` | `1` | Blocked | `10` errors, `19` warnings. Errors are in Kudos static guardrails, People Culture token guardrails, preview fallback route test, missing lint plugin rules, hbKudos hooks, Safety dynamic provider, and related unrelated files. | Unrelated broad-suite blocker; changed Foleon/homepage cutover files have focused tests passing. |
| `pnpm --filter @hbc/spfx-hb-webparts check-types` | `2` | Blocked | Three TypeScript errors: `hbKudosAccessibilityGuardrails.test.tsx` missing `laneMode`, `homepageHeroDaypartPrecedence.test.tsx` implicit `any`, `PriorityActionsRail.tsx` `"more-tools"` type mismatch. | Unrelated broad-suite blocker; none are in the cutover commit file list. |
| `pnpm --filter @hbc/spfx-hb-webparts test` | `1` | Blocked | Full suite result: `16` failed files, `95` passed files; `24` failed tests, `1237` passed tests. Failures are in bundle budget, discovery, hero, interactive states, Kudos, People Culture, Priority Actions, top-band, utility webparts, and snapshots. | Unrelated broad-suite blocker; focused Foleon homepage tests pass. |
| `pnpm --filter @hbc/spfx-hb-homepage lint` | `2` | Blocked | ESLint cannot find a configuration file under `apps/hb-homepage/src` or ancestors. | Repo configuration blocker for that package script. |
| `pnpm --filter @hbc/spfx-hb-homepage build` | `0` | Passed | `tsc --noEmit && vite build` completed and emitted `hb-homepage-app.js`. | In-scope homepage package validation. |
| `npx tsx tools/build-spfx-package.ts --domain hb-homepage` | `0` | Passed | Fresh build enforced, Node `18.20.8` used for SPFx tooling, package and proof JSONs emitted under `dist/sppkg/`; current proof is `1.1.79.0`, the promoted accepted deployment target. | In-scope package proof for audited homepage promotion. |

Focused changed-area validation:

```bash
pnpm --filter @hbc/spfx-hb-webparts exec vitest run --config vitest.config.ts src/webparts/hbHomepage/zones/__tests__/FoleonHomepageZones.test.tsx src/webparts/hbHomepage/zones/__tests__/FoleonHomepageLaneHost.test.tsx src/webparts/hbHomepage/wiring/__tests__/foleonHomepageConfig.test.ts src/webparts/hbHomepage/__tests__/HbHomepageShell.zoneProps.test.tsx src/webparts/hbHomepage/__tests__/hbHomepagePackageAuthority.test.ts
```

Result: exit code `0`; `5` files and `20` tests passed. This focused suite covers the changed homepage Foleon lane wrappers, lane host, config seam, shell prop forwarding/protected pairing diagnostics, and homepage package authority.

## Three-Lane Cutover Proof

- `ProjectPortfolioSpotlightZone` renders `FoleonHomepageLaneHost` with `lane="projectSpotlight"` and `occupantId="project-portfolio-spotlight"`.
- `CompanyPulseZone` renders `FoleonHomepageLaneHost` with `lane="companyPulse"` and `occupantId="company-pulse"`.
- `LeadershipMessageZone` renders `FoleonHomepageLaneHost` with `lane="leadershipMessage"` and `occupantId="leadership-message"`.
- Focused tests assert the legacy Project Portfolio Spotlight, Company Pulse/Newsroom, and Leadership Message module content is not rendered by these wrappers.
- Multi-lane safety test renders all three embedded lanes together and asserts there are three lane DOM subtrees, no iframe/root conflict in the mocked homepage host, and `window.__hbIntel_foleon` remains undefined.

## Tenant Follow-Up

Before hosted sign-off, verify HBCentral list choices include:

```text
ReaderKey:
project-spotlight
company-pulse
leadership-message

PlacementKey:
Project Spotlight Active
Company Pulse Active
Leadership Message Active

PageContext:
Project Spotlight
Company Pulse
Leadership Message
```

Update existing HB Homepage webpart instances with:

```text
foleonContentRegistryListId
foleonPlacementsListId
foleonEventsListId
foleonAcceptedOrigins
foleonAllowPreview
foleonExpectedManifestId
foleonExpectedPackageVersion = 1.0.23.0
foleonApiBaseUrl
foleonApiResource
```

Hosted deployment must also confirm homepage package/version governance at `1.1.79.0`; `1.1.78.0` remains the historical prior accepted target.

## Hosted Validation Checklist

- Project Spotlight lane renders in the former Project Portfolio Spotlight location.
- Company Pulse lane renders in the former Newsroom / Company Pulse location.
- Leadership Message lane renders in the former Message from Leadership location.
- All three lanes show preview state when no active record exists.
- Live content replaces preview when valid active records/placements exist.
- Runtime proof has no package-version mismatch.
- No horizontal overflow at desktop, tablet, phone, short-height, and narrowest-stable breakpoints.
- No `window.__hbIntel_foleon` dependency exists in homepage embedded lanes.
- Capture breakpoint screenshots and DOM marker readouts before tenant closure.
