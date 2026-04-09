# Plan Summary — People & Culture Structural Split Initiation

## Objective

Establish the correct **SPFx/webpart/package seams** to split the current merged People & Culture runtime into the future product direction:

- **People & Culture** for announcements, celebrations, and broader culture programming
- **HB Kudos** for recognition, spotlight, archive, reactions, submission, and approval-aware kudos behavior

This phase is structural. It is not the final implementation wave.

## Repo-truth stance

The agent must prove local HEAD before acting.

This package is intentionally designed to prevent a false start caused by:

- stale manifests,
- stale shell shims,
- stale `mount.tsx` routing,
- or partially completed split artifacts that are not yet authoritative.

## What this package should accomplish

### 1. Lock current repo truth

Determine and document:

- the current authoritative People & Culture runtime entry,
- the current People & Culture manifest inventory,
- whether standalone Kudos surfaces already exist as support components only or as real webparts,
- and how `hb-webparts.sppkg` currently discovers and packages webpart manifests.

### 2. Establish split-ready structure

Create the structural seams for:

- `PeopleCulturePublic`
- `HbKudos`
- optional non-authoritative placeholder seams for companion/admin surfaces if required for later wave planning

Preserve the current merged runtime as a compatibility seam until the future rollout is complete.

### 3. Wire package/build readiness

Ensure the split is reflected in:

- source manifests,
- runtime mount registration,
- export/barrel structure,
- shell packaging discovery,
- and final `hb-webparts.sppkg` contents.

### 4. Produce verification and deferred-scope notes

Make the boundary explicit between:

- what is now structurally ready,
- and what remains for later implementation waves.

## Recommended target state

### Package/domain posture

Stay inside:

- `apps/hb-webparts/`
- `tools/build-spfx-package.ts`
- `hb-webparts.sppkg`

Do **not** create a new SPFx domain or new package unless local HEAD proves that the current multi-webpart packaging model is not viable.

### Runtime posture

Treat the current merged People & Culture runtime as **legacy compatibility**, not as the future product boundary.

Introduce explicit new seams for:

- `People and Culture` public
- `HB Kudos` public

Keep companion surfaces deferred unless minimal placeholder registration is required for later implementation governance.

### Compatibility posture

Preserve the current merged manifest/runtime until the new registrations compile, package, and are proven.

The current merged seam may be:

- retained in place and marked legacy,
- or moved behind a compatibility wrapper/re-export,
- but it must not be silently destroyed during this phase.

## Non-goals

This package does **not** deliver:

- the final People & Culture UI rebuild,
- the final HB Kudos UI rebuild,
- the final HR/admin moderation logic,
- final list-field integration completion,
- final permissions/workflow behavior,
- or final rollout/migration of page placements.
