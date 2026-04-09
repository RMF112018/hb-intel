# People & Culture Split Initiation — Structure Decision Note

**Phase**: Phase-14 Prompt-01 — Structural Split and Registration
**Date**: 2026-04-09
**Preceding note**:
`docs/architecture/reviews/people-culture-split-initiation-repo-truth.md`
(Prompt-00 repo-truth lock)
**Intent**: Document the exact structural seams created by Prompt-01 so
downstream prompts, implementation waves, and reviewers have a single
source of truth for GUIDs, aliases, titles, and compatibility posture.

---

## 1. Seams inventory after Prompt-01

Three registered webparts now exist in the People & Culture / HB Kudos
surface family:

| Purpose | Folder | Component | Manifest file | Manifest id | Alias | Title | Version |
| ------- | ------ | --------- | ------------- | ----------- | ----- | ----- | ------- |
| Legacy compatibility (merged) | `apps/hb-webparts/src/webparts/peopleCulture/` | `PeopleCultureMerged.tsx` | `PeopleCultureWebPart.manifest.json` | `27ac10f4-4054-4dd2-bd53-3b4ef4379ab4` | `PeopleCultureWebPart` | `People and Culture` | `0.0.3.0` (unchanged) |
| New public People & Culture seam | `apps/hb-webparts/src/webparts/peopleCulturePublic/` | `PeopleCulturePublic.tsx` | `PeopleCulturePublicWebPart.manifest.json` | `e39d9662-34c4-43e6-9425-5770f62da626` | `PeopleCulturePublicWebPart` | `People and Culture` | `0.0.1.0` |
| New HB Kudos public seam | `apps/hb-webparts/src/webparts/hbKudos/` | `HbKudos.tsx` | `HbKudosWebPart.manifest.json` | `f14e59a3-4d6b-43b2-952e-ba02dea11dad` | `HbKudosWebPart` | `HB Kudos` | `0.0.1.0` |

All three are `componentType: "WebPart"`, `manifestVersion: 2`,
`supportedHosts: ["SharePointWebPart"]`, `hiddenFromToolbox: true`
(matching the existing policy from `PeopleCultureWebPart.manifest.json`).

Total webpart count in `hb-webparts.sppkg` after this prompt: **13**
(previously 11; the two new seams are additive).

## 2. Placeholder companion seams (no manifest, no runtime)

Two folders exist to reserve naming claims for a future companion /
admin wave. Neither is a webpart; neither is registered in `mount.tsx`;
neither has a manifest. Each contains only a `README.md`:

- `apps/hb-webparts/src/webparts/peopleCultureCompanion/README.md`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/README.md`

These folders are intentionally invisible to the
`tools/build-spfx-package.ts` manifest walker because the walker only
picks up `*.manifest.json` files, and these folders contain no such
file. They will never affect packaging until a later prompt adds a
manifest inside.

## 3. mount.tsx registration changes

`apps/hb-webparts/src/mount.tsx` now imports and routes all three
webparts. The relevant additions vs. HEAD at Prompt-00:

```
+ import { PeopleCulturePublic } from './webparts/peopleCulturePublic/PeopleCulturePublic.js';
+ import { HbKudos } from './webparts/hbKudos/HbKudos.js';

  // Legacy merged People & Culture seam — preserved for backward compatibility
  // with already-placed SharePoint page instances. Phase-14 Prompt-01 split
  // into PeopleCulturePublic + HbKudos below; legacy stays live until rollout.
  '27ac10f4-4054-4dd2-bd53-3b4ef4379ab4': ({ config, identity }) => createElement(PeopleCultureMerged, { config, identity }),
+ // Phase-14 Prompt-01 structural scaffold: new People & Culture public seam.
+ 'e39d9662-34c4-43e6-9425-5770f62da626': ({ config, identity, assetBaseUrl }) => createElement(PeopleCulturePublic, { config, identity, assetBaseUrl }),
+ // Phase-14 Prompt-01 structural scaffold: new HB Kudos public seam.
+ 'f14e59a3-4d6b-43b2-952e-ba02dea11dad': ({ config, identity, assetBaseUrl }) => createElement(HbKudos, { config, identity, assetBaseUrl }),
```

The legacy `27ac10f4…` entry is explicitly left in place. It is now
preceded by an inline comment identifying it as the legacy compatibility
seam.

## 4. Barrel / export structure

New barrels created:

- `apps/hb-webparts/src/webparts/peopleCulturePublic/index.ts`
  → exports `PeopleCulturePublic`, `PeopleCulturePublicProps`.
- `apps/hb-webparts/src/webparts/hbKudos/index.ts`
  → exports `HbKudos`, `HbKudosProps`.

No cross-seam re-exports. The new seams do not import anything from the
legacy `peopleCulture/` folder or from the unregistered `kudosPage/`
folder — that avoids mistaking support components for authoritative
wiring. Kudos support components (`KudosPage.tsx`,
`KudosModerationWorkspace.tsx`) remain available as a component library
under `apps/hb-webparts/src/webparts/kudosPage/` for the future real
runtime to consume, but they are not currently referenced from the new
`HbKudos` seam.

## 5. Compatibility treatment for the current merged webpart

Deliberate posture on `27ac10f4-4054-4dd2-bd53-3b4ef4379ab4`:

- **Manifest** — unchanged. Still at `version 0.0.3.0`, alias
  `PeopleCultureWebPart`, title `People and Culture`, hidden-from-toolbox.
- **Source component** — unchanged, but `PeopleCultureMerged.tsx` now
  has a clear header block identifying it as the LEGACY COMPATIBILITY
  runtime, naming the two replacement seams, and warning not to delete
  or retarget the GUID.
- **mount.tsx dispatch** — unchanged routing, but prefaced by an inline
  comment declaring the legacy status.
- **package-solution.json** — the GUID stays in the feature
  `componentIds` list. Because the list is auto-generated by
  `tools/build-spfx-package.ts` from the source-manifest walker
  (lines 709–710 + 935), it will continue to include the legacy GUID
  for as long as the source manifest exists, with no manual action
  required.
- **SharePoint page placements** — already-placed webpart instances
  that reference the merged GUID will continue to render identically
  after this commit. No page migration is required as part of
  Prompt-01. Migration is deferred to the future rollout wave.

Why preserve rather than rename/move: any change to the existing GUID
or its dispatch target breaks every deployed page that still hosts the
merged webpart. That blast radius is out of proportion to the structural
split goal of Prompt-01. The prompt itself explicitly instructs
preserving the legacy seam ("Do not silently delete the current merged
manifest/runtime").

## 6. Package-solution version bump

`apps/hb-webparts/config/package-solution.json`:

- `solution.version`: `1.0.0.113` → `1.0.0.114`
- `features[0].version`: `1.0.0.113` → `1.0.0.114`

The `components[*].id` list in the feature definition is not manually
curated here — `tools/build-spfx-package.ts` auto-populates
`tools/spfx-shell/config/package-solution.json`'s `componentIds` array
from the source-manifest walker output at package time (see
`tools/build-spfx-package.ts` lines 709 and 935). That means the two new
manifests (`HbKudosWebPart.manifest.json`,
`PeopleCulturePublicWebPart.manifest.json`) will be picked up
automatically when `hb-webparts.sppkg` is rebuilt, with no manual
config-file edits required beyond the version bump.

## 7. Packaging discovery path verified for the new seams

Confirmed that the new manifests satisfy every condition enforced by
`tools/build-spfx-package.ts`:

1. `componentType === 'WebPart'` ✓ (both new manifests)
2. Manifest id is NOT in `HB_WEBPARTS_EXCLUDED_MANIFEST_IDS`
   (the single excluded id is
   `535f5a17-fc49-40ea-ac16-5d68895884f7`, legacy `HbWebpartsWebPart`) ✓
3. `HB_WEBPARTS_PROOF_CASE_IDS` is empty (line 700 filter is a no-op in
   the current build) ✓
4. Manifest file suffix is `.manifest.json` and lives under
   `apps/hb-webparts/src/webparts/**` ✓

## 8. What remains deferred after Prompt-01

Explicit deferrals for later Phase-14 prompts:

- **No real People & Culture public runtime**. `PeopleCulturePublic.tsx`
  is a scaffold panel. The real announcements / celebrations / culture
  programming implementation is deferred. A precondition for that work
  is extracting the live schemas for `People Culture Announcements`
  (`2cd191fc-a7ea-49f2-af05-c395c2326e57`) and
  `People Culture Celebrations` (`b87bf664-0531-418b-902c-726e5fb87083`)
  — see `people-culture-kudos-sharepoint-schema-report.md` §11.2. The
  preliminary workflow test harness at
  `scripts/testing/people-kudos-workflow/runPeopleKudosWorkflowTest.ts`
  already ships a `--only-discover` subcommand that captures those
  schemas when run live.
- **No real HB Kudos public runtime**. `HbKudos.tsx` is a scaffold
  panel. The real recognition feed / spotlight / archive / celebrate /
  submission entry will consume the live `People Culture Kudos` schema
  proven in `people-culture-kudos-list-schema.normalized.json`.
- **No companion / admin webparts**. The two companion folders
  (`peopleCultureCompanion`, `hbKudosCompanion`) contain only READMEs
  and are not registered anywhere.
- **No mount-level conditional audience routing**. The current
  `WEBPART_RENDERERS` map is still a flat GUID → component dispatch.
  Any future audience / role-aware routing stays out of Prompt-01.
- **No schema mutations**. No SharePoint list changes. No new list
  creation. No term-store edits.
- **No UI polish**. The scaffold panels render inline-styled boxes
  clearly marked as Phase-14 structural scaffolds. They are not a
  visual starting point for the final surfaces.
- **No migration of existing page placements**. The legacy merged
  webpart continues to satisfy every already-placed instance.
- **No SPFx domain split**. `hb-webparts` remains the single domain;
  `hb-webparts.sppkg` remains the single package target.

## 9. Verification summary (from Prompt-01 execution)

- `pnpm --filter @hbc/spfx-hb-webparts check-types` — clean.
- `pnpm --filter @hbc/spfx-hb-webparts lint` — clean.
- `pnpm --filter @hbc/spfx-hb-webparts build` — clean
  (`tsc --noEmit && vite build`).
- `npx tsx tools/build-spfx-package.ts --domain hb-webparts` — clean;
  `hb-webparts.sppkg` rebuilt with 13 webparts including the two new
  GUIDs; shim proof written to `dist/sppkg/hb-webparts-shim-proof.json`.
- `tools/spfx-shell/config/package-solution.json.features[0].componentIds`
  auto-populated with all 13 GUIDs (verified post-build).
- `tools/spfx-shell/release/manifests/` gained two new files keyed on
  the new GUIDs.
- Preliminary workflow harness dry-run remains clean after the
  structural additions.

## 10. Links

- Prompt-00 repo-truth note:
  `docs/architecture/reviews/people-culture-split-initiation-repo-truth.md`
- Phase-14 plan summary:
  `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/Plan-Summary.md`
- Prompt-01 spec:
  `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/Prompt-01-Structural-Split-and-Registration.md`
- Live Kudos schema authority:
  `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/people-culture-kudos-sharepoint-schema-report.md`
- Preliminary workflow harness:
  `scripts/testing/people-kudos-workflow/runPeopleKudosWorkflowTest.ts`
