# Closure Note — Phase 06 UI / Phase 0 / Prompt 03 (Wave 0 Close)

**Step:** Perform Wave 0 hosted validation and package proof
**Wave 0 status:** Closed in repo; awaits tenant App Catalog upload for live
sign-off.
**Packaged artifact:** `dist/sppkg/hb-webparts.sppkg`
**Version:** hb-webparts Feature `1.0.0.264` / solution `1.0.0.253`
**App bundle:** `hb-webparts-app-a6514738.js` (sha256
`a65147383a40...`)

## Package proof (repo → .sppkg parity)

`dist/sppkg/hb-webparts-package-truth-proof.json` — all four checks
`pass: true`:

| Check | Result |
|-------|--------|
| `structuralValidity` | pass — required package structures and assets present |
| `freshness` | pass — packaged bundle sha256 matches freshly built Vite output |
| `sourcePackageSemanticAlignment` | pass — source/package semantic alignment verified |
| `liveRuntimeProof` | pass — static runtime guards passed (live SharePoint page validation still required before sign-off) |

Critical runtime source fingerprints (mount, Article Publisher, publisher
adapter, PnP ops) are captured in the proof file and aligned with the
shipped bundle. Shim proof (`hb-webparts-shim-proof.json`) confirms the 18
per-webpart `shell-entry-*.js` shims map to the correct entry module IDs
and compiled manifests.

## Build and package instructions (reproducible)

From repo root:

```sh
pnpm -w install                           # if dependencies are stale
pnpm tsx tools/build-spfx-package.ts --domain hb-webparts
```

Outputs:
- `dist/sppkg/hb-webparts.sppkg` — upload this to the tenant App Catalog.
- `dist/sppkg/hb-webparts-package-truth-proof.json` — repo→package proof.
- `dist/sppkg/hb-webparts-shim-proof.json` — shim/entry-module proof.
- `tools/spfx-shell/release/assets/hb-webparts-app-*.js` — content-hashed
  bundle committed for CDN reproducibility.
- `tools/spfx-shell/release/manifests/*.manifest.json` — compiled SPFx
  manifests (one per webpart).

The orchestrator invokes `tsc --noEmit && vite build` for hb-webparts,
content-hashes the IIFE bundle, regenerates shell-entry shims, composes
per-webpart manifests, runs `gulp package-solution --ship` under Node 18
(`$HOME/.nvm/versions/node/v18.20.8/bin/node`), and verifies the packaged
`.sppkg` against the freshly built source.

## Hosted validation checklist (to be executed at deploy time)

Because hosted validation requires a live SharePoint tenant, this
checklist captures the acceptance steps the operator must complete after
uploading the new `.sppkg`. Paste the results under "Hosted evidence"
below before marking Wave 0 fully closed.

1. Upload `dist/sppkg/hb-webparts.sppkg` to the tenant App Catalog and
   accept the upgrade prompt. Confirm the catalog entry shows solution
   version `1.0.0.253` and feature version `1.0.0.264`.
2. Navigate to the HBCentral Article Publisher page.
3. In the browser DevTools Network tab, filter `hb-webparts-app` and
   confirm the served filename is `hb-webparts-app-a6514738.js` (no prior
   `-7657b695.js` or other stale hash).
4. Confirm the toolbox and webpart title render as **Article Publisher**.
5. Load each authoring tab in turn and confirm no SharePoint list 404 or
   `Project Spotlight Post*` error surfaces in the console or status
   line:
   - Queue
   - Article (master record editor)
   - Team
   - Media / Gallery
   - Preview
   - Status / Workflow history
6. Open a draft and confirm destination labeling appears only where
   Project Spotlight is the subject (e.g. Spotlight Type field, destination
   picker) and that the app chrome does not present legacy
   `Project Spotlight Publisher` wording.
7. Exercise the lifecycle smoke path: create draft → save → preview →
   publish → verify workflow history row and page binding. No regression
   in publish orchestration, validation, preview, or page binding is
   expected; any regression must be reported as a Wave 0 re-open.

### Hosted evidence

_To be filled by the deploying operator after completing the checklist._

- Upload timestamp:
- App Catalog version confirmed:
- Bundle filename served by CDN:
- Console screenshot (or transcript) showing clean load of all tabs:
- Lifecycle smoke result (create → publish → verify):

## Repo-side validation performed

- `pnpm --filter @hbc/spfx-hb-webparts build` — pass (tsc + vite).
- `pnpm tsx tools/build-spfx-package.ts --domain hb-webparts` — pass
  (structural validity, freshness, semantic alignment, and static
  runtime proofs all green; `.sppkg` 3208.5 KB).
- `pnpm vitest run src/homepage/data/publisherAdapter/publisherListDescriptors.test.ts src/homepage/data/publisherAdapter/terminologyBoundary.test.ts`
  → 24 / 24 pass. Asserts no descriptor uses an obsolete
  `Project Spotlight *` title and that the terminology boundary remains
  intact at the adapter layer.
- Full adapter suite (`pnpm vitest run src/homepage/data/publisherAdapter`)
  → 193 pass / 16 fail. The 16 failures were verified pre-existing by
  running the same suite against a clean stash of this branch (identical
  failure count). They sit outside Wave 0's scope and are owned by later
  phases.
- Static drift scan: no `Project Spotlight Post*` references remain in
  any packaged or published artifact under `apps/hb-webparts/dist`,
  `tools/spfx-shell/assets`, or `tools/spfx-shell/release/assets`.

## Files changed

None outside the closure notes already filed for this wave:

- `docs/architecture/plans/MASTER/spfx/publisher/phase-06-UI/phase-0/Closure-Prompt-01.md`
- `docs/architecture/plans/MASTER/spfx/publisher/phase-06-UI/phase-0/Closure-Prompt-02.md`
- `docs/architecture/plans/MASTER/spfx/publisher/phase-06-UI/phase-0/Closure-Prompt-03.md` (this note)

The code/asset changes that close Wave 0 were applied in the prior two
prompts; this prompt produces the closure evidence only.

## Wave 0 deliverables — final check

| Deliverable | Evidence |
|-------------|----------|
| Runtime references to legacy `Project Spotlight Post*` lists removed | Closure-Prompt-01 §Validation; static drift grep returns zero |
| Publisher repositories target `HB Article*` family | `publisherListDescriptors.test.ts` passes; descriptor table audited |
| Author-facing rebrand drift eliminated | Closure-Prompt-02 audit mapping |
| Fresh build/package instructions documented | This note §Build-and-package-instructions |
| Hosted validation checklist captured | This note §Hosted-validation-checklist |
| Proof that latest source is what got packaged | `hb-webparts-package-truth-proof.json` (all checks pass) + shim proof |

## Follow-up required before Wave 1

- Upload the new `.sppkg` and complete the hosted validation checklist
  above. Wave 1 may begin in parallel, but Wave 0 is only *fully* closed
  once hosted evidence is pasted into this note.
- The 16 pre-existing failing adapter tests should be triaged by Wave 1
  or the owning phase — they are unrelated to Wave 0 scope but are on the
  radar for anyone running the full publisher test suite.
