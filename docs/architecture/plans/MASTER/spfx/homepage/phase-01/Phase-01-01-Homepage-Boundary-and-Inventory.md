# Phase 01-01 — Homepage Boundary and Inventory

## Objective

Audit the live `apps/hb-webparts` package on `main` and convert it from an implicitly understood homepage lane into an **explicitly bounded homepage product** with a clear inventory, local ownership map, and documented role in the three-lane SharePoint architecture.

---

## Required Inputs

Use live repo truth from `main`, especially:

- `apps/hb-webparts/README.md`
- `apps/hb-webparts/package.json`
- `apps/hb-webparts/vite.config.ts`
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/homepage/**`
- `apps/hb-webparts/src/webparts/**`
- `docs/reference/sharepoint-homepage-shell-boundaries.md`
- `docs/reference/ui-kit/entry-points.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/architecture/blueprint/current-state-map.md`
- `docs/architecture/blueprint/package-relationship-map.md`

Do **not** re-read files already in your current context or memory unless they changed, you need exact verification, or the task widened.

---

## What You Must Determine

### 1. Product boundary truth

Determine precisely what `apps/hb-webparts` owns and what it does not own.

You must explicitly distinguish:

- homepage package responsibilities
- shell-extension responsibilities
- reference/demo composition responsibilities
- shared homepage primitive responsibilities
- per-webpart responsibilities

### 2. Package inventory truth

Create a clear inventory of the homepage package, including at minimum:

- entry/mount seams
- shared homepage primitives
- helper seams
- model/contract files
- each webpart folder
- test and verification seams

### 3. Boundary weak points

Identify current repo-truth weak points, such as:

- scaffold language still present in local docs
- reference composition vs product composition ambiguity
- ambiguous helper ownership
- unclear local-vs-shared primitive boundaries
- any package-level behaviors that are real in code but undocumented

---

## Required Actions

1. Audit the live package structure and local documentation.
2. Update `apps/hb-webparts/README.md` so it reads as a **homepage product lane README**, not a prompt-stage scaffold note.
3. Create a concise authoritative document under the SharePoint homepage planning/docs area that defines:
   - what the homepage package owns
   - what it does not own
   - how it relates to shell-extension and navigation/governance lanes
   - what `ReferenceHomepageComposition` is allowed to be used for
   - what the mount/dispatch seam owns
4. Create a homepage package inventory document that maps local folders to responsibilities.
5. Update any navigation/routing docs only if Phase 01 repo truth requires it.

---

## Non-Negotiable Guardrails

- Do not move homepage work into shell-extension territory.
- Do not redesign visuals as the main output of this prompt.
- Do not weaken the Phase 00 doctrine hierarchy.
- Do not broaden homepage imports beyond the locked entry-point policy.
- Do not delete `ReferenceHomepageComposition` unless you can prove it is obsolete and replace its value with something better and safer.
- Do not treat `src/mount.tsx` as throwaway glue. It is a real package seam and must be documented as such.

---

## Deliverables

At minimum:

- updated `apps/hb-webparts/README.md`
- `Homepage-Product-Boundary.md` (or equivalently named authoritative Phase 01 boundary document)
- `Homepage-Package-Inventory.md` (or equivalently named package inventory document)
- a completion note summarizing what was clarified and what remains for Prompt 02

---

## Acceptance Criteria

This prompt is complete when:

- the homepage package reads as a product lane in local docs
- local folder ownership is explicit
- mount/dispatch ownership is explicit
- reference composition vs product composition is explicit
- homepage vs shell-extension boundary drift is reduced, not increased
- the next prompt can rationalize shared seams without guessing what the package is
