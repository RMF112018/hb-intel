# People & Culture Split Initiation — Repo-Truth Note

**Phase**: Phase-14 Prompt-00 — Repo Truth and Target-State Lock
**Date**: 2026-04-09
**Authority**: Local HEAD on `main` at
`/Users/bobbyfetting/hb-intel` (branch `main`, tip
`1f711e88 feat(scripts/testing,docs/phase-14): add preliminary
People & Culture + HB Kudos workflow test harness`).
**Intent**: Audit local HEAD and lock the authoritative repo state
required before any structural People & Culture / HB Kudos split work
begins. No code changes in this step beyond this note.

---

## 1. Current authoritative People & Culture runtime

| Field | Value |
| ----- | ----- |
| Runtime entry React component | `apps/hb-webparts/src/webparts/peopleCulture/PeopleCultureMerged.tsx` |
| Public barrel | `apps/hb-webparts/src/webparts/peopleCulture/index.ts` (re-exports `PeopleCultureMerged` + `PeopleCultureMergedProps` only) |
| Mount import | `apps/hb-webparts/src/mount.tsx:12` — `import { PeopleCultureMerged } from './webparts/peopleCulture/PeopleCultureMerged.js';` |
| Mount dispatch | `apps/hb-webparts/src/mount.tsx:34` — `'27ac10f4-4054-4dd2-bd53-3b4ef4379ab4': ({ config, identity }) => createElement(PeopleCultureMerged, { config, identity }),` inside the `WEBPART_RENDERERS` GUID→renderer map |
| Routing model | single merged GUID → single merged component |

`PeopleCultureMerged.tsx` is a thin consumer wrapping
`HbcPeopleCultureSurface` from `@hbc/ui-kit/homepage`. It owns
SharePoint list data fetching (`usePeopleCultureData`), config
normalization, the Kudos Composer submission flow, and nothing more —
durable presentation lives in the shared `@hbc/ui-kit` surface family.
The Kudos Composer is embedded inside `PeopleCultureMerged`, **not** a
separate webpart.

There is no alternative People & Culture runtime entry at HEAD. There
is no `PeopleCulturePublic` component, no split shell, no intermediate
compatibility seam.

---

## 2. People & Culture manifest inventory

Only one manifest exists:

`apps/hb-webparts/src/webparts/peopleCulture/PeopleCultureWebPart.manifest.json`

| Field | Value |
| ----- | ----- |
| `id` | `27ac10f4-4054-4dd2-bd53-3b4ef4379ab4` |
| `alias` | `PeopleCultureWebPart` |
| `componentType` | `WebPart` |
| `version` | `0.0.3.0` |
| `preconfiguredEntries[0].title.default` | `People and Culture` |
| description (verbatim) | Premium celebratory People & Culture surface with confetti-dot field, ribbon-tagged kudos spotlight, recent recognition, announcements, and kudos composer |

There is no second People & Culture manifest, no `PeopleCulturePublic`
manifest, and no companion/admin manifest.

---

## 3. HB Kudos webpart registration status

**HB Kudos does not currently exist as a registered SPFx webpart.**

What exists instead:

`apps/hb-webparts/src/webparts/kudosPage/`
- `KudosPage.tsx` — employee-facing archive component (pure React)
- `KudosModerationWorkspace.tsx` — HR/admin moderation workspace (pure React)
- `index.ts` — barrel exporting `KudosPage`, `KudosPageProps`,
  `KudosModerationWorkspace`, `KudosModerationWorkspaceProps`
- **no `.manifest.json`** — the directory is a component library folder, not a webpart folder

Consequences of the missing manifest:

- The recursive manifest walk in `tools/build-spfx-package.ts` (lines
  669–690) finds no Kudos manifest, so nothing is packaged.
- `apps/hb-webparts/config/package-solution.json` does not list a
  Kudos GUID in `feature.componentIds` — see §5.
- `apps/hb-webparts/src/mount.tsx` does not import either `KudosPage`
  or `KudosModerationWorkspace`, and the `WEBPART_RENDERERS` map has
  no Kudos GUID key.
- `tools/spfx-shell/release/manifests/` contains no Kudos manifest
  file — see §7. Kudos has never been packaged into the shell.

No sibling directory under `apps/hb-webparts/src/webparts/` contains
"kudos" or "Kudos" besides `kudosPage/`. There is no second or
partially-started Kudos directory.

---

## 4. Companion / admin surface registration status

No directories under `apps/hb-webparts/src/webparts/` match
"Companion", "Admin", "Moderation", or "HR" naming patterns. The only
moderation surface in the repo is `KudosModerationWorkspace.tsx`,
which is co-located with `KudosPage.tsx` inside the unregistered
`kudosPage/` folder. No companion webpart manifest exists. No
companion GUID is present in `package-solution.json` or the shell
release manifests.

---

## 5. `mount.tsx` routing model

`apps/hb-webparts/src/mount.tsx` uses a hardcoded
`Record<string, (props: …) => ReactNode>` map keyed by manifest GUID.
Relevant lines:

- `12` — `import { PeopleCultureMerged } from './webparts/peopleCulture/PeopleCultureMerged.js';`
- `27–44` — `const WEBPART_RENDERERS: Record<string, …> = { … }`
- `34` — `'27ac10f4-4054-4dd2-bd53-3b4ef4379ab4': ({ config, identity }) => createElement(PeopleCultureMerged, { config, identity }),`
- `53–69` — route resolution (`const webPartId = typeof config?.webPartId === 'string' ? config.webPartId : ''` → look up in map)

The routing is **merged**, not split: one GUID, one component. There
is no public-vs-admin routing, no Kudos key in the map, and no
conditional mount based on audience/role.

---

## 6. SPFx packaging discovery path

`tools/build-spfx-package.ts` handles `hb-webparts` with
`packagingModel: 'multi'` (line 68). The webpart-manifest discovery is
a recursive directory walk under the webparts source directory:

```
const walk = (dir: string): string[] => {
  const results: string[] = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) results.push(...walk(p));
    else if (e.name.endsWith('.manifest.json')) results.push(p);
  }
  return results;
};
const manifests = walk(manifestGlob).sort();
```

(`tools/build-spfx-package.ts` lines 669–690)

Manifests discovered by the walk are included in the generated
`hb-webparts.sppkg` unless their GUID is listed in
`HB_WEBPARTS_EXCLUDED_MANIFEST_IDS` (lines 72–74). The single current
exclusion is `535f5a17-fc49-40ea-ac16-5d68895884f7` (legacy
`HbWebpartsWebPart`).

**Implication for the split work**: adding a new
`KudosPageWebPart.manifest.json` (or `HbKudosWebPart.manifest.json`)
under `apps/hb-webparts/src/webparts/kudosPage/` will be picked up
automatically by the walker. No changes to
`build-spfx-package.ts` are required to add new webparts. The
`componentIds` array in `package-solution.json` must still be
extended manually because it is the SPFx feature declaration, not a
discovery output.

`apps/hb-webparts/config/package-solution.json`:

| Field | Value |
| ----- | ----- |
| `solution.id` | `39b8f2ea-59bd-45b7-b4ec-b590b316833b` |
| `solution.version` | `1.0.0.113` |
| `feature.id` | `1f447e99-a2c7-43e5-83d8-d2ed78ed1a96` |
| `feature.version` | `1.0.0.113` |
| `feature.componentIds` (11 GUIDs, paraphrased) | `0b53f651…` CompanyPulse • `11d72b36…` SmartSearchWayfinding • `27ac10f4…` **People & Culture** • `28acd6a7…` HbSignatureHero • `39762a4d…` HbHeroBanner • `46bfde64…` PersonalizedWelcomeHeader • `8370ab0c…` ProjectPortfolioSpotlight • `89ca5ff3…` SafetyFieldExcellence • `b3f07190…` PriorityActionsRail • `cb7060f5…` ToolLauncherWorkHub • `e8fa8a84…` LeadershipMessage |

No Kudos GUID is in `componentIds`. Any new Kudos manifest **must** be
added to this list or it will not appear in the packaged
`hb-webparts.sppkg`.

---

## 7. Partial split artifacts at HEAD

`apps/hb-webparts/**` contains **no** references to any of the
following strings:

- `PeopleCulturePublic`
- `HbKudos`
- `HbcKudosSurface`
- `KudosWebPart`

No orphan manifest GUIDs. No half-wired mount entry. No
`PeopleCultureLegacy` or `PeopleCultureAdmin` directories. No
`kudosPage/*.manifest.json`. No sibling Kudos directory under
`apps/hb-webparts/src/webparts/`. No shell manifest file matching
`*kudos*` under `tools/spfx-shell/`.

**Conclusion**: The structural split has not been started in code.
The only "split-adjacent" artifact is the unregistered `kudosPage/`
folder, which pre-dates this phase and is used only as a component
library.

---

## 8. Compatibility constraints for the current deployed People & Culture webpart GUID

The GUID `27ac10f4-4054-4dd2-bd53-3b4ef4379ab4` is threaded through
four authoritative locations at HEAD:

1. `apps/hb-webparts/src/webparts/peopleCulture/PeopleCultureWebPart.manifest.json` (source manifest)
2. `apps/hb-webparts/src/mount.tsx` (mount dispatch key)
3. `apps/hb-webparts/config/package-solution.json` (feature
   `componentIds` declaration)
4. `tools/spfx-shell/release/manifests/27ac10f4-fd92-4f7f-a9da-f7797017f5eb.manifest.json` — wait: the directory listing shows the release manifest as `27ac10f4-4054-4dd2-bd53-3b4ef4379ab4.manifest.json` (compiled shell output consumed by SharePoint)

All four locations agree. There are no orphan or stale references and
no conflicting GUIDs.

Compatibility constraint: **the GUID
`27ac10f4-4054-4dd2-bd53-3b4ef4379ab4` must remain allocated to a
People & Culture runtime entry that is backward-compatible with the
existing deployed webpart**. Any page in SharePoint that already
references this GUID must continue to render without a broken
placeholder. That means:

- Changing the GUID outright is not allowed during the split phase.
- Retargeting the GUID to a **new** component that preserves the
  current prop contract (`config`, `identity`, `assetBaseUrl`) is
  allowed.
- Removing the GUID from `package-solution.json`'s `componentIds`
  array is not allowed during the split phase.
- Deleting the source manifest is not allowed during the split phase.

Any new split GUID (e.g. for HB Kudos, or for a future distinct
`PeopleCulturePublic`) must be a **fresh** GUID added alongside —
never a reuse of the People & Culture GUID.

---

## 9. Target-state lock (Phase-14 Prompt-00)

Unless a later prompt in this plan proves a conflict, the following
are locked as the structural target for Phase-14:

1. **Domain / packaging target** — remain in
   `apps/hb-webparts/` with `hb-webparts.sppkg` as the sole SPFx
   output. No new SPFx domain. No new workspace package. Local HEAD
   offers no evidence that the current multi-webpart packaging model
   is unviable.
2. **Legacy seam preservation** — the current merged People & Culture
   runtime (GUID `27ac10f4-4054-4dd2-bd53-3b4ef4379ab4` →
   `PeopleCultureMerged.tsx`) is preserved as a **legacy
   compatibility seam** until the future split rollout is complete.
   It may be relabeled in comments / docs as legacy, but the
   manifest, GUID, mount dispatch key, and `componentIds` entry stay
   live.
3. **New HB Kudos public webpart seam** — a new first-class public
   webpart is introduced with:
   - a new fresh GUID (not the People & Culture GUID),
   - its own `HbKudosWebPart.manifest.json` under
     `apps/hb-webparts/src/webparts/kudosPage/` (or a sibling folder
     if a clearer name is preferred),
   - a `mount.tsx` import + `WEBPART_RENDERERS` entry that routes to
     a `KudosPage`-derived runtime component,
   - a new `componentIds` entry in `package-solution.json`,
   - barrel re-exports adjusted to expose the public runtime entry
     only, keeping `KudosModerationWorkspace` as an internal
     component until a moderation webpart is justified.
4. **New People & Culture public webpart seam** — a new first-class
   public webpart for the future People & Culture *public* surface
   (announcements, celebrations, broader culture programming). This
   is a **new** GUID; the legacy merged webpart is not retargeted.
   The new public manifest, component, mount entry, and
   `componentIds` entry are all added alongside the legacy entry so
   both live concurrently during the split window.
5. **Companion / admin surfaces** — deferred. No companion/admin
   webpart registration in this phase unless a minimal placeholder
   seam is demonstrably required to unblock a later wave. At that
   point the minimum acceptable placeholder is: a manifest with its
   own GUID, a stub runtime component, a mount entry that renders
   an "intentionally deferred" panel, and a `componentIds` entry.
6. **Version bumps** — the split introduces new webparts and new
   componentIds, so at rollout time:
   - legacy People & Culture manifest version remains `0.0.3.0` until
     a behavior change lands;
   - each new manifest starts at `0.0.1.0`;
   - `package-solution.json` solution + feature version increments
     to the next `1.0.0.{n+1}` at package-rebuild time.

---

## 10. Files inspected

Listed here verbatim so future prompts can audit coverage of this
note without re-walking the repo:

- `apps/hb-webparts/src/webparts/peopleCulture/PeopleCultureMerged.tsx`
- `apps/hb-webparts/src/webparts/peopleCulture/index.ts`
- `apps/hb-webparts/src/webparts/peopleCulture/PeopleCultureWebPart.manifest.json`
- `apps/hb-webparts/src/webparts/kudosPage/KudosPage.tsx`
- `apps/hb-webparts/src/webparts/kudosPage/KudosModerationWorkspace.tsx`
- `apps/hb-webparts/src/webparts/kudosPage/index.ts`
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/config/package-solution.json`
- `tools/build-spfx-package.ts`
- `tools/spfx-shell/release/manifests/` (directory listing — 11 files)
- `tools/spfx-shell/config/package-solution.json`
- `git log --oneline -15` for the three paths above
- `rg` searches for `PeopleCulturePublic`, `HbKudos`,
  `HbcKudosSurface`, `KudosWebPart`, and
  `27ac10f4-4054-4dd2-bd53-3b4ef4379ab4` across `apps/hb-webparts/`
  and `tools/spfx-shell/`

---

## 11. Unresolved questions

1. **Kudos public webpart naming**. Phase-14 plan materials use
   both "HB Kudos" and "Kudos Page" as labels. The preferred
   `alias` / folder name (`kudosPage` vs `hbKudos` vs `kudosPublic`)
   should be finalized in Prompt-01 before a manifest is added, to
   avoid a rename cycle after wiring.
2. **People & Culture public webpart scope**. Announcements,
   celebrations, and culture programs are listed as the future public
   surface scope, but the Phase-14 schema extraction
   (`people-culture-kudos-sharepoint-schema-report.md`) proved
   schemas for `People Culture Kudos` and `Kudos Audit Events` only.
   The sibling `People Culture Announcements`
   (`2cd191fc-a7ea-49f2-af05-c395c2326e57`) and
   `People Culture Celebrations`
   (`b87bf664-0531-418b-902c-726e5fb87083`) list schemas remain
   unproven. The structural split can proceed without them (manifest
   + mount seam only), but adapter-level implementation for the
   public surface must wait on a follow-up schema extraction.
3. **Companion placeholder requirement**. Phase-14 materials leave
   the companion/admin surfaces deferred, but Prompt-04 in the same
   plan package references HR / approval companion webparts. Prompt-01
   should confirm whether a placeholder companion manifest is needed
   in this wave or whether that can wait.
4. **Version-bump cadence**. `package-solution.json` is currently
   at `1.0.0.113`. The existing convention (confirmed from recent
   W01r-P23…P27 commits) is to bump the 4-part solution version on
   every sppkg regeneration. Prompt-02 should confirm the exact bump
   convention for this split phase so the split adds webparts
   cleanly without inflating the patch counter per-commit.

---

## 12. Recommended immediate next step

Proceed to Phase-14 Prompt-01 (`Structural Split and Registration`)
with the lock in §9. The concrete first move is:

- Add `HbKudosWebPart.manifest.json` under the Kudos webpart folder
  with a fresh GUID,
- Introduce a thin `KudosPublic` or `KudosPageRuntime` runtime
  component (wrapping the existing `KudosPage.tsx` component) that
  matches the mount prop contract,
- Import + route the new GUID in `apps/hb-webparts/src/mount.tsx`,
- Add the GUID to `apps/hb-webparts/config/package-solution.json`'s
  `feature.componentIds`,
- Repeat the four-step pattern for the new People & Culture public
  webpart seam with its own fresh GUID,
- Leave the legacy `PeopleCultureMerged` seam untouched,
- Rebuild `hb-webparts.sppkg` and verify all three webparts appear
  in the release manifests directory.

That sequence is the minimal structural split Prompt-00 commits to.
Everything else is deferred to later prompts in this plan package.
