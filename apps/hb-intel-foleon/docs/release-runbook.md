# Foleon phase-01 release runbook

Authoritative pre-release checklist for the Foleon SPFx webpart. Read
end-to-end before signing off on a production push. Every section maps
to a specific source-of-truth check — release is blocked until every
box is ticked or an explicit exception is recorded.

Pairs with:

- `docs/architecture/adr/ADR-0125-foleon-phase-01-launch-scope.md` —
  launch-scope decision.
- `docs/how-to/foleon-sharepoint-trusted-domain-runbook.md` — tenant
  iframe/CSP setup.
- `apps/hb-intel-foleon/docs/telemetry.md` — event schema + privacy.
- `apps/hb-intel-foleon/docs/accessibility-checklist.md` — a11y
  evidence.
- `apps/hb-intel-foleon/docs/provisioning.md` — list provisioning
  procedure.

## 1. Repo truth

Confirm the release is coming from `main` at a known commit.

- [ ] `git status` — working tree clean (no unstaged Foleon changes).
- [ ] `git log --oneline -n 5 -- apps/hb-intel-foleon` — top commit is
      the one you intend to release.
- [ ] Branch is `main`, not a feature branch.
- [ ] No `.tmp/` artifacts, `dist/` overrides, or uncommitted schema
      edits under `apps/hb-intel-foleon/`.

## 2. Package truth

The SharePoint 4-part version must be identical across all three
surfaces.

- [ ] `apps/hb-intel-foleon/src/webparts/foleon/FoleonWebPart.manifest.json`
      → `"version": "X.Y.Z.0"`.
- [ ] `apps/hb-intel-foleon/config/package-solution.json` solution
      version and feature version both `"X.Y.Z.0"`.
- [ ] `apps/hb-intel-foleon/src/webparts/foleon/runtimeContract.ts`
      → `FOLEON_PACKAGE_VERSION = 'X.Y.Z.0'`.
- [ ] `grep -R "X.Y.Z.0" apps/hb-intel-foleon` returns ≥ 3 hits and
      no stale previous version string remains.

For the registry-reader runtime bridge, Foleon package truth is
`1.0.26.0`. Homepage-embedded Foleon config still uses its own
persisted/configured `foleonExpectedPackageVersion` contract until that
package lane is explicitly promoted.

## 3. Runtime truth

After deploying the web part to a tenant page, open DevTools and
inspect the runtime binding proof.

```js
window.__hbIntel_foleonRuntimeBindingProof
```

- [ ] `bundleMarker === '__hbIntel_foleon'`.
- [ ] `manifestId === '2160edb3-675e-4451-92bb-8345f9d1c71e'`.
- [ ] `packageVersion` matches the released 4-part version.
- [ ] `hostMode === 'sharepoint'`.
- [ ] `canInitialize === true`.
- [ ] `presence.{siteUrl, contentRegistryListId, placementsListId,
      eventsListId}` all `true`.
- [ ] `fingerprints.{contentRegistryListSha, placementsListSha,
      eventsListSha}` are non-zero (`'00000000'` means a list GUID is
      missing).
- [ ] `originPolicy.hasAllowlist === true` and
      `fingerprints.originAllowlistCount >= 1`.
- [ ] `issueCodes` is `[]`.
- [ ] Existing page instances have `expectedPackageVersion` updated to
      the released version in the Foleon property pane. New instances
      inherit the manifest default, but existing pages may still persist
      an older value and trigger `package-version-mismatch`.

## 4. List truth

All four governed lists must exist on the HBCentral site before launch.

- [ ] Dry-run plan generated:
      `pnpm --filter @hbc/spfx-hb-intel-foleon provision:print > /tmp/foleon-provisioning-plan.json`.
- [ ] Tenant admin has provisioned, in order:
  - [ ] `HB_FoleonContentRegistry`
  - [ ] `HB_FoleonHomepagePlacements`
  - [ ] `HB_FoleonInteractionEvents`
  - [ ] `HB_FoleonSyncRuns`
- [ ] Every required-indexed field on each list is actually indexed
      in SharePoint (compare against the dry-run `requiredIndexedFields`
      output per list).
- [ ] List GUIDs captured and threaded into `IFoleonMountConfig`
      (`contentRegistryListId`, `placementsListId`, `eventsListId`).

## 5. Tenant config truth

- [ ] SharePoint HTML Field Security includes `viewer.us.foleon.com`
      (and any custom publishing domain) — see
      `docs/how-to/foleon-sharepoint-trusted-domain-runbook.md`.
- [ ] Foleon publisher response headers grant the tenant SharePoint
      origin via `Content-Security-Policy: frame-ancestors` (verified
      via browser DevTools).
- [ ] Webpart property pane `acceptedFoleonOrigins` contains only the
      origins actually embedded. No wildcards. `http:` entries are
      rejected by the origin policy by default.
- [ ] `allowPreview` is `false` for production. `true` only on
      admin-review pages.
- [ ] HBCentral Foleon schema choices include the three homepage
      reader lanes: `project-spotlight`, `company-pulse`, and
      `leadership-message`.
- [ ] Homepage placement choices include `Project Spotlight Active`,
      `Company Pulse Active`, and `Leadership Message Active`.
- [ ] Telemetry `PageContext` choices include `Project Spotlight`,
      `Company Pulse`, and `Leadership Message`.

## 6. Telemetry truth

- [ ] `presence.eventsListId === true` in the runtime binding proof.
- [ ] Empty-registry Content Hub preview search does not write a normal
      live Search telemetry row.
- [ ] Live-record Content Hub search still writes the normal Search
      telemetry envelope with raw text redacted.
- [ ] A manual card-click on a published record produces a new row in
      `HB_FoleonInteractionEvents` (`SearchQuery` is `null` — privacy
      rule) and `ClientInfoJson` contains the full governed envelope
      including `correlationId`, `packageVersion`, `manifestId`, and
      `privacyClass: "telemetry-minimal"`.
- [ ] Reader open + close produce paired events with the matching
      `correlationId`.
- [ ] `sessionId` is stable across multiple interactions in the same
      browser session (inspect
      `window.sessionStorage.getItem('__hbIntel_foleon_session')`).

## 7. Secrets posture

- [ ] `pnpm --filter @hbc/spfx-hb-intel-foleon test
      src/__tests__/bundleSecretsInvariant.test.ts` passes. The shipped
      bundle contains no Foleon OAuth markers, no direct Foleon API
      hostnames, and no baked-in `Authorization: Bearer` headers.
- [ ] `apps/hb-intel-foleon/dist/hb-intel-foleon-app.js` SHA-256
      recorded and matched against the `.sppkg` artifact once packaged.

## 8. Security posture (Reader / origin / iframe)

- [ ] Iframe attributes honored in-browser: `sandbox`, `allow`,
      `referrerPolicy`, `loading` — run `e2e/foleon-reader.spec.ts` or
      inspect DOM after Reader loads.
- [ ] No iframe appears on the Highlights or Hub routes — covered by
      `routeDeepLinks.test.tsx` DOM proof.
- [ ] `postMessage` `event.source` guard rejects cross-frame
      spoofing — covered by the same E2E spec.

## 9. Accessibility

- [ ] Every row in `apps/hb-intel-foleon/docs/accessibility-checklist.md`
      is green (or exceptions logged).
- [ ] Keyboard-only operator can: (a) tab to "Skip to main content"
      link, (b) tab through Highlights cards, (c) activate a card
      with Enter, (d) reach the Reader's iframe with a descriptive
      title, (e) return to Highlights with the Back button.
- [ ] VoiceOver / NVDA announce route changes ("Showing Foleon
      publication", etc.) via the `role="status"` `aria-live="polite"`
      announcer.

## 10. Launcher registration (deferred)

- [x] **Explicit deferral.** Foleon is not registered with
      `@hbc/homepage-launcher` in phase-01. See ADR-0125. The launch
      access path is a direct SharePoint page URL curated by
      `HB Intel Administrators`. Wave 02 adds the launcher tile.

If Marketing requests launcher discoverability before Wave 02 ships:

- [ ] Exception logged in the release sign-off below.
- [ ] Wave 02 launcher work scheduled and owner assigned.

## 11. Release verification commands

Run from the repo root. All must pass before sign-off.

```bash
pnpm --filter @hbc/spfx-hb-intel-foleon lint
pnpm --filter @hbc/spfx-hb-intel-foleon check-types
pnpm --filter @hbc/spfx-hb-intel-foleon test
pnpm --filter @hbc/spfx-hb-intel-foleon build
pnpm --filter @hbc/spfx-hb-intel-foleon schema:validate
npx tsx tools/spfx-shell/scripts/validate-foleon-runtime-config-bridge.ts
pnpm --dir tools/spfx-shell build
npx tsx tools/build-spfx-package.ts --domain hb-intel-foleon
pnpm --filter @hbc/spfx-hb-intel-foleon package:proof
```

Expected:

- `lint` — 0 errors (pre-existing inline-style warnings acceptable).
- `check-types` — clean.
- `test` — 170+ tests pass, including the bundle-secrets invariant.
- `build` — Vite bundle emitted at
  `apps/hb-intel-foleon/dist/hb-intel-foleon-app.js` (≈320 KB,
  gzip ≈97 KB).
- `schema:validate` — Feature Framework schema truth passes.
- package build — emits `dist/sppkg/hb-intel-foleon.sppkg`.
- `package:proof` — package, feature, webpart, toolbox defaults, and
  packaged schema assets align with source truth.

Generated `.sppkg` and package-proof artifacts are ignored by repo
policy (`*.sppkg`) and are not committed unless release policy changes.

## 12. Preview fallback tenant validation

For `1.0.17.0`, validate the preview fallback posture before release
sign-off:

1. Deploy `dist/sppkg/hb-intel-foleon.sppkg` to the App Catalog and
   install/update it on `/sites/HBCentral`.
2. Open the Foleon property pane and set
   `expectedPackageVersion` to `1.0.17.0` on existing pages. New page
   instances inherit this manifest default; existing instances may
   retain `1.0.16.0` until manually updated.
3. Inspect:

   ```js
   JSON.stringify(window.__hbIntel_foleonRuntimeBindingProof, null, 2)
   ```

   Expected after property update:
   - `packageVersion: "1.0.17.0"`
   - `canInitialize: true`
   - `issueCodes: []`
   - `governance.packageVersionMatchesExpected: true`
4. Confirm proof remains redacted: no raw list GUIDs, origins, reader
   paths, preview fixture data, or sample titles.
5. With configured lists but no public/renderable records, confirm
   Highlights shows the labeled preview layout.
6. With zero registry records, confirm Content Hub shows the archive
   preview layout.
7. Type in Hub search while the registry is empty and confirm no normal
   live Search telemetry row is written.
8. Add or sync one published, visible, public-ready registry record and
   confirm Content Hub preview disappears.
9. Add or activate valid homepage placements as required by Highlights
   and confirm Highlights preview disappears when renderable records
   exist.
10. Confirm live card impressions/clicks occur only for real records.
11. Confirm Reader gates, iframe/origin policy, and
    `?foleon-diagnostics=1` behavior remain unchanged and do not expose
    preview fixture data.

## 13. Release sign-off

Copy this block into the release ticket or PR description. Every row
must be checked or the exception named.

```
Foleon phase-01 release sign-off
- Repo truth           : [ ]
- Package truth        : [ ]
- Runtime truth        : [ ]
- List truth           : [ ]
- Tenant config truth  : [ ]
- Telemetry truth      : [ ]
- Secrets posture      : [ ]
- Security posture     : [ ]
- Accessibility        : [ ]
- Launcher registration: [deferred — ADR-0125]
- Verification commands: [ ]

Released version: X.Y.Z.0
Released commit : <sha>
Released at     : <UTC timestamp>
Signed-off-by   : <name>
Exceptions      : <none | ticket URLs>
```
