<!-- Tier 1: Living Reference (Diátaxis) — W0-G4-T01 -->

# Estimating Requester Surface Reference

> **Classification:** Living Reference (Diátaxis)
> **Produced by:** W0-G4-T01

## Route Map

| Route | Component | Purpose |
|---|---|---|
| `/project-setup/new` | `NewRequestPage` | 5-step guided project setup wizard |
| `/project-setup/new?mode=clarification-return&requestId={id}` | `NewRequestPage` | Wizard pre-populated for clarification re-entry |
| `/project-setup/$requestId` | `RequestDetailPage` | Request detail with BIC ownership and provisioning status |

## Limited-Release Shell

- The Estimating limited-release SharePoint shell intentionally omits the workspace-name text and the single-item Project Setup tool-picker row.
- The remaining simplified shell chrome is limited to Back to Project Hub plus the optional reviewer backend-mode control.

## Backend Modes

The Estimating SPFx requester surface now supports two runtime-selected backend modes for the limited-release Project Setup deployment:

| Mode | Source | Behavior |
|---|---|---|
| `production` | Shell-injected `backendMode`, then `VITE_BACKEND_MODE`, default | Uses the live provisioning API client and normal Function App runtime config |
| `ui-review` | Shell-injected `backendMode`, then `VITE_BACKEND_MODE` | Disables backend connections and uses localStorage-backed mock Project Setup data |

- SharePoint limited-release packaging defaults the Estimating SPFx surface to `ui-review` when no live backend mode or Function App URL is intentionally provided by the shell.
- `functionAppUrl` is only required in `production` mode.
- `allowBackendModeSwitch` is a separate runtime flag. When enabled, Estimating renders a reviewer-only header control that can switch between `UI Review` and `Production`.
- `ui-review` keeps the deployment posture limited to Project Setup only; Bids and Templates remain hidden.
- A non-error informational banner is shown from the shared shell: `UI Review mode is active. Backend connections are disabled, and Project Setup is using local sample data saved in this browser.`
- When the switch is enabled, the selected override is saved per browser and takes precedence over the injected default mode for that reviewer session.
- All Project Setup routes share one app-level `SessionStateProvider`, so draft persistence plus connectivity/sync UI remain available across list, new-request, and detail navigation without page-local provider gaps.

### UI-Review Storage

| Key | Purpose |
|---|---|
| `hb-intel:estimating:ui-review:project-setup:requests` | Stored Project Setup request list |
| `hb-intel:estimating:ui-review:project-setup:statuses` | Stored provisioning-status records keyed by `projectId` |
| `hb-intel:estimating:project-setup:backend-mode-override` | Optional reviewer-selected backend-mode override |

- First load seeds realistic review samples covering under-review, clarification, provisioning, failed, and completed requests.
- Corrupt or missing storage self-heals by reseeding instead of rendering the backend error shell.
- Create, detail, retry, and escalate flows operate against the stored mock records in `ui-review`.

### Search Param Contract (`/project-setup/new`)

| Param | Type | Default | Description |
|---|---|---|---|
| `mode` | `'new-request' \| 'clarification-return'` | `'new-request'` | Wizard mode |
| `requestId` | `string \| undefined` | `undefined` | Required when `mode === 'clarification-return'` |

## Component Hierarchy

### NewRequestPage

```
WorkspacePageShell layout="form"
├── HbcSyncStatusBadge (actions slot)
├── ResumeBanner (conditional: resumeContext.decision === 'prompt-user')
├── HbcConnectivityBar
├── HbcBanner variant="error" (conditional: submission error)
└── HbcStepWizard variant="vertical"
    ├── ProjectInfoStepBody (step: project-info)
    ├── DepartmentStepBody (step: department)
    ├── TeamStepBody (step: project-team)
    ├── TemplateAddOnsStepBody (step: template-addons)
    └── ReviewStepBody (step: review-submit)
```

### RequestDetailPage

```
WorkspacePageShell layout="detail"
├── Review-mode banner (shared shell, conditional: backendMode === 'ui-review')
├── RequestCoreSummary (project name, status badge, BIC ownership)
├── RequestStateContext (state explanation text)
├── ClarificationBanner (conditional: state === NeedsClarification)
├── ProvisioningChecklist (conditional: full visibility + active provisioning)
└── HbcComplexityGate minTier="standard"
    └── Extended Details card (team, add-ons, blocked reason)
```

## Step Wizard Configuration

Consumed from `PROJECT_SETUP_WIZARD_CONFIG` in `@hbc/features-estimating`.

| Step | stepId | Required | Fields |
|---|---|---|---|
| 1 | `project-info` | Yes | projectName, clientName, projectStreetAddress, projectCity, projectCounty, projectState, projectZip, estimatedValue, startDate, procoreProject |
| 2 | `department` | Yes | projectStage, officeDivision, department, projectType, contractType |
| 3 | `project-team` | Yes | projectLeadId, groupMembers, viewerUPNs |
| 4 | `template-addons` | No | addOns (filtered by department) |
| 5 | `review-submit` | Yes | Cross-step validation + submission |

- **Order mode:** sequential (steps unlock linearly)
- **Allow reopen:** true (required for department→step-4 dependency)
- **Draft key:** `project-setup-form-draft`
- **Navigation rule:** the current step and previously reached steps are clickable; future steps remain disabled until they become current through normal progression
- **Structured location rule:** the wizard stores individual address fields and derives the legacy `projectLocation` compatibility string for the current provisioning/live-client path
- **Department & Type rule:** `department` remains the canonical two-value downstream field (`commercial` / `luxury-residential`), while `officeDivision` is a separate business selection and Project Type uses a searchable combobox with department-specific selectable values plus non-selectable category headers

## Draft Persistence

| Mode | Draft Key | TTL | Resume Decision |
|---|---|---|---|
| `new-request` | `project-setup-form-draft` | 48 hours | `prompt-user` if draft exists and is within TTL |
| `clarification-return` | `project-setup-clarification-{requestId}` | 168 hours (7 days) | `auto-continue` |

### Resume Decision Matrix

| Decision | Behavior |
|---|---|
| `prompt-user` | Show ResumeBanner with "Resume Draft" / "Start New" actions |
| `auto-continue` | Silently load draft fields into form state |
| `fresh-start` | Initialize with empty defaults |

## Clarification-Return Flow

1. Reviewer sets request state to `NeedsClarification` with `clarificationNote`
2. `RequestDetailPage` renders `ClarificationBanner` with link to `/project-setup/new?mode=clarification-return&requestId={id}`
3. `NewRequestPage` fetches existing request, pre-populates wizard
4. `buildClarificationReturnState()` resolves flagged step IDs (scaffolded — backend may not populate `clarificationItems` yet)
5. On resubmission, draft is cleared and user navigates to detail page

## BIC Ownership Display

- Uses `useBicNextMove` with `PROJECT_SETUP_BIC_CONFIG` from `@hbc/provisioning`
- Displays: current owner, expected action, urgency tier
- Composed from `HbcCard` + `HbcStatusBadge` + `HbcTypography` (future `HbcBicBadge`)

## Complexity Gating

- Extended details (team members, add-ons, blocked reason) gated behind `HbcComplexityGate minTier="standard"`
- Essential tier sees: core summary, status badge, state context, clarification banner, provisioning checklist

## Review-Mode Runtime Rules

- `ui-review` does not create the live provisioning API client.
- `ui-review` does not resolve or use `/api/provisioning-negotiate`.
- `ui-review` does not enable SignalR live progress or the 30-second polling fallback.
- When `allowBackendModeSwitch` is disabled, the app ignores any persisted mode override and follows injected/env/default runtime mode exactly.
- Empty, loading, and success states remain intact; backend/config failure shells are replaced by the seeded local sample-data path.

## State Badge Mapping

| State | StatusVariant |
|---|---|
| Submitted | `pending` |
| UnderReview | `inProgress` |
| NeedsClarification | `warning` |
| AwaitingExternalSetup | `pending` |
| ReadyToProvision | `pending` |
| Provisioning | `inProgress` |
| Completed | `completed` |
| Failed | `error` |
