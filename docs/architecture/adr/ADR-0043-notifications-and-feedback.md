# ADR-0043: Notifications & Feedback System (Phase 4b.9)

**Status:** Accepted
**Date:** 2026-03-06
**Phase:** 4b.9
**Supersedes:** ADR-0022 §1 (three-category toast restriction)

## Context

Phase 4b.9 implements the Notifications & Feedback system per PH4B.9-UI-Design-Plan.md §12 and binding decision D-08. The previous implementation (ADR-0022) restricted toasts to three categories (`success`, `error`, `sync-status`). PH4B.9 §12 task 4b.9.2 specifies four convenience methods matching the four standard feedback variants used throughout the application.

Key design questions resolved:
1. Should toasts support 4 categories (success/error/warning/info) or remain restricted to 3?
2. Where should the toast container be mounted given the shell → ui-kit dependency direction?
3. How should the ESLint plugin enforce D-08 (no inline feedback)?

## Decision

### 1. Four-Category Toast System (Amends ADR-0022 §1)

**Toast categories expanded to four:** `success`, `error`, `warning`, `info`.

The previous `sync-status` category is replaced by `info`, which covers the same use case (programmatic status updates) plus general informational toasts.

| Category | Auto-dismiss | Dismiss mechanism | ARIA role |
|----------|-------------|-------------------|-----------|
| `success` | 3 000 ms | Automatic | `status` |
| `error` | Never | Manual close button | `alert` |
| `warning` | 5 000 ms | Automatic | `alert` |
| `info` | 4 000 ms | Automatic | `status` |

**Rationale:** The PH4B.9 plan explicitly requires all four variants for comprehensive feedback coverage. Warning toasts serve transient caution messages (e.g., "Record locked by another user") while banner warnings serve persistent conditions. The disambiguation between transient warnings (toast) and persistent warnings (banner) is clear: toasts auto-dismiss, banners persist until resolved.

### 2. Convenience API

`useToast()` now returns a `toast` object with per-category shorthand methods:

```ts
const { toast } = useToast();
toast.success('Saved.');
toast.error('Failed.');
toast.warning('Locked by another user.');
toast.info('Export started.');
```

The low-level `addToast()` / `dismissToast()` / `dismissCategory()` APIs remain available for advanced use cases.

**Rationale:** Convenience methods reduce boilerplate and enforce correct category usage at the call site.

### 3. Toast Container Mounting in AppShellLayout

`HbcToastProvider` and `HbcToastContainer` are mounted in `AppShellLayout` (in `@hbc/app-shell`), not in `ShellLayout` (in `@hbc/shell`). This avoids a circular dependency: `@hbc/ui-kit` imports from `@hbc/shell`, so `@hbc/shell` cannot import from `@hbc/ui-kit`. The `@hbc/app-shell` package bridges both.

**Rationale:** Preserves the unidirectional dependency graph: `app-shell → shell + ui-kit`.

### 4. ESLint Rule: no-inline-feedback

New rule `@hbc/hbc/no-inline-feedback` warns when inline feedback components (`Alert`, `MessageBar`, `InlineNotification`, `Toast`, `Toaster`, etc.) appear in JSX. All transient feedback must use `useToast()`; persistent warnings use the `banner` prop on `WorkspacePageShell`.

**Rationale:** Mechanically enforces D-08 at lint time, preventing page authors from bypassing the toast system.

### 5. Banner Prop (Confirmed, No Changes)

The `WorkspacePageShell.banner` prop with `BannerConfig` interface (`variant`, `message`, `dismissible`) was already implemented in Phase 4b.2. No changes were needed. `HbcBanner` renders in document flow below breadcrumbs.

## Consequences

- ADR-0022 §1 (three-category restriction) is superseded; `sync-status` replaced by `info`
- Developers use `toast.success()` / `toast.error()` / `toast.warning()` / `toast.info()` for transient feedback
- `AppShellLayout` is the recommended root wrapper for PWA apps (replaces bare `ShellLayout` for apps needing toast support)
- ESLint enforces D-08 automatically; inline feedback components are flagged as warnings
- The `dismissCategory()` API works with all four categories for programmatic batch dismissal
