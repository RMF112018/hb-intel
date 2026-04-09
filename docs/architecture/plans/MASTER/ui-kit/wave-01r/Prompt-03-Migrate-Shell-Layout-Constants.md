# Prompt 03 — Migrate Shell-Layout Constants to the App-Shell Boundary

You are working in the live HB Intel repository.

## Objective

Close the architectural cleanup gap where shell-layout constants still live in `packages/ui-kit/src/theme/tokens.ts` instead of the app-shell boundary.

This is a narrow shared-package refactor focused on ownership correctness, compatibility discipline, and clean migration.

Do not reread files that are already in your active context unless needed.

---

## Governing files

Read and follow:

- `docs/architecture/reviews/UI-System-Audit-Validation-Report.md`
- `docs/reference/ui-kit/UI-System-Layer-Model.md`
- `docs/reference/ui-kit/Productive-Lane-Standard.md`
- `docs/architecture/blueprint/ui-system-target-architecture.md`
- `packages/ui-kit/src/theme/tokens.ts`
- `packages/ui-kit/src/app-shell.ts`
- `packages/ui-kit/src/index.ts`

Inspect actual consumers of the shell-layout constants before making changes.

---

## Constants to resolve

At minimum, inspect and resolve ownership for:

- `HBC_HEADER_HEIGHT`
- `HBC_CONNECTIVITY_HEIGHT_ONLINE`
- `HBC_CONNECTIVITY_HEIGHT_OFFLINE`
- `HBC_SIDEBAR_WIDTH_COLLAPSED`
- `HBC_SIDEBAR_WIDTH_EXPANDED`
- `HBC_BOTTOM_NAV_HEIGHT`

---

## Required work

### 1. Map current consumers
Find every live consumer of these constants.

Group them into:
- true app-shell consumers,
- layout consumers that should use app-shell ownership,
- and any transitional consumers that need a shim.

### 2. Move ownership to the correct boundary
Create the correct app-shell-owned location for these constants.

Update exports so that:
- the canonical source is app-shell-owned,
- the ownership is clear in file placement and comments,
- and migration is clean.

### 3. Preserve safe compatibility where needed
If the main barrel or old theme path still needs a compatibility bridge, keep it narrowly and explicitly.

Do not leave the theme layer as the canonical owner.

### 4. Update affected consumers
Update named consumers/imports to use the corrected source where appropriate.

### 5. Update docs if needed
If any documentation or code comments explicitly describe the old ownership, update them narrowly.

### 6. Write closure note
Create or update:

`docs/architecture/reviews/UI-System-Shell-Layout-Constant-Migration-Closure.md`

This note must include:
- old ownership,
- new ownership,
- exact constants moved,
- exact consumers updated,
- compatibility shims kept or removed,
- and any remaining transitional debt.

---

## Validation requirements

Report exactly:
- where the constants now live,
- which consumers were updated,
- what compatibility path remains,
- and whether `theme/tokens.ts` is no longer the canonical owner.

---

## Guardrails

- Do not use this as an excuse to redesign app-shell broadly.
- Do not break consumers unnecessarily.
- Do not leave ownership ambiguous after the move.
- Keep the migration narrow, explicit, and well-documented.

---

## Completion requirement

When finished:
1. migrate the constants to the correct app-shell-owned boundary
2. update affected imports and compatibility shims as needed
3. create or update `docs/architecture/reviews/UI-System-Shell-Layout-Constant-Migration-Closure.md`
4. provide a short completion note stating:
   - what moved,
   - which consumers changed,
   - whether the shell-layout constant ownership gap is now closed.
