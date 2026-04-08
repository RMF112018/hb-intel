# PeopleCulture Authority and Naming Resolution

**Date:** 2026-04-08
**Closes:** PeopleCulture naming/authority ambiguity identified in `docs/architecture/reviews/UI-System-Audit-Validation-Report.md`

---

## Prior Ambiguity

Two files coexisted in `apps/hb-webparts/src/webparts/peopleCulture/`:

| File | Surface Strategy | Mounted in Production |
|------|-----------------|----------------------|
| `PeopleCulture.tsx` | Shared — used `HbcEditorialSurface` from `@hbc/ui-kit/homepage` | **No** — not referenced by `mount.tsx` |
| `PeopleCultureMerged.tsx` | Intentionally local — warm gradient hero, custom composition | **Yes** — GUID `27ac10f4-4054-4dd2-bd53-3b4ef4379ab4` |

The barrel `index.ts` exported both, with `PeopleCulture` marked `@deprecated`. The coexistence created confusion about which implementation was authoritative.

---

## Runtime Truth

`apps/hb-webparts/src/mount.tsx` line 34 maps GUID `27ac10f4-4054-4dd2-bd53-3b4ef4379ab4` to `PeopleCultureMerged`. This is the only production rendering path for the People and Culture webpart.

`PeopleCulture.tsx` had zero runtime consumers — it was dead code from a Phase 17 rebuild that was superseded by the Phase 11 `PeopleCultureMerged` implementation (documented in `P11-P00` decision record).

---

## Decision

- **Authoritative file:** `PeopleCultureMerged.tsx` — unchanged, remains the production component
- **Dead file removed:** `PeopleCulture.tsx` — deleted (no consumers, already marked deprecated)
- **Barrel cleaned:** `index.ts` — now exports only `PeopleCultureMerged` and `PeopleCultureMergedProps`
- **Name preserved:** `PeopleCultureMerged` was not renamed because the name is referenced in 59 files across code, tests, plans, and docs — renaming would be disproportionate scope for this task

---

## Files Changed

| File | Change |
|------|--------|
| `apps/hb-webparts/src/webparts/peopleCulture/PeopleCulture.tsx` | **Deleted** — dead code |
| `apps/hb-webparts/src/webparts/peopleCulture/index.ts` | Cleaned — removed deprecated `PeopleCulture` export, exports only `PeopleCultureMerged` |

No changes to `mount.tsx` — it already imported directly from `PeopleCultureMerged.tsx`, not via the barrel.

---

## Verification

- `tsc --noEmit` (hb-webparts): **Pass**
- `eslint` (hb-webparts): **Pass**
- `vite build` (hb-webparts): **Pass** — 575.08 KB bundle, all 10 webpart GUIDs intact
- Mount path unchanged — GUID `27ac10f4-...` still maps to `PeopleCultureMerged`

---

## Remaining Notes

- `normalizePeopleCultureConfig` in `communicationsConfig.ts` and `PeopleCultureConfig` in `communicationsContracts.ts` remain — they are part of the shared config/normalization layer and are used by tests. They are not dead code created by this removal.
- The `PeopleCultureMerged` name carries historical context ("merged" from the Phase 11 consolidation). A future rename to `PeopleCulture` could be considered as a low-priority cleanup if the team prefers, but is not blocking.
