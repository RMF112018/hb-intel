# Safety Field Excellence — Rollback Runbook (Wave 07)

| Field | Value |
|---|---|
| Date authored | 2026-04-25 |
| Branch | main |
| Commit (HEAD) | `3022358e6fe2b8acd3769d66c657f6b0f41b7618` |
| Wave | 07 (Phase 02) |
| Surface | Safety Field Excellence dynamic homepage surface |
| Authority docs | `cut-over-plan/06_Verification_and_Hosted_Proof.md`, `cut-over-plan/07_Risk_Register_and_Governance.md` |

This runbook covers four rollback paths (SPFx, configuration, backend content, emergency curated fallback) plus a post-rollback verification checklist. Use the smallest path that returns the homepage to a safe state.

## When to roll back

Initiate rollback if any of the following is observed in hosted SharePoint after a Wave 07 cutover:

- Homepage Safety Field Excellence surface fails to render or throws runtime exceptions attributable to the surface.
- `window.__hbIntel_safetyFieldExcellenceRuntimeProof` is absent, malformed, or contains tokens / raw payload / raw checklist content.
- Hosted DevTools shows the homepage calling any admin/control-plane endpoint (`/rollup/dry-run`, `/rollup/generate`, `/reporting-periods/{id}/candidates`, `/highlights/.../approve`, `.../publish`, `.../suppress`, `.../rollback`).
- `/api/safety-field-excellence/homepage/current` returns 401/403 for normal authenticated delegated users (and the cause is endpoint-side, not a token-acquisition setup issue).
- Published payload exposes raw findings text, raw checklist content, employee performance detail, or Graph diagnostics.
- Preview fallback renders without clear preview labeling (i.e. looks like production data).
- A wave-07-or-later artifact has been deployed but its `runtimeProof.packageVersion !== expectedPackageVersion`.

Any of the **Hard Stop Conditions** in `cut-over-plan/07_Risk_Register_and_Governance.md` (no published artifact, raw findings/workbook JSON exposed, single-score winner selection, mislabeled preview, scorecard below 48/56 without exception, hosted runtime ≠ package/source truth) is also a rollback trigger.

## Path A — SPFx package rollback (deploy prior `.sppkg`)

Use when the deployed `hb-webparts.sppkg` is itself the problem (bad bundle, wrong version, corrupted assets) and a known-good prior package exists.

1. Identify the prior known-good `.sppkg` and its SHA256. Do **not** redeploy `dist/sppkg/hb-webparts.sppkg` from commit `3022358e6` (pre-Wave-06; SHA `d2defe6b1214cb4815c0d3ec6e9f49037feda7fe1aba49925a640354bbffa034`) as a forward artifact — it is documented in `safety-field-excellence-package-truth-proof.md` as the stale baseline. It is acceptable as a *backward* rollback target only when the bad deploy was strictly newer than this baseline and the operator confirms the SHA on disk matches the prior known-good snapshot.
2. In the SharePoint app catalog (tenant or site collection):
   - Open the app catalog list view for `hb-webparts.sppkg`.
   - Use **Files → Version History** to inspect prior versions.
   - Select the prior known-good version and **Restore**, or upload the prior `.sppkg` again to overwrite.
   - When prompted, choose **Replace existing** and confirm trust + tenant-wide deployment as required by tenant practice.
3. If a CDN or app-bundle cache is in use, follow tenant practice to invalidate the relevant entries (typical: clear `https://publiccdn.sharepointonline.com/<tenant>` cache hint by re-saving the app catalog item, or wait for the documented TTL).
4. Verify the `SafetyFieldExcellenceWebPart` version reverts to the prior `0.0.x.0` value as observed in DevTools Sources or in the runtime-proof object's `packageVersion` field.
5. Reload the HBCentral homepage in a private/incognito browser window to bypass local SP cache.

## Path B — Configuration rollback (force curated-only render)

Use when the deployed package is fine but the dynamic data path is misbehaving (auth, backend, payload). This is the **fastest** rollback and should be tried first if the package itself is not suspect.

1. In the homepage configuration source (the curated config consumed by `apps/hb-webparts/src/webparts/hbHomepage` and the `SafetyFieldExcellenceZone`):
   - Set `safetyFieldExcellence.sourceMode` to `"curated-only"` (the default).
   - Remove or disable `safetyFieldExcellenceDynamic` (drop the dynamic config block, or set it to `null`/unset).
   - Leave the curated `safetyFieldExcellence` config intact so the surface still renders authored content.
   - Optionally clear or null `functionAppBaseUrl` for the safety surface to remove any latent backend reach.
2. Re-publish the homepage configuration via the existing config publishing mechanism (no new tooling required; this rollback uses only the existing curated config flow).
3. Reload the HBCentral homepage. The runtime proof object should now report:
   - `sourceMode: "curated-only"`
   - `dataSource: "curated"`
   - `currentEndpointConfigured: false` (or `true` with no fetch attempted, depending on config — see provider source for exact semantics)
4. No backend writes are required for this path. No SPFx redeploy is required.

## Path C — Backend content rollback (suppress / re-publish)

Use when the package and config are fine but the published Safety Field Excellence highlight content is incorrect, stale, or violates redaction rules.

Use only the Wave 04 leadership routes (do not edit list records directly):

- `POST /api/safety-field-excellence/highlights/{id}/suppress` — suppress the current published highlight. After suppression, `/homepage/current` returns `state: "no-published-highlight"` and the homepage renders the curated / preview fallback per source mode.
- `POST /api/safety-field-excellence/highlights/{id}/rollback` — roll back to a prior published highlight where supported.
- `POST /api/safety-field-excellence/highlights/{id}/publish` — re-publish the corrected artifact once leadership approves it.

Do **not** call these from the homepage surface — they are admin/control-plane routes. Operate them only via the leadership/admin tooling that owns approval and audit fields. Direct list-record edits are reserved for documented emergency processes and must be logged.

## Path D — Emergency curated fallback verification

Use after Path A, B, or C to confirm the homepage is in a safe state.

1. Confirm the curated `safetyFieldExcellence` configuration block is present and renders authored content.
2. Reload the HBCentral homepage in a clean browser session.
3. In DevTools console run:
   ```js
   JSON.stringify(window.__hbIntel_safetyFieldExcellenceRuntimeProof, null, 2)
   ```
   Required values after rollback:
   - `sourceMode: "curated-only"` (Path B) or the prior known-good mode (Path A)
   - `dataSource: "curated"` or `"curated-fallback"` (acceptable: `"preview-fallback"` only if no curated config is staged)
   - `previewFallbackRendered`: only `true` when no curated config exists and preview fallback is the intended emergency state
   - No tokens, no raw payload, no raw checklist content
4. In DevTools Network panel, filter to `safety-field-excellence`. After Path B, no calls to `/homepage/current` are expected (curated-only does not fetch). After Path A or C, only `/homepage/current` should appear; any admin endpoint hit is a regression.
5. Capture a screenshot of the rendered surface and append the path under the "Verification after rollback" section below.

## Verification after rollback

| Check | Method | Pass criteria |
|---|---|---|
| Homepage renders without errors | Open HBCentral homepage | No console exceptions attributable to Safety Field Excellence |
| Runtime proof in safe state | DevTools console | `dataSource` ∈ {`curated`, `curated-fallback`, `preview-fallback`}; no token / raw payload exposure |
| No admin endpoint calls | DevTools Network panel | Only `/homepage/current` if any; never `/rollup/*`, `/reporting-periods/...`, `/candidates`, `/approve`, `/publish`, `/suppress`, `/rollback` from homepage |
| Curated content is authored, current, and intentional | Visual check | Authored copy, no obvious staleness, no dead CTAs |
| Prior known-good package version observable | DevTools Sources or `runtimeProof.packageVersion` | Matches the documented prior good version |
| Tenant users can read homepage | Operator + 1 normal user | Both load the homepage successfully |

## Owner / action table

| Action | Primary owner | Backup |
|---|---|---|
| Decide rollback (Yes/No) | HB Intel SPFx maintainer (Technical Owner) | Safety Department lead |
| Execute Path A (SPFx redeploy) | HB Intel SPFx maintainer | App catalog admin |
| Execute Path B (config) | Homepage config owner (HB Intel) | HB Intel SPFx maintainer |
| Execute Path C (suppress / rollback / re-publish content) | Safety Department lead (content owner) | HB Intel SPFx maintainer |
| Execute Path D (verification) | HB Intel SPFx maintainer | Operator |
| Update incident notes / evidence | HB Intel SPFx maintainer | — |
| Approve return to forward cutover | Safety Department lead + HB Intel SPFx maintainer (joint, per `cut-over-plan/07_Risk_Register_and_Governance.md` "Approval Required For: dynamic-only cutover, removal of curated fallback") | — |

## Notes

- Path B is the fastest and safest rollback when the package itself is acceptable. Try B before A whenever the symptom is a data/path issue (auth, network, payload).
- Path A requires the prior known-good `.sppkg` SHA on file. The Wave 07 package-truth-proof captures the *current* artifact identity; before any forward Wave 07 deploy, the operator must record the *prior* deployed `.sppkg` SHA in case rollback is needed.
- Never roll back by editing list records directly; that bypasses the audit and approval fields owned by Wave 04 leadership routes.
- After any rollback, hosted-runtime-proof must be re-captured before another forward cutover attempt.
