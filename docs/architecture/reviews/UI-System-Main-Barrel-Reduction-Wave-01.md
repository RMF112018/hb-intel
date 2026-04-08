# UI System Main Barrel Reduction — Wave 01

**Date:** 2026-04-08
**Closes:** Oversized main barrel gap identified in `docs/architecture/reviews/UI-System-Audit-Validation-Report.md`
**Status:** First wave executed — 60 consumer files migrated to `@hbc/ui-kit/fluent`

---

## Starting State

`packages/ui-kit/src/index.ts` exported 160+ symbols including 11 Fluent UI passthrough re-exports (`FluentProvider`, `Text`, `Badge`, `Switch`, `Spinner`, `TabList`, `Tab`, `Card`, `CardHeader`, `Button`, `tokens`) and 1 Fluent type (`SelectTabData`) that properly belong in `@hbc/ui-kit/fluent`.

60 consumer files across the monorepo imported Fluent symbols from the main barrel instead of the dedicated subpath.

---

## Migrations Executed

### Consumer Import Migration: `@hbc/ui-kit` → `@hbc/ui-kit/fluent`

60 files migrated across 6 packages/apps:

| Package / App | Files Migrated | Primary Symbols |
|---|---|---|
| `packages/features/project-hub` | 35 | Text, Card, CardHeader, tokens |
| `apps/pwa` | 14 | Text, Card, CardHeader, Button, Spinner, tokens |
| `apps/dev-harness` | 4 | Button, Switch, Tab, TabList, tokens, SelectTabData |
| `apps/hb-site-control` | 2 | Text, Card, CardHeader |
| `apps/accounting` | 1 | Text |
| `apps/business-development` | 1 | Text, Card, CardHeader |
| `apps/leadership` | 1 | Text, Card, CardHeader |
| `apps/project-hub` | 1 | Text, Card, CardHeader |

### Symbols Migrated

| Symbol | Files Using It | Now Imported From |
|---|---|---|
| `Text` | 52 | `@hbc/ui-kit/fluent` |
| `Card` | 19 | `@hbc/ui-kit/fluent` |
| `CardHeader` | 19 | `@hbc/ui-kit/fluent` |
| `tokens` | 14 | `@hbc/ui-kit/fluent` |
| `Button` | 5 | `@hbc/ui-kit/fluent` |
| `Spinner` | 2 | `@hbc/ui-kit/fluent` |
| `Tab` | 1 | `@hbc/ui-kit/fluent` |
| `TabList` | 1 | `@hbc/ui-kit/fluent` |
| `Switch` | 1 | `@hbc/ui-kit/fluent` |
| `SelectTabData` (type) | 1 | `@hbc/ui-kit/fluent` |

---

## Exports Intentionally Retained in Main Barrel

The Fluent passthrough re-exports remain in `index.ts` with `@deprecated` markers (added in W01-P06). They are kept for compatibility until a future wave confirms zero remaining consumers. The `@hbc/shell` module config re-exports also remain with `@deprecated` markers — a consumer scan found zero current users importing them from `@hbc/ui-kit`.

---

## What Changed

- **60 consumer files** — Fluent imports split from `@hbc/ui-kit` to `@hbc/ui-kit/fluent`
- **0 exports removed** from the main barrel (compatibility preserved)
- **`@hbc/ui-kit/fluent`** gained real consumer usage across the monorepo

---

## Verification

- `tsc --noEmit` (ui-kit): **Pass**
- `tsc --noEmit` (features-project-hub): **Pass**
- `tsc --noEmit` (hb-webparts): **Pass**
- PWA and dev-harness: pre-existing type errors unrelated to this work

---

## Next-Wave Targets

1. **Remove Fluent passthroughs from main barrel** — now that all known consumers use `@hbc/ui-kit/fluent`, the deprecated re-exports can be removed in a follow-up wave after confirming no remaining consumers.
2. **Remove `@hbc/shell` module config re-exports** — zero consumers found; can be removed immediately in next wave.
3. **Migrate theme-only consumers** — some consumers import theme tokens from `@hbc/ui-kit` that could use `@hbc/ui-kit/theme` instead.
4. **Migrate app-shell consumers** — the main barrel still re-exports all app-shell components; consumers could use `@hbc/ui-kit/app-shell`.
