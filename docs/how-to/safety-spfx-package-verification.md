# Safety SPFx package verification & deployment

How to produce, verify, deploy, and prove the Safety SPFx `.sppkg` end-to-end. Covers the build → package → verify → upload → hosted-runtime-proof flow with the exact `window.__hbIntel_safetyRuntimeBindingProof` field set required for hosted closure.

## Why this exists

The packaged Safety webpart class is the generic SPFx shell (`tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`) rebranded with the Safety manifest ID. The shell loads the Vite-built `safety-app.js` and calls its exported `mount()` with a runtime config object derived from build-time webpack DefinePlugin constants. The Safety runtime contract validates that config against bundle-baked governance constants (`SAFETY_*` from `apps/safety/src/runtime/governedRuntimeBinding.ts`) and refuses to initialize unless every governance field matches.

A successful `gulp package-solution --ship` does **not** prove that the deployed page is running the right artifact. Hosted closure requires every link in this chain to align: in-repo authority → packaged `.sppkg` → App Catalog deployment → live page runtime proof. This runbook walks through producing each link's evidence.

## 1. Build the Safety app bundle

```bash
pnpm --filter @hbc/spfx-safety build
```

Output: `apps/safety/dist/safety-app.js` (Vite IIFE bundle with all `SAFETY_*` governance constants baked in via Vite defines).

## 2. Build the `.sppkg`

```bash
npx tsx tools/build-spfx-package.ts --domain safety
```

Outputs in `dist/sppkg/`:

- `hb-intel-safety.sppkg` — the deployable package.
- `safety-package-truth-proof.json` — source-vs-packaged SHA evidence + manifest linkage.
- `safety-route-auth-proof.json` — backend route + auth scope assertions.
- `safety-runtime-config-proof.json` — governed authority assertions.
- `safety-shim-proof.json` — shell-entry shim hash + module-id mapping.

All four proofs share the same `packagingRunId`. The orchestrator emits them only after the `.sppkg` is fully written.

## 3. Verify the package (closure gate for this prompt)

```bash
npx tsx tools/verify-safety-sppkg.ts
```

The verifier is read-only. It:

- Loads expected values from in-repo authority (`runtime-binding.json`, `package-solution.json`, `SafetyWebPart.manifest.json`, `print-release-proof.mjs`).
- Asserts all four proof JSONs share an identical `packagingRunId` (stale-proof gate).
- Asserts `.sppkg` mtime is plausibly contemporaneous with the run-ID timestamp.
- Cross-validates the proofs' embedded values against the unpacked `.sppkg`.
- Computes `.sppkg` SHA-256 and per-asset SHAs for `ClientSideAssets/safety-app-*.js`, `ClientSideAssets/shell-web-part_*.js`, and the shell-entry shim.
- Asserts the packaged Safety bundle is byte-identical to `apps/safety/dist/safety-app.js`.
- Locates and validates `AppManifest.xml`, the feature XML, and the per-webpart XML; extracts `ProductID`, `Version`, feature `Id`, and webpart manifest ID and asserts each matches in-repo authority.
- Performs a byte-level marker scan on both bundles for ten structural-key + value-level governance markers, attributing each hit to a specific bundle and byte offset.
- Emits `dist/sppkg/safety-package-verification-report.{json,md}`.

Exit code `0` is the gate. Inspect the Markdown report; every check should be PASS / ✅.

## 4. Pre-upload checklist

Before uploading to the App Catalog:

- Verifier exited `0`.
- All four proof JSONs share the same `packagingRunId`.
- `bundleEquality.packagedSafetyAppMatchesSource` is **PASS**.
- `manifestXml.allMatched` is **PASS**.
- Every row of the marker scan table shows ✅.
- Record the `.sppkg` SHA-256 from the report for audit comparison after deployment.

## 5. App Catalog upload

Operator action — outside this repo.

1. Open the SharePoint Tenant App Catalog.
2. Upload `dist/sppkg/hb-intel-safety.sppkg`. Choose **Replace it** if a prior version exists.
3. In the trust dialog, confirm the displayed solution ID matches `e78a16be-7853-40a4-be18-3b01b3ca405d` (current `solutionId` from the verification report) and the displayed version equals `expectedAuthority.packageVersion` from the report.
4. Approve. Wait for the App Catalog to mark the package "Deployed" with version equal to `expectedAuthority.packageVersion`.
5. Record the deployed version + upload timestamp + operator note in the report's `appCatalogDeployment.*` placeholders (manual edit of the JSON or attach a separate note).

> **Do not** trust the SharePoint UI's "Modified" timestamp or display label as the only proof of a fresh deployment. The App Catalog can serve a stale CDN cache for several minutes after upload. Always verify via the live runtime proof in step 7.

## 6. Stale-cache handling

If the deployed-page runtime proof (step 7) shows an older `expectedPackageVersion` than the verifier's expected version:

- Hard-reload the page (Shift + Reload).
- Try a private/incognito browser window to bypass cached service-worker responses.
- Wait a few minutes for the App Catalog CDN to propagate.
- If still stale, re-upload the `.sppkg`. If still stale after re-upload, contact the tenant admin.

> Never trust the App Catalog UI label alone; always verify via the live runtime proof.

## 7. Hosted runtime proof capture (live closure assertion)

Operator action — outside this repo. This is the **only** evidence that constitutes hosted SharePoint runtime closure.

1. Open a SharePoint page hosting the Safety webpart.
2. Hard-reload to bypass CDN cache.
3. Open DevTools → Console.
4. Paste:

```js
copy(JSON.stringify(window.__hbIntel_safetyRuntimeBindingProof, null, 2));
console.log(window.__hbIntel_safetyRuntimeBindingProof);
```

5. The full proof JSON is now on the clipboard. Paste it into the verification report's `hostedPageProof.operatorNote` placeholder, or attach as a Phase-09 audit-report artifact under `docs/architecture/plans/MASTER/spfx/safety-records/phase-09/audit-reports/`.

## 8. Hosted closure pass/fail checklist

The captured `__hbIntel_safetyRuntimeBindingProof` must satisfy **all sixteen** of the following. Any single failure means hosted closure is **not** achieved.

| # | Field | Must equal |
| --- | --- | --- |
| 1 | `runtimeContract.hostSource` | `'shell-webpart'` |
| 2 | `configured.webPartId` | `'ba2cd939-ed9e-4aea-bb8c-324ed1d67e9e'` |
| 3 | `runtimeContract.governed.webPartIdPresent` | `true` |
| 4 | `runtimeContract.governed.webPartIdMatchesManifest` | `true` |
| 5 | `runtimeContract.backend.baseUrlPresent` | `true` |
| 6 | `runtimeContract.backend.baseUrlValid` | `true` |
| 7 | `runtimeContract.backend.apiAudiencePresent` | `true` |
| 8 | `runtimeContract.governed.backendOriginMatchesAccepted` | `true` |
| 9 | `runtimeContract.governed.manifestIdMatchesExpected` | `true` |
| 10 | `runtimeContract.governed.packageVersionMatchesExpected` | `true` |
| 11 | `runtimeContract.governed.apiAudienceMatchesExpected` | `true` |
| 12 | `runtimeContract.hostedGuidOverlay.fingerprintMatchesExpected` | `true` |
| 13 | `runtimeContract.hostedGuidOverlay.known` | `true` |
| 14 | `runtimeContract.canInitializeCommands` | `true` |
| 15 | `runtimeContract.blockingReasons.length` | `0` |
| 16 | `governedAuthority.expectedPackageVersion` | matches the just-uploaded version |

## 9. Closure scope

- **This runbook + verifier closes**: package and deployment **verification tooling**. The verifier produces a deterministic, repeatable report combining `.sppkg`-level SHA, packaged-vs-source bundle equality, manifest XML extraction, four pre-existing proof JSONs (with stale-proof gate), and a value-precise marker scan.
- **This runbook does not close**: hosted SharePoint runtime closure. Live closure requires App Catalog upload of the verified `.sppkg` and a real `window.__hbIntel_safetyRuntimeBindingProof` capture from a hosted Safety page that satisfies every field in §8. Both are operator actions outside this repository.

## 10. Constraints

- Never upload publish settings, deployment credentials, or secrets to the App Catalog or to the repository.
- Never trust SharePoint UI labels alone.
- Never claim hosted closure without the live capture matching every required field.
- Never modify the `.sppkg` post-build. The verifier is read-only and operators must not edit the package bundle.
- Never bypass the runtime gate. If the live capture shows blocking reasons, fix the source of the mismatch — do not relax the contract.

## Related artifacts

- `tools/build-spfx-package.ts` — orchestrator that emits the four per-build proof JSONs.
- `tools/verify-safety-sppkg.ts` — read-only verifier that produces the unified report.
- `apps/safety/scripts/print-release-proof.mjs` — source-of-truth fingerprint authority.
- `apps/safety/src/runtime/governedRuntimeBinding.ts` — Vite-baked `SAFETY_*` constants.
- `apps/safety/src/runtime/safetyRuntimeContract.ts` — the runtime contract that validates the shell-supplied governance.
- `apps/safety/src/test/safetyRuntimeContract.test.ts` — positive- and negative-path coverage of the contract, including the shell-host conditional gate.
- `apps/safety/src/test/safetyReleaseProof.test.ts` — cross-validates the script's fingerprint output equals the runtime's `hostedSafetyGuidOverlayFingerprint()`.
