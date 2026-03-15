# Responsive Behavior and Failure Mode Catalog

Purpose: reference document for responsive breakpoints, cross-app navigation, and failure-mode handling across SPFx surfaces (Estimating, Accounting, Admin).

Traceability: W0-G4-T07

## Responsive Breakpoints

All SPFx surfaces rely on `@hbc/ui-kit` breakpoints. No custom breakpoint CSS is used.

| Token | Value | Effect |
|---|---|---|
| `HBC_BREAKPOINT_TABLET` | 1023px | HbcDataTable switches to card-stack mode below this |
| `HBC_BREAKPOINT_SIDEBAR` | 1024px | WorkspacePageShell adjusts layout at this threshold |

### Component-level responsive behavior

- **HbcDataTable**: card-stack mode below 640px, adaptive density
- **HbcButton**: auto-bumps touch targets on coarse pointers (sm→md, md→lg)
- **HbcStepWizard** (`variant="vertical"`): inherently responsive
- **WorkspacePageShell**: handles page layout, padding, content areas

### Tablet-safe workflows

| Workflow | App | Notes |
|---|---|---|
| Request detail view | Estimating | Read-only at all breakpoints |
| Guided setup wizard | Estimating | Vertical step wizard is responsive |
| Review queue browse | Accounting | HbcDataTable card-stack below 640px |
| Review detail + actions | Accounting | Action buttons use `flexWrap: 'wrap'` |
| Oversight queue browse | Admin | HbcDataTable card-stack below 640px |
| Detail modal | Admin | HbcModal `size="lg"` adapts to viewport |

## Cross-App Navigation

### Environment variables

| Variable | Used in | Purpose |
|---|---|---|
| `VITE_ADMIN_APP_URL` | Estimating, Accounting | Link to Admin provisioning oversight |
| `VITE_FUNCTION_APP_URL` | All apps | API base URL for provisioning client |

### URL helpers

Each app has `src/utils/crossAppUrls.ts` exporting:
- `getAdminAppUrl(): string | null` — returns validated URL or `null` if env var is missing/invalid

### Navigation patterns

- **Within-app**: TanStack Router (`useNavigate`, `<Link>`)
- **Cross-app**: `window.open()` with env-sourced URL, opens in new tab
- **Back navigation**: `WorkspacePageShell` `breadcrumbs` prop using `BreadcrumbItem[]`

## Failure Mode Catalog

### Scenario 1: Backend API unavailable (initial load)

| Surface | Behavior |
|---|---|
| All pages | `WorkspacePageShell` shows `isError` state with `onRetry` button |

### Scenario 2: Backend API unavailable (refresh with cached data)

| Surface | Behavior |
|---|---|
| Estimating RequestDetailPage | Shows stale data with warning banner: "Live status unavailable — showing last known state." |

### Scenario 3: Auth session not ready

| Surface | Behavior |
|---|---|
| All pages | `WorkspacePageShell` shows `isLoading` state until session resolves |

### Scenario 4: Request not found

| Surface | Behavior |
|---|---|
| Estimating RequestDetailPage | `WorkspacePageShell` `isEmpty` with action to return to list |
| Accounting ProjectReviewDetailPage | `WorkspacePageShell` `isEmpty` with action to return to queue |

### Scenario 5: Provisioning status missing after completion

| Surface | Behavior |
|---|---|
| Estimating RequestDetailPage | Warning banner: "Provisioning details are not yet available." |

### Scenario 6: Action failure (approve, clarify, hold, retry, escalate)

| Surface | Behavior |
|---|---|
| Accounting ProjectReviewDetailPage | Dismissible error banner with `onDismiss` |
| Estimating ProjectSetupPage | Dismissible error banner with `onDismiss` |

### Scenario 7: Admin action failure (force retry, archive, override)

| Surface | Behavior |
|---|---|
| Admin ProvisioningOversightPage | Dismissible error banner with `onDismiss` |

### Scenario 8: SignalR connection lost during provisioning

| Surface | Behavior |
|---|---|
| Estimating RequestDetailPage | Warning banner + 30-second polling fallback |

### Scenario 9: Cross-app URL not configured

| Surface | Behavior |
|---|---|
| Accounting ProjectReviewDetailPage | Warning banner: "Admin navigation is not configured." |
| Estimating RetrySection | "Open Admin Recovery" button hidden; "Escalate to Admin" still available |

### Scenario 10: Unhandled render error

| Surface | Behavior |
|---|---|
| All SPFx webpart roots | `HbcErrorBoundary` in `App.tsx` catches and renders fallback |

### Scenario 11: Empty data sets

| Surface | Behavior |
|---|---|
| Estimating ProjectSetupPage | `HbcEmptyState` with description |
| Accounting ProjectReviewQueuePage | `HbcEmptyState` per tab filter |
| Admin ProvisioningOversightPage | `HbcEmptyState` per tab filter |

## HbcErrorBoundary Placement

All three SPFx apps wrap their root in `HbcErrorBoundary` within `App.tsx`. No additional error boundaries are needed at the page level — `WorkspacePageShell` handles page-level error and empty states via props.
