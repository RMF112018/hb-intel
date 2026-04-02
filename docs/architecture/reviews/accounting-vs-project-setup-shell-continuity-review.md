# Accounting vs Project Setup Shell Continuity Review

**Date:** 2026-04-02
**Scope:** Reconcile Accounting and Project Setup (Estimating) shell behaviors; distinguish intentional specialization from avoidable drift.
**Phase:** [Phase 11, Prompt 06](../plans/MASTER/spfx/accounting/phase-11/Prompt-06_Phase-11-UI-UX-Shell-Continuity-and-Specialization-Governance.md)
**Predecessor:** [Hidden Hosted Dependency Reconciliation](accounting-hidden-hosted-dependency-reconciliation.md) (P11-05)

## 1. Executive Summary

Accounting and Project Setup share the same shell infrastructure and feel like one HB Intel application family. All differences identified are **justified domain specializations** — no accidental drift was found requiring correction.

Accounting is a multi-view controller workspace (queue, detail, overview, placeholder surfaces). Estimating is a single-workflow surface (request submission → detail tracking → provisioning). Their shell configurations correctly reflect these different domain roles while maintaining continuity through shared components, layout patterns, and navigation posture.

## 2. Shared Shell Behaviors (Continuity Confirmed)

| Behavior | Accounting | Estimating | Status |
|----------|-----------|-----------|--------|
| Shell mode | `ShellLayout` simplified | `ShellLayout` simplified | Identical |
| Back-to-Project-Hub | `showBackToProjectHub: true` + `resolveProjectHubUrl()` | Same | Identical |
| Page shell | `WorkspacePageShell` on all pages | `WorkspacePageShell` on all pages | Identical |
| Breadcrumbs | Detail pages ("Project Review" → request name) | Detail pages ("Project Setup" → request name) | Identical pattern |
| Error boundary | `HbcErrorBoundary` wrapping provider stack | `HbcErrorBoundary` wrapping provider stack | Identical |
| Complexity gating | `ComplexityProvider` + `HbcComplexityGate` + `HbcComplexityDial` | Same components, same patterns | Identical |
| Session guards | Load-state checks on data pages | Load-state checks on data pages | Identical pattern |
| Load error states | Retry-capable error states on data pages | Retry-capable error states on data pages | Identical pattern |
| Memory router | `createMemoryHistory` for SPFx isolation | Same | Identical |
| Action error banners | Dismissible error banners on action failure | Dismissible error banners on action failure | Identical pattern |

## 3. Intentional Specialization

### S1: Workspace labeling and tool picker

| Aspect | Accounting | Estimating | Justification |
|--------|-----------|-----------|---------------|
| Workspace label | `"Accounting"` | `""` (empty) | Accounting is a multi-view workspace — the label orients the user across 4 navigation targets. Estimating is a single-workflow surface where labeling adds no orientation value. |
| Tool picker items | 4 items (Overview, Project Review, Invoices, Budgets) | None (empty array, slot set to `null`) | Accounting navigates between distinct views. Estimating's single-workflow flow uses internal page navigation (e.g., "New Request" button in page header). |

**Verdict:** Intentional and correct. Multi-view workspaces benefit from tool pickers; single-workflow surfaces do not.

### S2: Backend mode switching and status banners

| Aspect | Accounting | Estimating |
|--------|-----------|-----------|
| Backend mode switch UI | Absent | Present in `rightSlot` — two-button toggle (UI Review / Production) |
| Production-blocked warning banner | Absent | Present — warns when prerequisites unmet |
| UI-review-active info banner | Absent | Present — indicates backend connections disabled |
| Backend mode persistence | N/A | localStorage-persisted mode override |

**Justification:** Estimating requires a `ui-review` mode for SharePoint reviewers to evaluate the UI without a live backend. Estimating has a dual-mode backend context (`ProjectSetupBackendContext`) with a mock client for ui-review. Accounting always uses the real provisioning API — its controller review surfaces require live data to be meaningful. No mode switching means no mode banners are needed.

**Verdict:** Intentional and correct. The `ALLOW_BACKEND_MODE_SWITCH` injection constant flows through the shell but is intentionally unused in Accounting (confirmed in P11-04).

### S3: Session state and draft persistence

| Aspect | Accounting | Estimating |
|--------|-----------|-----------|
| `SessionStateProvider` | Absent | Present (with no-op executor for SPFx) |
| Draft auto-save | No | Yes — `useAutoSaveDraft`, `useProjectSetupDraft` |
| Resume banner | No | Yes — `ResumeBanner` for draft recovery |
| Connectivity indicators | No | Yes — `HbcConnectivityBar`, `HbcSyncStatusBadge` |

**Justification:** Estimating has a multi-step wizard form (`NewRequestPage`) where users invest significant data entry effort. Draft persistence prevents work loss. Connectivity indicators matter because form submission depends on backend availability. Accounting's pages are read/action surfaces (view queue, review detail, approve/hold/clarify) — no long-form data entry means no draft persistence requirement. Adding session state infrastructure to Accounting would be complexity without benefit.

**Verdict:** Intentional and correct. Draft persistence and connectivity indicators serve form-heavy workflows, not read/action surfaces.

### S4: Real-time updates (SignalR)

| Aspect | Accounting | Estimating |
|--------|-----------|-----------|
| SignalR integration | No | Yes — provisioning progress tracking |
| Real-time disconnect indicator | No | Yes — warning when connection lost |

**Justification:** Estimating tracks real-time provisioning progress after request submission — the user watches the provision process unfold. Accounting reviews request state at a point in time (queue, detail, lifecycle). Real-time updates would add infrastructure cost without matching a user need.

**Verdict:** Intentional and correct. Real-time tracking serves workflow-progression surfaces, not review surfaces.

### S5: Toast notifications

| Aspect | Accounting | Estimating |
|--------|-----------|-----------|
| `HbcToastProvider` | Present | Absent |

**Justification:** Accounting uses toast notifications for action feedback (approve, hold, clarify operations). Estimating uses inline banners and state-specific UI for feedback instead. Both approaches are valid for their respective interaction patterns.

**Verdict:** Intentional and acceptable. Different notification patterns suit different interaction densities.

### S6: Theme forcing

| Aspect | Accounting | Estimating |
|--------|-----------|-----------|
| `forceTheme` in `HbcThemeProvider` | Not set (uses default) | `forceTheme={spfxContext ? 'light' : undefined}` |

**Justification:** Estimating explicitly forces light theme in SPFx context to ensure consistent appearance regardless of SharePoint theme settings. Accounting uses the default theme, which in practice renders as light in the current SharePoint configuration. This is a minor inconsistency but has no visible impact in the current deployment environment.

**Verdict:** Acceptable with caveat. If a future SharePoint environment uses a dark theme, Accounting would inherit it while Estimating would not. This is documented but not corrected because it has no current production impact.

### S7: Router initial entry

| Aspect | Accounting | Estimating |
|--------|-----------|-----------|
| Initial route | `/` (OverviewPage) | `/project-setup` (ProjectSetupPage, via redirect from `/`) |

**Justification:** Accounting lands on a dashboard overview. Estimating lands on its primary request list. Both initial routes are appropriate for their domain's entry experience.

**Verdict:** Intentional and correct.

## 4. Corrected Drift

**None found.** All identified differences map to justified domain specialization. No release-significant shell seams require correction.

## 5. Remaining Acceptable Differences

| Difference | Classification | Risk | Action |
|-----------|---------------|------|--------|
| Estimating forces light theme; Accounting does not | Acceptable with caveat | Low — no impact in current deployment | Document; revisit if SharePoint theme environment changes |
| Estimating has `AppRouter` wrapper that re-keys on backend mode change | Estimating-only pattern | None — needed only for mode switching | No action |
| Accounting has `QueryClient` instantiated at module level; Estimating same | Identical pattern | None | No action |

## 6. Exact Files Inspected

### Accounting
- `apps/accounting/src/router/root-route.tsx` — shell config, tool picker, layout
- `apps/accounting/src/router/routes.ts` — route definitions (5 routes)
- `apps/accounting/src/router/index.ts` — router creation, memory history
- `apps/accounting/src/App.tsx` — provider stack
- `apps/accounting/src/backend/AccountingBackendContext.tsx` — backend context (single-mode)
- `apps/accounting/src/mount.tsx` — mount entry, config acceptance
- `apps/accounting/src/pages/OverviewPage.tsx` — dashboard layout
- `apps/accounting/src/pages/BudgetsPage.tsx` — list layout, empty state
- `apps/accounting/src/pages/InvoicesPage.tsx` — list layout, empty state
- `apps/accounting/src/pages/ProjectReviewQueuePage.tsx` — list layout, tabs, session guard
- `apps/accounting/src/pages/ProjectReviewDetailPage.tsx` — detail layout, breadcrumbs, complexity gating

### Estimating (comparison)
- `apps/estimating/src/router/root-route.tsx` — shell config, backend mode switch, banners
- `apps/estimating/src/router/routes.ts` — route definitions (4 routes)
- `apps/estimating/src/router/index.ts` — router creation, memory history
- `apps/estimating/src/App.tsx` — provider stack, theme forcing
- `apps/estimating/src/project-setup/backend/ProjectSetupBackendContext.tsx` — dual-mode backend
- `apps/estimating/src/mount.tsx` — mount entry, config acceptance
- `apps/estimating/src/pages/ProjectSetupPage.tsx` — list layout, complexity gating
- `apps/estimating/src/pages/NewRequestPage.tsx` — form layout, connectivity, draft
- `apps/estimating/src/pages/RequestDetailPage.tsx` — detail layout, SignalR, multiple banners
