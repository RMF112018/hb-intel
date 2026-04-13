# Phase-01 Hosted Verification Runbook

**Registered:** 2026-04-13
**Source of authority:** `docs/architecture/plans/MASTER/spfx/publisher/phase-01/04-Hosted-Verification-Checklist.md`
**Execution wave:** Wave 9 (post-implementation tenant validation)
**Target tenant:** `https://hedrickbrotherscom.sharepoint.com/sites/ProjectSpotlight`

This runbook is the pre-registered execution form for the Phase-01 hosted verification. It mirrors the authority checklist and adds the fields required to record observed evidence (date run, runner, artifact references, deviations). Wave 9 must fill this form in-place (or a dated copy of it) and link it from `implementation-tracker.md` before Phase-01 is declared complete.

Nothing below should be ticked until a real hosted run is performed. Un-run checks stay `[ ]`.

---

## Run header

| Field | Value |
|-------|-------|
| Run date | _TBD_ |
| Runner | _TBD_ |
| Source commit | _TBD_ |
| `.sppkg` version | _TBD_ |
| Tenant | `https://hedrickbrotherscom.sharepoint.com/sites/ProjectSpotlight` |
| Test post Article ID | _TBD_ |
| Evidence bundle | _TBD (screenshots + list row exports + request/response log)_ |

---

## A. Structural verification
- [ ] Publisher app loads in the intended SPFx host surface.
- [ ] No Company Pulse or dual-destination language remains in UI or code paths.
- [ ] Architecture docs referenced by the implementation are still current.

**Notes:** _…_

## B. List verification
- [ ] `HB Articles` (post master) exists and is reachable.
- [ ] `HB Article Team Members` (child) exists and is reachable.
- [ ] `HB Article Media` (child) exists and is reachable.
- [ ] `HB Article Template Registry` exists and is reachable.
- [ ] `HB Article Destination Pages` (binding) exists and is reachable.
- [ ] `HB Article Workflow History` and `HB Article Publishing Errors` exist if implemented.

**Observed list GUIDs:** _…_

## C. Authoring verification
- [ ] New post can be created as draft.
- [ ] Post family, spotlight type, project stage, and subject can be set.
- [ ] Banner image can be attached or referenced as designed.
- [ ] Subheading and body can be authored.
- [ ] Team members can be added, ordered, and saved.
- [ ] Gallery items can be added, ordered, and saved.
- [ ] Validation errors are field-specific and actionable.

**Notes:** _…_

## D. Preview verification
- [ ] Preview resolves the correct template and shell.
- [ ] Preview shows expected banner/title behavior.
- [ ] Preview reflects Team Viewer and gallery block state.
- [ ] Preview output matches publish output behavior (same resolver + mapper pipeline).

**Notes:** _…_

## E. Publish verification
- [ ] Publish creates a new page on `https://hedrickbrotherscom.sharepoint.com/sites/ProjectSpotlight`.
- [ ] Created page originates from the approved XML shell pattern.
- [ ] Banner / title renders correctly.
- [ ] Subheading renders in the expected OOB Text block.
- [ ] Body renders in the expected OOB Text block.
- [ ] Team Viewer receives the correct article/post-bound data.
- [ ] Image Gallery receives the correct ordered media items.
- [ ] Page URL / slug behavior matches the design.
- [ ] `HB Article Destination Pages` row written with `BindingId`, `ArticleId`, `TargetSiteUrl`, `PageId`, `PageUrl`, `PageName`, `PageTemplateKey`, `PageShellVersion`, `RenderVersion`, `PublishStatus`.

**Observed page URL:** _…_
**Observed binding row excerpt:** _…_

## F. Republish verification
- [ ] Editing the same post and republishing updates the existing page (same `PageId` / `PageUrl`), does not create a duplicate.
- [ ] `LastSyncDateUtc`, `RenderVersion`, `PageShellVersion` update correctly.
- [ ] Shell compatibility is not silently broken.

**Notes:** _…_

## G. Regeneration verification
- [ ] Regeneration policy is explicit (documented trigger + effect).
- [ ] Shell-version drift is surfaced before destructive changes.
- [ ] Regeneration preserves traceability (binding history + workflow history).

**Notes:** _…_

## H. Archive / withdraw verification
- [ ] Archive behavior follows the chosen policy.
- [ ] Rollup suppression behaves as expected.
- [ ] Binding and workflow history traceability remain intact.

**Notes:** _…_

## I. Final build verification
- [ ] Clean build completes successfully.
- [ ] Final package proves latest local source was used (bundle hash / version match commit).
- [ ] No stale artifacts remain in the package path.

**Build output excerpt:** _…_

---

## Cross-reference to five-fact closure gate

The hosted run must simultaneously confirm the five facts from `evidence/definition-of-done-adoption.md` §3:

1. Destination URL under `/sites/ProjectSpotlight/` → verified in §E.
2. Shell block order = OOB Page Title → OOB Text (subhead) → OOB Text (body) → `teamViewer` → OOB Image Gallery → verified in §E.
3. Mapped content originates from list-backed structured data → verified in §C + §E.
4. `HB Article Destination Pages` row written correctly → verified in §E.
5. Republish preserves page identity and increments version lineage → verified in §F.

If any fact is unverified, Phase-01 is not closed regardless of §A-I ticks.

## Deviation log

Record any observed deviation from the authority checklist or architecture docs here with a rationale and a follow-up ticket link:

- _none yet_
