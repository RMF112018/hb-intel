# Phase 00-01 Completion Note — Repo-Truth Reconciliation

## Status

**Complete.** Contradictions resolved, authoritative boundary statements established, doc authority cleaned up, routing updated.

---

## Contradictions Resolved

### 1. UI-Kit entry-point mismatch (Critical)

**Before:** `package-relationship-map.md` Rule R2 stated "SPFx contexts must import from `@hbc/ui-kit/app-shell`" and the ui-kit entry points listing showed only 4 entry points. The actual homepage webparts use `@hbc/ui-kit/homepage`, a 5th entry point that was real in source but missing from governance docs.

**After:** Rule R2 now distinguishes homepage webparts (`@hbc/ui-kit/homepage`) from SPFx domain apps (`@hbc/ui-kit/app-shell`). The entry points listing shows all 5 entry points with correct usage guidance.

### 2. Three-lane model not discoverable from top-level docs

**Before:** The three-lane model (homepage / shell-extension / navigation) was defined only in the Webparts Implementation Blueprint. Not referenced in `docs/README.md`, `current-state-map.md`, `agent-authority-map.md`, or any quick-reference doc.

**After:** Created `docs/reference/sharepoint-homepage-shell-boundaries.md` as the authoritative quick-reference. Added routing entries in `agent-authority-map.md`. Added a SharePoint Homepage & Shell section in `docs/README.md`. Added classification entries in `current-state-map.md`.

### 3. hb-webparts absent from current-state-map

**Before:** The 11 SPFx domain apps were listed, but `apps/hb-webparts` (the homepage product) was not classified.

**After:** Added a dedicated "SPFx Homepage Product" section in `current-state-map.md` with the multi-webpart packaging model and UI entry-point.

### 4. SharePoint customization posture not documented as standalone reference

**Before:** The supported-vs-unsupported customization policy was embedded in the Webparts Blueprint §2.2 and ADR-0067, requiring reading both documents to assemble the full picture.

**After:** `docs/reference/sharepoint-homepage-shell-boundaries.md` consolidates the posture in one section with explicit allowed/prohibited lists.

### 5. Local machine paths in entry-points.md

**Before:** Related References section used absolute local filesystem paths (`/Users/bobbyfetting/hb-intel/docs/reference/ui-kit/...`).

**After:** Converted to relative paths (`./HbcChart.md`, etc.).

### 6. UI doctrine README was a staging document, not an authoritative reference

**Before:** `docs/reference/ui-kit/README.md` contained a "PR-ready migration map" rather than a governing reference.

**After:** Rewritten as a concise doctrine reference with clear governing standards, supersession language, entry-point summary, and cross-references.

---

## Files Created

| File | Purpose |
|------|---------|
| `docs/reference/sharepoint-homepage-shell-boundaries.md` | Authoritative three-lane model, supported customization posture, boundary rules |
| `docs/architecture/plans/MASTER/spfx/homepage/phase-00/Phase-00-01-Completion-Note.md` | This completion note |

## Files Updated

| File | Change |
|------|--------|
| `docs/architecture/blueprint/package-relationship-map.md` | Rule R2 updated for homepage entry point; ui-kit entry points listing expanded to 5 |
| `docs/architecture/blueprint/current-state-map.md` | Added §2.3 SharePoint Homepage & Shell Blueprint Library; added SPFx Homepage Product section for hb-webparts |
| `docs/reference/developer/agent-authority-map.md` | Added routing for homepage/shell boundary, SharePoint customization posture, and UI-kit entry-point questions |
| `docs/README.md` | Added SharePoint Homepage & Shell navigation section |
| `docs/reference/ui-kit/README.md` | Rewritten from staging document to governing reference with doctrine, entry-point summary, and cross-references |
| `docs/reference/ui-kit/entry-points.md` | Fixed local machine paths; added cross-references to boundary doc and SPFx doctrine |

## Authoritative Paths Going Forward

| Question | Authoritative Source |
|----------|---------------------|
| UI-kit entry-point truth | `docs/reference/ui-kit/entry-points.md` |
| Homepage vs shell-extension boundary | `docs/reference/sharepoint-homepage-shell-boundaries.md` |
| Supported SharePoint customization posture | `docs/reference/sharepoint-homepage-shell-boundaries.md` §Supported Customization Posture |
| Runtime-specific UI doctrine (SPFx) | `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md` |
| Runtime-specific UI doctrine (PWA) | `docs/reference/ui-kit/doctrine/UI-Doctrine-PWA-Governing-Standard.md` |
| Entry-point governance rule | `docs/architecture/blueprint/package-relationship-map.md` Rule R2 |

## Intentionally Deferred to Later Prompts

The following belong to Phase 00 Prompt 2 or Prompt 3, not this reconciliation:

- **Prompt 2:** Lock the UI-kit export/import contract with enforcement mechanisms (lint rules, barrel file guardrails)
- **Prompt 3:** Establish the SPFx-hosted homepage doctrine overlay as a formal reference with binding vs directional classification
- **Future:** ADR for the three-lane model (currently documented in reference and blueprint, not yet locked as a permanent decision)
- **Future:** Shell-extension package creation (Lane B) — Phase 4 of the Tenant Shell Implementation Blueprint
