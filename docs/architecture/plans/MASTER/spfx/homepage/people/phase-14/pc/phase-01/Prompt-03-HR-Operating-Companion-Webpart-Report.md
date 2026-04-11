# Prompt 03 — HR Operating Companion Webpart Report

Phase-14 · People & Culture + HR Operating Companion implementation
package.

Deliverable for
[`Prompt-03-HR-Operating-Companion-Webpart.md`](./Prompt-03-HR-Operating-Companion-Webpart.md).
This prompt introduces the dedicated People & Culture HR operating
companion webpart — a real content-operations console, not a review
queue.

## 1. Surfaces and Tabs Implemented

New webpart at
`apps/hb-webparts/src/webparts/peopleCultureCompanion/`:

- Manifest: `PeopleCultureCompanionWebPart.manifest.json`
- GUID: `7c3f8e24-5a9b-4c1d-b63e-8f2a194d5c7e` (freshly allocated;
  not reused from legacy `27ac10f4-…` or public `e39d9662-…`)
- Version: `0.0.1.0`
- Hidden from toolbox; admin-only deploy path.
- Registered in `apps/hb-webparts/src/mount.tsx` alongside existing
  PC public and HB Kudos scaffolds. The build discovery walker now
  sees 14 shim entries (was 13).

Shell (`PeopleCultureCompanion.tsx`) implements six top-level tabs:

1. **Overview** — lightweight operational dashboard
2. **Announcements** — content-family workspace
3. **Celebrations / Milestones** — content-family workspace
4. **Culture Programs / Events** — content-family workspace
5. **Approvals** — global cross-family inbox
6. **Homepage** — lightweight governance surface

Each content-family tab renders via a shared
`ContentFamilySection` component so lifecycle, sorting, calendar
mode, and editing behavior stay identical across the three families.

## 2. Lifecycle Views Implemented

Inside every content-family tab the companion exposes the eight
lifecycle filter chips required by the Decision-Lock Appendix:

- Draft
- Needs Approval
- Scheduled
- Live (default)
- Expiring Soon
- Expired
- Archived
- Suppressed

Each chip label carries the current count for that state, driven by
the component's in-memory reducer state. The Overview dashboard also
projects per-family lifecycle counts via
`countLifecycleStatesByFamily` from the split model so HR can see
totals at a glance and drill into a specific workspace with a single
click.

Below each lifecycle filter the companion offers:

- **List view** (default) — editorial list with title/body, tier
  badges, hybrid-approval badges, pin badges, per-row "Full editor"
  button. Clicking the text area opens the quick-edit drawer.
- **Calendar view** — 14-day rolling planning grid that surfaces
  `scheduled`, `live`, and `expiringSoon` items by their
  `scheduledStart` or `publishedAt` date. Clicking any calendar item
  opens the quick-edit drawer.

## 3. Editing Model Implemented

The editing division mandated by the Decision-Lock Appendix is real
and verifiable at runtime:

**Quick-edit drawer** (`editing/QuickEditDrawer.tsx`) — right-side
drawer for fast operational edits. Covers the high-frequency field
set:

- Title and body
- Scheduled start date
- Expires-at date
- Homepage tier (featured / supporting / excluded)
- Audience scope switch (companyWide / targeted) with inline
  `dimension:value` entry for targeted tags
- Suppress and Archive shortcuts
- "Open full editor" handoff

**Full editor** (`editing/FullEditor.tsx`) — richer modal for deeper
authoring:

- Title and extended body
- CTA label + href authoring
- Media source selector (profile-photo-first, HR upload, campaign
  artwork, event photography, none) with conditional input fields
  for src / alt text / person id
- Scheduled start, scheduled end, expires-at
- Freeform tag authoring

Both editors are stateless beyond their own local form state. They
never mutate the parent item directly; instead they emit an
`onSubmit(patch)` callback that dispatches into the companion's
reducer, keeping a single source of truth. When a tier override is
applied the reducer automatically flips `homepage.overrideSource` to
`'hrOverride'` so downstream surfaces can tell which placements were
HR-driven versus system-default.

## 4. Approvals and Homepage Surfaces Implemented

**Approvals inbox** (`sections/ApprovalsSection.tsx`) —

- Global cross-family queue pulling every item currently in the
  `needsApproval` lifecycle state.
- Approve and Reject buttons gated by `hasPeopleCultureCapability`
  (`canApprove`, `canResolveApprovals`) so the editor role sees the
  queue read-only.
- Claim button assigns the approval work to the current user; the
  claim owner is displayed inline and driven by a tag prefix that a
  later prompt will promote into a dedicated `approvalOwner` field
  on the schema.
- Reassign input plus Reassign button — only visible to roles with
  `canReassignApproval`. Claim/reassignment applies to **approval
  work only** — the reducer touches only the targeted item's tag
  set, not the general live / scheduled corpus.
- Hybrid-approval badges call out items with `approvalTrigger ===
  'homepagePinned'` or `'enterpriseWide'` so HR knows which items
  need the second approval checkpoint.

**Homepage governance** (`sections/HomepageSection.tsx`) —

- Four summary cards (featured / supporting / excluded / conflicts)
  driven by `detectHomepageConflicts`.
- Per-tier lists of the current composition.
- Tier override chips (featured / supporting / excluded) gated by
  `canManageHomepage`.
- Pin-toggle chip gated by `canPin`; toggling a pin automatically
  propagates `approvalTrigger: 'homepagePinned'` on the item so the
  hybrid path is enforced even if the pin was applied after the
  initial approval.
- Conflict warnings render `pinnedOverflow`, `featuredOverflow`,
  `supportingOverflow`, and `expiringWhilePinned` directly in the
  row meta so HR sees and resolves conflicts in place — not a
  separate notification center.
- Lightweight surface by design: no drag-and-drop editorial board,
  matching the Decision-Lock Appendix requirement.

**Overview milestone + intake triage** —

- Milestone candidates with `reviewState === 'pendingReview'` render
  inline Accept and Suppress actions that dispatch reducer actions
  to record the review decision.
- Non-HR intake submissions with `reviewState === 'awaitingHrReview'`
  render Accept-into-draft and Decline actions. Submitters never
  publish directly — HR is always the gate.

## 5. Verification Performed

- `apps/hb-webparts` `npm run check-types`: **clean**
- `apps/hb-webparts` `npm run lint`: **clean**
- `apps/hb-webparts` `npm run build` (tsc + vite): **clean** (bundle
  grew from 597 KB → 639 KB accommodating the companion)
- New `peopleCultureCompanionRuntime.test.tsx`: **16 / 16** pass
  covering:
  - All six top-level tabs render
  - Overview dashboard lifecycle cards and counts
  - Pending-approvals, upcoming-scheduled cards
  - Lifecycle filter chip count + switching
  - List / calendar view toggle
  - Approvals inbox rendering + approve action
  - Claim + reassign flow with owner propagation
  - Editor role disables approve button
  - Homepage governance tier override + pin toggle with
    `overrideSource` flipping to `hrOverride`
  - Milestone candidate Accept removes from pending queue
  - Intake submission Accept-into-draft removes from pending queue
  - Quick-edit drawer opens on row selection, saves title update
  - Full editor opens from row Full-editor button
  - Boundary check: rendered DOM contains no "kudos" or
    "recognition" substrings anywhere
- Existing `peopleCultureSplitModel.test.ts`: 36 / 36 pass
  (Prompt-01 coverage re-verified)
- Existing `peopleCulturePublicRuntime.test.tsx`: 16 / 16 pass
  (Prompt-02 coverage re-verified)
- Full `apps/hb-webparts` suite: **182 passing**, 14 pre-existing
  failures in unrelated test files confirmed still pre-existing.
  Delta vs. Prompt-02: +16 new companion tests.
- `apps/hb-webparts/config/package-solution.json`: bumped
  `1.0.0.115` → `1.0.0.116` (solution + feature in lockstep).
- `hb-webparts.sppkg` rebuilt via
  `npx tsx tools/build-spfx-package.ts --domain hb-webparts`.
  Package now exports **14 shim entries** (was 13); the new
  companion entry is
  `shell-entry-7c3f8e24-5a9b-4c1d-b63e-8f2a194d5c7e-…`. `.sppkg`
  structure re-verified; final package is **3018.9 KB**.

## 6. Known Remaining Integration Items

1. **SharePoint persistence.** Edits currently apply to an internal
   reducer so HR can exercise every workflow end-to-end, but changes
   do not yet persist to a SharePoint list. Persistence lands when
   the real authoring-list adapter arrives — the reducer boundary
   was designed so the adapter can substitute for the in-memory
   state without touching any section component.
2. **Claim / reassignment field shape.** Approval ownership is
   currently encoded as an `approval-owner:<name>` tag on the item
   so the v1 reducer is schema-free. A later prompt should promote
   this into a dedicated `approvalOwner` field on the
   `PeopleCultureItem` contract when the SP list schema is
   defined.
3. **Notifications.** The Decision-Lock Appendix specifies
   operator + content-owner notifications on lifecycle transitions.
   The reducer already emits every transition the notification
   model needs, but the notification dispatch layer itself is
   deferred to the permissions / intake / notifications prompt
   (Prompt-05).
4. **Audience tagging authoring UX.** The quick-edit drawer accepts
   `dimension:value, dimension:value` text entry for targeted
   audiences — functional but minimal. A later UX pass can replace
   it with a typeahead against the tenant's actual term store once
   that source is resolved.
5. **Preview surface.** Multi-context preview is modeled in the
   contracts (`PeopleCulturePreviewKey`), but the companion does
   not yet render live previews. Preview rendering will land in
   Prompt-04 (Media / Preview / Homepage / Milestone Operations)
   alongside the profile-photo resolver work.
6. **Calendar mode depth.** The current 14-day rolling grid is
   intentionally simple. A richer month view and drag-to-reschedule
   are explicitly out of scope for v1 per the Decision-Lock
   Appendix ("calendar mode does not replace the main operating
   grid").
7. **Existing unrelated homepage test failures.** Eight test files
   are still red on `main` (bundleBudget, compositionPreview,
   discoveryWebpart, interactiveStates, motionAndAccessibility,
   operationalAwarenessWebparts, topBandWebparts,
   utilityWebparts). Outside this prompt's scope.

## Report Back Summary

1. **Surfaces and tabs.** Six top-level tabs (Overview,
   Announcements, Celebrations / Milestones, Culture Programs /
   Events, Approvals, Homepage). Shared content-family section
   renders the three content families with identical behavior.
2. **Lifecycle views.** All eight lifecycle states exposed as
   filter chips per family with live counts. List and 14-day
   calendar views.
3. **Editing model.** Quick-edit drawer for fast operational edits
   (title, body, schedule window, tier, audience) plus richer
   full-editor modal (title, body, CTA, media source with
   profile-photo-first + HR override channels, schedule dates,
   tags). Suppress and Archive shortcuts on the drawer. Both
   editors pipe through the reducer.
4. **Approvals / homepage surfaces.** Cross-family approvals inbox
   with approve / reject / claim / reassign — gated by
   `hasPeopleCultureCapability`. Lightweight homepage governance
   with tier override + pin toggle and inline conflict warnings
   from `detectHomepageConflicts`. Overview dashboard triages
   milestone candidates and non-HR intake submissions in place.
5. **Known remaining integration items.** SharePoint persistence,
   approval-owner field promotion, notifications dispatch, richer
   audience tagging UX, preview rendering, deeper calendar mode,
   and pre-existing unrelated test failures — all explicitly
   deferred to later prompts.
