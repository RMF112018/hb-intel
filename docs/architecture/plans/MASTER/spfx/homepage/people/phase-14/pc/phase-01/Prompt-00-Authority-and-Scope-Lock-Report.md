# Prompt 00 — Authority and Scope Lock Report

Phase-14 · People & Culture + HR Operating Companion implementation package.

This report is the deliverable for
[`Prompt-00-Authority-and-Scope-Lock.md`](./Prompt-00-Authority-and-Scope-Lock.md).
It reconciles live repo truth against the locked product decisions in
[`Decision-Lock-Appendix.md`](./Decision-Lock-Appendix.md) and freezes the
implementation target state for Prompts 01–06 of the pc/ package.

No runtime code was modified to produce this report. Prompt-00 is an
audit/scope-lock artifact only.

---

## 1. Architecture Conclusion

The locked end-state for the People & Culture product area is a **three-surface split**, and live repo truth already supports that target state structurally (from prior phase-14 Prompts 00–02):

1. **People & Culture public webpart** — `peopleCulturePublic/`
   Focus: announcements, celebrations / milestones, broader culture programming, warm people-facing communication, profile-photo-first and campaign-media-aware presentation. Homepage feature / supporting hierarchy aware.

2. **HB Kudos public webpart** — `hbKudos/`
   Focus: recognition only. Separate product boundary. Out of scope for this pc/ package except that its boundary must remain preserved.

3. **People & Culture HR operating companion webpart** — `peopleCultureCompanion/`
   Focus: Overview · Announcements · Celebrations / Milestones · Culture Programs / Events · Approvals · Homepage · shared quick-edit drawer · full editor · optional calendar view · lifecycle governance · audience targeting · milestone intake review · multi-context preview · limited non-HR intake. Operating workspace, not a ticketing system.

The existing **legacy merged webpart** (`peopleCulture/`, manifest
`27ac10f4-4054-4dd2-bd53-3b4ef4379ab4`, currently backed by
`PeopleCultureMerged.tsx`) is explicitly **transitional** and is preserved
**only** as a backward-compatibility seam for already-provisioned pages. It is
not the end-state product, it will not absorb companion responsibilities, and
it will not be re-merged with HB Kudos.

The merged surface stays under its original GUID so already-added instances
continue to render while the public split matures. It must not gain new
functional responsibilities.

This conclusion is consistent with the Plan-Summary and Decision-Lock
Appendix; no re-merging or scope softening is authorized.

---

## 2. File Ownership Map

The following map names the authoritative file locations for the work in
Prompts 01–06. It distinguishes files that must be **created**, **updated**,
**split** (new split-aware variant alongside existing merged-compatible
variant), or **explicitly left alone**. All paths are relative to the repo
root.

### 2.1 People & Culture public webpart — `apps/hb-webparts/src/webparts/peopleCulturePublic/`

Current state: structural scaffold. Component is an orange-bordered
placeholder with deferred runtime. Manifest ID `e39d9662-34c4-43e6-9425-5770f62da626`, version `0.0.1.0`, hidden from toolbox.

| Action | File | Notes |
|---|---|---|
| update | `PeopleCulturePublic.tsx` | Replace scaffold with real announcements / celebrations / culture-programming rendering. Consumes split-aware data hooks, not the merged hook. |
| update | `index.ts` | Re-export contract may widen to include companion-driven governance props. |
| update | `PeopleCulturePublicWebPart.manifest.json` | Version bump when runtime behavior changes; keep GUID, alias, group, hidden-from-toolbox. |
| create (later) | local presentation components under this folder | Only if not generalizable into `@hbc/ui-kit/homepage`. Feature-local composition is acceptable; reusable primitives must be promoted upstream. |

### 2.2 People & Culture HR operating companion webpart — `apps/hb-webparts/src/webparts/peopleCultureCompanion/`

Current state: **README-only placeholder**. No manifest, no entry point, no
mount.tsx registration, no component.

| Action | File | Notes |
|---|---|---|
| create | `PeopleCultureCompanionWebPart.manifest.json` | **Allocate a fresh GUID.** Do not reuse `27ac10f4-…` (legacy merged) or `e39d9662-…` (public split). Alias `PeopleCultureCompanionWebPart`, group `HB Intel`, hidden from toolbox, version `0.0.1.0` initially. |
| create | `PeopleCultureCompanion.tsx` | Companion shell: Overview · Announcements · Celebrations/Milestones · Culture Programs/Events · Approvals · Homepage tabs. Reuses companion patterns from `hbKudosCompanion/`-style conventions where healthy. |
| create | `index.ts` | Public export of companion component + props type. |
| create (as needed) | local companion feature files | Quick-edit drawer, full editor, calendar view, homepage governance surface. Feature-local composition OK; reusable primitives must go to `@hbc/ui-kit`. |
| update | `apps/hb-webparts/src/mount.tsx` | Register the new companion manifest GUID → companion component factory in `WEBPART_RENDERERS`. |
| update | `apps/hb-webparts/config/package-solution.json` | Version bump at packaging-relevant prompts (03 and 06) per SPFx four-part schema `{major}.{minor}.{patch}.{build}`. |
| keep | existing `README.md` | Update to reflect real runtime rather than placeholder status once code lands. |

### 2.3 Shared seams — `apps/hb-webparts/src/homepage/`

These files are the current data / contract / helper authority for the
merged webpart. They must evolve so that the **public split and companion
can consume split-aware shapes without re-merging**, while the legacy
`peopleCulture/` seam continues to function.

| Action | File | Notes |
|---|---|---|
| update (additive) | `webparts/communicationsContracts.ts` | Prompt-01 primary entry. Add: lifecycle state model (Draft · Needs Approval · Scheduled · Live · Expiring Soon · Expired · Archived · Suppressed), content-family model (Announcements · Celebrations/Milestones · Culture Programs/Events), audience model (company-wide + targeted dimensions), approval-trigger metadata, homepage-governance metadata (pinned, featured vs supporting), milestone-candidate shape, media-source model (profile-photo-first with HR override channels), preview model, and role model (Editor · Approver/Admin). Keep merged types present for backward compatibility. |
| update (additive) | `helpers/communicationsConfig.ts` | Extend normalization to produce split-aware outputs for the public and companion surfaces. Do not remove `normalizePeopleCultureMergedConfig`. |
| split | `data/usePeopleCultureData.ts` | Introduce split-aware hook(s) for the public PC surface and the companion. The merged hook may remain behind the legacy webpart, or may become a thin adapter. No behavior change until Prompt-02. |
| keep | `data/useKudosComposer.ts` | Kudos-owned. Not in scope for pc/ package. Must not be consumed from the PC public webpart. |
| keep | `data/peopleCultureSubmissionSource.ts` | Kudos submission helper. Boundary preserved. |
| update (additive) | `data/peopleCultureListSource.ts` | Extend SharePoint list fetch to cover companion-required fields (state, audience, media source, approval metadata, homepage placement, milestone-candidate provenance). Preserve existing merged output. |

Any new shared helper that is reused across PC public + companion should live
under `apps/hb-webparts/src/homepage/` in the matching subfolder (`data/`,
`helpers/`, `webparts/`). Companion-only or public-only helpers should live
inside the corresponding webpart folder.

### 2.4 `@hbc/ui-kit/homepage` surface extension points

The merged implementation already depends on
`HbcPeopleCultureSurface`, `HbcKudosComposerFlyout`, `HbcKudosComposerForm`,
`HbcKudosComposerPreview`, `HbcKudosComposerSuccess`, `HbcKudosComposerError`
from `@hbc/ui-kit/homepage`.

| Action | Target | Notes |
|---|---|---|
| extend (later) | `HbcPeopleCultureSurface` | Needs to support the split-aware public rendering (hierarchy-aware featured/supporting, media model, audience-filtered public surfacing). Change deferred until the Prompt-02 public runtime reimplementation makes the need concrete. |
| create (later) | companion UI primitives (lifecycle chips, approval queue rows, quick-edit drawer primitive, full-editor shell, calendar primitives, homepage governance list primitive) | Only promote to `@hbc/ui-kit` primitives where reuse is real. Otherwise keep feature-local inside `peopleCultureCompanion/`. `hb-ui-ux-conformance-reviewer` should review promotion decisions. |
| keep | Kudos composer primitives | Recognition-owned. Must not be pulled into PC public. |

No `@hbc/ui-kit` changes are required or authorized in Prompt-00. These are
flagged as future extension targets only.

### 2.5 Do-not-touch in this package

- `apps/hb-webparts/src/webparts/peopleCulture/PeopleCultureMerged.tsx` — legacy runtime. Leave intact beyond what is strictly required to keep it compiling against evolving shared contracts. Do not expand its responsibilities.
- `apps/hb-webparts/src/webparts/peopleCulture/PeopleCultureWebPart.manifest.json` — GUID `27ac10f4-4054-4dd2-bd53-3b4ef4379ab4` is preserved for backward compatibility. Do not reuse or replace the GUID.
- `apps/hb-webparts/src/webparts/hbKudos/*` and `apps/hb-webparts/src/webparts/hbKudosCompanion/*` — Kudos ownership. Out of scope. Preserve the boundary.
- Kudos composer / submission code paths — `useKudosComposer.ts`, `peopleCultureSubmissionSource.ts`, `@hbc/ui-kit/homepage` kudos primitives. Must not be consumed from the PC public or PC companion surfaces.

---

## 3. Repo-Truth Conflicts

**None detected.**

Live repo state at audit time (`main`):

| Surface | Path | Manifest GUID | Version | Status |
|---|---|---|---|---|
| Legacy merged PC | `apps/hb-webparts/src/webparts/peopleCulture/` | `27ac10f4-4054-4dd2-bd53-3b4ef4379ab4` | `0.0.3.0` | Transitional (backward compat) |
| Public PC split | `apps/hb-webparts/src/webparts/peopleCulturePublic/` | `e39d9662-34c4-43e6-9425-5770f62da626` | `0.0.1.0` | Scaffold |
| PC HR operating companion | `apps/hb-webparts/src/webparts/peopleCultureCompanion/` | (none yet) | — | README placeholder |
| Public HB Kudos | `apps/hb-webparts/src/webparts/hbKudos/` | `f14e59a3-4d6b-43b2-952e-ba02dea11dad` | `0.0.1.0` | Scaffold (out of scope for pc/) |
| HB Kudos companion | `apps/hb-webparts/src/webparts/hbKudosCompanion/` | (none yet) | — | README placeholder (out of scope for pc/) |

All three published GUIDs are wired in `apps/hb-webparts/src/mount.tsx`
`WEBPART_RENDERERS` and are discoverable by `tools/build-spfx-package.ts`.

The live shape of the repo matches every non-negotiable outcome in the
Plan-Summary and Decision-Lock Appendix:

- The split is hard — three distinct manifests, no merged end-state claimed.
- HB Kudos is separated at the webpart boundary, not just visually.
- The companion slot exists (as a placeholder) but is not overloaded with Kudos ownership.
- SPFx packaging discipline is intact; shared import discipline is intact; strong typing is intact.
- No hidden Kudos/PC re-coupling was found in the public scaffold.

Prompt-00 finds no blocker or deviation that would prevent Prompts 01–06 from
proceeding as designed.

---

## 4. Enabling Edits Made in Prompt-00

**None.**

Prompt-00 is explicitly scoped to audit and scope-lock. No runtime files,
manifests, packaging configs, or shared seams were modified. The only file
introduced by Prompt-00 is this report document itself.

Because no runtime or manifest changes were made, no SharePoint package
version bump and no `hb-webparts.sppkg` rebuild are required for Prompt-00.
Both are deferred to the first prompt that actually touches webpart
registration or runtime behavior.

---

## 5. Readiness for Prompt-01

**Ready to proceed.**

Prompt-01 (Data Model and Contracts) should begin at
`apps/hb-webparts/src/webparts/communicationsContracts.ts`
(i.e., `apps/hb-webparts/src/homepage/webparts/communicationsContracts.ts`)
because:

- It is the current contract authority for the People & Culture data plane.
- `PeopleCulturePublic.tsx` is still a scaffold with no committed runtime shape, so the contract file is the correct earlier seam to stabilize first.
- The companion webpart does not yet exist, so its data shapes must be declared in the contract layer before any companion component can typecheck.

Prompt-01 will introduce (additive to existing merged types, not replacing them):

1. Lifecycle state union — Draft · Needs Approval · Scheduled · Live · Expiring Soon · Expired · Archived · Suppressed.
2. Content-family tag — Announcements · Celebrations/Milestones · Culture Programs/Events.
3. Audience model — company-wide vs targeted dimension set supported by the repo.
4. Approval-trigger metadata — enterprise-wide / high-visibility / homepage-pinned flags.
5. Homepage governance metadata — featured vs supporting, pin state, override source, conflict marker.
6. Milestone-candidate model — provenance, trusted source, review status.
7. Media-source model — profile-photo-first with explicit HR override channels (uploaded custom image, campaign artwork, event photography, no-image-if-allowed).
8. Preview model — item-level, public-webpart-context, featured-vs-supporting, desktop-vs-mobile variants.
9. Role model — Editor vs Approver/Admin permissions.
10. Notification model seams — operator + content-owner/submitter only.
11. Limited-intake submission shape — designated non-HR submitter → HR review.

After the contracts land (Prompt-01), Prompt-02 will reimplement the public
runtime on top of those contracts, and Prompt-03 will introduce the real
companion webpart (including allocating the companion manifest GUID,
registering it in `mount.tsx`, and rebuilding the SPFx package with a
four-part version bump `{major}.{minor}.{patch}.{build}`).

---

## Report Back Summary

1. **Architecture conclusion.** Three-surface end state is locked: PC public, HB Kudos public, PC HR operating companion. Legacy merged PC webpart is transitional only.
2. **File ownership map.** Provided in §2 with per-file actions across `peopleCulturePublic/`, `peopleCultureCompanion/`, `apps/hb-webparts/src/homepage/**`, and `@hbc/ui-kit/homepage` extension points. Explicit do-not-touch list included.
3. **Repo-truth conflicts.** None. Live repo state matches the Plan-Summary + Decision-Lock Appendix target shape.
4. **Enabling edits made.** None. Prompt-00 is audit-only. No runtime, manifest, packaging, or shared-seam changes. No SPFx `sppkg` rebuild or version bump triggered by this prompt.
5. **Readiness for Prompt-01.** Ready. Entry seam is `apps/hb-webparts/src/homepage/webparts/communicationsContracts.ts`. Proceed with Prompt-01 Data Model and Contracts.
